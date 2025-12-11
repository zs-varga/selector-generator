import { DebugOptimizer } from './DebugOptimizer.js';

/**
 * Optimizes selector sets using a top-down approach.
 * Starts with all selectors and removes unnecessary ones while maintaining uniqueness.
 */
export class TopDownSelectorOptimizer {
  /**
   * Creates a TopDownSelectorOptimizer instance.
   * @param {DOMService} domService - Service for DOM queries
   * @param {SelectorBuilder} selectorBuilder - Builder for constructing selectors
   */
  constructor(domService, selectorBuilder) {
    this.domService = domService;
    this.selectorBuilder = selectorBuilder;
    this.debugOptimizer = new DebugOptimizer(domService, selectorBuilder);
  }

  /**
   * Calculates the value (specificity score) of a selector set.
   * Considers both the count of elements matching the selector and the sum of costs.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @param {Array<SelectorDescriptor>} selectorSet - Set of selector descriptors
   * @returns {{count: number, quality: number}} Object with count and quality, or null if invalid
   */
  getValue(elements, selectorSet) {
    const selector = this.selectorBuilder.build(selectorSet);
    if (selector === "") {
      return null;
    }
    const results = this.domService.querySelectorAll(selector);
    const count = results.length;

    if (count === 0) {
      return null;
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
        return null;
      }
    }

    // Calculate sum of costs in the selector set
    // Lower cost sum = better quality
    const cost = selectorSet.reduce((sum, descriptor) => sum + descriptor.cost, 0);

    // Return object with both count and quality
    return { count, cost };
  }

  /**
   * Finds the best selector set using top-down optimization with local best solution.
   * Starts with all selectors and iteratively removes selectors (sorted by cost),
   * stopping at the first removal that maintains uniqueness (count = elements.length).
   * @param {Array<HTMLElement|SVGElement>} targetElements - The target elements
   * @param {Array<SelectorDescriptor>} selectors - Array of all available selector descriptors
   * @returns {Array<SelectorDescriptor>} Optimized selector set
   */
  findBest(targetElements, selectors) {
    const targetCount = targetElements.length;

    // Start with all selectors
    let currentSet = [...selectors];
    let currentValue = this.getValue(targetElements, currentSet);
    const startingCount = currentValue ? currentValue.count : 0;

    // If not unique even with all selectors, use debug optimizer to find minimal non-matching set
    // Only if we are finding a selector for a single element
    if (!currentValue || currentValue.count !== startingCount) {
      console.warn(
        `Top-down optimizer: All selectors combined do not produce a selector matching exactly ${targetCount} element(s). Finding minimal non-matching subset for debugging.`
      );
      const minimalNonMatching = this.debugOptimizer.findMinimalNonMatchingSet(targetElements[0], currentSet);
      console.log(
        "The problematic selector is this:",
        minimalNonMatching,
        this.selectorBuilder.build(minimalNonMatching)
      );
      return currentSet;
    }

    // Sort selectors by cost (descending) - highest cost value first (worst quality)
    // This way we try to remove the worst quality selectors first
    const sortedSelectors = [...currentSet].sort((a, b) => b.cost - a.cost);

    // Iteratively try removing selectors in cost order
    let improved = true;
    while (improved && currentSet.length > 1) {
      improved = false;

      // Try removing selectors in cost order, stop at first success
      for (const selectorToRemove of sortedSelectors) {
        // Skip if selector is no longer in current set (already removed)
        if (!currentSet.includes(selectorToRemove)) {
          continue;
        }

        // Skip removal of level=0, type=tag selectors (base element selector)
        if (selectorToRemove.level === 0 && selectorToRemove.type === 'tag') {
          continue;
        }

        const trialSet = currentSet.filter(s => s !== selectorToRemove);
        const trialValue = this.getValue(targetElements, trialSet);

        // Check if elements still match exactly (count = startingCount)
        if (trialValue && trialValue.count === startingCount) {
          // Still matching after removal, commit this change and continue
          currentSet = trialSet;
          currentValue = trialValue;
          improved = true;
          break; // Stop at first improvement and try again
        }
      }
    }

    return currentSet;
  }
}
