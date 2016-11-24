const debug = require('debug')('storyshots-store')

class SnapshotStore {
  constructor(path) {
    this.path = path

    debug('loading snapshots from:', path)
  }

  save() {
    debug('saving snapshots to:', this.path)
  }

  update(key, value) {
    debug(`updating ${key} to ${value}`)
  }

  get(key) {
    debug(`getting value for ${key}`)
    return 'foo'
  }

  add(key, value) {
    debug(`adding ${key}=${value}`)
  }

  leave(keys) {
    debug('removing everything except:', keys)
  }
}

export default SnapshotStore
