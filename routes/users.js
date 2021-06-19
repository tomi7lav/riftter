const express = require('express')
const router = express.Router()
const dbClient = require('../db')

router.get('/', async (res) => {
  const response = await dbClient.query('SELECT * FROM users')

  res.json({ users: response.rows })
})

router.delete('/:userId', async (req, res) => {
  const values = [req.params.userId]
  const queryText = 'DELETE FROM users WHERE id = $1'

  try {
    const response = await dbClient.query(queryText, values)
    res.json({ response })
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

function _updateUsersByID (id, cols) {
  const query = ['UPDATE users']
  query.push('SET')

  const set = []
  Object.keys(cols).forEach(function (key, i) {
    set.push(`${key} = ($${i + 1})`)
  })

  query.push(set.join(', '))
  query.push(`WHERE id = ${id}`)

  return query.join(' ')
}

router.put('/user/:userId', async (req, res) => {
  const queryText = _updateUsersByID(req.params.userId, req.body)
  const values = Object.values(req.body)

  try {
    const response = await dbClient.query(queryText, values)
    res.json({ response })
  } catch (err) {
    res.status(404).end()
    console.log(err.stack)
  }
})

module.exports = router
