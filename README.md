# CSS Selector Generator

A modular JavaScript library for generating optimal, unique CSS selectors for DOM elements.

## Features

- **Multiple selector strategies**: ID, tag, class, attributes, pseudo-selectors
- **Parent and sibling analysis**: Utilizes DOM relationships for better selectors
- **Children analysis**: Uses `:has()`, `:empty`, and child structure
- **Optimization algorithm**: Greedy algorithm finds minimal, unique selectors
- **Modular architecture**: Easy to test, maintain, and extend

## Installation

```bash
npm install css-selector-generator
```

## Quick Start

### Development Version (with source maps)
```javascript
import { SelectorGenerator } from 'css-selector-generator';

const element = document.querySelector('.my-element');
const selector = SelectorGenerator.getSelector(element);
console.log(selector); // e.g., ".my-element#id" or "div.container > .item:first-child"
```

### Production Version (minified & obfuscated)
```javascript
import { SelectorGenerator } from 'css-selector-generator/min';

const element = document.querySelector('.my-element');
const selector = SelectorGenerator.getSelector(element);
console.log(selector); // Same API, smaller bundle size
```

## Project Structure

```
src/
├── config/
│   ├── costs.js                # Cost constants for selector ranking
│   └── constants.js             # Blacklist and configuration constants
├── validators/
│   └── ElementValidator.js      # Element type validation
├── services/
│   └── DOMService.js            # DOM query abstraction layer
├── builders/
│   └── SelectorBuilder.js       # Builds CSS selector strings
├── utils/
│   ├── AttributeCollector.js    # Attribute collection utilities
│   └── BlacklistMatcher.js      # Blacklist pattern matching
├── generators/
│   ├── LocalSelectorGenerator.js          # ID, tag, class, attributes
│   ├── LocalExclusionGenerator.js         # :not() pseudo-selectors
│   ├── ChildrenSelectorGenerator.js       # Children-based selectors
│   ├── ChildrenExclusionGenerator.js      # Children exclusion selectors
│   ├── SiblingSelectorGenerator.js        # Sibling relationships
│   └── ParentSelectorGenerator.js         # Parent tree traversal
├── optimizers/
│   ├── TopDownSelectorOptimizer.js        # Main greedy optimizer
│   ├── BottomUpSelectorOptimizer.js       # Alternative optimizer
│   └── DebugOptimizer.js                  # Debugging helper
├── SelectorGenerator.js         # Main orchestrator
└── index.js                     # Public API
```

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
// Returns: "button#test-button.btn.primary"
```

## How It Works

1. **Generate Candidates**: Creates various selector types (local, children, siblings, parents)
2. **Assign Priorities**: Each selector type has a priority (lower = better)
3. **Optimize**: Greedy algorithm finds the minimal combination that uniquely identifies the element
4. **Build**: Combines selected descriptors into a valid CSS selector string

### Priority Levels

- **1**: Local selectors (ID, tag, class, attributes)
- **2**: Local exclusion selectors (`:not()`)
- **4**: Children selectors (`:has()`, `:empty`)
- **6**: Sibling selectors (`:first-child`, `:nth-child()`)
- **8**: Parent selectors
- **10**: Parent exclusion and sibling selectors

## Architecture Benefits

### Modular Design
- Each module has a single responsibility
- Easy to test individual components
- Clear dependency graph

### Maintainability
- Separated concerns make debugging easier
- Configuration is centralized
- Code duplication eliminated

### Extensibility
- Add new generator types by creating new classes
- Modify priorities without touching core logic
- DOMService allows for testing without real DOM

## Migration from Original

The refactored version maintains backward compatibility:

```javascript
// Old monolithic version
const selector = SelectorGeneratorWrapped.getSelector(element);

// New modular version (same API)
const selector = SelectorGenerator.getSelector(element);
```

## Development

### Adding a New Generator

1. Create a new file in `src/generators/`
2. Implement the `generate(element)` method
3. Return an array of `SelectorDescriptor` objects
4. Add the generator to `SelectorGenerator.js`

### Selector Descriptor Format

```javascript
{
  priority: number,    // Lower = higher priority
  level: number,       // 0 = current, positive = parent, negative = children
  type: string,        // 'id' | 'class' | 'tag' | 'attr' | 'pseudo'
  selector: string     // CSS selector fragment
}
```

## Known Limitations

- SVG `xmlns` attribute cannot be used as an attribute selector (browser limitation)
- Requires modern browser with ES6 module support
- `:has()` selector requires recent browser versions

## License

See original license terms.
