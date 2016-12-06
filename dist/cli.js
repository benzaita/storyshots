'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var addons, channel, webpackConfig, storybookConfig, storybook, result, fails, exitCode;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            // Channel for addons is created by storybook manager from the client side.
            // We need to polyfill it for the server side.
            addons = require('@kadira/storybook-addons').default;
            channel = new _events2.default();

            addons.setChannel(channel);

            webpackConfig = (0, _webpack_helper.loadAndTweakWebpackConfig)(configDir);
            _context.next = 7;
            return (0, _webpack_helper.runWebpack)(webpackConfig);

          case 7:
            storybookConfig = _context.sent;
            storybook = (0, _webpack_helper.evaluateStorybookConfig)(storybookConfig, polyfillsPath);
            _context.next = 11;
            return runner.run((0, _util.filterStorybook)(storybook, grep, exclude));

          case 11:
            result = _context.sent;
            fails = result.errored + result.unmatched;
            exitCode = fails > 0 ? 1 : 0;

            if (!_commander2.default.watch) {
              process.exit(exitCode);
            }
            _context.next = 21;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context['catch'](0);

            console.log(_context.t0.stack || _context.t0);

            if (!_commander2.default.watch) {
              process.exit(1);
            }

          case 21:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 17]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var _test_runner = require('./test_runner');

var _test_runner2 = _interopRequireDefault(_test_runner);

var _storybook = require('@kadira/storybook');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _util = require('./util');

var _webpack_helper = require('./webpack_helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.NODE_ENV = process.env.NODE_ENV || 'development'; /* eslint-disable */

var babel = require('babel-core');

_commander2.default.option('-c, --config-dir [dir-name]', 'Directory where to load Storybook configurations from').option('-u, --update [boolean]', 'Update saved story snapshots').option('-i, --update-interactive [boolean]', 'Update saved story snapshots interactively').option('-g, --grep [string]', 'Only test stories matching regexp').option('-x, --exclude [string]', 'Exclude stories matching regexp').option('-w, --watch [boolean]', 'Watch file changes and rerun tests').option('--storyshot-dir [string]', 'Path to the directory to store storyshots. Default is [config-dir]/__storyshots__').option('--extension [string]', 'File extension to use for storyshot files. Default is `.shot`').option('--polyfills [string]', 'Add global polyfills').parse(process.argv);

var _program$configDir = _commander2.default.configDir,
    configDir = _program$configDir === undefined ? './.storybook' : _program$configDir,
    _program$polyfills = _commander2.default.polyfills,
    polyfillsPath = _program$polyfills === undefined ? require.resolve('./default_config/polyfills.js') : _program$polyfills,
    grep = _commander2.default.grep,
    exclude = _commander2.default.exclude;


var configPath = _path2.default.resolve(configDir, 'config.js');

// set userAgent so storybook knows we're storyshots
if (!global.navigator) {
  global.navigator = {};
};
global.navigator.userAgent = 'storyshots';

var runner = new _test_runner2.default(_commander2.default);

if (_commander2.default.watch) {
  var watcher = _chokidar2.default.watch('.', {
    ignored: 'node_modules', // TODO: Should node_modules also be watched?
    persistent: true
  });

  watcher.on('ready', function () {
    console.log('\nStoryshots is in watch mode.\n');
    watcher.on('all', function () {
      // Need to remove the require cache. Because it containes modules before
      // changes were made.
      (0, _keys2.default)(require.cache).forEach(function (key) {
        delete require.cache[key];
      });

      main();
    });
  });
}

main();