import { SnapshotState } from 'jest-snapshot';
import ReactTestRenderer from 'react-test-renderer';
import diff from 'jest-diff';

const render = (story, context) => {
  const tree = story.render(context);
  const renderer = ReactTestRenderer.create(tree);
  const actual = renderer.toJSON();

  return actual
}

export {
  SnapshotState,
  diff,
  render
}