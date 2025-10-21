const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
    documentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'document_id'
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
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description'
    },
    documentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'document_number'
    },
    formCode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'form_code'
    },
    pageCount: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'page_count'
    },
    effectiveAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'effective_at'
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
    },
    receivedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'received_at'
    }
}, {
    tableName: 'documents',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['asic_extract_id']
        },
        {
            fields: ['document_number']
        }
    ]
});

module.exports = Document;
