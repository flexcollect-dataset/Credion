const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AsicExtract = sequelize.define('AsicExtract', {
    asicExtractId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'asic_extract_id'
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
    externalId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'external_id'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    }
}, {
    tableName: 'asic_extracts',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['report_id']
        },
        {
            fields: ['external_id']
        }
    ]
});

module.exports = AsicExtract;
