const { sequelize } = require('./config/db');

async function clearAllTables() {
  try {
    console.log('🧹 Clearing all tables...');
    
    // List of tables to clear (in correct order for foreign key constraints)
    const tablesToClear = [
      'user_reports',
      'addresses', 
      'directors',
      'shareholders',
      'secretaries',
      'office_holders',
      'share_structures',
      'documents',
      'asic_extracts',
      'entities',
      'cases',
      'insolvencies',
      'tax_debts',
      'reports',
      'matters'
    ];
    
    for (const tableName of tablesToClear) {
      try {
        // Check if table exists first
        const [tableExists] = await sequelize.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          );
        `);
        
        if (tableExists[0].exists) {
          await sequelize.query(`DELETE FROM ${tableName}`);
          console.log(`✅ Cleared ${tableName} table`);
        } else {
          console.log(`⚠️ Table ${tableName} does not exist - skipping`);
        }
      } catch (error) {
        console.log(`⚠️ Error clearing ${tableName}: ${error.message}`);
      }
    }
    
    console.log('🎉 All existing tables cleared successfully!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing tables:', error);
    process.exit(1);
  }
}

clearAllTables();
