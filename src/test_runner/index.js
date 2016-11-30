import chalk from 'chalk';
// import SnapshotRunner from './snapshot_runner';
import VisualRunner from './visual_runner';

function logState({ state, name, message }) {
  switch (state) {
    case 'added':
      process.stdout.write(chalk.cyan(`+ ${name}: Added`));
      break;
    case 'updated':
      process.stdout.write(chalk.cyan(`● ${name}: Updated`));
      break;
    case 'matched':
      process.stdout.write(chalk.green(`✓ ${name}`));
      break;
    case 'unmatched':
      process.stdout.write('\n');
      process.stdout.write(chalk.red(`✗ ${name}\n`));
      process.stdout.write(`  ${message.split('\n').join('\n  ')}`);
      process.stdout.write('\n');
      break;
    case 'errored':
    case 'errored-kind': // eslint-disable-line
      process.stdout.write('\n');
      process.stdout.write(chalk.red(`✗ ${name}: ERROR\n`));
      const output = message.stack || message;
      process.stdout.write(chalk.dim(`  ${output.split('\n').join('\n  ')}`));
      process.stdout.write('\n');
      break;
    case 'started-kind':
      process.stdout.write('\n');
      process.stdout.write(chalk.underline(name));
      break;
    default:
      process.stdout.write(`Error occured when testing ${state}: ${message}`);
  }
  process.stdout.write('\n');
}

function logSummary(state) {
  const { added, matched, unmatched, updated, errored, obsolete } = state;
  const total = added + matched + unmatched + updated + errored;
  process.stdout.write(chalk.bold('\nTest Summary\n'));
  process.stdout.write(`> ${total} stories tested.\n`);
  if (matched > 0) {
    process.stdout.write(chalk.green(`> ${matched}/${total} stories matched with snapshots.\n`));
  }
  if (unmatched > 0) {
    process.stdout.write(chalk.red(`> ${unmatched}/${total} differed from snapshots.\n`));
  }
  if (updated > 0) {
    process.stdout.write(chalk.cyan(`> ${updated} snapshots updated to match current stories.\n`));
  }
  if (added > 0) {
    process.stdout.write(chalk.cyan(`> ${added} snapshots newly added.\n`));
  }
  if (errored > 0) {
    process.stdout.write(chalk.red(`> ${errored} tests errored.\n`));
  }
  if (obsolete > 0) {
    process.stdout.write(chalk.cyan(`> ${obsolete} unused snapshots remaining. Run with -u to remove them.\n`));
  }
}

export default class Runner {
  constructor(options) {
    const {
      configDir = './.storybook',
      update = false,
      updateInteractive = false,
      storyshotDir,
      extension = 'shot',
    } = options;

    this.runner = new VisualRunner(
      { configDir, update, updateInteractive, storyshotDir, extension });
  }

  updateState(result) {
    this.testState[result.state] += 1;
    logState(result);
  }

  start() {
    this.testState = {
      added: 0,
      matched: 0,
      unmatched: 0,
      updated: 0,
      obsolete: 0,
      errored: 0,
    };
  }

  end() {
    logSummary(this.testState);
  }

  async run(storybook) {
    this.start();

    for (const group of storybook) {
      try {
        this.runner.startKind(group.kind);
        this.updateState({ state: 'started-kind', name: group.kind });
        for (const story of group.stories) {
          try {
            const results = await this.runner.runStory(story);
            for (const r of results) {
              this.updateState({ name: story.name, ...r });
            }
          } catch (err) {
            // Error on story
            this.updateState({ state: 'errored', message: err, name: story.name });
          }
        }
        this.runner.endKind();
      } catch (err) {
        // Error on kind
        this.updateState({ state: 'errored-kind', message: err, name: group.kind });
      }
    }

    this.end();
    return this.testState;
  }
}
