const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const dbClient = require('../db')

router.post('/login',function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
   
    if (err) {
      return next(err); // will generate a 500 error
    }
    
    if (!user) {
      return res.send({ success : false, status : 'authentication failed', message: info.message });
    }

    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.send({ success : true, message : 'authentication succeeded', user });
    });      
  })(req, res, next);
})

router.post('/register', async (req, res) => {
  if (!req.body.username || !req.body.name || !req.body.surname || !req.body.password) {
    res.status(400).send('All user fields should be filled')
  }

  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

  const queryText = 'INSERT INTO users(name, surname, username, password) VALUES($1, $2, $3, $4) RETURNING *'
  const values = [req.body.name, req.body.surname, req.body.username, hashedPassword]

  try {
    const response = await dbClient.query(queryText, values)
    const user = response.rows[0]

    passport.authenticate('local')(req, res, () => {
      req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.send(user);
    });
  });

  } catch (err) {
    res.status(400).end()
    console.log(err.stack)
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
