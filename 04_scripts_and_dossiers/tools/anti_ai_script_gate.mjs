#!/usr/bin/env node
/**
 * The Reading Room Editorial OS — Stage 6 Compiler Gate
 * Deliverable #25: Local Anti-AI & Spoken-Cadence Gate (anti_ai_script_gate.mjs)
 *
 * Standalone Node >= 20 ESM compiler gate (zero external npm dependencies):
 *   Check 1: 112+ Banned AI Vocabulary, Slop Phrase, & Cluster Catalog (primary-quote/statute aware)
 *   Check 2: Optional Host `avoid-ai-writing` Detector Cross-Check (`score === 0`, `HUMAN_ONLY`)
 *   Check 3: Zero Negative-Contrast Crutches (`not X, but Y`, `not just`, `isn't X, it's Y`, `rather than`)
 *   Check 4: Hard Punctuation Discipline (`—`, `–`, `--`, `!`, and in `script`/`vertical` modes `;`)
 *   Check 5: Anti-Triad & Sentence-Length Collision Gate (abstract tricolons, 3x equal-length, 3x <=6w parataxis)
 *   Check 6: Spoken Cadence & Clarity Band (`15.5-17.5w` script / `11.0-17.5w` vertical, `<8%` >30w, `>=10/1k` contr, `FKGL <=10.5`)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const requireCjs = createRequire(import.meta.url);
const VALID_MODES = new Set(['script', 'vertical', 'prose']);

// --- 1. Unicode Normalization, Line Indexing & Protected Primary-Source Masking ---

const CYRILLIC_LOOKALIKES = {
  '\u0430': 'a', '\u0435': 'e', '\u043E': 'o', '\u0440': 'p', '\u0441': 'c', '\u0445': 'x',
  '\u0443': 'y', '\u043A': 'k', '\u043C': 'm', '\u043D': 'h', '\u0432': 'b', '\u0442': 't',
  '\u0410': 'A', '\u0415': 'E', '\u041E': 'O', '\u0420': 'P', '\u0421': 'C', '\u0425': 'X',
  '\u0423': 'Y', '\u041A': 'K', '\u041C': 'M', '\u041D': 'H', '\u0412': 'B', '\u0422': 'T',
};
const GREEK_LOOKALIKES = { '\u03BF': 'o', '\u039F': 'O', '\u03B1': 'a', '\u0391': 'A', '\u03C1': 'p', '\u03A1': 'P' };

function buildLineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function offsetToLineCol(lineStarts, offset) {
  const clamped = Math.max(0, offset);
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (lineStarts[mid] <= clamped) low = mid + 1;
    else high = mid - 1;
  }
  const idx = Math.max(0, high);
  return { line: idx + 1, column: clamped - lineStarts[idx] + 1 };
}

function makeViolation(checkId, ruleCode, severity, pos, excerpt, fix) {
  return { checkId, ruleCode, severity, line: pos.line, column: pos.column, excerpt, fix };
}

function blankPreservingLines(slice) {
  let out = '';
  for (let i = 0; i < slice.length; i += 1) {
    const ch = slice[i];
    out += (ch === '\n' || ch === '\r') ? ch : ' ';
  }
  return out;
}

function applySpanMask(text, start, end) {
  return text.slice(0, start) + blankPreservingLines(text.slice(start, end)) + text.slice(end);
}

function buildWorkingViews(rawText, mode) {
  let structural = rawText;
  const protectedSpans = [];

  const fmMatch = /^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/.exec(structural);
  if (fmMatch) structural = applySpanMask(structural, 0, fmMatch[0].length);
  structural = structural.replace(/<!--[\s\S]*?-->/g, (m) => blankPreservingLines(m));

  if (mode === 'prose') {
    structural = structural.replace(/```[\s\S]*?```/g, (m) => blankPreservingLines(m));
    structural = structural.replace(/~~~[\s\S]*?~~~/g, (m) => blankPreservingLines(m));
    structural = structural.replace(/`[^`\n]+`/g, (m) => blankPreservingLines(m));
    structural = structural.replace(/!\[([^\]]*)\]\(([^)\n]+)\)/g, (m) => blankPreservingLines(m));
    structural = structural.replace(/\]\((?:https?:\/\/|file:\/\/\/|#)[^)\n]+\)/g, (m) => blankPreservingLines(m));
    structural = structural.replace(/^([ \t]*>[ \t]*)\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gm, (m) => blankPreservingLines(m));
  }

  let lexical = structural;
  // 1. Verbatim double-quoted citations (capped at 320 chars so full paragraphs cannot hide inside quotes)
  for (const qRe of [/"([^"\r\n]{2,320})"/g, /\u201C([^\u201D\r\n]{2,320})\u201D/g]) {
    let m;
    while ((m = qRe.exec(lexical)) !== null) {
      protectedSpans.push({ kind: 'verbatim-quote', start: m.index, end: m.index + m[0].length, raw: rawText.slice(m.index, m.index + m[0].length) });
      lexical = applySpanMask(lexical, m.index, m.index + m[0].length);
    }
  }
  // 2. Italicized legal case names or primary publication/statute titles (*Wielechowski v. State*)
  const italicTitleRe = /\*([A-Z][^*\r\n]{2,120})\*/g;
  let im;
  while ((im = italicTitleRe.exec(lexical)) !== null) {
    if (/\b(?:v\.|vs\.|Act|Code|Statute|Treaty|Report|Statement|Journal|Economist|Times|Law)\b/.test(im[1])) {
      protectedSpans.push({ kind: 'primary-case-or-title', start: im.index, end: im.index + im[0].length, raw: rawText.slice(im.index, im.index + im[0].length) });
      lexical = applySpanMask(lexical, im.index, im.index + im[0].length);
    }
  }
  // 3. Capitalized official statutory, treaty, regulatory, or legal case titles
  const statuteRe = /\b(?:The\s+)?(?:[A-Z][A-Za-z0-9'’-]+(?:,\s+(?:and\s+|or\s+)?|\s+(?:of|and|for|to|in|on|the|by|with)\s+|\s+)){1,14}(?:Act|Statute|Amendment|Treaty|Directive|Regulation|Resolution|Code)(?:\s+of\s+\d{4})?\b|\b[A-Z][A-Za-z'’-]+\s+v\.\s+[A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+)?\b/g;
  let sm;
  while ((sm = statuteRe.exec(lexical)) !== null) {
    protectedSpans.push({ kind: 'primary-statute-or-case', start: sm.index, end: sm.index + sm[0].length, raw: rawText.slice(sm.index, sm.index + sm[0].length) });
    lexical = applySpanMask(lexical, sm.index, sm.index + sm[0].length);
  }
  return { structural, lexical, protectedSpans };
}

function scanAndNormalizeObfuscation(lexicalText, lineStarts) {
  const bypassViolations = [];
  const zwRe = /[\u200B-\u200D\uFEFF\u2060]/g;
  let zm;
  while ((zm = zwRe.exec(lexicalText)) !== null) {
    if (zm[0] === '\u200C' && zm.index > 0 && zm.index + 1 < lexicalText.length
      && /[\u0600-\u06FF]/.test(lexicalText[zm.index - 1])
      && /[\u0600-\u06FF]/.test(lexicalText[zm.index + 1])) {
      continue;
    }
    const pos = offsetToLineCol(lineStarts, zm.index);
    const hex = zm[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    bypassViolations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_UNICODE_BYPASS', 'P0', pos, `U+${hex}`, `Strip invisible zero-width character U+${hex}.`));
  }

  const chars = Array.from(lexicalText);
  const wordRunRe = /[\p{L}\p{M}]+/gu;
  let wm;
  while ((wm = wordRunRe.exec(lexicalText)) !== null) {
    const word = wm[0];
    const hasLatin = /\p{Script=Latin}/u.test(word);
    const hasLookalike = /[\u0400-\u04FF\u0370-\u03FF]/.test(word);
    if (hasLookalike && (hasLatin || Array.from(word).every((c) => CYRILLIC_LOOKALIKES[c] || GREEK_LOOKALIKES[c]))) {
      const pos = offsetToLineCol(lineStarts, wm.index);
      let swapped = '';
      for (let i = 0; i < word.length; i += 1) {
        const rep = CYRILLIC_LOOKALIKES[word[i]] || GREEK_LOOKALIKES[word[i]] || word[i];
        swapped += rep;
        chars[wm.index + i] = rep;
      }
      bypassViolations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_HOMOGLYPH_BYPASS', 'P0', pos, `${word} -> ${swapped}`, `Replace Cyrillic/Greek homoglyph obfuscation in "${swapped}" with ASCII letters.`));
    }
  }
  return { deobfuscated: chars.join(''), bypassViolations };
}

// --- 2. Check 1: 112+ Tiered Banned AI Vocabulary & Slop Phrase Catalog ---

function expandWordFamilies(families) {
  const map = new Map();
  for (const [forms, replacement] of families) {
    for (const f of forms) map.set(f, replacement);
  }
  return map;
}

const TIER1_BANNED_WORDS = expandWordFamilies([
  [['delve', 'delves', 'delving', 'delved'], 'dig into, examine, check'],
  [['tapestry', 'tapestries'], 'structure, history, mix'],
  [['testament', 'testaments'], 'proof, evidence, sign'],
  [['pivotal', 'crucial', 'crucially'], 'decisive, central, necessary'],
  [['utilize', 'utilizes', 'utilizing', 'utilized', 'utilization'], 'use'],
  [['realm', 'realms'], 'field, domain, arena'],
  [['paradigm', 'paradigms', 'paradigm-shift', 'paradigm-shifting'], 'model, rulebook, structural break'],
  [['comprehensive', 'comprehensively'], 'complete, full, exhaustive'],
  [['seamless', 'seamlessly'], 'smooth, frictionless, direct'],
  [['nuanced', 'multifaceted'], 'specific, detailed, layered'],
  [['fosters', 'fostering', 'fostered'], 'builds, encourages'],
  [['bolster', 'bolsters', 'bolstering', 'bolstered'], 'strengthen, back up, prop up'],
  [['underscore', 'underscores', 'underscoring', 'underscored'], 'show, prove, expose'],
  [['showcase', 'showcases', 'showcasing', 'showcased'], 'show, display, demonstrate'],
  [['highlighting'], 'showing, pointing to, exposing'],
  [['intricate', 'intricately', 'intricacies'], 'complex, detailed, mechanics'],
  [['vibrant', 'vibrantly', 'enduring'], 'active, busy, lasting'],
  [['interplay'], 'collision, feedback loop, link'],
  [['genuinely'], 'cut hollow intensifier and state the verified fact'],
  [['profound', 'profoundly'], 'deep, severe, structural'],
  [['remarkable', 'remarkably'], 'unusual, striking, or state the exact number'],
  [['unprecedented', 'unprecedentedly'], 'name the exact historical baseline year'],
  [['transformative', 'groundbreaking', 'paramount'], 'name what physically changed / top priority'],
  [['moreover', 'furthermore', 'additionally', 'notably'], 'cut formal transition filler or link with "And" / "So"'],
  [['game-changer', 'game-changing', 'cutting-edge', 'ever-evolving'], 'state the concrete unit-cost or spec shift'],
  [['meticulous', 'meticulously'], 'careful, exact, line by line'],
  [['garner', 'garners', 'garnered', 'garnering'], 'win, collect, draw'],
  [['commence', 'commences', 'commenced', 'commencing'], 'start, begin'],
  [['aforementioned', 'synergy', 'synergies', 'synergistic'], 'named above / combined gain, joint savings'],
  [['holistic', 'holistically', 'actionable', 'impactful', 'learnings'], 'whole / concrete / costly / findings'],
  [['nestled', 'bustling', 'indelible', 'quintessential', 'overarching'], 'cut stock AI adjective and use literal specifics'],
  [['myriad', 'plethora', 'breathtaking', 'stunning'], 'state exact count or physical scale'],
  [['spearhead', 'spearheads', 'spearheading', 'spearheaded'], 'lead, run, direct'],
  [['revolutionize', 'revolutionizes', 'revolutionizing', 'revolutionized', 'revolutionise'], 'overhaul, replace, rewire'],
  [['elucidate', 'elucidates', 'elucidating', 'elucidated'], 'explain, show'],
  [['juxtapose', 'juxtaposes', 'juxtaposing', 'juxtaposed'], 'compare, set side by side'],
  [['reimagine', 'reimagines', 'reimagining', 'reimagined'], 'redesign, rebuild'],
  [['galvanize', 'galvanizes', 'galvanizing', 'galvanized', 'catalyze', 'catalyzes', 'catalyzing', 'catalyzed'], 'rally, trigger, speed up'],
  [['boasts', 'embark', 'embarks', 'embarking', 'embarked'], 'has / start, launch'],
  [['ascertain', 'endeavor', 'endeavors', 'endeavour', 'endeavours'], 'verify / attempt, project'],
  [['leveraging', 'leverages', 'leveraged'], 'using, uses, used'],
]);

const LITERAL_LANDSCAPE_MODIFIERS = /\b(?:arid|desert|volcanic|mountain|coastal|glacial|alpine|rural|karst|lunar|arctic|tundra|canyon|physical|river|prairie|steppe|forested|rocky|barren)\s+$/i;
const FINANCIAL_LEVERAGE_CONTEXT = /(?:\b(?:financial|operating|balance-sheet|margin|bank|fund|debt|net|gross|high|excess|maximum|\d+x|\d+-to-1)\s+$)|(^\s+(?:ratio|ratios|multiple|multiples|limit|limits|cap|caps)\b)/i;
const ENGINEERING_ROBUST_CONTEXT = /^\s+(?:standard\s+errors?|estimators?|regression|optimization|control|statistics|covariance)\b/i;
const LITERAL_UNPACK_OBJECT = /^\s+(?:(?:a|an|the|your|his|her|their|our)\s+)?(?:box|boxes|crate|crates|suitcase|suitcases|luggage|bag|bags|pallet|pallets|container|containers|truck|shipment)\b/i;
const HIGHLIGHT_NOUN_BEFORE = /\b(?:a|an|the|one|yellow|pink|green|marker|platen|visual|career|season|key|main)\s+$/i;
const HIGHLIGHT_VERB_BEFORE = /\b(?:to|will|would|can|could|should|must|may|might|do|does|did|didn['’]t|don['’]t|won['’]t|help|helps|helped|also|often|always|never|they|we|you|i|these|those|which|that|who|reports?|filings?|numbers?|data|charts?|tables?|cases?|events?|results?|studies|findings?)\s+$/i;

const TIER1_SLOP_PHRASES = [
  { pattern: /\bdeep\s+dives?\b/gi, fix: 'Replace "deep dive" with "investigation", "audit", or name the filing.' },
  { pattern: /\bdive\s+(?:in|into|deeper)\b/gi, fix: 'Cut "dive in/into" and open directly on the concrete mechanism.' },
  { pattern: /\blet['’]?s\s+(?:dive\s+in|delve|explore|unpack|break\s+this\s+down|take\s+a\s+look|walk\s+through)\b/gi, fix: 'Delete staged run-up opener and state the point directly.' },
  { pattern: /\bat\s+its\s+core\b/gi, fix: 'Delete "at its core" and state the mechanism directly.' },
  { pattern: /\bin\s+the\s+realm\s+of\b/gi, fix: 'Replace "in the realm of" with "in" or name the exact market.' },
  { pattern: /\b(?:a|an|stands\s+as\s+a)\s+testament\s+to\b/gi, fix: 'Replace "testament to" with "proves" or "shows".' },
  { pattern: /\b(?:serves|stands|functions)\s+as\s+(?:a|an|the)\b/gi, fix: 'Replace copula avoidance ("serves/stands as") with "is".' },
  { pattern: /\bin\s+conclusion\b|\bin\s+summary\b|\bto\s+summarize\b|\bin\s+a\s+nutshell\b/gi, fix: 'Delete summary wrapper and land directly on the closing callback.' },
  { pattern: /\bhere['’]s\s+the\s+(?:thing|deal|kicker|catch)\b/gi, fix: 'Delete staged candor opener ("here\'s the thing") and state the fact.' },
  { pattern: /(?:^|[.!?]\s+)truth\s+is\s*,/gi, fix: 'Delete staged opener "Truth is," and state the claim directly.' },
  { pattern: /\blet['’]?s\s+be\s+(?:honest|clear|real)\b|\bto\s+be\s+honest\b|\bquite\s+frankly\b|\breal\s+talk\b/gi, fix: 'Delete performed-candor filler and let verified facts carry weight.' },
  { pattern: /\bbuckle\s+up\b/gi, fix: 'Delete "buckle up" cheerleading.' },
  { pattern: /\blet\s+that\s+sink\s+in\b|\bread\s+that\s+again\b|\bthink\s+about\s+that\s+for\s+a\s+(?:second|minute|moment)\b/gi, fix: 'Delete artificial pause command and state the consequence.' },
  { pattern: /\bwithout\s+further\s+ado\b/gi, fix: 'Delete "without further ado".' },
  { pattern: /\bin\s+today['’]?s\s+(?:fast-paced|rapidly|digital|modern|ever-changing|complex|world)\b/gi, fix: 'Delete stock "In today\'s..." opener and start on a dated fact.' },
  { pattern: /\bin\s+an\s+era\s+(?:where|of)\b|\bimagine\s+a\s+world\s+where\b/gi, fix: 'Delete speculative-era cliché and ground the scene in a real year and place.' },
  { pattern: /\bit['’]?s\s+(?:worth\s+noting|important\s+to\s+note|crucial\s+to\s+understand)\b|\bit\s+is\s+(?:worth\s+noting|important\s+to\s+note)\b/gi, fix: 'Delete "it\'s worth noting" filler and state the fact directly.' },
  { pattern: /\bneedless\s+to\s+say\b|\bit\s+goes\s+without\s+saying\b/gi, fix: 'Delete truism filler.' },
  { pattern: /\bat\s+the\s+end\s+of\s+the\s+day\b|\bthe\s+bottom\s+line\s+is\b/gi, fix: 'Delete cliché closer and state the balance-sheet outcome.' },
  { pattern: /\bwhen\s+it\s+comes\s+to\b/gi, fix: 'Replace "when it comes to" with "on" or "for".' },
  { pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi, fix: 'Replace "due to the fact that" with "because".' },
  { pattern: /\bin\s+order\s+to\b/gi, fix: 'Replace "in order to" with "to".' },
  { pattern: /\bwatershed\s+moment\b|\binflection\s+point\s+in\s+the\s+evolution\b/gi, fix: 'Cut significance inflation and state what changed on the ledger.' },
  { pattern: /\bonly\s+time\s+will\s+tell\b|\bthe\s+future\s+looks\s+bright\b|\bexciting\s+times\s+(?:ahead|lie\s+ahead)\b/gi, fix: 'Delete generic send-off cliché and end on a concrete institutional verdict.' },
  { pattern: /\bas\s+we\s+move\s+forward\b|\bmoving\s+forward\s*,/gi, fix: 'Delete corporate "moving forward" filler.' },
  { pattern: /\bmove\s+the\s+needle\b|\bbridge\s+the\s+gap\b|\btake\s+it\s+to\s+the\s+next\s+level\b|\bunlock\s+the\s+power\s+of\b|\bsupercharge\s+your\b/gi, fix: 'Delete marketing buzzword idiom and state exact quantities.' },
  { pattern: /\bthought\s+leader(?:ship)?\b|\bpain\s+points?\b|\bcircle\s+back\b|\btouch\s+base\b|\brest\s+assured\b/gi, fix: 'Delete corporate/consulting jargon.' },
  { pattern: /\bi\s+hope\s+this\s+helps\b|\bgreat\s+question\b|\byou['’]?re\s+absolutely\s+right\b|\bfeel\s+free\s+to\s+reach\s+out\b/gi, fix: 'Remove chatbot wrapper residue immediately.' },
  { pattern: /\bas\s+an?\s+(?:ai|language\s+model)\b|\bas\s+of\s+my\s+last\s+(?:update|training|knowledge)\b|\bup\s+to\s+my\s+last\s+training\b/gi, fix: 'Remove LLM self-reference / cutoff disclaimer immediately.' },
  { pattern: /\b(?:experts|industry\s+leaders)\s+(?:believe|agree|suggest)\b|\bstudies\s+(?:show|suggest|indicate)\b|\bresearch\s+(?:shows|suggests|indicates)\b/gi, fix: 'Replace vague unnamed attribution with the exact agency, filing, author, and year.' },
];

const HOUSE_PROFANITY_SLANG_RE = /\b(?:fuck|fucking|fucked|fucker|shit|shitty|bullshit|bitch|asshole|goddamn|deadass|bussin|no\s+cap|frfr|lowkey|highkey|ngl|finna)\b/gi;

const TIER2_CLUSTER_STEMS = expandWordFamilies([
  [['harness', 'harnesses', 'harnessing', 'harnessed'], 'use, capture'],
  [['navigate', 'navigates', 'navigating'], 'work through, handle'],
  [['elevate', 'elevates', 'elevating', 'unleash', 'unleashes', 'unleashing'], 'raise / release, trigger'],
  [['streamline', 'streamlines', 'streamlining', 'empower', 'empowers', 'empowering'], 'simplify / enable, let'],
  [['resonate', 'resonates', 'resonating', 'facilitate', 'facilitates', 'facilitating'], 'land with / allow, clear'],
  [['underpin', 'underpins', 'underpinning', 'underpinnings'], 'back, support, plumbing'],
  [['ecosystem', 'ecosystems', 'encompass', 'encompasses', 'encompassing'], 'network, market / cover, include'],
  [['augment', 'augments', 'augmenting', 'cultivate', 'cultivates', 'cultivating'], 'expand / build, grow'],
  [['illuminate', 'illuminates', 'illuminating'], 'clarify, expose, show'],
  [['cornerstone', 'poised', 'burgeoning', 'nascent', 'quietly', 'thriving', 'daunting'], 'replace cluster word with concrete rate or noun'],
  [['embrace', 'embraces', 'embracing', 'enhance', 'enhances', 'enhancing', 'emphasize', 'emphasizes', 'emphasizing'], 'adopt / improve / point to'],
  [['state-of-the-art', 'world-class', 'best-in-class'], 'name the exact technical spec or rank'],
]);

export const BANNED_CATALOG_SUMMARY = Object.freeze({
  tier1UnconditionalForms: TIER1_BANNED_WORDS.size,
  tier1ContextDisambiguatedStems: 8,
  tier1SlopPhrasePatterns: TIER1_SLOP_PHRASES.length,
  tier2ClusterForms: TIER2_CLUSTER_STEMS.size,
  totalCatalogEntries: TIER1_BANNED_WORDS.size + 8 + TIER1_SLOP_PHRASES.length + TIER2_CLUSTER_STEMS.size,
});

function runCheck1BannedVocab(lexicalText, protectedSpans, lineStarts, mode) {
  const { deobfuscated, bypassViolations } = scanAndNormalizeObfuscation(lexicalText, lineStarts);
  const violations = [...bypassViolations];
  const protectedHits = [];

  for (const span of protectedSpans) {
    for (const tok of (span.raw.toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g) || [])) {
      if (TIER1_BANNED_WORDS.has(tok) || tok === 'robust' || tok === 'foster' || tok === 'landscape') {
        protectedHits.push({ kind: span.kind, line: offsetToLineCol(lineStarts, span.start).line, token: tok, spanExcerpt: span.raw.slice(0, 90) });
      }
    }
  }

  const wordScanRe = /\b[A-Za-z]+(?:-[A-Za-z]+)*\b/g;
  let wm;
  while ((wm = wordScanRe.exec(deobfuscated)) !== null) {
    const rawWord = wm[0];
    const lower = rawWord.toLowerCase();
    const idx = wm.index;
    const before = deobfuscated.slice(Math.max(0, idx - 45), idx);
    const after = deobfuscated.slice(idx + rawWord.length, Math.min(deobfuscated.length, idx + rawWord.length + 55));
    const pos = offsetToLineCol(lineStarts, idx);
    const ctxExcerpt = deobfuscated.slice(Math.max(0, idx - 16), Math.min(deobfuscated.length, idx + rawWord.length + 18)).replace(/\s+/g, ' ').trim();

    if (TIER1_BANNED_WORDS.has(lower)) {
      violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_BANNED_VOCAB', 'P0', pos, rawWord, `Replace banned AI word "${rawWord}" with plain language (${TIER1_BANNED_WORDS.get(lower)}).`));
    } else if ((lower === 'landscape' || lower === 'landscapes') && !LITERAL_LANDSCAPE_MODIFIERS.test(before)) {
      violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_METAPHORICAL_LANDSCAPE', 'P0', pos, ctxExcerpt, `Replace metaphorical "${rawWord}" with the concrete market, industry, or balance sheet.`));
    } else if (lower === 'leverage' && !FINANCIAL_LEVERAGE_CONTEXT.test(before) && !FINANCIAL_LEVERAGE_CONTEXT.test(after)) {
      violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_LEVERAGE_BUZZWORD', 'P0', pos, ctxExcerpt, 'Replace verb/buzzword "leverage" with "use" (keep only strict financial-accounting ratios).'));
    } else if ((lower === 'robust' || lower === 'robustly') && !(mode === 'prose' && lower === 'robust' && ENGINEERING_ROBUST_CONTEXT.test(after))) {
      violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_BANNED_VOCAB', 'P0', pos, rawWord, `Replace "${rawWord}" with concrete failure tolerances, numbers, or "strong".`));
    } else if (lower === 'foster') {
      const isSurname = rawWord[0] === 'F' && (/\b(?:Mr|Mrs|Ms|Dr|Sen|Rep|Gov|Stephen|Norman|Vincent|Jane|Jodie)\s+$/i.test(before) || /^\s+[A-Z]/.test(after));
      if (!isSurname) violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_BANNED_VOCAB', 'P0', pos, rawWord, 'Replace "foster" with "build", "encourage", or "subsidize".'));
    } else if (lower === 'highlights' || lower === 'highlighted' || lower === 'highlight') {
      const isVerb = lower === 'highlighted'
        || (lower === 'highlights' && !HIGHLIGHT_NOUN_BEFORE.test(before) && !/^\s+of\b/i.test(after))
        || (lower === 'highlight' && !HIGHLIGHT_NOUN_BEFORE.test(before) && HIGHLIGHT_VERB_BEFORE.test(before));
      if (isVerb) violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_HIGHLIGHT_VERB', 'P0', pos, ctxExcerpt, `Replace verb "${rawWord}" with "shows", "exposes", or "points to".`));
    } else if ((lower === 'unpack' || lower === 'unpacks' || lower === 'unpacking' || lower === 'unpacked') && !LITERAL_UNPACK_OBJECT.test(after)) {
      violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_BANNED_VOCAB', 'P0', pos, rawWord, `Replace metaphorical "${rawWord}" with "check", "audit", "read", or "break down".`));
    } else if (lower === 'beacon' || lower === 'symphony') {
      const literal = (lower === 'beacon' && /\b(?:radio|radar|navigation|lighthouse|infrared|homing|gps)\s+$/i.test(before))
        || (lower === 'symphony' && /^\s+(?:orchestra|hall|no\.|in\s+[a-g])\b/i.test(after));
      if (!literal) violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_BANNED_VOCAB', 'P0', pos, rawWord, `Cut figurative "${rawWord}" and name the literal institution or mechanism.`));
    }
  }

  for (const entry of TIER1_SLOP_PHRASES) {
    const re = new RegExp(entry.pattern.source, entry.pattern.flags);
    let pm;
    while ((pm = re.exec(deobfuscated)) !== null) {
      violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_SLOP_PHRASE', 'P0', offsetToLineCol(lineStarts, pm.index), pm[0].trim(), entry.fix));
    }
  }

  const slangRe = new RegExp(HOUSE_PROFANITY_SLANG_RE.source, HOUSE_PROFANITY_SLANG_RE.flags);
  let sm;
  while ((sm = slangRe.exec(deobfuscated)) !== null) {
    violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L13_L14_HOUSE', 'P0', offsetToLineCol(lineStarts, sm.index), sm[0], `Remove profanity/slang "${sm[0]}" to preserve shirt-and-tie restraint.`));
  }

  const paraSplitRe = /\r?\n[ \t]*\r?\n/g;
  const paraRanges = [];
  let lastIdx = 0;
  let splitMatch;
  while ((splitMatch = paraSplitRe.exec(deobfuscated)) !== null) {
    paraRanges.push([lastIdx, splitMatch.index]);
    lastIdx = splitMatch.index + splitMatch[0].length;
  }
  paraRanges.push([lastIdx, deobfuscated.length]);

  for (const [pStart, pEnd] of paraRanges) {
    const paraSlice = deobfuscated.slice(pStart, pEnd);
    if (!paraSlice.trim()) continue;
    const foundTier2 = new Map();
    const pWordRe = /\b[A-Za-z]+(?:-[A-Za-z]+)*\b/g;
    let pw;
    while ((pw = pWordRe.exec(paraSlice)) !== null) {
      const low = pw[0].toLowerCase();
      if (TIER2_CLUSTER_STEMS.has(low) && !foundTier2.has(low)) foundTier2.set(low, { word: pw[0], absOffset: pStart + pw.index });
    }
    if (foundTier2.size >= 2) {
      const list = Array.from(foundTier2.values());
      const names = list.map((x) => `"${x.word}"`).join(', ');
      violations.push(makeViolation('CHECK_1_BANNED_VOCAB', 'L32_TIER2_CLUSTER', 'P1', offsetToLineCol(lineStarts, list[0].absOffset), list.map((x) => x.word).join(' + '), `Paragraph stacks ${list.length} Tier-2 AI words (${names}); rewrite at least ${list.length - 1} in plain concrete terms.`));
    }
  }

  return { id: 'CHECK_1_BANNED_VOCAB', name: '112+ Banned AI Vocabulary & Slop Phrase Catalog', passed: violations.length === 0, violationCount: violations.length, catalogSize: BANNED_CATALOG_SUMMARY.totalCatalogEntries, protectedHits, violations };
}

// --- 3. Check 2: Optional Host `avoid-ai-writing` Detector Cross-Check ---

let cachedHostDetector = null;
let cachedHostPath = null;

function loadHostDetector(options = {}) {
  if (options.forceStandaloneHostSkip) return { detector: null, path: null };
  const candidates = [
    options.hostDetectorPath,
    process.env.AVOID_AI_WRITING_DETECTOR_PATH,
    'C:/Users/youza/.gemini/config/skills/avoid-ai-writing/detector/patterns.js',
    path.join(os.homedir(), '.gemini', 'config', 'skills', 'avoid-ai-writing', 'detector', 'patterns.js'),
  ];
  let resolved = null;
  for (const c of candidates) {
    try { if (c && fs.existsSync(c) && fs.statSync(c).isFile()) { resolved = c; break; } } catch { /* ignore */ }
  }
  if (!resolved) return { detector: null, path: null };
  if (cachedHostDetector && cachedHostPath === resolved) return { detector: cachedHostDetector, path: resolved };
  try {
    const loaded = requireCjs(resolved);
    if (loaded && typeof loaded.analyzeText === 'function') {
      cachedHostDetector = loaded;
      cachedHostPath = resolved;
      return { detector: loaded, path: resolved };
    }
  } catch { /* clean standalone fallback */ }
  return { detector: null, path: null };
}

function runCheck2HostDetector(lexicalText, lineStarts, mode, options = {}) {
  const { detector, path: detectorPath } = loadHostDetector(options);
  if (!detector) {
    return { id: 'CHECK_2_HOST_DETECTOR', name: 'Optional Host avoid-ai-writing Cross-Check', passed: true, status: 'STANDALONE_SKIP', hostAvailable: false, detectorPath: null, hostScore: 0, classification: 'STANDALONE_INTERNAL_ONLY', violationCount: 0, violations: [] };
  }
  const detectorOpts = mode === 'prose' ? { contextMode: 'technical', sourceMode: 'rendered-markdown' } : { contextMode: 'general', sourceMode: 'plain' };
  const res = detector.analyzeText(lexicalText, detectorOpts);
  const hostScore = Number(res.score ?? 0);
  const classification = res.document_classification || 'UNKNOWN';
  const passed = hostScore === 0 && (classification === 'HUMAN_ONLY' || Boolean(res.tooShort));

  const violations = [];
  if (!passed) {
    const lowerRef = lexicalText.toLowerCase();
    const reported = Array.isArray(res.issues) ? res.issues : [];
    if (reported.length === 0) {
      violations.push(makeViolation('CHECK_2_HOST_DETECTOR', 'L46_HOST_DETECTOR', 'P0', { line: 1, column: 1 }, `score=${hostScore}, classification=${classification}`, 'Rewrite flagged AI stylometric patterns until host avoid-ai-writing score reaches 0 (HUMAN_ONLY).'));
    } else {
      for (const issue of reported) {
        let offset = Number.isInteger(issue.index) ? issue.index : -1;
        if (offset < 0 && issue.text) offset = lowerRef.indexOf(String(issue.text).toLowerCase());
        const pos = offsetToLineCol(lineStarts, offset >= 0 ? offset : 0);
        const code = `L46_HOST_${String(issue.type || 'SIGNAL').toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;
        const sev = issue.severity === 'critical' || issue.severity === 'high' ? 'P0' : 'P1';
        const fix = issue.suggestion ? `Host detector (${issue.type}, score=${hostScore}): ${issue.suggestion}` : `Resolve host avoid-ai-writing "${issue.type}" signal so score equals 0.`;
        violations.push(makeViolation('CHECK_2_HOST_DETECTOR', code, sev, pos, String(issue.text || issue.type || `score=${hostScore}`).slice(0, 90), fix));
      }
    }
  }
  return { id: 'CHECK_2_HOST_DETECTOR', name: 'Optional Host avoid-ai-writing Cross-Check', passed, status: passed ? 'PASS' : 'FAIL', hostAvailable: true, detectorPath, hostScore, classification, violationCount: violations.length, violations };
}

// --- 4. Check 3: Zero Negative-Contrast Crutches ---

const NEGATIVE_CONTRAST_PATTERNS = [
  { code: 'L50_RATHER_THAN', re: /\brather\s+than\b/gi, fix: 'Eliminate "rather than" negative contrast; state the positive action directly or compare concrete options with "instead of".' },
  { code: 'L50_NOT_MERELY', re: /\bnot\s+merely\b/gi, fix: 'Delete "not merely" rhetorical staging and state the direct claim.' },
  { code: 'L50_NOT_ONLY_BUT', re: /\bnot\s+only\b[^.!?\r\n]{1,120}?\bbut\b(?:\s+also)?\b/gi, fix: 'Rewrite "not only X, but Y" as direct factual claims joined with "and".' },
  { code: 'L50_NOT_JUST_PIVOT', re: /\bnot\s+(?:just|simply|solely|purely)\b[^.!?\r\n]{1,120}?(?:[,;]\s*(?:but|it['’]s|it\s+is|they['’]re|they\s+are|we['’]re|you['’]re|that['’]s|this\s+is)\b|\bbut\b)/gi, fix: 'Cut "not just X, but/it\'s Y" negative parallelism and state Y directly with concrete evidence.' },
  { code: 'L50_ISNT_ITS_PIVOT', re: /\b(?:isn['’]t|is\s+not|wasn['’]t|was\s+not|it['’]s\s+not|this\s+is\s+not|that['’]s\s+not)\b[^.!?\r\n]{1,95}?,\s*(?:it['’]s|it\s+is|it\s+was|this\s+is|that['’]s|but)\b/gi, fix: 'Eliminate "isn\'t X, it\'s Y" contrast crutch; state what the mechanism actually is.' },
  { code: 'L50_ARENT_THEYRE_PIVOT', re: /\b(?:aren['’]t|are\s+not|weren['’]t|were\s+not|they['’]re\s+not)\b[^.!?\r\n]{1,95}?,\s*(?:they['’]re|they\s+are|they\s+were|but)\b/gi, fix: 'Eliminate "aren\'t X, they\'re Y" contrast crutch; state what they actually do.' },
  { code: 'L50_NOT_X_BUT_Y', re: /\bnot\s+(?:a|an|the|in|by|for|from|about|because|with|to|on|at)?\s*[A-Za-z0-9'’-]+(?:\s+[A-Za-z0-9'’-]+){0,7},\s*but\s+[A-Za-z0-9'’-]+/gi, fix: 'Eliminate "not X, but Y" contrast crutch and state the positive claim directly.' },
  { code: 'L50_SPLIT_SENTENCE_CONTRAST', re: /\b(?:It['’]s|It\s+is|This\s+isn['’]t|This\s+is\s+not|That['’]s\s+not)\s+(?:not\s+)?(?:just\s+|merely\s+|simply\s+)?(?:about\s+)?[^.!?\r\n]{2,65}\.\s+(?:It['’]s|It\s+is|This\s+is|That['’]s)\s+(?:about\s+)?[A-Za-z]/g, fix: 'Collapse two-sentence "It\'s not X. It\'s Y." staging into one direct factual sentence.' },
];

function runCheck3NegativeContrast(lexicalText, lineStarts) {
  const violations = [];
  const occupied = [];
  for (const rule of NEGATIVE_CONTRAST_PATTERNS) {
    const re = new RegExp(rule.re.source, rule.re.flags);
    let m;
    while ((m = re.exec(lexicalText)) !== null) {
      const [start, end] = [m.index, m.index + m[0].length];
      if (occupied.some(([s, e]) => start < e && end > s)) continue;
      occupied.push([start, end]);
      violations.push(makeViolation('CHECK_3_NEGATIVE_CONTRAST', rule.code, 'P0', offsetToLineCol(lineStarts, start), m[0].replace(/\s+/g, ' ').trim().slice(0, 95), rule.fix));
    }
  }
  violations.sort((a, b) => (a.line - b.line) || (a.column - b.column));
  return { id: 'CHECK_3_NEGATIVE_CONTRAST', name: 'Zero Negative-Contrast Crutches', passed: violations.length === 0, violationCount: violations.length, violations };
}

// --- 5. Check 4: Hard Punctuation Discipline ---

function runCheck4Punctuation(structuralText, lineStarts, mode) {
  let scanText = structuralText;
  if (mode === 'prose') {
    scanText = scanText.replace(/^[ \t]*-{3,}[ \t]*$/gm, (m) => blankPreservingLines(m));
    scanText = scanText.replace(/^[ \t]*\|?[ \t]*:?-{2,}:?[ \t]*(?:\|[ \t]*:?-{2,}:?[ \t]*)+\|?[ \t]*$/gm, (m) => blankPreservingLines(m));
  }
  const rules = [
    { code: 'L33_EM_DASH', re: /\u2014/g, fix: 'Replace em dash (U+2014) with a period, comma, colon, or subordinate clause.' },
    { code: 'L33_EN_DASH', re: /\u2013/g, fix: 'Replace en dash (U+2013) with "to" for ranges or a comma/period for clauses.' },
    { code: 'L33_DOUBLE_HYPHEN', re: /--+/g, fix: 'Replace "--" double-hyphen splice with a period, comma, or colon.' },
    { code: 'L33_EXCLAMATION', re: /!/g, fix: 'Remove exclamation mark (!); let verified numbers and verbs carry urgency.' },
  ];
  if (mode === 'script' || mode === 'vertical') {
    rules.push({ code: 'L33_SEMICOLON_IN_SCRIPT', re: /;/g, fix: 'Split semicolon into two spoken sentences or join with "and", "so", or "while".' });
  }
  const violations = [];
  for (const r of rules) {
    let m;
    while ((m = r.re.exec(scanText)) !== null) {
      const snippet = scanText.slice(Math.max(0, m.index - 18), Math.min(scanText.length, m.index + m[0].length + 18)).replace(/\s+/g, ' ').trim();
      violations.push(makeViolation('CHECK_4_PUNCTUATION', r.code, 'P0', offsetToLineCol(lineStarts, m.index), snippet, r.fix));
    }
  }
  violations.sort((a, b) => (a.line - b.line) || (a.column - b.column));
  return { id: 'CHECK_4_PUNCTUATION', name: 'Hard Punctuation Discipline', passed: violations.length === 0, semicolonsBannedInMode: mode !== 'prose', violationCount: violations.length, violations };
}

// --- 6. Sentence & Word Tokenizer (Abbreviation & Decimal Protected) ---

const WORD_TOKEN_RE = /(?:[A-Za-z]\.){2,}[A-Za-z]?|\$?\d+(?:[.,]\d+)*(?:%[A-Za-z]*|\([A-Za-z0-9]+\)s?|[A-Za-z]+)?|[A-Za-z0-9]+(?:['\u2019-][A-Za-z0-9]+)*/g;
const SENTENCE_STARTER_AFTER_ABBREV_RE = /^\s+(?:In|On|At|By|For|From|With|After|Before|During|Under|Over|Into|Once|When|While|If|Because|Since|Though|Although|Today|Right|Now|Then|Here|There|The|A|An|This|That|These|Those|It|He|She|They|We|You|But|And|So|Or|Yet|Still|Even|Watch|Look|Open|Pull|Run|Take|Picture|Keep)\b/;

export function extractWords(text) { return text.match(WORD_TOKEN_RE) || []; }
export function countWords(text) { return extractWords(text).length; }

function maskNonTerminalPeriods(text) {
  const DOT = '\uE000';
  let s = text.replace(/(\d)\.(\d)/g, `$1${DOT}$2`);
  s = s.replace(/\b(Mr|Mrs|Ms|Mx|Dr|Prof|Rep|Sen|Gov|Gen|Col|Lt|Sgt|Capt|Adm|St|Mt|Ft|v|vs|No|Vol|Fig|Sec|Art|Ch|Pt|Pub|L|Inc|Corp|Ltd|Co|Jr|Sr)\./g, `$1${DOT}`);
  s = s.replace(/\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.(?=\s+\d|,)/g, `$1${DOT}`);
  s = s.replace(/\b(e\.g|i\.e|viz|cf|et\s+al|etc)\./gi, (m) => m.replace(/\./g, DOT));
  s = s.replace(/\b([A-Za-z])\.([A-Za-z])\.(?:([A-Za-z])\.)?/g, (m, a, b, c, offset, whole) => {
    const stem = c ? `${a}${DOT}${b}${DOT}${c}` : `${a}${DOT}${b}`;
    return SENTENCE_STARTER_AFTER_ABBREV_RE.test(whole.slice(offset + m.length)) ? `${stem}.` : `${stem}${DOT}`;
  });
  return s;
}

export function tokenizeSentences(structuralText, lineStarts, mode = 'script') {
  const masked = maskNonTerminalPeriods(structuralText);
  const sentences = [];
  const blockSplitRe = /\r?\n[ \t]*\r?\n/g;
  const blocks = [];
  let blockStart = 0;
  let bm;
  while ((bm = blockSplitRe.exec(masked)) !== null) {
    blocks.push([blockStart, bm.index]);
    blockStart = bm.index + bm[0].length;
  }
  blocks.push([blockStart, masked.length]);

  let groupId = 0;
  const pushSpan = (bStart, relStart, rawChunk) => {
    const leadTrimmed = rawChunk.trimStart();
    if (!leadTrimmed) return;
    const firstCharOffset = bStart + relStart + (rawChunk.length - leadTrimmed.length);
    const restored = leadTrimmed.replaceAll('\uE000', '.').trim();
    const words = extractWords(restored);
    if (words.length === 0) return;
    const pos = offsetToLineCol(lineStarts, firstCharOffset);
    sentences.push({ text: restored, offset: firstCharOffset, line: pos.line, column: pos.column, wordCount: words.length, words, groupId: mode === 'prose' ? groupId : 0 });
  };

  for (const [bStart, bEnd] of blocks) {
    const rawBlock = masked.slice(bStart, bEnd);
    if (!rawBlock.trim()) continue;
    if (mode === 'prose' && /^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|\||>)/.test(rawBlock.trimStart())) {
      groupId += 1;
      continue;
    }
    const endPunctRe = /[.!?]['"\u201D\u2019)*]*(?=\s+|$)/g;
    let cursor = 0;
    let pm;
    while ((pm = endPunctRe.exec(rawBlock)) !== null) {
      const sliceEnd = pm.index + pm[0].length;
      pushSpan(bStart, cursor, rawBlock.slice(cursor, sliceEnd));
      cursor = sliceEnd;
    }
    if (cursor < rawBlock.length) pushSpan(bStart, cursor, rawBlock.slice(cursor));
  }
  return sentences;
}

// --- 7. Check 5: Anti-Triad & Sentence-Length Collision Gate ---

const CONCRETE_NOUN_EXEMPTIONS = new Set([
  'station', 'stations', 'substation', 'substations', 'ration', 'rations', 'nation', 'nations',
  'corporation', 'corporations', 'institution', 'institutions', 'organization', 'organizations',
  'administration', 'administrations', 'foundation', 'foundations', 'plantation', 'plantations',
  'medication', 'medications', 'location', 'locations', 'publication', 'publications',
  'apartment', 'apartments', 'document', 'documents', 'instrument', 'instruments', 'payment', 'payments',
  'shipment', 'shipments', 'equipment', 'garment', 'garments', 'monument', 'monuments', 'basement', 'basements',
  'pavement', 'pavements', 'department', 'departments', 'segment', 'segments', 'element', 'elements',
  'city', 'cities', 'utility', 'utilities', 'facility', 'facilities', 'commodity', 'commodities',
  'security', 'securities', 'equity', 'equities', 'liability', 'liabilities', 'university', 'universities',
  'municipality', 'municipalities', 'factory', 'factories', 'ministry', 'ministries', 'battery', 'batteries',
  'delivery', 'deliveries', 'currency', 'currencies', 'treasury', 'treasuries', 'agency', 'agencies',
]);
const ABSTRACT_NOUN_SUFFIX_RE = /^[a-z]{3,}(?:tion|tions|sion|sions|ity|ities|ness|nesses|ism|isms|ance|ances|ence|ences|ency|encies|ment|ments|ship|ships|acy|acies|itude|itudes)$/;
const EXTRA_ABSTRACT_NOUNS = new Set(['synergy', 'harmony', 'autonomy', 'sovereignty', 'empathy', 'efficacy', 'efficiency', 'resilience', 'transparency', 'urgency', 'fluency', 'potency', 'decency', 'candor', 'rigor', 'vigor', 'ethos', 'pathos', 'vision', 'passion', 'wisdom', 'freedom', 'justice']);
const TRIAD_CLAUSE_BOUNDARY_WORDS = new Set(['and', 'or', 'but', 'while', 'when', 'where', 'because', 'since', 'though', 'although', 'if', 'unless', 'until', 'before', 'after', 'during', 'across', 'through', 'into', 'onto', 'from', 'with', 'without', 'under', 'over', 'between', 'among', 'by', 'for', 'in', 'on', 'at', 'to', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'shall', 'should', 'may', 'might', 'must', 'that', 'which', 'who']);

function isAbstractHeadNoun(word) {
  const low = word.toLowerCase();
  if (low.length < 5 || CONCRETE_NOUN_EXEMPTIONS.has(low)) return false;
  return EXTRA_ABSTRACT_NOUNS.has(low) || ABSTRACT_NOUN_SUFFIX_RE.test(low);
}

function runCheck5TriadAndRhythm(lexicalText, sentences, lineStarts) {
  const violations = [];
  const triadRe = /\b([A-Za-z]{5,}),\s+(?:[A-Za-z-]+\s+){0,2}([A-Za-z]{5,}),?\s+(?:and|or)\s+([A-Za-z-]+(?:\s+[A-Za-z-]+){0,2})\b/g;
  let tm;
  while ((tm = triadRe.exec(lexicalText)) !== null) {
    const [, n1, n2, tail] = tm;
    if (!isAbstractHeadNoun(n1) || !isAbstractHeadNoun(n2)) continue;
    const tailWords = tail.split(/\s+/);
    let matchedN3 = null;
    const keptTail = [];
    for (let k = 0; k < tailWords.length; k += 1) {
      if (TRIAD_CLAUSE_BOUNDARY_WORDS.has(tailWords[k].toLowerCase())) break;
      keptTail.push(tailWords[k]);
      if (isAbstractHeadNoun(tailWords[k])) { matchedN3 = tailWords[k]; break; }
    }
    if (matchedN3) {
      const cleanSpan = `${tm[0].slice(0, tm[0].length - tail.length)}${keptTail.join(' ')}`.replace(/\s+/g, ' ').trim();
      violations.push(makeViolation('CHECK_5_TRIAD_AND_RHYTHM', 'L31_ABSTRACT_TRIAD', 'P0', offsetToLineCol(lineStarts, tm.index), cleanSpan, `Replace abstract noun tricolon (${n1}, ${n2}, ${matchedN3}) with concrete named actors, physical objects, or a direct two-part claim.`));
    }
  }

  for (let i = 0; i <= sentences.length - 3; i += 1) {
    const [s1, s2, s3] = [sentences[i], sentences[i + 1], sentences[i + 2]];
    if (s1.groupId !== s2.groupId || s2.groupId !== s3.groupId) continue;
    if (s1.wordCount === s2.wordCount && s2.wordCount === s3.wordCount) {
      violations.push(makeViolation('CHECK_5_TRIAD_AND_RHYTHM', 'L51_EQUAL_LENGTH_RUN', 'P1', { line: s1.line, column: s1.column }, `3 consecutive ${s1.wordCount}-word sentences (L${s1.line}, L${s2.line}, L${s3.line}): "${s1.text.slice(0, 42)}..."`, `Vary sentence rhythm at L${s1.line} to L${s3.line}; break the ${s1.wordCount}-${s2.wordCount}-${s3.wordCount} word-count collision.`));
    }
  }

  let runStart = -1;
  for (let i = 0; i <= sentences.length; i += 1) {
    const cur = sentences[i];
    const sameGroup = cur && (i === 0 || cur.groupId === sentences[i - 1].groupId);
    if (cur && cur.wordCount <= 6 && (runStart === -1 || sameGroup)) {
      if (runStart === -1) runStart = i;
    } else {
      if (runStart !== -1 && i - runStart >= 3) {
        const chain = sentences.slice(runStart, i);
        const first = chain[0];
        violations.push(makeViolation('CHECK_5_TRIAD_AND_RHYTHM', 'L51_PARATAXIS_CHAIN', 'P1', { line: first.line, column: first.column }, `${chain.length} consecutive <=6w sentences (${chain.map((s) => `${s.wordCount}w`).join(', ')}): "${chain.map((s) => s.text).join(' ').slice(0, 80)}"`, `Cap consecutive <=6-word punches at 2; connect fragments near L${first.line} with causal or subordinate syntax.`));
      }
      runStart = (cur && cur.wordCount <= 6) ? i : -1;
    }
  }
  violations.sort((a, b) => (a.line - b.line) || (a.column - b.column));
  return { id: 'CHECK_5_TRIAD_AND_RHYTHM', name: 'Anti-Triad & Sentence-Length Collision Gate', passed: violations.length === 0, violationCount: violations.length, violations };
}

// --- 8. Check 6: Spoken Cadence & Clarity Band ---

const SPOKEN_CONTRACTION_RE = /\b(?:[A-Za-z]+n['\u2019]t|[A-Za-z]+['\u2019](?:m|re|ve|ll|d)|(?:it|that|this|what|who|where|when|why|how|there|here|he|she|let|somebody|someone|everybody|everyone|nobody|nothing|everything|something)['\u2019]s|[A-Za-z]+['\u2019]s(?=\s+(?:a|an|the|not|never|still|already|just|only|also|even|actually|going|gonna|got|gotten|been|being|supposed|built|chained|locked|watching|printing|coming|running|sitting|starting|eating|making|paying|pouring)\b)|o['\u2019]clock|y['\u2019]all)\b/gi;

export function countSyllablesInWord(rawWord) {
  if (/^\$?\d/.test(rawWord)) return Math.max(1, Math.min(3, rawWord.replace(/[^0-9]/g, '').length));
  if (/^(?:[A-Za-z]\.){2,}/.test(rawWord)) return (rawWord.match(/[A-Za-z]/g) || []).length;
  let total = 0;
  for (const part of rawWord.toLowerCase().split(/[-/]/).filter(Boolean)) {
    let w = part.replace(/[^a-z]/g, '');
    if (!w) continue;
    if (w.length <= 3) { total += 1; continue; }
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    const groups = w.match(/[aeiouy]{1,2}/g);
    total += groups ? Math.max(1, groups.length) : 1;
  }
  return Math.max(1, total);
}

function runCheck6SpokenCadence(structuralText, sentences, mode) {
  const sentCount = sentences.length;
  const allWords = sentences.flatMap((s) => s.words);
  const wordCount = allWords.length;
  const meanSentenceWords = sentCount > 0 ? +(wordCount / sentCount).toFixed(2) : 0;
  const gt30Sentences = sentences.filter((s) => s.wordCount > 30);
  const le6Sentences = sentences.filter((s) => s.wordCount <= 6);
  const pctGt30 = sentCount > 0 ? +((gt30Sentences.length * 100) / sentCount).toFixed(2) : 0;
  const pctLe6 = sentCount > 0 ? +((le6Sentences.length * 100) / sentCount).toFixed(2) : 0;
  const contractionsCount = (structuralText.match(SPOKEN_CONTRACTION_RE) || []).length;
  const contractionsPer1k = wordCount > 0 ? +((contractionsCount * 1000) / wordCount).toFixed(2) : 0;
  const totalSyllables = allWords.reduce((sum, w) => sum + countSyllablesInWord(w), 0);
  const fkGradeLevel = (sentCount > 0 && wordCount > 0) ? +(0.39 * (wordCount / sentCount) + 11.8 * (totalSyllables / wordCount) - 15.59).toFixed(2) : 0;

  const metrics = { wordCount, sentenceCount: sentCount, meanSentenceWords, benchmarkSentenceWords: 16.6, sentencesGt30Count: gt30Sentences.length, sentencesGt30Pct: pctGt30, sentencesLe6Count: le6Sentences.length, sentencesLe6Pct: pctLe6, contractionsCount, contractionsPer1k, fleschKincaidGrade: fkGradeLevel };
  if (mode === 'prose') {
    return { id: 'CHECK_6_SPOKEN_CADENCE', name: 'Spoken Cadence & Clarity Band (Telemetry Only in Prose Mode)', passed: true, enforced: false, mode, metrics, violationCount: 0, violations: [] };
  }

  const minMean = mode === 'vertical' ? 11.0 : 15.5;
  const maxMean = 17.5;
  const violations = [];

  if (sentCount === 0 || wordCount === 0) {
    violations.push(makeViolation('CHECK_6_SPOKEN_CADENCE', 'L51_EMPTY_SCRIPT', 'P0', { line: 1, column: 1 }, '0 spoken sentences found', 'Provide spoken script narration text.'));
  } else {
    if (meanSentenceWords > maxMean) {
      const longest = [...sentences].sort((a, b) => b.wordCount - a.wordCount).slice(0, 4);
      const hint = longest.map((s) => `L${s.line} (${s.wordCount}w)`).join(', ');
      violations.push(makeViolation('CHECK_6_SPOKEN_CADENCE', 'L51_MEAN_SENTENCE_LENGTH', 'P1', { line: longest[0].line, column: 1 }, `mean=${meanSentenceWords}w (target [${minMean.toFixed(1)}, ${maxMean.toFixed(1)}], benchmark ~16.6w)`, `Mean sentence length ${meanSentenceWords}w exceeds ${maxMean.toFixed(1)}w ceiling. Split long clauses at ${hint}.`));
    } else if (meanSentenceWords < minMean) {
      const shortest = [...sentences].sort((a, b) => a.wordCount - b.wordCount).slice(0, 4);
      const hint = shortest.map((s) => `L${s.line} (${s.wordCount}w)`).join(', ');
      violations.push(makeViolation('CHECK_6_SPOKEN_CADENCE', 'L51_MEAN_SENTENCE_LENGTH', 'P1', { line: shortest[0].line, column: 1 }, `mean=${meanSentenceWords}w (target [${minMean.toFixed(1)}, ${maxMean.toFixed(1)}], benchmark ~16.6w)`, `Mean sentence length ${meanSentenceWords}w sits below ${minMean.toFixed(1)}w floor. Merge short fragments near ${hint}.`));
    }
    if (pctGt30 >= 8.0) {
      const topLong = [...gt30Sentences].sort((a, b) => b.wordCount - a.wordCount).slice(0, 4);
      const hint = topLong.map((s) => `L${s.line} (${s.wordCount}w)`).join(', ');
      violations.push(makeViolation('CHECK_6_SPOKEN_CADENCE', 'L51_LONG_SENTENCE_TAIL', 'P1', { line: topLong[0].line, column: 1 }, `>30w sentences = ${pctGt30}% (${gt30Sentences.length}/${sentCount}; ceiling < 8.0%)`, `Split sentences >30 words (${hint}) until >30w share drops strictly below 8.0%.`));
    }
    if (contractionsPer1k < 10.0) {
      violations.push(makeViolation('CHECK_6_SPOKEN_CADENCE', 'L09_CONTRACTION_DENSITY', 'P1', { line: 1, column: 1 }, `contractions=${contractionsPer1k}/1k words (${contractionsCount} total; floor >= 10.0/1k)`, 'Convert stiff uncontracted auxiliary pairs ("do not", "will not", "it is", "you are") into natural spoken contractions.'));
    }
    if (fkGradeLevel > 10.5) {
      violations.push(makeViolation('CHECK_6_SPOKEN_CADENCE', 'L52_FK_GRADE_LEVEL', 'P1', { line: 1, column: 1 }, `Flesch-Kincaid Grade = ${fkGradeLevel} (ceiling <= 10.5)`, 'Replace polysyllabic Latinate nominalizations with concrete 1-to-2 syllable spoken verbs and shorter clauses until FKGL <= 10.5.'));
    }
  }
  return { id: 'CHECK_6_SPOKEN_CADENCE', name: `Spoken Cadence & Clarity Band (${mode} mode)`, passed: violations.length === 0, enforced: true, mode, thresholds: { meanSentenceWordsMin: minMean, meanSentenceWordsMax: maxMean, sentencesGt30PctMaxExclusive: 8.0, contractionsPer1kMin: 10.0, fleschKincaidGradeMax: 10.5 }, metrics, violationCount: violations.length, violations };
}

// --- 9. Full Document Compiler Pipeline ---

export function analyzeDocument(rawText, options = {}) {
  const mode = VALID_MODES.has(options.mode) ? options.mode : 'script';
  const filePath = options.filePath || '<memory>';
  const lineStarts = buildLineIndex(rawText);
  const { structural, lexical, protectedSpans } = buildWorkingViews(rawText, mode);
  const sentences = tokenizeSentences(structural, lineStarts, mode);

  const checks = [
    runCheck1BannedVocab(lexical, protectedSpans, lineStarts, mode),
    runCheck2HostDetector(lexical, lineStarts, mode, options),
    runCheck3NegativeContrast(lexical, lineStarts),
    runCheck4Punctuation(structural, lineStarts, mode),
    runCheck5TriadAndRhythm(lexical, sentences, lineStarts),
    runCheck6SpokenCadence(structural, sentences, mode),
  ];
  const violations = checks.flatMap((c) => c.violations).sort((a, b) => (a.line - b.line) || (a.column - b.column));
  let score = violations.reduce((sum, v) => sum + (v.severity === 'P0' ? 5 : 2), 0);
  if (checks[1].hostScore > 0) score = Math.max(score, checks[1].hostScore);
  const passed = violations.length === 0 && score === 0;

  return { filePath, mode, gate: passed ? 'PASS' : 'FAIL', passed, score: passed ? 0 : Math.max(1, score), violationCount: violations.length, metrics: checks[5].metrics, protectedCitationCount: protectedSpans.length, checks, violations };
}

// --- 10. Built-In Deterministic Self-Test Suite (--self-test) ---

export function runSelfTests() {
  const cases = [];
  const record = (name, ok, detail = '') => cases.push({ name, passed: Boolean(ok), detail });

  const cleanScript = [
    "Roughly two-thirds of every tax dollar Washington collects comes straight out of somebody's Friday paycheck.",
    'Add capital gains from regular households, and working people fund over 86.4 percent of the U.S. government.',
    "So if software wipes out a huge share of those jobs before 2036, who's going to pay off $40.5 trillion in debt?",
    '',
    'In *Wielechowski v. State*, judges reviewed what lawmakers called an "enduring pivotal testament" inside the state budget.',
    'Watch what happens when that squeeze hits Washington, D.C. In 2026, interest bills passed $1.05 trillion across ports, plants, and trucks.',
    "You've got a fixed home loan that doesn't care what code costs, and your bank's draft clears on Tuesday morning.",
    'The Comprehensive Fair Labor Standards Act of 1938 barred bosses from paying workers in brass scrip at company stores.',
    "Once machines run through the night without your labor, you can't trade idle server credits for groceries or winter heat.",
  ].join('\n');

  const rClean = analyzeDocument(cleanScript, { mode: 'script', filePath: 'fixture_clean_script.md' });
  record('T01_clean_script_passes_with_protections', rClean.passed && rClean.score === 0 && rClean.metrics.meanSentenceWords >= 15.5 && rClean.metrics.meanSentenceWords <= 17.5, `gate=${rClean.gate}, score=${rClean.score}, mean=${rClean.metrics.meanSentenceWords}w, FKGL=${rClean.metrics.fleschKincaidGrade}`);

  const rStandalone = analyzeDocument(cleanScript, { mode: 'script', forceStandaloneHostSkip: true });
  const c2Skip = rStandalone.checks.find((c) => c.id === 'CHECK_2_HOST_DETECTOR');
  record('T02_standalone_fallback_without_host_skill', rStandalone.passed && c2Skip?.status === 'STANDALONE_SKIP', `hostStatus=${c2Skip?.status}`);

  const rVocab = analyzeDocument("We'll d\u0435lve into the financial landscape to showcase how these filings highlight the tapestry.", { mode: 'prose', forceStandaloneHostSkip: true });
  const rLiteralOk = analyzeDocument('One yellow highlight on the chart shows why balance-sheet leverage ratios fit an arid desert landscape.', { mode: 'prose', forceStandaloneHostSkip: true });
  const c1Codes = new Set(rVocab.checks[0].violations.map((v) => v.ruleCode));
  record('T03_check1_tier1_context_and_homoglyph', !rVocab.passed && rLiteralOk.checks[0].passed && c1Codes.has('L32_HOMOGLYPH_BYPASS') && c1Codes.has('L32_BANNED_VOCAB') && c1Codes.has('L32_METAPHORICAL_LANDSCAPE') && c1Codes.has('L32_HIGHLIGHT_VERB'), `codes=${Array.from(c1Codes).join(',')}, literalContextPass=${rLiteralOk.checks[0].passed}`);

  const rSlopCluster = analyzeDocument("Here's the thing, let's dive in and quietly harness this burgeoning ecosystem at its core.", { mode: 'prose', forceStandaloneHostSkip: true });
  const c1ClusterCodes = new Set(rSlopCluster.checks[0].violations.map((v) => v.ruleCode));
  record('T04_check1_slop_phrases_and_tier2_cluster', c1ClusterCodes.has('L32_SLOP_PHRASE') && c1ClusterCodes.has('L32_TIER2_CLUSTER'), `codes=${Array.from(c1ClusterCodes).join(',')}`);

  const rNeg = analyzeDocument("This isn't a cycle, it's a cliff. They aren't savers, they're borrowers. Firms hoard cash rather than hiring, not just to survive, but to win.", { mode: 'prose', forceStandaloneHostSkip: true });
  record('T05_check3_negative_contrast_crutches', rNeg.checks[2].violationCount >= 4, `negHits=${rNeg.checks[2].violationCount}`);

  const punctSample = 'Rates jumped — fast – and banks froze credit -- overnight; nobody cheered! Look at `--self-test` in prose.';
  const rPunctScript = analyzeDocument(punctSample, { mode: 'script', forceStandaloneHostSkip: true });
  const rPunctProse = analyzeDocument('Plain prose allows semicolons; inline `--self-test` code stays masked.', { mode: 'prose', forceStandaloneHostSkip: true });
  const pCodes = new Set(rPunctScript.checks[3].violations.map((v) => v.ruleCode));
  record('T06_check4_punctuation_discipline_and_prose_semicolon', pCodes.has('L33_EM_DASH') && pCodes.has('L33_EN_DASH') && pCodes.has('L33_DOUBLE_HYPHEN') && pCodes.has('L33_EXCLAMATION') && pCodes.has('L33_SEMICOLON_IN_SCRIPT') && rPunctProse.checks[3].passed, `scriptPunctCodes=${Array.from(pCodes).join(',')}, prosePassed=${rPunctProse.checks[3].passed}`);

  const rTriad = analyzeDocument('Leaders promised transparency, accountability, and long-term resilience while buying copper, transformers, and turbines.', { mode: 'prose', forceStandaloneHostSkip: true });
  record('T07_check5a_abstract_triad_caught_concrete_spared', rTriad.checks[4].violationCount === 1 && rTriad.checks[4].violations[0].ruleCode === 'L31_ABSTRACT_TRIAD', `triadViolations=${rTriad.checks[4].violationCount}`);

  const rRhythm = analyzeDocument('Banks sold every bond on Friday morning. Funds bought every bill on Monday noon. Firms locked every loan by Tuesday night. Prices fell fast. Wages dropped too. Credit dried up.', { mode: 'prose', forceStandaloneHostSkip: true });
  const c5Codes = new Set(rRhythm.checks[4].violations.map((v) => v.ruleCode));
  record('T08_check5bc_equal_length_and_parataxis', c5Codes.has('L51_EQUAL_LENGTH_RUN') && c5Codes.has('L51_PARATAXIS_CHAIN'), `c5Codes=${Array.from(c5Codes).join(',')}`);

  const shortPunchy = [
    "Your landlord doesn't take compute credits on Friday morning.",
    "Washington collects eighty-six percent of federal taxes straight from workers' paychecks.",
    "Once coding agents cut Claire's salary in half, her fixed mortgage stays frozen.",
    "You can't stash Tuesday's idle server tokens inside a jar for December's utility bill.",
  ].join(' ');
  const rAsScript = analyzeDocument(shortPunchy, { mode: 'script', forceStandaloneHostSkip: true });
  const rAsVertical = analyzeDocument(shortPunchy, { mode: 'vertical', forceStandaloneHostSkip: true });
  record('T09_check6_vertical_vs_script_cadence_band', !rAsScript.checks[5].passed && rAsVertical.passed, `mean=${rAsVertical.metrics.meanSentenceWords}w, scriptPass=${rAsScript.checks[5].passed}, verticalPass=${rAsVertical.passed}`);

  const stiffAcademic = 'Institutional municipalities systematically administer macroeconomic stabilization mechanisms across interconnected regulatory jurisdictions. Constitutional appropriations continuously prioritize collateralized institutional bondholders before discretionary household distributions.';
  const rStiff = analyzeDocument(stiffAcademic, { mode: 'script', forceStandaloneHostSkip: true });
  const c6StiffCodes = new Set(rStiff.checks[5].violations.map((v) => v.ruleCode));
  record('T10_check6_stiff_no_contractions_and_fkgl_fail', c6StiffCodes.has('L09_CONTRACTION_DENSITY') && c6StiffCodes.has('L52_FK_GRADE_LEVEL'), `c6Codes=${Array.from(c6StiffCodes).join(',')}`);

  const ep01Path = path.resolve(__dirname, '..', 'ep_01_the_allowance', 'source_video_01_script.md');
  if (fs.existsSync(ep01Path)) {
    const rEp01 = analyzeDocument(fs.readFileSync(ep01Path, 'utf8'), { mode: 'script', filePath: ep01Path });
    record('T11_ep01_source_video_01_script_benchmark_pass', rEp01.passed && rEp01.score === 0, `gate=${rEp01.gate}, score=${rEp01.score}, words=${rEp01.metrics.wordCount}, mean=${rEp01.metrics.meanSentenceWords}w, gt30=${rEp01.metrics.sentencesGt30Pct}%, contr=${rEp01.metrics.contractionsPer1k}/1k, FKGL=${rEp01.metrics.fleschKincaidGrade}`);
  }

  const failedCases = cases.filter((c) => !c.passed);
  return { passed: failedCases.length === 0, total: cases.length, passedCount: cases.length - failedCases.length, failedCount: failedCases.length, catalogSummary: BANNED_CATALOG_SUMMARY, cases };
}

// --- 11. CLI Runner & Human / JSON Formatters ---

function printHelp() {
  console.log(`
The Reading Room Editorial OS — Stage 6 Local Anti-AI & Spoken-Cadence Gate
Usage:
  node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs --file <path> [--mode <script|vertical|prose>] [--json]
  node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs --dir <path>  [--mode <script|vertical|prose>] [--json]
  node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs --self-test   [--json]

Options:
  --file <path>                 Path to a script or Markdown file (repeatable)
  --dir <path>                  Recursively audit all .md and .txt files under directory
  --mode <script|vertical|prose> Validation profile (default: script)
                                  script   : 15.5-17.5w mean, <8% >30w, >=10/1k contractions, FKGL <=10.5, 0 semicolons
                                  vertical : 11.0-17.5w mean (45-60s Shorts), all 0-tolerance bans active
                                  prose    : 0-tolerance AI/contrast/dash/bang/rhythm bans; semicolons & code spans allowed
  --json                        Emit machine-readable JSON report to stdout
  --self-test                   Run built-in deterministic test suite across all 6 checks
  --help, -h                    Show this usage guide

Exit Codes:
  0  GATE: PASS (score = 0)
  1  GATE: FAIL (line-numbered fix diagnostics emitted) or CLI usage error
`.trim());
}

function collectFilesFromDir(dirPath) {
  const results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) results.push(...collectFilesFromDir(full));
    else if (entry.isFile() && /\.(?:md|txt)$/i.test(entry.name)) results.push(full);
  }
  return results;
}

function parseCliArgs(argv) {
  const opts = { files: [], dirs: [], mode: 'script', json: false, selfTest: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--self-test') opts.selfTest = true;
    else if (arg === '--file') {
      if (!argv[i + 1]) throw new Error('Missing value after --file');
      opts.files.push(argv[++i]);
    } else if (arg.startsWith('--file=')) opts.files.push(arg.slice('--file='.length));
    else if (arg === '--dir') {
      if (!argv[i + 1]) throw new Error('Missing value after --dir');
      opts.dirs.push(argv[++i]);
    } else if (arg.startsWith('--dir=')) opts.dirs.push(arg.slice('--dir='.length));
    else if (arg === '--mode') {
      if (!argv[i + 1]) throw new Error('Missing value after --mode');
      opts.mode = argv[++i].toLowerCase();
    } else if (arg.startsWith('--mode=')) opts.mode = arg.slice('--mode='.length).toLowerCase();
    else throw new Error(`Unknown CLI argument: ${arg}`);
  }
  if (!VALID_MODES.has(opts.mode)) throw new Error(`Invalid --mode "${opts.mode}". Expected one of: script, vertical, prose.`);
  return opts;
}

function formatHumanReport(reports) {
  const lines = [];
  for (const rep of reports) {
    const m = rep.metrics;
    lines.push(`=== Anti-AI & Spoken-Cadence Gate: ${rep.filePath} ===`);
    lines.push(`Mode: ${rep.mode} | Words: ${m.wordCount} | Sentences: ${m.sentenceCount} | Mean: ${m.meanSentenceWords}w | >30w: ${m.sentencesGt30Pct}% | <=6w: ${m.sentencesLe6Pct}% | Contractions: ${m.contractionsPer1k}/1k | FKGL: ${m.fleschKincaidGrade}`);
    for (const c of rep.checks) {
      let badge = c.passed ? 'PASS' : `FAIL (${c.violationCount})`;
      if (c.id === 'CHECK_2_HOST_DETECTOR') {
        badge = c.hostAvailable ? `${c.passed ? 'PASS' : 'FAIL'} (score=${c.hostScore}, ${c.classification})` : 'PASS (standalone: host skill absent)';
      } else if (c.id === 'CHECK_6_SPOKEN_CADENCE' && !c.enforced) {
        badge = 'PASS (telemetry-only in prose mode)';
      }
      lines.push(`  [${badge}] ${c.id}: ${c.name}`);
    }
    if (rep.violations.length > 0) {
      lines.push('  --- Line-Numbered Fix Diagnostics ---');
      for (const v of rep.violations) {
        lines.push(`  L${v.line}:C${v.column} [${v.severity}] [${v.ruleCode}] ${v.excerpt}`);
        lines.push(`    -> Fix: ${v.fix}`);
      }
    }
    lines.push('');
  }
  const totalScore = reports.reduce((acc, r) => acc + r.score, 0);
  const totalViolations = reports.reduce((acc, r) => acc + r.violationCount, 0);
  lines.push(reports.every((r) => r.passed) ? 'GATE: PASS (score = 0)' : `GATE: FAIL (score = ${totalScore}, violations = ${totalViolations})`);
  return lines.join('\n');
}

function main() {
  let opts;
  try {
    opts = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`CLI Error: ${err.message}\nRun with --help for usage.`);
    process.exit(1);
  }
  if (opts.help) { printHelp(); process.exit(0); }

  if (opts.selfTest) {
    const st = runSelfTests();
    if (opts.json) console.log(JSON.stringify(st, null, 2));
    else {
      console.log(`=== Anti-AI Script Gate Self-Test Suite (${st.passedCount}/${st.total} passed) ===`);
      console.log(`Embedded Catalog Entries: ${st.catalogSummary.totalCatalogEntries}`);
      for (const c of st.cases) console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.name} (${c.detail})`);
      console.log(st.passed ? 'GATE: PASS (score = 0)' : 'GATE: FAIL');
    }
    process.exit(st.passed ? 0 : 1);
  }

  const targetFiles = [];
  for (const f of opts.files) {
    const resolved = path.resolve(f);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) { console.error(`File not found: ${resolved}`); process.exit(1); }
    targetFiles.push(resolved);
  }
  for (const d of opts.dirs) {
    const resolvedDir = path.resolve(d);
    if (!fs.existsSync(resolvedDir) || !fs.statSync(resolvedDir).isDirectory()) { console.error(`Directory not found: ${resolvedDir}`); process.exit(1); }
    targetFiles.push(...collectFilesFromDir(resolvedDir));
  }
  if (targetFiles.length === 0) {
    console.error('No input specified. Pass --file <path>, --dir <path>, --self-test, or --help.');
    process.exit(1);
  }

  const reports = targetFiles.map((fp) => analyzeDocument(fs.readFileSync(fp, 'utf8'), { mode: opts.mode, filePath: fp }));
  const allPassed = reports.every((r) => r.passed);
  const totalScore = reports.reduce((acc, r) => acc + r.score, 0);
  const totalViolations = reports.reduce((acc, r) => acc + r.violationCount, 0);

  if (opts.json) {
    console.log(JSON.stringify({ gate: allPassed ? 'PASS' : 'FAIL', score: allPassed ? 0 : totalScore, totalFiles: reports.length, totalViolations, catalogSummary: BANNED_CATALOG_SUMMARY, results: reports }, null, 2));
  } else {
    console.log(formatHumanReport(reports));
  }
  process.exit(allPassed ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}
