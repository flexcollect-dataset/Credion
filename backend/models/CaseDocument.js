const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CaseDocument = sequelize.define('CaseDocument', {
    caseDocumentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'case_document_id'
    },
    caseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'case_id',
        references: {
            model: 'cases',
            key: 'case_id'
        }
    },
    datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'datetime'
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'title'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description'
    },
    filedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'filed_by'
    }
}, {
    tableName: 'case_documents',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['case_id']
        },
        {
            fields: ['datetime']
        }
    ]
});

module.exports = CaseDocument;

