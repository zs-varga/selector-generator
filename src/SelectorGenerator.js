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
   * Generates an optimal CSS selector for the given element.
   * Uses a hybrid approach: tries bottom-up optimization first,
   * and falls back to top-down if a unique selector is not found.
   * @param {HTMLElement|SVGElement} element - The target element
   * @returns {string} CSS selector string that uniquely identifies the element
   */
  getSelector(element) {
    ElementValidator.assertValid(element);

    let selectors = [];

    selectors = selectors.concat(this.localGenerator.generate(element));
    selectors = selectors.concat(this.exclusionGenerator.generate(element));
    selectors = selectors.concat(this.childrenGenerator.generate(element));
    selectors = selectors.concat(this.siblingGenerator.generate(element));
    selectors = selectors.concat(this.parentGenerator.generate(element));
    selectors = selectors.concat(this.childrenExclusionGenerator.generate(element));

    /*
    // Try bottom-up optimization first (fast, works for most cases)
    let bestSelectorSet = this.bottomUpOptimizer.findBest(element, selectors);
    let value = this.bottomUpOptimizer.getValue(element, bestSelectorSet);

    // If bottom-up didn't find a unique selector, try top-down
    if (value !== 1) {
      bestSelectorSet = this.topDownOptimizer.findBest(element, selectors);
    }
    */

    let bestSelectorSet = this.topDownOptimizer.findBest(element, selectors);

    const selector = this.selectorBuilder.build(bestSelectorSet);

    return selector;
  }
}
