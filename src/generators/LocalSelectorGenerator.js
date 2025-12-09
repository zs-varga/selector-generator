import { ElementValidator } from "../validators/ElementValidator.js";
import {
  COST_ID,
  COST_TAG,
  COST_CLASS,
  COST_ATTR,
} from "../config/costs.js";
import {
  BLACKLIST_IDS,
  BLACKLIST_CLASSES,
  BLACKLIST_ATTRIBUTES,
} from "../config/constants.js";
import { BlacklistMatcher } from "../utils/BlacklistMatcher.js";

/**
 * Generates selectors based on an element's own properties (ID, tag, classes, attributes).
 */
export class LocalSelectorGenerator {
  /**
   * Generates local selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }

    const selectors = [];

    // Get selectors for each element
    const elementSelectors = elements.map(element => {
      const sels = [];

      // Add ID selector if not blacklisted
      if (
        element.id !== "" &&
        !BlacklistMatcher.matches(element.id, BLACKLIST_IDS)
      ) {
        sels.push({
          cost: COST_ID,
          level: 0,
          type: "id",
          selector: "#" + CSS.escape(element.id),
        });
      }

      // Always add tag selector
      sels.push({
        cost: COST_TAG,
        level: 0,
        type: "tag",
        selector: element.localName,
      });

      for (
        let i = 0, attributes = element.attributes;
        i < attributes.length;
        i++
      ) {
        const name = attributes.item(i).name;

        if (name === "class") {
          element.classList.forEach((currentClass) => {
            // Skip blacklisted classes
            if (!BlacklistMatcher.matches(currentClass, BLACKLIST_CLASSES)) {
              sels.push({
                cost: COST_CLASS,
                level: 0,
                type: "class",
                selector: "." + CSS.escape(currentClass),
              });
            }
          });
          continue;
        }

        // Skip blacklisted attributes
        if (!BlacklistMatcher.matches(name, BLACKLIST_ATTRIBUTES)) {
          sels.push({
            cost: COST_ATTR,
            level: 0,
            type: "attr",
            selector: "[" + CSS.escape(name) + "]",
          });
        }
      }

      return sels;
    });

    // Find common selectors across all elements
    if (elementSelectors.length === 0) return selectors;

    const firstSet = elementSelectors[0];
    for (const descriptor of firstSet) {
      const isCommon = elementSelectors.every(set =>
        set.some(
          (d) =>
            d.level === descriptor.level &&
            d.type === descriptor.type &&
            d.selector === descriptor.selector
        )
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }

    return selectors;
  }
}
