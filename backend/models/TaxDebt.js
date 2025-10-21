const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaxDebt = sequelize.define('TaxDebt', {
    taxDebtId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'tax_debt_id'
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
    date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date'
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'amount'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status'
    },
    atoAddedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ato_added_at'
    },
    atoUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ato_updated_at'
    }
}, {
    tableName: 'tax_debts',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['report_id']
        }
    ]
});

module.exports = TaxDebt;
