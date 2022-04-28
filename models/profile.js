'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate (models) {
      models.User.hasOne(Profile, { foreignKey: 'userId' })
      Profile.belongsTo(models.User, { foreignKey: 'userId' })
    }
  };
  Profile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER
    },
    occupation: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Profile'
  })
  return Profile
}
