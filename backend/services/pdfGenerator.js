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
            
            // Use the report ID from the report object - use reportId field first, then id
            const reportId = report.reportId || report.id;
            console.log('🔍 Using Report ID for queries:', reportId);
            
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

            // Get ASIC extract first to get the asic_extract_id
            const [asicExtracts] = await sequelize.query(`
                SELECT * FROM asic_extracts 
                WHERE report_id = ${reportId}
                LIMIT 1
            `);
            
            const asicExtractId = asicExtracts[0]?.asic_extract_id;
            console.log('🔍 ASIC Extract ID:', asicExtractId);
            
            // Get addresses using the correct asic_extract_id
            const [addresses] = await sequelize.query(`
                SELECT * FROM addresses 
                WHERE asic_extract_id = '${asicExtractId}'
                ORDER BY start_date DESC
            `);

            // Get contact addresses (handle missing table gracefully)
            let contactAddresses = [];
            try {
                const [contactAddressesResult] = await sequelize.query(`
                    SELECT * FROM contact_addresses 
                    WHERE asic_extract_id = '${asicExtractId}'
                    ORDER BY start_date DESC
                `);
                contactAddresses = contactAddressesResult;
            } catch (error) {
                console.log('⚠️ contact_addresses table does not exist, using empty array');
                contactAddresses = [];
            }

            // Get directors
            const [directors] = await sequelize.query(`
                SELECT * FROM directors 
                WHERE asic_extract_id = '${asicExtractId}'
                AND status = 'Current'
                ORDER BY start_date DESC
            `);

            // Get shareholders
            const [shareholders] = await sequelize.query(`
                SELECT * FROM shareholders 
                WHERE asic_extract_id = '${asicExtractId}'
                AND status = 'Current'
                ORDER BY number_held DESC
            `);

            // Get share structures
            const [shareStructures] = await sequelize.query(`
                SELECT * FROM share_structures 
                WHERE asic_extract_id = '${asicExtractId}'
                ORDER BY share_count DESC
            `);

            // Get tax debts
            const [taxDebts] = await sequelize.query(`
                SELECT * FROM tax_debts 
                WHERE report_id = ${reportId}
                ORDER BY amount DESC
                LIMIT 1
            `);

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
            } catch (error) {
                console.log('⚠️ asic_documents table error, using empty array:', error.message);
                asicDocuments = [];
            }

            const entity = entities[0] || {};
            const taxDebt = taxDebts[0];

            // Calculate ASIC Documents stats
            const totalDocuments = asicDocuments.length;
            const currentYear = new Date().getFullYear();
            const currentYearFilings = asicDocuments.filter(doc => {
                const docYear = new Date(doc.date_received).getFullYear();
                return docYear === currentYear;
            }).length;
            
            // Get unique form types
            const uniqueFormTypes = [...new Set(asicDocuments.map(doc => doc.form_type))].length;
            
            // Calculate date range
            const dates = asicDocuments.map(doc => new Date(doc.date_received)).sort((a, b) => a - b);
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

            // Get ASIC extract type from the asic_extracts table
            const [asicExtractTypes] = await sequelize.query(`
                SELECT type FROM asic_extracts 
                WHERE report_id = ${reportId}
                LIMIT 1
            `);
            const asicExtractType = asicExtractTypes[0]?.type || 'Current';

            // Get secretaries count
            const [secretaries] = await sequelize.query(`
                SELECT * FROM directors 
                WHERE asic_extract_id = '${asicExtractId}'
                AND type = 'Secretary'
                AND status = 'Current'
                ORDER BY start_date DESC
            `);

            // Calculate total addresses (addresses + contact_addresses)
            const totalAddresses = (addresses?.length || 0) + (contactAddresses?.length || 0);

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
                hasTaxDebt: !!taxDebt,
                taxDebtAmount: taxDebt ? `$${parseFloat(taxDebt.amount).toLocaleString()}` : '$0.00',
                taxDebtDate: taxDebt ? 
                    new Date(taxDebt.date_updated).toLocaleDateString('en-AU') : 'N/A',
                addresses: addresses || [],
                contactAddresses: contactAddresses || [],
                totalAddresses: totalAddresses,
                directors: directors || [],
                secretaries: secretaries || [],
                shareholders: shareholders || [],
                shareStructures: shareStructures || [],
                asicDocuments: asicDocuments || [],
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
}

module.exports = new PDFGenerator();
