const { sequelize, User, RefreshToken, PasswordResetToken, UserPaymentMethod, Matter, Report } = require('../models');

async function initDatabase() {
    try {
        console.log('🔄 Connecting to PostgreSQL database...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models (create tables if they don't exist)
        console.log('🔄 Creating/Syncing tables...');
        
        // Sync in order to respect foreign key constraints
        await User.sync({ alter: true });
        console.log('✅ Users table created/synced');
        
        await RefreshToken.sync({ alter: true });
        console.log('✅ RefreshTokens table created/synced');
        
        await PasswordResetToken.sync({ alter: true });
        console.log('✅ PasswordResetTokens table created/synced');
        
        await UserPaymentMethod.sync({ alter: true });
        console.log('✅ UserPaymentMethods table created/synced');
        
        await Matter.sync({ alter: true });
        console.log('✅ Matters table created/synced');
        
        await Report.sync({ alter: false });
        console.log('✅ Reports table created/synced');

        console.log('✅ All tables created/synced successfully!');
        console.log('\n📊 Database Schema:');
        console.log('  - users');
        console.log('  - refresh_tokens');
        console.log('  - password_reset_tokens');
        console.log('  - user_payment_methods');
        console.log('  - Matters');
        console.log('  - Reports');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;

