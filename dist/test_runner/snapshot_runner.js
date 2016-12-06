'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jestSnapshot = require('jest-snapshot');

var _reactTestRenderer = require('react-test-renderer');

var _reactTestRenderer2 = _interopRequireDefault(_reactTestRenderer);

var _jestDiff = require('jest-diff');

var _jestDiff2 = _interopRequireDefault(_jestDiff);

var _promptly = require('promptly');

var _promptly2 = _interopRequireDefault(_promptly);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SnapshotRunner = function () {
  function SnapshotRunner(_ref) {
    var configDir = _ref.configDir,
        update = _ref.update,
        updateInteractive = _ref.updateInteractive,
        storyshotDir = _ref.storyshotDir,
        extension = _ref.extension;
    (0, _classCallCheck3.default)(this, SnapshotRunner);

    this.configDir = configDir;
    this.kind = '';
    this.update = update;
    this.interactive = updateInteractive;
    this.storyshotDir = storyshotDir ? _path2.default.resolve(storyshotDir) : _path2.default.resolve(configDir, '__storyshots__');
    this.extension = extension || 'shot';
  }

  (0, _createClass3.default)(SnapshotRunner, [{
    key: 'getStoryshotPath',
    value: function getStoryshotPath(kind) {
      return _path2.default.join(this.storyshotDir, kind + '.' + this.extension);
    }
  }, {
    key: 'startKind',
    value: function startKind(kind) {
      var filePath = this.getStoryshotPath(kind);
      this.state = new _jestSnapshot.SnapshotState('', this.update, filePath);
      this.kind = kind;
      var _state = this.state,
          updated = _state.updated,
          added = _state.added,
          matched = _state.matched,
          unmatched = _state.unmatched;

      this.testOutcomes = { updated: updated, added: added, matched: matched, unmatched: unmatched };
    }
  }, {
    key: 'getOutcome',
    value: function getOutcome() {
      var _state2 = this.state,
          updated = _state2.updated,
          added = _state2.added,
          matched = _state2.matched,
          unmatched = _state2.unmatched;
      var _testOutcomes = this.testOutcomes,
          prevUpdated = _testOutcomes.updated,
          prevAdded = _testOutcomes.added,
          prevMatched = _testOutcomes.matched,
          prevUnmatched = _testOutcomes.unmatched;

      this.testOutcomes = { updated: updated, added: added, matched: matched, unmatched: unmatched };

      switch (true) {
        case matched > prevMatched:
          return 'matched';
        case updated > prevUpdated:
          return 'updated';
        case added > prevAdded:
          return 'added';
        case unmatched > prevUnmatched:
          return 'unmatched';
        default:
          return 'errored';
      }
    }
  }, {
    key: 'runStory',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(story) {
        var state, key, context, tree, renderer, actual, result, outcome, diffMessage, shouldUpdate;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                state = this.state;
                key = story.name;
                context = { kind: this.kind, story: story.name };
                tree = story.render(context);
                renderer = _reactTestRenderer2.default.create(tree);
                actual = renderer.toJSON();
                result = state.match(story.name, actual, key);
                outcome = this.getOutcome();

                if (!(outcome !== 'unmatched')) {
                  _context.next = 10;
                  break;
                }

                return _context.abrupt('return', { state: outcome });

              case 10:
                diffMessage = (0, _jestDiff2.default)(result.expected.trim(), result.actual.trim(), {
                  aAnnotation: 'Snapshot',
                  bAnnotation: 'Current story'
                });

                if (!this.interactive) {
                  _context.next = 20;
                  break;
                }

                _context.next = 14;
                return this.confirmUpate(diffMessage);

              case 14:
                shouldUpdate = _context.sent;

                if (!shouldUpdate) {
                  _context.next = 20;
                  break;
                }

                state.update = true;
                state.match(story.name, actual, key);
                state.update = false;
                return _context.abrupt('return', { state: 'updated' });

              case 20:
                return _context.abrupt('return', { state: 'unmatched', message: diffMessage });

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function runStory(_x) {
        return _ref2.apply(this, arguments);
      }

      return runStory;
    }()
  }, {
    key: 'endKind',
    value: function endKind() {
      var state = this.state;
      if (this.update) {
        state.removeUncheckedKeys();
      }
      state.save(this.update);
    }
  }, {
    key: 'confirmUpate',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(diffMessage) {
        var ans;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                process.stdout.write('\nReceived story is different from stored snapshot.\n');
                process.stdout.write('  ' + diffMessage.split('\n').join('\n  '));
                _context2.next = 4;
                return _promptly2.default.prompt('Update snapshot? (y/n)');

              case 4:
                ans = _context2.sent;

              case 5:
                if (!(ans !== 'y' && ans !== 'n')) {
                  _context2.next = 12;
                  break;
                }

                process.stdout.write('Enter only y (yes) or n (no)\n');
                _context2.next = 9;
                return _promptly2.default.prompt('Update snapshot? (y/n)');

              case 9:
                ans = _context2.sent;
                _context2.next = 5;
                break;

              case 12:
                process.stdout.write('\n');

                return _context2.abrupt('return', ans === 'y');

              case 14:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function confirmUpate(_x2) {
        return _ref3.apply(this, arguments);
      }

      return confirmUpate;
    }()
  }]);
  return SnapshotRunner;
}(); /* eslint class-methods-use-this:0 */

exports.default = SnapshotRunner;