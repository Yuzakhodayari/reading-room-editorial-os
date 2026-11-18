#!/usr/bin/env node
/**
 * The Reading Room Editorial OS - Deliverable #40
 * Raw Transcript Retake & Dead-Air Cutter CLI (transcript_edl_cleaner.mjs)
 *
 * Deterministic A-Roll Rough-Cut Engine:
 *   1. Multi-format transcript ingestion (Whisper JSON, SRT, VTT, timestamped TXT)
 *   2. Utterance segmentation with exact or interpolated word timing
 *   3. Filler, throat-clear, meta-cue, and Whisper confidence flagging
 *   4. Retake & repeated-line cluster detector (Last-Good-Take + optional --script alignment)
 *   5. Dead-air & long-breath gap detector trimming dead tails to 280ms natural cushions
 *   6. Dual export: structured EDL JSON + DaVinci Resolve / Premiere CMX 3600 (.edl)
 *
 * Zero external dependencies. Requires Node.js >= 20.
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import process from "node:process";

const META_PHRASES = [
  "let me redo that",
  "let me redo",
  "lets redo that",
  "let's redo that",
  "let's redo",
  "redo that",
  "take that again",
  "let me take that again",
  "from the top",
  "one more time",
  "sorry again",
  "sorry, again",
  "my bad",
  "scratch that",
  "cut that",
  "wait a second",
  "hold on",
  "start over",
  "let me start over",
  "oops",
  "flubbed"
];

const PURE_FILLER_TOKENS = new Set([
  "uh",
  "um",
  "erm",
  "ah",
  "hmm",
  "mm",
  "mhm",
  "eh",
  "uhh",
  "umm"
]);

const SINGLE_META_TOKENS = new Set([
  "wait",
  "sorry",
  "again",
  "redo",
  "oops",
  "reset"
]);

const BRACKET_NOISE_RE = /^[\[\(*](?:cough|throat[\s_-]*clear(?:ing)?|clear(?:s|ing)?\s+throat|breath|inhale|exhale|sigh|laughter|laugh|pause|silence|noise|snort|lip[\s_-]*smack)[\]\)*]$/i;

function printHelp() {
  const help = `The Reading Room Editorial OS — Raw Transcript Retake & Dead-Air Cutter CLI

Usage:
  node 06_camera_and_voice/tools/transcript_edl_cleaner.mjs --input <file> [options]
  node 06_camera_and_voice/tools/transcript_edl_cleaner.mjs --self-test [--json]

Required (unless --self-test):
  --input <path>          Input transcript (.json Whisper, .srt, .vtt, or [HH:MM:SS.mmm] .txt)

Options:
  --script <path>         Optional clean reference script (.md or .txt) for best-take alignment
  --silence-ms <ms>       Inter-utterance/inter-word dead-air threshold in ms (default: 900)
  --min-pause-ms <ms>     Minimum natural pause threshold logged in ms (default: 450)
  --breath-pad-ms <ms>    Total preserved room-tone breath cushion across cuts in ms (default: 280)
  --fps <rate>            Timeline frame rate: 30, 29.97, 24, 23.976, 25, 59.94, 60 (default: 30)
  --min-confidence <num>  Whisper word probability warning floor 0.0-1.0 (default: 0.55)
  --reel <name>           CMX 3600 reel identifier up to 8 chars (default: AROLL001)
  --title <text>          EDL title header (default: derived from input filename)
  --source <clip>         Source media filename for CMX FROM CLIP NAME (default: input basename)
  --rec-offset-hours <n>  Record timeline start hour offset, e.g. 0 or 1 (default: 0)
  --out <edl.json>        Write full machine EDL JSON report to path
  --cmx <file.edl>        Write DaVinci Resolve / Premiere compatible CMX 3600 .edl file
  --json                  Print full JSON payload to stdout
  --self-test             Run embedded multi-take messy Whisper fixture & parser verification
  --help, -h              Show this usage reference

Exit Codes:
  0  Success (or --self-test passed)
  1  Validation failure, invalid arguments, or unreadable input`;
  console.log(help);
}

function parseArgs(argv) {
  const opts = {
    input: null,
    script: null,
    silenceMs: 900,
    minPauseMs: 450,
    breathPadMs: 280,
    fps: 30,
    minConfidence: 0.55,
    reel: "AROLL001",
    title: null,
    source: null,
    recOffsetHours: 0,
    out: null,
    cmx: null,
    json: false,
    selfTest: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) {
        throw new Error(`Missing value for option ${arg}`);
      }
      return argv[++i];
    };

    switch (arg) {
      case "--help":
      case "-h":
        opts.help = true;
        break;
      case "--self-test":
        opts.selfTest = true;
        break;
      case "--json":
        opts.json = true;
        break;
      case "--input":
        opts.input = next();
        break;
      case "--script":
        opts.script = next();
        break;
      case "--silence-ms":
        opts.silenceMs = Number(next());
        break;
      case "--min-pause-ms":
        opts.minPauseMs = Number(next());
        break;
      case "--breath-pad-ms":
        opts.breathPadMs = Number(next());
        break;
      case "--fps":
        opts.fps = Number(next());
        break;
      case "--min-confidence":
        opts.minConfidence = Number(next());
        break;
      case "--reel":
        opts.reel = sanitizeReel(next());
        break;
      case "--title":
        opts.title = next();
        break;
      case "--source":
        opts.source = next();
        break;
      case "--rec-offset-hours":
        opts.recOffsetHours = Number(next());
        break;
      case "--out":
        opts.out = next();
        break;
      case "--cmx":
        opts.cmx = next();
        break;
      default:
        throw new Error(`Unknown CLI argument: ${arg}`);
    }
  }

  if (!Number.isFinite(opts.silenceMs) || opts.silenceMs < 100) {
    throw new Error("--silence-ms must be a number >= 100");
  }
  if (!Number.isFinite(opts.minPauseMs) || opts.minPauseMs < 0 || opts.minPauseMs > opts.silenceMs) {
    throw new Error("--min-pause-ms must be between 0 and --silence-ms");
  }
  if (!Number.isFinite(opts.breathPadMs) || opts.breathPadMs < 0 || opts.breathPadMs >= opts.silenceMs) {
    throw new Error("--breath-pad-ms must be >= 0 and less than --silence-ms");
  }
  if (!Number.isFinite(opts.fps) || opts.fps <= 0) {
    throw new Error("--fps must be a positive number (e.g. 30, 24, 23.976)");
  }
  if (!Number.isFinite(opts.minConfidence) || opts.minConfidence < 0 || opts.minConfidence > 1) {
    throw new Error("--min-confidence must be between 0 and 1");
  }
  if (!Number.isFinite(opts.recOffsetHours) || opts.recOffsetHours < 0 || opts.recOffsetHours > 23) {
    throw new Error("--rec-offset-hours must be between 0 and 23");
  }

  return opts;
}

function sanitizeReel(raw) {
  const clean = String(raw || "AROLL001")
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "");
  return (clean || "AROLL001").slice(0, 8);
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function effectiveFpsRate(fps) {
  if (Math.abs(fps - 23.976) < 0.01) return 24000 / 1001;
  if (Math.abs(fps - 29.97) < 0.01) return 30000 / 1001;
  if (Math.abs(fps - 59.94) < 0.02) return 60000 / 1001;
  return fps;
}

function timebaseInt(fps) {
  return Math.max(1, Math.round(fps));
}

function secToFrames(sec, fps) {
  const rate = effectiveFpsRate(fps);
  return Math.max(0, Math.round(sec * rate));
}

function framesToSec(frames, fps) {
  const rate = effectiveFpsRate(fps);
  return round3(frames / rate);
}

function framesToSmpte(totalFrames, fps) {
  const tb = timebaseInt(fps);
  const f = Math.max(0, Math.round(totalFrames));
  const ff = f % tb;
  const totalSec = Math.floor(f / tb);
  const ss = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const mm = totalMin % 60;
  const hh = Math.floor(totalMin / 60);
  const pad = (v) => String(v).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

function secToSmpte(sec, fps) {
  return framesToSmpte(secToFrames(sec, fps), fps);
}

function parseTimestampToSec(raw) {
  const s = String(raw).trim().replace(",", ".");
  const parts = s.split(":");
  if (parts.length === 3) {
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const sec = Number(parts[2]);
    if ([h, m, sec].some((v) => !Number.isFinite(v))) return null;
    return round3(h * 3600 + m * 60 + sec);
  }
  if (parts.length === 2) {
    const m = Number(parts[0]);
    const sec = Number(parts[1]);
    if ([m, sec].some((v) => !Number.isFinite(v))) return null;
    return round3(m * 60 + sec);
  }
  return null;
}

function synthesizeWordTimings(text, startSec, endSec, defaultProb = 0.9) {
  const rawWords = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (rawWords.length === 0) return [];
  const safeEnd = Math.max(startSec + 0.05, endSec);
  const span = safeEnd - startSec;
  const weights = rawWords.map((w) => Math.max(2, w.replace(/[^a-zA-Z0-9]/g, "").length + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cursor = startSec;
  return rawWords.map((w, idx) => {
    const wDur = (weights[idx] / totalWeight) * span;
    const wStart = round3(cursor);
    const wEnd = idx === rawWords.length - 1 ? round3(safeEnd) : round3(cursor + wDur);
    cursor += wDur;
    return {
      word: w,
      startSec: wStart,
      endSec: Math.max(wStart, wEnd),
      probability: defaultProb,
      interpolated: true
    };
  });
}

function parseWhisperJson(raw) {
  const data = JSON.parse(raw);
  let rawSegments = [];

  if (Array.isArray(data.segments)) {
    rawSegments = data.segments;
  } else if (Array.isArray(data.transcription)) {
    // whisper.cpp JSON format
    rawSegments = data.transcription.map((item, idx) => {
      const start = item.offsets ? item.offsets.from / 1000 : parseTimestampToSec(item.timestamps?.from) ?? 0;
      const end = item.offsets ? item.offsets.to / 1000 : parseTimestampToSec(item.timestamps?.to) ?? start + 0.5;
      return {
        id: idx,
        start,
        end,
        text: item.text || "",
        words: Array.isArray(item.tokens)
          ? item.tokens
              .filter((t) => t.text && !String(t.text).startsWith("[_"))
              .map((t) => ({
                word: String(t.text).trim(),
                start: t.offsets ? t.offsets.from / 1000 : start,
                end: t.offsets ? t.offsets.to / 1000 : end,
                probability: typeof t.p === "number" ? t.p : 0.9
              }))
          : undefined
      };
    });
  } else if (Array.isArray(data)) {
    rawSegments = data;
  } else {
    throw new Error("Unsupported JSON transcript structure: expected segments[] or transcription[]");
  }

  const segments = rawSegments
    .map((seg, idx) => {
      const text = String(seg.text || "").trim();
      const startSec = round3(Number(seg.start ?? seg.startSec ?? 0));
      const endSec = round3(Number(seg.end ?? seg.endSec ?? startSec));
      const rawWords = Array.isArray(seg.words) ? seg.words : null;
      const words = rawWords && rawWords.length > 0
        ? rawWords
            .map((w) => ({
              word: String(w.word ?? w.text ?? "").trim(),
              startSec: round3(Number(w.start ?? w.startSec ?? startSec)),
              endSec: round3(Number(w.end ?? w.endSec ?? endSec)),
              probability: typeof w.probability === "number"
                ? w.probability
                : typeof w.score === "number"
                  ? w.score
                  : typeof w.confidence === "number"
                    ? w.confidence
                    : 0.9,
              interpolated: false
            }))
            .filter((w) => w.word.length > 0)
        : synthesizeWordTimings(text, startSec, endSec, 0.9);

      return {
        id: seg.id ?? idx,
        index: idx,
        startSec,
        endSec: Math.max(startSec, endSec),
        text,
        avgLogprob: typeof seg.avg_logprob === "number" ? seg.avg_logprob : null,
        noSpeechProb: typeof seg.no_speech_prob === "number" ? seg.no_speech_prob : null,
        compressionRatio: typeof seg.compression_ratio === "number" ? seg.compression_ratio : null,
        words
      };
    })
    .filter((s) => s.text.length > 0 || s.words.length > 0);

  const declaredDuration = typeof data.duration === "number" ? round3(data.duration) : null;
  return { format: "whisper-json", segments, declaredDuration };
}

function parseSrt(raw) {
  const blocks = raw.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  const segments = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    const timingLineIdx = lines[0].includes("-->") ? 0 : 1;
    const timingLine = lines[timingLineIdx];
    const m = timingLine.match(/(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/);
    if (!m) continue;
    const startSec = parseTimestampToSec(m[1]);
    const endSec = parseTimestampToSec(m[2]);
    if (startSec === null || endSec === null) continue;
    const text = lines
      .slice(timingLineIdx + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text) continue;
    segments.push({
      id: segments.length,
      index: segments.length,
      startSec,
      endSec: Math.max(startSec, endSec),
      text,
      avgLogprob: null,
      noSpeechProb: null,
      compressionRatio: null,
      words: synthesizeWordTimings(text, startSec, endSec, 0.9)
    });
  }
  return { format: "srt", segments, declaredDuration: null };
}

function parseVtt(raw) {
  const cleaned = raw.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const blocks = cleaned.split(/\n{2,}/);
  const segments = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed.startsWith("WEBVTT") || trimmed.startsWith("NOTE") || trimmed.startsWith("STYLE")) {
      continue;
    }
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    const timingLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timingLineIdx === -1) continue;
    const m = lines[timingLineIdx].match(
      /((?:\d{1,2}:)?\d{2}:\d{2}\.\d{1,3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}\.\d{1,3})/
    );
    if (!m) continue;
    const startSec = parseTimestampToSec(m[1]);
    const endSec = parseTimestampToSec(m[2]);
    if (startSec === null || endSec === null) continue;
    const rawBody = lines.slice(timingLineIdx + 1).join(" ");
    const text = rawBody.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    segments.push({
      id: segments.length,
      index: segments.length,
      startSec,
      endSec: Math.max(startSec, endSec),
      text,
      avgLogprob: null,
      noSpeechProb: null,
      compressionRatio: null,
      words: synthesizeWordTimings(text, startSec, endSec, 0.9)
    });
  }
  return { format: "vtt", segments, declaredDuration: null };
}

function parseTimestampedTxt(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const entries = [];
  const lineRe = /^\[?((?:\d{1,2}:)?\d{2}:\d{2}(?:[.,]\d{1,3})?)\]?(?:\s*[-–>]+\s*\[?((?:\d{1,2}:)?\d{2}:\d{2}(?:[.,]\d{1,3})?)\]?)?:?\s+(.+)$/;

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const m = t.match(lineRe);
    if (!m) continue;
    const startSec = parseTimestampToSec(m[1]);
    if (startSec === null) continue;
    const explicitEnd = m[2] ? parseTimestampToSec(m[2]) : null;
    const text = m[3].trim();
    if (!text) continue;
    entries.push({ startSec, explicitEnd, text });
  }

  const segments = entries.map((entry, idx) => {
    const nextStart = idx + 1 < entries.length ? entries[idx + 1].startSec : null;
    const wc = entry.text.split(/\s+/).filter(Boolean).length;
    const estEnd = round3(entry.startSec + Math.max(0.55, wc / 2.65));
    let endSec = entry.explicitEnd;
    if (endSec === null) {
      endSec = nextStart !== null ? Math.min(nextStart, estEnd) : estEnd;
    }
    endSec = Math.max(entry.startSec + 0.1, round3(endSec));
    return {
      id: idx,
      index: idx,
      startSec: entry.startSec,
      endSec,
      text: entry.text,
      avgLogprob: null,
      noSpeechProb: null,
      compressionRatio: null,
      words: synthesizeWordTimings(entry.text, entry.startSec, endSec, 0.9)
    };
  });

  return { format: "txt", segments, declaredDuration: null };
}

export function parseTranscriptContent(raw, extHint = "") {
  const trimmed = raw.trim();
  const ext = extHint.toLowerCase();
  if (ext === ".json" || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseWhisperJson(trimmed);
  }
  if (ext === ".vtt" || trimmed.startsWith("WEBVTT")) {
    return parseVtt(trimmed);
  }
  if (ext === ".srt" || /^\d+\s*\n\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}\s*-->/.test(trimmed)) {
    return parseSrt(trimmed);
  }
  if (ext === ".txt") {
    return parseTimestampedTxt(trimmed);
  }
  if (trimmed.includes("-->")) {
    return parseSrt(trimmed);
  }
  return parseTimestampedTxt(trimmed);
}

function normalizeWordToken(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isFillerOrNoiseToken(rawWord) {
  const trimmed = String(rawWord || "").trim();
  if (BRACKET_NOISE_RE.test(trimmed)) return true;
  const norm = normalizeWordToken(trimmed);
  return PURE_FILLER_TOKENS.has(norm);
}

function containsMetaPhrase(text) {
  const norm = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return META_PHRASES.some((phrase) => norm.includes(phrase));
}

function isPureFillerOrMetaUtterance(words, text) {
  if (BRACKET_NOISE_RE.test(text.trim())) return true;
  const contentTokens = words
    .map((w) => normalizeWordToken(w.word))
    .filter((tok) => tok.length > 0 && !PURE_FILLER_TOKENS.has(tok) && !SINGLE_META_TOKENS.has(tok));
  if (contentTokens.length === 0) return true;
  if (containsMetaPhrase(text) && contentTokens.length <= 4) return true;
  return false;
}

/**
 * Splits raw transcript segments into atomic utterances along:
 *   - inter-word silence gaps >= silenceMs
 *   - sentence-ending punctuation (., ?, !, ...)
 *   - explicit restart meta-cues ("wait", "again", "redo", "that")
 */
function segmentIntoUtterances(segments, silenceMs) {
  const silenceSec = silenceMs / 1000;
  const utterances = [];
  let counter = 1;

  for (const seg of segments) {
    const words = seg.words && seg.words.length > 0
      ? seg.words
      : synthesizeWordTimings(seg.text, seg.startSec, seg.endSec);

    if (words.length === 0) continue;

    let chunk = [];
    const flushChunk = () => {
      if (chunk.length === 0) return;
      const startSec = round3(chunk[0].startSec);
      const endSec = round3(Math.max(startSec, chunk[chunk.length - 1].endSec));
      const text = chunk.map((w) => w.word).join(" ").replace(/\s+/g, " ").trim();
      const probs = chunk.map((w) => w.probability).filter((p) => typeof p === "number");
      const avgWordProb = probs.length > 0
        ? round3(probs.reduce((a, b) => a + b, 0) / probs.length)
        : 0.9;

      utterances.push({
        id: `U${String(counter++).padStart(3, "0")}`,
        sourceSegmentIndex: seg.index,
        startSec,
        endSec,
        text,
        words: chunk,
        avgWordProb,
        avgLogprob: seg.avgLogprob,
        noSpeechProb: seg.noSpeechProb,
        compressionRatio: seg.compressionRatio,
        hasExactWordTiming: !chunk.every((w) => w.interpolated)
      });
      chunk = [];
    };

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (chunk.length > 0) {
        const prev = chunk[chunk.length - 1];
        const interWordGap = w.startSec - prev.endSec;
        if (interWordGap >= silenceSec) {
          flushChunk();
        }
      }

      chunk.push(w);

      const rawTok = w.word.trim();
      const normTok = normalizeWordToken(rawTok);
      const endsSentence = /[.?!]$/.test(rawTok) || /\.\.\.$/.test(rawTok);
      const looksAbortedToken = /\.\.\.$/.test(rawTok) || /-$/.test(rawTok);
      const endsMetaWord = SINGLE_META_TOKENS.has(normTok) && /[,.:;!?]$/.test(rawTok);
      const recentChunkText = chunk.slice(-4).map((x) => normalizeWordToken(x.word)).join(" ");
      const endsMetaPhrase = META_PHRASES.some((p) => recentChunkText.endsWith(p.replace(/[^a-z0-9\s]/g, "")));

      const hasNext = i + 1 < words.length;
      if (hasNext && (endsSentence || looksAbortedToken || endsMetaWord || endsMetaPhrase)) {
        // Avoid splitting decimal numbers or initials if somehow split on space (rare)
        const prevNorm = normalizeWordToken(rawTok);
        const nextRaw = words[i + 1].word.trim();
        const isAbbrev = /^(mr|ms|mrs|dr|st|vs|u\.s|inc|corp)\.?$/i.test(prevNorm) && /^[a-z0-9]/.test(nextRaw);
        if (!isAbbrev) {
          flushChunk();
        }
      }
    }
    flushChunk();
  }

  return utterances;
}

function getComparisonTokens(utterance) {
  return utterance.words
    .map((w) => normalizeWordToken(w.word))
    .filter((tok) => tok.length > 0 && !PURE_FILLER_TOKENS.has(tok) && !SINGLE_META_TOKENS.has(tok));
}

function isAbortedOrMetaUtterance(utterance) {
  const txt = utterance.text.trim();
  if (/\.\.\.$/.test(txt) || /-$/.test(txt)) return true;
  if (containsMetaPhrase(txt)) return true;
  const lastRaw = utterance.words[utterance.words.length - 1]?.word || "";
  if (SINGLE_META_TOKENS.has(normalizeWordToken(lastRaw))) return true;
  return false;
}

function tokensPrefixOrStemMatch(a, b) {
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3 && (b.startsWith(a) || a.startsWith(b))) return true;
  return false;
}

function computeSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) {
    return { jaccard: 0, containment: 0, prefixRatio: 0, bigramScore: 0, combined: 0 };
  }

  // Leading prefix overlap allowing stem prefix on aborted last token
  let prefixMatches = 0;
  const minLen = Math.min(tokensA.length, tokensB.length);
  for (let i = 0; i < minLen; i++) {
    if (tokensPrefixOrStemMatch(tokensA[i], tokensB[i])) {
      prefixMatches++;
    } else {
      break;
    }
  }
  const prefixRatio = prefixMatches / minLen;

  // Bag-of-tokens multiset intersection + stem tolerance for aborted last word
  const usedB = new Set();
  let intersect = 0;
  for (let i = 0; i < tokensA.length; i++) {
    const ta = tokensA[i];
    for (let j = 0; j < tokensB.length; j++) {
      if (usedB.has(j)) continue;
      if (ta === tokensB[j] || (i === tokensA.length - 1 && tokensPrefixOrStemMatch(ta, tokensB[j]))) {
        usedB.add(j);
        intersect++;
        break;
      }
    }
  }

  const union = tokensA.length + tokensB.length - intersect;
  const jaccard = union > 0 ? intersect / union : 0;
  const containment = intersect / minLen;

  const bigrams = (arr) => {
    const s = new Set();
    for (let i = 0; i + 1 < arr.length; i++) s.add(`${arr[i]}_${arr[i + 1]}`);
    return s;
  };
  const bgA = bigrams(tokensA);
  const bgB = bigrams(tokensB);
  let bgInter = 0;
  for (const g of bgA) if (bgB.has(g)) bgInter++;
  const bigramScore = bgA.size + bgB.size > 0 ? (2 * bgInter) / (bgA.size + bgB.size) : jaccard;

  const combined = Math.max(
    0.45 * containment + 0.35 * prefixRatio + 0.20 * bigramScore,
    0.5 * jaccard + 0.5 * bigramScore
  );

  return { jaccard, containment, prefixRatio, bigramScore, combined, prefixMatches, intersect };
}

export function parseCleanScript(scriptText) {
  let body = String(scriptText || "").replace(/\r\n/g, "\n");
  // Remove YAML frontmatter
  body = body.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  // Remove markdown code blocks and stage cues
  body = body.replace(/```[\s\S]*?```/g, " ");
  body = body.replace(/\[(?:ON SCREEN|SFX|CHAPTER|BEAT|CUE|NOTE|LIVE_STAT_SLOT)[^\]]*\]/gi, " ");
  // Remove markdown headings, blockquotes, links, emphasis
  body = body
    .split("\n")
    .filter((line) => !/^\s*#{1,6}\s+/.test(line) && !/^\s*\|/.test(line))
    .join(" ");
  body = body
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const rawSentences = body
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return rawSentences.map((sentence, idx) => {
    const tokens = sentence
      .split(/\s+/)
      .map(normalizeWordToken)
      .filter(Boolean);
    return { index: idx, text: sentence, tokens };
  });
}

function lcsLength(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return 0;
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) curr[j] = prev[j - 1] + 1;
      else curr[j] = prev[j] >= curr[j - 1] ? prev[j] : curr[j - 1];
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }
  return prev[n];
}

function scoreUtteranceAgainstScript(utterance, scriptSentences) {
  if (!scriptSentences || scriptSentences.length === 0) return null;
  const uTokens = getComparisonTokens(utterance);
  if (uTokens.length === 0) return { score: 0, sentenceIndex: -1 };

  let bestScore = 0;
  let bestIdx = -1;

  for (let i = 0; i < scriptSentences.length; i++) {
    const sTokens = scriptSentences[i].tokens;
    if (sTokens.length === 0) continue;
    const lcs = lcsLength(uTokens, sTokens);
    const precision = lcs / uTokens.length;
    const recall = lcs / sTokens.length;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    // Also test against adjacent two-sentence pair in case Whisper merged two sentences
    let pairF1 = 0;
    if (i + 1 < scriptSentences.length) {
      const merged = sTokens.concat(scriptSentences[i + 1].tokens);
      const lcs2 = lcsLength(uTokens, merged);
      const p2 = lcs2 / uTokens.length;
      const r2 = lcs2 / merged.length;
      pairF1 = p2 + r2 > 0 ? (2 * p2 * r2) / (p2 + r2) : 0;
    }

    const candidate = Math.max(f1, pairF1);
    if (candidate > bestScore) {
      bestScore = candidate;
      bestIdx = i;
    }
  }

  return { score: round3(bestScore), sentenceIndex: bestIdx };
}

function flagUtteranceDiagnostics(utterances, minConfidence) {
  const flags = [];
  for (const u of utterances) {
    if (u.noSpeechProb !== null && u.noSpeechProb > 0.6) {
      flags.push({
        type: "HIGH_NO_SPEECH_PROB",
        utterance_id: u.id,
        token: u.text.slice(0, 48),
        start_sec: u.startSec,
        end_sec: u.endSec,
        probability: round3(1 - u.noSpeechProb)
      });
    }
    if (u.compressionRatio !== null && u.compressionRatio > 2.4) {
      flags.push({
        type: "WHISPER_HALLUCINATION_LOOP",
        utterance_id: u.id,
        token: u.text.slice(0, 48),
        start_sec: u.startSec,
        end_sec: u.endSec,
        probability: u.avgWordProb
      });
    }
    if (containsMetaPhrase(u.text)) {
      flags.push({
        type: "META_CUE",
        utterance_id: u.id,
        token: u.text,
        start_sec: u.startSec,
        end_sec: u.endSec,
        probability: u.avgWordProb
      });
    }
    for (const w of u.words) {
      const norm = normalizeWordToken(w.word);
      if (BRACKET_NOISE_RE.test(w.word.trim()) || PURE_FILLER_TOKENS.has(norm)) {
        flags.push({
          type: "FILLER_TOKEN",
          utterance_id: u.id,
          token: w.word,
          start_sec: w.startSec,
          end_sec: w.endSec,
          probability: round3(w.probability)
        });
      }
      if (typeof w.probability === "number" && w.probability < minConfidence) {
        flags.push({
          type: "LOW_CONFIDENCE_TOKEN",
          utterance_id: u.id,
          token: w.word,
          start_sec: w.startSec,
          end_sec: w.endSec,
          probability: round3(w.probability)
        });
      }
    }
  }
  return flags;
}

function detectRetakesAndFillers(utterances, scriptSentences, minConfidence) {
  const n = utterances.length;
  const status = new Array(n).fill("KEEP");
  const reasons = new Array(n).fill("CLEAN_TAKE");
  const clusterIds = new Array(n).fill(null);
  const supersededBy = new Array(n).fill(null);
  const scriptMatches = utterances.map((u) => scoreUtteranceAgainstScript(u, scriptSentences));

  // Pass 1: Pure fillers, throat-clears, and standalone meta-cues
  for (let i = 0; i < n; i++) {
    if (isPureFillerOrMetaUtterance(utterances[i].words, utterances[i].text)) {
      status[i] = containsMetaPhrase(utterances[i].text) ? "CUT_RETAKE" : "CUT_FILLER";
      reasons[i] = containsMetaPhrase(utterances[i].text) ? "STANDALONE_META_CUE" : "PURE_FILLER_OR_NOISE";
    }
  }

  // Pass 2: Build chronological take clusters for non-filler utterances within lookahead window
  const parent = Array.from({ length: n }, (_, idx) => idx);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
  };

  for (let i = 0; i < n; i++) {
    if (status[i] !== "KEEP") continue;
    const tokA = getComparisonTokens(utterances[i]);
    if (tokA.length === 0) continue;

    for (let j = i + 1; j < n && j <= i + 8; j++) {
      if (status[j] !== "KEEP") continue;
      if (utterances[j].startSec - utterances[i].endSec > 90) break;

      const tokB = getComparisonTokens(utterances[j]);
      if (tokB.length === 0) continue;

      const sim = computeSimilarity(tokA, tokB);
      const falseStartPrefix =
        (isAbortedOrMetaUtterance(utterances[i]) || tokA.length <= 6) &&
        sim.prefixMatches >= 1 &&
        sim.prefixRatio >= 0.65 &&
        tokB.length > tokA.length;

      const repeatedSentence =
        (sim.containment >= 0.62 && sim.prefixMatches >= 2) ||
        sim.jaccard >= 0.55 ||
        sim.combined >= 0.62;

      const sameScriptSentence =
        scriptSentences &&
        scriptMatches[i] &&
        scriptMatches[j] &&
        scriptMatches[i].sentenceIndex !== -1 &&
        scriptMatches[i].sentenceIndex === scriptMatches[j].sentenceIndex &&
        scriptMatches[i].score >= 0.35 &&
        scriptMatches[j].score >= 0.35;

      if (falseStartPrefix || repeatedSentence || sameScriptSentence) {
        union(i, j);
      }
    }
  }

  const clusters = new Map();
  for (let i = 0; i < n; i++) {
    if (status[i] !== "KEEP") continue;
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(i);
  }

  let clusterSeq = 1;
  for (const indices of clusters.values()) {
    if (indices.length <= 1) continue;
    const clusterId = `TAKE_GRP_${String(clusterSeq++).padStart(2, "0")}`;
    indices.forEach((idx) => {
      clusterIds[idx] = clusterId;
    });

    // Rank candidates inside cluster
    const scored = indices.map((idx, orderPos) => {
      const u = utterances[idx];
      const tok = getComparisonTokens(u);
      const aborted = isAbortedOrMetaUtterance(u);
      const hasLowConf = u.words.some((w) => w.probability < minConfidence);
      const hasInlineFiller = u.words.some((w) => isFillerOrNoiseToken(w.word));
      const sMatch = scriptMatches[idx]?.score ?? 0;

      // Cleanliness score + Last-Good-Take tie-break
      let quality = 0;
      if (!aborted) quality += 100;
      if (!hasInlineFiller) quality += 20;
      if (!hasLowConf) quality += 15;
      quality += Math.min(25, tok.length);
      if (scriptSentences) {
        quality += sMatch * 80;
      }
      // Chronological bonus favors later complete takes
      quality += orderPos * 8;

      return { idx, orderPos, aborted, tokLen: tok.length, sMatch, quality };
    });

    let winner = scored[0];
    if (scriptSentences) {
      // Highest script alignment among complete takes; latest wins close ties (<= 0.03 F1)
      scored.sort((a, b) => {
        if (a.aborted !== b.aborted) return a.aborted ? 1 : -1;
        if (Math.abs(a.sMatch - b.sMatch) > 0.04) return b.sMatch - a.sMatch;
        return b.quality - a.quality;
      });
      winner = scored[0];
    } else {
      // Last-Good-Take heuristic: latest non-aborted take with strong completeness
      const maxLen = Math.max(...scored.map((s) => s.tokLen));
      const validComplete = scored.filter((s) => !s.aborted && s.tokLen >= maxLen * 0.65);
      if (validComplete.length > 0) {
        // Prefer latest clean take without inline filler/low-conf, or latest complete take overall
        const spotless = validComplete.filter((s) => s.quality >= validComplete[validComplete.length - 1].quality - 10);
        winner = spotless[spotless.length - 1];
      } else {
        scored.sort((a, b) => b.quality - a.quality);
        winner = scored[0];
      }
    }

    for (const item of scored) {
      if (item.idx === winner.idx) {
        status[item.idx] = "KEEP";
        reasons[item.idx] = scriptSentences ? "LOCKED_BEST_SCRIPT_TAKE" : "LOCKED_LAST_GOOD_TAKE";
      } else {
        status[item.idx] = "CUT_RETAKE";
        supersededBy[item.idx] = utterances[winner.idx].id;
        reasons[item.idx] = item.aborted
          ? "FALSE_START_PREFIX_MATCH"
          : scriptSentences
            ? "SCRIPT_ALIGNMENT_SUPERSEDED"
            : "SUPERSEDED_BY_LATER_TAKE";
      }
    }
  }

  // Pass 3: Trim leading/trailing pure filler tokens inside remaining KEEP utterances
  for (let i = 0; i < n; i++) {
    if (status[i] !== "KEEP") continue;
    const u = utterances[i];
    if (isAbortedOrMetaUtterance(u) && getComparisonTokens(u).length <= 3) {
      status[i] = "CUT_RETAKE";
      reasons[i] = "ORPHAN_ABORTED_FALSE_START";
      continue;
    }

    let left = 0;
    while (left < u.words.length - 1 && isFillerOrNoiseToken(u.words[left].word)) {
      left++;
    }
    let right = u.words.length - 1;
    while (right > left && isFillerOrNoiseToken(u.words[right].word)) {
      right--;
    }
    if (left > 0 || right < u.words.length - 1) {
      u.words = u.words.slice(left, right + 1);
      u.startSec = round3(u.words[0].startSec);
      u.endSec = round3(u.words[u.words.length - 1].endSec);
      u.text = u.words.map((w) => w.word).join(" ").trim();
    }
  }

  return utterances.map((u, idx) => ({
    utterance: u,
    action: status[idx],
    reason: reasons[idx],
    clusterId: clusterIds[idx],
    supersededBy: supersededBy[idx],
    scriptMatch: scriptMatches[idx]
  }));
}

function buildRoughCutTimeline(classified, opts) {
  const silenceSec = opts.silenceMs / 1000;
  const minPauseSec = opts.minPauseMs / 1000;
  const breathPadSec = opts.breathPadMs / 1000;
  const halfPad = breathPadSec / 2;

  const keptItems = classified.filter((c) => c.action === "KEEP");
  const gaps = [];
  let gapCounter = 1;

  if (keptItems.length === 0) {
    return { edlEvents: [], gaps: [], rawDurationSec: 0, cleanDurationSec: 0 };
  }

  // Compute safe padded [inSec, outSec] bounds per kept utterance without bleeding into cut takes
  const spans = keptItems.map((item, kIdx) => {
    const u = item.utterance;
    const origIdx = classified.indexOf(item);
    const prevOrig = origIdx > 0 ? classified[origIdx - 1].utterance : null;
    const nextOrig = origIdx + 1 < classified.length ? classified[origIdx + 1].utterance : null;

    const prevAvail = prevOrig ? Math.max(0, u.startSec - prevOrig.endSec) : u.startSec;
    const nextAvail = nextOrig ? Math.max(0, nextOrig.startSec - u.endSec) : halfPad;

    let leadPad = Math.min(halfPad, prevAvail * 0.45);
    if (kIdx === 0) {
      if (u.startSec >= silenceSec) {
        leadPad = Math.min(breathPadSec, u.startSec);
        gaps.push({
          gap_id: `GAP_${String(gapCounter++).padStart(2, "0")}`,
          classification: "LEADING_DEAD_AIR_TRIMMED",
          raw_start_sec: 0,
          raw_end_sec: u.startSec,
          raw_duration_ms: Math.round(u.startSec * 1000),
          kept_cushion_ms: Math.round(leadPad * 1000),
          trimmed_ms: Math.round((u.startSec - leadPad) * 1000)
        });
      } else {
        leadPad = u.startSec;
      }
    }

    const tailPad = nextOrig ? Math.min(halfPad, nextAvail * 0.45) : halfPad;

    return {
      item,
      u,
      origIdx,
      inSec: round3(Math.max(0, u.startSec - leadPad)),
      outSec: round3(u.endSec + tailPad)
    };
  });

  // Group spans into contiguous EDL clips whenever adjacent KEEP segments have gap < silenceMs
  const clips = [];
  let current = {
    sourceInSec: spans[0].inSec,
    sourceOutSec: spans[0].outSec,
    utterances: [spans[0]],
    notes: []
  };

  for (let i = 1; i < spans.length; i++) {
    const prevSpan = spans[i - 1];
    const currSpan = spans[i];
    const hasCutBetween = currSpan.origIdx - prevSpan.origIdx > 1;
    const rawGapSec = round3(Math.max(0, currSpan.u.startSec - prevSpan.u.endSec));

    if (!hasCutBetween && rawGapSec < silenceSec) {
      if (rawGapSec >= minPauseSec) {
        gaps.push({
          gap_id: `GAP_${String(gapCounter++).padStart(2, "0")}`,
          classification: "NATURAL_PAUSE_KEPT",
          raw_start_sec: prevSpan.u.endSec,
          raw_end_sec: currSpan.u.startSec,
          raw_duration_ms: Math.round(rawGapSec * 1000),
          kept_cushion_ms: Math.round(rawGapSec * 1000),
          trimmed_ms: 0
        });
      }
      current.sourceOutSec = Math.max(current.sourceOutSec, currSpan.outSec);
      current.utterances.push(currSpan);
    } else {
      // Splice boundary: either dead air >= silenceMs or excised retake/filler in between
      if (!hasCutBetween && rawGapSec >= silenceSec) {
        // Keep exact 280ms total room-tone breath cushion (halfPad on out + halfPad on in)
        const prevClipOut = round3(prevSpan.u.endSec + halfPad);
        const nextClipIn = round3(currSpan.u.startSec - halfPad);
        current.sourceOutSec = prevClipOut;
        currSpan.inSec = nextClipIn;
        const keptMs = Math.round((halfPad * 2) * 1000);
        const trimmedMs = Math.round(Math.max(0, rawGapSec - halfPad * 2) * 1000);
        gaps.push({
          gap_id: `GAP_${String(gapCounter++).padStart(2, "0")}`,
          classification: "DEAD_AIR_TRIMMED",
          raw_start_sec: prevSpan.u.endSec,
          raw_end_sec: currSpan.u.startSec,
          raw_duration_ms: Math.round(rawGapSec * 1000),
          kept_cushion_ms: keptMs,
          trimmed_ms: trimmedMs
        });
        current.notes.push(`Trimmed ${round2(trimmedMs / 1000)}s dead air (280ms cushion)`);
      } else {
        const excisedCount = currSpan.origIdx - prevSpan.origIdx - 1;
        const keptCushionMs = Math.round(
          ((prevSpan.outSec - prevSpan.u.endSec) + (currSpan.u.startSec - currSpan.inSec)) * 1000
        );
        const trimmedMs = Math.round(Math.max(0, rawGapSec * 1000 - keptCushionMs));
        gaps.push({
          gap_id: `GAP_${String(gapCounter++).padStart(2, "0")}`,
          classification: "RETAKE_EXCISED_GAP",
          raw_start_sec: prevSpan.u.endSec,
          raw_end_sec: currSpan.u.startSec,
          raw_duration_ms: Math.round(rawGapSec * 1000),
          kept_cushion_ms: keptCushionMs,
          trimmed_ms: trimmedMs,
          excised_utterances: excisedCount
        });
        current.notes.push(`Excised ${excisedCount} retake/filler unit(s)`);
      }

      clips.push(current);
      current = {
        sourceInSec: currSpan.inSec,
        sourceOutSec: currSpan.outSec,
        utterances: [currSpan],
        notes: []
      };
    }
  }
  clips.push(current);

  // Convert clip boundaries to frame-accurate SMPTE events
  const offsetFrames = secToFrames(opts.recOffsetHours * 3600, opts.fps);
  let recCursorFrames = offsetFrames;
  const edlEvents = [];

  for (const clip of clips) {
    const srcInFrames = secToFrames(clip.sourceInSec, opts.fps);
    const srcOutFrames = Math.max(srcInFrames + 1, secToFrames(clip.sourceOutSec, opts.fps));
    const durFrames = srcOutFrames - srcInFrames;
    const recInFrames = recCursorFrames;
    const recOutFrames = recInFrames + durFrames;
    recCursorFrames = recOutFrames;

    edlEvents.push({
      event_number: edlEvents.length + 1,
      reel: opts.reel,
      tracks: "AA/V",
      edit_type: "C",
      source_in_sec: framesToSec(srcInFrames, opts.fps),
      source_out_sec: framesToSec(srcOutFrames, opts.fps),
      record_in_sec: framesToSec(recInFrames - offsetFrames, opts.fps),
      record_out_sec: framesToSec(recOutFrames - offsetFrames, opts.fps),
      source_in_smpte: framesToSmpte(srcInFrames, opts.fps),
      source_out_smpte: framesToSmpte(srcOutFrames, opts.fps),
      record_in_smpte: framesToSmpte(recInFrames, opts.fps),
      record_out_smpte: framesToSmpte(recOutFrames, opts.fps),
      duration_sec: framesToSec(durFrames, opts.fps),
      utterance_ids: clip.utterances.map((x) => x.u.id),
      text: clip.utterances.map((x) => x.u.text).join(" "),
      comment: clip.notes.length > 0
        ? `KEEP | ${clip.utterances.map((x) => x.u.id).join(",")} | ${clip.notes.join("; ")}`
        : `KEEP | ${clip.utterances.map((x) => x.u.id).join(",")}`
    });
  }

  return { edlEvents, gaps, cleanDurationSec: framesToSec(recCursorFrames - offsetFrames, opts.fps) };
}

export function renderCmx3600Edl(edlEvents, { title, sourceClip }) {
  const lines = [
    `TITLE: ${String(title || "RR_AROLL_ROUGHCUT").toUpperCase()}`,
    "FCM: NON-DROP FRAME",
    ""
  ];
  for (const ev of edlEvents) {
    const num = String(ev.event_number).padStart(3, "0");
    const reel = ev.reel.padEnd(8, " ");
    const tracks = ev.tracks.padEnd(5, " ");
    const edit = ev.edit_type.padEnd(8, " ");
    lines.push(
      `${num}  ${reel} ${tracks} ${edit} ${ev.source_in_smpte} ${ev.source_out_smpte} ${ev.record_in_smpte} ${ev.record_out_smpte}`
    );
    if (sourceClip) {
      lines.push(`* FROM CLIP NAME: ${sourceClip}`);
    }
    lines.push(`* COMMENT: ${ev.comment}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function cleanTranscript(parsed, opts, scriptText = null) {
  const scriptSentences = scriptText ? parseCleanScript(scriptText) : null;
  const utterances = segmentIntoUtterances(parsed.segments, opts.silenceMs);
  const flags = flagUtteranceDiagnostics(utterances, opts.minConfidence);
  const classified = detectRetakesAndFillers(utterances, scriptSentences, opts.minConfidence);
  const { edlEvents, gaps, cleanDurationSec } = buildRoughCutTimeline(classified, opts);

  const lastSegmentEnd = parsed.segments.length > 0
    ? Math.max(...parsed.segments.map((s) => s.endSec))
    : 0;
  const rawDurationSec = round3(
    parsed.declaredDuration !== null
      ? Math.max(parsed.declaredDuration, lastSegmentEnd)
      : lastSegmentEnd
  );

  // Check trailing dead air after last kept utterance
  const kept = classified.filter((c) => c.action === "KEEP");
  if (kept.length > 0 && rawDurationSec - kept[kept.length - 1].utterance.endSec >= opts.silenceMs / 1000) {
    const tailGap = round3(rawDurationSec - kept[kept.length - 1].utterance.endSec);
    const padMs = Math.round(Math.min(opts.breathPadMs / 2, tailGap * 500));
    gaps.push({
      gap_id: `GAP_${String(gaps.length + 1).padStart(2, "0")}`,
      classification: "TRAILING_DEAD_AIR_TRIMMED",
      raw_start_sec: kept[kept.length - 1].utterance.endSec,
      raw_end_sec: rawDurationSec,
      raw_duration_ms: Math.round(tailGap * 1000),
      kept_cushion_ms: padMs,
      trimmed_ms: Math.round(tailGap * 1000) - padMs
    });
  }

  const timeSavedSec = round3(Math.max(0, rawDurationSec - cleanDurationSec));
  const savedPct = rawDurationSec > 0 ? round2((timeSavedSec / rawDurationSec) * 100) : 0;

  const decisions = classified.map((c) => ({
    id: c.utterance.id,
    action: c.action,
    reason: c.reason,
    start_sec: c.utterance.startSec,
    end_sec: c.utterance.endSec,
    start_smpte: secToSmpte(c.utterance.startSec, opts.fps),
    end_smpte: secToSmpte(c.utterance.endSec, opts.fps),
    text: c.utterance.text,
    cluster_id: c.clusterId,
    superseded_by: c.supersededBy,
    script_match: c.scriptMatch,
    confidence: {
      avg_word_prob: c.utterance.avgWordProb,
      avg_logprob: c.utterance.avgLogprob,
      no_speech_prob: c.utterance.noSpeechProb
    }
  }));

  const enrichedGaps = gaps.map((g) => ({
    ...g,
    start_smpte: secToSmpte(g.raw_start_sec, opts.fps),
    end_smpte: secToSmpte(g.raw_end_sec, opts.fps)
  }));

  const enrichedFlags = flags.map((f) => ({
    ...f,
    start_smpte: secToSmpte(f.start_sec, opts.fps),
    end_smpte: secToSmpte(f.end_sec, opts.fps)
  }));

  const title = opts.title || (opts.input ? path.basename(opts.input, path.extname(opts.input)) : "RR_AROLL_ROUGHCUT");
  const sourceClip = opts.source || (opts.input ? path.basename(opts.input) : "raw_aroll_source.mp4");
  const cmxText = renderCmx3600Edl(edlEvents, { title, sourceClip });

  return {
    schema_version: "1.0.0",
    tool: "transcript_edl_cleaner.mjs",
    input_format: parsed.format,
    config: {
      silence_ms: opts.silenceMs,
      min_pause_ms: opts.minPauseMs,
      breath_pad_ms: opts.breathPadMs,
      fps: opts.fps,
      min_confidence: opts.minConfidence,
      reel: opts.reel,
      source_clip: sourceClip,
      script_aligned: Boolean(scriptSentences)
    },
    summary: {
      raw_duration_sec: rawDurationSec,
      clean_duration_sec: cleanDurationSec,
      time_saved_sec: timeSavedSec,
      saved_pct: savedPct,
      raw_smpte: secToSmpte(rawDurationSec, opts.fps),
      clean_smpte: secToSmpte(cleanDurationSec, opts.fps),
      total_utterances: decisions.length,
      kept_utterances: decisions.filter((d) => d.action === "KEEP").length,
      cut_retake_count: decisions.filter((d) => d.action === "CUT_RETAKE").length,
      cut_filler_count: decisions.filter((d) => d.action === "CUT_FILLER").length,
      dead_air_cuts: enrichedGaps.filter((g) => g.classification.includes("DEAD_AIR_TRIMMED")).length,
      natural_pauses_preserved: enrichedGaps.filter((g) => g.classification === "NATURAL_PAUSE_KEPT").length,
      low_confidence_flags: enrichedFlags.filter((f) => f.type === "LOW_CONFIDENCE_TOKEN").length,
      edl_edit_count: edlEvents.length
    },
    edl_events: edlEvents,
    decisions,
    gaps: enrichedGaps,
    flags: enrichedFlags,
    cmx3600: cmxText
  };
}

function buildSelfTestFixtures() {
  const mkWords = (arr, t0, step = 0.28, probOverrides = {}) => {
    let t = t0;
    return arr.map((w) => {
      const start = round3(t);
      const dur = Math.max(0.18, Math.min(0.45, step * (0.6 + w.length / 8)));
      const end = round3(start + dur);
      t = end + 0.04;
      return {
        word: w,
        start,
        end,
        probability: probOverrides[w] ?? 0.96
      };
    });
  };

  // Fixture 1: Messy multi-take Whisper JSON with leading dead air (1.2s),
  // mid-segment false start ("Sixty-sev... wait. Sixty-seven..."),
  // 2.8s dead air, 3x repeated take with "um / sorry, again" and low-confidence token,
  // 0.60s natural pause preserved, throat-clear/redo cue, and clean close.
  const s1Words = [
    { word: "Sixty-sev...", start: 1.2, end: 1.72, probability: 0.38 },
    { word: "wait.", start: 1.85, end: 2.15, probability: 0.91 },
    ...mkWords(
      [
        "Sixty-seven", "point", "four", "percent", "of", "every", "tax", "dollar",
        "Washington", "collects", "comes", "straight", "out", "of", "somebody's", "paycheck."
      ],
      2.65
    )
  ];

  const s2Take1 = mkWords(
    ["Add", "capital", "gains", "and", "uh", "business", "income", "from..."],
    10.45,
    0.26,
    { uh: 0.72, "from...": 0.44 }
  );

  const s2Take2 = [
    { word: "um,", start: 13.1, end: 13.38, probability: 0.65 },
    { word: "sorry,", start: 13.45, end: 13.8, probability: 0.9 },
    { word: "again.", start: 13.85, end: 14.22, probability: 0.92 },
    ...mkWords(
      ["Add", "capital", "gains", "and", "business", "income", "from", "individual", "tax", "flub..."],
      14.55,
      0.26,
      { "flub...": 0.41 }
    )
  ];

  const s2Take3 = mkWords(
    [
      "Add", "capital", "gains", "and", "business", "income", "from", "individual",
      "tax", "filings,", "and", "regular", "taxpayers", "fund", "over", "eighty-six",
      "percent", "of", "the", "US", "government."
    ],
    18.2
  );

  const s3Filler = [
    { word: "[cough]", start: 26.2, end: 26.55, probability: 0.42 },
    { word: "uh,", start: 26.62, end: 26.85, probability: 0.74 },
    { word: "let", start: 26.9, end: 27.05, probability: 0.93 },
    { word: "me", start: 27.08, end: 27.2, probability: 0.95 },
    { word: "redo", start: 27.24, end: 27.52, probability: 0.91 },
    { word: "that.", start: 27.55, end: 27.8, probability: 0.94 }
  ];

  // Natural 0.60s pause inside s4 vs s5 after s3 is cut
  const s4 = mkWords(
    [
      "So", "if", "AI", "wipes", "out", "a", "huge", "share", "of", "those",
      "paychecks", "before", "2036,"
    ],
    28.3
  );
  const s4End = s4[s4.length - 1].end;
  const s5 = mkWords(
    ["who's", "going", "to", "pay", "off", "forty", "point", "five", "trillion", "dollars?"],
    round3(s4End + 0.60)
  );

  const whisperFixture = {
    language: "en",
    duration: round3(s5[s5.length - 1].end + 1.5),
    segments: [
      {
        id: 0,
        start: 1.2,
        end: s1Words[s1Words.length - 1].end,
        text: s1Words.map((w) => w.word).join(" "),
        avg_logprob: -0.24,
        no_speech_prob: 0.02,
        words: s1Words
      },
      // 2.8s dead air gap between s1End (~7.65) and s2Take1 start (10.45)
      {
        id: 1,
        start: s2Take1[0].start,
        end: s2Take1[s2Take1.length - 1].end,
        text: s2Take1.map((w) => w.word).join(" "),
        avg_logprob: -0.35,
        no_speech_prob: 0.05,
        words: s2Take1
      },
      {
        id: 2,
        start: s2Take2[0].start,
        end: s2Take2[s2Take2.length - 1].end,
        text: s2Take2.map((w) => w.word).join(" "),
        avg_logprob: -0.42,
        no_speech_prob: 0.04,
        words: s2Take2
      },
      {
        id: 3,
        start: s2Take3[0].start,
        end: s2Take3[s2Take3.length - 1].end,
        text: s2Take3.map((w) => w.word).join(" "),
        avg_logprob: -0.15,
        no_speech_prob: 0.01,
        words: s2Take3
      },
      {
        id: 4,
        start: s3Filler[0].start,
        end: s3Filler[s3Filler.length - 1].end,
        text: s3Filler.map((w) => w.word).join(" "),
        avg_logprob: -0.95,
        no_speech_prob: 0.64,
        words: s3Filler
      },
      {
        id: 5,
        start: s4[0].start,
        end: s5[s5.length - 1].end,
        text: [...s4, ...s5].map((w) => w.word).join(" "),
        avg_logprob: -0.16,
        no_speech_prob: 0.01,
        words: [...s4, ...s5]
      }
    ]
  };

  // Fix exact 2.80s dead air between segment 0 end and segment 1 start
  const s1End = s1Words[s1Words.length - 1].end;
  const shift = round3((s1End + 2.80) - s2Take1[0].start);
  for (let i = 1; i < whisperFixture.segments.length; i++) {
    const seg = whisperFixture.segments[i];
    seg.start = round3(seg.start + shift);
    seg.end = round3(seg.end + shift);
    seg.words = seg.words.map((w) => ({
      ...w,
      start: round3(w.start + shift),
      end: round3(w.end + shift)
    }));
  }
  whisperFixture.duration = round3(whisperFixture.segments[5].end + 1.40);

  const cleanScript = `---
episode_id: ep_01
---
# Cold Open
[ON SCREEN: TreasuryTable9Scene]
Sixty-seven point four percent of every tax dollar Washington collects comes straight out of somebody's paycheck. Add capital gains and business income from individual tax filings, and regular taxpayers fund over eighty-six percent of the US government. So if AI wipes out a huge share of those paychecks before 2036, who's going to pay off forty point five trillion dollars?`;

  const srtFixture = `1
00:00:00,000 --> 00:00:02,200
Roughly two-thirds of every tax dollar.

2
00:00:05,200 --> 00:00:08,100
Roughly two-thirds of every tax dollar comes from paychecks.`;

  const vttFixture = `WEBVTT

00:00.000 --> 00:02.100
Uh, wait.

00:02.400 --> 00:06.000
Regular taxpayers fund over eighty-six percent.`;

  const txtFixture = `[00:00:00.000] First test line here.
[00:00:04.500] Second test line after dead air.`;

  return { whisperFixture, cleanScript, srtFixture, vttFixture, txtFixture };
}

function runSelfTest(opts) {
  const { whisperFixture, cleanScript, srtFixture, vttFixture, txtFixture } = buildSelfTestFixtures();
  const baseOpts = {
    ...opts,
    input: "self_test_messy_aroll.json",
    source: "ep01_aroll_raw.mp4",
    title: "RR_SELF_TEST",
    silenceMs: 900,
    minPauseMs: 450,
    breathPadMs: 280,
    fps: 30,
    minConfidence: 0.55
  };

  // Test 1: Last-Good-Take without script
  const parsedWhisper = parseTranscriptContent(JSON.stringify(whisperFixture), ".json");
  const resNoScript = cleanTranscript(parsedWhisper, baseOpts, null);

  assert.equal(resNoScript.summary.kept_utterances, 3, "Expected 3 kept clean utterances");
  assert.ok(resNoScript.summary.cut_retake_count >= 4, "Expected false start + 2 superseded takes + meta cue cut");
  assert.ok(resNoScript.summary.dead_air_cuts >= 2, "Expected leading + trailing dead air cuts");
  assert.ok(resNoScript.summary.low_confidence_flags >= 3, "Expected low confidence tokens flagged");
  assert.ok(resNoScript.summary.saved_pct > 30, `Expected >30% runtime saved, got ${resNoScript.summary.saved_pct}%`);
  assert.ok(resNoScript.cmx3600.includes("TITLE: RR_SELF_TEST"), "CMX 3600 title header missing");
  assert.ok(resNoScript.cmx3600.includes("FCM: NON-DROP FRAME"), "CMX 3600 FCM header missing");

  // Verify the 2.8s gap or retake gap trimmed cleanly and kept text excludes stumbles
  const keptTexts = resNoScript.decisions.filter((d) => d.action === "KEEP").map((d) => d.text).join(" ");
  assert.ok(keptTexts.includes("Sixty-seven point four percent"), "Clean restart missing");
  assert.ok(keptTexts.includes("eighty-six percent of the US government"), "3rd complete take missing");
  assert.ok(keptTexts.includes("forty point five trillion dollars"), "Final sentence missing");
  assert.ok(!keptTexts.includes("Sixty-sev..."), "False start leaked into KEEP");
  assert.ok(!keptTexts.includes("flub..."), "Flubbed 2nd take leaked into KEEP");
  assert.ok(!keptTexts.includes("redo"), "Meta cue leaked into KEEP");

  // Verify continuous EDL timeline invariants
  for (let i = 1; i < resNoScript.edl_events.length; i++) {
    assert.equal(
      resNoScript.edl_events[i].record_in_smpte,
      resNoScript.edl_events[i - 1].record_out_smpte,
      "CMX 3600 record timeline must be contiguous"
    );
  }

  // Test 2: Script-aligned mode + 23.976fps
  const resWithScript = cleanTranscript(parsedWhisper, { ...baseOpts, fps: 23.976 }, cleanScript);
  assert.equal(resWithScript.summary.kept_utterances, 3, "Expected 3 kept utterances under script alignment");
  assert.ok(resWithScript.decisions.filter((d) => d.action === "KEEP").every((d) => d.script_match.score >= 0.7), "All kept takes must score >= 0.70 against clean script");

  // Test 3: Dead-air gap exact 280ms cushion test (two clean sentences separated by 2.80s)
  const twoClean = parseTranscriptContent(
    JSON.stringify({
      duration: 10.0,
      segments: [
        { id: 0, start: 0.0, end: 2.0, text: "First clean sentence ends here." },
        { id: 1, start: 4.8, end: 7.0, text: "Second clean sentence starts after two point eight seconds." }
      ]
    }),
    ".json"
  );
  const resGap = cleanTranscript(twoClean, baseOpts, null);
  const deadAirGap = resGap.gaps.find((g) => g.classification === "DEAD_AIR_TRIMMED");
  assert.ok(deadAirGap, "Expected 2.8s gap classified as DEAD_AIR_TRIMMED");
  assert.equal(deadAirGap.raw_duration_ms, 2800, "Expected exact 2800ms raw gap");
  assert.equal(deadAirGap.kept_cushion_ms, 280, "Expected exact 280ms breath cushion");
  assert.equal(deadAirGap.trimmed_ms, 2520, "Expected exact 2520ms trimmed dead air");

  // Test 4: SRT, VTT, TXT format parsers
  const resSrt = cleanTranscript(parseTranscriptContent(srtFixture, ".srt"), baseOpts, null);
  assert.equal(resSrt.summary.kept_utterances, 1, "SRT partial take should collapse to 2nd complete take");
  const resVtt = cleanTranscript(parseTranscriptContent(vttFixture, ".vtt"), baseOpts, null);
  assert.equal(resVtt.summary.kept_utterances, 1, "VTT filler cue should be excised");
  const resTxt = cleanTranscript(parseTranscriptContent(txtFixture, ".txt"), baseOpts, null);
  assert.equal(resTxt.summary.kept_utterances, 2, "TXT parser should preserve both clean timed lines");
  assert.ok(resTxt.gaps.some((g) => g.classification === "DEAD_AIR_TRIMMED"), "TXT parser should detect dead air between lines");

  const summaryReport = {
    status: "PASS",
    tests_passed: 5,
    fixture_raw_sec: resNoScript.summary.raw_duration_sec,
    fixture_clean_sec: resNoScript.summary.clean_duration_sec,
    fixture_saved_pct: resNoScript.summary.saved_pct,
    edl_edits: resNoScript.summary.edl_edit_count,
    retakes_cut: resNoScript.summary.cut_retake_count,
    fillers_cut: resNoScript.summary.cut_filler_count,
    dead_air_cushion_ms: deadAirGap.kept_cushion_ms
  };

  if (opts.json) {
    console.log(JSON.stringify(summaryReport, null, 2));
  } else {
    console.log("=== Transcript EDL Cleaner Self-Test Suite (5/5 passed) ===");
    console.log("  [PASS] T01_messy_whisper_retakes_and_false_starts (kept=3, retakesCut=" +
      resNoScript.summary.cut_retake_count + ", saved=" + resNoScript.summary.saved_pct + "%)");
    console.log("  [PASS] T02_script_aligned_23_976fps_recovery (all kept script_score >= 0.70)");
    console.log("  [PASS] T03_dead_air_2800ms_trimmed_to_280ms_cushion (trimmed=2520ms)");
    console.log("  [PASS] T04_cmx3600_contiguous_smpte_export (edits=" + resNoScript.summary.edl_edit_count + ")");
    console.log("  [PASS] T05_srt_vtt_txt_format_parsers (SRT/VTT/TXT verified)");
    console.log("SELF-TEST: PASS (EXIT 0)");
  }
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  if (opts.selfTest) {
    runSelfTest(opts);
    process.exit(0);
  }

  if (!opts.input) {
    console.error("Error: --input <transcript> is required (or pass --self-test / --help).");
    process.exit(1);
  }

  const inputAbs = path.resolve(opts.input);
  if (!fs.existsSync(inputAbs)) {
    console.error(`Error: Input file not found: ${inputAbs}`);
    process.exit(1);
  }

  const rawTranscript = fs.readFileSync(inputAbs, "utf8");
  const parsed = parseTranscriptContent(rawTranscript, path.extname(inputAbs));

  let scriptText = null;
  if (opts.script) {
    const scriptAbs = path.resolve(opts.script);
    if (!fs.existsSync(scriptAbs)) {
      console.error(`Error: Reference script file not found: ${scriptAbs}`);
      process.exit(1);
    }
    scriptText = fs.readFileSync(scriptAbs, "utf8");
  }

  const result = cleanTranscript(parsed, opts, scriptText);

  if (opts.out) {
    const outAbs = path.resolve(opts.out);
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    fs.writeFileSync(outAbs, JSON.stringify(result, null, 2), "utf8");
  }

  if (opts.cmx) {
    const cmxAbs = path.resolve(opts.cmx);
    fs.mkdirSync(path.dirname(cmxAbs), { recursive: true });
    fs.writeFileSync(cmxAbs, result.cmx3600, "utf8");
  }

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const s = result.summary;
    console.log(`Transcript EDL Cleaner (${result.input_format} @ ${opts.fps} fps)`);
    console.log(`Runtime: ${s.raw_duration_sec}s (${s.raw_smpte}) -> ${s.clean_duration_sec}s (${s.clean_smpte}) | Saved ${s.time_saved_sec}s (${s.saved_pct}%)`);
    console.log(`Utterances: ${s.kept_utterances} kept / ${s.cut_retake_count} retakes cut / ${s.cut_filler_count} fillers cut | EDL edits: ${s.edl_edit_count}`);
    console.log(`Gaps & Flags: ${s.dead_air_cuts} dead-air cuts (${opts.breathPadMs}ms cushion), ${s.natural_pauses_preserved} natural pauses kept, ${s.low_confidence_flags} low-conf tokens`);
    if (opts.out) console.log(`Wrote EDL JSON: ${path.resolve(opts.out)}`);
    if (opts.cmx) console.log(`Wrote CMX 3600 EDL: ${path.resolve(opts.cmx)}`);
  }
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
if (isEntrypoint) {
  main();
}
