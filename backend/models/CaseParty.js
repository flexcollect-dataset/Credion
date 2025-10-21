const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CaseParty = sequelize.define('CaseParty', {
    casePartyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'case_party_id'
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
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'name'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'role'
    },
    offence: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'offence'
    },
    plea: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'plea'
    },
    representativeFirm: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'representative_firm'
    },
    representativeName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'representative_name'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'address'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'phone'
    },
    fax: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'fax'
    },
    abn: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abn'
    },
    acn: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'acn'
    }
}, {
    tableName: 'case_parties',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['case_id']
        },
        {
            fields: ['acn']
        }
    ]
});

module.exports = CaseParty;

