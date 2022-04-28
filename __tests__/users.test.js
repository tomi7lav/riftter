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
  describe('POST /users', () => {
    test('follows user', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const followUserRes = await axiosAPIClient.put(
        '/users/follow/2', {}, { headers: { cookie } }
      )

      expect(followUserRes.status).toBe(204)

      const getFollowUserRes = await axiosAPIClient.get(
        '/users/follow/2', { headers: { cookie } }
      )

      expect(getFollowUserRes.data).toMatchObject({
        following: true
      })
    })

    test('gets followed user posts', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const postRes = await axiosAPIClient.post(
        '/posts', { text: 'My post' }, { headers: { cookie } }
      )
      expect(postRes.status).toEqual(200)
      expect(postRes.data.body).toEqual('My post')

      const loginRes2 = await axiosAPIClient.post('/auth/login', {
        username: 'mrdaves',
        password: 'asdf1234'
      })

      const cookie2 = loginRes2.headers['set-cookie'][0]

      await axiosAPIClient.put(
        '/users/follow/1', {}, { headers: { cookie: cookie2 } }
      )

      const getAllPostsRes = await axiosAPIClient.get('/posts', { headers: { cookie: cookie2 } })

      const postAuthorIds = getAllPostsRes.data.map(p => p.authorid)

      expect(postAuthorIds.every(id => parseInt(id) === 1)).toBe(true)
    })

    test('unfollows user', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const followUserRes = await axiosAPIClient.put(
        '/users/follow/2', {}, { headers: { cookie } }
      )

      expect(followUserRes.status).toBe(204)

      const unfollowUserRes = await axiosAPIClient.delete(
        '/users/follow/2', { headers: { cookie } }
      )

      expect(unfollowUserRes.status).toBe(204)

      const getFollowUserRes = await axiosAPIClient.get(
        '/users/follow/2', { headers: { cookie } }
      )

      expect(getFollowUserRes.data).toMatchObject({
        following: false
      })
    })

    test('searches user', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const searchUsersRes = await axiosAPIClient.get(
        '/users/search/mrd', { headers: { cookie } }
      )

      expect(searchUsersRes.data.length).toBe(1)
      expect(searchUsersRes.data[0]).toMatchObject({ username: 'mrdaves' })
    })
  })
})
