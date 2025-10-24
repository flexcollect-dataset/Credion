const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Entity = sequelize.define('Entity', {
    entityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'entity_id'
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
    abn: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'abn'
    },
    acn: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'acn'
    },
    isArbn: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'is_arbn'
    },
    abrGstRegistrationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'abr_gst_registration_date'
    },
    abrGstStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abr_gst_status'
    },
    abrPostcode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abr_postcode'
    },
    abrState: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abr_state'
    },
    abrStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'abr_status'
    },
    asicDateOfRegistration: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'asic_date_of_registration'
    },
    asicStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'asic_status'
    },
    documentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'document_number'
    },
    formerNames: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'former_names'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'name'
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reference'
    },
    reviewDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'review_date'
    },
    nameStartAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'name_start_at'
    },
    registeredIn: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'registered_in'
    },
    organisationType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'organisation_type'
    },
    disclosingEntity: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'disclosing_entity'
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
}, {
    tableName: 'entities',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['abn']
        },
        {
            fields: ['report_id']
        }
    ]
});

module.exports = Entity;
