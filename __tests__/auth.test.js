/* global beforeAll, afterEach, afterAll, describe, test, expect */
const axios = require('axios')
const sinon = require('sinon')
const nock = require('nock')
const { initializeWebServer, stopWebServer } = require('../app')

let axiosAPIClient

beforeAll(async () => {
  await initializeWebServer()
  const axiosConfig = {
    baseURL: 'http://localhost:3000',
    validateStatus: () => true,
    withCredentials: true
  }

  axios.defaults.xsrfCookieName = 'connect.sid'

  axiosAPIClient = axios.create(axiosConfig)

  nock.disableNetConnect()
  nock.enableNetConnect('localhost')
})

afterEach(() => {
  sinon.restore()
})

afterAll(async () => {
  await stopWebServer()
  nock.enableNetConnect()
})

describe('/api', () => {
  describe('POST /auth/login', () => {
    test('When password is wrong', async () => {
      const res = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'aaaaa'
      })

      expect(res.data).toMatchObject({ message: 'Incorrect password.' })
    })

    test('When username is wrong', async () => {
      const res = await axiosAPIClient.post('/auth/login', {
        username: 'username',
        password: 'aaaaa'
      })

      expect(res.data).toMatchObject({ message: 'Incorrect username.' })
    })

    test('When username and password are correct', async () => {
      const res = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      expect(res.data).toMatchObject({ success: true, message: 'authentication succeeded' })
    })

    test('Logout', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const logoutRes = await axiosAPIClient.get('/auth/logout', { headers: { cookie } })

      expect(logoutRes.status).toEqual(200)
    })
  })
})
