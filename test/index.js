import '@babel/polyfill'

import test from 'tape'
import { Longitude, Latitude } from '@zerowastemap/schemas/location'
import factoryGenerator from '../src'

const api = factoryGenerator(
  {
    auth: {
      login: {
        path: '/auth/login',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string'
            }
          }
        }
      }
    },
    upload: {
      path: '/upload',
      options: {
        method: 'POST',
        multipart: true
      }
    },
    locate: {
      path: '/locate',
      schema: {
        type: 'object',
        required: ['longitude', 'latitude'],
        properties: {
          longitude: Longitude,
          latitude: Latitude
        }
      }
    }
  },
  {
    mode: 'cors',
    domain: 'zerowastemap.localhost',
    scheme: 'https://',
    prefix: '/api',
    version: 1,
    timeout: 10000
  }
)

test('api should look right', async t => {
  t.plan(4)
  t.equal(typeof api, 'object', 'api should be an object')
  t.equal(typeof api.locate, 'function', 'locate method should be a function')
  t.equal(typeof api.auth.login, 'function', 'auth.login method should be a function')
  t.equal(api.version, 1, 'api version should be 1')
})

test('can login', async t => {
  t.plan(1)

  try {
    const resp2 = await api.auth.login({ email: 'dev@auggod.io' })
    t.ok(resp2.message === 'Please check your email for further instructions', 'Message should match')
  } catch (err) {
    t.end(err)
  }
})

test('can locate', async t => {
  t.plan(1)

  try {
    const resp1 = await api.locate(4.3517, 50.8503)
    t.ok(resp1, 'Should be able to send request')
  } catch (err) {
    t.end(err)
  }
})
