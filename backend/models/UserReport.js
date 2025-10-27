const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserReport = sequelize.define('UserReport', {
    reportId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'report_id'
    },
    reportReferenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'reports',
            key: 'report_id'
        },
        field: 'report_reference_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        },
        field: 'user_id'
    },
    matterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Matters',
            key: 'matterId'
        },
        field: 'matter_id'
    },
    reportName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'report_name'
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'is_paid'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    asicType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'asic_type'
    },
    subType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'sub_type'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at'
    }
}, {
    tableName: 'userreports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['matter_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['asic_type']
        },
        {
            fields: ['sub_type']
        }
    ]
});

module.exports = UserReport;
