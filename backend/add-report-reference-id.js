const { sequelize } = require('./config/db');

async function addReportReferenceId() {
    try {
        console.log('🔧 Adding report_reference_id column to userreports table...');
        
        // Add the new column
        await sequelize.query(`
            ALTER TABLE userreports 
            ADD COLUMN report_reference_id INTEGER REFERENCES reports(report_id)
        `);
        
        console.log('✅ Column report_reference_id added successfully');
        
        // Add index for better performance
        await sequelize.query(`
            CREATE INDEX idx_userreports_report_reference_id 
            ON userreports(report_reference_id)
        `);
        
        console.log('✅ Index created successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding report_reference_id column:', error.message);
        process.exit(1);
    }
}

addReportReferenceId();
