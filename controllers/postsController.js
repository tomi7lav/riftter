const { PostLikes, Post, sequelize } = require('../models')
const { QueryTypes, Op } = require('sequelize')
const { forbiddenRequestError } = require('../utils/errors')

module.exports.getAllFeedPosts = async (req, res) => {
  console.log({ u: req.user })
  try {
    const posts = await sequelize.query(`
      SELECT 
          posts.id, 
          posts.createdAt, 
          posts.authorId, 
          posts.body,
          (SELECT username FROM users WHERE posts.authorId = id) AS username,
          array_remove(array_agg(PostLikes.userId), NULL) AS likes
      FROM posts
      LEFT JOIN PostLikes ON posts.id = PostLikes.postId 
      WHERE authorId IN ( 
          SELECT followingId FROM followers WHERE followerId = :followerId
      )
      GROUP BY posts.id, posts.createdAt, posts.authorId, posts.body;
    `, {
      replacements: { followerId: req.user.id },
      type: QueryTypes.SELECT
    })
    res.json(posts)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
}

module.exports.getAllUserPosts = async (req, res) => {
  try {
    const posts = await sequelize.query(`
      SELECT 
          posts.id, 
          posts.createdAt, 
          posts.authorId, 
          posts.body,
          (SELECT username FROM users WHERE posts.authorId = id) AS username,
          array_remove(array_agg(PostLikes.userId), NULL) AS likes
      FROM posts
      LEFT JOIN PostLikes ON posts.id = PostLikes.postId 
      WHERE authorId = :author
      GROUP BY posts.id, posts.createdAt, posts.authorId, posts.body;
    `, {
      replacements: { author: req.params.authorId },
      type: QueryTypes.SELECT
    })

    res.json(posts)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
}

module.exports.createPost = async (req, res) => {
  if (!req.body.text) {
    res.status(400).send('All user fields should be filled')
  }

  try {
    const response = await Post.create({ body: req.body.text, authorId: req.user.id })
    res.json(response)
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
}

module.exports.deletePost = async (req, res, next) => {
  try {
    const postModel = await Post.findOne({
      where: {
        id: req.params.postId
      }
    })

    const postObj = postModel.toJSON()

    if (postObj.authorId !== req.user.id) {
      const forbiddenRequest = forbiddenRequestError({
        error: 'Post author id not the same as user id'
      })
      return next(forbiddenRequest)
    }

    await PostLikes.destroy({ where: { postId: postObj.id } })
    await postModel.destroy()

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

module.exports.likePost = async (req, res) => {
  try {
    await PostLikes.create({ postId: req.params.postId, userId: req.user.id })
    res.sendStatus(200)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
}

module.exports.removePostLike = async (req, res) => {
  try {
    await PostLikes.destroy({
      where: {
        [Op.and]: [
          { postId: req.params.postId },
          { userId: req.user.id }
        ]
      }
    })
    res.sendStatus(200)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
}
