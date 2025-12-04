/**
 * Debug optimizer for finding the smallest subset of selectors that does not match the target element.
 * Used when a selectorSet unexpectedly fails to match - helps identify the problematic selector(s).
 */
export class DebugOptimizer {
  /**
   * Creates a DebugOptimizer instance.
   * @param {DOMService} domService - Service for DOM queries
   * @param {SelectorBuilder} selectorBuilder - Builder for constructing selectors
   */
  constructor(domService, selectorBuilder) {
    this.domService = domService;
    this.selectorBuilder = selectorBuilder;
  }

  /**
   * Checks if a selector set matches the target element.
   * @param {HTMLElement|SVGElement} element - The target element
   * @param {Array<SelectorDescriptor>} selectorSet - Set of selector descriptors
   * @returns {boolean} True if element is matched by the selector set
   */
  matches(element, selectorSet) {
    const selector = this.selectorBuilder.build(selectorSet);
    if (selector === "") {
      return false;
    }
    const results = this.domService.querySelectorAll(selector);
    return Array.from(results).includes(element);
  }

  /**
   * Finds the minimal subset of selectors that does NOT match the target element.
   * Single pass: removes each selector if the set still doesn't match without it.
   * @param {HTMLElement|SVGElement} element - The target element
   * @param {Array<SelectorDescriptor>} selectors - Array of selector descriptors (must not match element)
   * @returns {Array<SelectorDescriptor>} Minimal non-matching subset
   */
  findMinimalNonMatchingSet(element, selectors) {
    let result = [...selectors];

    // Single pass: try removing each selector
    for (let i = result.length - 1; i >= 0; i--) {
      // Try the set without this selector
      const trialSet = result.filter((_, index) => index !== i);

      // If it still doesn't match without this selector, it's redundant - remove it
      if (!this.matches(element, trialSet)) {
        result = trialSet;
      }
    }

    return result;
  }
}
