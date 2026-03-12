import "@testing-library/jest-dom"

// jsdom does not implement scrollIntoView or scrollTo — polyfill both for tests
window.HTMLElement.prototype.scrollIntoView = function () {}
window.HTMLElement.prototype.scrollTo = function () {}
