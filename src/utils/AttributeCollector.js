import { BlacklistMatcher } from './BlacklistMatcher.js';
import {
  BLACKLIST_IDS,
  BLACKLIST_CLASSES,
  BLACKLIST_ATTRIBUTES,
} from '../config/constants.js';

/**
 * Utility class for collecting and analyzing attributes from elements.
 */
export class AttributeCollector {
  /**
   * Creates an AttributeCollector instance.
   * @param {HTMLElement|SVGElement} targetElement - The target element to compare against
   */
  constructor(targetElement) {
    this.targetElement = targetElement;
  }

  /**
   * Collects extra IDs from elements that the target doesn't have.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Array<string>} Array of CSS-escaped ID values
   */
  collectExtraIds(elements) {
    const extraIds = [];

    for (let i = 0; i < elements.length; i++) {
      const currentElement = elements[i];

      if (currentElement === this.targetElement) {
        continue;
      }

      const id = currentElement.getAttribute("id");
      if (id !== null && !BlacklistMatcher.matches(id, BLACKLIST_IDS)) {
        extraIds.push(CSS.escape(id));
      }
    }

    return extraIds;
  }

  /**
   * Collects extra classes from elements that the target doesn't have.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Array<string>} Array of CSS-escaped class names
   */
  collectExtraClasses(elements) {
    const extraClasses = [];

    for (let i = 0; i < elements.length; i++) {
      const currentElement = elements[i];

      if (currentElement === this.targetElement) {
        continue;
      }

      currentElement.classList.forEach((currentClass) => {
        if (
          !this.targetElement.classList.contains(currentClass) &&
          !extraClasses.includes(currentClass) &&
          !BlacklistMatcher.matches(currentClass, BLACKLIST_CLASSES)
        ) {
          extraClasses.push(CSS.escape(currentClass));
        }
      });
    }

    return extraClasses;
  }

  /**
   * Collects extra attributes from elements that the target doesn't have.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Array<string>} Array of CSS-escaped attribute names
   */
  collectExtraAttributes(elements) {
    const extraAttr = [];

    for (let i = 0; i < elements.length; i++) {
      const currentElement = elements[i];

      if (currentElement === this.targetElement) {
        continue;
      }

      const attributes = currentElement.attributes;
      for (let j = 0; j < attributes.length; j++) {
        const currentAttr = attributes.item(j);
        if (
          !this.targetElement.hasAttribute(currentAttr.name) &&
          !extraAttr.includes(currentAttr.name) &&
          !BlacklistMatcher.matches(currentAttr.name, BLACKLIST_ATTRIBUTES)
        ) {
          extraAttr.push(CSS.escape(currentAttr.name));
        }
      }
    }

    return extraAttr;
  }

  /**
   * Collects all extra attributes (IDs, classes, attributes) at once.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Object} Object with extraIds, extraClasses, extraAttributes arrays
   */
  collectAll(elements) {
    return {
      extraIds: this.collectExtraIds(elements),
      extraClasses: this.collectExtraClasses(elements),
      extraAttributes: this.collectExtraAttributes(elements),
    };
  }
}
