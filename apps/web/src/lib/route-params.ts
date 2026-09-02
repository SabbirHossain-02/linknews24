/**
 * The value of a dynamic route segment, as text.
 *
 * Next hands these over exactly as they appear in the address bar, so a Bengali
 * slug arrives percent-encoded — "%E0%A6%AF%E0%A6%BE…" rather than "যানজট".
 * Everything downstream then encoded it a second time on the way to the API,
 * which went looking for a story whose slug is the literal percent signs.
 * Nothing matched, so every Bengali headline and every tag answered 404 while
 * the English slugs, having nothing to encode, worked — which is why the fault
 * looked like missing articles rather than broken routing.
 *
 * Decoding here, at the edge where a URL becomes a value, keeps the rest of the
 * code working in plain text.
 */
export function routeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // A stray "%" that is not an escape sequence. Take the segment as written
    // rather than throwing a 500 at whoever typed the address; it will simply
    // match nothing and fall through to the 404 the reader deserves.
    return value;
  }
}
