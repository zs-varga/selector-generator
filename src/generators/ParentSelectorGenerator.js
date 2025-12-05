import { ElementValidator } from "../validators/ElementValidator.js";
import { COST_DISTANCE, COST_PARENT } from "../config/costs.js";

/**
 * Generates selectors based on parent elements.
 */
export class ParentSelectorGenerator {
  /**
   * Creates a ParentSelectorGenerator instance.
   * @param {LocalSelectorGenerator} localGenerator - Generator for local selectors
   * @param {LocalExclusionGenerator} exclusionGenerator - Generator for exclusion selectors
   * @param {SiblingSelectorGenerator} siblingGenerator - Generator for sibling selectors
   */
  constructor(localGenerator, exclusionGenerator, siblingGenerator) {
    this.localGenerator = localGenerator;
    this.exclusionGenerator = exclusionGenerator;
    this.siblingGenerator = siblingGenerator;
  }

  /**
   * Generates parent selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }

    const selectors = [];

    // Generate parent selectors for each element
    const elementSelectors = elements.map(element => {
      const sels = [];

      let currentParent = element.parentElement;
      let level = 1;

      while (currentParent) {
        const localSelectors = this.localGenerator.generate([currentParent]);
        for (const currentSelector of localSelectors) {
          sels.push({
            cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
            level: level,
            type: currentSelector.type,
            selector: currentSelector.selector,
          });
        }

        const localExclSelectors =
          this.exclusionGenerator.generate([currentParent]);
        for (const currentSelector of localExclSelectors) {
          sels.push({
            cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
            level: level,
            type: currentSelector.type,
            selector: currentSelector.selector,
          });
        }

        const siblingSelectors = this.siblingGenerator.generate([currentParent]);
        for (const currentSelector of siblingSelectors) {
          sels.push({
            cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
            level: level,
            type: currentSelector.type,
            selector: currentSelector.selector,
          });
        }

        currentParent = currentParent.parentElement;
        level = level + 1;
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
