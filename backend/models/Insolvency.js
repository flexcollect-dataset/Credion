const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Insolvency = sequelize.define('Insolvency', {
    insolvencyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'insolvency_id'
    },
    reportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'report_id',
        references: {
            model: 'reports',
            key: 'report_id'
        }
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'uuid'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    notificationTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'notification_time'
    },
    courtName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'court_name'
    },
    caseType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'case_type'
    },
    caseNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'case_number'
    },
    asicNoticeId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'asic_notice_id'
    },
    caseName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'case_name'
    },
    totalParties: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_parties'
    },
    internalReference: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'internal_reference'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'name'
    },
    otherNames: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'other_names'
    },
    insolvencyRiskFactor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'insolvency_risk_factor'
    },
    matchOn: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'match_on'
    }
}, {
    tableName: 'insolvencies',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['report_id']
        },
        {
            fields: ['uuid']
        }
    ]
});

module.exports = Insolvency;

