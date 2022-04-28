'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate (models) {
      models.User.hasMany(Post, { foreignKey: 'authorId' })
      Post.belongsTo(models.User, { foreignKey: 'authorId' })
    }
  };
  Post.init({
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Post'
  })
  return Post
}
