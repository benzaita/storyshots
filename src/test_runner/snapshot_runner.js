/* eslint class-methods-use-this:0 */

import path from 'path';
import promptly from 'promptly';
import { diff, render, SnapshotState } from './image-snapshot-runner'

export default class SnapshotRunner {
  constructor({ configDir, update, updateInteractive, storyshotDir, extension }) {
    this.configDir = configDir;
    this.kind = '';
    this.update = update;
    this.interactive = updateInteractive;
    this.storyshotDir = storyshotDir ? path.resolve(storyshotDir) : path.resolve(configDir, '__storyshots__');
    this.extension = extension || 'shot';
  }

  getStoryshotPath(kind) {
    return path.join(this.storyshotDir, `${kind}.${this.extension}`);
  }

  startKind(kind) {
    const filePath = this.getStoryshotPath(kind);
    this.state = new SnapshotState('', this.update, filePath);
    this.kind = kind;
    const { updated, added, matched, unmatched } = this.state;
    this.testOutcomes = { updated, added, matched, unmatched };
  }

  getOutcome() {
    const { updated, added, matched, unmatched } = this.state;
    const {
      updated: prevUpdated,
      added: prevAdded,
      matched: prevMatched,
      unmatched: prevUnmatched,
    } = this.testOutcomes;
    this.testOutcomes = { updated, added, matched, unmatched };

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

  async runStory(story) {
    const state = this.state;
    const key = story.name;
    const context = { kind: this.kind, story: story.name };
    const actual = render(story, context)

    const result = state.match(story.name, actual, key);

    const outcome = this.getOutcome();

    if (outcome !== 'unmatched') {
      return { state: outcome };
    }

    const diffMessage = diff(
      result.expected.trim(),
      result.actual.trim(),
      {
        aAnnotation: 'Snapshot',
        bAnnotation: 'Current story',
      },
    );

    if (this.interactive) {
      const shouldUpdate = await this.confirmUpate(diffMessage);
      if (shouldUpdate) {
        state.update = true;
        state.match(story.name, actual, key);
        state.update = false;
        return { state: 'updated' };
      }
    }

    return { state: 'unmatched', message: diffMessage };
  }

  endKind() {
    const state = this.state;
    if (this.update) {
      state.removeUncheckedKeys();
    }
    state.save(this.update);
  }

  async confirmUpate(diffMessage) {
    process.stdout.write('\nReceived story is different from stored snapshot.\n');
    process.stdout.write(`  ${diffMessage.split('\n').join('\n  ')}`);
    let ans = await promptly.prompt('Update snapshot? (y/n)');
    while (ans !== 'y' && ans !== 'n') {
      process.stdout.write('Enter only y (yes) or n (no)\n');
      ans = await promptly.prompt('Update snapshot? (y/n)');
    }
    process.stdout.write('\n');

    return ans === 'y';
  }
}
