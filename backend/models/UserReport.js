const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserReport = sequelize.define('UserReport', {
  reportId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'report_id'
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
  matterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'matters',
      key: 'matter_id'
    },
    field: 'matter_id'
  },
  reportName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'report_name'
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_paid'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'userreports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['matter_id']
    },
    {
      fields: ['user_id', 'matter_id']
    }
  ]
});

module.exports = UserReport;
