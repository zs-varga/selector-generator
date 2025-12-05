import { ElementValidator } from './validators/ElementValidator.js';
import { DOMService } from './services/DOMService.js';
import { SelectorBuilder } from './builders/SelectorBuilder.js';
import { BottomUpSelectorOptimizer } from './optimizers/BottomUpSelectorOptimizer.js';
import { TopDownSelectorOptimizer } from './optimizers/TopDownSelectorOptimizer.js';
import { LocalSelectorGenerator } from './generators/LocalSelectorGenerator.js';
import { LocalExclusionGenerator } from './generators/LocalExclusionGenerator.js';
import { ChildrenSelectorGenerator } from './generators/ChildrenSelectorGenerator.js';
import { ChildrenExclusionGenerator } from './generators/ChildrenExclusionGenerator.js';
import { SiblingSelectorGenerator } from './generators/SiblingSelectorGenerator.js';
import { ParentSelectorGenerator } from './generators/ParentSelectorGenerator.js';

/**
 * Main class for generating optimal CSS selectors for DOM elements.
 */
export class SelectorGenerator {
  constructor() {
    // Initialize services
    this.domService = new DOMService();
    this.selectorBuilder = new SelectorBuilder();
    this.bottomUpOptimizer = new BottomUpSelectorOptimizer(this.domService, this.selectorBuilder);
    this.topDownOptimizer = new TopDownSelectorOptimizer(this.domService, this.selectorBuilder);

    // Initialize generators
    this.localGenerator = new LocalSelectorGenerator();
    this.exclusionGenerator = new LocalExclusionGenerator(
      this.domService,
      this.localGenerator,
      this.selectorBuilder
    );
    this.childrenGenerator = new ChildrenSelectorGenerator(this.localGenerator);
    this.childrenExclusionGenerator = new ChildrenExclusionGenerator(
      this.domService,
      this.localGenerator,
      this.selectorBuilder
    );
    this.siblingGenerator = new SiblingSelectorGenerator(this.localGenerator);
    this.parentGenerator = new ParentSelectorGenerator(
      this.localGenerator,
      this.exclusionGenerator,
      this.siblingGenerator
    );
  }

  /**
   * Generates an optimal CSS selector for the given element(s).
   * For a single element, generates a unique selector matching only that element.
   * For multiple elements, generates a selector matching all of them (and only them).
   * Elements can be at any level in the DOM tree as long as they share a common ancestor.
   * @param {HTMLElement|SVGElement|Array<HTMLElement|SVGElement>} elements - The target element(s)
   * @returns {string} CSS selector string that uniquely identifies the element(s)
   * @throws {Error} If elements are invalid or don't share a common ancestor
   */
  getSelector(elements) {
    // Handle both single element and array of elements
    const normalizedElements = Array.isArray(elements) ? elements : [elements];

    // Validate all elements
    for (const element of normalizedElements) {
      ElementValidator.assertValid(element);
    }

    // For multiple elements, verify they share a common ancestor
    if (normalizedElements.length > 1) {
      // Check that all elements are connected in the same document
      const firstDoc = normalizedElements[0].ownerDocument;
      for (let i = 1; i < normalizedElements.length; i++) {
        if (normalizedElements[i].ownerDocument !== firstDoc) {
          throw new Error(
            `All elements must belong to the same document for multi-element selector generation`
          );
        }
      }
    }

    let selectors = [];

    selectors = selectors.concat(this.localGenerator.generate(normalizedElements));
    selectors = selectors.concat(this.exclusionGenerator.generate(normalizedElements));
    selectors = selectors.concat(this.childrenGenerator.generate(normalizedElements));
    selectors = selectors.concat(this.siblingGenerator.generate(normalizedElements));
    selectors = selectors.concat(this.parentGenerator.generate(normalizedElements));
    selectors = selectors.concat(this.childrenExclusionGenerator.generate(normalizedElements));

    /*
    // Try bottom-up optimization first (fast, works for most cases)
    let bestSelectorSet = this.bottomUpOptimizer.findBest(normalizedElements, selectors);
    let value = this.bottomUpOptimizer.getValue(normalizedElements, bestSelectorSet);

    // If bottom-up didn't find a unique selector, try top-down
    if (value !== normalizedElements.length) {
      bestSelectorSet = this.topDownOptimizer.findBest(normalizedElements, selectors);
    }
    */

    let bestSelectorSet = this.topDownOptimizer.findBest(normalizedElements, selectors);

    const selector = this.selectorBuilder.build(bestSelectorSet);

    return selector;
  }
}
