var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/validators/ElementValidator.js
var ElementValidator = class {
  /**
   * Checks if an element is valid (HTMLElement or SVGElement).
   * @param {*} element - The element to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static isValid(element) {
    return element instanceof HTMLElement || element instanceof SVGElement;
  }
  /**
   * Asserts that an element is valid, throws error if not.
   * @param {*} element - The element to validate
   * @throws {Error} If element is not HTMLElement or SVGElement
   */
  static assertValid(element) {
    if (!this.isValid(element)) {
      throw new Error("Not an SVG/HTMLElement");
    }
  }
};

// src/services/DOMService.js
var DOMService = class {
  /**
   * Query all elements matching a selector.
   * @param {string} selector - CSS selector string
   * @returns {NodeList} List of matching elements
   */
  querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }
  /**
   * Query the first element matching a selector.
   * @param {string} selector - CSS selector string
   * @returns {Element|null} First matching element or null
   */
  querySelector(selector) {
    return document.querySelector(selector);
  }
};

// src/builders/SelectorBuilder.js
var _simpleBuild, simpleBuild_fn;
var SelectorBuilder = class {
  constructor() {
    /**
     * Builds a selector string from a set of selectors at the same level.
     * Merges them in proper type order: tag -> id -> class -> attr -> pseudo
     * @param {Array<SelectorDescriptor>} selectors - Array of selector descriptors at the same level
     * @returns {string} CSS selector string
     * @private
     */
    __privateAdd(this, _simpleBuild);
  }
  /**
   * Builds a complete CSS selector string from a set of selector descriptors.
   * @param {Array<SelectorDescriptor>} selectorSet - Array of selector descriptors
   * @returns {string} CSS selector string
   */
  build(selectorSet) {
    const tagSelectors = selectorSet.filter(
      (x) => x.type === "tag" && x.level <= 0
    );
    const idSelectors = selectorSet.filter(
      (x) => x.type === "id" && x.level <= 0
    );
    const classSelectors = selectorSet.filter(
      (x) => x.type === "class" && x.level <= 0
    );
    const attrSelectors = selectorSet.filter(
      (x) => x.type === "attr" && x.level <= 0
    );
    const pseudoSelectors = selectorSet.filter(
      (x) => x.type === "pseudo" && x.level <= 0
    );
    const parentSelectors = selectorSet.filter((x) => x.level > 0);
    let selector = tagSelectors.map((x) => x.selector).join("") + idSelectors.map((x) => x.selector).join("") + classSelectors.map((x) => x.selector).join("") + attrSelectors.map((x) => x.selector).join("") + pseudoSelectors.map((x) => x.selector).join("");
    if (selector === "") {
      selector = "*";
    }
    if (parentSelectors.length > 0) {
      const levelMap = /* @__PURE__ */ new Map();
      for (const ps of parentSelectors) {
        if (!levelMap.has(ps.level)) {
          levelMap.set(ps.level, []);
        }
        levelMap.get(ps.level).push(ps);
      }
      const levels = Array.from(levelMap.keys()).sort((a, b) => a - b);
      let prevLevel = 0;
      for (const level of levels) {
        const levelSelector = __privateMethod(this, _simpleBuild, simpleBuild_fn).call(this, levelMap.get(level));
        if (level === prevLevel + 1) {
          selector = levelSelector + " > " + selector;
        } else {
          selector = levelSelector + " " + selector;
        }
        prevLevel = level;
      }
    }
    return selector;
  }
};
_simpleBuild = new WeakSet();
simpleBuild_fn = function(selectors) {
  const tagSelectors = selectors.filter((x) => x.type === "tag");
  const idSelectors = selectors.filter((x) => x.type === "id");
  const classSelectors = selectors.filter((x) => x.type === "class");
  const attrSelectors = selectors.filter((x) => x.type === "attr");
  const pseudoSelectors = selectors.filter((x) => x.type === "pseudo");
  return tagSelectors.map((x) => x.selector).join("") + idSelectors.map((x) => x.selector).join("") + classSelectors.map((x) => x.selector).join("") + attrSelectors.map((x) => x.selector).join("") + pseudoSelectors.map((x) => x.selector).join("");
};

// src/optimizers/BottomUpSelectorOptimizer.js
var BottomUpSelectorOptimizer = class {
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
          if (bestSelectorSet.length === 0 && currentSelector.level > 0) {
            continue;
          }
          trialSelectorSet = [...bestSelectorSet, currentSelector];
          trialValue = this.getValue(elements, trialSelectorSet);
          if (localBestValue - trialValue >= threshold) {
            localBestValue = trialValue;
            localBestSelectorSet = [...trialSelectorSet];
          }
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
};

// src/optimizers/DebugOptimizer.js
var DebugOptimizer = class {
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
    for (let i = result.length - 1; i >= 0; i--) {
      const trialSet = result.filter((_, index) => index !== i);
      if (!this.matches(element, trialSet)) {
        result = trialSet;
      }
    }
    return result;
  }
};

// src/optimizers/TopDownSelectorOptimizer.js
var TopDownSelectorOptimizer = class {
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
    const cost = selectorSet.reduce((sum, descriptor) => sum + descriptor.cost, 0);
    return { count, cost };
  }
  /**
   * Finds the best selector set using top-down optimization with local best solution.
   * Starts with all selectors and iteratively removes selectors (sorted by cost),
   * stopping at the first removal that maintains uniqueness (count = elements.length).
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @param {Array<SelectorDescriptor>} selectors - Array of all available selector descriptors
   * @returns {Array<SelectorDescriptor>} Optimized selector set
   */
  findBest(elements, selectors) {
    let currentSet = [...selectors];
    let currentValue = this.getValue(elements, currentSet);
    const targetCount = elements.length;
    if (!currentValue || currentValue.count !== targetCount) {
      console.warn(
        `Top-down optimizer: All selectors combined do not produce a selector matching exactly ${targetCount} element(s). Finding minimal non-matching subset for debugging.`
      );
      const minimalNonMatching = this.debugOptimizer.findMinimalNonMatchingSet(elements[0], currentSet);
      console.log(
        "The problematic selector is this:",
        minimalNonMatching,
        this.selectorBuilder.build(minimalNonMatching)
      );
      return currentSet;
    }
    const sortedSelectors = [...currentSet].sort((a, b) => b.cost - a.cost);
    let improved = true;
    while (improved && currentSet.length > 1) {
      improved = false;
      for (const selectorToRemove of sortedSelectors) {
        if (!currentSet.includes(selectorToRemove)) {
          continue;
        }
        if (selectorToRemove.level === 0 && selectorToRemove.type === "tag") {
          continue;
        }
        const trialSet = currentSet.filter((s) => s !== selectorToRemove);
        const trialValue = this.getValue(elements, trialSet);
        if (trialValue && trialValue.count === targetCount) {
          currentSet = trialSet;
          currentValue = trialValue;
          improved = true;
          break;
        }
      }
    }
    return currentSet;
  }
};

// src/config/costs.js
var COST_ID = 0;
var COST_CLASS = 1;
var COST_TAG = 2;
var COST_ATTR = 3;
var COST_PARENT = 10;
var COST_SIBLING = 100;
var COST_CHILDREN = 100;
var COST_DISTANCE = 1;
var COST_IS_HAS = 5;
var COST_NOT = 10;

// src/config/constants.js
var BLACKLIST_IDS = [
  "*lottie*",
  "selector-generator"
];
var BLACKLIST_CLASSES = [
  "*-ng-*",
  // Angular generated classes
  "ng-*",
  // Angular directives
  "*tw-*",
  "*[*px]*"
];
var BLACKLIST_ATTRIBUTES = [
  "id",
  "style",
  "*-ng-*",
  // Angular generated classes
  "ng-*",
  // Angular directives
  "*tw-*",
  "xmlns*"
];

// src/utils/BlacklistMatcher.js
var _patternToRegex, patternToRegex_fn;
var BlacklistMatcher = class {
  /**
   * Checks if a value matches any pattern in the blacklist.
   * @param {string} value - Value to check
   * @param {Array<string>} patterns - Array of wildcard patterns
   * @returns {boolean} True if value matches any pattern
   */
  static matches(value, patterns) {
    if (!value || !patterns || patterns.length === 0) {
      return false;
    }
    for (const pattern of patterns) {
      const regex = __privateMethod(this, _patternToRegex, patternToRegex_fn).call(this, pattern);
      if (regex.test(value)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Filters an array of values, removing those that match blacklist patterns.
   * @param {Array<string>} values - Values to filter
   * @param {Array<string>} patterns - Array of wildcard patterns
   * @returns {Array<string>} Filtered values
   */
  static filter(values, patterns) {
    if (!values || values.length === 0) {
      return values;
    }
    if (!patterns || patterns.length === 0) {
      return values;
    }
    return values.filter((value) => !this.matches(value, patterns));
  }
};
_patternToRegex = new WeakSet();
patternToRegex_fn = function(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const regexPattern = "^" + escaped.replace(/\*/g, ".*") + "$";
  return new RegExp(regexPattern);
};
/**
 * Converts a wildcard pattern to a regular expression.
 * @param {string} pattern - Pattern with * wildcards
 * @returns {RegExp} Regular expression
 * @private
 */
__privateAdd(BlacklistMatcher, _patternToRegex);

// src/generators/LocalSelectorGenerator.js
var LocalSelectorGenerator = class {
  /**
   * Generates local selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }
    const selectors = [];
    const elementSelectors = elements.map((element) => {
      const sels = [];
      if (element.id !== "" && !BlacklistMatcher.matches(element.id, BLACKLIST_IDS)) {
        sels.push({
          cost: COST_ID,
          level: 0,
          type: "id",
          selector: "#" + CSS.escape(element.id)
        });
      }
      sels.push({
        cost: COST_TAG,
        level: 0,
        type: "tag",
        selector: element.localName
      });
      for (let i = 0, attributes = element.attributes; i < attributes.length; i++) {
        const name = attributes.item(i).name;
        if (name === "class") {
          element.classList.forEach((currentClass) => {
            if (!BlacklistMatcher.matches(currentClass, BLACKLIST_CLASSES)) {
              sels.push({
                cost: COST_CLASS,
                level: 0,
                type: "class",
                selector: "." + CSS.escape(currentClass)
              });
            }
          });
          continue;
        }
        if (!BlacklistMatcher.matches(name, BLACKLIST_ATTRIBUTES)) {
          sels.push({
            cost: COST_ATTR,
            level: 0,
            type: "attr",
            selector: "[" + CSS.escape(name) + "]"
          });
        }
      }
      return sels;
    });
    if (elementSelectors.length === 0)
      return selectors;
    const firstSet = elementSelectors[0];
    for (const descriptor of firstSet) {
      const isCommon = elementSelectors.every(
        (set) => set.some((d) => d.selector === descriptor.selector)
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }
    return selectors;
  }
};

// src/utils/AttributeCollector.js
var AttributeCollector = class {
  /**
   * Creates an AttributeCollector instance.
   * @param {HTMLElement|SVGElement} targetElement - The target element to compare against
   */
  constructor(targetElement) {
    this.targetElement = targetElement;
  }
  /**
   * Collects extra IDs from elements that the target doesn't have.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Array<string>} Array of CSS-escaped ID values
   */
  collectExtraIds(elements) {
    const extraIds = [];
    for (let i = 0; i < elements.length; i++) {
      const currentElement = elements[i];
      if (currentElement === this.targetElement) {
        continue;
      }
      const id = currentElement.getAttribute("id");
      if (id !== null && !BlacklistMatcher.matches(id, BLACKLIST_IDS)) {
        extraIds.push(CSS.escape(id));
      }
    }
    return extraIds;
  }
  /**
   * Collects extra classes from elements that the target doesn't have.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Array<string>} Array of CSS-escaped class names
   */
  collectExtraClasses(elements) {
    const extraClasses = [];
    for (let i = 0; i < elements.length; i++) {
      const currentElement = elements[i];
      if (currentElement === this.targetElement) {
        continue;
      }
      currentElement.classList.forEach((currentClass) => {
        if (!this.targetElement.classList.contains(currentClass) && !extraClasses.includes(currentClass) && !BlacklistMatcher.matches(currentClass, BLACKLIST_CLASSES)) {
          extraClasses.push(CSS.escape(currentClass));
        }
      });
    }
    return extraClasses;
  }
  /**
   * Collects extra attributes from elements that the target doesn't have.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Array<string>} Array of CSS-escaped attribute names
   */
  collectExtraAttributes(elements) {
    const extraAttr = [];
    for (let i = 0; i < elements.length; i++) {
      const currentElement = elements[i];
      if (currentElement === this.targetElement) {
        continue;
      }
      const attributes = currentElement.attributes;
      for (let j = 0; j < attributes.length; j++) {
        const currentAttr = attributes.item(j);
        if (!this.targetElement.hasAttribute(currentAttr.name) && !extraAttr.includes(currentAttr.name) && !BlacklistMatcher.matches(currentAttr.name, BLACKLIST_ATTRIBUTES)) {
          extraAttr.push(CSS.escape(currentAttr.name));
        }
      }
    }
    return extraAttr;
  }
  /**
   * Collects all extra attributes (IDs, classes, attributes) at once.
   * @param {NodeList|Array} elements - Elements to analyze
   * @returns {Object} Object with extraIds, extraClasses, extraAttributes arrays
   */
  collectAll(elements) {
    return {
      extraIds: this.collectExtraIds(elements),
      extraClasses: this.collectExtraClasses(elements),
      extraAttributes: this.collectExtraAttributes(elements)
    };
  }
};

// src/generators/LocalExclusionGenerator.js
var LocalExclusionGenerator = class {
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
    const elementExclusions = elements.map((element) => {
      const localSelectors = this.localGenerator.generate([element]);
      const baseSelector = this.selectorBuilder.build(localSelectors);
      const matchedElements = this.domService.querySelectorAll(baseSelector);
      const exclSelectors = [];
      const collector = new AttributeCollector(element);
      const { extraIds, extraClasses, extraAttributes } = collector.collectAll(matchedElements);
      for (let i = 0; i < extraIds.length; i++) {
        exclSelectors.push({
          cost: COST_NOT + COST_ID,
          level: 0,
          type: "pseudo",
          selector: ":not(#" + extraIds[i] + ")"
        });
      }
      for (let i = 0; i < extraClasses.length; i++) {
        exclSelectors.push({
          cost: COST_NOT + COST_CLASS,
          level: 0,
          type: "pseudo",
          selector: ":not(." + extraClasses[i] + ")"
        });
      }
      for (let i = 0; i < extraAttributes.length; i++) {
        exclSelectors.push({
          cost: COST_NOT + COST_ATTR,
          level: 0,
          type: "pseudo",
          selector: ":not([" + extraAttributes[i] + "])"
        });
      }
      return exclSelectors;
    });
    if (elementExclusions.length === 0)
      return selectors;
    const firstSet = elementExclusions[0];
    for (const descriptor of firstSet) {
      const isCommon = elementExclusions.every(
        (set) => set.some((d) => d.selector === descriptor.selector)
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }
    return selectors;
  }
};

// src/generators/ChildrenSelectorGenerator.js
var _processChildren, processChildren_fn;
var ChildrenSelectorGenerator = class {
  /**
   * Creates a ChildrenSelectorGenerator instance.
   * @param {LocalSelectorGenerator} localGenerator - Generator for local selectors
   */
  constructor(localGenerator) {
    /**
     * Recursively processes children and their descendants.
     * @private
     * @param {HTMLElement|SVGElement} element - Current element being processed
     * @param {number} depth - Current depth
     * @param {Array<SelectorDescriptor>} selectors - Accumulator for selector descriptors
     */
    __privateAdd(this, _processChildren);
    this.localGenerator = localGenerator;
  }
  /**
   * Generates children selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }
    const selectors = [];
    const elementSelectors = elements.map((element) => {
      const sels = [];
      __privateMethod(this, _processChildren, processChildren_fn).call(this, element, 0, sels);
      return sels;
    });
    if (elementSelectors.length === 0)
      return selectors;
    const firstSet = elementSelectors[0];
    for (const descriptor of firstSet) {
      const isCommon = elementSelectors.every(
        (set) => set.some((d) => d.selector === descriptor.selector)
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }
    return selectors;
  }
};
_processChildren = new WeakSet();
processChildren_fn = function(element, depth, selectors) {
  const children = element.children;
  const depthSelector = ">*".repeat(depth);
  if (children.length === 0) {
    if (element.childNodes.length > 0 && depth === 0) {
      selectors.push({
        cost: depth * COST_DISTANCE + COST_NOT + COST_IS_HAS + COST_CHILDREN,
        level: 0,
        type: "pseudo",
        selector: `:not(:has(>*))`
      });
      return selectors;
    }
    if (element.childNodes.length === 0) {
      selectors.push({
        cost: depth * COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
        level: 0,
        type: "pseudo",
        selector: depth > 0 ? `:has(${depthSelector}:empty)` : `:empty`
      });
      if (depth > 0) {
        selectors.push({
          cost: COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
          level: 0,
          type: "pseudo",
          selector: `:has(:empty)`
        });
      }
    }
    return selectors;
  }
  selectors.push({
    cost: depth * COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
    level: 0,
    type: "pseudo",
    selector: depth > 0 ? `:has(${depthSelector}>*:nth-child(${children.length}):last-child)` : `:has(:nth-child(${children.length}):last-child)`
  });
  if (depth > 0) {
    selectors.push({
      cost: COST_DISTANCE + COST_IS_HAS + COST_CHILDREN,
      level: 0,
      type: "pseudo",
      selector: `:has(* :nth-child(${children.length}):last-child)`
    });
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const localSelectors = this.localGenerator.generate([child]);
    for (const childrenLocalSelector of localSelectors) {
      selectors.push({
        cost: depth * COST_DISTANCE + COST_IS_HAS + COST_CHILDREN + childrenLocalSelector.cost,
        level: 0,
        type: "pseudo",
        selector: depth > 0 ? `:has(${depthSelector}>${childrenLocalSelector.selector})` : `:has(>${childrenLocalSelector.selector})`
      });
      if (depth > 0) {
        selectors.push({
          cost: COST_DISTANCE + COST_IS_HAS + COST_CHILDREN + childrenLocalSelector.cost,
          level: 0,
          type: "pseudo",
          selector: `:has(* ${childrenLocalSelector.selector})`
        });
      }
    }
    __privateMethod(this, _processChildren, processChildren_fn).call(this, child, depth + 1, selectors);
  }
};

// src/generators/ChildrenExclusionGenerator.js
var ChildrenExclusionGenerator = class {
  /**
   * Creates a ChildrenExclusionGenerator instance.
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
   * Generates children exclusion selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }
    const selectors = [];
    const elementSelectors = elements.map((element) => {
      const sels = [];
      const elementSelector = this.localGenerator.generate([element]);
      const childrenSelector = this.selectorBuilder.build(elementSelector) + " *";
      const allChildren = this.domService.querySelectorAll(childrenSelector);
      const extraClasses = [];
      const extraAttr = [];
      for (let i = 0; i < allChildren.length; i++) {
        const currentChild = allChildren[i];
        if (element.contains(currentChild)) {
          continue;
        }
        const id = currentChild.getAttribute("id");
        if (id !== null && !BlacklistMatcher.matches(id, BLACKLIST_IDS)) {
          sels.push({
            cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_ID,
            level: 0,
            type: "pseudo",
            selector: ":not(:has(#" + CSS.escape(id) + "))"
          });
        }
        currentChild.classList.forEach((currentClass) => {
          if (!element.querySelector("." + CSS.escape(currentClass)) && !extraClasses.includes(currentClass) && !BlacklistMatcher.matches(currentClass, BLACKLIST_CLASSES)) {
            extraClasses.push(CSS.escape(currentClass));
          }
        });
        const attributes = currentChild.attributes;
        for (let j = 0; j < attributes.length; j++) {
          const currentAttr = attributes.item(j);
          if (!element.querySelector("[" + CSS.escape(currentAttr.name) + "]") && !extraAttr.includes(currentAttr.name) && !BlacklistMatcher.matches(currentAttr.name, BLACKLIST_ATTRIBUTES)) {
            extraAttr.push(CSS.escape(currentAttr.name));
          }
        }
      }
      for (let i = 0; i < extraClasses.length; i++) {
        sels.push({
          cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_CLASS,
          level: 0,
          type: "pseudo",
          selector: ":not(:has(." + extraClasses[i] + "))"
        });
      }
      for (let i = 0; i < extraAttr.length; i++) {
        sels.push({
          cost: COST_NOT + COST_IS_HAS + COST_CHILDREN + COST_ATTR,
          level: 0,
          type: "pseudo",
          selector: ":not(:has([" + extraAttr[i] + "]))"
        });
      }
      return sels;
    });
    if (elementSelectors.length === 0)
      return selectors;
    const firstSet = elementSelectors[0];
    for (const descriptor of firstSet) {
      const isCommon = elementSelectors.every(
        (set) => set.some((d) => d.selector === descriptor.selector)
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }
    return selectors;
  }
};

// src/generators/SiblingSelectorGenerator.js
var SiblingSelectorGenerator = class {
  /**
   * Creates a SiblingSelectorGenerator instance.
   * @param {LocalSelectorGenerator} localGenerator - Generator for local selectors
   */
  constructor(localGenerator) {
    this.localGenerator = localGenerator;
  }
  /**
   * Generates sibling selectors for elements.
   * Returns only selectors that are common to all target elements.
   * @param {Array<HTMLElement|SVGElement>} elements - The target elements
   * @returns {Array<SelectorDescriptor>} Array of selector descriptors
   */
  generate(elements) {
    for (const element of elements) {
      ElementValidator.assertValid(element);
    }
    const selectors = [];
    const elementSelectors = elements.map((element) => {
      const sels = [];
      let prevSibling = element.previousElementSibling;
      const prevSiblingCount = prevSibling !== null ? Array.from(element.parentElement.children).indexOf(element) : 0;
      let nextSibling = element.nextElementSibling;
      const nextSiblingCount = nextSibling !== null ? Array.from(element.parentElement.children).length - Array.from(element.parentElement.children).indexOf(element) : 0;
      if (prevSibling === null) {
        sels.push({
          cost: (nextSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
          level: 0,
          type: "pseudo",
          selector: ":first-child"
        });
      } else {
        sels.push({
          cost: (prevSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
          level: 0,
          type: "pseudo",
          selector: ":nth-child(" + (prevSiblingCount + 1) + ")"
        });
      }
      if (nextSibling === null) {
        sels.push({
          cost: (prevSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
          level: 0,
          type: "pseudo",
          selector: ":last-child"
        });
      } else {
        if (prevSiblingCount > 0) {
          sels.push({
            cost: (nextSiblingCount + 1) * COST_DISTANCE + COST_SIBLING,
            level: 0,
            type: "pseudo",
            selector: ":nth-last-child(" + nextSiblingCount + ")"
          });
        }
      }
      if (prevSibling === null && nextSibling === null) {
        sels.push({
          cost: COST_SIBLING,
          level: 0,
          type: "pseudo",
          selector: ":only-child"
        });
      }
      while (prevSibling) {
        if (prevSibling.nodeType === Node.COMMENT_NODE) {
          prevSibling = prevSibling.previousElementSibling;
          continue;
        }
        if (prevSibling.nodeType === Node.TEXT_NODE) {
          prevSibling = prevSibling.previousElementSibling;
          continue;
        }
        const localSelectors = this.localGenerator.generate([prevSibling]);
        for (const currentSelector of localSelectors) {
          if (!sels.some(
            (s) => s.selector === ":is(" + currentSelector.selector + " ~ *)"
          )) {
            sels.push({
              cost: COST_SIBLING + COST_IS_HAS + currentSelector.cost,
              level: 0,
              type: "pseudo",
              selector: ":is(" + currentSelector.selector + " ~ *)"
            });
          }
        }
        prevSibling = prevSibling.previousElementSibling;
      }
      while (nextSibling) {
        if (nextSibling.nodeType === Node.COMMENT_NODE) {
          nextSibling = nextSibling.nextElementSibling;
          continue;
        }
        if (nextSibling.nodeType === Node.TEXT_NODE) {
          nextSibling = nextSibling.nextElementSibling;
          continue;
        }
        const localSelectors = this.localGenerator.generate([nextSibling]);
        for (const currentSelector of localSelectors) {
          if (!sels.some(
            (s) => s.selector === ":has(~ " + currentSelector.selector + ")"
          )) {
            sels.push({
              cost: COST_SIBLING + COST_IS_HAS + currentSelector.cost,
              level: 0,
              type: "pseudo",
              selector: ":has(~ " + currentSelector.selector + ")"
            });
          }
        }
        nextSibling = nextSibling.nextElementSibling;
      }
      return sels;
    });
    if (elementSelectors.length === 0)
      return selectors;
    const firstSet = elementSelectors[0];
    for (const descriptor of firstSet) {
      const isCommon = elementSelectors.every(
        (set) => set.some((d) => d.selector === descriptor.selector)
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }
    return selectors;
  }
};

// src/generators/ParentSelectorGenerator.js
var ParentSelectorGenerator = class {
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
    const elementSelectors = elements.map((element) => {
      const sels = [];
      let currentParent = element.parentElement;
      let level = 1;
      while (currentParent) {
        const localSelectors = this.localGenerator.generate([currentParent]);
        for (const currentSelector of localSelectors) {
          sels.push({
            cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
            level,
            type: currentSelector.type,
            selector: currentSelector.selector
          });
        }
        const localExclSelectors = this.exclusionGenerator.generate([currentParent]);
        for (const currentSelector of localExclSelectors) {
          sels.push({
            cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
            level,
            type: currentSelector.type,
            selector: currentSelector.selector
          });
        }
        const siblingSelectors = this.siblingGenerator.generate([currentParent]);
        for (const currentSelector of siblingSelectors) {
          sels.push({
            cost: level * COST_DISTANCE + COST_PARENT + currentSelector.cost,
            level,
            type: currentSelector.type,
            selector: currentSelector.selector
          });
        }
        currentParent = currentParent.parentElement;
        level = level + 1;
      }
      return sels;
    });
    if (elementSelectors.length === 0)
      return selectors;
    const firstSet = elementSelectors[0];
    for (const descriptor of firstSet) {
      const isCommon = elementSelectors.every(
        (set) => set.some((d) => d.selector === descriptor.selector)
      );
      if (isCommon) {
        selectors.push(descriptor);
      }
    }
    return selectors;
  }
};

// src/SelectorGenerator.js
var SelectorGenerator = class {
  constructor() {
    this.domService = new DOMService();
    this.selectorBuilder = new SelectorBuilder();
    this.bottomUpOptimizer = new BottomUpSelectorOptimizer(this.domService, this.selectorBuilder);
    this.topDownOptimizer = new TopDownSelectorOptimizer(this.domService, this.selectorBuilder);
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
   * @param {HTMLElement|SVGElement|Array<HTMLElement|SVGElement>} elements - The target element(s)
   * @returns {string} CSS selector string that uniquely identifies the element(s)
   * @throws {Error} If elements don't share the same parent or invalid element type
   */
  getSelector(elements) {
    const normalizedElements = Array.isArray(elements) ? elements : [elements];
    for (const element of normalizedElements) {
      ElementValidator.assertValid(element);
    }
    if (normalizedElements.length > 1) {
      const firstParent = normalizedElements[0].parentElement;
      for (let i = 1; i < normalizedElements.length; i++) {
        const currentParent = normalizedElements[i].parentElement;
        const parentsEqual = currentParent === firstParent;
        console.log(`[DEBUG] Element ${i} check:`, {
          currentElement: normalizedElements[i],
          currentParent,
          firstParent,
          areEqual: parentsEqual,
          currentParentTagName: currentParent?.tagName,
          firstParentTagName: firstParent?.tagName
        });
        if (!parentsEqual) {
          throw new Error(
            `All elements must share the same parent for multi-element selector generation (element ${i} differs)`
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
    let bestSelectorSet = this.topDownOptimizer.findBest(normalizedElements, selectors);
    const selector = this.selectorBuilder.build(bestSelectorSet);
    return selector;
  }
};

// src/index.js
var SelectorGenerator2 = function() {
  "use strict";
  const generator = new SelectorGenerator();
  return {
    getSelector: (elements) => generator.getSelector(elements)
  };
}();
if (typeof window !== "undefined") {
  window.SelectorGenerator = SelectorGenerator2;
}
export {
  SelectorGenerator2 as SelectorGenerator,
  SelectorGenerator as SelectorGeneratorClass
};
//# sourceMappingURL=selector-generator.js.map
