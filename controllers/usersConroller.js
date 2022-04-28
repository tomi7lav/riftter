const { Op } = require('sequelize')
const { Followers, User } = require('../models')

module.exports.followUser = async (req, res) => {
  try {
    await Followers.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })

    res.status(204).end()
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
}

module.exports.isFollowingUser = async (req, res) => {
  try {
    const response = await Followers.findOne({
      where: {
        [Op.and]: [
          { followerId: req.user.id },
          { followingId: req.params.userId }
        ]
      }
    })

    const following = Boolean(response)
    res.json({ following })
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
}

module.exports.unfollowUser = async (req, res) => {
  try {
    await Followers.destroy({
      where: {
        [Op.and]: [
          { followerId: req.user.id },
          { followingId: req.params.userId }
        ]
      }
    })
    res.status(204).end()
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
}

module.exports.searchUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        username: {
          [Op.iLike]: `${req.params.username}%`
        }
      }
    })

    res.json(users)
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
}
