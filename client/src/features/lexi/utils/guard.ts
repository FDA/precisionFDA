/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * @param x - The element being testing
 * @returns Returns true if x is an HTML element, false otherwise.
 */
export function isHTMLElement(x: Node | EventTarget): x is HTMLElement {
  // @ts-ignore-next-line - strict check on nodeType here should filter out non-Element EventTarget implementors
  return x.nodeType === 1;
}
