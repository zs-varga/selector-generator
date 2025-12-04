import { ElementValidator } from "../validators/ElementValidator.js";
import { AttributeCollector } from "../utils/AttributeCollector.js";
import {
  COST_NOT,
  COST_ATTR,
  COST_CLASS,
  COST_ID,
} from "../config/costs.js";
import { IGNORED_ATTRIBUTES_FOR_EXCLUSION } from "../config/constants.js";

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
   * Generates exclusion selectors for an element.
   * @param {HTMLElement|SVGElement} element - The target element
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(element) {
    ElementValidator.assertValid(element);

    const localSelectors = this.localGenerator.generate(element);
    const baseSelector = this.selectorBuilder.build(localSelectors);
    const elements = this.domService.querySelectorAll(baseSelector);

    const selectors = [];
    const collector = new AttributeCollector(
      element,
      IGNORED_ATTRIBUTES_FOR_EXCLUSION
    );

    const { extraIds, extraClasses, extraAttributes } =
      collector.collectAll(elements);

    for (let i = 0; i < extraIds.length; i++) {
      selectors.push({
        cost: COST_NOT + COST_ID,
        level: 0,
        type: "pseudo",
        selector: ":not(#" + extraIds[i] + ")",
      });
    }

    for (let i = 0; i < extraClasses.length; i++) {
      selectors.push({
        cost: COST_NOT + COST_CLASS,
        level: 0,
        type: "pseudo",
        selector: ":not(." + extraClasses[i] + ")",
      });
    }

    for (let i = 0; i < extraAttributes.length; i++) {
      selectors.push({
        cost: COST_NOT + COST_ATTR,
        level: 0,
        type: "pseudo",
        selector: ":not([" + extraAttributes[i] + "])",
      });
    }

    return selectors;
  }
}
