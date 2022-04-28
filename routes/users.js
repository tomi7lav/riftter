const express = require('express')
const router = express.Router()
const {
  followUser,
  isFollowingUser,
  unfollowUser,
  searchUsers
} = require('../controllers/usersConroller')
const { requireAuth } = require('../controllers/authController')

router.put('/follow/:userId', requireAuth, followUser)
router.get('/follow/:userId', requireAuth, isFollowingUser)
router.delete('/follow/:userId', requireAuth, unfollowUser)
router.get('/search/:username', requireAuth, searchUsers)

module.exports = router
