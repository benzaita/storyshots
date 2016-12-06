'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pageres = require('pageres');

var _pageres2 = _interopRequireDefault(_pageres);

var _fsExtra = require('fs-extra');

var _imageDiff = require('image-diff');

var _imageDiff2 = _interopRequireDefault(_imageDiff);

var _promptly = require('promptly');

var _promptly2 = _interopRequireDefault(_promptly);

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('storyshots-VisualRunner');

var VisualRunner = function () {
  function VisualRunner(_ref) {
    var configDir = _ref.configDir,
        update = _ref.update,
        updateInteractive = _ref.updateInteractive,
        storyshotDir = _ref.storyshotDir,
        extension = _ref.extension;
    (0, _classCallCheck3.default)(this, VisualRunner);

    debug({ configDir: configDir, update: update, updateInteractive: updateInteractive, storyshotDir: storyshotDir, extension: extension });

    this.storyshotDir = storyshotDir ? _path2.default.resolve(storyshotDir) : _path2.default.resolve(configDir, '__storyshots__');
    this.refShotsBaseDir = _path2.default.resolve(this.storyshotDir, 'reference');
    this.currentShotsBaseDir = _path2.default.resolve(this.storyshotDir, 'current');
    this.diffsBaseDir = _path2.default.resolve(this.storyshotDir, 'diff');

    this.shouldUpdate = update;
    this.updateInteractive = updateInteractive;

    this.options = (0, _extends3.default)({
      resolutions: [],
      port: 9010
    }, readJsonIfExists(_path2.default.resolve(this.storyshotDir, 'storyshots.json')));
    debug('options:', this.options);
  }

  (0, _createClass3.default)(VisualRunner, [{
    key: 'startKind',
    value: function startKind(kind) {
      this.currentKind = kind;

      var sanitizedKind = (0, _sanitizeFilename2.default)(kind);

      this.currentShotsDir = _path2.default.resolve(this.currentShotsBaseDir, sanitizedKind);
      this.refShotsDir = _path2.default.resolve(this.refShotsBaseDir, sanitizedKind);
      this.diffsDir = _path2.default.resolve(this.diffsBaseDir, sanitizedKind);

      (0, _fsExtra.removeSync)(this.currentShotsDir);
      (0, _fsExtra.removeSync)(this.diffsDir);

      (0, _fsExtra.mkdirpSync)(this.refShotsDir);
      (0, _fsExtra.mkdirpSync)(this.diffsDir);
      (0, _fsExtra.mkdirpSync)(this.currentShotsDir);
    }
  }, {
    key: 'endKind',
    value: function endKind() {
      this.currentKind = undefined;
    }
  }, {
    key: 'runStory',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(story) {
        var url, screenshots, shotsAndRefs, shotsWithoutRefs, shotsWithRefs, compareResults, mismatchedResults, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, r;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                url = generateStorybookUrl(this.currentKind, story.name, this.options);
                _context.next = 3;
                return captureScreenshots((0, _extends3.default)({
                  url: url,
                  baseFilename: (0, _sanitizeFilename2.default)('' + story.name),
                  destDir: this.currentShotsDir
                }, this.options));

              case 3:
                screenshots = _context.sent;

                debug({ screenshots: screenshots });

                shotsAndRefs = screenshots.map(addFilenames({
                  refShotsDir: this.refShotsDir,
                  currentShotsDir: this.currentShotsDir,
                  diffsDir: this.diffsDir
                }));
                shotsWithoutRefs = shotsAndRefs.filter(function (_ref3) {
                  var reference = _ref3.reference;
                  return !(0, _fsExtra.existsSync)(reference);
                });
                shotsWithRefs = shotsAndRefs.filter(function (_ref4) {
                  var reference = _ref4.reference;
                  return (0, _fsExtra.existsSync)(reference);
                });

                debug({ shotsWithRefs: shotsWithRefs, shotsWithoutRefs: shotsWithoutRefs });

                shotsWithoutRefs.forEach(addReferenceShot);

                _context.next = 12;
                return _promise2.default.all(shotsWithRefs.map(compareWithReference));

              case 12:
                compareResults = _context.sent;
                mismatchedResults = compareResults.filter(function (r) {
                  return r.isMismatch;
                });

                debug(mismatchedResults);

                if (!(this.updateInteractive || this.shouldUpdate)) {
                  _context.next = 42;
                  break;
                }

                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 19;
                _iterator = (0, _getIterator3.default)(mismatchedResults);

              case 21:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 28;
                  break;
                }

                r = _step.value;
                _context.next = 25;
                return this.updateReferenceShot(r);

              case 25:
                _iteratorNormalCompletion = true;
                _context.next = 21;
                break;

              case 28:
                _context.next = 34;
                break;

              case 30:
                _context.prev = 30;
                _context.t0 = _context['catch'](19);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 34:
                _context.prev = 34;
                _context.prev = 35;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 37:
                _context.prev = 37;

                if (!_didIteratorError) {
                  _context.next = 40;
                  break;
                }

                throw _iteratorError;

              case 40:
                return _context.finish(37);

              case 41:
                return _context.finish(34);

              case 42:
                return _context.abrupt('return', formatResults({
                  added: shotsWithoutRefs,
                  updated: mismatchedResults.filter(function (r) {
                    return r.referenceUpdated;
                  }),
                  unmatched: mismatchedResults.filter(function (r) {
                    return !r.referenceUpdated;
                  }),
                  matched: compareResults.filter(function (r) {
                    return !r.isMismatch;
                  }),
                  errored: []
                }));

              case 43:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[19, 30, 34, 42], [35,, 37, 41]]);
      }));

      function runStory(_x) {
        return _ref2.apply(this, arguments);
      }

      return runStory;
    }()
  }, {
    key: 'updateReferenceShot',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(compareResult) {
        var shouldUpdate;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = this.shouldUpdate;

                if (_context2.t0) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 4;
                return this.confirmUpate(compareResult);

              case 4:
                _context2.t0 = _context2.sent;

              case 5:
                shouldUpdate = _context2.t0;

                if (shouldUpdate) {
                  (0, _fsExtra.copySync)(compareResult.current, compareResult.reference);
                  compareResult.referenceUpdated = true;
                }

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function updateReferenceShot(_x2) {
        return _ref5.apply(this, arguments);
      }

      return updateReferenceShot;
    }()
  }, {
    key: 'confirmUpate',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(compareResult) {
        var ans;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                process.stdout.write('Mismatch:\n');
                process.stdout.write(formatDiffMessage(compareResult));
                process.stdout.write('\n');

                _context3.next = 5;
                return _promptly2.default.prompt('Update snapshot? (y/n)');

              case 5:
                ans = _context3.sent;

              case 6:
                if (!(ans !== 'y' && ans !== 'n')) {
                  _context3.next = 13;
                  break;
                }

                process.stdout.write('Enter only y (yes) or n (no)\n');
                _context3.next = 10;
                return _promptly2.default.prompt('Update snapshot? (y/n)');

              case 10:
                ans = _context3.sent;
                _context3.next = 6;
                break;

              case 13:
                process.stdout.write('\n');

                return _context3.abrupt('return', ans === 'y');

              case 15:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function confirmUpate(_x3) {
        return _ref6.apply(this, arguments);
      }

      return confirmUpate;
    }()
  }]);
  return VisualRunner;
}();

var addReferenceShot = function addReferenceShot(_ref7) {
  var current = _ref7.current,
      reference = _ref7.reference;

  (0, _fsExtra.copySync)(current, reference);
};

var addFilenames = function addFilenames(_ref8) {
  var refShotsDir = _ref8.refShotsDir,
      currentShotsDir = _ref8.currentShotsDir,
      diffsDir = _ref8.diffsDir;
  return function (_ref9) {
    var name = _ref9.name,
        filename = _ref9.filename;
    return {
      name: name,
      current: _path2.default.resolve(currentShotsDir, filename),
      reference: _path2.default.resolve(refShotsDir, filename),
      diff: _path2.default.resolve(diffsDir, filename)
    };
  };
};

var readJsonIfExists = function readJsonIfExists(filename) {
  return (0, _fsExtra.existsSync)(filename) ? JSON.parse((0, _fsExtra.readFileSync)(filename)) : {};
};

var generateStorybookUrl = function generateStorybookUrl(kind, story, _ref10) {
  var port = _ref10.port;
  return 'http://localhost:' + port + '/iframe.html?inStoryshots' + '&selectedKind=' + encodeURIComponent(kind) + '&selectedStory=' + encodeURIComponent(story);
};

var captureScreenshots = function captureScreenshots(_ref11) {
  var url = _ref11.url,
      baseFilename = _ref11.baseFilename,
      destDir = _ref11.destDir,
      _ref11$resolutions = _ref11.resolutions,
      resolutions = _ref11$resolutions === undefined ? [] : _ref11$resolutions,
      _ref11$delay = _ref11.delay,
      delay = _ref11$delay === undefined ? 0 : _ref11$delay;

  var pageres = new _pageres2.default({
    delay: delay,
    filename: removeSpaces(baseFilename) + '.<%= size %>'
  });

  pageres.src(url, resolutions, { crop: false });
  pageres.dest(destDir);

  return pageres.run().then(function (streams) {
    return streams.map(function (s) {
      return {
        filename: s.filename,
        name: baseFilename + ' (' + filenameToResolution(s.filename) + ')'
      };
    });
  });
};

var removeSpaces = function removeSpaces(str) {
  return str.replace(/\s/g, '_');
};

var filenameToResolution = function filenameToResolution(filename) {
  return (/\.([0-9]+x[0-9]+)\.png$/.exec(filename)[1]
  );
};

var compareWithReference = function compareWithReference(_ref12) {
  var name = _ref12.name,
      current = _ref12.current,
      reference = _ref12.reference,
      diff = _ref12.diff;

  return new _promise2.default(function (resolve, reject) {
    (0, _imageDiff2.default)({
      expectedImage: reference,
      actualImage: current,
      diffImage: diff,
      shadow: true
    }, function (err, imagesAreSame) {
      if (err) {
        reject(err);
      } else {
        resolve({
          name: name,
          isMismatch: !imagesAreSame,
          current: current,
          reference: reference,
          diff: diff
        });
      }
    });
  });
};

var formatResults = function formatResults(_ref13) {
  var added = _ref13.added,
      updated = _ref13.updated,
      unmatched = _ref13.unmatched,
      matched = _ref13.matched,
      errored = _ref13.errored;
  return [].concat((0, _toConsumableArray3.default)(added.map(function (r) {
    return { name: r.name, state: 'added' };
  })), (0, _toConsumableArray3.default)(updated.map(function (r) {
    return { name: r.name, state: 'updated' };
  })), (0, _toConsumableArray3.default)(unmatched.map(function (r) {
    return { name: r.name, state: 'unmatched', message: formatDiffMessage(r) };
  })), (0, _toConsumableArray3.default)(matched.map(function (r) {
    return { name: r.name, state: 'matched' };
  })), (0, _toConsumableArray3.default)(errored.map(function (r) {
    return { name: r.name, state: 'errored', message: '' };
  })));
};

var formatDiffMessage = function formatDiffMessage(_ref14) {
  var reference = _ref14.reference,
      current = _ref14.current,
      diff = _ref14.diff;
  return '\n  Reference: ' + reference + '\n  Current:   ' + current + '\n  Diff:      ' + diff + '\n';
};

exports.default = VisualRunner;