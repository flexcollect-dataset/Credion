const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserPaymentMethod = sequelize.define('UserPaymentMethod', {
    paymentMethodId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'payment_method_id'
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
    stripeCustomerId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'stripe_customer_id'
    },
    stripePaymentMethodId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'stripe_payment_method_id'
    },
    cardBrand: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'card_brand',
        comment: 'e.g., visa, mastercard, amex'
    },
    cardLast4: {
        type: DataTypes.STRING(4),
        allowNull: true,
        field: 'card_last4'
    },
    cardExpMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'card_exp_month'
    },
    cardExpYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'card_exp_year'
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_default'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'user_payment_methods',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});

module.exports = UserPaymentMethod;

