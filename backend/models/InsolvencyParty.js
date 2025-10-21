const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InsolvencyParty = sequelize.define('InsolvencyParty', {
    insolvencyPartyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'insolvency_party_id'
    },
    insolvencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'insolvency_id',
        references: {
            model: 'insolvencies',
            key: 'insolvency_id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'name'
    },
    acn: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'acn'
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'url'
    }
}, {
    tableName: 'insolvency_parties',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['insolvency_id']
        },
        {
            fields: ['acn']
        }
    ]
});

module.exports = InsolvencyParty;

