
const passport = require('passport')
const bcrypt = require('bcryptjs')
const { validateUser } = require('../utils/validation')
const { badRequestError, unauthorizedRequestError } = require('../utils/errors')
const { User, Profile } = require('../models')

module.exports.requireAuth = (req, _, next) => {
  if (!req.user) {
    const unauthorizedRequest = unauthorizedRequestError({
      message: 'You are not authorized for this action'
    })
    return next(unauthorizedRequest)
  }

  next()
}

module.exports.login = (req, res, next) => {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.send({ success: false, status: 'authentication failed', message: info.message })
    }

    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr)
      }
      return res.send({ success: true, message: 'authentication succeeded', user })
    })
  })(req, res, next)
}

module.exports.register = async (req, res, next) => {
  const { error } = validateUser(req.body)

  if (error) {
    const badRequest = badRequestError(error.details)
    return next(badRequest)
  }

  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

  try {
    const userInstance = await User.create({
      name: req.body.name,
      surname: req.body.surname,
      username: req.body.username,
      password: hashedPassword
    })

    const user = userInstance.toJSON()

    await Profile.create({ userId: user.id })

    passport.authenticate('local')(req, res, () => {
      req.session.save((err) => {
        if (err) {
          console.log({ err })
          return next(err)
        }
        res.send({ user })
      })
    })
  } catch (err) {
    res.status(400).end()
    console.log(err.stack)
  }
}

module.exports.logout = (req, res) => {
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
}
