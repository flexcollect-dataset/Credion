const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Licence = sequelize.define('Licence', {
    licenceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'licence_id'
    },
    reportId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'report_id',
        references: {
            model: 'reports',
            key: 'report_id'
        }
    },
    licenceData: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'licence_data'
    }
}, {
    tableName: 'licences',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['report_id']
        }
    ]
});

module.exports = Licence;
