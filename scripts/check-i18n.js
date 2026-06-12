#!/usr/bin/env node
/* i18n completeness check for the scroll-story site.
   Extracts every data-i18n key from index.html and asserts it exists in all
   four STORY_I18N dictionaries (en/de/nl/pl) inside assets/js/story.js.
   Exits non-zero on any missing key. */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets/js/story.js'), 'utf8');

// --- collect data-i18n + data-i18n-html keys from the page ---
const keys = [...new Set([...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m => m[1]))];

// --- extract the STORY_I18N object literal from story.js ---
const start = js.indexOf('var STORY_I18N = {');
if (start === -1) throw new Error('STORY_I18N not found in story.js');
let i = js.indexOf('{', start);
let depth = 0, end = -1;
for (; i < js.length; i++) {
  if (js[i] === '{') depth++;
  else if (js[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
}
const dict = eval('(' + js.slice(js.indexOf('{', start), end + 1) + ')'); // eslint-disable-line no-eval

const langs = Object.keys(dict);
let missing = 0;
for (const key of keys) {
  for (const lang of langs) {
    if (dict[lang][key] === undefined) {
      console.error(`MISSING  ${lang}.${key}`);
      missing++;
    }
  }
}

// informational: dictionary keys not used on the page
const used = new Set(keys);
const unused = Object.keys(dict.en).filter(k => !used.has(k));

console.log(`data-i18n keys in index.html : ${keys.length}`);
console.log(`languages checked            : ${langs.join(', ')}`);
console.log(`missing translations         : ${missing}`);
if (unused.length) console.log(`unused dictionary keys (info): ${unused.join(', ')}`);

if (missing > 0) {
  process.exit(1);
}
console.log('i18n check PASSED — every page key exists in all dictionaries.');
