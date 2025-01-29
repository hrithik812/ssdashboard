'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDashboard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserDashboard.belongsTo(models.DashboardInfo, {
        foreignKey: 'dashboardId', // The foreign key in UserDashboard
        onDelete: 'CASCADE', // Optional: Delete UserDashboard when DashboardInfo is deleted
        onUpdate: 'CASCADE', // Optional: Update UserDashboard when DashboardInfo is updated
      });
    }
    }
  
  UserDashboard.init({
    userId: DataTypes.INTEGER,
    dashboardId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserDashboard',
  });
  return UserDashboard;
};