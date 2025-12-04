/**
 * Builds CSS selector strings from selector descriptor sets.
 */
export class SelectorBuilder {
  /**
   * Builds a selector string from a set of selectors at the same level.
   * Merges them in proper type order: tag -> id -> class -> attr -> pseudo
   * @param {Array<SelectorDescriptor>} selectors - Array of selector descriptors at the same level
   * @returns {string} CSS selector string
   * @private
   */
  #simpleBuild(selectors) {
    const tagSelectors = selectors.filter((x) => x.type === "tag");
    const idSelectors = selectors.filter((x) => x.type === "id");
    const classSelectors = selectors.filter((x) => x.type === "class");
    const attrSelectors = selectors.filter((x) => x.type === "attr");
    const pseudoSelectors = selectors.filter((x) => x.type === "pseudo");

    return (
      tagSelectors.map((x) => x.selector).join("") +
      idSelectors.map((x) => x.selector).join("") +
      classSelectors.map((x) => x.selector).join("") +
      attrSelectors.map((x) => x.selector).join("") +
      pseudoSelectors.map((x) => x.selector).join("")
    );
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

    let selector =
      tagSelectors.map((x) => x.selector).join("") +
      idSelectors.map((x) => x.selector).join("") +
      classSelectors.map((x) => x.selector).join("") +
      attrSelectors.map((x) => x.selector).join("") +
      pseudoSelectors.map((x) => x.selector).join("");

    if (selector === "") {
      selector = "*";
    }
    
    if (parentSelectors.length > 0) {
      // Group parent selectors by level
      const levelMap = new Map();
      for (const ps of parentSelectors) {
        if (!levelMap.has(ps.level)) {
          levelMap.set(ps.level, []);
        }
        levelMap.get(ps.level).push(ps);
      }

      // Sort levels in ascending order
      const levels = Array.from(levelMap.keys()).sort((a, b) => a - b);

      let prevLevel = 0;
      for (const level of levels) {
        // Use simpleBuild to merge selectors at the same level in proper order
        const levelSelector = this.#simpleBuild(levelMap.get(level));

        // Add appropriate combinator based on level difference
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
}
