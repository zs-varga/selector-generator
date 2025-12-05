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
   * Generates children exclusion selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }

    const selectors = [];

    // Generate children exclusion selectors for each element
    const elementSelectors = elements.map(element => {
      const sels = [];

      const elementSelector = this.localGenerator.generate([element]);
      const childrenSelector = this.selectorBuilder.build(elementSelector) + " *";
      const allChildren = this.domService.querySelectorAll(childrenSelector);

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
          sels.push({
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
            !element.querySelector("[" + CSS.escape(currentAttr.name) + "]") &&
            !extraAttr.includes(currentAttr.name) &&
            !BlacklistMatcher.matches(currentAttr.name, BLACKLIST_ATTRIBUTES)
          ) {
            extraAttr.push(CSS.escape(currentAttr.name));
          }
        }
      }

      for (let i = 0; i < extraClasses.length; i++) {
        sels.push({
          cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_CLASS,
          level: 0,
          type: "pseudo",
          selector: ":not(:has(." + extraClasses[i] + "))",
        });
      }

      for (let i = 0; i < extraAttr.length; i++) {
        sels.push({
          cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_ATTR,
          level: 0,
          type: "pseudo",
          selector: ":not(:has([" + extraAttr[i] + "]))",
        });
      }

      return sels;
    });

    // Find common selectors across all elements
    if (elementSelectors.length === 0) return selectors;

    const firstSet = elementSelectors[0];
    for (const descriptor of firstSet) {
      const isCommon = elementSelectors.every(set =>
        set.some(d => d.selector === descriptor.selector)
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }

    return selectors;
  }
}
