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
   * Generates parent selectors for an element.
   * @param {HTMLElement|SVGElement} element - The target element
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(element) {
    ElementValidator.assertValid(element);

    const selectors = [];

    let currentParent = element.parentElement;
    let level = 1;

    while (currentParent) {
      const localSelectors = this.localGenerator.generate(currentParent);
      for (const currentSelector of localSelectors) {
        selectors.push({
          cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
          level: level,
          type: currentSelector.type,
          selector: currentSelector.selector,
        });
      }

      const localExclSelectors =
        this.exclusionGenerator.generate(currentParent);
      for (const currentSelector of localExclSelectors) {
        selectors.push({
          cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
          level: level,
          type: currentSelector.type,
          selector: currentSelector.selector,
        });
      }

      const siblingSelectors = this.siblingGenerator.generate(currentParent);
      for (const currentSelector of siblingSelectors) {
        selectors.push({
          cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
          level: level,
          type: currentSelector.type,
          selector: currentSelector.selector,
        });
      }

      currentParent = currentParent.parentElement;
      level = level + 1;
    }

    return selectors;
  }
}
