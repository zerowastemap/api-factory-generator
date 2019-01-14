/* global Headers, fetch */

import queryString from 'query-string'
import isObject from 'isobject'
import Ajv from 'ajv'

const ajv = new Ajv({
  allErrors: true
})

export const request = (path = '/', options = {}) => {
  const {
    auth = false,
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

  const credentials = auth ? 'include' : 'omit'

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

  if (multipart) {
    body = data.formData
  } else {
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

export const computeRoutes = (routes, options = {}) => {
  const obj = {}

  for (let [key, route] of Object.entries(routes)) {
    if (route.path) {
      let schema
      let params
      let validate
      let multipart

      if (route.options) {
        multipart = route.options.multipart
      }

      if (route.schema) {
        schema = route.schema || {}
        params = Object.keys(schema.properties)
        validate = ajv.compile(schema)
      }

      obj[key] = (...args) => {
        let data = {}
        if (isObject(args[0] || multipart === true)) {
          data = args[0]
        } else {
          if (params) {
            params.forEach((key, index) => {
              data[key] = args[index]
            })
          }
        }
        if (validate) {
          let valid = validate(data)
          if (!valid) {
            let errors = validate.errors
            throw errors
          }
        }
        return request(route.path, Object.assign({}, { data }, options, route.options))
      }
    } else {
      obj[key] = computeRoutes(route, options)
    }
  }
  return obj
}

export const apiFactoryGenerator = (routes, options) => {
  const api = Object.create(
    computeRoutes(routes, options)
  )

  api.version = options.version

  return api
}

export default apiFactoryGenerator
