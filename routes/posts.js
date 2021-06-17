const express = require('express')
const router = express.Router()
const dbClient = require('../db')

router.get('/', async (req, res) => {
  const queryText = `
        SELECT 
            posts.postId, 
            posts.timestamp, 
            posts.authorId, 
            posts.body,
            (SELECT username FROM users WHERE posts.authorId = id) AS username,
            array_remove(array_agg(post_likes.userId), NULL) AS likes
        FROM posts
        LEFT JOIN post_likes ON posts.postId = post_likes.postId 
        WHERE authorId IN ( 
            SELECT following_id FROM followers WHERE follower_id = $1
        )
        GROUP BY posts.postId, posts.timestamp, posts.authorId, posts.body;
    `
  const values = [req.user.id]

  try {
    const response = await dbClient.query(queryText, values)
    res.json(response.rows)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
})

router.get('/author/:authorId', async (req, res) => {
  const queryText = 'SELECT FROM posts WHERE authorId = $1'
  const values = [req.params.authorId]

  try {
    const response = await dbClient.query(queryText, values)
    res.json(response)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
})

router.post('/', async (req, res) => {
  if (!req.body.text) {
    res.status(400).send('All user fields should be filled')
  }

  console.log({ fromcreatepost: req.user })

  const queryText = 'INSERT INTO posts (body, authorId) VALUES($1, $2) RETURNING *'
  const values = [req.body.text, req.user.id]

  try {
    const response = await dbClient.query(queryText, values)
    res.json(response)
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

router.get('/:postId', async (req, res) => {
  const queryText = 'SELECT * FROM posts WHERE id = $1'
  const values = [req.params.postId]

  try {
    const response = await dbClient.query(queryText, values)
    const post = response.rows[0]
    res.json({ response: post })
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
})

function _updatePostsByID (id, cols) {
  const query = ['UPDATE posts']
  query.push('SET')

  const set = []
  Object.keys(cols).forEach(function (key, i) {
    set.push(`${key} = ($${i + 1})`)
  })

  query.push(set.join(', '))
  query.push(`WHERE id = ${id}`)

  return query.join(' ')
}

router.put('/:postId', async (req, res) => {
  const queryText = _updatePostsByID(req.params.postId, req.body)
  const values = Object.values(req.body)

  try {
    const response = await dbClient.query(queryText, values)
    res.json(response)
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

router.delete('/:postId', async (req, res) => {
  const values = [req.params.postId]
  const queryText = 'DELETE FROM posts WHERE id = $1'

  try {
    const response = await dbClient.query(queryText, values)
    res.json(response)
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

router.post('/:postId/like', async (req, res) => {
  const queryText = 'INSERT INTO post_likes (userId, postId) VALUES ($1, $2)'
  const values = [req.user.id, req.params.postId]

  try {
    await dbClient.query(queryText, values)
    res.sendStatus(200)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
})

router.delete('/:postId/like', async (req, res) => {
  const queryText = 'DELETE FROM post_likes WHERE userId = $1 AND postId = $2'
  const values = [req.user.id, req.params.postId]

  try {
    await dbClient.query(queryText, values)
    res.sendStatus(200)
  } catch (err) {
    res.status(401).end()
    console.log(err.stack)
  }
})

module.exports = router
