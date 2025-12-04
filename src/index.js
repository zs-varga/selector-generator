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
    getSelector: (element) => generator.getSelector(element)
  };
})();

// Export for module systems
export { SelectorGenerator };
export { SelectorGeneratorClass };

// Also set as global for backward compatibility (if in browser)
if (typeof window !== 'undefined') {
  window.SelectorGenerator = SelectorGenerator;
}
