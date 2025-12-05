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
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @param {Array<SelectorDescriptor>} selectorSet - Set of selector descriptors
   * @returns {number} Number of matching elements, or Infinity if invalid
   */
  getValue(elements, selectorSet) {
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

    const resultsArray = Array.from(results);

    // Check if all target elements are in results
    for (const element of elements) {
      if (!resultsArray.includes(element)) {
        console.error(
          "Element is missing from selector results: ",
          selector,
          selectorSet
        );
        return Infinity;
      }
    }

    return count;
  }

  /**
   * Finds the best selector set that identifies all target elements.
   * Uses a greedy optimization algorithm with decreasing thresholds.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @param {Array<SelectorDescriptor>} selectors - Array of all available selector descriptors
   * @returns {Array<SelectorDescriptor>} Optimized selector set
   */
  findBest(elements, selectors) {
    selectors.sort((a, b) => a.cost - b.cost);

    let bestSelectorSet = [];
    let bestValue = Infinity;
    const targetCount = elements.length;

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
          trialValue = this.getValue(elements, trialSelectorSet);

          if (localBestValue - trialValue >= threshold) {
            localBestValue = trialValue;
            localBestSelectorSet = [...trialSelectorSet];
          }

          // we found a perfect match
          if (trialValue === targetCount) {
            break;
          }
        }

        if (bestValue - localBestValue > 0) {
          bestSelectorSet = [...localBestSelectorSet];
          bestValue = localBestValue;
          if (bestValue === targetCount) {
            return bestSelectorSet;
          }
          improving = true;
        }

        if (localBestValue === targetCount) {
          break;
        }
      }
    }

    return bestSelectorSet;
  }
}
