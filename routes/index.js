var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ home: 'Hey Home!' });
});


router.get('/user', function(req, res, next) {
  if(req.user) {
    res.json(req.user);
  }

  res.status(200).end();
})

module.exports = router;
