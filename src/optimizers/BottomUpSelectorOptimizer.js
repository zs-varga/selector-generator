/**
 * Optimizes selector sets using a bottom-up greedy approach.
 * Starts with empty set and adds selectors that provide the most improvement.
 */
export class BottomUpSelectorOptimizer {
  /**
   * Creates a BottomUpSelectorOptimizer instance.
   * @param {DOMService} domService - Service for DOM queries
   * @param {SelectorBuilder} selectorBuilder - Builder for constructing selectors
   */
  constructor(domService, selectorBuilder) {
    this.domService = domService;
    this.selectorBuilder = selectorBuilder;
  }

  /**
   * Calculates the value (specificity score) of a selector set.
   * Returns the count of elements matching the selector, or Infinity if invalid.
   * @param {HTMLElement|SVGElement} element - The target element
   * @param {Array<SelectorDescriptor>} selectorSet - Set of selector descriptors
   * @returns {number} Number of matching elements, or Infinity if invalid
   */
  getValue(element, selectorSet) {
    const selector = this.selectorBuilder.build(selectorSet);
    if (selector === "") {
      return Infinity;
    }
    const results = this.domService.querySelectorAll(selector);
    const count = results.length;

    if (count === 0) {
      console.error("Empty selector: ", selector, selectorSet);
      return Infinity;
    }

    // Check if element is in results
    if (!Array.from(results).includes(element)) {
      console.error(
        "Element is missing from selector results: ",
        selector,
        selectorSet
      );
      return Infinity;
    }

    return count;
  }

  /**
   * Finds the best selector set that uniquely identifies an element.
   * Uses a greedy optimization algorithm with decreasing thresholds.
   * @param {HTMLElement|SVGElement} element - The target element
   * @param {Array<SelectorDescriptor>} selectors - Array of all available selector descriptors
   * @returns {Array<SelectorDescriptor>} Optimized selector set
   */
  findBest(element, selectors) {
    selectors.sort((a, b) => a.cost - b.cost);

    let bestSelectorSet = [];
    let bestValue = Infinity;

    for (let threshold = 16; threshold >= 1; threshold = threshold / 2) {
      let improving = true;
      while (improving) {
        improving = false;

        let localBestSelectorSet = [...bestSelectorSet];
        let localBestValue = bestValue;
        let trialSelectorSet = [...bestSelectorSet];
        let trialValue = Infinity;

        for (const currentSelector of selectors) {
          if (trialSelectorSet.includes(currentSelector)) {
            continue;
          }

          // Skip parent selectors if there is no other selectors in the set yet
          if (bestSelectorSet.length === 0 && currentSelector.level > 0) {
            continue;
          }

          trialSelectorSet = [...bestSelectorSet, currentSelector];
          trialValue = this.getValue(element, trialSelectorSet);

          if (localBestValue - trialValue >= threshold) {
            localBestValue = trialValue;
            localBestSelectorSet = [...trialSelectorSet];
          }

          // we found a perfect match
          if (trialValue === 1) {
            break;
          }
        }

        if (bestValue - localBestValue > 0) {
          bestSelectorSet = [...localBestSelectorSet];
          bestValue = localBestValue;
          if (bestValue === 1) {
            return bestSelectorSet;
          }
          improving = true;
        }

        if (localBestValue === 1) {
          break;
        }
      }
    }

    return bestSelectorSet;
  }
}
