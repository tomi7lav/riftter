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
  describe('POST /posts', () => {
    test('creates post', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const postRes = await axiosAPIClient.post(
        '/posts', { text: 'My first post' }, { headers: { cookie } }
      )
      expect(postRes.status).toEqual(200)
      expect(postRes.data.body).toEqual('My first post')
    })

    test('deletes post', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const createPostRes = await axiosAPIClient.post(
        '/posts', { text: 'My second post' }, { headers: { cookie } }
      )

      expect(createPostRes.status).toEqual(200)
      expect(createPostRes.data.body).toEqual('My second post')

      const deletePostRes = await axiosAPIClient.delete(`/posts/${createPostRes.data.id}`, { headers: { cookie } })

      expect(deletePostRes.status).toBe(204)
    })

    test('likes post', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const createPostRes = await axiosAPIClient.post(
        '/posts', { text: 'My third post' }, { headers: { cookie } }
      )

      expect(createPostRes.status).toEqual(200)
      expect(createPostRes.data.body).toEqual('My third post')

      const likePostsRes = await axiosAPIClient.post(`/posts/${createPostRes.data.id}/like`, {}, { headers: { cookie } })

      expect(likePostsRes.status).toBe(200)

      const getUserPostsRes = await axiosAPIClient.get(`/posts/author/${loginRes.data.user.id}`, { headers: { cookie } })

      const createdPost = getUserPostsRes.data.find(post => post.id === createPostRes.data.id)

      expect(createdPost.likes).toContain(loginRes.data.user.id)
    })

    test('unlike post', async () => {
      const loginRes = await axiosAPIClient.post('/auth/login', {
        username: 'mrjones',
        password: 'asdf1234'
      })

      const cookie = loginRes.headers['set-cookie'][0]

      const createPostRes = await axiosAPIClient.post(
        '/posts', { text: 'My fourth post' }, { headers: { cookie } }
      )

      expect(createPostRes.status).toEqual(200)
      expect(createPostRes.data.body).toEqual('My fourth post')

      const likePostsRes = await axiosAPIClient.post(`/posts/${createPostRes.data.id}/like`, {}, { headers: { cookie } })

      expect(likePostsRes.status).toBe(200)

      const deleteLikePostRes = await axiosAPIClient.delete(`/posts/${createPostRes.data.id}/like`, { headers: { cookie } })

      expect(deleteLikePostRes.status).toBe(200)

      const getUserPostsRes = await axiosAPIClient.get(`/posts/author/${loginRes.data.user.id}`, { headers: { cookie } })

      const createdPost = getUserPostsRes.data.find(post => post.id === createPostRes.data.id)

      expect(createdPost.likes).not.toContain(loginRes.data.user.id)
    })
  })
})
