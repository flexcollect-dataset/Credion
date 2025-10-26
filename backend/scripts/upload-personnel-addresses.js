const { sequelize } = require('../config/db');

async function uploadPersonnelAddresses() {
    try {
        console.log('🚀 Starting personnel addresses upload...');

        // Director addresses
        const directorAddresses = [
            {
                asic_extract_id: 18,
                type: "Director",
                entity: 'Direct',
                address: "3 TYAGARAH STREET O'MALLEY 2606 ACT",
                care_of: null,
                address_1: "3 TYAGARAH STREET",
                address_2: null,
                suburb: "O'MALLEY",
                state: "ACT",
                postcode: "2606",
                country: null,
                status: null,
                start_date: null,
                end_date: null,
                document_number: "7E5398450",
                address_category: 'director'
            },
            {
                asic_extract_id: 18,
                type: "Director",
                entity: 'Direct',
                address: "3 TYAGARAH STREET O'MALLEY 2606 ACT",
                care_of: null,
                address_1: "3 TYAGARAH STREET",
                address_2: null,
                suburb: "O'MALLEY",
                state: "ACT",
                postcode: "2606",
                country: null,
                status: null,
                start_date: null,
                end_date: null,
                document_number: "7E5398450",
                address_category: 'director'
            }
        ];

        // Secretary addresses
        const secretaryAddresses = [
            {
                asic_extract_id: 18,
                type: "Secretary",
                entity: 'Direct',
                address: "3 TYAGARAH STREET O'MALLEY 2606 ACT",
                care_of: null,
                address_1: "3 TYAGARAH STREET",
                address_2: null,
                suburb: "O'MALLEY",
                state: "ACT",
                postcode: "2606",
                country: null,
                status: null,
                start_date: null,
                end_date: null,
                document_number: "7E5398450",
                address_category: 'secretary'
            }
        ];

        // Shareholder addresses
        const shareholderAddresses = [
            {
                asic_extract_id: 18,
                type: "Shareholder",
                entity: 'Direct',
                address: "11 FITZROY STREET 'BATES & PICKERING' LEVEL 1 FORREST 2603 ACT",
                care_of: null,
                address_1: "11 FITZROY STREET",
                address_2: "'BATES & PICKERING' LEVEL 1",
                suburb: "FORREST",
                state: "ACT",
                postcode: "2603",
                country: null,
                status: null,
                start_date: null,
                end_date: null,
                document_number: "7E5398450",
                address_category: 'shareholder'
            }
        ];

        // Insert director addresses
        console.log('📝 Inserting director addresses...');
        for (const addr of directorAddresses) {
            await sequelize.query(`
                INSERT INTO addresses (
                    asic_extract_id, type, entity, address, care_of, address_1, address_2,
                    suburb, state, postcode, country, status, start_date, end_date,
                    document_number, address_category
                ) VALUES (
                    ${addr.asic_extract_id}, ${addr.type ? `'${addr.type.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.entity}', '${addr.address.replace(/'/g, "''")}', ${addr.care_of ? `'${addr.care_of.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.address_1.replace(/'/g, "''")}', ${addr.address_2 ? `'${addr.address_2.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.suburb.replace(/'/g, "''")}', '${addr.state}', '${addr.postcode}', 
                    ${addr.country ? `'${addr.country.replace(/'/g, "''")}'` : 'NULL'}, ${addr.status ? `'${addr.status.replace(/'/g, "''")}'` : 'NULL'}, 
                    ${addr.start_date ? `'${addr.start_date}'` : 'NULL'}, ${addr.end_date ? `'${addr.end_date}'` : 'NULL'}, 
                    ${addr.document_number ? `'${addr.document_number}'` : 'NULL'}, 
                    '${addr.address_category}'
                )
            `);
        }

        // Insert secretary addresses
        console.log('📝 Inserting secretary addresses...');
        for (const addr of secretaryAddresses) {
            await sequelize.query(`
                INSERT INTO addresses (
                    asic_extract_id, type, entity, address, care_of, address_1, address_2,
                    suburb, state, postcode, country, status, start_date, end_date,
                    document_number, address_category
                ) VALUES (
                    ${addr.asic_extract_id}, ${addr.type ? `'${addr.type.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.entity}', '${addr.address.replace(/'/g, "''")}', ${addr.care_of ? `'${addr.care_of.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.address_1.replace(/'/g, "''")}', ${addr.address_2 ? `'${addr.address_2.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.suburb.replace(/'/g, "''")}', '${addr.state}', '${addr.postcode}', 
                    ${addr.country ? `'${addr.country.replace(/'/g, "''")}'` : 'NULL'}, ${addr.status ? `'${addr.status.replace(/'/g, "''")}'` : 'NULL'}, 
                    ${addr.start_date ? `'${addr.start_date}'` : 'NULL'}, ${addr.end_date ? `'${addr.end_date}'` : 'NULL'}, 
                    ${addr.document_number ? `'${addr.document_number}'` : 'NULL'}, 
                    '${addr.address_category}'
                )
            `);
        }

        // Insert shareholder addresses
        console.log('📝 Inserting shareholder addresses...');
        for (const addr of shareholderAddresses) {
            await sequelize.query(`
                INSERT INTO addresses (
                    asic_extract_id, type, entity, address, care_of, address_1, address_2,
                    suburb, state, postcode, country, status, start_date, end_date,
                    document_number, address_category
                ) VALUES (
                    ${addr.asic_extract_id}, ${addr.type ? `'${addr.type.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.entity}', '${addr.address.replace(/'/g, "''")}', ${addr.care_of ? `'${addr.care_of.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.address_1.replace(/'/g, "''")}', ${addr.address_2 ? `'${addr.address_2.replace(/'/g, "''")}'` : 'NULL'}, 
                    '${addr.suburb.replace(/'/g, "''")}', '${addr.state}', '${addr.postcode}', 
                    ${addr.country ? `'${addr.country.replace(/'/g, "''")}'` : 'NULL'}, ${addr.status ? `'${addr.status.replace(/'/g, "''")}'` : 'NULL'}, 
                    ${addr.start_date ? `'${addr.start_date}'` : 'NULL'}, ${addr.end_date ? `'${addr.end_date}'` : 'NULL'}, 
                    ${addr.document_number ? `'${addr.document_number}'` : 'NULL'}, 
                    '${addr.address_category}'
                )
            `);
        }

        console.log('✅ Personnel addresses uploaded successfully!');
        console.log(`📊 Director addresses: ${directorAddresses.length}`);
        console.log(`📊 Secretary addresses: ${secretaryAddresses.length}`);
        console.log(`📊 Shareholder addresses: ${shareholderAddresses.length}`);

    } catch (error) {
        console.error('❌ Error uploading personnel addresses:', error);
    } finally {
        await sequelize.close();
    }
}

uploadPersonnelAddresses();
