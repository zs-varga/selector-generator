# Build Instructions

This project uses esbuild to bundle the modular source code from `/src` into a JavaScript library with both development and production versions.

## Setup

Install dependencies:

```bash
npm install
```

## Building

### Full Build (Development + Production)

Build both versions:

```bash
npm run build
```

This generates:
- `dist/selector-generator.js` - Development version (36KB, readable)
- `dist/selector-generator.min.js` - Production version (11KB, minified)
- `.map` files for both (source maps for debugging)

### Development Mode

Watch for changes and auto-rebuild the development version:

```bash
npm run dev
```

This will automatically rebuild `dist/selector-generator.js` whenever you change any file in `/src`.

## Workflow

1. **Edit source code** in the `/src` directory
   - Update generators, optimizers, or core logic
   - Keep code modular and maintainable

2. **Run build** to generate library bundles
   ```bash
   npm run build
   ```

3. **Test in your project**
   - Import the library in your project
   - Use development version for debugging
   - Use production version for deployments

## Project Structure

```
/src                            - Modular source code (EDIT HERE)
  ├── config/                   - Configuration constants
  ├── validators/               - Input validation
  ├── services/                 - DOM services
  ├── builders/                 - Selector building
  ├── generators/               - Selector generation strategies
  ├── optimizers/               - Optimization algorithms
  ├── utils/                    - Utility functions
  ├── SelectorGenerator.js      - Main class
  └── index.js                  - Public API

/dist                           - Generated library (DO NOT EDIT)
  ├── selector-generator.js     - Development build (36KB, readable)
  ├── selector-generator.js.map - Development source map
  ├── selector-generator.min.js - Production build (11KB, minified)
  └── selector-generator.min.js.map - Production source map

build.js                        - Build configuration
package.json                    - Package metadata
```

## Important Notes

- ✅ **Always edit** source files in `/src`
- ❌ **Never edit** `dist/selector-generator.js` or `dist/selector-generator.min.js` directly (they will be overwritten)
- 🔄 **Run build** after making changes to `/src`
- 👀 **Use watch mode** (`npm run dev`) during active development
- 📦 **Use development version** for debugging and development
- 🚀 **Use production version** for npm packages and deployments

## Build Output

The build script creates two versions:

### Development Version
- File: `dist/selector-generator.js` (36KB)
- Minification: None
- Obfuscation: None
- Source Maps: Yes (64KB)
- Use Case: Development, debugging, understanding code

### Production Version
- File: `dist/selector-generator.min.js` (11KB)
- Minification: Yes
- Obfuscation: Yes (69% smaller)
- Source Maps: Yes (64KB)
- Use Case: Production deployments, npm packages

Both versions:
- Use ESM (ES Modules) format
- Target ES2020
- Include source maps for debugging
- Include the same API and functionality

## Using the Library

### Import Development Version (Readable)
```javascript
import { SelectorGenerator } from 'css-selector-generator';

const element = document.querySelector('.my-element');
const selector = SelectorGenerator.getSelector(element);
console.log(selector);
```

### Import Production Version (Minified)
```javascript
import { SelectorGenerator } from 'css-selector-generator/min';

const element = document.querySelector('.my-element');
const selector = SelectorGenerator.getSelector(element);
console.log(selector);
```

## Cleaning

Remove generated files:

```bash
npm run clean
```

Then rebuild with `npm run build`.

## Performance

- Build time: ~20ms for both versions (parallel builds)
- Bundle sizes: 36KB (dev) + 11KB (prod)
- Development bundle: 1,044 lines (readable)
- Production bundle: 2 lines (minified)

## Publishing to npm

Before publishing:

1. Ensure `package.json` has correct metadata
2. Run `npm run build` to generate both versions
3. Verify both dist files are created
4. Commit changes
5. Tag release
6. Publish with `npm publish`

The `exports` field in `package.json` ensures users can import either version:
- Default: `import ... from 'package-name'` (development)
- Production: `import ... from 'package-name/min'` (minified)