/**
 * Content guards shared by the unit tests.
 *
 * The internal identifiers of the mail-service example (the client's project codes,
 * client names and internal standard IDs) are encoded so the repo doesn't contain the
 * literal. Decoded, it is a case-insensitive alternation of those names.
 */
const INTERNAL_IDS_B64 = 'bWFpbHNlcnZpY2V8XGJtZHNcYnxcYmJkcFxifHBzYWJkcHxcYm9yZy1cZHxcYmFkci1cZA==';

const decode = (b64: string): string =>
  typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8');

export const INTERNAL_IDS = new RegExp(decode(INTERNAL_IDS_B64), 'i');

/**
 * Anything that looks like a phone number: an optional +, then a run of ten or more
 * digits, spaces or hyphens that starts and ends with a digit and is not part of a
 * longer token (so hex IDs in badge URLs such as `…-50474776-14…` do not count). Known
 * safe figures (15,000+, years, 5+) never match: they are short or use commas.
 */
export const PHONE_LIKE = /(?<![\w-])\+?\d[\d\s-]{8,}\d(?![\w-])/;

/** Phone-like runs in `text` (empty when there are none). */
export const phoneLike = (text: string): string[] => text.match(new RegExp(PHONE_LIKE, 'g')) ?? [];
