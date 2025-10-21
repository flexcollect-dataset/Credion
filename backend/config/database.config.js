require('dotenv').config();

module.exports = {
    development: {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'FlexDataseterMaster',
        username: process.env.DB_USER || 'FlexUser',
        password: process.env.DB_PASS || 'Luffy123&&Lucky',
        port: process.env.DB_PORT || 15432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: false
        }
    },
    production: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    },
    bolt: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
};

