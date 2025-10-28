const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

class PDFGenerator {
    constructor() {
        this.templateCache = new Map();
    }

    async loadTemplate(templateName) {
        if (this.templateCache.has(templateName)) {
            return this.templateCache.get(templateName);
        }

        const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateContent);
        
        this.templateCache.set(templateName, template);
        return template;
    }

    async generatePDF(templateName, data, options = {}) {
        let browser;
        try {
            // Load and compile template
            const template = await this.loadTemplate(templateName);
            const html = template(data);

            // Launch Puppeteer with better error handling
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();
            
            // Set content with timeout
            await page.setContent(html, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Wait a bit for any dynamic content
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate PDF with better options for all pages
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                },
                displayHeaderFooter: false,
                preferCSSPageSize: false,
                pageRanges: '1-11',
                scale: 0.8,
                ...options
            });

            return pdfBuffer;

        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    // Generate report data based on report type
    async generateReportData(report, reportType) {
        const { sequelize } = require('../config/db');

        try {
            console.log('Report object:', report);
            console.log('Report ID:', report.reportId || report.id);
            console.log('Report Type:', reportType);
            
            // Use the report ID from the report object - use reportId field first, then id
            const reportId = report.reportId || report.id;
            console.log('🔍 Using Report ID for queries:', reportId);

            // Handle COURT reports differently
            if (reportType === 'COURT') {
                return await this.generateCourtReportData(report, reportId, sequelize);
            }
            
            // Get entity data using the correct report ID
            const [entities] = await sequelize.query(`
                SELECT * FROM entities 
                WHERE report_id = ${reportId} 
                LIMIT 1
            `);
            
            console.log('🔍 Debug - Entities found:', entities.length);
            if (entities.length > 0) {
                console.log('🔍 Debug - Entity data:', {
                    name: entities[0].name,
                    abn: entities[0].abn,
                    acn: entities[0].acn,
                    asic_status: entities[0].asic_status
                });
            }

            // Set entity early so we can use it even if other queries fail
            const entity = entities[0] || {};

            // Get ASIC extract first to get the asic_extract_id
            let asicExtractId = null;
            try {
                const [asicExtracts] = await sequelize.query(`
                    SELECT * FROM asic_extracts 
                    WHERE report_id = ${reportId}
                    LIMIT 1
                `);
                
                asicExtractId = asicExtracts[0]?.asic_extract_id;
                console.log('🔍 ASIC Extract ID:', asicExtractId);
            } catch (error) {
                console.log('⚠️ asic_extracts table error:', error.message);
                asicExtractId = null;
            }
            
            // Get ALL addresses from the addresses table using asic_extract_id
            let addresses = [];
            let contactAddresses = [];
            let allAddresses = []; // Keep all addresses for personnel matching
            if (asicExtractId) {
                try {
                    const [addressesResult] = await sequelize.query(`
                        SELECT * FROM addresses 
                        WHERE asic_extract_id = ${asicExtractId}
                        ORDER BY start_date DESC
                    `);
                    
                    // Keep all addresses for personnel matching
                    allAddresses = addressesResult;
                    
                    // Split addresses by address_category field
                    // Only include company addresses (not director, secretary, shareholder)
                    addresses = addressesResult.filter(addr => 
                        addr.address_category !== 'contact' && 
                        addr.address_category !== 'director' && 
                        addr.address_category !== 'secretary' && 
                        addr.address_category !== 'shareholder'
                    );
                    contactAddresses = addressesResult.filter(addr => addr.address_category === 'contact');
                    
                    console.log('🔍 Addresses found:', addresses.length);
                    console.log('🔍 Contact addresses found:', contactAddresses.length);
                } catch (error) {
                    console.log('⚠️ addresses table error, using empty arrays:', error.message);
                    addresses = [];
                    contactAddresses = [];
                    allAddresses = [];
                }
            } else {
                console.log('⚠️ No ASIC extract ID found, using empty address arrays');
            }

            // Get directors using asic_extract_id (exclude secretaries)
            let directors = [];
            if (asicExtractId) {
                try {
                    const [directorsResult] = await sequelize.query(`
                        SELECT * FROM directors 
                        WHERE asic_extract_id = ${asicExtractId}
                        AND status = 'Current'
                        AND type = 'Director'
                        ORDER BY start_date DESC
                    `);
                    directors = directorsResult;
                    console.log('🔍 Directors found:', directors.length);
                } catch (error) {
                    console.log('⚠️ directors table error, using empty array:', error.message);
                    directors = [];
                }
            } else {
                console.log('⚠️ No ASIC extract ID found, using empty directors array');
            }

            // Get shareholders using asic_extract_id
            let shareholders = [];
            if (asicExtractId) {
                try {
                    const [shareholdersResult] = await sequelize.query(`
                        SELECT * FROM shareholders 
                        WHERE asic_extract_id = ${asicExtractId}
                        AND status = 'Current'
                        ORDER BY number_held DESC
                    `);
                    shareholders = shareholdersResult;
                    console.log('🔍 Shareholders found:', shareholders.length);
                } catch (error) {
                    console.log('⚠️ shareholders table error, using empty array:', error.message);
                    shareholders = [];
                }
            } else {
                console.log('⚠️ No ASIC extract ID found, using empty shareholders array');
            }

            // Get share structures using asic_extract_id
            let shareStructures = [];
            if (asicExtractId) {
                try {
                    const [shareStructuresResult] = await sequelize.query(`
                        SELECT * FROM share_structures 
                        WHERE asic_extract_id = ${asicExtractId}
                        ORDER BY share_count DESC
                    `);
                    shareStructures = shareStructuresResult;
                    console.log('🔍 Share structures found:', shareStructures.length);
                } catch (error) {
                    console.log('⚠️ share_structures table error, using empty array:', error.message);
                    shareStructures = [];
                }
            } else {
                console.log('⚠️ No ASIC extract ID found, using empty share structures array');
            }

            // Get secretaries from directors table where type = 'Secretary'
            let secretaries = [];
            if (asicExtractId) {
                try {
                    const [secretariesResult] = await sequelize.query(`
                        SELECT * FROM directors 
                        WHERE asic_extract_id = ${asicExtractId}
                        AND status = 'Current'
                        AND type = 'Secretary'
                        ORDER BY start_date DESC
                    `);
                    secretaries = secretariesResult;
                    console.log('🔍 Secretaries found:', secretaries.length);
                } catch (error) {
                    console.log('⚠️ secretaries query error, using empty array:', error.message);
                    secretaries = [];
                }
            } else {
                console.log('⚠️ No ASIC extract ID found, using empty secretaries array');
            }

            // Get tax debts
            let taxDebt = null;
            try {
                const [taxDebts] = await sequelize.query(`
                    SELECT * FROM tax_debts 
                    WHERE report_id = ${reportId}
                    ORDER BY amount DESC
                    LIMIT 1
                `);
                taxDebt = taxDebts[0];
                console.log('🔍 Tax debt found:', !!taxDebt);
            } catch (error) {
                console.log('⚠️ tax_debts table error, using null:', error.message);
                taxDebt = null;
            }

            // Get ASIC documents (handle missing table gracefully)
            let asicDocuments = [];
            try {
                const [asicDocumentsRaw] = await sequelize.query(`
                    SELECT document_data FROM asic_documents 
                    WHERE report_id = ${reportId}
                    ORDER BY created_at DESC
                `);
                
                // Extract documents from JSON data
                asicDocuments = asicDocumentsRaw.map(row => {
                    const doc = row.document_data;
                    return {
                        ...doc,
                        date_received: doc.received_at || doc.effective_at || new Date().toISOString()
                    };
                });
                console.log('🔍 ASIC documents found:', asicDocuments.length);
            } catch (error) {
                console.log('⚠️ asic_documents table error, using empty array:', error.message);
                asicDocuments = [];
            }

            // Get documents from documents table using asic_extract_id
            let documents = [];
            if (asicExtractId) {
                try {
                    const [documentsResult] = await sequelize.query(`
                        SELECT * FROM documents 
                        WHERE asic_extract_id = ${asicExtractId}
                        ORDER BY received_at DESC
                    `);
                    documents = documentsResult;
                    console.log('🔍 Documents found:', documents.length);
                } catch (error) {
                    console.log('⚠️ documents table error, using empty array:', error.message);
                    documents = [];
                }
            } else {
                console.log('⚠️ No ASIC extract ID found, using empty documents array');
            }

            // Calculate Documents stats using documents table
            const totalDocuments = documents.length;
            const currentYear = new Date().getFullYear();
            const currentYearFilings = documents.filter(doc => {
                const docYear = new Date(doc.received_at).getFullYear();
                return docYear === currentYear;
            }).length;
            
            // Get unique form types
            const uniqueFormTypes = [...new Set(documents.map(doc => doc.form_code))].length;
            
            // Calculate date range
            const dates = documents.map(doc => new Date(doc.received_at)).sort((a, b) => a - b);
            const earliestYear = dates.length > 0 ? dates[0].getFullYear() : currentYear;
            const latestYear = dates.length > 0 ? dates[dates.length - 1].getFullYear() : currentYear;
            const dateRange = `${earliestYear}-${latestYear}`;

            // Calculate ownership concentration and total share capital
            const totalShares = shareholders.reduce((sum, shareholder) => sum + (parseInt(shareholder.number_held) || 0), 0);
            const ownershipConcentration = totalShares > 0 ? '100%' : 'N/A';
            const totalShareCapital = shareStructures.reduce((sum, structure) => sum + (parseFloat(structure.total_paid) || 0), 0);

            console.log('🔍 Entity data for mapping:', {
                name: entity.name,
                abn: entity.abn,
                acn: entity.acn,
                asic_status: entity.asic_status
            });

          

            // Initialize with default values
            const asicExtractType = 'Current';

            // Calculate total addresses (addresses + contact_addresses)
            const totalAddresses = (addresses?.length || 0) + (contactAddresses?.length || 0);

            // Helper function to format dates as DD-MM-YYYY
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                try {
                    const date = new Date(dateString);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                } catch (error) {
                    return 'N/A';
                }
            };

            const baseData = {
                reportId: reportId,
                reportType: reportType.toUpperCase(),
                asicExtractType: asicExtractType,
                companyName: entity.name || 'Company Name Not Available',
                abn: entity.abn || report.abn || 'N/A',
                acn: entity.acn || 'N/A',
                asicStatus: entity.asic_status || 'Unknown',
                abnStatus: entity.abr_status || 'Unknown',
                gstStatus: entity.abr_gst_status || 'Unknown',
                companyType: entity.organisation_type || 'Unknown',
                registrationDate: entity.asic_date_of_registration ? 
                    new Date(entity.asic_date_of_registration).toLocaleDateString('en-AU') : 'N/A',
                reviewDate: entity.review_date ? 
                    new Date(entity.review_date).toLocaleDateString('en-AU') : 'N/A',
                registeredState: entity.registered_in || 'N/A',
                reportDate: new Date().toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                // Additional entity fields for page 2
                isArbn: entity.is_arbn || false,
                abrGstRegistrationDate: entity.abr_gst_registration_date ? 
                    new Date(entity.abr_gst_registration_date).toLocaleDateString('en-AU') : 'N/A',
                abrPostcode: entity.abr_postcode || 'N/A',
                abrState: entity.abr_state || 'N/A',
                documentNumber: entity.document_number || 'N/A',
                formerNames: entity.former_names || [],
                reference: entity.reference || 'N/A',
                nameStartAt: entity.name_start_at ? 
                    new Date(entity.name_start_at).toLocaleDateString('en-AU') : 'N/A',
                disclosingEntity: entity.disclosing_entity || 'N/A',
                organisationClass: entity.organisation_class || 'N/A',
                organisationSubClass: entity.organisation_sub_class || 'N/A',
                // Tax debt and other data
                hasTaxDebt: !!taxDebt,
                taxDebtAmount: taxDebt ? `$${parseFloat(taxDebt.amount).toLocaleString()}` : '$0.00',
                taxDebtDate: taxDebt ? 
                    new Date(taxDebt.date_updated).toLocaleDateString('en-AU') : 'N/A',
                addresses: (addresses || []).map(addr => ({
                    ...addr,
                    start_date: formatDate(addr.start_date),
                    end_date: formatDate(addr.end_date)
                })),
                contactAddresses: (contactAddresses || []).map(addr => ({
                    ...addr,
                    start_date: formatDate(addr.start_date),
                    end_date: formatDate(addr.end_date)
                })),
                totalAddresses: totalAddresses,
                directors: directors || [],
                secretaries: secretaries || [],
                shareholders: shareholders || [],
                shareStructures: shareStructures || [],
                asicDocuments: asicDocuments || [],
                documents: (documents || []).map(doc => ({
                    ...doc,
                    form_type: doc.form_code, // Map form_code to form_type for template
                    date_received: formatDate(doc.received_at)
                })),
                // Counts for display
                totalDirectors: (directors || []).length,
                totalSecretaries: (secretaries || []).length,
                totalShareholders: (shareholders || []).length,
                // Page 4 data - formatted for display with addresses
                directorsFormatted: (directors || []).map(dir => {
                    // Find any director address (since we don't have name matching)
                    const matchingAddress = (allAddresses || []).find(addr => 
                        addr.address_category === 'director'
                    );
                    console.log('🔍 Director address matching:', {
                        directorName: dir.name,
                        addressCategory: 'director',
                        matchingAddress: matchingAddress ? 'FOUND' : 'NOT FOUND',
                        allAddressesCount: allAddresses.length
                    });
                    return {
                        ...dir,
                        start_date: formatDate(dir.start_date),
                        end_date: formatDate(dir.end_date),
                        date_of_birth: dir.dob ? formatDate(dir.dob) : 'N/A',
                        place_of_birth: dir.place_of_birth || 'N/A',
                        address: matchingAddress || null
                    };
                }),
                secretariesFormatted: (secretaries || []).map(sec => {
                    // Find any secretary address (since we don't have name matching)
                    const matchingAddress = (allAddresses || []).find(addr => 
                        addr.address_category === 'secretary'
                    );
                    console.log('🔍 Secretary address matching:', {
                        secretaryName: sec.name,
                        addressCategory: 'secretary',
                        matchingAddress: matchingAddress ? 'FOUND' : 'NOT FOUND'
                    });
                    return {
                        ...sec,
                        start_date: formatDate(sec.start_date),
                        end_date: formatDate(sec.end_date),
                        date_of_birth: sec.dob ? formatDate(sec.dob) : 'N/A',
                        place_of_birth: sec.place_of_birth || 'N/A',
                        address: matchingAddress || null
                    };
                }),
                shareholdersFormatted: (shareholders || []).map(share => {
                    // Find any shareholder address (since we don't have name matching)
                    const matchingAddress = (allAddresses || []).find(addr => 
                        addr.address_category === 'shareholder'
                    );
                    console.log('🔍 Shareholder address matching:', {
                        shareholderName: share.name,
                        addressCategory: 'shareholder',
                        matchingAddress: matchingAddress ? 'FOUND' : 'NOT FOUND'
                    });
                    return {
                        ...share,
                        start_date: formatDate(share.start_date),
                        end_date: formatDate(share.end_date),
                        address: matchingAddress || null
                    };
                }),
                totalDocuments: totalDocuments,
                currentYearFilings: currentYearFilings,
                uniqueFormTypes: uniqueFormTypes,
                dateRange: dateRange,
                ownershipConcentration: ownershipConcentration,
                totalShareCapital: totalShareCapital.toFixed(2)
            };

            console.log('🔍 Final baseData being passed to template:', {
                companyName: baseData.companyName,
                abn: baseData.abn,
                acn: baseData.acn,
                addresses: baseData.addresses.length,
                directors: baseData.directors.length,
                shareholders: baseData.shareholders.length
            });

            return baseData;
        } catch (error) {
            console.error('Error generating report data:', error);
            // Return basic data if database query fails
            return {
                reportId: report.id || 2,
                reportType: reportType.toUpperCase(),
                asicExtractType: 'Current',
                companyName: 'Company Name Not Available',
                abn: report.abn || 'N/A',
                acn: 'N/A',
                asicStatus: 'Unknown',
                abnStatus: 'Unknown',
                gstStatus: 'Unknown',
                companyType: 'Unknown',
                registrationDate: 'N/A',
                reviewDate: 'N/A',
                registeredState: 'N/A',
                reportDate: new Date().toLocaleDateString('en-AU'),
                hasTaxDebt: false,
                taxDebtAmount: '$0.00',
                taxDebtDate: 'N/A',
                addresses: [],
                contactAddresses: [],
                totalAddresses: 0,
                directors: [],
                secretaries: [],
                shareholders: [],
                shareStructures: [],
                asicDocuments: [],
                totalDocuments: 0,
                currentYearFilings: 0,
                uniqueFormTypes: 0,
                dateRange: 'N/A',
                ownershipConcentration: 'N/A',
                totalShareCapital: '0.00'
            };
        } finally {
            // Don't close the shared connection
        }
    }

    // Generate court report data
    async generateCourtReportData(report, reportId, sequelize) {
        try {
            console.log('🏛️ Generating COURT report data for report ID:', reportId);
            
            // Get entity data (company name, ACN, ABN)
            const [entities] = await sequelize.query(`
                SELECT * FROM entities 
                WHERE report_id = ${reportId} 
                LIMIT 1
            `);
            
            console.log('🔍 Court Report - Entities found:', entities.length);
            const entity = entities[0] || {};
            
            // Get cases data
            const [cases] = await sequelize.query(`
                SELECT * FROM cases 
                WHERE report_id = ${reportId}
                ORDER BY notification_time DESC
            `);
            
            console.log('🔍 Court Report - Cases found:', cases.length);
            const caseData = cases[0] || {}; // Use the first case for now
            
            // Get case parties
            const [caseParties] = await sequelize.query(`
                SELECT * FROM case_parties 
                WHERE report_id = ${reportId}
                ORDER BY created_at DESC
            `);
            console.log('🔍 Court Report - Case Parties found:', caseParties.length);
            
            // Get case documents
            const [caseDocuments] = await sequelize.query(`
                SELECT * FROM case_documents 
                WHERE report_id = ${reportId}
                ORDER BY datetime DESC
            `);
            console.log('🔍 Court Report - Case Documents found:', caseDocuments.length);
            
            // Get case hearings
            const [caseHearings] = await sequelize.query(`
                SELECT * FROM case_hearings 
                WHERE report_id = ${reportId}
                ORDER BY datetime DESC
            `);
            console.log('🔍 Court Report - Case Hearings found:', caseHearings.length);
            
            // Get case judgments
            const [caseJudgments] = await sequelize.query(`
                SELECT * FROM case_judgments 
                WHERE report_id = ${reportId}
                ORDER BY date DESC
            `);
            console.log('🔍 Court Report - Case Judgments found:', caseJudgments.length);
            
            // Get case applications
            const [caseApplications] = await sequelize.query(`
                SELECT * FROM case_applications 
                WHERE report_id = ${reportId}
                ORDER BY date_filed DESC
            `);
            console.log('🔍 Court Report - Case Applications found:', caseApplications.length);
            
            // Get insolvencies data
            const [insolvencies] = await sequelize.query(`
                SELECT * FROM insolvencies 
                WHERE report_id = ${reportId}
                ORDER BY notification_time DESC
            `);
            console.log('🔍 Court Report - Insolvencies found:', insolvencies.length);
            const insolvencyData = insolvencies[0] || {};
            
            // Get insolvency parties
            const [insolvencyParties] = await sequelize.query(`
                SELECT * FROM insolvency_parties 
                WHERE report_id = ${reportId}
                ORDER BY created_at DESC
            `);
            console.log('🔍 Court Report - Insolvency Parties found:', insolvencyParties.length);
            
            // Helper function to format dates as DD-MM-YYYY
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                try {
                    const date = new Date(dateString);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                } catch (error) {
                    return 'N/A';
                }
            };

            const courtReportData = {
                // Report Information
                reportId: reportId,
                generatedDate: new Date().toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                searchKey: report.searchKey || 'N/A',
                
                // Company Information from entities table
                companyName: entity.name || 'Company Name Not Available',
                abn: entity.abn || report.abn || 'N/A',
                acn: entity.acn || 'N/A',
                
                // Case Information
                caseNumber: caseData.case_number || 'N/A',
                caseName: caseData.case_name || 'N/A',
                courtName: caseData.court_name || 'N/A',
                courtType: caseData.court_type || 'N/A',
                caseType: caseData.case_type || 'N/A',
                jurisdiction: caseData.jurisdiction || 'N/A',
                state: caseData.state || 'N/A',
                suburb: caseData.suburb || 'N/A',
                
                // Parties Information
                totalParties: caseData.total_parties || 'N/A',
                name: caseData.name || 'N/A',
                otherNames: caseData.other_names || 'N/A',
                
                // Case Details
                notificationTime: caseData.notification_time ? 
                    formatDate(caseData.notification_time) : 'N/A',
                nextHearingDate: caseData.next_hearing_date ? 
                    formatDate(caseData.next_hearing_date) : 'N/A',
                totalDocuments: caseData.total_documents || 'N/A',
                totalHearings: caseData.total_hearings || 'N/A',
                internalReference: caseData.internal_reference || 'N/A',
                insolvencyRiskFactor: caseData.insolvency_risk_factor || 'N/A',
                matchOn: caseData.match_on || 'N/A',
                
                // Case Parties Data
                caseParties: caseParties.map(party => ({
                    ...party,
                    datetime: party.datetime ? formatDate(party.datetime) : 'N/A'
                })),
                
                // Case Documents Data
                caseDocuments: caseDocuments.map(doc => ({
                    ...doc,
                    datetime: doc.datetime ? formatDate(doc.datetime) : 'N/A',
                    time: doc.datetime ? new Date(doc.datetime).toLocaleTimeString('en-AU', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }) : 'N/A'
                })),
                
                // Case Hearings Data
                caseHearings: caseHearings.map(hearing => ({
                    ...hearing,
                    datetime: hearing.datetime ? formatDate(hearing.datetime) : 'N/A',
                    time: hearing.datetime ? new Date(hearing.datetime).toLocaleTimeString('en-AU', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }) : 'N/A'
                })),
                
                // Case Judgments Data
                caseJudgments: caseJudgments.map(judgment => ({
                    ...judgment,
                    date: judgment.date ? formatDate(judgment.date) : 'N/A'
                })),
                
                // Case Applications Data
                caseApplications: caseApplications.map(app => ({
                    ...app,
                    dateFiled: app.date_filed ? formatDate(app.date_filed) : 'N/A',
                    dateFinalised: app.date_finalised ? formatDate(app.date_finalised) : 'N/A'
                })),
                
                // Insolvency Data
                insolvencyData: {
                    ...insolvencyData,
                    notificationTime: insolvencyData.notification_time ? 
                        formatDate(insolvencyData.notification_time) : 'N/A'
                },
                
                // Insolvency Parties Data
                insolvencyParties: insolvencyParties.map(party => ({
                    ...party,
                    datetime: party.datetime ? formatDate(party.datetime) : 'N/A'
                })),
                
                // Summary counts
                totalCaseParties: caseParties.length,
                totalCaseDocuments: caseDocuments.length,
                totalCaseHearings: caseHearings.length,
                totalCaseJudgments: caseJudgments.length,
                totalCaseApplications: caseApplications.length,
                totalInsolvencies: insolvencies.length,
                totalInsolvencyParties: insolvencyParties.length
            };

            console.log('🔍 Court Report Data:', {
                companyName: courtReportData.companyName,
                abn: courtReportData.abn,
                acn: courtReportData.acn,
                caseNumber: courtReportData.caseNumber,
                caseName: courtReportData.caseName
            });

            return courtReportData;
            
        } catch (error) {
            console.error('Error generating court report data:', error);
            // Return basic data if database query fails
            return {
                reportId: reportId,
                generatedDate: new Date().toLocaleDateString('en-AU'),
                searchKey: 'N/A',
                companyName: 'Company Name Not Available',
                abn: 'N/A',
                acn: 'N/A',
                caseNumber: 'N/A',
                caseName: 'N/A',
                courtName: 'N/A',
                courtType: 'N/A',
                caseType: 'N/A',
                jurisdiction: 'N/A',
                state: 'N/A',
                suburb: 'N/A',
                totalParties: 'N/A',
                name: 'N/A',
                otherNames: 'N/A',
                notificationTime: 'N/A',
                nextHearingDate: 'N/A',
                totalDocuments: 'N/A',
                totalHearings: 'N/A',
                internalReference: 'N/A',
                insolvencyRiskFactor: 'N/A',
                matchOn: 'N/A'
            };
        }
    }
}

module.exports = new PDFGenerator();
