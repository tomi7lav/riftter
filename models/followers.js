'use strict'
const {
  Model
} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Followers extends Model {
    static associate (models) {
      models.User.belongsToMany(models.User, {
        foreignKey: 'followingId',
        as: 'following',
        through: Followers
      })

      models.User.belongsToMany(models.User, {
        foreignKey: 'followerId',
        as: 'follower',
        through: Followers
      })
    }
  };

  Followers.init({
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Followers'
  })
  return Followers
}
