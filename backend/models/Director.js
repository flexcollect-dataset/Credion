const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Director = sequelize.define('Director', {
    directorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'director_id'
    },
    asicExtractId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'asic_extract_id',
        references: {
            model: 'asic_extracts',
            key: 'asic_extract_id'
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'name'
    },
    dob: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'dob'
    },
    placeOfBirth: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'place_of_birth'
    },
    directorIdExternal: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'director_id_external'
    },
    documentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'document_number'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'end_date'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status'
    },
    addressData: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'address_data'
    }
}, {
    tableName: 'directors',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['asic_extract_id']
        },
        {
            fields: ['name']
        }
    ]
});

module.exports = Director;
