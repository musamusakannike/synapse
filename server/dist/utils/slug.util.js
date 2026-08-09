"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateReadingTime = exports.slugify = void 0;
/** Converts a string into a URL-safe, lowercase, hyphenated slug. */
const slugify = (value) => value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
exports.slugify = slugify;
/** Estimates reading time in minutes from markdown/plain text content. */
const estimateReadingTime = (content) => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
};
exports.estimateReadingTime = estimateReadingTime;
