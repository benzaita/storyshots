"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterStorybook = filterStorybook;
/* eslint import/prefer-default-export: 0 */

function filterStorybook(storybook, grep, ignore) {
  if (!grep && !ignore) {
    // speed up for simple common case
    return storybook;
  }

  var grepRe = new RegExp(grep);
  var ignoreRe = new RegExp(ignore);

  var filter = function filter(name) {
    if (ignore && ignoreRe.test(name)) {
      return false;
    }

    return grepRe.test(name);
  };

  var filteredStorybook = [];

  storybook.forEach(function (group) {
    if (ignore && ignoreRe.test(group.kind)) {
      return;
    }

    if (grep && grepRe.test(group.kind)) {
      filteredStorybook.push(group);
      return;
    }

    var filteredStories = group.stories.filter(function (story) {
      return filter(story.name);
    });

    if (filteredStories.length === 0) {
      return;
    }

    var filteredGroup = {
      kind: group.kind,
      stories: filteredStories
    };

    filteredStorybook.push(filteredGroup);
  });

  return filteredStorybook;
}