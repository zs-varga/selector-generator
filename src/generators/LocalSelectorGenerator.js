import { ElementValidator } from "../validators/ElementValidator.js";
import {
  COST_ID,
  COST_TAG,
  COST_CLASS,
  COST_ATTR,
} from "../config/costs.js";
import {
  IGNORED_ATTRIBUTES,
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
   * Generates local selectors for an element.
   * @param {HTMLElement|SVGElement} element - The target element
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(element) {
    ElementValidator.assertValid(element);

    const selectors = [];

    // Add ID selector if not blacklisted
    if (
      element.id !== "" &&
      !BlacklistMatcher.matches(element.id, BLACKLIST_IDS)
    ) {
      selectors.push({
        cost: COST_ID,
        level: 0,
        type: "id",
        selector: "#" + CSS.escape(element.id),
      });
    }

    // Always add tag selector
    selectors.push({
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

      if (IGNORED_ATTRIBUTES.includes(name)) {
        continue;
      }

      if (name === "class") {
        element.classList.forEach((currentClass) => {
          // Skip blacklisted classes
          if (!BlacklistMatcher.matches(currentClass, BLACKLIST_CLASSES)) {
            selectors.push({
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
        selectors.push({
          cost: COST_ATTR,
          level: 0,
          type: "attr",
          selector: "[" + CSS.escape(name) + "]",
        });
      }
    }

    return selectors;
  }
}
