// Reading the page in the tests: what must be there throws when it isn't,
// so a test fails where the page differs, not on a null later.

/** The first element under root that matches the selector, of the kind it is. */
export function one<E extends Element = HTMLElement>(root: ParentNode, selector: string): E {
  const found = root.querySelector<E>(selector);
  if (!found) throw new Error(`nothing matches ${selector}`);
  return found;
}

/** An attribute of an element, which it must have. */
export function attr(e: Element, name: string): string {
  const value = e.getAttribute(name);
  if (value === null) throw new Error(`no ${name} on <${e.tagName}>`);
  return value;
}
