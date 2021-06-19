const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const session = require('express-session')
const redis = require('redis')
const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const postsRouter = require('./routes/posts')
const profilesRouter = require('./routes/profiles')
const dbClient = require('./db')

const app = express()

const RedisStore = require('connect-redis')(session)
const client = redis.createClient({ host: 'redisdb', port: 6379 })

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

passport.use('local', new LocalStrategy(
  async function (username, password, done) {
    const queryText = 'SELECT * FROM users WHERE username = $1'
    const values = [username]
    let user = null
    
    try {
      const response = await dbClient.query(queryText, values)
      user = response.rows[0]
    } catch (err) {
      done(err)
    }
    console.log('____________FINDING NEW USER_____', username, password, user);
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' })
    }

    const isOk = await bcrypt.compare(password, user.password)
    console.log({ isOk })
    if (!isOk) {
      console.log('not ok!')
      return done(null, false, { message: 'Incorrect password.' })
    }

    return done(null, user)
  }
))

passport.serializeUser(function (user, done) {
  console.log('SERIALIZING USER', user)
  done(null, user.id)
})

passport.deserializeUser(async function (id, done) {
  console.log('DESERIALIZING USER', id)
  const queryText = 'SELECT * FROM users WHERE id = $1'
  const values = [id]
  let user = null
  try {
    const response = await dbClient.query(queryText, values)
    user = response.rows[0]
    console.log({ DESERIALIEZEDUSER: user})
  } catch (err) {
    done(err)
  }

  done(null, user)
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

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

app.use(function (req, res, next) {
  
  next(createError(404))
})

app.use(function (err, req, res, next) {
  console.log('creating errorrrrr', err)
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
