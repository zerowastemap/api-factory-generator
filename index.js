/* global Headers, fetch */

const assert = require('nanoassert')
const queryString = require('query-string')
const isObject = require('isobject')

const request = (path = '/', options = {}) => {
  const {
    auth = false,
    credentials = 'omit',
    data,
    domain,
    lang = 'fr',
    method = 'GET',
    mode = 'no-cors',
    multipart,
    prefix,
    scheme,
    timeout = 15000,
    token
  } = options

  const stringified = queryString.stringify(method === 'GET' ? data : {})

  let body

  if (/post|put|delete/.test(method.toLowerCase())) {
    body = Object.assign({}, data)
  }

  const url = [
    scheme,
    domain,
    prefix,
    path,
    stringified ? '?' + stringified : false
  ]
    .filter(Boolean)
    .join('')

  const headers = new Headers()

  if (token && auth) {
    headers.append('Authorization', 'Bearer ' + token)
  }

  headers.append('Accept-Language', lang)

  if (!multipart) {
    headers.append('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }

  return Promise.race([
    new Promise((resolve, reject) => fetch(url, {
      headers,
      method,
      body,
      mode,
      credentials
    }).then(response => response.json())
      .then(json => resolve(json))
      .catch(err => reject(err))
    ),
    new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    )
  ])
}

/*
 * Simple validator to validate schema against some data
 */

const validator = (schema) => {
  return (data) => {
    for (let [key, value] of Object.entries(schema)) {
      return assert.equal(typeof data[key], value.type)
    }
  }
}

function computeRoutes (routes, options = {}) {
  const obj = {}
  for (let [key, route] of Object.entries(routes)) {
    if (route.path) {
      const schema = route.schema || {}
      const params = Object.keys(schema)
      const validate = validator(schema)

      obj[key] = (...args) => {
        let data = {}
        if (isObject(args[0])) {
          data = args[0]
        } else {
          params.forEach((key, index) => {
            data[key] = args[index]
          })
        }
        validate(data)
        return request(route.path, Object.assign({}, { data }, options, route.options))
      }
    } else {
      obj[key] = computeRoutes(route, options)
    }
  }
  return obj
}

module.exports = (routes, options) => {
  const api = Object.create(
    computeRoutes(routes, options)
  )

  api.version = options.version

  return api
}
