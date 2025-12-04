/**
 * Utility for matching strings against wildcard patterns.
 */
export class BlacklistMatcher {
  /**
   * Converts a wildcard pattern to a regular expression.
   * @param {string} pattern - Pattern with * wildcards
   * @returns {RegExp} Regular expression
   * @private
   */
  static #patternToRegex(pattern) {
    // Escape special regex characters except *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // Replace * with .*
    const regexPattern = '^' + escaped.replace(/\*/g, '.*') + '$';
    return new RegExp(regexPattern);
  }

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
      const regex = this.#patternToRegex(pattern);
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

    return values.filter(value => !this.matches(value, patterns));
  }
}