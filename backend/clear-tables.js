const { sequelize } = require('./config/db');

async function clearAllTables() {
  try {
    console.log('🧹 Clearing all tables...');
    
    // Clear tables in correct order (respecting foreign key constraints)
    await sequelize.query('DELETE FROM user_reports');
    console.log('✅ Cleared user_reports table');
    
    await sequelize.query('DELETE FROM addresses');
    console.log('✅ Cleared addresses table');
    
    await sequelize.query('DELETE FROM directors');
    console.log('✅ Cleared directors table');
    
    await sequelize.query('DELETE FROM shareholders');
    console.log('✅ Cleared shareholders table');
    
    await sequelize.query('DELETE FROM secretaries');
    console.log('✅ Cleared secretaries table');
    
    await sequelize.query('DELETE FROM office_holders');
    console.log('✅ Cleared office_holders table');
    
    await sequelize.query('DELETE FROM share_structures');
    console.log('✅ Cleared share_structures table');
    
    await sequelize.query('DELETE FROM documents');
    console.log('✅ Cleared documents table');
    
    await sequelize.query('DELETE FROM asic_extracts');
    console.log('✅ Cleared asic_extracts table');
    
    await sequelize.query('DELETE FROM entities');
    console.log('✅ Cleared entities table');
    
    await sequelize.query('DELETE FROM cases');
    console.log('✅ Cleared cases table');
    
    await sequelize.query('DELETE FROM insolvencies');
    console.log('✅ Cleared insolvencies table');
    
    await sequelize.query('DELETE FROM tax_debts');
    console.log('✅ Cleared tax_debts table');
    
    await sequelize.query('DELETE FROM reports');
    console.log('✅ Cleared reports table');
    
    await sequelize.query('DELETE FROM matters');
    console.log('✅ Cleared matters table');
    
    console.log('🎉 All tables cleared successfully!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing tables:', error);
    process.exit(1);
  }
}

clearAllTables();
