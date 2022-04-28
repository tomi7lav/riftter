const express = require('express')
const router = express.Router()

const {
  getProfile
} = require('../controllers/profilesController')

const {
  requireAuth
} = require('../controllers/authController')

router.get('/:userId', requireAuth, getProfile)

module.exports = router
