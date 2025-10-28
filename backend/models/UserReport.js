const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserReport = sequelize.define('UserReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
            model: 'matters',
            key: 'matter_id'
        },
        field: 'matter_id'
    },
    reportName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'report_name'
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_paid'
    },
    reportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'reports',
            key: 'id'
        },
        field: 'report_id'
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
    tableName: 'user_reports',
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
            fields: ['report_id']
        },
        {
            fields: ['is_paid']
        },
        {
            fields: ['user_id', 'matter_id']
        }
    ]
});

module.exports = UserReport;
