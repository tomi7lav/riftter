const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (_, res) {
  res.json({ home: 'Hey Home!' })
})

router.get('/user', function (req, res) {
  if (req.user) {
    res.json(req.user)
  }

  res.status(200).end()
})

module.exports = router
