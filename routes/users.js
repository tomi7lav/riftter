var express = require('express');
var router = express.Router();
var { getDbClient } = require('../db');

router.get('/', function(req, res) {
  let dbClient = getDbClient();

  dbClient.query('SELECT * FROM weather', (err, dbRes) => {
    console.log('requesting stuf yaaay', dbRes)
    res.json({ users: dbRes.rows });
  });
});

module.exports = router;
