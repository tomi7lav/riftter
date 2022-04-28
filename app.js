const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const session = require('express-session')
const redis = require('redis')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const postsRouter = require('./routes/posts')
const profilesRouter = require('./routes/profiles')
const createPassport = require('./auth')
const redisConfig = require('./config/redis-config.json')

const passport = createPassport()

const RedisStore = require('connect-redis')(session)

const client = redis.createClient(redisConfig[process.env.NODE_ENV])

let connection

const initializeWebServer = (port = 3000) => {
  return new Promise((resolve) => {
    const app = express()

    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Credentials', true)
      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
      res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')

      if (req.method === 'OPTIONS') {
        res.sendStatus(200)
      } else {
        next()
      }
    })

    app.use(cors({
      origin: 'http://localhost:4000'
    }))

    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(session({
      store: new RedisStore({ client }),
      secret: 'cats',
      resave: true,
      saveUninitialized: false
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(express.static(path.join(__dirname, 'public')))

    app.use('/', indexRouter)
    app.use('/auth', authRouter)
    app.use('/users', usersRouter)
    app.use('/posts', postsRouter)
    app.use('/profiles', profilesRouter)

    app.use('*', function (_, ___, next) {
      next(createError(404))
    })

    app.use(function (err, _, res) {
      console.log('entering error', err)
      if (!err.statusCode) err.statusCode = 500

      if (err.statusCode === 301) {
        return res.status(301).redirect('/not-found')
      }

      return res
        .status(err.statusCode)
        .json({ errors: err })
    })

    connection = app.listen(port, () => {
      resolve(connection.address())
    })
  })
}

const stopWebServer = () => {
  return new Promise((resolve) => {
    connection.close(() => {
      resolve()
    })
  })
}

module.exports = {
  initializeWebServer,
  stopWebServer
}
