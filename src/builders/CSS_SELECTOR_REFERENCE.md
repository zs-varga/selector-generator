# CSS Selector Reference Guide

A comprehensive reference for CSS selector syntax, based on authoritative sources including MDN Web Docs.

---

## Table of Contents

1. [Basic Selectors](#basic-selectors)
2. [Combinators](#combinators)
3. [Attribute Selectors](#attribute-selectors)
4. [Pseudo-Classes](#pseudo-classes)
5. [Pseudo-Elements](#pseudo-elements)
6. [Selector Grouping](#selector-grouping)
7. [Specificity](#specificity)
8. [Modern Selectors](#modern-selectors)
9. [Browser Compatibility](#browser-compatibility)

---

## Basic Selectors

### Universal Selector (`*`)

Matches any element.

**Syntax:**
```css
* {
  margin: 0;
}
```

**With Namespace:**
```css
@namespace svg "http://www.w3.org/2000/svg";

/* Match all elements */
* { }

/* Match all SVG elements */
svg|* { }

/* Match elements in any namespace */
*|* { }
```

**Specificity:** 0-0-0 (does not add to specificity)

---

### Type Selector (Element Selector)

Matches elements by their node name.

**Syntax:**
```css
div { }
p { }
h1 { }
span { }
```

**Use Cases:**
- Applying base styles to HTML elements
- Resetting default browser styles
- Creating consistent typography

**Specificity:** 0-0-1

---

### Class Selector (`.classname`)

Matches elements by their class attribute value.

**Syntax:**
```css
.button { }
.nav-item { }
.alert-warning { }
```

**Multiple Classes:**
```css
/* Element with both classes */
.button.primary { }

/* Any element with class */
*.button { }
```

**Use Cases:**
- Reusable component styles
- State variations (active, disabled, etc.)
- Utility classes

**Specificity:** 0-1-0

---

### ID Selector (`#id`)

Matches an element by its unique id attribute.

**Syntax:**
```css
#header { }
#main-content { }
#footer { }
```

**Best Practices:**
- Use sparingly in CSS (high specificity)
- Prefer classes for styling
- Reserve for JavaScript hooks or anchor links

**Specificity:** 1-0-0

---

## Combinators

Combinators define relationships between selectors.

### Descendant Combinator (space)

Matches elements that are descendants (children, grandchildren, etc.) of a specified element.

**Syntax:**
```css
/* All <span> elements inside <div> */
div span { }

/* All <a> inside <li> inside <ul> */
ul li a { }
```

**Example:**
```html
<div>
  <span>Matched</span>
  <p>
    <span>Also matched</span>
  </p>
</div>
```

**Use Cases:**
- Styling nested components
- Contextual styling based on container

**Specificity:** Sum of all selectors

---

### Child Combinator (`>`)

Matches elements that are direct children of a specified element.

**Syntax:**
```css
/* Only direct <li> children of <ul> */
ul > li { }

/* Only direct <span> children of <div> */
div > span { }
```

**Example:**
```html
<ul>
  <li>Matched</li>
  <div>
    <li>NOT matched</li>
  </div>
</ul>
```

**Use Cases:**
- Precise structural styling
- Avoiding deep nesting issues
- Component isolation

**Specificity:** Sum of all selectors

---

### Next-Sibling Combinator (`+`)

Matches an element that immediately follows another specified element, sharing the same parent.

**Syntax:**
```css
/* <p> immediately after <h2> */
h2 + p { }

/* <div> immediately after <label> */
label + div { }
```

**Example:**
```html
<h2>Title</h2>
<p>Matched</p>
<p>NOT matched</p>
```

**Use Cases:**
- First paragraph styling after headings
- Form label-input relationships
- Sequential element styling

**Specificity:** Sum of all selectors

---

### Subsequent-Sibling Combinator (`~`)

Matches all elements that follow a specified element (not necessarily immediately), sharing the same parent.

**Syntax:**
```css
/* All <p> elements after <h2> */
h2 ~ p { }

/* All <div> after <input> */
input ~ div { }
```

**Example:**
```html
<h2>Title</h2>
<p>Matched</p>
<div>Something</div>
<p>Also matched</p>
```

**Use Cases:**
- Styling groups of related elements
- Form validation messages
- Dynamic content following a trigger

**Specificity:** Sum of all selectors

---

### Column Combinator (`||`)

Matches elements belonging to a column.

**Syntax:**
```css
/* All <td> in <col> */
col || td { }
```

**Browser Support:** Experimental - Not currently supported in any browser

---

## Attribute Selectors

Attribute selectors match elements based on their attributes and values.

### Basic Attribute Presence

**`[attr]`** - Has the attribute
```css
/* Any element with title attribute */
[title] { }

/* Links with target attribute */
a[target] { }
```

---

### Exact Value Match

**`[attr="value"]`** - Attribute equals value exactly
```css
/* Input with type="text" */
input[type="text"] { }

/* Links to example.com */
a[href="https://example.com"] { }
```

---

### Whitespace-Separated List

**`[attr~="value"]`** - Attribute contains value in space-separated list
```css
/* Elements with "alert" class among others */
[class~="alert"] { }
```

**Example:**
```html
<!-- Matched -->
<div class="message alert warning">...</div>

<!-- NOT matched -->
<div class="message-alert">...</div>
```

---

### Dash-Separated List

**`[attr|="value"]`** - Attribute equals value or starts with value followed by hyphen
```css
/* Match language subtags */
[lang|="en"] { }
```

**Example:**
```html
<!-- Matched -->
<p lang="en">...</p>
<p lang="en-US">...</p>

<!-- NOT matched -->
<p lang="english">...</p>
```

**Use Case:** Language code matching

---

### Prefix Match

**`[attr^="value"]`** - Attribute starts with value
```css
/* Links starting with https */
a[href^="https"] { }

/* Classes starting with icon- */
[class^="icon-"] { }
```

**Use Cases:**
- External link styling
- Protocol-specific styling
- Prefix-based component systems

---

### Suffix Match

**`[attr$="value"]`** - Attribute ends with value
```css
/* Links to PDF files */
a[href$=".pdf"] { }

/* Images in JPG format */
img[src$=".jpg"] { }
```

**Use Cases:**
- File type indicators
- Download link styling
- Extension-based icons

---

### Substring Match

**`[attr*="value"]`** - Attribute contains value anywhere
```css
/* Links containing "example" */
a[href*="example"] { }

/* Classes containing "button" */
[class*="button"] { }
```

**Use Cases:**
- Partial text matching
- Flexible component matching
- Domain-based styling

---

### Case Sensitivity Modifiers

**`[attr="value" i]`** - Case-insensitive matching
```css
/* Match regardless of case */
[class="example" i] { }
/* Matches: example, Example, EXAMPLE, eXaMpLe */
```

**`[attr="value" s]`** - Case-sensitive matching (force sensitivity)
```css
/* Force case-sensitive */
[class="Example" s] { }
/* Only matches: Example */
```

**Default Behavior:**
- Attribute names are case-insensitive in HTML
- Attribute values depend on the attribute:
  - `class`, `id`, `data-*` are case-sensitive
  - Enumerated values (like `type`) follow HTML spec

**Browser Support:** Chrome 49+, Firefox 47+, Safari 9+

---

## Pseudo-Classes

Pseudo-classes select elements based on their state or position. Syntax: `:pseudo-class`

### Tree-Structural Pseudo-Classes

#### `:root`
Matches the document root element (typically `<html>`).

```css
:root {
  --primary-color: #007bff;
}
```

---

#### `:empty`
Matches elements with no children (including text nodes).

```css
/* Empty paragraphs */
p:empty {
  display: none;
}
```

---

#### `:first-child` / `:last-child`
Matches the first/last child of its parent.

```css
li:first-child {
  border-top: none;
}

li:last-child {
  border-bottom: none;
}
```

---

#### `:only-child`
Matches elements that are the only child of their parent.

```css
p:only-child {
  margin: 0;
}
```

---

#### `:nth-child(An+B)`
Matches elements based on their position using An+B notation.

**Syntax:**
```css
:nth-child(n)      /* Every element */
:nth-child(2n)     /* Even: 2, 4, 6, 8... */
:nth-child(2n+1)   /* Odd: 1, 3, 5, 7... */
:nth-child(3n)     /* Every 3rd: 3, 6, 9... */
:nth-child(3n+1)   /* 1, 4, 7, 10... */
:nth-child(n+3)    /* 3rd and onwards */
:nth-child(-n+3)   /* First 3 elements */
```

**Keywords:**
```css
:nth-child(odd)    /* Same as 2n+1 */
:nth-child(even)   /* Same as 2n */
```

**Advanced (Selectors Level 4):**
```css
/* Every 3rd paragraph, but only count paragraphs */
:nth-child(3n of p)

/* First 5 elements with class .item */
:nth-child(-n+5 of .item)
```

**How An+B Works:**
- `A` = step size (integer)
- `B` = offset (integer)
- `n` = counter starting from 0
- Index starts at 1

**Examples:**
- `2n` = 2×0, 2×1, 2×2, 2×3... = 0, 2, 4, 6, 8...
- `3n+1` = 3×0+1, 3×1+1, 3×2+1... = 1, 4, 7, 10...

---

#### `:nth-last-child(An+B)`
Same as `:nth-child()` but counts from the end.

```css
/* Last 3 elements */
:nth-last-child(-n+3) { }
```

---

#### `:first-of-type` / `:last-of-type`
Matches the first/last element of its type among siblings.

```css
/* First paragraph in container */
p:first-of-type {
  font-weight: bold;
}
```

---

#### `:only-of-type`
Matches elements that are the only one of their type among siblings.

```css
img:only-of-type {
  display: block;
}
```

---

#### `:nth-of-type(An+B)` / `:nth-last-of-type(An+B)`
Like `:nth-child()` but only counts elements of the same type.

```css
/* Every 2nd paragraph */
p:nth-of-type(2n) { }

/* Last 2 images */
img:nth-last-of-type(-n+2) { }
```

---

### User Action Pseudo-Classes

#### `:hover`
Matches when pointer hovers over element.

```css
button:hover {
  background-color: #0056b3;
}
```

---

#### `:active`
Matches when element is being activated (clicked).

```css
button:active {
  transform: scale(0.98);
}
```

---

#### `:focus`
Matches when element has focus.

```css
input:focus {
  border-color: #007bff;
  outline: 2px solid #007bff;
}
```

---

#### `:focus-visible`
Matches when element has focus and browser determines focus should be visible.

```css
/* Only show outline for keyboard navigation */
button:focus-visible {
  outline: 2px solid #007bff;
}
```

**Use Case:** Improving accessibility while maintaining clean mouse interactions

---

#### `:focus-within`
Matches when element or any descendant has focus.

```css
form:focus-within {
  box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
}
```

---

### Link Pseudo-Classes

#### `:link` / `:visited`
Matches unvisited/visited links.

```css
a:link {
  color: #007bff;
}

a:visited {
  color: #6c757d;
}
```

---

#### `:any-link`
Matches all links (`:link` or `:visited`).

```css
a:any-link {
  text-decoration: underline;
}
```

---

#### `:local-link`
Matches links to the current document.

```css
a:local-link {
  color: #28a745;
}
```

---

#### `:target`
Matches element with ID matching URL fragment.

```css
:target {
  background-color: #fff3cd;
}
```

**Example:**
```html
<!-- URL: page.html#section1 -->
<div id="section1">Highlighted!</div>
```

---

### Input & Form Pseudo-Classes

#### `:enabled` / `:disabled`
Matches enabled/disabled form controls.

```css
input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
```

---

#### `:read-only` / `:read-write`
Matches elements by editability.

```css
input:read-only {
  background-color: #f8f9fa;
}
```

---

#### `:placeholder-shown`
Matches inputs currently showing placeholder.

```css
input:placeholder-shown {
  border-color: #ced4da;
}
```

---

#### `:checked`
Matches checked checkboxes, radio buttons, or selected options.

```css
input[type="checkbox"]:checked {
  background-color: #007bff;
}
```

---

#### `:indeterminate`
Matches checkboxes in indeterminate state.

```css
input:indeterminate {
  background-color: #6c757d;
}
```

---

#### `:valid` / `:invalid`
Matches form controls based on validation.

```css
input:valid {
  border-color: #28a745;
}

input:invalid {
  border-color: #dc3545;
}
```

---

#### `:user-valid` / `:user-invalid`
Validation pseudo-classes that only apply after user interaction.

```css
input:user-invalid {
  border-color: #dc3545;
}
```

**Use Case:** Avoid showing validation errors before user starts typing

---

#### `:in-range` / `:out-of-range`
Matches inputs with min/max constraints.

```css
input[type="number"]:out-of-range {
  border-color: #dc3545;
}
```

---

#### `:required` / `:optional`
Matches required/optional form fields.

```css
input:required {
  border-left: 3px solid #dc3545;
}
```

---

#### `:autofill`
Matches inputs filled by browser autofill.

```css
input:autofill {
  background-color: #e7f3ff;
}
```

---

#### `:blank`
Matches empty user input elements.

```css
input:blank {
  border-color: #ced4da;
}
```

---

### Element Display State Pseudo-Classes

#### `:fullscreen`
Matches elements in fullscreen mode.

```css
video:fullscreen {
  width: 100vw;
  height: 100vh;
}
```

---

#### `:modal`
Matches elements in modal state (excludes outside interactions).

```css
dialog:modal {
  max-width: 600px;
}
```

---

#### `:picture-in-picture`
Matches elements in picture-in-picture mode.

```css
video:picture-in-picture {
  border: 2px solid #007bff;
}
```

---

#### `:open`
Matches open/closable elements in open state.

```css
details:open {
  border: 1px solid #007bff;
}
```

---

#### `:popover-open`
Matches visible popover elements.

```css
[popover]:popover-open {
  display: block;
}
```

---

### Resource State Pseudo-Classes

For media elements (`<audio>`, `<video>`):

```css
video:playing { }
video:paused { }
video:seeking { }
video:buffering { }
video:stalled { }
video:muted { }
video:volume-locked { }
```

---

### Time-Dimensional Pseudo-Classes

For WebVTT cues:

```css
::cue:current { }  /* Currently displayed */
::cue:past { }     /* Already shown */
::cue:future { }   /* Not yet shown */
```

---

### Linguistic Pseudo-Classes

#### `:lang()`
Matches elements by language.

```css
:lang(en) {
  quotes: '"' '"';
}

:lang(fr) {
  quotes: '«' '»';
}
```

---

#### `:dir()`
Matches elements by directionality.

```css
:dir(ltr) { text-align: left; }
:dir(rtl) { text-align: right; }
```

---

### Elemental Pseudo-Classes

#### `:defined`
Matches defined elements (custom elements that have been defined).

```css
:defined {
  opacity: 1;
}
```

---

#### `:heading`
Matches heading elements (experimental).

```css
:heading {
  font-family: serif;
}
/* Equivalent to: h1, h2, h3, h4, h5, h6 */
```

---

### Location Pseudo-Classes

#### `:scope`
Matches the reference point for selectors.

```css
/* In @scope block */
@scope (.card) {
  :scope {
    padding: 1rem;
  }
}
```

---

### Functional Pseudo-Classes

#### `:is()`
Matches any selector in the list (forgiving selector list).

```css
/* Match h1, h2, or h3 inside article or section */
:is(article, section) :is(h1, h2, h3) {
  color: #007bff;
}

/* Equivalent to: */
article h1, article h2, article h3,
section h1, section h2, section h3 { }
```

**Key Features:**
- Forgiving: Invalid selectors are ignored
- Takes specificity of most specific argument
- Simplifies complex selectors

**Browser Support:** All modern browsers (2021+)

---

#### `:where()`
Identical to `:is()` but with zero specificity.

```css
:where(article, section) h1 {
  color: #007bff;
}
```

**Specificity:** 0-0-0

**Use Case:** Creating low-specificity defaults that are easy to override

**Browser Support:** All modern browsers (2021+)

---

#### `:not()`
Negation pseudo-class - matches elements that don't match selectors.

```css
/* All buttons except disabled */
button:not(:disabled) {
  cursor: pointer;
}

/* All inputs except checkboxes and radios */
input:not([type="checkbox"]):not([type="radio"]) { }

/* Modern: multiple selectors */
button:not(.primary, .secondary) { }
```

**Selectors Level 4:** Accepts selector lists

**Specificity:** Takes specificity of most specific argument

---

#### `:has()`
Relational pseudo-class - matches elements containing specific descendants.

```css
/* div containing an image */
div:has(img) {
  border: 1px solid #ddd;
}

/* Article with no paragraphs */
article:not(:has(p)) { }

/* Link containing SVG icon */
a:has(> svg) { }

/* Form with invalid input */
form:has(input:invalid) {
  border-color: #dc3545;
}
```

**Key Features:**
- "Parent selector" capability
- Can look at siblings: `h2:has(+ p)`
- Powerful for conditional styling

**Specificity:** Takes specificity of most specific argument

**Browser Support:** Safari 15.4+, Chrome 105+, Firefox behind flag

---

### Pagination Pseudo-Classes

For `@page` rules in print:

```css
@page :left {
  margin-left: 3cm;
}

@page :right {
  margin-right: 3cm;
}

@page :first {
  margin-top: 5cm;
}
```

---

### Custom State Pseudo-Class

#### `:state()`
Matches custom element internal states.

```css
my-element:state(loading) {
  opacity: 0.5;
}
```

---

### View Transition Pseudo-Classes

```css
:active-view-transition { }
:active-view-transition-type(slide) { }
```

---

### Shadow DOM Pseudo-Classes

```css
:host { }                           /* Shadow host */
:host(.theme-dark) { }             /* Host matching selector */
:host-context(.mobile) { }         /* Host in context */
:has-slotted { }                   /* Slots with content */
```

---

## Pseudo-Elements

Pseudo-elements style specific parts of elements. Syntax: `::pseudo-element`

**Important:** Use double colons (`::`) to distinguish from pseudo-classes. Single colon syntax is supported for legacy pseudo-elements (`:before`, `:after`, `:first-line`, `:first-letter`) but double colon is recommended.

### Generated Content

#### `::before` / `::after`
Creates first/last child pseudo-elements.

```css
.icon::before {
  content: "★";
  margin-right: 0.5rem;
}

blockquote::after {
  content: close-quote;
}
```

**Key Points:**
- Requires `content` property
- Behaves like regular elements in box model
- Can be styled, positioned, animated

**Use Cases:**
- Icons and decorative elements
- Quotes
- Clearfix
- Tooltips

**Specificity:** 0-0-1

---

### Typographic Pseudo-Elements

#### `::first-line`
Styles the first formatted line of a block.

```css
p::first-line {
  font-weight: bold;
  text-transform: uppercase;
}
```

**Applicable Properties:** Font, color, background, text decoration, vertical-align, text-transform, line-height, letter-spacing, word-spacing

---

#### `::first-letter`
Styles the first letter of the first line.

```css
p::first-letter {
  font-size: 3em;
  float: left;
  margin-right: 0.1em;
}
```

**Use Case:** Drop caps

---

#### `::cue`
Styles WebVTT cues in media with text tracks.

```css
video::cue {
  color: yellow;
  background-color: rgba(0,0,0,0.7);
}
```

---

### Highlight Pseudo-Elements

#### `::selection`
Styles selected text.

```css
::selection {
  background-color: #007bff;
  color: white;
}
```

**Note:** Only certain properties apply (color, background-color, text-decoration, text-shadow)

---

#### `::target-text`
Styles the URL fragment target text.

```css
::target-text {
  background-color: #fff3cd;
}
```

---

#### `::spelling-error`
Styles text flagged as misspelled (experimental).

```css
::spelling-error {
  text-decoration: wavy underline red;
}
```

---

#### `::grammar-error`
Styles text flagged as grammatically incorrect (experimental).

```css
::grammar-error {
  text-decoration: wavy underline green;
}
```

---

#### `::highlight()`
Creates custom highlights via Highlight API.

```css
::highlight(search-result) {
  background-color: yellow;
}
```

---

### List Styling

#### `::marker`
Styles list item markers.

```css
li::marker {
  content: "→ ";
  color: #007bff;
  font-weight: bold;
}
```

**Browser Support:** Modern browsers

---

### Form Control Pseudo-Elements

#### `::placeholder`
Styles placeholder text in inputs.

```css
input::placeholder {
  color: #6c757d;
  opacity: 0.7;
}
```

---

#### `::file-selector-button`
Styles the button in file inputs.

```css
input[type="file"]::file-selector-button {
  padding: 0.5rem 1rem;
  border: 1px solid #007bff;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}
```

---

### Layout Pseudo-Elements

#### `::backdrop`
Styles the backdrop of top-layer elements (dialog, fullscreen).

```css
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
}
```

---

#### `::column`
Styles columns in multi-column layouts (experimental).

```css
.multi-column::column {
  border-right: 1px solid #ddd;
}
```

---

### Scrolling Pseudo-Elements

```css
.container::scroll-button(up) { }
.container::scroll-marker { }
.container::scroll-marker-group { }
```

---

### Element-Backed Pseudo-Elements

#### `::details-content`
Styles expandable content in `<details>`.

```css
details::details-content {
  padding: 1rem;
}
```

---

#### `::part()`
Targets shadow DOM elements with `part` attribute.

```css
custom-element::part(button) {
  background-color: #007bff;
}
```

---

#### `::slotted()`
Targets slotted content in shadow DOM.

```css
::slotted(p) {
  color: #007bff;
}
```

---

### View Transition Pseudo-Elements

For page transition animations:

```css
::view-transition { }
::view-transition-group(name) { }
::view-transition-image-pair(name) { }
::view-transition-new(name) { }
::view-transition-old(name) { }
```

---

### Nesting Pseudo-Elements

Some combinations are supported:

```css
li::before::marker { }
li::after::marker { }
```

---

## Selector Grouping

Comma-separated selectors share the same declarations.

**Syntax:**
```css
h1, h2, h3 {
  font-family: serif;
}

.button, .btn, button {
  cursor: pointer;
}
```

**Benefits:**
- Reduces code duplication
- Improves maintainability
- Smaller file size

**Important:** If any selector is invalid, the entire rule is ignored (except with `:is()` and `:where()` which use forgiving selector lists).

```css
/* Invalid - entire rule ignored */
h1, h2, h3, :invalid-pseudo {
  color: red;
}

/* Valid - invalid selector ignored */
:is(h1, h2, h3, :invalid-pseudo) {
  color: red;
}
```

---

## Specificity

Specificity determines which CSS rule applies when multiple rules target the same element.

### Calculation System

Specificity is represented as three columns: **ID - CLASS - TYPE**

| Component | Includes | Weight | Example |
|-----------|----------|--------|---------|
| **ID** | ID selectors | 1-0-0 | `#nav` |
| **CLASS** | Classes, attributes, pseudo-classes | 0-1-0 | `.button`, `[type="text"]`, `:hover` |
| **TYPE** | Element types, pseudo-elements | 0-0-1 | `div`, `::before` |

### Comparison Rules

1. Compare ID column first - highest wins
2. If tied, compare CLASS column
3. If tied, compare TYPE column
4. If all tied, last declared wins (cascade)

**Example:**
```css
#nav .item { }        /* 1-1-0 - WINS */
.menu .item.active { }  /* 0-3-0 */
div ul li a { }         /* 0-0-4 */
```

### What Doesn't Add Weight

- Universal selector (`*`) = 0-0-0
- Combinators (`>`, `+`, `~`, ` `) = 0-0-0
- `:where()` = 0-0-0

### Special Cases

#### Inline Styles
Styles in `style` attribute function as "1-0-0-0" (higher than ID selectors).

```html
<div style="color: red;">Higher than ID selectors</div>
```

#### `:is()`, `:has()`, `:not()`
These don't add weight themselves - they take the specificity of their most specific argument.

```css
:is(p, #id, .class) { }    /* 1-0-0 (from #id) */
:not(div) { }              /* 0-0-1 (from div) */
:has(.class) { }           /* 0-1-0 (from .class) */
```

#### `:where()`
Always has specificity of 0-0-0, regardless of arguments.

```css
:where(#id, .class, div) { }  /* 0-0-0 */
```

**Use Case:** Creating easily overridable base styles

#### `!important`
Reverses cascade order (avoid when possible).

```css
.button {
  color: blue !important;
}
```

When both rules use `!important`, normal specificity rules apply.

### Practical Examples

```css
/* 0-0-1 */
p { }

/* 0-1-1 */
p.intro { }

/* 0-2-1 */
p.intro.highlight { }

/* 1-0-0 - WINS over all above */
#main { }

/* 1-1-2 */
#main div.content { }

/* 0-0-0 - Uses child's specificity */
:where(#main) div { } /* = 0-0-1 */

/* 1-0-1 - Uses #main's specificity */
:is(div, #main) p { } /* = 1-0-1 */
```

### Best Practices

1. Keep specificity low for maintainability
2. Avoid IDs for styling when possible
3. Use `:where()` for base styles
4. Avoid `!important` except for utilities
5. Use classes for reusable components

---

## Modern Selectors

### `:has()` - Relational Pseudo-Class

The "parent selector" - style elements based on their descendants.

**Syntax:**
```css
parent:has(descendant) { }
```

**Examples:**
```css
/* Card containing an image */
.card:has(img) {
  padding: 0;
}

/* Article without headings */
article:not(:has(h1, h2, h3)) {
  padding-top: 0;
}

/* Sibling selector - h2 followed by p */
h2:has(+ p) {
  margin-bottom: 0.5rem;
}

/* Form with errors */
form:has(input:invalid) {
  border: 2px solid #dc3545;
}

/* Navigation with active item */
nav:has(.active) {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**Use Cases:**
- Parent styling based on children
- Conditional layouts
- Form validation states
- Dynamic component variations

**Specificity:** Takes specificity of most specific argument

**Browser Support:**
- Safari 15.4+ (March 2022)
- Chrome/Edge 105+ (September 2022)
- Firefox (behind flag in v103, full support later)
- ~92% global support as of 2024

---

### `:is()` - Matches-Any Pseudo-Class

Simplifies complex selectors with forgiving selector lists.

**Syntax:**
```css
:is(selector1, selector2, ...) { }
```

**Examples:**
```css
/* Instead of: */
header h1, main h1, footer h1 { }

/* Use: */
:is(header, main, footer) h1 { }

/* Complex selectors */
:is(.card, .panel):is(.primary, .secondary) h2 {
  color: white;
}

/* Multiple levels */
article :is(h1, h2, h3, h4, h5, h6) {
  font-family: serif;
}
```

**Key Features:**
- **Forgiving:** Invalid selectors are ignored
- **Simplifies:** Reduces selector repetition
- **Specificity:** Takes most specific argument

**Example with Invalid Selector:**
```css
/* Without :is() - entire rule fails */
h1, h2, :invalid-pseudo {
  color: red; /* Nothing gets styled */
}

/* With :is() - invalid selector ignored */
:is(h1, h2, :invalid-pseudo) {
  color: red; /* h1 and h2 get styled */
}
```

**Browser Support:** All modern browsers (2021+)

---

### `:where()` - Zero-Specificity Matches-Any

Identical to `:is()` but with zero specificity.

**Syntax:**
```css
:where(selector1, selector2, ...) { }
```

**Examples:**
```css
/* Default styles (easy to override) */
:where(h1, h2, h3) {
  margin-top: 0;
}

/* Override with just a class */
.special-heading {
  margin-top: 2rem; /* This wins! */
}

/* Reset with zero specificity */
:where(ul, ol) :where(ul, ol) {
  margin: 0;
  padding-left: 1em;
}
```

**Use Cases:**
- Library/framework base styles
- Reset stylesheets
- Utility classes that should be easily overridable
- Component defaults

**Comparison:**
```css
/* 1-0-1 specificity (from #id) */
:is(div, #id) p { }

/* 0-0-1 specificity (always 0-0-0 + p) */
:where(div, #id) p { }
```

**Browser Support:** All modern browsers (2021+)

---

### `:not()` - Negation Pseudo-Class

Enhanced in Selectors Level 4 to accept selector lists.

**Basic Syntax:**
```css
:not(selector) { }
```

**Modern Syntax (Level 4):**
```css
:not(selector1, selector2, ...) { }
```

**Examples:**
```css
/* Everything except links */
:not(a) {
  text-decoration: none;
}

/* Inputs except checkboxes and radios */
input:not([type="checkbox"], [type="radio"]) {
  padding: 0.5rem;
}

/* List items except first and last */
li:not(:first-child):not(:last-child) {
  border-top: 1px solid #ddd;
}

/* Modern: combine conditions */
button:not(.primary, .secondary, :disabled) {
  background-color: #6c757d;
}

/* Not empty paragraphs */
p:not(:empty) {
  margin-bottom: 1rem;
}
```

**Combining with Other Pseudo-Classes:**
```css
/* Links that aren't hovered or focused */
a:not(:hover, :focus) {
  opacity: 0.7;
}

/* Rows without .selected class */
tr:not(.selected) {
  background-color: transparent;
}
```

**Specificity:** Takes specificity of most specific argument

**Browser Support:**
- Basic `:not()` - All browsers
- Multiple selectors - All modern browsers (2021+)

---

### Comparison Table

| Selector | Forgiving | Specificity | Use Case |
|----------|-----------|-------------|----------|
| `:is()` | Yes | Highest argument | Simplifying selectors |
| `:where()` | Yes | Always 0-0-0 | Base styles, resets |
| `:not()` | No (modern: Yes) | Highest argument | Exclusions |
| `:has()` | No | Highest argument | Parent/relational styling |

---

## Browser Compatibility

### Full Support (All Modern Browsers)

**Basic Selectors:**
- Universal, type, class, ID, attribute selectors
- All combinators (descendant, child, sibling)
- Most pseudo-classes (`:hover`, `:focus`, `:nth-child()`, etc.)
- Common pseudo-elements (`::before`, `::after`, `::first-line`, `::first-letter`)

**Well-Established Modern Features:**
- `:is()` - 2021+
- `:where()` - 2021+
- `:not()` with multiple selectors - 2021+
- `::placeholder` - All modern browsers
- `::selection` - All modern browsers

---

### Good Support (Most Modern Browsers)

**`:has()` - Relational Pseudo-Class**
- Safari 15.4+ (March 2022)
- Chrome/Edge 105+ (September 2022)
- Firefox 121+ (December 2023)
- ~92% global support (as of late 2024)

**`:focus-visible`**
- All modern browsers (2021+)

**`::marker`**
- Chrome/Edge 86+
- Firefox 68+
- Safari 11.1+

**`:is()` / `:where()` specificity behavior**
- Fully supported in all modern browsers

---

### Partial Support / Experimental

**`:user-valid` / `:user-invalid`**
- Chrome/Edge 119+
- Limited support in other browsers

**`::file-selector-button`**
- Modern browsers with vendor prefixes
- WebKit: `::-webkit-file-upload-button`

**View Transitions**
- Chrome 111+
- Limited support

**`:state()`**
- Very limited support
- Part of Custom Elements API

---

### Not Supported

**Column Combinator (`||`)**
- No browser support (experimental in spec)

**`::spelling-error` / `::grammar-error`**
- No stable browser support

**`::highlight()`**
- Limited support (behind flags)

---

### Checking Support

Use `@supports` with `selector()`:

```css
/* Check :has() support */
@supports selector(:has(a)) {
  .card:has(img) {
    padding: 0;
  }
}

/* Fallback */
@supports not selector(:has(a)) {
  .card img {
    margin: -1rem;
  }
}
```

---

### Legacy Browser Support

**IE11 Considerations:**
- No `:is()`, `:where()`, `:has()`
- No CSS Grid
- Limited flexbox
- No custom properties

**Graceful Degradation:**
```css
/* Fallback for older browsers */
header h1, main h1, footer h1 {
  color: blue;
}

/* Enhancement for modern browsers */
@supports selector(:is(a)) {
  :is(header, main, footer) h1 {
    color: blue;
  }
}
```

---

## Common Patterns

### Styling First/Last Elements

```css
/* First and last items */
li:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

li:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
```

---

### Zebra Striping

```css
/* Alternate row colors */
tr:nth-child(odd) {
  background-color: #f8f9fa;
}

tr:nth-child(even) {
  background-color: white;
}
```

---

### Select All But First N

```css
/* Skip first 3 items */
li:nth-child(n+4) {
  margin-top: 1rem;
}
```

---

### Select First N

```css
/* First 5 items only */
li:nth-child(-n+5) {
  font-weight: bold;
}
```

---

### Not First/Last

```css
/* All except first and last */
li:not(:first-child):not(:last-child) {
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}
```

---

### Empty State Styling

```css
/* Show message when list is empty */
ul:empty::after {
  content: "No items to display";
  color: #6c757d;
}
```

---

### Form Validation States

```css
/* Valid input */
input:valid {
  border-color: #28a745;
}

input:valid:focus {
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

/* Invalid after user interaction */
input:user-invalid {
  border-color: #dc3545;
}

/* Form with errors */
form:has(input:invalid) {
  border-left: 3px solid #dc3545;
}
```

---

### Link States (in order!)

```css
/* LVHA order (LoVe HAte) */
a:link { color: #007bff; }
a:visited { color: #6c757d; }
a:hover { color: #0056b3; }
a:active { color: #004085; }
```

---

### Card with Optional Image

```css
/* Default card */
.card {
  padding: 1rem;
}

/* Card with image - remove padding */
.card:has(img) {
  padding: 0;
}

.card:has(img) .card-body {
  padding: 1rem;
}
```

---

### Focus Styles (Keyboard Only)

```css
/* Remove outline for mouse users */
button:focus {
  outline: none;
}

/* Add outline for keyboard users */
button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

---

### Quantity Queries

```css
/* Style when exactly 3 items */
li:first-child:nth-last-child(3),
li:first-child:nth-last-child(3) ~ li {
  width: 33.33%;
}

/* Style when 4 or more items */
li:first-child:nth-last-child(n+4),
li:first-child:nth-last-child(n+4) ~ li {
  font-size: 0.875rem;
}
```

---

### Attribute-Based Styling

```css
/* External links */
a[href^="http"]:not([href*="yourdomain.com"])::after {
  content: " ↗";
}

/* Download links */
a[href$=".pdf"]::before {
  content: "PDF: ";
  font-weight: bold;
}

/* Email links */
a[href^="mailto:"]::before {
  content: "✉ ";
}
```

---

## Resources

- [MDN CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)
- [W3C Selectors Level 4 Specification](https://www.w3.org/TR/selectors-4/)
- [Can I Use - CSS Support Tables](https://caniuse.com/)
- [CSS Specificity Calculator](https://specificity.keegan.st/)

---

**Document Version:** 1.0
**Last Updated:** November 2024
**Based on:** CSS Selectors Level 4 Specification & MDN Web Docs
