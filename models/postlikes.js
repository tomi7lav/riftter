'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class PostLikes extends Model {
    static associate (models) {
      models.Post.belongsToMany(models.User, { through: PostLikes, foreignKey: 'postId' })
      models.User.belongsToMany(models.Post, { through: PostLikes, foreignKey: 'userId' })
    }
  };
  PostLikes.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PostLikes'
  })
  return PostLikes
}
