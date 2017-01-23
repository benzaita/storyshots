# Storyshots*

This is a fork of https://github.com/storybooks/storyshots .

The original version of Storyshots renders the stories into a textual JSON representation of the components (a "snapshot"). It then compares the current snapshot with the committed, reference snapshot and produces a textual diff, like this:

![UI Changes](docs/screenshot.png)

This fork renders the stories in a PhantomJS browser and takes a screenshot of the result (a "snapshot"). The visual diff looks like this:

TBD - add screenshot

## Quick Overview of how Storyshots and Storybook Work

Storybook:

* Storybook is the tool that renders and serves the stories; Storyshots compares snapshots of these stories
* Storybook has two main components: a web server and a web-app
* The code that creates stories runs **in the browser**, and has a dependency on your components, stylesheets, images, React, etc..
* The Storybook web-server merely bundles the code that creates the stories (along with their dependencies) using Webpack, and serves the bundle

Storyshots:

* A Node application (**not** running in the browser)
* Works in two main steps - enumerating the stories (the test cases), and then iterating them
* Enumerates the stories by running the Storybook configuration file (using `vm.runInThisContext()`). Remember that this is code that is meant to be run in the browser, and has many dependencies. To deal with that Storyshots:
  * Does **not** use Webpack. Instead allows you to define "loaders" that preprocess the code
  * Polyfills some of the browser functionality that the componenets/stories might expect (e.g. `document` and `window`)

## Changes from the Original Version

- Using Webpack instead of custom "loaders". Provide the Webpack configuration file using `--webpack` argument.
- Added a new class, `VisualRunner` (see `src/test_runner/visual_runner.js`. This class has the following API:
  - `startKind(kind)`: called when the test runner starts processing a new "kind" (the Storybook term for a "category")
  - `endKind()`
  - `runStory(story)`: called when the test runner wants to process a single story (a "use case" within a "category")
- `src/test_runner/index.js` now creates an instance of `VisualRunner` rather than `SnapshotRunner`. 

## Future Work

- Decouple Storyshots from Storybook entirely. This involves:
  - taking a list of URLs instead of enumerating stories by running the Storybook configuration file
  - replacing PhantomJS with a [WebDriver](https://www.w3.org/TR/webdriver/) client allowing integration with virtually any browser
- Optimizing performance, mainly by:
  - sharing the same browser instance (instead of spawning a new instance for each story)
  - redesigning Storyshots as a pipeline of producer-consumers (`GrabScreenshots -> CompareWithReference -> PromptUser`) to continue processing while waiting for I/O (e.g. running `CompareWithReference` while `PromptUser` is waiting for the user)
- Measuring code coverage?

