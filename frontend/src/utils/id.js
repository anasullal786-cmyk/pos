let counter = 0;

/** Generate a reasonably unique local id, e.g. "P-lx3k9f2a-17". */
export function uid(prefix = 'P') {
  counter = (counter + 1) % 1000;
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}-${counter}`;
}
