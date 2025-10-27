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
    asicType: {
        type: DataTypes.ENUM('current', 'historical'),
        allowNull: false,
        field: 'asic_type'
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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        field: 'user_id'
    },
}, {
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
        {
            fields: ['uuid']
        },
        {
            fields: ['user_id', 'matter_id']
        }
    ]
});

module.exports = Report;
