/**
 * Bengali can be written two ways, and a URL has to survive both.
 *
 * "য়" exists as a single character (U+09DF) and as "য" followed by a nukta
 * mark (U+09AF U+09BC). They are the same letter and look identical, but they
 * are different bytes — so a slug stored one way never matches a request
 * written the other. Unicode calls the second form the normalised one, and
 * browsers, chat apps and crawlers quietly convert to it as they pass a link
 * around. The result was a link that opened when clicked on the site and 404'd
 * once someone had shared it. Several Bengali letters behave this way: ড়, ঢ়,
 * য় and the vowel signs built from ে and া.
 *
 * So slugs are written and read in one form throughout, NFC, which is the one
 * everything else converges on.
 */
export const normalizeSlug = (slug: string): string => slug.normalize("NFC");
