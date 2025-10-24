const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AsicDocument = sequelize.define('AsicDocument', {
    asicDocumentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'asic_document_id'
    },
    reportId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'report_id',
        references: {
            model: 'reports',
            key: 'report_id'
        }
    },
    documentData: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'document_data'
    }
}, {
    tableName: 'asic_documents',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['report_id']
        }
    ]
});

module.exports = AsicDocument;
