import fs from 'fs';
import path from 'path';

const wordsPath = path.join(__dirname, 'banned-words.json');
const patternsPath = path.join(__dirname, 'banned-patterns.json');

let bannedWordsRaw: any = [];
let bannedPatternsRaw: any = [];
try {
  bannedWordsRaw = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
} catch {
  bannedWordsRaw = [];
}

try {
  bannedPatternsRaw = JSON.parse(fs.readFileSync(patternsPath, 'utf-8'));
} catch {
  bannedPatternsRaw = [];
}

const inappropriateWords: string[] = Array.isArray(bannedWordsRaw)
  ? bannedWordsRaw
  : (bannedWordsRaw && Array.isArray(bannedWordsRaw.words) ? bannedWordsRaw.words : []);

const patternsArray: string[] = Array.isArray(bannedPatternsRaw)
  ? bannedPatternsRaw
  : (bannedPatternsRaw && Array.isArray(bannedPatternsRaw.patterns) ? bannedPatternsRaw.patterns : []);

const inappropriatePatterns: RegExp[] = patternsArray.map((pattern) => new RegExp(pattern, 'i'));

let allowPatternsRaw: any = [];
try {
  allowPatternsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'allow-patterns.json'), 'utf-8'));
} catch {
  allowPatternsRaw = [];
}

const allowPatternsArray: string[] = Array.isArray(allowPatternsRaw)
  ? allowPatternsRaw
  : (allowPatternsRaw && Array.isArray(allowPatternsRaw.patterns) ? allowPatternsRaw.patterns : []);

const allowPatterns: RegExp[] = allowPatternsArray.map((p) => new RegExp(String(p), 'i'));

export { inappropriateWords, inappropriatePatterns, allowPatterns };