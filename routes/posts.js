const express = require('express')
const router = express.Router()
const {
  getAllFeedPosts,
  getAllUserPosts,
  createPost,
  deletePost,
  likePost,
  removePostLike
} = require('../controllers/postsController')

const {
  requireAuth
} = require('../controllers/authController')

router.get('/', requireAuth, getAllFeedPosts)
router.get('/author/:authorId', requireAuth, getAllUserPosts)
router.post('/', requireAuth, createPost)
router.delete('/:postId', requireAuth, deletePost)
router.post('/:postId/like', requireAuth, likePost)
router.delete('/:postId/like', requireAuth, removePostLike)

module.exports = router
