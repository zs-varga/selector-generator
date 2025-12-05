import { ElementValidator } from "../validators/ElementValidator.js";
import {
  COST_DISTANCE,
  COST_CHILDREN,
  COST_IS_HAS,
  COST_NOT,
} from "../config/costs.js";

/**
 * Generates selectors based on an element's children.
 */
export class ChildrenSelectorGenerator {
  /**
   * Creates a ChildrenSelectorGenerator instance.
   * @param {LocalSelectorGenerator} localGenerator - Generator for local selectors
   */
  constructor(localGenerator) {
    this.localGenerator = localGenerator;
  }

  /**
   * Recursively processes children and their descendants.
   * @private
   * @param {HTMLElement|SVGElement} element - Current element being processed
   * @param {number} depth - Current depth
   * @param {Array<SelectorDescriptor>} selectors - Accumulator for selector descriptors
   */
  #processChildren(element, depth, selectors) {
    const children = element.children;
    const depthSelector = ">*".repeat(depth);

    if (children.length === 0) {
      // The element contains only text
      // :has cannot be nested, so we can't do selectors for deeper levels like ":has(>*:not(:has(>*)))"
      if (element.childNodes.length > 0 && depth === 0) {
        selectors.push({
          cost:
            depth * COST_DISTANCE + COST_NOT + COST_IS_HAS + COST_CHILDREN,
          level: 0,
          type: "pseudo",
          selector: `:not(:has(>*))`,
        });
        return selectors;
      }

      // The element contains nothing OR contains :before OR :after pseudo elements
      if (element.childNodes.length === 0) {
        selectors.push({
          cost: depth * COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
          level: 0,
          type: "pseudo",
          selector: depth > 0 ? `:has(${depthSelector}:empty)` : `:empty`,
        });
        if (depth > 0) {
          selectors.push({
            cost: COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
            level: 0,
            type: "pseudo",
            selector: `:has(:empty)`,
          });
        }
      }
      return selectors;
    }

    // has n direct children
    selectors.push({
      cost: depth * COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
      level: 0,
      type: "pseudo",
      selector:
        depth > 0
          ? `:has(${depthSelector}>*:nth-child(${children.length}):last-child)`
          : `:has(:nth-child(${children.length}):last-child)`,
    });
    if (depth > 0) {
      selectors.push({
        cost: COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
        level: 0,
        type: "pseudo",
        selector: `:has(* :nth-child(${children.length}):last-child)`,
      });
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      const localSelectors = this.localGenerator.generate(child);
      for (const childrenLocalSelector of localSelectors) {
        selectors.push({
          cost:
            depth * COST_DISTANCE +
            COST_IS_HAS +
            COST_CHILDREN +
            childrenLocalSelector.cost,
          level: 0,
          type: "pseudo",
          selector:
            depth > 0
              ? `:has(${depthSelector}>${childrenLocalSelector.selector})`
              : `:has(>${childrenLocalSelector.selector})`,
        });

        if (depth > 0) {
          selectors.push({
            cost:
              COST_DISTANCE +
              COST_IS_HAS +
              COST_CHILDREN +
              childrenLocalSelector.cost,
            level: 0,
            type: "pseudo",
            selector: `:has(* ${childrenLocalSelector.selector})`,
          });
        }
      }

      // Recursively process descendants (go deeper, more negative level)
      this.#processChildren(child, depth + 1, selectors);
    }
  }

  /**
   * Generates children selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }

    const selectors = [];

    // Generate children selectors for each element
    const elementSelectors = elements.map(element => {
      const sels = [];
      this.#processChildren(element, 0, sels);
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
