var express = require('express');
var router = express.Router();
var passport = require('passport');

function loggedIn(req, res, next) {
  if (req.user) {
      next();
  } else {
      res.redirect('/login');
  }
}

router.post('/login', 
  function(req, res, next){
    next();
  },
  passport.authenticate('local'),
  function(req, res) {
    res.json(req.user);
  }
);


router.get('/logout', function(req, res){
  req.logout();
  res.status(200).clearCookie('connect.sid', {
    path: '/'
  });
  req.session.destroy(function (err) {
    res.redirect('/');
  });

});


module.exports = router;