const { Sequelize } = require('sequelize');
const dbConfig = require('./database.config');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: config.pool,
        dialectOptions: config.dialectOptions
    }
);

// Test database connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Database connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        return false;
    }
}

module.exports = {
    sequelize,
    testConnection
};