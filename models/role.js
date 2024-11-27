'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Define associations here
      Role.belongsToMany(models.User, {
        through: 'UserRole',
        foreignKey: 'roleId',
      });

      // Many-to-Many: Role ↔ Feature through RoleFeature
      Role.belongsToMany(models.Feature, {
        through: 'RoleFeature',
        foreignKey: 'roleId',
      });
    }
  }
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Role',
    }
  );
  return Role;
};
