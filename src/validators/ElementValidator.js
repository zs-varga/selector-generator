/**
 * Validates that elements are HTMLElement or SVGElement instances.
 */
export class ElementValidator {
  /**
   * Checks if an element is valid (HTMLElement or SVGElement).
   * @param {*} element - The element to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static isValid(element) {
    return element instanceof HTMLElement || element instanceof SVGElement;
  }

  /**
   * Asserts that an element is valid, throws error if not.
   * @param {*} element - The element to validate
   * @throws {Error} If element is not HTMLElement or SVGElement
   */
  static assertValid(element) {
    if (!this.isValid(element)) {
      throw new Error("Not an SVG/HTMLElement");
    }
  }
}
