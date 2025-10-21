const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Case = sequelize.define('Case', {
    caseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'case_id'
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
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'state'
    },
    courtType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'court_type'
    },
    caseType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'case_type'
    },
    caseNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'case_number'
    },
    jurisdiction: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'jurisdiction'
    },
    suburb: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'suburb'
    },
    nextHearingDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'next_hearing_date'
    },
    caseName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'case_name'
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'url'
    },
    totalParties: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_parties'
    },
    totalDocuments: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_documents'
    },
    totalHearings: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_hearings'
    },
    timezone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'timezone'
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
    partyRole: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'party_role'
    },
    mostRecentEvent: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'most_recent_event'
    },
    matchOn: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'match_on'
    }
}, {
    tableName: 'cases',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['report_id']
        },
        {
            fields: ['uuid']
        },
        {
            fields: ['case_number']
        }
    ]
});

module.exports = Case;

