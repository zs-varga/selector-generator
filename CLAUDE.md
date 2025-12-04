# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CSS Selector Generator** - A modular JavaScript library that generates optimal, unique CSS selectors for DOM elements. The library uses a greedy optimization algorithm to produce minimal, reliable selectors that uniquely identify elements in the DOM tree.

## Build and Development Commands

```bash
npm install              # Install dependencies (esbuild only)
npm run build            # Production build: bundles src/ into dist/selector-generator.js
npm run dev              # Watch mode: auto-rebuilds on file changes
npm run clean            # Remove generated dist/ directory
```

**Important:** Always edit source files in `/src/`, never edit `dist/selector-generator.js` directly—it's generated and will be overwritten.

## Architecture Overview

### Core Algorithm Flow

```
┌─ SelectorGenerator.getSelector(element) ────┐
│  Main entry point, orchestrates generation   │
└─────────────────────────────────────────────┘
              ↓
┌─ 6 Generator Modules ──────────────────────┐
│ LocalSelectorGenerator (ID, tag, class)     │
│ LocalExclusionGenerator (:not() selectors)  │
│ ChildrenSelectorGenerator (:has() pseudo)   │
│ SiblingSelectorGenerator (sibling relations)│
│ ParentSelectorGenerator (parent traversal)  │
│ ChildrenExclusionGenerator (complex :not()) │
└─────────────────────────────────────────────┘
              ↓
┌─ TopDownSelectorOptimizer ─────────────────┐
│ Greedy algorithm: start with all selectors, │
│ remove unnecessarily until minimal set found│
└─────────────────────────────────────────────┘
              ↓
┌─ SelectorBuilder ──────────────────────────┐
│ Converts descriptor objects to CSS strings  │
└─────────────────────────────────────────────┘
```

### Key Principle: Cost-Based Ranking

Each selector type has a cost (lower = better):
- **0-3**: Local selectors (ID, class, tag, attributes)
- **4-5**: Parent selectors
- **6-9**: Children/pseudo-selectors
- **10-12**: Exclusion (:not()) selectors
- **13-16**: Complex compounds
- **17-22**: Sibling-based selectors

The optimizer greedily removes highest-cost (worst) selectors first, stopping when the element is no longer uniquely identified.

### Selector Descriptor Format

All generators return arrays of descriptor objects:

```javascript
{
  cost: number,        // Ranking (lower = better)
  level: number,       // 0 = target, >0 = parent levels, <0 = child levels
  type: string,        // 'id' | 'class' | 'tag' | 'attr' | 'pseudo'
  selector: string     // CSS fragment (e.g., ".btn", "#main", ":has(>span)")
}
```

## Directory Structure

```
/src/                             # Main selector library (EDIT HERE)
├── index.js                      # Public API wrapper
├── SelectorGenerator.js          # Main orchestrator class
│
├── config/
│   ├── constants.js              # Blacklist patterns for unreliable selectors
│   └── costs.js                  # Cost constants for ranking
│
├── validators/
│   └── ElementValidator.js       # Validates HTMLElement/SVGElement instances
│
├── services/
│   └── DOMService.js             # Abstraction for DOM queries (aids testing)
│
├── builders/
│   └── SelectorBuilder.js        # Combines descriptors into CSS selector strings
│
├── generators/                   # 6 strategy modules (return SelectorDescriptor[])
│   ├── LocalSelectorGenerator.js
│   ├── LocalExclusionGenerator.js
│   ├── ChildrenSelectorGenerator.js
│   ├── ChildrenExclusionGenerator.js
│   ├── SiblingSelectorGenerator.js
│   └── ParentSelectorGenerator.js
│
├── optimizers/                   # 2 strategy implementations
│   ├── TopDownSelectorOptimizer.js (currently active)
│   ├── BottomUpSelectorOptimizer.js (alternative)
│   └── DebugOptimizer.js (debugging helper)
│
└── utils/
    ├── AttributeCollector.js     # Gathers element attributes
    └── BlacklistMatcher.js       # Pattern matching for blacklist filters

/dist/                            # Generated output (DO NOT EDIT)
├── selector-generator.js         # Development build (36kb, readable)
├── selector-generator.js.map     # Development source map
├── selector-generator.min.js     # Production build (11kb, minified)
└── selector-generator.min.js.map # Production source map

build.js                          # esbuild configuration
package.json                      # Dependencies, build scripts
```

## Key Code Flows

### Selector Generation Algorithm

1. **Generate**: Each of 6 generators creates candidate selectors
2. **Combine**: Merge all descriptors into single array
3. **Optimize**: `TopDownSelectorOptimizer` greedily removes worst selectors
   - Start with all selectors combined
   - Repeatedly: sort by cost, try removing worst selector
   - Accept removal if element still uniquely identified
   - Iterate until no further improvements
4. **Build**: `SelectorBuilder` converts minimal descriptor set to CSS string
5. **Return**: Final selector string

### Example Flow

```javascript
// Development version (readable with source maps)
import { SelectorGenerator } from './dist/selector-generator.js';

// Production version (minified & obfuscated)
// import { SelectorGenerator } from './dist/selector-generator.min.js';

const element = document.querySelector('.button');
const selector = SelectorGenerator.getSelector(element);
// Returns: ".button#submit-btn" (optimized from longer alternatives)
```

## Build System Details

**Tool:** esbuild (fast bundler)

**Configuration (build.js):**
- Entry: `src/index.js`
- Output: `dist/selector-generator.js` (single ESM bundle)
- Format: ESM (ES Modules)
- Target: ES2020, browser platform
- Source maps: Enabled for debugging

**Workflow:**
```
Edit src/ files
  ↓
npm run build (or dev for watch)
  ↓
esbuild bundles and generates:
  - dist/selector-generator.js (dev: 36kb, readable)
  - dist/selector-generator.min.js (prod: 11kb, minified/obfuscated)
  - *.map files (source maps for debugging)
  ↓
Import from dist in your project
```

## Blacklist System

Prevents unreliable, framework-generated selectors:

**Patterns (wildcard support with *):**

```javascript
// IDs
BLACKLIST_IDS: ["*lottie*", "selector-generator"]

// Classes
BLACKLIST_CLASSES: ["*-ng-*", "ng-*", "*tw-*", "*[*px]*"]

// Attributes
BLACKLIST_ATTRIBUTES: ["*-ng-*", "ng-*", "*tw-*", "xmlns"]
```

Matched using `BlacklistMatcher.matches(value, patterns)` with wildcard expansion.

## API

### `SelectorGenerator.getSelector(element)`

Generates an optimal CSS selector for the given element.

**Parameters:**
- `element` (HTMLElement|SVGElement) - The target element

**Returns:**
- `string` - CSS selector that uniquely identifies the element

**Throws:**
- `Error` - If element is not an HTMLElement or SVGElement

**Example:**
```javascript
const button = document.querySelector('button');
const selector = SelectorGenerator.getSelector(button);
// Returns: "button#submit.btn.primary"
```

## Known Limitations & Considerations

- **SVG xmlns attribute**: Cannot be used as selector (browser limitation, blacklisted)
- **Browser requirements**: ES2020 support, `:has()` pseudo-selector support (2024+)
- **Modern only**: No support for older browsers or IE
- **No test suite**: Manual testing or add unit tests with mocked DOMService

## Testing Approach

To add tests:

1. **Unit test generators**: Mock `DOMService` to return known DOMs
2. **Test optimizer**: Verify it finds minimal selectors
3. **Test builder**: Validate CSS string generation
4. **Integration tests**: Use in real projects

`DOMService` abstraction supports mocking for unit tests without real DOM.

## Technology Stack

- **Language**: JavaScript ES2020+
- **Module System**: ES Modules (native `import/export`)
- **Build Tool**: esbuild ^0.19.0
- **Platform**: Universal (browsers, Node.js)
- **Browser APIs**: DOM, CSS escaping

## Recent Changes & Development Notes

**Latest commit**: "Refactor: Rename priority to cost across all generators and optimizers"
- Pure selector generation library with no UI dependencies
- Improved modularity and reusability

## Adding New Features

### Add a New Generator

1. Create `src/generators/MyGenerator.js`
2. Export `generate(element)` method
3. Return array of `SelectorDescriptor` objects
4. Import and call in `SelectorGenerator.js`

### Modify Selector Costs

Edit `src/config/costs.js`, then rebuild.

### Adjust Blacklist Patterns

Edit `src/config/constants.js`, then rebuild.

### Switch Optimization Strategy

In `SelectorGenerator.js`, change from `TopDownSelectorOptimizer` to `BottomUpSelectorOptimizer`.

## Common Development Tasks

**After modifying src/ files:**
```bash
npm run dev              # Watch mode for active development
# OR
npm run build            # Single build
```

**Before publishing:**
```bash
npm run build            # Ensure dist/selector-generator.js is up-to-date
```

**Clean rebuild:**
```bash
npm run clean            # Remove generated files
npm run build            # Fresh build
```

## Performance Notes

- **Greedy algorithm**: O(n²) worst case, but typically fast due to early termination
- **Bundle size**: ~15KB minified (all modules bundled)
- **Selector generation**: <10ms for most elements
- **Memory**: Minimal overhead, no persistent state

## Debugging

Enable console logs in generators or optimizers to debug selector generation:

```javascript
console.log('Generated descriptors:', descriptors);
console.log('Optimized descriptors:', optimized);
console.log('Final selector:', finalSelector);
```

Check build output for any esbuild warnings or errors.
