const debug = require('debug')('storyshots-render')

export default (story, context) => {
  debug({story, context})

  const reactElement = story.render(context);
  debug(reactElement)

  return 'goo'
}
