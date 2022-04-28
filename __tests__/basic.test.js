/* global beforeAll, afterEach, afterAll, describe, test, expect */
const axios = require('axios')
const sinon = require('sinon')
const nock = require('nock')
const { initializeWebServer, stopWebServer } = require('../app')

let axiosAPIClient

beforeAll(async () => {
  await initializeWebServer()
  const axiosConfig = {
    baseURL: 'http://127.0.0.1:3000',
    validateStatus: () => true
  }
  axiosAPIClient = axios.create(axiosConfig)

  nock.disableNetConnect()
  nock.enableNetConnect('127.0.0.1')
})

afterEach(() => {
  sinon.restore()
})

afterAll(async () => {
  await stopWebServer()
  nock.enableNetConnect()
})

describe('/api', () => {
  describe('GET /users', () => {
    test('When asked for users should return true', async () => {
      const res = await axiosAPIClient.get('/')

      expect(res.data).toMatchObject({ home: 'Hey Home!' })
    })
  })
})
