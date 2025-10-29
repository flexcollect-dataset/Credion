const { sequelize } = require('./backend/config/db');

async function clearTables() {
  try {
    console.log('🗑️  Clearing tables...');
    
    // Clear in correct order to avoid foreign key constraints
    await sequelize.query('DELETE FROM user_reports');
    console.log('✅ user_reports cleared');
    
    await sequelize.query('DELETE FROM entities');
    console.log('✅ entities cleared');
    
    await sequelize.query('DELETE FROM reports');
    console.log('✅ reports cleared');
    
    console.log('🎉 All tables cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing tables:', error.message);
    process.exit(1);
  }
}

clearTables();
