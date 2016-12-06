'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluateStorybookConfig = exports.runWebpack = exports.loadAndTweakWebpackConfig = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _config = require('@kadira/storybook/dist/server/config');

var _config2 = _interopRequireDefault(_config);

var _webpackConfig = require('@kadira/storybook/dist/server/config/webpack.config.prod');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadAndTweakWebpackConfig = exports.loadAndTweakWebpackConfig = function loadAndTweakWebpackConfig(configDir) {
  var config = (0, _config2.default)('PRODUCTION', (0, _webpackConfig2.default)(), configDir);
  config.output = {
    path: _path2.default.resolve(configDir, './webpack'),
    filename: 'bundle.js'
  };

  config.entry = _path2.default.resolve(configDir, 'config.js');
  return config;
};

var runWebpack = exports.runWebpack = function runWebpack(config) {
  var compiler = (0, _webpack2.default)(config);

  return new _promise2.default(function (resolve, reject) {
    compiler.run(function (err, stats) {
      if (err) {
        reject(err);
      } else {
        var content = _fs2.default.readFileSync(_path2.default.resolve(config.output.path, config.output.filename));
        resolve(content);
      }
    });
  });
};

var evaluateStorybookConfig = exports.evaluateStorybookConfig = function evaluateStorybookConfig(content, polyfillsPath) {
  require(_path2.default.resolve(polyfillsPath));
  _vm2.default.runInThisContext(content);

  var storybook = global.storybook;
  return storybook;
};