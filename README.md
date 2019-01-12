# [WIP] API factory generator

- Uses fetch
- Uses ajv for schema validation
- Sane defaults
- Sends token if provided
- Each route can have specific options

# Usage

```javascript

const generator = require('@zerowastemap/api-factory-generator')

// set default options for each requests
const options = {
  mode: 'cors',
  domain: 'zerowastemap.localhost',
  scheme: 'https://',
  prefix: '/api',
  version: 1,
  token: 'some bearer token'
}

// configure your routes
// you can nest routes
const routes = {
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
    path: '/locate',
    options: {
      method: 'POST',
      auth: true, // will enable credentials
      multipart: true
    }
  }
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
}

const api = generator(routes, options) 

// api.auth.login('salut@zerowastemap.app') works too if we have a schema
api.auth.login({ email: 'salut@zerowastemap.app' }).then(response => {
  ...
})

```

# See also

[JavaScript Factory Functions vs Constructor Functions vs Classes](https://medium.com/javascript-scene/javascript-factory-functions-vs-constructor-functions-vs-classes-2f22ceddf33e)

# Testing

Tests won't work on your machine because it test against api which is not released yet

# LICENSE

MIT

# Author(s)

- Augustin Godiscal <salut@zerowastemap.app>
