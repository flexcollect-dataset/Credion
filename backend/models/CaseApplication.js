const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CaseApplication = sequelize.define('CaseApplication', {
    caseApplicationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'case_application_id'
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
    title: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'title'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status'
    },
    dateFiled: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_filed'
    },
    dateFinalised: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'date_finalised'
    }
}, {
    tableName: 'case_applications',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['case_id']
        }
    ]
});

module.exports = CaseApplication;

