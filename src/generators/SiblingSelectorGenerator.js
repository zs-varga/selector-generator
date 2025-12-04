import { ElementValidator } from "../validators/ElementValidator.js";
import {
  COST_DISTANCE,
  COST_IS_HAS,
  COST_SIBLING,
} from "../config/costs.js";

/**
 * Generates selectors based on sibling relationships.
 */
export class SiblingSelectorGenerator {
  /**
   * Creates a SiblingSelectorGenerator instance.
   * @param {LocalSelectorGenerator} localGenerator - Generator for local selectors
   */
  constructor(localGenerator) {
    this.localGenerator = localGenerator;
  }

  /**
   * Generates sibling selectors for an element.
   * @param {HTMLElement|SVGElement} element - The target element
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(element) {
    ElementValidator.assertValid(element);

    const selectors = [];

    let prevSibling = element.previousElementSibling;
    const prevSiblingCount =
      prevSibling !== null
        ? Array.from(element.parentElement.children).indexOf(element)
        : 0;

    let nextSibling = element.nextElementSibling;
    const nextSiblingCount =
      nextSibling !== null
        ? Array.from(element.parentElement.children).length -
          Array.from(element.parentElement.children).indexOf(element)
        : 0;

    if (prevSibling === null) {
      // there is no previous sibling
      selectors.push({
        cost: (nextSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
        level: 0,
        type: "pseudo",
        selector: ":first-child",
      });
    } else {
      // there are previous siblings
      selectors.push({
        cost: (prevSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
        level: 0,
        type: "pseudo",
        selector: ":nth-child(" + (prevSiblingCount + 1) + ")",
      });
    }

    if (nextSibling === null) {
      // there is no next sibling
      selectors.push({
        cost: (prevSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
        level: 0,
        type: "pseudo",
        selector: ":last-child",
      });
    } else {
      // there are next siblings, so we can use nth-last-child
      // however, we will only use this if there are prev siblings too
      // if there are not, nth-child is better
      if (prevSiblingCount > 0) {
        selectors.push({
          cost: (nextSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
          level: 0,
          type: "pseudo",
          selector: ":nth-last-child(" + nextSiblingCount + ")",
        });
      }
    }

    if (prevSibling === null && nextSibling === null) {
      selectors.push({
        cost: COST_SIBLING,
        level: 0,
        type: "pseudo",
        selector: ":only-child",
      });
    }

    while (prevSibling) {
      if (prevSibling.nodeType === Node.COMMENT_NODE) {
        prevSibling = prevSibling.previousElementSibling;
        continue;
      }
      if (prevSibling.nodeType === Node.TEXT_NODE) {
        prevSibling = prevSibling.previousElementSibling;
        continue;
      }

      const localSelectors = this.localGenerator.generate(prevSibling);
      for (const currentSelector of localSelectors) {
        if (
          !selectors.some(
            (s) => s.selector === ":is(" + currentSelector.selector + " ~ *)"
          )
        ) {
          selectors.push({
            cost: COST_SIBLING + COST_IS_HAS + currentSelector.cost,
            level: 0,
            type: "pseudo",
            selector: ":is(" + currentSelector.selector + " ~ *)",
          });
        }
      }
      prevSibling = prevSibling.previousElementSibling;
    }

    while (nextSibling) {
      if (nextSibling.nodeType === Node.COMMENT_NODE) {
        nextSibling = nextSibling.nextElementSibling;
        continue;
      }
      if (nextSibling.nodeType === Node.TEXT_NODE) {
        nextSibling = nextSibling.nextElementSibling;
        continue;
      }

      const localSelectors = this.localGenerator.generate(nextSibling);
      for (const currentSelector of localSelectors) {
        if (
          !selectors.some(
            (s) => s.selector === ":has(~ " + currentSelector.selector + ")"
          )
        ) {
          selectors.push({
            cost: COST_SIBLING + COST_IS_HAS + currentSelector.cost,
            level: 0,
            type: "pseudo",
            selector: ":has(~ " + currentSelector.selector + ")",
          });
        }
      }
      nextSibling = nextSibling.nextElementSibling;
    }

    return selectors;
  }
}
