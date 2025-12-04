/**
 * Abstraction layer for DOM queries.
 * Allows for easier testing by providing a mockable interface.
 */
export class DOMService {
  /**
   * Query all elements matching a selector.
   * @param {string} selector - CSS selector string
   * @returns {NodeList} List of matching elements
   */
  querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Query the first element matching a selector.
   * @param {string} selector - CSS selector string
   * @returns {Element|null} First matching element or null
   */
  querySelector(selector) {
    return document.querySelector(selector);
  }
}
