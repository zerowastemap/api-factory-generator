require('@babel/polyfill')

const test = require('tape')
const api = require('../')(
  {
    auth: {
      login: {
        path: '/auth/login',
        options: {
          method: 'POST'
        },
        schema: {
          email: {
            type: 'string'
          }
        }
      }
    },
    locate: {
      path: '/locate',
      schema: {
        longitude: {
          type: 'number'
        },
        latitude: {
          type: 'number'
        }
      }
    }
  },
  {
    mode: 'cors',
    domain: 'zerowastemap.localhost',
    scheme: 'https://',
    prefix: '/api',
    version: 1
  }
)

test('test api', async t => {
  t.plan(6)

  try {
    t.equal(typeof api, 'object', 'api should be an object')
    t.equal(typeof api.locate, 'function', 'locate method should be a function')
    t.equal(typeof api.auth.login, 'function', 'auth.login method should be a function')
    t.equal(api.version, 1, 'api version should be 1')

    const resp1 = await api.locate(4.3517, 50.8503)
    t.ok(resp1.features.length > 0, 'Should have some features in body')

    const resp2 = await api.auth.login({ email: 'dev@auggod.io' })
    t.ok(resp2.message === 'Please check your email for further instructions', 'Message should match')
  } catch (err) {
    throw err
  }
})
