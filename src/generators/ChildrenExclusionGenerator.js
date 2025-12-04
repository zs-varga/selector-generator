import { ElementValidator } from "../validators/ElementValidator.js";
import {
  COST_ATTR,
  COST_CHILDREN,
  COST_CLASS,
  COST_IS_HAS,
  COST_ID,
  COST_NOT,
} from "../config/costs.js";
import {
  IGNORED_ATTRIBUTES_FOR_EXCLUSION,
  BLACKLIST_IDS,
  BLACKLIST_CLASSES,
  BLACKLIST_ATTRIBUTES,
} from "../config/constants.js";
import { BlacklistMatcher } from "../utils/BlacklistMatcher.js";

/**
 * Generates :not(:has()) pseudo-selectors to exclude elements based on other elements children
 * If elements differ only by their children, we can select them by the selectors generates by this class
 */
export class ChildrenExclusionGenerator {
  /**
   * Creates a ChildrenExclusionGenerator instance.
   * @param {DOMService} domService - Service for DOM queries
   * @param {LocalSelectorGenerator} localGenerator - Generator for local selectors
   * @param {SelectorBuilder} selectorBuilder - Builder for constructing selectors
   */
  constructor(domService, localGenerator, selectorBuilder) {
    this.domService = domService;
    this.localGenerator = localGenerator;
    this.selectorBuilder = selectorBuilder;
  }

  /**
   * Generates children exclusion selectors for an element.
   * @param {HTMLElement|SVGElement} element - The target element
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(element) {
    ElementValidator.assertValid(element);

    const elementSelector = this.localGenerator.generate(element);
    const childrenSelector = this.selectorBuilder.build(elementSelector) + " *";
    const allChildren = this.domService.querySelectorAll(childrenSelector);

    const selectors = [];

    const extraClasses = [];
    const extraAttr = [];

    for (let i = 0; i < allChildren.length; i++) {
      const currentChild = allChildren[i];

      // Skip children that belong to the element itself
      if (element.contains(currentChild)) {
        continue;
      }

      // Collect extra id (skip if blacklisted)
      const id = currentChild.getAttribute("id");
      if (id !== null && !BlacklistMatcher.matches(id, BLACKLIST_IDS)) {
        selectors.push({
          cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_ID,
          level: 0,
          type: "pseudo",
          selector: ":not(:has(#" + CSS.escape(id) + "))",
        });
      }

      // Collect extra classes (skip if blacklisted)
      currentChild.classList.forEach((currentClass) => {
        if (
          !element.querySelector("." + CSS.escape(currentClass)) &&
          !extraClasses.includes(currentClass) &&
          !BlacklistMatcher.matches(currentClass, BLACKLIST_CLASSES)
        ) {
          extraClasses.push(CSS.escape(currentClass));
        }
      });

      // Collect extra attributes (skip if blacklisted)
      const attributes = currentChild.attributes;
      for (let j = 0; j < attributes.length; j++) {
        const currentAttr = attributes.item(j);
        if (
          !IGNORED_ATTRIBUTES_FOR_EXCLUSION.includes(currentAttr.name) &&
          !element.querySelector("[" + CSS.escape(currentAttr.name) + "]") &&
          !extraAttr.includes(currentAttr.name) &&
          !BlacklistMatcher.matches(currentAttr.name, BLACKLIST_ATTRIBUTES)
        ) {
          extraAttr.push(CSS.escape(currentAttr.name));
        }
      }
    }

    for (let i = 0; i < extraClasses.length; i++) {
      selectors.push({
        cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_CLASS,
        level: 0,
        type: "pseudo",
        selector: ":not(:has(." + extraClasses[i] + "))",
      });
    }

    for (let i = 0; i < extraAttr.length; i++) {
      selectors.push({
        cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_ATTR,
        level: 0,
        type: "pseudo",
        selector: ":not(:has([" + extraAttr[i] + "]))",
      });
    }

    return selectors;
  }
}
