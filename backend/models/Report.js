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
}, {
    tableName: 'reports',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['abn', 'asic_type', 'created_at']
        },
        {
            fields: ['uuid']
        }
    ]
});

module.exports = Report;
