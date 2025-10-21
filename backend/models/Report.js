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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    paymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'payment_intent_id'
    },
    asicType: {
        type: DataTypes.ENUM('current', 'historical'),
        allowNull: false,
        field: 'asic_type'
    },
    reportData: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'report_data'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
    },
    reportCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'report_created_at'
    },
    insolvencyRiskFactor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'insolvency_risk_factor'
    },
    abnStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abn_status'
    },
    abnGstStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abn_gst_status'
    },
    abnGstRegistrationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'abn_gst_registration_date'
    },
    abnPostcode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abn_postcode'
    },
    abnState: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abn_state'
    },
    asicStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'asic_status'
    },
    asicDateOfRegistration: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'asic_date_of_registration'
    },
    organisationType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'organisation_type'
    },
    organisationClass: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'organisation_class'
    },
    organisationSubClass: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'organisation_sub_class'
    },
    disclosingEntity: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'disclosing_entity'
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
