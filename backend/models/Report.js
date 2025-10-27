const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
    reportId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'report_id'
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'uuid'
    },
    abn: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'abn'
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
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['abn', 'type']
        },
        {
            fields: ['uuid']
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

module.exports = Report;