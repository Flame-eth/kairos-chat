import "@testing-library/jest-dom"

// jsdom does not implement scrollIntoView — polyfill it for tests
window.HTMLElement.prototype.scrollIntoView = function () {}
