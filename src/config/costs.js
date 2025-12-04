/**
 * Cost constants for selector generation.
 * Lower values indicate higher quality in selector selection.
 */

/*

local: id, tag, class, attr
structural: parent, child, sibling
modifier: not, has

*/

export const COST_ID = 0;
export const COST_CLASS = 1;
export const COST_TAG = 2;
export const COST_ATTR = 3;

export const COST_PARENT = 10;
export const COST_SIBLING = 100;
export const COST_CHILDREN = 100;
export const COST_DISTANCE = 1;

export const COST_IS_HAS = 5; // contains :is(), :has()
export const COST_NOT = 10; // contains :not()
