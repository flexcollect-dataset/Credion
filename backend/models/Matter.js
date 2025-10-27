const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Matter = sequelize.define('Matter', {
  matterId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'matter_id'
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
  matterName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'matter_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'archived'),
    defaultValue: 'active',
    field: 'status'
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
  tableName: 'matters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['matter_name']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Matter;
