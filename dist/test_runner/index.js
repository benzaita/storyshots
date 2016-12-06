'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _visual_runner = require('./visual_runner');

var _visual_runner2 = _interopRequireDefault(_visual_runner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function logState(_ref) {
  var state = _ref.state,
      name = _ref.name,
      message = _ref.message;

  switch (state) {
    case 'added':
      process.stdout.write(_chalk2.default.cyan('+ ' + name + ': Added'));
      break;
    case 'updated':
      process.stdout.write(_chalk2.default.cyan('\u25CF ' + name + ': Updated'));
      break;
    case 'matched':
      process.stdout.write(_chalk2.default.green('\u2713 ' + name));
      break;
    case 'unmatched':
      process.stdout.write('\n');
      process.stdout.write(_chalk2.default.red('\u2717 ' + name + '\n'));
      process.stdout.write('  ' + message.split('\n').join('\n  '));
      process.stdout.write('\n');
      break;
    case 'errored':
    case 'errored-kind':
      // eslint-disable-line
      process.stdout.write('\n');
      process.stdout.write(_chalk2.default.red('\u2717 ' + name + ': ERROR\n'));
      var output = message.stack || message;
      process.stdout.write(_chalk2.default.dim('  ' + output.split('\n').join('\n  ')));
      process.stdout.write('\n');
      break;
    case 'started-kind':
      process.stdout.write('\n');
      process.stdout.write(_chalk2.default.underline(name));
      break;
    default:
      process.stdout.write('Error occured when testing ' + state + ': ' + message);
  }
  process.stdout.write('\n');
}
// import SnapshotRunner from './snapshot_runner';


function logSummary(state) {
  var added = state.added,
      matched = state.matched,
      unmatched = state.unmatched,
      updated = state.updated,
      errored = state.errored,
      obsolete = state.obsolete;

  var total = added + matched + unmatched + updated + errored;
  process.stdout.write(_chalk2.default.bold('\nTest Summary\n'));
  process.stdout.write('> ' + total + ' stories tested.\n');
  if (matched > 0) {
    process.stdout.write(_chalk2.default.green('> ' + matched + '/' + total + ' stories matched with snapshots.\n'));
  }
  if (unmatched > 0) {
    process.stdout.write(_chalk2.default.red('> ' + unmatched + '/' + total + ' differed from snapshots.\n'));
  }
  if (updated > 0) {
    process.stdout.write(_chalk2.default.cyan('> ' + updated + ' snapshots updated to match current stories.\n'));
  }
  if (added > 0) {
    process.stdout.write(_chalk2.default.cyan('> ' + added + ' snapshots newly added.\n'));
  }
  if (errored > 0) {
    process.stdout.write(_chalk2.default.red('> ' + errored + ' tests errored.\n'));
  }
  if (obsolete > 0) {
    process.stdout.write(_chalk2.default.cyan('> ' + obsolete + ' unused snapshots remaining. Run with -u to remove them.\n'));
  }
}

var Runner = function () {
  function Runner(options) {
    (0, _classCallCheck3.default)(this, Runner);
    var _options$configDir = options.configDir,
        configDir = _options$configDir === undefined ? './.storybook' : _options$configDir,
        _options$update = options.update,
        update = _options$update === undefined ? false : _options$update,
        _options$updateIntera = options.updateInteractive,
        updateInteractive = _options$updateIntera === undefined ? false : _options$updateIntera,
        storyshotDir = options.storyshotDir,
        _options$extension = options.extension,
        extension = _options$extension === undefined ? 'shot' : _options$extension;


    this.runner = new _visual_runner2.default({ configDir: configDir, update: update, updateInteractive: updateInteractive, storyshotDir: storyshotDir, extension: extension });
  }

  (0, _createClass3.default)(Runner, [{
    key: 'updateState',
    value: function updateState(result) {
      this.testState[result.state] += 1;
      logState(result);
    }
  }, {
    key: 'start',
    value: function start() {
      this.testState = {
        added: 0,
        matched: 0,
        unmatched: 0,
        updated: 0,
        obsolete: 0,
        errored: 0
      };
    }
  }, {
    key: 'end',
    value: function end() {
      logSummary(this.testState);
    }
  }, {
    key: 'run',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(storybook) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, group, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, story, results, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, r;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.start();

                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 4;
                _iterator = (0, _getIterator3.default)(storybook);

              case 6:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 72;
                  break;
                }

                group = _step.value;
                _context.prev = 8;

                this.runner.startKind(group.kind);
                this.updateState({ state: 'started-kind', name: group.kind });
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 14;
                _iterator2 = (0, _getIterator3.default)(group.stories);

              case 16:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context.next = 49;
                  break;
                }

                story = _step2.value;
                _context.prev = 18;
                _context.next = 21;
                return this.runner.runStory(story);

              case 21:
                results = _context.sent;
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context.prev = 25;

                for (_iterator3 = (0, _getIterator3.default)(results); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  r = _step3.value;

                  this.updateState((0, _extends3.default)({ name: story.name }, r));
                }
                _context.next = 33;
                break;

              case 29:
                _context.prev = 29;
                _context.t0 = _context['catch'](25);
                _didIteratorError3 = true;
                _iteratorError3 = _context.t0;

              case 33:
                _context.prev = 33;
                _context.prev = 34;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 36:
                _context.prev = 36;

                if (!_didIteratorError3) {
                  _context.next = 39;
                  break;
                }

                throw _iteratorError3;

              case 39:
                return _context.finish(36);

              case 40:
                return _context.finish(33);

              case 41:
                _context.next = 46;
                break;

              case 43:
                _context.prev = 43;
                _context.t1 = _context['catch'](18);

                // Error on story
                this.updateState({ state: 'errored', message: _context.t1, name: story.name });

              case 46:
                _iteratorNormalCompletion2 = true;
                _context.next = 16;
                break;

              case 49:
                _context.next = 55;
                break;

              case 51:
                _context.prev = 51;
                _context.t2 = _context['catch'](14);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t2;

              case 55:
                _context.prev = 55;
                _context.prev = 56;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 58:
                _context.prev = 58;

                if (!_didIteratorError2) {
                  _context.next = 61;
                  break;
                }

                throw _iteratorError2;

              case 61:
                return _context.finish(58);

              case 62:
                return _context.finish(55);

              case 63:
                this.runner.endKind();
                _context.next = 69;
                break;

              case 66:
                _context.prev = 66;
                _context.t3 = _context['catch'](8);

                // Error on kind
                this.updateState({ state: 'errored-kind', message: _context.t3, name: group.kind });

              case 69:
                _iteratorNormalCompletion = true;
                _context.next = 6;
                break;

              case 72:
                _context.next = 78;
                break;

              case 74:
                _context.prev = 74;
                _context.t4 = _context['catch'](4);
                _didIteratorError = true;
                _iteratorError = _context.t4;

              case 78:
                _context.prev = 78;
                _context.prev = 79;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 81:
                _context.prev = 81;

                if (!_didIteratorError) {
                  _context.next = 84;
                  break;
                }

                throw _iteratorError;

              case 84:
                return _context.finish(81);

              case 85:
                return _context.finish(78);

              case 86:

                this.end();
                return _context.abrupt('return', this.testState);

              case 88:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 74, 78, 86], [8, 66], [14, 51, 55, 63], [18, 43], [25, 29, 33, 41], [34,, 36, 40], [56,, 58, 62], [79,, 81, 85]]);
      }));

      function run(_x) {
        return _ref2.apply(this, arguments);
      }

      return run;
    }()
  }]);
  return Runner;
}();

exports.default = Runner;