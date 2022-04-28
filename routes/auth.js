const express = require('express')
const router = express.Router()
const {
  login,
  logout,
  register
} = require('../controllers/authController')

const {
  requireAuth
} = require('../controllers/authController')

router.post('/login', login)
router.post('/register', register)
router.get('/logout', requireAuth, logout)

module.exports = router
