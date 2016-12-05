// IMPORTANT
// ---------
// This is an auto generated file with React CDK.
// Do not modify this file.

import { configure, getStorybook } from '@kadira/storybook';
import { exportStories, runningInStoryshots, disableRafAnimations, disableCssAnimations } from './storyshots-helpers';

if (runningInStoryshots()) {
  disableRafAnimations()
  disableCssAnimations()
}

function loadStories() {
  require('../examples');
}

configure(loadStories, module);

exportStories(getStorybook())
