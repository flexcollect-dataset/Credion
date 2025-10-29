const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    category: {
        type: DataTypes.ENUM('personal', 'organization'),
        allowNull: false,
        field: 'category'
    },
    isCompany: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_company'
    },
    type: {
        type: DataTypes.ENUM('ASIC', 'COURT', 'ATO', 'LAND TITLE', 'PPSR', 'PROPERTY', 'DIRECTOR PPSR', 'DIRECTOR BANKRUPTCY', 'DIRECTOR PROPERTY', 'DIRECTOR RELATED'),
        allowNull: false,
        field: 'type'
    },
    asicType: {
        type: DataTypes.ENUM('Current', 'Historical', 'Personal', 'Company', 'Document Search'),
        allowNull: true,
        field: 'asic_type'
    },
    abn: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'abn'
    },
    searchKey: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'search_key'
    },
    uid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'uid'
    },
    isAlert: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_alert'
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
            fields: ['category']
        },
        {
            fields: ['type']
        },
        {
            fields: ['asic_type']
        },
        {
            fields: ['abn']
        },
        {
            fields: ['uid']
        },
        {
            fields: ['is_alert']
        }
    ]
});

module.exports = Report;