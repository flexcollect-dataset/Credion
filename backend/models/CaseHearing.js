const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CaseHearing = sequelize.define('CaseHearing', {
    caseHearingId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'case_hearing_id'
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
    officer: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'officer'
    },
    courtRoom: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'court_room'
    },
    courtName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'court_name'
    },
    courtPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'court_phone'
    },
    courtAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'court_address'
    },
    courtSuburb: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'court_suburb'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    listNo: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'list_no'
    },
    outcome: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'outcome'
    }
}, {
    tableName: 'case_hearings',
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

module.exports = CaseHearing;

