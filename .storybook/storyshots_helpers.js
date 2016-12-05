import qs from 'query-string'

export const runningInStoryshots = () => window && qs.parse(window.location.search).inStoryshots !== undefined

export const disableCssAnimations = () => {
  const disableAnimationStyles = `
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -ms-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
    /*CSS transitions*/
    -o-transition-property: none !important;
    -moz-transition-property: none !important;
    -ms-transition-property: none !important;
    -webkit-transition-property: none !important;
    transition-property: none !important;
    /*CSS transforms*/
    -o-transform: none !important;
    -moz-transform: none !important;
    -ms-transform: none !important;
    -webkit-transform: none !important;
    transform: none !important;
    /*CSS animations*/
    -webkit-animation: none !important;
    -moz-animation: none !important;
    -o-animation: none !important;
    -ms-animation: none !important;
    animation: none !important;`

  window.onload = () => {
    const animationStyles = document.createElement('style')
    animationStyles.type = 'text/css'
    animationStyles.innerHTML = '* {' + disableAnimationStyles + '}'
    document.head.appendChild(animationStyles)
  }
}

export const disableRafAnimations = () => {
  window.requestAnimationFrame = () => {}
}

export const exportStories = (storybook) => {
  global.storybook = storybook
}
