const express = require('express')
const router = express.Router()
const passport = require('passport')

// function loggedIn (req, res, next) {
//   if (req.user) {
//     next()
//   } else {
//     res.redirect('/login')
//   }
// }

router.post('/login',
  function (req, res, next) {
    next()
  },
  passport.authenticate('local'),
  function (req, res) {
    res.json(req.user)
  }
)

router.post('/register', async (req, res) => {
  if (!req.body.username || !req.body.name || !req.body.surname || !req.body.password) {
    res.status(401).send('All user fields should be filled')
  }
})

router.get('/logout', function (req, res) {
  req.logout()
  res.status(200).clearCookie('connect.sid', {
    path: '/'
  })
  req.session.destroy(function (err) {
    if (err) {
      return res.status(501).end()
    }
    res.redirect('/')
  })
})

module.exports = router
