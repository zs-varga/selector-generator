/**
 * Public API for the Selector Generator library.
 * Provides an IIFE wrapper for backward compatibility with the original implementation.
 */
import { SelectorGenerator as SelectorGeneratorClass } from './SelectorGenerator.js';

// Create the wrapped API (same interface as the original)
const SelectorGenerator = (function() {
  'use strict';

  const generator = new SelectorGeneratorClass();

  return {
    getSelector: (elements) => generator.getSelector(elements)
  };
})();

// Set as global for backward compatibility (if in browser)
if (typeof window !== 'undefined') {
  window.SelectorGenerator = SelectorGenerator;
}

// Export for module systems (ESM builds only)
export { SelectorGenerator };
export { SelectorGeneratorClass };
