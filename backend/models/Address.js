const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
    addressId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'address_id'
    },
    asicExtractId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'asic_extract_id',
        references: {
            model: 'asic_extracts',
            key: 'asic_extract_id'
        }
    },
    externalId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'external_id'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    entity: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'entity'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'address'
    },
    careOf: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'care_of'
    },
    address1: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'address_1'
    },
    address2: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'address_2'
    },
    suburb: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'suburb'
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'state'
    },
    postcode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'postcode'
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'country'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'end_date'
    },
    documentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'document_number'
    }
}, {
    tableName: 'addresses',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['asic_extract_id']
        },
        {
            fields: ['external_id']
        }
    ]
});

module.exports = Address;
