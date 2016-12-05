import path from 'path'
import Pageres from 'pageres'
import {existsSync, readFileSync, copySync, mkdirpSync, removeSync} from 'fs-extra'
import BlinkDiff from 'blink-diff'
import promptly from 'promptly';
import sanitize from 'sanitize-filename'

const debug = require('debug')('storyshots-VisualRunner')

class VisualRunner {
  constructor({ configDir, update, updateInteractive, storyshotDir, extension }) {
    debug({ configDir, update, updateInteractive, storyshotDir, extension })

    this.storyshotDir = storyshotDir ? path.resolve(storyshotDir) : path.resolve(configDir, '__storyshots__');
    this.refShotsBaseDir = path.resolve(this.storyshotDir, 'reference')
    this.currentShotsBaseDir = path.resolve(this.storyshotDir, 'current')
    this.diffsBaseDir = path.resolve(this.storyshotDir, 'diff')

    this.shouldUpdate = update
    this.updateInteractive = updateInteractive

    this.options = {
      diff: {
        thresholdType: BlinkDiff.THRESHOLD_PERCENT,
        threshold: 0.1
      },
      resolutions: [],
      port: 9010,
      ...readJsonIfExists(path.resolve(this.storyshotDir, 'storyshots.json'))
    }
    debug('options:', this.options)
  }

  startKind(kind) {
    this.currentKind = kind

    const sanitizedKind = sanitize(kind)

    this.currentShotsDir = path.resolve(this.currentShotsBaseDir, sanitizedKind)
    this.refShotsDir = path.resolve(this.refShotsBaseDir, sanitizedKind)
    this.diffsDir = path.resolve(this.diffsBaseDir, sanitizedKind)

    removeSync(this.currentShotsDir)
    removeSync(this.diffsDir)

    mkdirpSync(this.refShotsDir)
    mkdirpSync(this.diffsDir)
    mkdirpSync(this.currentShotsDir)
  }

  endKind() {
    this.currentKind = undefined
  }

  async runStory(story) {
    const url = generateStorybookUrl(this.currentKind, story.name, this.options)

    const screenshots = await captureScreenshots({
      url,
      baseFilename: sanitize(`${story.name}`),
      destDir: this.currentShotsDir,
      ...this.options
    })
    debug({screenshots})

    const shotsAndRefs = screenshots.map(addFilenames({
      refShotsDir: this.refShotsDir,
      currentShotsDir: this.currentShotsDir,
      diffsDir: this.diffsDir
    }))

    const shotsWithoutRefs = shotsAndRefs.filter(({reference}) => !existsSync(reference))
    const shotsWithRefs = shotsAndRefs.filter(({reference}) => existsSync(reference))
    debug({shotsWithRefs, shotsWithoutRefs})

    shotsWithoutRefs.forEach(addReferenceShot)

    const compareResults = await Promise.all(shotsWithRefs.map(compareWithReference(this.options.diff)))

    const mismatchedResults = compareResults.filter((r) => r.isMismatch)
    debug(mismatchedResults)

    if (this.updateInteractive || this.shouldUpdate) {
      for (const r of mismatchedResults) {
        await this.updateReferenceShot(r)
      }
    }

    return formatResults({
      added: shotsWithoutRefs,
      updated: mismatchedResults.filter((r) => r.referenceUpdated),
      unmatched: mismatchedResults.filter((r) => !r.referenceUpdated),
      matched: compareResults.filter((r) => !r.isMismatch),
      errored: []
    })
  }

  async updateReferenceShot(compareResult) {
    const shouldUpdate = this.shouldUpdate || await this.confirmUpate(compareResult)
    if (shouldUpdate) {
      copySync(compareResult.current, compareResult.reference)
      compareResult.referenceUpdated = true
    }
  }

  async confirmUpate(compareResult) {
    process.stdout.write('Mismatch:\n')
    process.stdout.write(formatDiffMessage(compareResult))
    process.stdout.write('\n')

    let ans = await promptly.prompt('Update snapshot? (y/n)');
    while (ans !== 'y' && ans !== 'n') {
      process.stdout.write('Enter only y (yes) or n (no)\n');
      ans = await promptly.prompt('Update snapshot? (y/n)');
    }
    process.stdout.write('\n');

    return ans === 'y';
  }

}

const addReferenceShot = ({current, reference}) => {
  copySync(current, reference)
}

const addFilenames = ({refShotsDir, currentShotsDir, diffsDir}) => ({name, filename}) => ({
  name,
  current: path.resolve(currentShotsDir, filename),
  reference: path.resolve(refShotsDir, filename),
  diff: path.resolve(diffsDir, filename)
})

const readJsonIfExists = (filename) => (
  existsSync(filename) ? JSON.parse(readFileSync(filename)) : {}
)

const generateStorybookUrl = (kind, story, {port}) => (
  'http://localhost:' +
  port +
  '/?selectedKind=' + 
  encodeURIComponent(kind) + 
  '&selectedStory=' +
  encodeURIComponent(story) +
  '&full=1'
)

const captureScreenshots = ({url, baseFilename, destDir, resolutions=[], delay=0}) => {
  const pageres = new Pageres({
    delay,
    filename: `${baseFilename}.<%= size %>`
  })

  pageres.src(url, resolutions)
  pageres.dest(destDir)

  return pageres.run().then(streams => streams.map(s => ({
    filename: s.filename,
    name: `${baseFilename} (${filenameToResolution(s.filename)})`
  })))
}

const filenameToResolution = (filename) => (/\.([0-9]+x[0-9]+)\.png$/.exec(filename)[1])

const compareWithReference = ({options}) => ({name, current, reference, diff}) => {
  const blinkdiff = new BlinkDiff({
    imageAPath: current,
    imageBPath: reference,
    imageOutputPath: diff,

    ...options
  })

  return new Promise((resolve, reject) => {
    blinkdiff.run((err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          name: name,
          isMismatch: result.code !== BlinkDiff.RESULT_IDENTICAL,
          current,
          reference,
          diff
        })
      }
    })
  })
}

const formatResults = ({added, updated, unmatched, matched, errored}) => (
 [
  ...added    .map(r => ({name: r.name, state: 'added'})),
  ...updated  .map(r => ({name: r.name, state: 'updated'})),
  ...unmatched.map(r => ({name: r.name, state: 'unmatched', message: formatDiffMessage(r)})),
  ...matched  .map(r => ({name: r.name, state: 'matched'})),
  ...errored  .map(r => ({name: r.name, state: 'errored', message: ''}))
  ]
)

const formatDiffMessage = ({reference, current, diff}) => (
`
  Reference: ${reference}
  Current:   ${current}
  Diff:      ${diff}
`
)

export default VisualRunner
