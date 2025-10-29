const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, UserPaymentMethod, Report, UserReport } = require('../models');
const axios = require('axios');
const PDFGenerator = require('../services/pdfGenerator');

// Middleware to check if user is authenticated
const authenticateSession = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            error: 'UNAUTHORIZED',
            message: 'Please log in to continue' 
        });
    }
    next();
};

// Function to check if report data exists and is within 7 days
async function checkReportCache(abn, type) {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        console.log(`🔍 CACHE CHECK DETAILS:`);
        console.log(`   Looking for ABN: "${abn}"`);
        console.log(`   Looking for Type: "${type}"`);
        console.log(`   Seven days ago: ${sevenDaysAgo.toISOString()}`);
        
        // First, let's see ALL reports for this ABN
        const allReportsForABN = await Report.findAll({
            where: {
                abn: abn
            },
            order: [['created_at', 'DESC']]
        });
        
        console.log(`   Found ${allReportsForABN.length} total reports for ABN ${abn}:`);
        allReportsForABN.forEach((report, index) => {
            console.log(`     ${index + 1}. Report ID: ${report.id}, Type: ${report.type}, ASIC: ${report.asicType}, Created: ${report.created_at}`);
        });
        
        // Parse the type to get granular fields
        const parsedType = parseReportType(type);
        
        // Build where clause for granular type matching
        const whereClause = {
            abn: abn,
            created_at: {
                [require('sequelize').Op.gte]: sevenDaysAgo
            }
        };
        
        // Match based on parsed type fields
        if (parsedType.type) {
            whereClause.type = parsedType.type;
        }
        if (parsedType.asicType) {
            whereClause.asicType = parsedType.asicType;
        }
        
        const existingReport = await Report.findOne({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });
        
        if (existingReport) {
            console.log(`✅ CACHE HIT: Found cached report for ABN ${abn} (${type}) from ${existingReport.created_at}`);
            console.log(`   Report ID: ${existingReport.reportId}, UUID: ${existingReport.uuid}`);
            return {
                exists: true,
                report: existingReport,
                isRecent: true
            };
        }
        
        console.log(`❌ CACHE MISS: No cached report found for ABN ${abn} (${type})`);
        return {
            exists: false,
            report: null,
            isRecent: false
        };
    } catch (error) {
        console.error('Error checking report cache:', error);
        return {
            exists: false,
            report: null,
            isRecent: false
        };
    }
}

// Function to fetch report data via GET API
async function fetchReportData(uuid, bearerToken) {
    try {
        const getApiUrl = `https://alares.com.au/api/reports/${uuid}/json`;
        
        console.log('Fetching report data from:', getApiUrl);
        
        const response = await axios.get(getApiUrl, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });
        
        console.log('Report data fetched successfully');
        return response.data;
        
    } catch (error) {
        console.error('Error fetching report data:', error);
        
        if (error.response) {
            throw new Error(`Report data fetch error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Report data fetch failed - no response received');
        } else {
            throw new Error(`Report data fetch failed: ${error.message}`);
        }
    }
}

// Function to fetch PPSR data from database for report generation
async function fetchPPSRDataFromDB(reportId) {
    const { sequelize } = require('../config/db');
    
    try {
        console.log('🔍 Fetching PPSR data from database for report ID:', reportId);
        
        // Get the PPSR search data
        const [searchResults] = await sequelize.query(`
            SELECT * FROM ppsr_searches WHERE report_id = $1
        `, {
            bind: [reportId]
        });
        
        if (searchResults.length === 0) {
            console.log('⚠️ No PPSR search data found for report ID:', reportId);
            return null;
        }
        
        const ppsrSearch = searchResults[0];
        const ppsrSearchId = ppsrSearch.id;
        
        // Get grantors
        const [grantorResults] = await sequelize.query(`
            SELECT * FROM ppsr_grantors WHERE ppsr_search_id = $1
        `, {
            bind: [ppsrSearchId]
        });
        
        // Get security interests
        const [securityInterestResults] = await sequelize.query(`
            SELECT * FROM ppsr_security_interests WHERE ppsr_search_id = $1
        `, {
            bind: [ppsrSearchId]
        });
        
        
        // Get events
        const [eventResults] = await sequelize.query(`
            SELECT * FROM ppsr_events WHERE ppsr_search_id = $1
        `, {
            bind: [ppsrSearchId]
        });
        
        const ppsrData = {
            search: ppsrSearch,
            grantors: grantorResults,
            securityInterests: securityInterestResults,
            financingStatements: financingStatementResults,
            amendments: amendmentResults,
            events: eventResults,
            rawData: rawDataResults
        };
        
        console.log('✅ PPSR data fetched successfully:', {
            grantors: grantorResults.length,
            securityInterests: securityInterestResults.length,
            financingStatements: financingStatementResults.length,
            amendments: amendmentResults.length,
            events: eventResults.length
        });
        
        return ppsrData;
        
    } catch (error) {
        console.error('❌ Error fetching PPSR data from database:', error);
        throw error;
    }
}

// Function to parse and store PPSR structured data
async function parsePPSRStructuredData(ppsrSearchId, reportData) {
    const { sequelize } = require('../config/db');
    
    try {
        console.log('🔍 PPSR STRUCTURED DATA: Parsing PPSR response data');
        
        // Parse items array if it exists (new format)
        if (reportData.resource && reportData.resource.items && Array.isArray(reportData.resource.items)) {
            console.log(`📊 Processing ${reportData.resource.items.length} PPSR items...`);
            
            for (const item of reportData.resource.items) {
                console.log('   Processing PPSR item:', item.registrationNumber || 'Unknown');
                
                // Store grantors
                if (item.grantors && Array.isArray(item.grantors)) {
                    for (const grantor of item.grantors) {
                        await sequelize.query(`
                            INSERT INTO ppsr_grantors (
                                ppsr_search_id, grantor_type, organisation_number_type, organisation_number, created_at
                            ) VALUES ($1, $2, $3, $4, NOW())
                        `, {
                            bind: [
                                ppsrSearchId,
                                grantor.grantorType || null,
                                grantor.organisationNumberType || null,
                                grantor.organisationNumber || null,
                            ]
                        });
                    }
                }
                
                // Store security interests (each item is a security interest)
                if (item.registrationNumber) {
                    // Get secured party info
                    const securedParty = item.securedParties && item.securedParties.length > 0 ? item.securedParties[0] : null;
                    const addressForService = item.addressForService || null;
                    
                    await sequelize.query(`
                        INSERT INTO ppsr_security_interests (
                            ppsr_search_id, registration_number, registration_date, expiry_date, status,
                            collateral_type, collateral_description, secured_party_name, secured_party_organisation_number,
                            secured_party_address_line1, secured_party_address_line2, secured_party_suburb,
                            secured_party_state, secured_party_postcode, secured_party_country,
                            priority_amount, priority_currency, created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
                    `, {
                        bind: [
                            ppsrSearchId,
                            item.registrationNumber || null,
                            item.registrationStartTime || null,
                            item.registrationEndTime || null,
                            'active', // status - assume active if not specified
                            item.collateralType || null,
                            item.collateralDescription || item.collateralSummary || null,
                            securedParty?.organisationName || null,
                            securedParty?.organisationNumber || null,
                            addressForService?.mailingAddress?.line1 || null,
                            addressForService?.mailingAddress?.line2 || null,
                            addressForService?.mailingAddress?.locality || null,
                            addressForService?.mailingAddress?.state || null,
                            addressForService?.mailingAddress?.postcode || null,
                            addressForService?.mailingAddress?.countryName || null,
                            null, // priority_amount - not in this format
                            'AUD' // priority_currency - default to AUD
                        ]
                    });
                }
            }
        }
        
        // Also handle the old format for backward compatibility
        else if (reportData.results && Array.isArray(reportData.results)) {
            console.log(`📊 Processing ${reportData.results.length} PPSR results (legacy format)...`);
            
            for (const result of reportData.results) {
                console.log('   Processing PPSR result:', result.registrationNumber || 'Unknown');
                
                // Store grantors
                if (result.grantors && Array.isArray(result.grantors)) {
                    for (const grantor of result.grantors) {
                        await sequelize.query(`
                            INSERT INTO ppsr_grantors (
                                ppsr_search_id, grantor_type, organisation_number_type, organisation_number,
                                individual_name, individual_date_of_birth, individual_place_of_birth, individual_gender,
                                address_line1, address_line2, suburb, state, postcode, country, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                        `, {
                            bind: [
                                ppsrSearchId,
                                grantor.grantorType || null,
                                grantor.organisationNumberType || null,
                                grantor.organisationNumber || null,
                                grantor.individualName || null,
                                grantor.individualDateOfBirth || null,
                                grantor.individualPlaceOfBirth || null,
                                grantor.individualGender || null,
                                grantor.address?.addressLine1 || null,
                                grantor.address?.addressLine2 || null,
                                grantor.address?.suburb || null,
                                grantor.address?.state || null,
                                grantor.address?.postcode || null,
                                grantor.address?.country || null
                            ]
                        });
                    }
                }
                
                // Store security interests
                if (result.securityInterests && Array.isArray(result.securityInterests)) {
                    for (const securityInterest of result.securityInterests) {
                        await sequelize.query(`
                            INSERT INTO ppsr_security_interests (
                                ppsr_search_id, registration_number, registration_date, expiry_date, status,
                                collateral_type, collateral_description, secured_party_name, secured_party_organisation_number,
                                secured_party_address_line1, secured_party_address_line2, secured_party_suburb,
                                secured_party_state, secured_party_postcode, secured_party_country,
                                priority_amount, priority_currency, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
                        `, {
                            bind: [
                                ppsrSearchId,
                                securityInterest.registrationNumber || null,
                                securityInterest.registrationDate || null,
                                securityInterest.expiryDate || null,
                                securityInterest.status || null,
                                securityInterest.collateralType || null,
                                securityInterest.collateralDescription || null,
                                securityInterest.securedParty?.name || null,
                                securityInterest.securedParty?.organisationNumber || null,
                                securityInterest.securedParty?.address?.addressLine1 || null,
                                securityInterest.securedParty?.address?.addressLine2 || null,
                                securityInterest.securedParty?.address?.suburb || null,
                                securityInterest.securedParty?.address?.state || null,
                                securityInterest.securedParty?.address?.postcode || null,
                                securityInterest.securedParty?.address?.country || null,
                                securityInterest.priorityAmount || null,
                                securityInterest.priorityCurrency || null
                            ]
                        });
                    }
                }
            }
        }
        
        console.log('✅ PPSR structured data parsed and stored successfully');
        
    } catch (error) {
        console.error('❌ Error parsing PPSR structured data:', error);
        throw error;
    }
}

// Function to parse and store report data in normalized tables
async function parseAndStoreReportData(reportId, reportData) {
    const { sequelize } = require('../config/db');
    
    try {
        console.log('🚀 NEW CODE VERSION - Parsing and storing report data for report ID:', reportId);
        
        // Handle PPSR data differently
        if (reportData && (reportData.auSearchIdentifier || reportData.results)) {
            console.log('🔍 PPSR DATA: Processing PPSR report data');
            
            // Store main PPSR search data
            const [ppsrSearchResult] = await sequelize.query(`
                INSERT INTO ppsr_searches (
                    report_id, searchdata, created_at
                ) VALUES ($1, $2, $3, NOW())
                ON CONFLICT (report_id) DO UPDATE SET
                    searchdata = EXCLUDED.searchdata,
                    created_at =  NOW()
                RETURNING id
            `, {
                bind: [
                    reportId,
                    JSON.stringify(reportData.criteria || [])
                ]
            });
            
            const ppsrSearchId = ppsrSearchResult[0].id;
            console.log('✅ PPSR search data stored with ID:', ppsrSearchId);
            
            
            // Parse and store structured data
            await parsePPSRStructuredData(ppsrSearchId, reportData);
            
            console.log('✅ PPSR data stored successfully');
            return; // Exit early for PPSR data
        }
        
        // Check if ASIC extract data already exists for this report to prevent duplicates
        const [existingAsicExtract] = await sequelize.query(`
            SELECT asic_extract_id FROM asic_extracts WHERE report_id = $1 LIMIT 1
        `, {
            bind: [reportId]
        });
        
        if (existingAsicExtract.length > 0) {
            console.log('⚠️ ASIC extract data already exists for report ID:', reportId, '- skipping duplicate processing');
            return;
        }
        console.log('🔍 REPORT DATA STRUCTURE ANALYSIS:');
        console.log('   Keys in reportData:', Object.keys(reportData));
        console.log('   asic_extracts exists:', !!reportData.asic_extracts);
        console.log('   asic_extracts type:', typeof reportData.asic_extracts);
        console.log('   asic_extracts is array:', Array.isArray(reportData.asic_extracts));
        console.log('   asic_extracts length:', reportData.asic_extracts?.length || 0);
        
        if (reportData.asic_extracts) {
            console.log('   asic_extracts sample:', JSON.stringify(reportData.asic_extracts[0], null, 2));
        }
        
        // Log the complete data structure for debugging
        console.log('🔍 COMPLETE REPORT DATA:', JSON.stringify(reportData, null, 2));
        
        // 1. Store Entity data
        if (reportData.entity) {
            const entityData = reportData.entity;
            console.log('📝 Storing entity data for report ID:', reportId);
            await sequelize.query(`
                INSERT INTO entities (
                    report_id, abn, acn, is_arbn, abr_gst_registration_date, 
                    abr_gst_status, abr_postcode, abr_state, abr_status, 
                    asic_date_of_registration, asic_status, document_number, 
                    former_names, name, reference, review_date, name_start_at, 
                    registered_in, organisation_type, disclosing_entity, 
                    organisation_class, organisation_sub_class
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
                )
            `, {
                bind: [
                    reportId,
                    entityData.abn || null,
                    entityData.acn || null,
                    entityData.is_arbn || null,
                    entityData.abr_gst_registration_date || null,
                    entityData.abr_gst_status || null,
                    entityData.abr_postcode || null,
                    entityData.abr_state || null,
                    entityData.abr_status || null,
                    entityData.asic_date_of_registration || null,
                    entityData.asic_status || null,
                    entityData.document_number || null,
                    JSON.stringify(entityData.former_names || []),
                    entityData.name || null,
                    entityData.reference || null,
                    entityData.review_date || null,
                    entityData.name_start_at || null,
                    entityData.registered_in || null,
                    entityData.organisation_type || null,
                    entityData.disclosing_entity || null,
                    entityData.organisation_class || null,
                    entityData.organisation_sub_class || null
                ]
            });
            console.log('✅ Entity data stored');
        }
        
        // 2. Store ASIC Extract data
        console.log('🔍 DEBUG: Checking asic_extracts data...');
        console.log('   asic_extracts exists:', !!reportData.asic_extracts);
        console.log('   asic_extracts is array:', Array.isArray(reportData.asic_extracts));
        console.log('   asic_extracts length:', reportData.asic_extracts?.length || 0);
        console.log('   asic_extracts value:', reportData.asic_extracts);
        
        if (reportData.asic_extracts) {
            console.log('   asic_extracts sample:', JSON.stringify(reportData.asic_extracts[0], null, 2));
        }
        
        if (reportData.asic_extracts && Array.isArray(reportData.asic_extracts) && reportData.asic_extracts.length > 0) {
            console.log('📊 Processing', reportData.asic_extracts.length, 'ASIC extracts...');
            
            for (const asicExtract of reportData.asic_extracts) {
                console.log('   Processing ASIC extract ID:', asicExtract.id);
                console.log('   ASIC extract keys:', Object.keys(asicExtract));
                
                                try {
                                    const [asicResult] = await sequelize.query(`
                                        INSERT INTO asic_extracts (report_id, external_id) 
                                        VALUES ($1, $2) 
                                        RETURNING asic_extract_id
                                    `, {
                                        bind: [reportId, asicExtract.id || null]
                                    });
                                    const asicExtractId = asicResult[0].asic_extract_id;
                                    console.log('✅ ASIC Extract stored with ID:', asicExtractId);
                    
                    // 3. Store Addresses
                    if (asicExtract.addresses && Array.isArray(asicExtract.addresses)) {
                        console.log('   Storing', asicExtract.addresses.length, 'addresses...');
                        for (const address of asicExtract.addresses) {
                            await sequelize.query(`
                                INSERT INTO addresses (
                                    asic_extract_id, type, entity, address, care_of, address_1, 
                                    address_2, suburb, state, postcode, country, status, 
                                    start_date, end_date, document_number, address_category
                                ) VALUES (
                                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                                )
                            `, {
                                bind: [
                                    asicExtractId,
                                    address.type || null,
                                    address.entity || null,
                                    address.address || null,
                                    address.care_of || null,
                                    address.address_1 || null,
                                    address.address_2 || null,
                                    address.suburb || null,
                                    address.state || null,
                                    address.postcode || null,
                                    address.country || null,
                                    address.status || null,
                                    address.start_date || null,
                                    address.end_date || null,
                                    address.document_number || null,
                                    'company'
                                ]
                            });
                        }
                        console.log('✅ Addresses stored');
                    }
                    
                    // 3b. Store Contact Addresses
                    if (asicExtract.contact_addresses && Array.isArray(asicExtract.contact_addresses)) {
                        console.log('   Storing', asicExtract.contact_addresses.length, 'contact addresses...');
                        for (const contactAddress of asicExtract.contact_addresses) {
                            await sequelize.query(`
                                INSERT INTO addresses (
                                    asic_extract_id, type, entity, address, care_of, address_1, 
                                    address_2, suburb, state, postcode, country, status, 
                                    start_date, end_date, document_number, address_category
                                ) VALUES (
                                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                                )
                            `, {
                                bind: [
                                    asicExtractId,
                                    contactAddress.type || null,
                                    contactAddress.entity || null,
                                    contactAddress.address || null,
                                    contactAddress.care_of || null,
                                    contactAddress.address_1 || null,
                                    contactAddress.address_2 || null,
                                    contactAddress.suburb || null,
                                    contactAddress.state || null,
                                    contactAddress.postcode || null,
                                    contactAddress.country || null,
                                    contactAddress.status || null,
                                    contactAddress.start_date || null,
                                    contactAddress.end_date || null,
                                    contactAddress.document_number || null,
                                    'contact'
                                ]
                            });
                        }
                        console.log('✅ Contact Addresses stored');
                    }
                    
                    // 4. Store Directors
                    if (asicExtract.directors && Array.isArray(asicExtract.directors)) {
                        console.log('   Storing', asicExtract.directors.length, 'directors...');
                        for (const director of asicExtract.directors) {
                            await sequelize.query(`
                                INSERT INTO directors (
                                    asic_extract_id, type, name, dob, place_of_birth, 
                                    director_id_external, document_number, start_date, 
                                    end_date, status, address_data
                                ) VALUES (
                                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
                                )
                            `, {
                                bind: [
                                    asicExtractId,
                                    director.type || null,
                                    director.name || null,
                                    director.dob || null,
                                    director.place_of_birth || null,
                                    director.director_id || null,
                                    director.document_number || null,
                                    director.start_date || null,
                                    director.end_date || null,
                                    director.status || null,
                                    director.address ? JSON.stringify(director.address) : null
                                ]
                            });
                            
                            // Store Director Address in addresses table
                            if (director.address) {
                                await sequelize.query(`
                                    INSERT INTO addresses (
                                        asic_extract_id, type, entity, address, care_of, address_1, 
                                        address_2, suburb, state, postcode, country, status, 
                                        start_date, end_date, document_number, address_category
                                    ) VALUES (
                                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                                    )
                                `, {
                                    bind: [
                                        asicExtractId,
                                        director.address.type || 'Director Address',
                                        director.address.entity || 'Director',
                                        director.address.address || null,
                                        director.address.care_of || null,
                                        director.address.address_1 || null,
                                        director.address.address_2 || null,
                                        director.address.suburb || null,
                                        director.address.state || null,
                                        director.address.postcode || null,
                                        director.address.country || null,
                                        director.status || null,
                                        director.start_date || null,
                                        director.end_date || null,
                                        director.document_number || null,
                                        'director'
                                    ]
                                });
                            }
                        }
                        console.log('✅ Directors stored');
                    }
                    
                    // 5. Store Shareholders
                    if (asicExtract.shareholders && Array.isArray(asicExtract.shareholders)) {
                        console.log('   Storing', asicExtract.shareholders.length, 'shareholders...');
                        for (const shareholder of asicExtract.shareholders) {
                            await sequelize.query(`
                                INSERT INTO shareholders (
                                    asic_extract_id, name, acn, class, number_held, 
                                    percentage_held, document_number, beneficially_owned, 
                                    fully_paid, jointly_held, status, address_data
                                ) VALUES (
                                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                                )
                            `, {
                                bind: [
                                    asicExtractId,
                                    shareholder.name || null,
                                    shareholder.acn || null,
                                    shareholder.class || null,
                                    shareholder.number_held || null,
                                    shareholder.percentage_held || null,
                                    shareholder.document_number || null,
                                    shareholder.beneficially_owned || null,
                                    shareholder.fully_paid || null,
                                    shareholder.jointly_held || null,
                                    shareholder.status || null,
                                    shareholder.address ? JSON.stringify(shareholder.address) : null
                                ]
                            });
                            
                            // Store Shareholder Address in addresses table
                            if (shareholder.address) {
                                await sequelize.query(`
                                    INSERT INTO addresses (
                                        asic_extract_id, type, entity, address, care_of, address_1, 
                                        address_2, suburb, state, postcode, country, status, 
                                        start_date, end_date, document_number, address_category
                                    ) VALUES (
                                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                                    )
                                `, {
                                    bind: [
                                        asicExtractId,
                                        shareholder.address.type || 'Shareholder Address',
                                        shareholder.address.entity || 'Shareholder',
                                        shareholder.address.address || null,
                                        shareholder.address.care_of || null,
                                        shareholder.address.address_1 || null,
                                        shareholder.address.address_2 || null,
                                        shareholder.address.suburb || null,
                                        shareholder.address.state || null,
                                        shareholder.address.postcode || null,
                                        shareholder.address.country || null,
                                        shareholder.status || null,
                                        shareholder.start_date || null,
                                        shareholder.end_date || null,
                                        shareholder.document_number || null,
                                        'shareholder'
                                    ]
                                });
                            }
                        }
                        console.log('✅ Shareholders stored');
                    }
                    
                    // 6. Store Secretaries
                    if (asicExtract.secretaries && Array.isArray(asicExtract.secretaries)) {
                        console.log('   Storing', asicExtract.secretaries.length, 'secretaries...');
                        for (const secretary of asicExtract.secretaries) {
                            await sequelize.query(`
                                INSERT INTO secretaries (
                                    asic_extract_id, type, name, dob, place_of_birth, 
                                    secretary_id_external, document_number, start_date, 
                                    end_date, status, address_data
                                ) VALUES (
                                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
                                )
                            `, {
                                bind: [
                                    asicExtractId,
                                    secretary.type || null,
                                    secretary.name || null,
                                    secretary.dob || null,
                                    secretary.place_of_birth || null,
                                    secretary.director_id || null,
                                    secretary.document_number || null,
                                    secretary.start_date || null,
                                    secretary.end_date || null,
                                    secretary.status || null,
                                    secretary.address ? JSON.stringify(secretary.address) : null
                                ]
                            });
                            
                            // Store Secretary Address in addresses table
                            if (secretary.address) {
                                await sequelize.query(`
                                    INSERT INTO addresses (
                                        asic_extract_id, type, entity, address, care_of, address_1, 
                                        address_2, suburb, state, postcode, country, status, 
                                        start_date, end_date, document_number, address_category
                                    ) VALUES (
                                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                                    )
                                `, {
                                    bind: [
                                        asicExtractId,
                                        secretary.address.type || 'Secretary Address',
                                        secretary.address.entity || 'Secretary',
                                        secretary.address.address || null,
                                        secretary.address.care_of || null,
                                        secretary.address.address_1 || null,
                                        secretary.address.address_2 || null,
                                        secretary.address.suburb || null,
                                        secretary.address.state || null,
                                        secretary.address.postcode || null,
                                        secretary.address.country || null,
                                        secretary.status || null,
                                        secretary.start_date || null,
                                        secretary.end_date || null,
                                        secretary.document_number || null,
                                        'secretary'
                                    ]
                                });
                            }
                        }
                        console.log('✅ Secretaries stored');
                    }
                    
                    // 7. Store Share Structures
                    if (asicExtract.share_structures && Array.isArray(asicExtract.share_structures)) {
                        console.log('   Storing', asicExtract.share_structures.length, 'share structures...');
                        for (const shareStructure of asicExtract.share_structures) {
                            await sequelize.query(`
                                INSERT INTO share_structures (
                                    asic_extract_id, class_code, class_description, status, 
                                    share_count, amount_paid, amount_due, document_number
                                ) VALUES (
                                    $1, $2, $3, $4, $5, $6, $7, $8
                                )
                            `, {
                                bind: [
                                    asicExtractId,
                                    shareStructure.class_code || null,
                                    shareStructure.class_description || null,
                                    shareStructure.status || null,
                                    shareStructure.share_count || null,
                                    shareStructure.amount_paid || null,
                                    shareStructure.amount_due || null,
                                    shareStructure.document_number || null
                                ]
                            });
                        }
                        console.log('✅ Share Structures stored');
                    }
                    
                    // 8. Store Documents
                    if (asicExtract.documents && Array.isArray(asicExtract.documents)) {
                        console.log('   Storing', asicExtract.documents.length, 'documents...');
                        for (const document of asicExtract.documents) {
                            await sequelize.query(`
                                INSERT INTO documents (
                                    asic_extract_id, type, description, document_number, 
                                    form_code, page_count, effective_at, processed_at, received_at
                                ) VALUES (
                                    $1, $2, $3, $4, $5, $6, $7, $8, $9
                                )
                            `, {
                                bind: [
                                    asicExtractId,
                                    document.type || null,
                                    document.description || null,
                                    document.document_number || null,
                                    document.form_code || null,
                                    document.page_count || null,
                                    document.effective_at || null,
                                    document.processed_at || null,
                                    document.received_at || null
                                ]
                            });
                        }
                        console.log('✅ Documents stored');
                    }
                    
                } catch (asicExtractError) {
                    console.error('⚠️ Error processing individual ASIC extract:', asicExtractError.message);
                    console.error('   ASIC extract data:', JSON.stringify(asicExtract, null, 2));
                    // Continue with next ASIC extract
                }
            }
        } else {
            console.log('⚠️ No ASIC extracts data found or data is not an array');
        }
        
        // 8. Store Cases
        if (reportData.cases && typeof reportData.cases === 'object') {
            console.log('📊 Processing cases data...');
            for (const [caseId, caseData] of Object.entries(reportData.cases)) {
                try {
                    await sequelize.query(`
                        INSERT INTO cases (
                            report_id, type, notification_time, court_name, 
                            state, court_type, case_type, case_number, jurisdiction, 
                            suburb, next_hearing_date, case_name, total_parties, 
                            total_documents, total_hearings, internal_reference, 
                            name, other_names, insolvency_risk_factor, match_on
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
                        )
                    `, {
                        bind: [
                            reportId,
                            caseData.type || null,
                            caseData.notification_time || null,
                            caseData.court_name || null,
                            caseData.state || null,
                            caseData.court_type || null,
                            caseData.case_type || null,
                            caseData.case_number || null,
                            caseData.jurisdiction || null,
                            caseData.suburb || null,
                            caseData.next_hearing_date || null,
                            caseData.case_name || null,
                            caseData.total_parties || null,
                            caseData.total_documents || null,
                            caseData.total_hearings || null,
                            caseData.internal_reference || null,
                            caseData.name || null,
                            caseData.other_names || null,
                            caseData.insolvency_risk_factor || null,
                            caseData.match_on || null
                        ]
                    });
                } catch (caseError) {
                    console.error('⚠️ Error storing case:', caseError.message);
                }
            }
            console.log('✅ Cases stored');
        } else {
            console.log('⚠️ No cases data found');
        }
        
        // 9. Store Insolvencies
        if (reportData.insolvencies && typeof reportData.insolvencies === 'object') {
            console.log('📊 Processing insolvencies data...');
            for (const [insolvencyId, insolvencyData] of Object.entries(reportData.insolvencies)) {
                try {
                    await sequelize.query(`
                        INSERT INTO insolvencies (
                            report_id, uuid, type, notification_time, court_name, case_type, 
                            case_number, asic_notice_id, case_name, total_parties, 
                            internal_reference, name, other_names, insolvency_risk_factor, match_on
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                        )
                    `, {
                        bind: [
                            reportId,
                            insolvencyData.uuid || null,
                            insolvencyData.type || null,
                            insolvencyData.notification_time || null,
                            insolvencyData.court_name || null,
                            insolvencyData.case_type || null,
                            insolvencyData.case_number || null,
                            insolvencyData.asic_notice_id || null,
                            insolvencyData.case_name || null,
                            insolvencyData.total_parties || null,
                            insolvencyData.internal_reference || null,
                            insolvencyData.name || null,
                            insolvencyData.other_names || null,
                            insolvencyData.insolvency_risk_factor || null,
                            insolvencyData.match_on || null
                        ]
                    });
                } catch (insolvencyError) {
                    console.error('⚠️ Error storing insolvency:', insolvencyError.message);
                }
            }
            console.log('✅ Insolvencies stored');
        } else {
            console.log('⚠️ No insolvencies data found');
        }
        
        // 10. Store Tax Debts
        if (reportData.current_tax_debt) {
            console.log('📊 Processing current tax debt data...');
            try {
                await sequelize.query(`
                    INSERT INTO tax_debts (
                        report_id, date, amount, status, ato_added_at, ato_updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6
                    )
                `, {
                    bind: [
                        reportId,
                        reportData.current_tax_debt.date || null,
                        reportData.current_tax_debt.amount || null,
                        reportData.current_tax_debt.status || null,
                        reportData.current_tax_debt.ato_added_at || null,
                        reportData.current_tax_debt.ato_updated_at || null
                    ]
                });
                console.log('✅ Current tax debt stored');
            } catch (taxDebtError) {
                console.error('⚠️ Error storing current tax debt:', taxDebtError.message);
            }
        } else {
            console.log('⚠️ No current tax debt data found');
        }
        
        console.log('🎉 All report data parsed and stored successfully!');
        
    } catch (error) {
        console.error('❌ Error parsing and storing report data:', error);
        throw error;
    }
}

// Helper function to parse report type into granular fields
function parseReportType(type) {
    const result = {
        type: null,
        asicType: null
    };
    
    // Parse main type according to user requirements
    if (type.includes('asic')) {
        result.type = 'ASIC';
        // Map ASIC types correctly based on the actual selection
        if (type.includes('historical')) {
            result.asicType = 'Historical';
        } else if (type.includes('current')) {
            result.asicType = 'Current';
        } else if (type.includes('company')) {
            result.asicType = 'Current'; // Company maps to Current as per existing logic
        } else if (type.includes('personal')) {
            result.asicType = 'Personal';
        } else if (type.includes('document')) {
            result.asicType = 'Document Search';
        } else {
            result.asicType = 'Current'; // Default for ASIC
        }
    } else if (type.includes('court')) {
        result.type = 'COURT';
        result.asicType = 'Current'; // COURT maps to asic-current as per user requirement
    } else if (type.includes('ato')) {
        result.type = 'ATO';
        result.asicType = 'Current'; // ATO maps to asic-current as per user requirement
    } else if (type.includes('land')) {
        result.type = 'LAND TITLE';
    } else if (type.includes('ppsr')) {
        result.type = 'PPSR';
    } else if (type.includes('property')) {
        result.type = 'PROPERTY';
    } else if (type.includes('director')) {
        if (type.includes('ppsr')) {
            result.type = 'DIRECTOR PPSR';
        } else if (type.includes('bankruptcy')) {
            result.type = 'DIRECTOR BANKRUPTCY';
        } else if (type.includes('property')) {
            result.type = 'DIRECTOR PROPERTY';
        } else if (type.includes('related')) {
            result.type = 'DIRECTOR RELATED';
        }
    } else {
        // If no specific pattern matches, use the type as-is (uppercase)
        result.type = type.toUpperCase();
    }
    
    return result;
}

// Function to call PPSR API (Two-step process)
async function callPPSRAPI(abn, businessName) {
    try {
        const ppsrToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkY2NThCODUzNDlCODc3MTVGOUM1QjI1ODgzNDcwNTVERjM5NTk1QjlSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6IjlsaTRVMG00ZHhYNXhiSllnMGNGWGZPVmxiayJ9.eyJuYmYiOjE3NjE3MjA0MjIsImV4cCI6MTc2MTcyMjIyMiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo2MjE5NyIsImF1ZCI6ImludGVncmF0aW9uLWFwaSIsImNsaWVudF9pZCI6ImZsZXhjb2xsZWN0LWFwaS1pbnRlZ3JhdGlvbiIsImlkIjoiMTAyNzkiLCJuYW1lIjoiZmxleGNvbGxlY3QtYXBpLWludGVncmF0aW9uIiwic3ViIjoiZThiMjEwMDYtYzgxYy00YWE4LThhMDYtYWFjMzZjNzY5ODE0Iiwibmlja25hbWUiOiJGbGV4Y29sbGVjdCBJTlRFR1JBVElPTiIsInV1aWQiOiJlOGIyMTAwNi1jODFjLTRhYTgtOGEwNi1hYWMzNmM3Njk4MTQiLCJqdGkiOiI4NzE4QjUwQTkwNjBBOTBCQTI2RTc2Rjg3RDczQ0IyMCIsImlhdCI6MTc2MTcyMDQyMiwic2NvcGUiOlsidXNlcmFjY2VzcyIsImludGVncmF0aW9uYWNjZXNzIl19.MKykx9Tz4l41exoq6M8KQwifG10nRDDjzjU7BjVK9qL8KZexLdZdGcPBAjn2VDmfgTaQDPAUiBv-qYgtJYDFWNPTwC6F7I2jUCR6oGStRt5VKDl6fxPf4wC-CRkxhQ9DI7pP_OFYNL9c4Om9BhcwIIVcaLYsFWT5JXc6ZRoc3lFXsU2Kgyui9x5Lxbh1A_3bhU--xLo5EjGBh2w_pLoVKdwOzohAml0HUb8wdqGMlBEE8XrBrh9ELTH4OA-g6qaFdx-Ws1PdJDsB22y74C0zwlvfSBC-9lZs7kZlr-ab5LuGYshb4HpbRrjLYP6t41euoUD-yQ3PvpWOqg_muquJ_A';
        
        // Remove first 2 characters from ABN to get ACN
        const acn = abn.substring(2);
        console.log(acn)
        // Step 1: Submit search request
        const submitUrl = 'https://uat-gateway.ppsrcloud.com/api/b2b/ausearch/submit-grantor-session-cmd';
        const requestData = {
            customerRequestId: `flexcollect-001`,
            clientReference: "Credion Company Search",
            pointInTime: null,
            criteria: [
                {
                    grantorType: "organisation",
                    organisationNumberType: "acn",
                    organisationNumber: "146939013"
                }
            ]
        };

        console.log('🔍 PPSR STEP 1 - Submit Search:');
        console.log('   Original ABN:', abn);
        console.log('   ACN (ABN - first 2 chars):', acn);
        console.log('   Business Name:', businessName);
        console.log('   Request Data:', JSON.stringify(requestData, null, 2));

        // Step 1: Submit the search request
        const submitResponse = await axios.post(submitUrl, requestData, {
            headers: {
                'Authorization': `Bearer ${ppsrToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        console.log('✅ PPSR Submit Response:', submitResponse.data);
        
        // Extract auSearchIdentifier from the response
        // The response contains ppsrCloudId which should be used as auSearchIdentifier
        const auSearchIdentifier = submitResponse.data.resource?.ppsrCloudId || submitResponse.data.auSearchIdentifier;
        
        if (!auSearchIdentifier) {
            throw new Error('No auSearchIdentifier (ppsrCloudId) returned from PPSR submit request');
        }
        
        console.log('🔍 PPSR STEP 2 - Fetch Data:');
        console.log('   auSearchIdentifier:', auSearchIdentifier);
        
        // Step 2: Fetch actual data using the auSearchIdentifier
        const fetchUrl = 'https://uat-gateway.ppsrcloud.com/api/b2b/ausearch/result-details';
        const fetchData = {
            auSearchIdentifier: auSearchIdentifier,
            pageNumber: 1,
            pageSize: 50
        };

        console.log('   Fetch Data:', JSON.stringify(fetchData, null, 2));

        const response = await axios.post(fetchUrl, fetchData, {
            headers: {
                'Authorization': `Bearer ${ppsrToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        console.log('✅ PPSR API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ PPSR API Error:', error);
        if (error.response) {
            throw new Error(`PPSR API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('PPSR API request failed - no response received');
        } else {
            throw new Error(`PPSR API call failed: ${error.message}`);
        }
    }
}

// Function to create report via external API
async function createReport({ business, type, userId, paymentIntentId, matterId }) {
    try {
        const apiUrl = 'https://alares.com.au/api/reports/create';
        const bearerToken = 'pIIDIt6acqekKFZ9a7G4w4hEoFDqCSMfF6CNjx5lCUnB6OF22nnQgGkEWGhv';
        
        // Extract ABN from business data
        console.log(`🔍 BUSINESS DATA DEBUG:`);
        console.log(`   Full business object:`, JSON.stringify(business, null, 2));
        console.log(`   isCompany field:`, business.isCompany);
        
        const abn = business?.Abn || business?.abn || business?.ABN;
        
        console.log(`   Extracted ABN: "${abn}"`);
        console.log(`   Report Type: "${type}"`);
        
        if (!abn) {
            throw new Error('ABN not found in business data');
        }
        
        // Parse the type into granular fields for cache checking
        const parsedType = parseReportType(type);
        
        // Debug logging for ASIC type parsing
        console.log(`🔍 ASIC TYPE PARSING DEBUG:`);
        console.log(`   Input type: "${type}"`);
        console.log(`   Parsed type: "${parsedType.type}"`);
        console.log(`   Parsed asicType: "${parsedType.asicType}"`);
        
        // Check if report already exists in Reports table (by ABN + type)
        console.log(`🔍 Checking Reports table for existing report by ABN + type...`);
        console.log(`   ABN: ${abn}`);
        console.log(`   Type: ${type}`);
        console.log(`   Parsed Type: ${parsedType.type}`);
        
        const existingReport = await Report.findOne({
            where: {
                abn: abn,
                type: parsedType.type
            },
            order: [['created_at', 'DESC']]
        });
        
        if (existingReport) {
            console.log(`✅ CACHE HIT: Found existing report in Reports table`);
            console.log(`   Report ID: ${existingReport.id}`);
            console.log(`   UUID: ${existingReport.uid}`);
            console.log(`   Created: ${existingReport.created_at}`);
            
            // Fetch the report data from Alares API for parsing and storing
            let reportData = null;
            try {
                console.log('📡 Fetching report data from Alares API for cached report...');
                reportData = await fetchReportData(existingReport.uid, bearerToken);
                console.log('✅ Report data fetched successfully from Alares API');
            } catch (fetchError) {
                console.error('⚠️ Error fetching report data:', fetchError.message);
                console.log('⚠️ Continuing without fetching detailed data...');
            }
            
            // Parse and store structured data in separate tables (even for cached reports)
            if (reportData) {
                try {
                    await parseAndStoreReportData(existingReport.id, reportData);
                    console.log('✅ Structured report data stored successfully for cached report');
                } catch (parseError) {
                    console.error('⚠️ Error storing structured data for cached report:', parseError.message);
                    // Continue even if structured storage fails
                }
            }
            
            // Check if UserReport already exists for this user+matter+report combination
            const existingUserReport = await UserReport.findOne({
                where: {
                    userId: userId,
                    matterId: matterId || null,
                    reportId: existingReport.id
                }
            });
            
            // Only create UserReport if it doesn't already exist
            if (!existingUserReport) {
                try {
                    const userReport = await UserReport.create({
                        userId: userId,
                        matterId: matterId || null,
                        reportId: existingReport.id,
                        reportName: `${parsedType.type || type.toUpperCase()}_${abn}_${business.Name || business.name || 'Unknown Company'}.pdf`,
                        isPaid: true
                    });
                    
                    console.log('✅ UserReport created (using cached report):', userReport.id);
                } catch (userReportError) {
                    console.error('❌ Error creating UserReport:', userReportError);
                    throw userReportError;
                }
            } else {
                console.log('⚠️ UserReport already exists - skipping creation to avoid duplicate');
            }
            
            return {
                success: true,
                reportId: existingReport.id,
                uuid: existingReport.uid,
                status: 'cached',
                fromCache: true,
                savedReportId: existingReport.id,
                type: parsedType.type
            };
        }
        
        // Cache miss - proceed with creating new report
        console.log(`❌ CACHE MISS: No existing report found - creating new report`);
        console.log(`📡 Creating new report for ABN ${abn} (${type}) - CALLING EXTERNAL APIS`);
        
        // Prepare query parameters
        const params = {
            type: 'company',
            abn: abn,
            alares_report: '1'
        };
        
        // Add report type parameters based on the type
        if (type.includes('asic')) {
            if (type.includes('historical')) {
                params.asic_historical = '1';
            } else if (type.includes('current')) {
                params.asic_current = '1';
            } else if (type.includes('company')) {
                params.asic_company = '1';
            } else if (type.includes('personal')) {
                params.asic_personal = '1';
            } else if (type.includes('document')) {
                params.asic_document_search = '1';
            } else {
                params.asic_current = '1'; // Default fallback
            }
        } else if (type.includes('court') || type.includes('ato')) {
            // COURT and ATO map to asic-current as per user requirement
            params.asic_current = '1';
        } else if (type === 'land') {
            params.land = '1';
        } else if (type === 'ppsr') {
            params.ppsr = '1';
        } else if (type === 'property') {
            params.property = '1';
        } else if (type === 'director-ppsr') {
            params.director_ppsr = '1';
        } else if (type === 'director-bankruptcy') {
            params.director_bankruptcy = '1';
        } else if (type === 'director-property') {
            params.director_property = '1';
        } else if (type === 'director-related') {
            params.director_related = '1';
        }
        
        let createResponse, reportData;
        
        // Handle PPSR reports differently
        if (type === 'ppsr') {
            console.log('🔍 PPSR REPORT: Calling PPSR API directly');
            
            // For PPSR, we use the ABN and remove first 2 characters to get ACN
            // Call PPSR API directly with ABN
            const ppsrResponse = await callPPSRAPI(abn, business.Name || business.name);
            
            // Extract ppsrCloudId from the PPSR response to use as uid
            const ppsrCloudId = ppsrResponse.resource?.searchCriteriaSummaries?.[0]?.customerRequestId || 
                               ppsrResponse.resource?.ppsrCloudId || 
                               `ppsr-${Date.now()}-${abn}`;
            
            console.log('🔍 PPSR Cloud ID extracted:', ppsrCloudId);
            
            // Create a mock response structure for PPSR
            createResponse = {
                data: {
                    uuid: ppsrCloudId, // Use ppsrCloudId as the uid
                    report_id: `ppsr-${Date.now()}-${abn}`,
                    status: 'completed'
                }
            };
            
            // Use PPSR response as report data
            reportData = ppsrResponse;
            
            console.log('✅ PPSR API Response received and processed');
        } else {
            console.log('Calling report API with params:', params);
            
            // Make API call to create report for non-PPSR reports
            createResponse = await axios.post(apiUrl, null, {
                params: params,
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });
            
            console.log('Report creation API response:', createResponse.data);
            
            // Now call GET API to fetch the report data
            reportData = await fetchReportData(createResponse.data.uuid, bearerToken);
        }
        
        // Store the report data in database (basic report record)
        const savedReport = await Report.create({
            category: business.isCompany ? 'organization' : 'personal',
            isCompany: business.isCompany || false,
            type: parsedType.type,
            asicType: parsedType.asicType,
            abn: abn,
            searchKey: business.Name || business.name || 'Unknown',
            uid: createResponse.data.uuid,
            isAlert: true
        });
        
        console.log('🔍 DATABASE SAVE DEBUG:');
        console.log(`   Saved report ID: ${savedReport.id}`);
        console.log(`   Saved type: "${savedReport.type}"`);
        console.log(`   Saved asicType: "${savedReport.asicType}"`);
        console.log('Report data saved to database:', savedReport.id);
        
        // Create UserReport record for user-specific tracking
        try {
            const userReport = await UserReport.create({
                userId: userId,
                matterId: matterId || null, // Include matterId if provided
                reportId: savedReport.id,
                reportName: `${parsedType.type || parsedType.subType || type.toUpperCase()}_${abn}_${business.Name || business.name || 'Unknown Company'}.pdf`,
                isPaid: true // Report is paid for
            });
            
            console.log('UserReport created:', userReport.id);
        } catch (userReportError) {
            console.error('Error creating UserReport:', userReportError);
            // Continue even if UserReport creation fails
        }
        
        // Parse and store structured data in separate tables
        try {
            await parseAndStoreReportData(savedReport.id, reportData);
            console.log('Structured report data stored successfully');
        } catch (parseError) {
            console.error('Error storing structured data:', parseError);
            // Continue with the process even if structured storage fails
        }
        
        // Generate PDF for PPSR reports
        if (type === 'ppsr') {
            try {
                console.log('🔍 PPSR PDF: Generating PDF for PPSR report');
                
                // Fetch structured PPSR data from database
                const ppsrData = await fetchPPSRDataFromDB(savedReport.id);
                
                if (!ppsrData) {
                    console.log('⚠️ No PPSR data found in database, using raw API data');
                }
                
                const pdfGenerator = new PDFGenerator();
                const pdfData = {
                    reportData: reportData, // Keep raw data as fallback
                    ppsrData: ppsrData, // Add structured PPSR data
                    business: business,
                    abn: abn,
                    reportId: savedReport.id,
                    generatedAt: new Date().toISOString()
                };
                
                // Generate PDF using PPSR dynamic template
                const pdfBuffer = await pdfGenerator.generatePDF('PPSR-report-dynamic', pdfData, {
                    format: 'A4',
                    printBackground: true
                });
                
                // Save PDF to file system
                const fs = require('fs');
                const path = require('path');
                const pdfDir = path.join(__dirname, '..', 'pdfs');
                
                // Create pdfs directory if it doesn't exist
                if (!fs.existsSync(pdfDir)) {
                    fs.mkdirSync(pdfDir, { recursive: true });
                }
                
                const pdfFilename = `PPSR_${abn}_${business.Name || business.name || 'Unknown'}_${savedReport.id}.pdf`;
                const pdfPath = path.join(pdfDir, pdfFilename);
                
                fs.writeFileSync(pdfPath, pdfBuffer);
                
                console.log(`✅ PPSR PDF saved: ${pdfPath}`);
                
                // Update UserReport with PDF filename
                await UserReport.update(
                    { reportName: pdfFilename },
                    { where: { reportId: savedReport.id } }
                );
                
            } catch (pdfError) {
                console.error('❌ PPSR PDF generation failed:', pdfError);
                // Continue even if PDF generation fails
            }
        }
        
        // Return the response data
        return {
            success: true,
            reportId: createResponse.data.report_id,
            uuid: createResponse.data.uuid,
            status: createResponse.status,
            fromCache: false,
            savedReportId: savedReport.id,
            type: parsedType.type
        };
        
    } catch (error) {
        console.error('Error creating report:', error);
        console.log("mital");
        if (error.response) {
            // API returned an error response
            throw new Error(`Report API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Report API request failed - no response received');
        } else {
            // Something else happened
            throw new Error(`Report creation failed: ${error.message}`);
        }
    }
}

// Get Stripe publishable key
router.get('/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// Save card (create customer and attach payment method)
router.post('/save-card', authenticateSession, async (req, res) => {
    try {
        const { paymentMethodId, saveCard, setAsDefault } = req.body;
        const userId = req.session.userId;

        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PAYMENT_METHOD',
                message: 'Payment method ID is required'
            });
        }

        // Get user details
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }

        let customerId = null;
        let stripePaymentMethodId = paymentMethodId;

        // Only create customer and save card if user wants to save it
        if (saveCard) {
            // Check if user already has a Stripe customer ID
            const existingPaymentMethod = await UserPaymentMethod.findOne({
                where: { userId, isActive: true }
            });

            if (existingPaymentMethod && existingPaymentMethod.stripeCustomerId) {
                customerId = existingPaymentMethod.stripeCustomerId;
            } else {
                // Create Stripe customer
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    metadata: {
                        userId: userId.toString()
                    }
                });
                customerId = customer.id;
            }

            // Attach payment method to customer
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId
            });

            // Set as default payment method for customer
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            });

            // Get payment method details
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

            // Deactivate previous default payment methods if this should be default
            if (setAsDefault) {
                await UserPaymentMethod.update(
                    { isDefault: false },
                    { where: { userId, isActive: true } }
                );
            }

            // Save payment method to database
            await UserPaymentMethod.create({
                userId,
                stripeCustomerId: customerId,
                stripePaymentMethodId: paymentMethodId,
                cardBrand: paymentMethod.card.brand,
                cardLast4: paymentMethod.card.last4,
                cardExpMonth: paymentMethod.card.exp_month,
                cardExpYear: paymentMethod.card.exp_year,
                isDefault: setAsDefault || false,
                isActive: true
            });
        }

        res.json({
            success: true,
            message: saveCard ? 'Payment method saved successfully' : 'Payment method verified successfully',
            customerId,
            paymentMethodId: stripePaymentMethodId
        });

    } catch (error) {
        console.error('Save card error:', error);
        
        // Handle Stripe-specific errors
        if (error.type === 'StripeCardError') {
            return res.status(400).json({
                success: false,
                error: 'CARD_ERROR',
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to save payment method',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user's saved payment methods
router.get('/payment-methods', authenticateSession, async (req, res) => {
    try {
        const userId = req.session.userId;

        const paymentMethods = await UserPaymentMethod.findAll({
            where: { userId, isActive: true },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            paymentMethods: paymentMethods.map(pm => ({
                paymentMethodId: pm.paymentMethodId,
                cardBrand: pm.cardBrand,
                cardLast4: pm.cardLast4,
                cardExpMonth: pm.cardExpMonth,
                cardExpYear: pm.cardExpYear,
                isDefault: pm.isDefault,
                createdAt: pm.createdAt
            }))
        });

    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to retrieve payment methods'
        });
    }
});

// Set default payment method
router.put('/payment-methods/:id/set-default', authenticateSession, async (req, res) => {
    try {
        const userId = req.session.userId;
        const paymentMethodId = req.params.id;

        const paymentMethod = await UserPaymentMethod.findOne({
            where: { paymentMethodId, userId, isActive: true }
        });

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: 'Payment method not found'
            });
        }

        // Remove default from all other payment methods
        await UserPaymentMethod.update(
            { isDefault: false },
            { where: { userId, isActive: true } }
        );

        // Set this payment method as default
        await paymentMethod.update({ isDefault: true });

        // Update Stripe customer default payment method
        if (paymentMethod.stripeCustomerId && paymentMethod.stripePaymentMethodId) {
            try {
                await stripe.customers.update(paymentMethod.stripeCustomerId, {
                    invoice_settings: {
                        default_payment_method: paymentMethod.stripePaymentMethodId
                    }
                });
            } catch (stripeError) {
                console.error('Stripe update error:', stripeError);
                // Continue even if Stripe update fails
            }
        }

        res.json({
            success: true,
            message: 'Default payment method updated successfully'
        });

    } catch (error) {
        console.error('Set default payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to set default payment method'
        });
    }
});

// Delete a payment method
router.delete('/payment-methods/:id', authenticateSession, async (req, res) => {
    try {
        const userId = req.session.userId;
        const paymentMethodId = req.params.id;

        const paymentMethod = await UserPaymentMethod.findOne({
            where: { paymentMethodId, userId, isActive: true }
        });

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: 'Payment method not found'
            });
        }

        // Detach from Stripe
        if (paymentMethod.stripePaymentMethodId) {
            try {
                await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
            } catch (stripeError) {
                console.error('Stripe detach error:', stripeError);
                // Continue even if Stripe detach fails
            }
        }

        // Mark as inactive in database
        await paymentMethod.update({ isActive: false });

        res.json({
            success: true,
            message: 'Payment method deleted successfully'
        });

    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to delete payment method'
        });
    }
});

// Process payment (create and confirm payment intent)
router.post('/process-payment', authenticateSession, async (req, res) => {
    try {
        const { amount, currency = 'aud', description, paymentMethodId, business, type, matterId } = req.body;
        const userId = req.session.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_AMOUNT',
                message: 'Valid amount is required'
            });
        }

        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PAYMENT_METHOD',
                message: 'Payment method is required'
            });
        }

        // Get user details
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }

        // Get the selected payment method
        const paymentMethod = await UserPaymentMethod.findOne({
            where: { paymentMethodId, userId, isActive: true }
        });

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                error: 'PAYMENT_METHOD_NOT_FOUND',
                message: 'Payment method not found'
            });
        }

        // Create payment intent with the selected payment method
        const paymentIntentData = {
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            customer: paymentMethod.stripeCustomerId,
            payment_method: paymentMethod.stripePaymentMethodId,
            confirmation_method: 'automatic',
            confirm: true,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/search`,
            metadata: {
                userId: userId.toString(),
                paymentMethodId: paymentMethodId.toString(),
                businessName: business?.Name || business?.name || 'Unknown',
                businessAbn: business?.Abn || business?.abn || 'N/A',
                reportType: type || 'current',
                description: description || 'Credion Payment'
            }
        };

        console.log('Creating payment intent with data:', paymentIntentData);

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

        console.log('Payment intent created:', {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount
        });

        // Check if payment was successful
        if (paymentIntent.status === 'succeeded') {
            // Payment successful - record the transaction
            console.log('Payment succeeded:', paymentIntent.id);
            
            // Extract ABN from business data for cache check
            const abn = business?.Abn || business?.abn || business?.ABN;
            
            if (!abn) {
                return res.status(400).json({
                    success: false,
                    error: 'ABN_NOT_FOUND',
                    message: 'ABN not found in business data'
                });
            }
            
            // Check cache AFTER payment success
            console.log(`🔍 Checking cache AFTER payment for ABN: ${abn}, Type: ${type}`);
            const cacheCheck = await checkReportCache(abn, type);
            
            if (cacheCheck.exists && cacheCheck.isRecent) {
                console.log(`✅ CACHE HIT: Found cached report for ABN ${abn} (${type}) - SKIPPING API CALLS`);
                
                return res.json({
                    success: true,
                    message: 'Payment processed successfully and report retrieved from cache',
                    paymentIntent: {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        created: paymentIntent.created
                    },
                    report: {
                        success: true,
                        reportId: cacheCheck.report.reportId,
                        uuid: cacheCheck.report.uuid,
                        status: 'cached',
                        data: cacheCheck.report.reportData,
                        fromCache: true
                    }
                });
            }
            
            console.log(`❌ CACHE MISS: No cached report found for ABN ${abn} (${type}) - CALLING EXTERNAL APIS`);
            
            // Call external API to create report (only if no cache)
            try {
                const reportResponse = await createReport({
                    business,
                    type,
                    userId,
                    paymentIntentId: paymentIntent.id,
                    matterId: matterId || null
                });
                
                console.log('Report created successfully:', reportResponse);
                
                res.json({
                    success: true,
                    message: 'Payment processed successfully and report created',
                    paymentIntent: {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        created: paymentIntent.created
                    },
                    report: reportResponse
                });
            } catch (reportError) {
                console.error('Report creation failed:', reportError);
                
                // Payment succeeded but report creation failed
                res.json({
                    success: true,
                    message: 'Payment processed successfully, but report creation failed',
                    paymentIntent: {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        created: paymentIntent.created
                    },
                    reportError: reportError.message
                });
            }
        } else if (paymentIntent.status === 'requires_action') {
            // Payment requires additional authentication (3D Secure)
            console.log('Payment requires action:', paymentIntent.id);
            
            res.json({
                success: true,
                requiresAction: true,
                clientSecret: paymentIntent.client_secret,
                message: 'Payment requires additional authentication'
            });
        } else {
            // Payment failed
            console.log('Payment failed:', paymentIntent.id, paymentIntent.status);
            
            res.status(400).json({
                success: false,
                error: 'PAYMENT_FAILED',
                message: 'Payment could not be processed',
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status
                }
            });
        }

    } catch (error) {
        console.error('Process payment error:', error);
        
        // Handle Stripe-specific errors
        if (error.type === 'StripeCardError') {
            return res.status(400).json({
                success: false,
                error: 'CARD_ERROR',
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to process payment',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create payment intent (for one-time payments) - kept for compatibility
router.post('/create-payment-intent', authenticateSession, async (req, res) => {
    try {
        const { amount, currency = 'aud', description } = req.body;
        const userId = req.session.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_AMOUNT',
                message: 'Valid amount is required'
            });
        }

        // Get user details
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }

        // Check if user has a saved payment method
        const savedPaymentMethod = await UserPaymentMethod.findOne({
            where: { userId, isDefault: true, isActive: true }
        });

        const paymentIntentData = {
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: userId.toString(),
                description: description || 'Credion Payment'
            }
        };

        // If user has a saved payment method, use it
        if (savedPaymentMethod && savedPaymentMethod.stripeCustomerId) {
            paymentIntentData.customer = savedPaymentMethod.stripeCustomerId;
            if (savedPaymentMethod.stripePaymentMethodId) {
                paymentIntentData.payment_method = savedPaymentMethod.stripePaymentMethodId;
            }
        } else {
            // Create receipt email
            paymentIntentData.receipt_email = user.email;
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to create payment intent',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Export functions for testing
module.exports = {
    router,
    callPPSRAPI,
    createReport,
    parseAndStoreReportData,
    checkReportCache,
    fetchPPSRDataFromDB
};

