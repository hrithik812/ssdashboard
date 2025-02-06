'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DashboardInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DashboardInfo.hasMany(models.UserDashboard, {
        foreignKey: 'dashboardId', // Foreign key in UserDashboard
      });
    }
  }
  DashboardInfo.init({
    name: DataTypes.STRING,
    link: DataTypes.STRING,
    priority:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DashboardInfo',
  });
  return DashboardInfo;
};