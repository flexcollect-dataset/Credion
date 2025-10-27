const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, UserPaymentMethod, Report } = require('../models');
const axios = require('axios');

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
async function checkReportCache(abn, asicType) {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        console.log(`🔍 CACHE CHECK DETAILS:`);
        console.log(`   Looking for ABN: "${abn}"`);
        console.log(`   Looking for ASIC Type: "${asicType}"`);
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
            console.log(`     ${index + 1}. Report ID: ${report.reportId}, ASIC: ${report.asicType}, Created: ${report.created_at}, Active: ${report.isActive}`);
        });
        
        const existingReport = await Report.findOne({
            where: {
                abn: abn,
                asicType: asicType,
                isActive: true,
                created_at: {
                    [require('sequelize').Op.gte]: sevenDaysAgo
                }
            },
            order: [['created_at', 'DESC']]
        });
        
        if (existingReport) {
            console.log(`✅ CACHE HIT: Found cached report for ABN ${abn} (${asicType}) from ${existingReport.created_at}`);
            console.log(`   Report ID: ${existingReport.reportId}, UUID: ${existingReport.uuid}`);
            return {
                exists: true,
                report: existingReport,
                isRecent: true
            };
        }
        
        console.log(`❌ CACHE MISS: No cached report found for ABN ${abn} (${asicType})`);
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

// Function to parse and store report data in normalized tables
async function parseAndStoreReportData(reportId, reportData) {
    const { sequelize } = require('../config/db');
    
    try {
        console.log('📊 Parsing and storing report data for report ID:', reportId);
        
        // 1. Store Entity data
        if (reportData.entity) {
            const entityData = reportData.entity;
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
                    entityData.abn,
                    entityData.acn,
                    entityData.is_arbn,
                    entityData.abr_gst_registration_date,
                    entityData.abr_gst_status,
                    entityData.abr_postcode,
                    entityData.abr_state,
                    entityData.abr_status,
                    entityData.asic_date_of_registration,
                    entityData.asic_status,
                    entityData.document_number,
                    JSON.stringify(entityData.former_names || []),
                    entityData.name,
                    entityData.reference,
                    entityData.review_date,
                    entityData.name_start_at,
                    entityData.registered_in,
                    entityData.organisation_type,
                    entityData.disclosing_entity,
                    entityData.organisation_class,
                    entityData.organisation_sub_class
                ]
            });
            console.log('✅ Entity data stored');
        }
        
        // 2. Store ASIC Extract data
        if (reportData.asic_extracts) {
            const asicExtract = reportData.asic_extracts;
            const [asicResult] = await sequelize.query(`
                INSERT INTO asic_extracts (report_id, external_id) 
                VALUES ($1, $2) 
                RETURNING asic_extract_id
            `, {
                bind: [reportId, asicExtract.external_id]
            });
            
            const asicExtractId = asicResult[0].asic_extract_id;
            console.log('✅ ASIC Extract stored with ID:', asicExtractId);
            
            // 3. Store Addresses
            if (asicExtract.addresses && Array.isArray(asicExtract.addresses)) {
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
                            address.type,
                            address.entity,
                            address.address,
                            address.care_of,
                            address.address_1,
                            address.address_2,
                            address.suburb,
                            address.state,
                            address.postcode,
                            address.country,
                            address.status,
                            address.start_date,
                            address.end_date,
                            address.document_number,
                            'company'
                        ]
                    });
                }
                console.log('✅ Addresses stored');
            }
            
            // 4. Store Directors
            if (asicExtract.directors && Array.isArray(asicExtract.directors)) {
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
                            director.type,
                            director.name,
                            director.dob,
                            director.place_of_birth,
                            director.director_id_external,
                            director.document_number,
                            director.start_date,
                            director.end_date,
                            director.status,
                            director.address ? JSON.stringify(director.address) : null
                        ]
                    });
                }
                console.log('✅ Directors stored');
            }
            
            // 5. Store Shareholders
            if (asicExtract.shareholders && Array.isArray(asicExtract.shareholders)) {
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
                            shareholder.name,
                            shareholder.acn,
                            shareholder.class,
                            shareholder.number_held,
                            shareholder.percentage_held,
                            shareholder.document_number,
                            shareholder.beneficially_owned,
                            shareholder.fully_paid,
                            shareholder.jointly_held,
                            shareholder.status,
                            shareholder.address ? JSON.stringify(shareholder.address) : null
                        ]
                    });
                }
                console.log('✅ Shareholders stored');
            }
            
            // 6. Store Share Structures
            if (asicExtract.share_structures && Array.isArray(asicExtract.share_structures)) {
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
                            shareStructure.class_code,
                            shareStructure.class_description,
                            shareStructure.status,
                            shareStructure.share_count,
                            shareStructure.amount_paid,
                            shareStructure.amount_due,
                            shareStructure.document_number
                        ]
                    });
                }
                console.log('✅ Share Structures stored');
            }
            
            // 7. Store Documents
            if (asicExtract.documents && Array.isArray(asicExtract.documents)) {
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
                            document.type,
                            document.description,
                            document.document_number,
                            document.form_code,
                            document.page_count,
                            document.effective_at,
                            document.processed_at,
                            document.received_at
                        ]
                    });
                }
                console.log('✅ Documents stored');
            }
        }
        
        // 8. Store Tax Debts
        if (reportData.tax_debt && Array.isArray(reportData.tax_debt)) {
            for (const taxDebt of reportData.tax_debt) {
                await sequelize.query(`
                    INSERT INTO tax_debts (
                        report_id, date, amount, status, ato_added_at, ato_updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6
                    )
                `, {
                    bind: [
                        reportId,
                        taxDebt.date,
                        taxDebt.amount,
                        taxDebt.status,
                        taxDebt.ato_added_at,
                        taxDebt.ato_updated_at
                    ]
                });
            }
            console.log('✅ Tax Debts stored');
        }
        
        // 9. Store Cases
        if (reportData.cases && typeof reportData.cases === 'object') {
            for (const [caseUuid, caseData] of Object.entries(reportData.cases)) {
                const [caseResult] = await sequelize.query(`
                    INSERT INTO cases (
                        report_id, type, notification_time, court_name, state, court_type, 
                        case_type, case_number, jurisdiction, suburb, next_hearing_date, 
                        case_name, total_parties, total_documents, total_hearings, 
                        timezone, internal_reference, name, other_names, insolvency_risk_factor, 
                        party_role, most_recent_event, match_on
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
                    ) RETURNING case_id
                `, {
                    bind: [
                        reportId,
                        caseData.type,
                        caseData.notification_time,
                        caseData.court_name,
                        caseData.state,
                        caseData.court_type,
                        caseData.case_type,
                        caseData.case_number,
                        caseData.jurisdiction,
                        caseData.suburb,
                        caseData.next_hearing_date,
                        caseData.case_name,
                        caseData.total_parties,
                        caseData.total_documents,
                        caseData.total_hearings,
                        caseData.timezone,
                        caseData.internal_reference,
                        caseData.name,
                        caseData.other_names,
                        caseData.insolvency_risk_factor,
                        caseData.party_role,
                        caseData.most_recent_event,
                        caseData.match_on
                    ]
                });
                
                const caseId = caseResult[0].case_id;
                
                // Store Case Parties
                if (caseData.parties && Array.isArray(caseData.parties)) {
                    for (const party of caseData.parties) {
                        await sequelize.query(`
                            INSERT INTO case_parties (
                                case_id, name, type, role, offence, plea, representative_firm, 
                                representative_name, address, phone, fax, abn, acn
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                            )
                        `, {
                            bind: [
                                caseId,
                                party.name,
                                party.type,
                                party.role,
                                party.offence,
                                party.plea,
                                party.representative_firm,
                                party.representative_name,
                                party.address,
                                party.phone,
                                party.fax,
                                party.abn,
                                party.acn
                            ]
                        });
                    }
                }
                
                // Store Case Hearings
                if (caseData.hearings && Array.isArray(caseData.hearings)) {
                    for (const hearing of caseData.hearings) {
                        await sequelize.query(`
                            INSERT INTO case_hearings (
                                case_id, datetime, officer, court_room, court_name, court_phone, 
                                court_address, court_suburb, type, list_no, outcome
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
                            )
                        `, {
                            bind: [
                                caseId,
                                hearing.datetime,
                                hearing.officer,
                                hearing.court_room,
                                hearing.court_name,
                                hearing.court_phone,
                                hearing.court_address,
                                hearing.court_suburb,
                                hearing.type,
                                hearing.list_no,
                                hearing.outcome
                            ]
                        });
                    }
                }
                
                // Store Case Documents
                if (caseData.documents && Array.isArray(caseData.documents)) {
                    for (const document of caseData.documents) {
                        await sequelize.query(`
                            INSERT INTO case_documents (
                                case_id, datetime, title, description, filed_by
                            ) VALUES (
                                $1, $2, $3, $4, $5
                            )
                        `, {
                            bind: [
                                caseId,
                                document.datetime,
                                document.title,
                                document.description,
                                document.filed_by
                            ]
                        });
                    }
                }
                
                // Store Case Applications
                if (caseData.applications && Array.isArray(caseData.applications)) {
                    for (const application of caseData.applications) {
                        await sequelize.query(`
                            INSERT INTO case_applications (
                                case_id, title, type, status, date_filed, date_finalised
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6
                            )
                        `, {
                            bind: [
                                caseId,
                                application.title,
                                application.type,
                                application.status,
                                application.date_filed,
                                application.date_finalised
                            ]
                        });
                    }
                }
                
                // Store Case Judgments
                if (caseData.judgments && Array.isArray(caseData.judgments)) {
                    for (const judgment of caseData.judgments) {
                        await sequelize.query(`
                            INSERT INTO case_judgments (
                                case_id, uuid, unique_id, number, case_number, title, date, url, 
                                state, court, court_type, location, officer, case_type, catchwords, 
                                legislation, cases_cited, result, division, registry, national_practice_area, 
                                sub_area, category, number_of_paragraphs, date_of_last_submission, 
                                orders, reasons_for_judgment, prior_decisions
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
                            )
                        `, {
                            bind: [
                                caseId,
                                judgment.uuid,
                                judgment.unique_id,
                                judgment.number,
                                judgment.case_number,
                                judgment.title,
                                judgment.date,
                                judgment.url,
                                judgment.state,
                                judgment.court,
                                judgment.court_type,
                                judgment.location,
                                judgment.officer,
                                judgment.case_type,
                                judgment.catchwords,
                                judgment.legislation,
                                judgment.cases_cited,
                                judgment.result,
                                judgment.division,
                                judgment.registry,
                                judgment.national_practice_area,
                                judgment.sub_area,
                                judgment.category,
                                judgment.number_of_paragraphs,
                                judgment.date_of_last_submission,
                                judgment.orders,
                                judgment.reasons_for_judgment,
                                JSON.stringify(judgment.prior_decisions || [])
                            ]
                        });
                    }
                }
            }
            console.log('✅ Cases and related data stored');
        }
        
        // 10. Store Insolvencies
        if (reportData.insolvencies && typeof reportData.insolvencies === 'object') {
            for (const [insolvencyUuid, insolvencyData] of Object.entries(reportData.insolvencies)) {
                const [insolvencyResult] = await sequelize.query(`
                    INSERT INTO insolvencies (
                        report_id, uuid, type, notification_time, court_name, case_type, 
                        case_number, asic_notice_id, case_name, total_parties, 
                        internal_reference, name, other_names, insolvency_risk_factor, match_on
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                    ) RETURNING insolvency_id
                `, {
                    bind: [
                        reportId,
                        insolvencyData.uuid,
                        insolvencyData.type,
                        insolvencyData.notification_time,
                        insolvencyData.court_name,
                        insolvencyData.case_type,
                        insolvencyData.case_number,
                        insolvencyData.asic_notice_id,
                        insolvencyData.case_name,
                        insolvencyData.total_parties,
                        insolvencyData.internal_reference,
                        insolvencyData.name,
                        insolvencyData.other_names,
                        insolvencyData.insolvency_risk_factor,
                        insolvencyData.match_on
                    ]
                });
                
                const insolvencyId = insolvencyResult[0].insolvency_id;
                
                // Store Insolvency Parties
                if (insolvencyData.parties && Array.isArray(insolvencyData.parties)) {
                    for (const party of insolvencyData.parties) {
                        await sequelize.query(`
                            INSERT INTO insolvency_parties (
                                insolvency_id, name, acn, url
                            ) VALUES (
                                $1, $2, $3, $4
                            )
                        `, {
                            bind: [
                                insolvencyId,
                                party.name,
                                party.acn,
                                party.url
                            ]
                        });
                    }
                }
            }
            console.log('✅ Insolvencies and related data stored');
        }
        
        console.log('🎉 All report data parsed and stored successfully!');
        
    } catch (error) {
        console.error('❌ Error parsing and storing report data:', error);
        throw error;
    }
}

// Function to create report via external API
async function createReport({ business, asicType, userId, paymentIntentId, matterId }) {
    try {
        const apiUrl = 'https://alares.com.au/api/reports/create';
        const bearerToken = 'pIIDIt6acqekKFZ9a7G4w4hEoFDqCSMfF6CNjx5lCUnB6OF22nnQgGkEWGhv';
        
        // Extract ABN from business data
        console.log(`🔍 BUSINESS DATA DEBUG:`);
        console.log(`   Full business object:`, JSON.stringify(business, null, 2));
        
        const abn = business?.Abn || business?.abn || business?.ABN;
        
        console.log(`   Extracted ABN: "${abn}"`);
        console.log(`   ASIC Type: "${asicType}"`);
        
        if (!abn) {
            throw new Error('ABN not found in business data');
        }
        
        // Cache already checked before calling this function - proceed with API calls
        console.log(`📡 Creating new report for ABN ${abn} (${asicType}) - CALLING EXTERNAL APIS`);
        
        // Prepare query parameters
        const params = {
            type: 'company',
            abn: abn,
            alares_report: '1'
        };
        
        // Add ASIC type parameter
        if (asicType === 'current') {
            params.asic_current = '1';
        } else if (asicType === 'historical') {
            params.asic_historical = '1';
        }
        
        console.log('Calling report API with params:', params);
        
        // Make API call to create report
        const createResponse = await axios.post(apiUrl, null, {
            params: params,
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });
        
        console.log('Report creation API response:', createResponse.data);
        
        // Now call GET API to fetch the report data
        const reportData = await fetchReportData(createResponse.data.uuid, bearerToken);
        
        // Store the report data in database (basic report record)
        const savedReport = await Report.create({
            uuid: createResponse.data.uuid,
            abn: abn,
            asicType: asicType,
            userId: userId,
            matterId: matterId || null
        });
        
        console.log('Report data saved to database:', savedReport.reportId);
        
        // Parse and store structured data in separate tables
        try {
            await parseAndStoreReportData(savedReport.reportId, reportData);
            console.log('Structured report data stored successfully');
        } catch (parseError) {
            console.error('Error storing structured data:', parseError);
            // Continue with the process even if structured storage fails
        }
        
        // Return the response data
        return {
            success: true,
            reportId: createResponse.data.report_id,
            uuid: createResponse.data.uuid,
            status: createResponse.status,
            fromCache: false,
            savedReportId: savedReport.reportId
        };
        
    } catch (error) {
        console.error('Error creating report:', error);
        
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
        const { amount, currency = 'aud', description, paymentMethodId, business, asicType } = req.body;
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
                asicType: asicType || 'current',
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
            console.log(`🔍 Checking cache AFTER payment for ABN: ${abn}, ASIC Type: ${asicType}`);
            const cacheCheck = await checkReportCache(abn, asicType);
            
            if (cacheCheck.exists && cacheCheck.isRecent) {
                console.log(`✅ CACHE HIT: Found cached report for ABN ${abn} (${asicType}) - SKIPPING API CALLS`);
                
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
            
            console.log(`❌ CACHE MISS: No cached report found for ABN ${abn} (${asicType}) - CALLING EXTERNAL APIS`);
            
            // Call external API to create report (only if no cache)
            try {
                const reportResponse = await createReport({
                    business,
                    asicType,
                    userId,
                    paymentIntentId: paymentIntent.id
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

module.exports = router;
module.exports.createReport = createReport;

