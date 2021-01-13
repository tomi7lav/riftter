var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var session = require('express-session');
const redis = require('redis')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var postsRouter = require('./routes/posts');
var profilesRouter = require('./routes/profiles');
var dbClient = require('./db');

var app = express();

let RedisStore = require('connect-redis')(session)
let client = redis.createClient();

app.use(function(req, res, next) {
  
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  
  if ('OPTIONS' == req.method) {
       res.send(200);
   } else {
       next();
   }

});

app.use(cors({
  origin: 'http://localhost:4000',
}))

passport.use(new LocalStrategy(
  async function(username, password, done) {
    const queryText = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    let user = null;

    try {
      const response = await dbClient.query(queryText, values)
      user = response.rows[0];
    } catch (err) {
      done(err);
    }

    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    if (!user.password === password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    console.log({ userrr: user })
    return done(null, user);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  const queryText = 'SELECT * FROM users WHERE id = $1';
  const values = [id];
  let user = null;
  try {
    const response = await dbClient.query(queryText, values);
    user = response.rows[0];
  } catch (err) {
    done(err);
  }

  done(null, user);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
  store: new RedisStore({ client }),
  secret: 'cats',
  resave: true,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/profiles', profilesRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;