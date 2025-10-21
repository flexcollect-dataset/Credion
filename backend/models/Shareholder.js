const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Shareholder = sequelize.define('Shareholder', {
    shareholderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'shareholder_id'
    },
    asicExtractId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'asic_extract_id',
        references: {
            model: 'asic_extracts',
            key: 'asic_extract_id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'name'
    },
    acn: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'acn'
    },
    class: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'class'
    },
    numberHeld: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'number_held'
    },
    percentageHeld: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'percentage_held'
    },
    documentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'document_number'
    },
    beneficiallyOwned: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'beneficially_owned'
    },
    fullyPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'fully_paid'
    },
    jointlyHeld: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'jointly_held'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status'
    },
    addressData: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'address_data'
    }
}, {
    tableName: 'shareholders',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['asic_extract_id']
        },
        {
            fields: ['name']
        }
    ]
});

module.exports = Shareholder;
