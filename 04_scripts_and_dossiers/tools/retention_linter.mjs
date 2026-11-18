#!/usr/bin/env node
/**
 * Deliverable #26: Pacing, Re-Hook & Retention Drop-Off Auditor CLI
 * Repository: reading-room-editorial-os/04_scripts_and_dossiers/tools/retention_linter.mjs
 * Runtime: Node.js >= 20 ESM, zero external npm dependencies.
 *
 * Audits spoken YouTube scripts for The Reading Room against four deterministic
 * retention gates:
 *   1. 220-Word Dry-Stretch Scanner (Hard Gate P0; 75w in vertical mode)
 *   2. First-15-Second Cold-Open Clock (<= 50 words to concrete number + stake, 0 throat-clearing)
 *   3. 10-Decile Re-Hook Density Audit (D1..D10 active coverage + 150 wpm runtime estimate)
 *   4. Mid-Video Subscribe-Nag Ban (0.00-0.90) & Final-Window Closing Bridge Check (0.90-1.00)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_SCRIPT_PATH = path.join(
  REPO_ROOT,
  "04_scripts_and_dossiers",
  "ep_01_the_allowance",
  "source_video_01_script.md"
);

export const MODE_PROFILES = {
  longform: {
    mode: "longform",
    defaultWpm: 150,
    maxDryWords: 220,
    maxColdOpenWords: 50,
    throatClearingScanWords: 65,
    minActiveDeciles: 10,
    maxConsecutiveEmptyDeciles: 0,
    advisoryMinResetsPerDecile: 2,
    midNagCeilingFrac: 0.9,
    requireClosingBridge: true,
    maxClosingBridges: 2
  },
  vertical: {
    mode: "vertical",
    defaultWpm: 150,
    maxDryWords: 75,
    maxColdOpenWords: 25,
    throatClearingScanWords: 35,
    minActiveDeciles: 6,
    maxConsecutiveEmptyDeciles: 2,
    advisoryMinResetsPerDecile: 1,
    midNagCeilingFrac: 0.85,
    requireClosingBridge: true,
    maxClosingBridges: 1
  }
};

const VISUAL_STAGE_CUE_RE =
  /^\[(?:\s*(?:ON[\s_-]*SCREEN|GRAPHIC|CHART|MAP|EXHIBIT|TABLE|DOCUMENT|CUTAWAY|PROP|VISUAL|ARCHIVE)\b[^\]]*)\]$/i;

const GENERIC_STAGE_CUE_RE =
  /^\[(?:\s*(?:STAGE(?:\s+CUE)?|CUE|B-ROLL|SFX|AUDIO|MUSIC|CAMERA|PUNCH[\s_-]*IN|PAUSE|BEAT|DIRECTOR|NOTE|CUT)\b[^\]]*|[A-Z0-9_\s:./-]{3,})\]$/;

const THROAT_CLEARING_PATTERNS = [
  { id: "welcome_back", re: /\bwelcome\s+(?:back|to\s+the\s+channel|to\s+the\s+reading\s+room)\b/i },
  { id: "in_this_video", re: /\bin\s+(?:this|today's)\s+video\b/i },
  { id: "hey_guys", re: /\b(?:hey\s+guys|what's\s+up\s+guys|what\s+is\s+up\s+everybody|hello\s+everyone)\b/i },
  { id: "today_we_will", re: /\btoday\s+we(?:'re|\s+are|\s+will)\s+(?:going\s+to\s+)?(?:talk\s+about|cover|explore|look\s+at)\b/i },
  { id: "without_further_ado", re: /\b(?:without\s+further\s+ado|before\s+we\s+get\s+started|before\s+we\s+jump\s+in)\b/i },
  { id: "early_sub_beg", re: /\b(?:make\s+sure\s+to\s+subscribe|smash\s+that\s+like|hit\s+subscribe)\b/i }
];

const VISUAL_SPOKEN_PATTERNS = [
  { label: "Table", re: /\btables?\b/i },
  { label: "Look at", re: /\blook\s+(?:at|closely|down|up|inside|a\s+few\s+rows)\b/i },
  { label: "Open", re: /\bopen\s+(?:table|the|up|form|schedule|page|section|item)\b/i },
  { label: "Pull up", re: /\bpull\s+up\b/i },
  { label: "Picture", re: /\bpicture\s+[a-z0-9]/i },
  { label: "Watch", re: /\bwatch\s+(?:what|how|where|the|this)\b/i },
  { label: "chart", re: /\bcharts?\b/i },
  { label: "map", re: /\bmaps?\b/i },
  { label: "filing", re: /\b(?:filings?|ledgers?|dockets?|10-[kq]|footnotes?|whiteboards?|spreadsheets?|dashboards?)\b/i }
];

const OPEN_LOOP_PATTERNS = [
  { label: "in a minute", re: /\bin\s+a\s+minute\b/i },
  { label: "back of your mind", re: /\bback\s+of\s+your\s+mind\b/i },
  { label: "get to", re: /\bget\s+(?:to|into)\b/i },
  { label: "remember", re: /\bremember\b/i },
  { label: "brings us to", re: /\bbrings\s+us\s+(?:right\s+back\s+to|back\s+to|to)\b/i },
  { label: "callback return", re: /\b(?:bring\s+all\s+of\s+this\s+back\s+to|come\s+back\s+to|keep\s+[a-z0-9']+\s+(?:house\s+)?in\s+mind)\b/i },
  { label: "escape hatch plant", re: /\b(?:escape\s+hatch\s+number|more\s+on\s+that|hold\s+that\s+thought)\b/i }
];

const VIEWER_STAKE_PATTERNS = [
  { label: "your rent/mortgage", re: /\byour\s+(?:[a-z0-9-]+\s+){0,2}(?:rent|mortgage|landlord|lease|house|home|property\s+tax(?:es)?|escrow)\b/i },
  { label: "your paycheck/labor", re: /\byour\s+(?:[a-z0-9-]+\s+){0,2}(?:paycheck|pay|labor|income|wages?|career|job|bargaining\s+power)\b/i },
  { label: "your bank/savings", re: /\byour\s+(?:[a-z0-9-]+\s+){0,2}(?:bank(?:'s)?|checking|account|savings|401\(k\)|retirement|wallet|credit)\b/i },
  { label: "your bill/phone", re: /\byour\s+(?:[a-z0-9-]+\s+){0,2}(?:bills?|electric\s+bill|utility\s+bill|phone\s+screen|monthly\s+compute)\b/i },
  { label: "personal debt lock", re: /\blocking\s+yourself\s+into\s+(?:[a-z0-9-]+\s+){0,3}debt\b/i }
];

const NUMERIC_SHOCK_PATTERNS = [
  { label: "$ currency", re: /\$\d[\d,.]*/ },
  { label: "% symbol", re: /\b\d+(?:\.\d+)?%/ },
  {
    label: "spoken percent/fraction",
    re: /\b(?:\d+(?:\.\d+)?|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(?:-[a-z]+)*)\s+percent\b|\b(?:two-thirds|three-quarters|one-third|one-fifth|four-fifths)\b/i
  },
  {
    label: "scale shock unit",
    re: /\b(?:trillions?|trillion-dollar|billions?|billion-dollar|gigawatts?|terawatt-hours?|megawatt-days?|megawatts?)\b/i
  }
];

const COLD_OPEN_NUMBER_RE =
  /\$\d[\d,.]*|\b\d+(?:\.\d+)?%|\b(?:two-thirds|three-quarters|one-third|one-half)\b|\b(?:\d+(?:\.\d+)?|(?:one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(?:-[a-z]+)*)\s+(?:percent|trillion|billion|million|gigawatts?|terawatt-hours?|megawatts?|dollars?)\b/i;

const COLD_OPEN_STAKE_RE =
  /\b(?:paychecks?|rent|mortgages?|tax\s+dollars?|taxpayers?|national\s+debt|treasury|us\s+government|banks?|checking|savings|401\(k\)|electric\s+bills?|utility\s+bills?|wages?|wire\s+fraud|pensions?|insurance|households?|loans?)\b/i;

const MID_VIDEO_NAG_PATTERNS = [
  { label: "like and subscribe", re: /\blike\s+and\s+subscribe\b/i },
  { label: "smash/hit like", re: /\b(?:smash|hit|tap)\s+(?:that\s+|the\s+)?like\s+button\b/i },
  { label: "subscribe nag", re: /\b(?:hit\s+subscribe|subscribe\s+to\s+(?:the|our|my)\s+channel|don't\s+forget\s+to\s+subscribe|make\s+sure\s+(?:you\s+|to\s+)?subscribe)\b/i },
  { label: "bell nag", re: /\b(?:hit\s+the\s+bell|notification\s+bell|turn\s+on\s+notifications)\b/i },
  { label: "generic comment beg", re: /\b(?:let\s+me\s+know\s+(?:your\s+thoughts\s+)?in\s+the\s+comments|drop\s+a\s+comment\s+below|leave\s+a\s+comment\s+down\s+below)\b/i }
];

const CLOSING_BRIDGE_PATTERNS = [
  { label: "next-video bridge", re: /\b(?:stick\s+around\s+for\s+the\s+next\s+video|see\s+you\s+in\s+the\s+next\s+(?:video|briefing|one)|watch\s+(?:this|the)\s+next\s+video|next\s+video\s+on\s+screen|in\s+the\s+next\s+(?:video|briefing))\b/i },
  { label: "related-short bridge", re: /\b(?:full\s+(?:breakdown|audit|investigation|video)\s+(?:is\s+)?linked\s+below|tap\s+the\s+related\s+video|full\s+ledger\s+is\s+linked)\b/i },
  { label: "civic/share/dossier bridge", re: /\b(?:send\s+(?:them\s+)?this\s+video|dossier\s+link\s+in\s+the\s+description|subscribe\s+if\s+you\s+want)\b/i }
];

const WRAPUP_CLICHE_PATTERNS = [
  { label: "in conclusion", re: /\bin\s+conclusion\b/i },
  { label: "in summary / to summarize", re: /\b(?:in\s+summary|to\s+summarize|to\s+sum\s+up|to\s+wrap\s+(?:things\s+)?up)\b/i },
  { label: "thanks for watching guys", re: /\bthanks\s+so\s+much\s+for\s+watching\s+guys\b/i }
];

const ADVERSARIAL_CONCESSION_PATTERNS = [
  /\b(?:let's\s+be\s+fair|give\s+[a-z\s]+\s+credit|if\s+an\s+economist(?:'s|\s+is)\s+watching|wall\s+street\s+optimists|jump\s+in\s+with\s+a\s+fair\s+question|will\s+obviously\s+push|fair\s+counterargument|to\s+steelman)\b/i
];

export function formatTimestamp(totalSeconds) {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function stripFrontmatter(rawText) {
  if (!rawText.startsWith("---")) return rawText;
  const match = rawText.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? rawText.slice(match[0].length) : rawText;
}

function cleanSurfaceToken(rawToken) {
  return rawToken
    .replace(/^\*\*+|\*\*+$/g, "")
    .replace(/^\*+|\*+$/g, "")
    .replace(/^_+|_+$/g, "")
    .replace(/^`+|`+$/g, "");
}

/**
 * Parses a script into spoken words while stripping bracketed [STAGE CUES]
 * from word counts and anchoring [ON SCREEN ...] cues to spoken word offsets.
 */
export function tokenizeSpokenScript(rawText, options = {}) {
  const wpm = Number(options.wpm) > 0 ? Number(options.wpm) : 150;
  const withoutFrontmatter = stripFrontmatter(String(rawText || ""));
  const rawLines = withoutFrontmatter.split(/\r?\n/);

  const contentLines = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (/^#{1,6}\s+/.test(trimmed)) {
      contentLines.push("");
      continue;
    }
    contentLines.push(line);
  }

  const normalizedBody = contentLines.join("\n");
  const rawParagraphs = normalizedBody
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const words = [];
  const stageCueEvents = [];
  const paragraphs = [];

  for (let pIdx = 0; pIdx < rawParagraphs.length; pIdx++) {
    const paraText = rawParagraphs[pIdx];
    const paraStartWord = words.length + 1;

    const bracketRegex = /\[[^\]]+\]/g;
    let lastPos = 0;
    let match;

    const processSpokenSegment = (segmentText) => {
      const pieces = segmentText
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      for (const piece of pieces) {
        const surface = cleanSurfaceToken(piece);
        if (!surface) continue;
        const wordIndex = words.length + 1;
        words.push({
          index: wordIndex,
          raw: piece,
          surface,
          lower: surface.toLowerCase(),
          paragraphIndex: pIdx + 1,
          timeSec: ((wordIndex - 1) / wpm) * 60
        });
      }
    };

    while ((match = bracketRegex.exec(paraText)) !== null) {
      if (match.index > lastPos) {
        processSpokenSegment(paraText.slice(lastPos, match.index));
      }
      const cueToken = match[0].trim();
      const anchorWord = Math.max(1, words.length);
      if (VISUAL_STAGE_CUE_RE.test(cueToken)) {
        stageCueEvents.push({
          type: "visual_stage_cue",
          anchorWordIndex: words.length === 0 ? 1 : anchorWord,
          rawCue: cueToken,
          paragraphIndex: pIdx + 1
        });
      } else if (GENERIC_STAGE_CUE_RE.test(cueToken)) {
        stageCueEvents.push({
          type: "generic_stage_cue",
          anchorWordIndex: words.length === 0 ? 1 : anchorWord,
          rawCue: cueToken,
          paragraphIndex: pIdx + 1
        });
      } else {
        // Inline non-stage bracketed text (e.g. editorial clarification) counts as spoken
        processSpokenSegment(cueToken.slice(1, -1));
      }
      lastPos = match.index + match[0].length;
    }

    if (lastPos < paraText.length) {
      processSpokenSegment(paraText.slice(lastPos));
    }

    const paraEndWord = words.length;
    if (paraEndWord >= paraStartWord) {
      const spokenText = words
        .slice(paraStartWord - 1, paraEndWord)
        .map((w) => w.surface)
        .join(" ");
      paragraphs.push({
        paragraphIndex: pIdx + 1,
        startWord: paraStartWord,
        endWord: paraEndWord,
        wordCount: paraEndWord - paraStartWord + 1,
        spokenText
      });
    }
  }

  return {
    wpm,
    totalWords: words.length,
    estimatedSeconds: (words.length / wpm) * 60,
    estimatedMinutes: Number((words.length / wpm).toFixed(2)),
    estimatedFormatted: formatTimestamp((words.length / wpm) * 60),
    words,
    paragraphs,
    stageCueEvents
  };
}

function quoteWordWindow(words, startWord, endWord, maxWords = 22) {
  if (words.length === 0) return "";
  const s = Math.max(1, startWord);
  const e = Math.min(words.length, endWord);
  const slice = words.slice(s - 1, Math.min(e, s - 1 + maxWords)).map((w) => w.surface);
  const suffix = e - s + 1 > maxWords ? " ..." : "";
  return `${slice.join(" ")}${suffix}`;
}

function findPatternMatchesInParagraphs(parsed, patternList, category) {
  const hits = [];
  for (const para of parsed.paragraphs) {
    const paraWords = parsed.words.slice(para.startWord - 1, para.endWord);
    // Build character-to-word-index map within paragraph spokenText
    const charStarts = [];
    let cursor = 0;
    for (const w of paraWords) {
      charStarts.push({ charPos: cursor, wordIndex: w.index });
      cursor += w.surface.length + 1;
    }

    const mapCharToWord = (charIdx) => {
      let chosen = para.startWord;
      for (const entry of charStarts) {
        if (entry.charPos <= charIdx) chosen = entry.wordIndex;
        else break;
      }
      return chosen;
    };

    for (const pat of patternList) {
      const flags = pat.re.flags.includes("g") ? pat.re.flags : `${pat.re.flags}g`;
      const globalRe = new RegExp(pat.re.source, flags);
      let m;
      while ((m = globalRe.exec(para.spokenText)) !== null) {
        const wordIndex = mapCharToWord(m.index);
        hits.push({
          wordIndex,
          category,
          label: pat.label,
          matchedText: m[0],
          paragraphIndex: para.paragraphIndex
        });
      }
    }
  }
  return hits;
}

/**
 * Collects all retention reset events across Categories (a), (b), (c), and (d).
 */
export function collectRetentionResets(parsed) {
  const rawHits = [];

  // Category (a): Stage visual cues [ON SCREEN ...] + spoken visual/document cues
  for (const cue of parsed.stageCueEvents) {
    if (cue.type === "visual_stage_cue" && parsed.totalWords > 0) {
      const clampedWord = Math.min(parsed.totalWords, Math.max(1, cue.anchorWordIndex));
      rawHits.push({
        wordIndex: clampedWord,
        category: "visual_cue",
        label: "[ON SCREEN]",
        matchedText: cue.rawCue,
        paragraphIndex: cue.paragraphIndex
      });
    }
  }
  rawHits.push(...findPatternMatchesInParagraphs(parsed, VISUAL_SPOKEN_PATTERNS, "visual_cue"));

  // Category (b): Open loops and callbacks
  rawHits.push(...findPatternMatchesInParagraphs(parsed, OPEN_LOOP_PATTERNS, "open_loop_callback"));

  // Category (c): Direct viewer stakes and spoken questions (?)
  for (const w of parsed.words) {
    if (w.surface.includes("?")) {
      rawHits.push({
        wordIndex: w.index,
        category: "viewer_stake_question",
        label: "question (?)",
        matchedText: w.surface,
        paragraphIndex: w.paragraphIndex
      });
    }
  }
  rawHits.push(...findPatternMatchesInParagraphs(parsed, VIEWER_STAKE_PATTERNS, "viewer_stake_question"));

  // Category (d): Concrete numeric shocks
  rawHits.push(...findPatternMatchesInParagraphs(parsed, NUMERIC_SHOCK_PATTERNS, "numeric_shock"));

  // Deduplicate identical (wordIndex, category) pairs and sort by wordIndex
  const seen = new Set();
  const deduped = [];
  for (const h of rawHits) {
    const key = `${h.wordIndex}::${h.category}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const wordObj = parsed.words[h.wordIndex - 1];
    deduped.push({
      ...h,
      timeSec: wordObj ? Number(wordObj.timeSec.toFixed(1)) : 0,
      timestamp: formatTimestamp(wordObj ? wordObj.timeSec : 0),
      frac: parsed.totalWords > 0 ? Number((h.wordIndex / parsed.totalWords).toFixed(4)) : 0
    });
  }

  deduped.sort((a, b) => a.wordIndex - b.wordIndex || a.category.localeCompare(b.category));
  return deduped;
}

/**
 * Gate 1: 220-Word Dry-Stretch Scanner (75w in vertical mode).
 * Any stretch of > maxDryWords consecutive spoken words without a single reset fails P0.
 */
function auditDryStretches(parsed, resets, profile) {
  const N = parsed.totalWords;
  if (N === 0) {
    return {
      maxDryWordsAllowed: profile.maxDryWords,
      maxObservedDryWords: 0,
      violations: [],
      topStretches: []
    };
  }

  const resetWordIndices = Array.from(new Set(resets.map((r) => r.wordIndex))).sort((a, b) => a - b);
  const stretches = [];

  const recordSpan = (startWord, endWord, prevResetLabel, nextResetLabel) => {
    if (endWord < startWord) return;
    const dryWords = endWord - startWord + 1;
    const startSec = parsed.words[startWord - 1].timeSec;
    const endSec = parsed.words[endWord - 1].timeSec;
    stretches.push({
      startWord,
      endWord,
      dryWords,
      startTimestamp: formatTimestamp(startSec),
      endTimestamp: formatTimestamp(endSec),
      boundedBy: `${prevResetLabel} -> ${nextResetLabel}`,
      excerpt: quoteWordWindow(parsed.words, startWord, endWord, 20)
    });
  };

  if (resetWordIndices.length === 0) {
    recordSpan(1, N, "START", "END");
  } else {
    recordSpan(1, resetWordIndices[0] - 1, "START", `w${resetWordIndices[0]}`);
    for (let i = 0; i < resetWordIndices.length - 1; i++) {
      recordSpan(
        resetWordIndices[i] + 1,
        resetWordIndices[i + 1] - 1,
        `w${resetWordIndices[i]}`,
        `w${resetWordIndices[i + 1]}`
      );
    }
    recordSpan(resetWordIndices[resetWordIndices.length - 1] + 1, N, `w${resetWordIndices.at(-1)}`, "END");
  }

  const sortedByLength = [...stretches].sort((a, b) => b.dryWords - a.dryWords);
  const violations = sortedByLength.filter((s) => s.dryWords > profile.maxDryWords);
  const maxObservedDryWords = sortedByLength.length > 0 ? sortedByLength[0].dryWords : 0;

  return {
    maxDryWordsAllowed: profile.maxDryWords,
    maxObservedDryWords,
    violations,
    topStretches: sortedByLength.slice(0, 5)
  };
}

/**
 * Gate 2: First-15-Second Cold-Open Clock (<= 50 words to concrete number + stake, 0 throat-clearing).
 */
function auditColdOpenClock(parsed, profile) {
  const openLimit = Math.min(parsed.totalWords, profile.maxColdOpenWords);
  const throatScanLimit = Math.min(parsed.totalWords, profile.throatClearingScanWords);

  const openingWords = parsed.words.slice(0, openLimit);
  const throatScanText = parsed.words
    .slice(0, throatScanLimit)
    .map((w) => w.surface)
    .join(" ");

  const throatClearingHits = [];
  for (const pat of THROAT_CLEARING_PATTERNS) {
    const m = throatScanText.match(pat.re);
    if (m) {
      throatClearingHits.push({ id: pat.id, matchedText: m[0] });
    }
  }

  let firstNumberWord = null;
  let firstNumberToken = null;
  let firstStakeWord = null;
  let firstStakeToken = null;

  // Scan sliding small n-grams across the opening words to locate exact word index
  for (let i = 0; i < openingWords.length; i++) {
    const trigram = openingWords
      .slice(i, Math.min(openingWords.length, i + 3))
      .map((w) => w.surface)
      .join(" ");

    if (firstNumberWord === null) {
      const nm = trigram.match(COLD_OPEN_NUMBER_RE);
      if (nm && nm.index === 0) {
        const spanWords = nm[0].trim().split(/\s+/).length;
        firstNumberWord = openingWords[Math.min(openingWords.length - 1, i + spanWords - 1)].index;
        firstNumberToken = nm[0];
      }
    }

    if (firstStakeWord === null) {
      const sm = trigram.match(COLD_OPEN_STAKE_RE);
      if (sm && sm.index === 0) {
        const spanWords = sm[0].trim().split(/\s+/).length;
        firstStakeWord = openingWords[Math.min(openingWords.length - 1, i + spanWords - 1)].index;
        firstStakeToken = sm[0];
      }
    }
  }

  const bothLandedInWindow = firstNumberWord !== null && firstStakeWord !== null;
  const combinedLockWord = bothLandedInWindow ? Math.max(firstNumberWord, firstStakeWord) : null;
  const combinedLockSeconds =
    combinedLockWord !== null ? Number(((combinedLockWord / parsed.wpm) * 60).toFixed(1)) : null;

  return {
    maxColdOpenWords: profile.maxColdOpenWords,
    firstNumberWord,
    firstNumberToken,
    firstStakeWord,
    firstStakeToken,
    combinedLockWord,
    combinedLockSeconds,
    throatClearingHits,
    passedStakeClock: bothLandedInWindow && combinedLockWord <= profile.maxColdOpenWords,
    passedZeroThroatClearing: throatClearingHits.length === 0,
    openingExcerpt: quoteWordWindow(parsed.words, 1, openLimit, 25)
  };
}

/**
 * Gate 3: 10-Decile Re-Hook Density Audit (D1..D10) & Adversarial Steelman Tracking.
 */
function auditDecileDensity(parsed, resets, profile) {
  const N = parsed.totalWords;
  const concessions = findPatternMatchesInParagraphs(
    parsed,
    ADVERSARIAL_CONCESSION_PATTERNS.map((re) => ({ label: "steelman_concession", re })),
    "steelman_concession"
  ).map((c) => ({
    ...c,
    frac: N > 0 ? Number((c.wordIndex / N).toFixed(4)) : 0,
    timestamp: formatTimestamp(parsed.words[c.wordIndex - 1]?.timeSec || 0)
  }));

  const deciles = [];
  for (let d = 1; d <= 10; d++) {
    const startIdx = N === 0 ? 0 : Math.floor(((d - 1) * N) / 10) + 1;
    const endIdx = N === 0 ? 0 : Math.floor((d * N) / 10);
    const wordCount = N === 0 || endIdx < startIdx ? 0 : endIdx - startIdx + 1;
    const startSec = wordCount > 0 ? parsed.words[startIdx - 1].timeSec : 0;
    const endSec = wordCount > 0 ? parsed.words[endIdx - 1].timeSec : 0;

    const decileResets = resets.filter((r) => r.wordIndex >= startIdx && r.wordIndex <= endIdx);
    const decileConcessions = concessions.filter((c) => c.wordIndex >= startIdx && c.wordIndex <= endIdx);

    const byCategory = {
      visual_cue: decileResets.filter((r) => r.category === "visual_cue").length,
      open_loop_callback: decileResets.filter((r) => r.category === "open_loop_callback").length,
      viewer_stake_question: decileResets.filter((r) => r.category === "viewer_stake_question").length,
      numeric_shock: decileResets.filter((r) => r.category === "numeric_shock").length,
      steelman_concession: decileConcessions.length
    };

    const totalDevices = decileResets.length + decileConcessions.length;
    deciles.push({
      decile: `D${d}`,
      decileNumber: d,
      startWord: startIdx,
      endWord: endIdx,
      wordCount,
      timeRange: `${formatTimestamp(startSec)}-${formatTimestamp(endSec)}`,
      totalResets: decileResets.length,
      totalDevices,
      active: totalDevices > 0,
      byCategory
    });
  }

  const activeDecileCount = deciles.filter((d) => d.active).length;
  const emptyDeciles = deciles.filter((d) => !d.active).map((d) => d.decile);
  const thinAdvisoryDeciles = deciles
    .filter((d) => d.active && d.totalDevices < profile.advisoryMinResetsPerDecile)
    .map((d) => d.decile);

  let maxEmptyStreak = 0;
  let currentEmptyStreak = 0;
  for (let i = 0; i < deciles.length; i++) {
    if (!deciles[i].active) {
      currentEmptyStreak += 1;
      if (currentEmptyStreak > maxEmptyStreak) maxEmptyStreak = currentEmptyStreak;
    } else {
      currentEmptyStreak = 0;
    }
  }

  const passedDecileGate =
    activeDecileCount >= profile.minActiveDeciles &&
    maxEmptyStreak <= profile.maxConsecutiveEmptyDeciles;

  return {
    activeDecileCount,
    minActiveRequired: profile.minActiveDeciles,
    emptyDeciles,
    thinAdvisoryDeciles,
    passedDecileGate,
    concessions,
    deciles
  };
}

/**
 * Gate 4: Mid-Video Subscribe-Nag Ban (0.00-0.90) & Final-Window Closing Bridge Check (0.90-1.00).
 */
function auditCtaAndClosingWindow(parsed, profile) {
  const N = parsed.totalWords;
  const allNagHits = findPatternMatchesInParagraphs(parsed, MID_VIDEO_NAG_PATTERNS, "subscribe_nag").map(
    (h) => ({
      ...h,
      frac: N > 0 ? Number((h.wordIndex / N).toFixed(4)) : 0,
      timestamp: formatTimestamp(parsed.words[h.wordIndex - 1]?.timeSec || 0),
      excerpt: quoteWordWindow(parsed.words, Math.max(1, h.wordIndex - 4), h.wordIndex + 10, 16)
    })
  );

  const midVideoNags = allNagHits.filter((h) => h.frac < profile.midNagCeilingFrac);
  const finalWindowStartWord = N > 0 ? Math.max(1, Math.floor(N * profile.midNagCeilingFrac) + 1) : 1;

  const bridgeHits = findPatternMatchesInParagraphs(
    parsed,
    CLOSING_BRIDGE_PATTERNS,
    "closing_bridge"
  )
    .filter((h) => h.wordIndex >= finalWindowStartWord)
    .map((h) => ({
      ...h,
      frac: N > 0 ? Number((h.wordIndex / N).toFixed(4)) : 0,
      timestamp: formatTimestamp(parsed.words[h.wordIndex - 1]?.timeSec || 0),
      excerpt: quoteWordWindow(parsed.words, Math.max(1, h.wordIndex - 6), h.wordIndex + 10, 18)
    }));

  const wrapupCliches = findPatternMatchesInParagraphs(
    parsed,
    WRAPUP_CLICHE_PATTERNS,
    "wrapup_cliche"
  )
    .filter((h) => h.wordIndex >= finalWindowStartWord)
    .map((h) => ({
      ...h,
      frac: N > 0 ? Number((h.wordIndex / N).toFixed(4)) : 0,
      timestamp: formatTimestamp(parsed.words[h.wordIndex - 1]?.timeSec || 0),
      excerpt: quoteWordWindow(parsed.words, Math.max(1, h.wordIndex - 3), h.wordIndex + 10, 15)
    }));

  const finalWindowHypeNags = allNagHits.filter((h) => h.frac >= profile.midNagCeilingFrac);

  const hasValidSingleBridge = profile.requireClosingBridge
    ? bridgeHits.length >= 1 &&
      bridgeHits.length <= profile.maxClosingBridges &&
      finalWindowHypeNags.length === 0
    : true;

  return {
    midNagCeilingFrac: profile.midNagCeilingFrac,
    midVideoNags,
    finalWindowBridges: bridgeHits,
    finalWindowHypeNags,
    wrapupCliches,
    passedMidVideoNagBan: midVideoNags.length === 0,
    passedClosingBridge: hasValidSingleBridge && wrapupCliches.length === 0
  };
}

/**
 * Master audit entry point for a spoken script string.
 */
export function auditScriptRetention(rawText, options = {}) {
  const modeName = options.mode === "vertical" ? "vertical" : "longform";
  const baseProfile = MODE_PROFILES[modeName];
  const profile = {
    ...baseProfile,
    wpm: Number(options.wpm) > 0 ? Number(options.wpm) : baseProfile.defaultWpm,
    maxDryWords:
      Number(options.maxDryWords) > 0 ? Number(options.maxDryWords) : baseProfile.maxDryWords
  };

  const parsed = tokenizeSpokenScript(rawText, { wpm: profile.wpm });
  const resets = collectRetentionResets(parsed);

  const dryStretchAudit = auditDryStretches(parsed, resets, profile);
  const coldOpenAudit = auditColdOpenClock(parsed, profile);
  const decileAudit = auditDecileDensity(parsed, resets, profile);
  const ctaAudit = auditCtaAndClosingWindow(parsed, profile);

  const flags = [];

  if (parsed.totalWords < 30) {
    flags.push({
      severity: "P0",
      code: "SCRIPT_TOO_SHORT",
      location: "w1",
      message: `Script contains only ${parsed.totalWords} spoken words (minimum 30 required for audit).`,
      excerpt: quoteWordWindow(parsed.words, 1, parsed.totalWords, 15)
    });
  }

  for (const v of dryStretchAudit.violations) {
    flags.push({
      severity: "P0",
      code: "DRY_STRETCH_EXCEEDED",
      location: `w${v.startWord}-w${v.endWord} (${v.startTimestamp}-${v.endTimestamp})`,
      message: `${v.dryWords} consecutive spoken words lack a visual cue, open loop, viewer stake, or numeric shock (limit: ${profile.maxDryWords}w).`,
      excerpt: v.excerpt
    });
  }

  if (!coldOpenAudit.passedZeroThroatClearing) {
    for (const hit of coldOpenAudit.throatClearingHits) {
      flags.push({
        severity: "P0",
        code: "COLD_OPEN_THROAT_CLEARING",
        location: `opening ${profile.throatClearingScanWords}w`,
        message: `Banned throat-clearing phrase "${hit.matchedText}" inside cold open.`,
        excerpt: coldOpenAudit.openingExcerpt
      });
    }
  }

  if (!coldOpenAudit.passedStakeClock) {
    flags.push({
      severity: "P0",
      code: "COLD_OPEN_LATE_STAKE",
      location: `w1-w${profile.maxColdOpenWords}`,
      message: `Concrete number (${coldOpenAudit.firstNumberWord ?? "missing"}) + viewer/system stake (${coldOpenAudit.firstStakeWord ?? "missing"}) must both land within <= ${profile.maxColdOpenWords} spoken words.`,
      excerpt: coldOpenAudit.openingExcerpt
    });
  }

  if (!decileAudit.passedDecileGate) {
    flags.push({
      severity: "P0",
      code: "EMPTY_DECILE_REHOOK",
      location: decileAudit.emptyDeciles.join(", "),
      message: `Active re-hook devices missing in decile(s): ${decileAudit.emptyDeciles.join(", ")} (active ${decileAudit.activeDecileCount}/10, required >= ${profile.minActiveDeciles}/10).`,
      excerpt: ""
    });
  } else if (decileAudit.thinAdvisoryDeciles.length > 0) {
    flags.push({
      severity: "P1",
      code: "THIN_DECILE_DENSITY",
      location: decileAudit.thinAdvisoryDeciles.join(", "),
      message: `Decile(s) ${decileAudit.thinAdvisoryDeciles.join(", ")} contain fewer than ${profile.advisoryMinResetsPerDecile} retention devices.`,
      excerpt: ""
    });
  }

  for (const nag of ctaAudit.midVideoNags) {
    flags.push({
      severity: "P0",
      code: "MID_VIDEO_SUBSCRIBE_NAG",
      location: `w${nag.wordIndex} (${nag.timestamp}, frac ${nag.frac})`,
      message: `Banned mid-video engagement nag "${nag.matchedText}" before ${profile.midNagCeilingFrac.toFixed(2)} runtime mark.`,
      excerpt: nag.excerpt
    });
  }

  for (const cliche of ctaAudit.wrapupCliches) {
    flags.push({
      severity: "P0",
      code: "TELEGRAPHED_WRAPUP_CLICHE",
      location: `w${cliche.wordIndex} (${cliche.timestamp}, frac ${cliche.frac})`,
      message: `Telegraphed wrap-up phrase "${cliche.matchedText}" triggers final-window viewer drop-off.`,
      excerpt: cliche.excerpt
    });
  }

  if (ctaAudit.finalWindowHypeNags.length > 0) {
    const h = ctaAudit.finalWindowHypeNags[0];
    flags.push({
      severity: "P0",
      code: "HYPE_SUBSCRIBE_CTA",
      location: `w${h.wordIndex} (${h.timestamp}, frac ${h.frac})`,
      message: `YouTuber hype CTA "${h.matchedText}" breaks Reading Room restraint in final window.`,
      excerpt: h.excerpt
    });
  } else if (profile.requireClosingBridge && ctaAudit.finalWindowBridges.length === 0) {
    flags.push({
      severity: "P0",
      code: "MISSING_CLOSING_BRIDGE",
      location: `final 10% (frac >= ${profile.midNagCeilingFrac.toFixed(2)})`,
      message: "Final 10% lacks a clean closing bridge into the next briefing or related video.",
      excerpt: quoteWordWindow(parsed.words, Math.max(1, parsed.totalWords - 30), parsed.totalWords, 25)
    });
  } else if (ctaAudit.finalWindowBridges.length > profile.maxClosingBridges) {
    flags.push({
      severity: "P1",
      code: "STACKED_CLOSING_CTAS",
      location: `final 10%`,
      message: `Found ${ctaAudit.finalWindowBridges.length} closing bridge asks (cap: ${profile.maxClosingBridges}).`,
      excerpt: ctaAudit.finalWindowBridges.map((b) => b.matchedText).join(" | ")
    });
  }

  const p0Count = flags.filter((f) => f.severity === "P0").length;
  const p1Count = flags.filter((f) => f.severity === "P1").length;
  const score = Math.max(0, 100 - p0Count * 25 - p1Count * 5);

  const categoryTotals = {
    visual_cue: resets.filter((r) => r.category === "visual_cue").length,
    open_loop_callback: resets.filter((r) => r.category === "open_loop_callback").length,
    viewer_stake_question: resets.filter((r) => r.category === "viewer_stake_question").length,
    numeric_shock: resets.filter((r) => r.category === "numeric_shock").length,
    steelman_concession: decileAudit.concessions.length
  };

  const devicesPer1kWords =
    parsed.totalWords > 0
      ? Number(((resets.length / parsed.totalWords) * 1000).toFixed(2))
      : 0;

  return {
    tool: "retention_linter",
    version: "1.0.0",
    file: options.fileLabel || "(inline)",
    mode: profile.mode,
    status: p0Count === 0 ? "PASS" : "FAIL",
    score,
    summary: {
      spoken_words: parsed.totalWords,
      paragraph_count: parsed.paragraphs.length,
      stripped_stage_cues: parsed.stageCueEvents.length,
      wpm: profile.wpm,
      estimated_runtime_mmss: parsed.estimatedFormatted,
      estimated_runtime_minutes: parsed.estimatedMinutes,
      total_retention_resets: resets.length,
      resets_per_1k_words: devicesPer1kWords,
      category_totals: categoryTotals,
      p0_violations: p0Count,
      p1_warnings: p1Count
    },
    gates: {
      cold_open_clock: coldOpenAudit,
      dry_stretch_scanner: dryStretchAudit,
      decile_rehook_density: decileAudit,
      cta_and_closing_window: ctaAudit
    },
    flags
  };
}

function formatHumanReport(report) {
  const lines = [];
  const s = report.summary;
  const co = report.gates.cold_open_clock;
  const ds = report.gates.dry_stretch_scanner;
  const dd = report.gates.decile_rehook_density;
  const cta = report.gates.cta_and_closing_window;

  lines.push("==============================================================================");
  lines.push(`THE READING ROOM - RETENTION & PACING AUDITOR (${report.status} | Score: ${report.score}/100)`);
  lines.push("==============================================================================");
  lines.push(`File:               ${report.file}`);
  lines.push(`Mode:               ${report.mode} (${s.wpm} wpm baseline)`);
  lines.push(`Spoken Words:       ${s.spoken_words} words (${s.paragraph_count} paragraphs, ${s.stripped_stage_cues} stage cues stripped)`);
  lines.push(`Estimated Runtime:  ${s.estimated_runtime_mmss} (${s.estimated_runtime_minutes} min @ ${s.wpm} wpm)`);
  lines.push(`Retention Resets:   ${s.total_retention_resets} total (${s.resets_per_1k_words} per 1,000 words)`);
  lines.push(
    `  [a] Visual/Doc: ${s.category_totals.visual_cue} | [b] Loops/Callbacks: ${s.category_totals.open_loop_callback} | [c] Stakes/?: ${s.category_totals.viewer_stake_question} | [d] Numeric: ${s.category_totals.numeric_shock} | Steelman: ${s.category_totals.steelman_concession}`
  );
  lines.push("------------------------------------------------------------------------------");
  lines.push("GATE 1 - DRY-STRETCH SCANNER:");
  lines.push(
    `  Max Dry Stretch:  ${ds.maxObservedDryWords} words (Hard Ceiling: <= ${ds.maxDryWordsAllowed} words) -> ${ds.violations.length === 0 ? "PASS" : `FAIL (${ds.violations.length} stretches)`}`
  );
  if (ds.topStretches.length > 0) {
    const top = ds.topStretches[0];
    lines.push(
      `  Longest Span:     w${top.startWord}-w${top.endWord} (${top.startTimestamp}-${top.endTimestamp}, ${top.dryWords}w)`
    );
  }

  lines.push("GATE 2 - FIRST-15-SECOND COLD-OPEN CLOCK:");
  lines.push(
    `  First Number:     word #${co.firstNumberWord ?? "N/A"} (${co.firstNumberToken ?? "missing"})`
  );
  lines.push(
    `  First Stake:      word #${co.firstStakeWord ?? "N/A"} (${co.firstStakeToken ?? "missing"})`
  );
  lines.push(
    `  Combined Lock:    word #${co.combinedLockWord ?? "N/A"} (${co.combinedLockSeconds ?? "N/A"}s, limit <= ${co.maxColdOpenWords}w) | Throat-Clearing: ${co.throatClearingHits.length} -> ${co.passedStakeClock && co.passedZeroThroatClearing ? "PASS" : "FAIL"}`
  );

  lines.push("GATE 3 - 10-DECILE RE-HOOK DENSITY:");
  lines.push(
    `  Active Deciles:   ${dd.activeDecileCount}/10 (Required: >= ${dd.minActiveRequired}/10) -> ${dd.passedDecileGate ? "PASS" : "FAIL"}`
  );
  for (const d of dd.deciles) {
    const c = d.byCategory;
    lines.push(
      `    ${d.decile.padEnd(3)} [${d.timeRange}] (${String(d.wordCount).padStart(3)}w): ${String(d.totalDevices).padStart(2)} devices (vis:${c.visual_cue} loop:${c.open_loop_callback} stake:${c.viewer_stake_question} num:${c.numeric_shock} steel:${c.steelman_concession})`
    );
  }

  lines.push("GATE 4 - MID-VIDEO SUBSCRIBE BAN & CLOSING BRIDGE:");
  lines.push(
    `  Mid-Video Nags (0.00-${cta.midNagCeilingFrac.toFixed(2)}): ${cta.midVideoNags.length} | Wrap-Up Cliches: ${cta.wrapupCliches.length} | Final Bridges: ${cta.finalWindowBridges.length} -> ${cta.passedMidVideoNagBan && cta.passedClosingBridge ? "PASS" : "FAIL"}`
  );

  if (report.flags.length > 0) {
    lines.push("------------------------------------------------------------------------------");
    lines.push(`FLAGS (${s.p0_violations} P0, ${s.p1_warnings} P1):`);
    for (const f of report.flags) {
      lines.push(`  [${f.severity}] ${f.code} @ ${f.location}: ${f.message}`);
      if (f.excerpt) lines.push(`       Excerpt: "${f.excerpt}"`);
    }
  }
  lines.push("==============================================================================\n");
  return lines.join("\n");
}

/**
 * Deterministic self-test suite verifying positive and negative cases across all four gates.
 */
export function runSelfTests() {
  const results = [];
  const check = (name, fn) => {
    try {
      const detail = fn();
      results.push({ name, passed: true, detail });
    } catch (err) {
      results.push({ name, passed: false, detail: err.message });
    }
  };

  // Test 1: Canonical Episode 01 script passes with 0 dry-stretch violations
  check("ep01_canonical_script_passes_all_gates", () => {
    if (!fs.existsSync(DEFAULT_SCRIPT_PATH)) {
      throw new Error(`Missing Episode 01 script at ${DEFAULT_SCRIPT_PATH}`);
    }
    const ep01Raw = fs.readFileSync(DEFAULT_SCRIPT_PATH, "utf8");
    const rep = auditScriptRetention(ep01Raw, {
      mode: "longform",
      fileLabel: "04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md"
    });
    if (rep.status !== "PASS") {
      throw new Error(`Expected PASS on Ep 01, got FAIL: ${JSON.stringify(rep.flags)}`);
    }
    if (rep.gates.dry_stretch_scanner.violations.length !== 0) {
      throw new Error("Expected 0 >220w dry stretches on Ep 01");
    }
    if (rep.gates.decile_rehook_density.activeDecileCount !== 10) {
      throw new Error(`Expected 10/10 active deciles, got ${rep.gates.decile_rehook_density.activeDecileCount}`);
    }
    return `words=${rep.summary.spoken_words}, maxDry=${rep.gates.dry_stretch_scanner.maxObservedDryWords}w, hookLock=w${rep.gates.cold_open_clock.combinedLockWord}`;
  });

  // Test 2: Bracketed [STAGE CUES] stripped from spoken count while [ON SCREEN] resets dry window
  check("stage_cue_stripping_and_on_screen_reset", () => {
    const filler130 = Array(130).fill("institutional").join(" ");
    const script = [
      "Over 84% of federal tax collections come straight out of your paycheck every Friday.",
      "[STAGE CUE: Slow camera creep 104%]",
      filler130,
      "[ON SCREEN: Treasury Monthly Statement Table 9]",
      filler130,
      "Look at the chart and remember this when we get to next month, so stick around for the next video."
    ].join("\n\n");
    const rep = auditScriptRetention(script, { mode: "longform" });
    if (rep.summary.stripped_stage_cues !== 2) {
      throw new Error(`Expected 2 stripped stage cues, got ${rep.summary.stripped_stage_cues}`);
    }
    if (rep.gates.dry_stretch_scanner.violations.length !== 0) {
      throw new Error("[ON SCREEN] cue failed to reset the 260-word stretch");
    }
    return `strippedCues=${rep.summary.stripped_stage_cues}, maxDry=${rep.gates.dry_stretch_scanner.maxObservedDryWords}w`;
  });

  // Test 3: >220-word dry stretch triggers P0 DRY_STRETCH_EXCEEDED
  check("detects_over_220_word_dry_stretch", () => {
    const dry245 = Array(245).fill("equilibrium").join(" ");
    const script = [
      "Roughly 86% of revenue comes from your paycheck today.",
      dry245,
      "Open Table 9 right now and stick around for the next video."
    ].join("\n\n");
    const rep = auditScriptRetention(script, { mode: "longform" });
    const hasDryFlag = rep.flags.some((f) => f.code === "DRY_STRETCH_EXCEEDED");
    if (rep.status !== "FAIL" || !hasDryFlag) {
      throw new Error("Expected DRY_STRETCH_EXCEEDED P0 failure on 245-word dry block");
    }
    return `flagged maxDry=${rep.gates.dry_stretch_scanner.maxObservedDryWords}w`;
  });

  // Test 4: Throat-clearing + late stake (>50w) triggers Cold-Open P0 flags
  check("detects_throat_clearing_and_late_cold_open_stake", () => {
    const introPadding = Array(55).fill("macroeconomic").join(" ");
    const script = [
      `Hey guys, welcome back to the channel. In this video ${introPadding} $40.5 trillion hits your mortgage.`,
      Array(120).fill("Look at Table 9 where $2 billion hits your rent?").join(" "),
      "Stick around for the next video."
    ].join("\n\n");
    const rep = auditScriptRetention(script, { mode: "longform" });
    const codes = new Set(rep.flags.map((f) => f.code));
    if (!codes.has("COLD_OPEN_THROAT_CLEARING") || !codes.has("COLD_OPEN_LATE_STAKE")) {
      throw new Error(`Expected throat-clearing and late-stake flags, got ${Array.from(codes).join(",")}`);
    }
    return `caught ${Array.from(codes).join(" + ")}`;
  });

  // Test 5: Mid-video subscribe nag + telegraphed wrap-up cliche trigger P0 flags
  check("detects_mid_video_nag_and_wrapup_cliche", () => {
    const chunk = "Look at Table 9 as $5 billion hits your bank account in a minute?";
    const blocks = Array(10).fill(chunk);
    blocks[4] = `${chunk} Make sure to like and subscribe right now so we grow.`;
    blocks[9] = `${chunk} In conclusion, stick around for the next video.`;
    const rep = auditScriptRetention(blocks.join("\n\n"), { mode: "longform" });
    const codes = new Set(rep.flags.map((f) => f.code));
    if (!codes.has("MID_VIDEO_SUBSCRIBE_NAG") || !codes.has("TELEGRAPHED_WRAPUP_CLICHE")) {
      throw new Error(`Expected mid-video nag and wrapup cliche flags, got ${Array.from(codes).join(",")}`);
    }
    return `caught ${Array.from(codes).join(" + ")}`;
  });

  // Test 6: Native vertical script passes under --mode vertical
  check("vertical_mode_clean_script_passes", () => {
    const verticalScript = [
      "PJM wholesale power capacity prices jumped 833% in a single auction, landing straight on your electric bill across thirteen states.",
      "Open the grid auction filing and look at why the price paid to keep power plants ready spiked from $28.92 to $269.92 per megawatt-day.",
      "Two months after that auction cleared, Microsoft locked up the entire restarted reactor at Three Mile Island for twenty years while single server campuses started requesting 5 gigawatts of steady power.",
      "Coding agents deploy across an industry in six months, while permitting high-voltage substations takes five to ten years. Does your utility tariff pass that upgrade debt onto your bill? Pull up your monthly capacity rider before August arrives, because the full breakdown is linked below."
    ].join("\n\n");
    const rep = auditScriptRetention(verticalScript, { mode: "vertical" });
    if (rep.status !== "PASS") {
      throw new Error(`Expected vertical PASS, got FAIL: ${JSON.stringify(rep.flags)}`);
    }
    return `vertical words=${rep.summary.spoken_words}, maxDry=${rep.gates.dry_stretch_scanner.maxObservedDryWords}w`;
  });

  const failed = results.filter((r) => !r.passed);
  return {
    tool: "retention_linter_self_test",
    passed: failed.length === 0,
    total_tests: results.length,
    passed_tests: results.length - failed.length,
    failed_tests: failed.length,
    results
  };
}

function printHelp() {
  process.stdout.write(
    [
      "Usage: node 04_scripts_and_dossiers/tools/retention_linter.mjs [options]",
      "",
      "Options:",
      "  --file <path>           Path to Markdown/plain spoken script (defaults to Episode 01)",
      "  --mode <longform|vertical>  Audit profile (default: longform; 220w vs 75w dry ceiling)",
      "  --wpm <number>          Spoken words-per-minute baseline (default: 150)",
      "  --max-dry-words <num>   Override maximum reset-free word window",
      "  --out <path>            Write report output to file",
      "  --json                  Emit machine-readable JSON report",
      "  --self-test             Run built-in 6-case verification suite (includes Episode 01)",
      "  -h, --help              Show usage help",
      ""
    ].join("\n")
  );
}

function main() {
  let parsedArgs;
  try {
    parsedArgs = parseArgs({
      options: {
        file: { type: "string", short: "f" },
        mode: { type: "string", short: "m", default: "longform" },
        wpm: { type: "string" },
        "max-dry-words": { type: "string" },
        out: { type: "string" },
        json: { type: "boolean", default: false },
        "self-test": { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false }
      },
      allowPositionals: true
    });
  } catch (err) {
    process.stderr.write(`Argument error: ${err.message}\nRun with --help for usage.\n`);
    process.exit(1);
  }

  const { values, positionals } = parsedArgs;
  if (values.help) {
    printHelp();
    process.exit(0);
  }

  if (values["self-test"]) {
    const suite = runSelfTests();
    if (values.json) {
      process.stdout.write(`${JSON.stringify(suite, null, 2)}\n`);
    } else {
      process.stdout.write(
        `RETENTION LINTER SELF-TEST: ${suite.passed ? "PASS" : "FAIL"} (${suite.passed_tests}/${suite.total_tests})\n`
      );
      for (const r of suite.results) {
        process.stdout.write(`  [${r.passed ? "PASS" : "FAIL"}] ${r.name} -> ${r.detail}\n`);
      }
    }
    process.exit(suite.passed ? 0 : 1);
  }

  if (values.mode !== "longform" && values.mode !== "vertical") {
    process.stderr.write(`Invalid --mode "${values.mode}". Expected "longform" or "vertical".\n`);
    process.exit(1);
  }

  const targetFile = values.file || positionals[0] || DEFAULT_SCRIPT_PATH;
  const resolvedPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(resolvedPath)) {
    process.stderr.write(`Script file not found: ${resolvedPath}\n`);
    process.exit(1);
  }

  const rawText = fs.readFileSync(resolvedPath, "utf8");
  const relLabel = path.relative(REPO_ROOT, resolvedPath).replace(/\\/g, "/");
  const report = auditScriptRetention(rawText, {
    mode: values.mode,
    wpm: values.wpm ? Number(values.wpm) : undefined,
    maxDryWords: values["max-dry-words"] ? Number(values["max-dry-words"]) : undefined,
    fileLabel: relLabel.startsWith("..") ? resolvedPath : relLabel
  });

  const output = values.json ? `${JSON.stringify(report, null, 2)}\n` : formatHumanReport(report);
  if (values.out) {
    const outPath = path.resolve(process.cwd(), values.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf8");
  }
  process.stdout.write(output);
  process.exit(report.status === "PASS" ? 0 : 1);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  main();
}
