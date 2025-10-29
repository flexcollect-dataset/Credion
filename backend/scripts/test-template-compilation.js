const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

async function testTemplateCompilation() {
    try {
        console.log('🔍 Testing PPSR Template Compilation...\n');
        
        // Load the template
        const templatePath = path.join(__dirname, '..', 'templates', 'PPSR-report-dynamic.html');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        
        console.log('✅ Template loaded successfully');
        console.log(`   Template size: ${templateContent.length} characters`);
        
        // Compile the template
        const template = handlebars.compile(templateContent);
        console.log('✅ Template compiled successfully');
        
        // Test data
        const testData = {
            reportId: 'TEST-123',
            business: {
                Name: 'Test Company Pty Ltd',
                Abn: '72111458998'
            },
            abn: '72111458998',
            generatedAt: new Date().toISOString(),
            ppsrData: {
                search: {
                    customer_request_id: 'test-001',
                    client_reference: 'Test Company Search',
                    au_search_identifier: 'test-identifier-123'
                },
                grantors: [
                    {
                        grantor_type: 'organisation',
                        organisation_number: '111458998',
                        individual_name: null,
                        address_line1: '123 Test Street',
                        suburb: 'Test City',
                        state: 'NSW',
                        postcode: '2000'
                    }
                ],
                securityInterests: [
                    {
                        registration_number: 'REG-001',
                        registration_date: new Date().toISOString(),
                        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'active',
                        collateral_type: 'Commercial property - Motor vehicle',
                        collateral_description: 'Test vehicle security interest',
                        secured_party_name: 'Test Bank Ltd',
                        priority_amount: 50000.00,
                        priority_currency: 'AUD'
                    },
                    {
                        registration_number: 'REG-002',
                        registration_date: new Date().toISOString(),
                        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'active',
                        collateral_type: 'All present and after-acquired property',
                        collateral_description: 'Blanket security interest',
                        secured_party_name: 'Another Bank Ltd',
                        priority_amount: 100000.00,
                        priority_currency: 'AUD'
                    }
                ],
                financingStatements: [],
                amendments: [],
                events: [],
                rawData: []
            }
        };
        
        console.log('📋 Test Data:');
        console.log(`   Company: ${testData.business.Name}`);
        console.log(`   ABN: ${testData.business.Abn}`);
        console.log(`   Report ID: ${testData.reportId}`);
        console.log(`   Security Interests: ${testData.ppsrData.securityInterests.length}`);
        console.log(`   Grantors: ${testData.ppsrData.grantors.length}\n`);
        
        // Render the template
        console.log('🔍 Rendering template with test data...');
        const html = template(testData);
        
        console.log('✅ Template rendered successfully');
        console.log(`   Output size: ${html.length} characters`);
        
        // Save the rendered HTML for inspection
        const outputPath = path.join(__dirname, '..', 'pdfs', `PPSR_TEST_${Date.now()}.html`);
        fs.writeFileSync(outputPath, html);
        
        console.log(`✅ Rendered HTML saved: ${outputPath}`);
        console.log('📄 You can open this HTML file in a browser to verify the dynamic content is working correctly.');
        
        // Check for dynamic content
        const hasCompanyName = html.includes('Test Company Pty Ltd');
        const hasSecurityInterests = html.includes('REG-001') && html.includes('REG-002');
        const hasReportId = html.includes('TEST-123');
        
        console.log('\n📊 Dynamic Content Verification:');
        console.log(`   Company Name: ${hasCompanyName ? '✅' : '❌'}`);
        console.log(`   Security Interests: ${hasSecurityInterests ? '✅' : '❌'}`);
        console.log(`   Report ID: ${hasReportId ? '✅' : '❌'}`);
        
        if (hasCompanyName && hasSecurityInterests && hasReportId) {
            console.log('\n🎉 Template compilation and rendering test PASSED!');
        } else {
            console.log('\n⚠️ Template compilation test had issues with dynamic content');
        }
        
    } catch (error) {
        console.error('❌ Template Compilation Test Failed:', error.message);
        console.error('Full error:', error);
    }
}

// Run if called directly
if (require.main === module) {
    testTemplateCompilation()
        .then(() => {
            console.log('✅ Template compilation test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Template compilation test failed:', error);
            process.exit(1);
        });
}

module.exports = testTemplateCompilation;
