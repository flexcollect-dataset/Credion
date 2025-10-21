const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShareStructure = sequelize.define('ShareStructure', {
    shareStructureId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'share_structure_id'
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
    classCode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'class_code'
    },
    classDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'class_description'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status'
    },
    shareCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'share_count'
    },
    amountPaid: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'amount_paid'
    },
    amountDue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'amount_due'
    },
    documentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'document_number'
    }
}, {
    tableName: 'share_structures',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['asic_extract_id']
        }
    ]
});

module.exports = ShareStructure;
