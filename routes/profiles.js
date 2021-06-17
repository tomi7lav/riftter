const express = require('express')
const router = express.Router()
const dbClient = require('../db')

router.get('/:profileId', async (req, res) => {
  const values = [req.params.profileId]
  const queryText = 'SELECT * FROM users WHERE id = $1'
  let user = null

  try {
    const response = await dbClient.query(queryText, values)
    user = response.rows[0]
    res.json(user)
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

router.get('/search/:username', async (req, res) => {
  const values = [`${req.params.username}%`]
  const queryText = 'SELECT * FROM users WHERE username ILIKE $1'
  let users = null

  try {
    const response = await dbClient.query(queryText, values)
    users = response.rows
    res.json(users)
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

router.put('/follow/:profileId', async (req, res) => {
  const queryText = 'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2) RETURNING *'
  const values = [req.user.id, req.params.profileId]

  try {
    const response = await dbClient.query(queryText, values)
    res.json({ response })
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

router.get('/follow/:profileId', async (req, res) => {
  const queryText = 'SELECT * FROM followers WHERE follower_id = $1 AND following_id = $2'
  const values = [req.user.id, req.params.profileId]

  try {
    const response = await dbClient.query(queryText, values)
    console.log({ rrrrresponse: response })
    const following = response.rows.length > 0
    console.log('hhahah', following)
    res.json({ following })
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

router.delete('/follow/:userId', async (req, res) => {
  const queryText = 'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2'
  const values = [req.user.id, req.params.userId]

  try {
    const response = await dbClient.query(queryText, values)
    res.json({ response })
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

module.exports = router
