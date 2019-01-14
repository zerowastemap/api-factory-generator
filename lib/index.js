"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.apiFactoryGenerator = exports.computeRoutes = exports.request = void 0;

var _queryString = _interopRequireDefault(require("query-string"));

var _isobject = _interopRequireDefault(require("isobject"));

var _ajv = _interopRequireDefault(require("ajv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var ajv = new _ajv.default({
  allErrors: true
});

var request = function request() {
  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$auth = options.auth,
      auth = _options$auth === void 0 ? false : _options$auth,
      data = options.data,
      domain = options.domain,
      _options$lang = options.lang,
      lang = _options$lang === void 0 ? 'fr' : _options$lang,
      _options$method = options.method,
      method = _options$method === void 0 ? 'GET' : _options$method,
      _options$mode = options.mode,
      mode = _options$mode === void 0 ? 'no-cors' : _options$mode,
      multipart = options.multipart,
      prefix = options.prefix,
      scheme = options.scheme,
      _options$timeout = options.timeout,
      timeout = _options$timeout === void 0 ? 15000 : _options$timeout,
      token = options.token;
  var credentials = auth ? 'include' : 'omit';

  var stringified = _queryString.default.stringify(method === 'GET' ? data : {});

  var body;

  if (/post|put|delete/.test(method.toLowerCase())) {
    body = Object.assign({}, data);
  }

  var url = [scheme, domain, prefix, path, stringified ? '?' + stringified : false].filter(Boolean).join('');
  var headers = new Headers();

  if (token && auth) {
    headers.append('Authorization', 'Bearer ' + token);
  }

  headers.append('Accept-Language', lang);

  if (multipart) {
    body = data.formData;
  } else {
    headers.append('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  return Promise.race([new Promise(function (resolve, reject) {
    return fetch(url, {
      headers: headers,
      method: method,
      body: body,
      mode: mode,
      credentials: credentials
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      return resolve(json);
    }).catch(function (err) {
      return reject(err);
    });
  }), new Promise(function (resolve, reject) {
    return setTimeout(function () {
      return reject(new Error('timeout'));
    }, timeout);
  })]);
};

exports.request = request;

var computeRoutes = function computeRoutes(routes) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var obj = {};

  var _arr = Object.entries(routes);

  var _loop = function _loop() {
    var _arr$_i = _slicedToArray(_arr[_i], 2),
        key = _arr$_i[0],
        route = _arr$_i[1];

    if (route.path) {
      var schema;
      var params;
      var validate;
      var multipart;

      if (route.options) {
        multipart = route.options.multipart;
      }

      if (route.schema) {
        schema = route.schema || {};
        params = Object.keys(schema.properties);
        validate = ajv.compile(schema);
      }

      obj[key] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var data = {};

        if ((0, _isobject.default)(args[0] || multipart === true)) {
          data = args[0];
        } else {
          if (params) {
            params.forEach(function (key, index) {
              data[key] = args[index];
            });
          }
        }

        if (validate) {
          var valid = validate(data);

          if (!valid) {
            var errors = validate.errors;
            throw errors;
          }
        }

        return request(route.path, Object.assign({}, {
          data: data
        }, options, route.options));
      };
    } else {
      obj[key] = computeRoutes(route, options);
    }
  };

  for (var _i = 0; _i < _arr.length; _i++) {
    _loop();
  }

  return obj;
};

exports.computeRoutes = computeRoutes;

var apiFactoryGenerator = function apiFactoryGenerator(routes, options) {
  var api = Object.create(computeRoutes(routes, options));
  api.version = options.version;
  return api;
};

exports.apiFactoryGenerator = apiFactoryGenerator;
var _default = apiFactoryGenerator;
exports.default = _default;