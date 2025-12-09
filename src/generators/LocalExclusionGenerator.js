import { ElementValidator } from "../validators/ElementValidator.js";
import { AttributeCollector } from "../utils/AttributeCollector.js";
import {
  COST_NOT,
  COST_ATTR,
  COST_CLASS,
  COST_ID,
} from "../config/costs.js";

/**
 * Generates :not() pseudo-selectors to exclude similar elements.
 */
export class LocalExclusionGenerator {
  /**
   * Creates a LocalExclusionGenerator instance.
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
   * Generates exclusion selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }

    const selectors = [];

    // Generate exclusion selectors for each element
    const elementExclusions = elements.map(element => {
      const localSelectors = this.localGenerator.generate([element]);
      const baseSelector = this.selectorBuilder.build(localSelectors);
      const matchedElements = this.domService.querySelectorAll(baseSelector);

      const exclSelectors = [];
      const collector = new AttributeCollector(element);

      const { extraIds, extraClasses, extraAttributes } =
        collector.collectAll(matchedElements);

      for (let i = 0; i < extraIds.length; i++) {
        exclSelectors.push({
          cost: COST_NOT + COST_ID,
          level: 0,
          type: "pseudo",
          selector: ":not(#" + extraIds[i] + ")",
        });
      }

      for (let i = 0; i < extraClasses.length; i++) {
        exclSelectors.push({
          cost: COST_NOT + COST_CLASS,
          level: 0,
          type: "pseudo",
          selector: ":not(." + extraClasses[i] + ")",
        });
      }

      for (let i = 0; i < extraAttributes.length; i++) {
        exclSelectors.push({
          cost: COST_NOT + COST_ATTR,
          level: 0,
          type: "pseudo",
          selector: ":not([" + extraAttributes[i] + "])",
        });
      }

      return exclSelectors;
    });

    // Find common selectors across all elements
    if (elementExclusions.length === 0) return selectors;

    const firstSet = elementExclusions[0];
    for (const descriptor of firstSet) {
      const isCommon = elementExclusions.every(set =>
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
