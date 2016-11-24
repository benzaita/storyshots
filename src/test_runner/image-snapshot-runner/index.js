import render from './render'
import compare from './compare'
import SnapshotStore from './SnapshotStore'
import diff from './diff'

class SnapshotState {
  constructor(dunno, shouldUpdate, kindSnapshotsFilePath) {
    this.update = false
    this.updated = 0
    this.added = 0
    this.matched = 0
    this.unmatched = 0

    this.expectedResults = new SnapshotStore(kindSnapshotsFilePath)
    this.checkedKeys = []
    this.options = {
      compare: {}
    }
  }

  removeUncheckedKeys() {
    this.expectedResults.leave(this.checkedKeys)
  }

  save() {
    this.expectedResults.save()
  }

  match(storyName, actual) {
    this.checkedKeys.push(storyName)

    if (this.update) {
      this.expectedResults.update(storyName, actual)
      return
    }

    const expected = this.expectedResults.get(storyName)

    if (expected == null) {
      this.expectedResults.add(storyName, actual)
      this.added++
    } else {
      if (compare(expected, actual, this.options.compare)) {
        this.matched++
      } else {
        this.unmatched++
      }
    }

    return {
      expected,
      actual
    }
  }
}

export {
  SnapshotState,
  diff,
  render
}