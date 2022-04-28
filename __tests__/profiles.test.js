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
  describe('GET /profiles', () => {
    test('When user is not authenticated in', async () => {
      const res = await axiosAPIClient.get('/profiles/1')

      expect(res.status).toBe(401)
    })

    test('When user is authenticated ', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const profileRes = await axiosAPIClient.get('/profiles/1', { headers: { cookie } })

      expect(profileRes.status).toEqual(200)
      expect(profileRes.data).toHaveProperty('Profile')
      expect(profileRes.data.Profile).toMatchObject({
        age: 20,
        occupation: 'Programmer',
        bio: 'Just another programmer',
        gender: 'male'
      })
    })
  })
})
