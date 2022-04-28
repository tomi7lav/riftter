const passport = require('passport')
const bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local').Strategy
const { User } = require('./models')

const init = () => {
  passport.use('local', new LocalStrategy(
    async function (username, password, done) {
      let user = null

      try {
        const userModel = await User.findOne({
          where: {
            username
          }
        })

        user = userModel.toJSON()
      } catch (err) {
        done(err)
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' })
      }

      const isOk = await bcrypt.compare(password, user.password)

      if (!isOk) {
        return done(null, false, { message: 'Incorrect password.' })
      }

      return done(null, user)
    }
  ))

  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(async function (id, done) {
    let user = null

    try {
      const userModel = await User.findOne({
        where: { id }
      })

      user = userModel.toJSON()
    } catch (err) {
      done(err)
    }

    done(null, user)
  })

  return passport
}

module.exports = init
