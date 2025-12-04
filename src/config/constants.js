/**
 * General constants for selector generation.
 */

export const IGNORED_ATTRIBUTES = ["id", "style"];
export const IGNORED_ATTRIBUTES_FOR_EXCLUSION = ["class", "style"];

/**
 * Blacklist patterns for filtering IDs, classes, and attributes.
 * Supports wildcards: * matches any sequence of characters.
 * Examples:
 *   "*-ng-*" matches "app-ng-content", "ng-scope", etc.
 *   "temp-*" matches "temp-123", "temp-xyz", etc.
 *   "*generated*" matches "auto-generated-id", "generated", etc.
 */
export const BLACKLIST_IDS = [
  "*lottie*",
  "selector-generator"
];

export const BLACKLIST_CLASSES = [
  "*-ng-*", // Angular generated classes
  "ng-*", // Angular directives
  "*tw-*",
  "*[*px]*",
];

export const BLACKLIST_ATTRIBUTES = [
  "*-ng-*", // Angular generated classes
  "ng-*", // Angular directives
  "*tw-*",
  "xmlns*",
];
