# Multi-Language Subtitle and Global Audio-Track Guide

Deliverable: #33 (Multi-Language YouTube Subtitle and Global Audio-Track Pipeline)
Supported Languages: English (`en`), Persian (`fa`), Arabic (`ar`), Spanish (`es`), German (`de`)
Primary Tool: `05_mastery_and_translation/tools/subtitle_translator_prep.mjs`
Master Glossary: `05_mastery_and_translation/glossary_en_fa.json` (with built-in 25-term fallback)

This guide defines the production pipeline for preparing, hardening, publishing, and auditing five-language YouTube captions and Multi-Language Audio (MLA) dub tracks. Every stage keeps legal citations, accounting figures, and broadcast timings locked from the English camera script through final mobile playback.

## 1. Operational Spec for `subtitle_translator_prep.mjs`

The preparation tool runs on Node 20 or newer with zero third-party packages. It reads either a clean markdown script or an existing `.srt` or `.vtt` caption track, enforces broadcast line and timing limits, attaches locked translations across all five channel languages, and applies Unicode Bidirectional (BiDi) isolation for right-to-left (RTL) subtitles.

### CLI Interface and Options

| Flag | Default | Purpose |
| :--- | :--- | :--- |
| `--script <md_path>` | none | Parse a clean episode markdown script into timed cues |
| `--srt <srt_or_vtt_path>` | none | Parse, audit, re-wrap, and BiDi-harden an existing `.srt` or `.vtt` file |
| `--glossary <json_path>` | auto-discover | Load `glossary_en_fa.json` or fall back to built-in 25-term glossary |
| `--langs <csv>` | `en,fa,ar,es,de` | Comma-separated target language locks to attach per cue |
| `--wpm <number>` | `150` | Target camera speaking pace in words per minute |
| `--source-lang <code>` | auto-detect | Override source language detection (`en`, `fa`, `ar`, `es`, `de`) |
| `--out-dir <dir>` | none | Export `.srt`, `.vtt`, per-language prep files, and JSON lock packet |
| `--self-test` | false | Run the five-part verification suite inside temporary storage |
| `--json` | false | Print the complete compilation report and cue packet to stdout |
| `--help`, `-h` | false | Print usage instructions and exit with status zero |

Running `--script` or `--srt` without `--out-dir` performs the full compilation, glossary scan, BiDi token extraction, and compliance check in memory. Passing `--out-dir` writes timestamped `.srt`, `.vtt`, per-language prep files, and a `.translation_packet.json` file to disk.

### Script Stripping and Cue Compilation Rules

When `--script` is active, the parser removes leading YAML frontmatter blocks (`--- ... ---`) while retaining metadata such as `episode_id` and `working_title` in the output packet. It strips all bracketed stage and graphics cues (`[ON SCREEN: ...]`, `[STAGE: ...]`, `[VISUAL: ...]`, `[AUDIO: ...]`, `[SFX: ...]`, `[MUSIC: ...]`, `[CHYRON: ...]`, `[CARD: ...]`, `[CUTAWAY: ...]`, `[B-ROLL: ...]`) and logs the stripped count under `extraction_stats.stripped_stage_cues`. Markdown heading markers and inline emphasis asterisks are removed cleanly while decimal numbers, case names like `SEC v. Dean L. Buntrock et al.`, and account identifiers like `401(k)` remain intact.

Spoken sentences then compile into subtitle cues obeying four broadcast bounds:

1. Maximum line width: 42 visible characters per line, measured after stripping invisible Unicode direction marks.
2. Maximum vertical stack: 2 lines per cue, balanced near the center space so the first line avoids short orphan trails.
3. Duration floor and ceiling: every cue lasts between 1.2s and 6.5s (`1200ms` to `6500ms`) calculated from word count at the configured `--wpm` pace (`150 wpm` equals 2.5 words per second).
4. Inter-cue cadence: consecutive cues maintain a 40ms gap between `end_ms` and the following `start_ms`.

Short standalone sentences under 3 words merge with adjacent sentences inside the same paragraph whenever the combined cue stays within 84 visible characters and the `6.5s` ceiling. Sentences exceeding 16 words or 84 characters split at natural clause punctuation (`,`, `;`, `:`) or prepositions and conjunctions before falling back to space boundaries.

When `--srt` is active, the parser reads `.srt` or WebVTT (`WEBVTT`) blocks, strips `NOTE`, `STYLE`, `REGION`, and inline HTML span tags, records any compliance violations found in the source file (`input_violations`), and re-wraps or splits overlong cues proportionally across the original timestamp window.

### Glossary Loading and Translation-Lock Schema

If `--glossary` is omitted, the CLI searches `05_mastery_and_translation/glossary_en_fa.json` relative to the tool path and working directory. Whenever that file is absent or unreadable, the tool loads its built-in 25-term fallback glossary covering core SEC, IRS, GAAP, credit, and retirement terms from Episodes 01 through 03 (`Form 10-K`, `Form 10-Q`, `Form 8-K`, `Note 1`, `useful life`, `straight-line depreciation`, `bonus depreciation`, `IRC Section 168(k)`, `GAAP`, `free cash flow`, `operating cash flow`, `Statement of Cash Flows`, `capital spending`, `Special Purpose Vehicle`, `ASC 842`, `Remaining Performance Obligations`, `take-or-pay`, `impairment charges`, `restatement`, `salvage values`, `401(k)`, `S&P 500`, `Treasury bills`, `Form 4562`, and `Internal Revenue Code`).

Matchers precompile both `english_term` and every entry in `aliases`, sorted longest-first with alphanumeric lookaround boundaries. Matching `"straight-line depreciation"` blocks a redundant nested hit for `"depreciation"` on the same character span while preserving distinct matches elsewhere in the cue. Each hit attaches `term_id`, `matched_text`, `domain`, `plain_camera_english`, `false_friend_or_trap`, and locked translations for every code in `--langs`. For RTL targets (`fa` and `ar`), each lock includes both plain dictionary text and a BiDi-isolated variant (`fa_bidi`, `ar_bidi`).

### Example Packet Workflow

Run a dry validation and inspect JSON metrics on Episode 03:

```bash
node 05_mastery_and_translation/tools/subtitle_translator_prep.mjs \
  --script 04_scripts_and_dossiers/ep_03_the_depreciation_trick/ep_03_script_clean.md \
  --json
```

Export broadcast master files, five-language prep scaffolds, and the translation lock packet to a build directory:

```bash
node 05_mastery_and_translation/tools/subtitle_translator_prep.mjs \
  --script 04_scripts_and_dossiers/ep_03_the_depreciation_trick/ep_03_script_clean.md \
  --out-dir ./build/ep_03_subs
```

Harden a translated Persian `.srt` file before YouTube Studio upload:

```bash
node 05_mastery_and_translation/tools/subtitle_translator_prep.mjs \
  --srt ./build/ep_03_subs/ep_03.fa.translated.srt \
  --source-lang fa \
  --langs fa,ar \
  --out-dir ./build/ep_03_subs_qa
```

## 2. YouTube Studio 5-Language Subtitle Publishing (`EN`, `FA`, `AR`, `ES`, `DE`)

Every episode publishes with five verified human-edited caption tracks paired to localized titles and descriptions inside YouTube Studio. Automated YouTube translation stays turned off across all financial essays because statistical translation destroys statutory accuracy, turning `Note 1` into a generic note, `bonus depreciation` into an employee bonus, `Special Purpose Vehicle` into an automobile, and `free cash flow` into complimentary cash.

### Pre-Upload File Preparation

| Language | Code | Direction | Preferred Upload Format | Key Localization Rule |
| :--- | :--- | :--- | :--- | :--- |
| English | `en` | LTR | `.vtt` or `.srt` | Match verbatim spoken script at 42 chars/line |
| Persian | `fa` | RTL | `.vtt` (UTF-8) | Wrap all figures, forms, and acronyms in LRI/PDI |
| Arabic | `ar` | RTL | `.vtt` (UTF-8) | Use formal Modern Standard financial terms with LRI/PDI |
| Spanish | `es` | LTR | `.vtt` or `.srt` | Keep `ASC 842`, `10-K`, and `401(k)` codes intact |
| German | `de` | LTR | `.vtt` or `.srt` | Trim compound noun phrases to fit 42 chars/line |

Wait until the picture-locked video cut has final millisecond timing before uploading caption files. Export clean `.srt` or `.vtt` tracks without internal translator `NOTE` lines if uploading to third-party players, though YouTube WebVTT ignores `NOTE` blocks safely.

### YouTube Studio Upload Sequence

1. Upload the picture-locked video as Unlisted and let YouTube complete HD processing.
2. Open YouTube Studio, select Subtitles in the left navigation bar, and confirm the video language is set to English (`United States`).
3. Upload the master `en` `.vtt` file using Upload file with timing. Open the YouTube editor timeline and scrub three checkpoints (00:15, 08:00, and final 30 seconds) to confirm zero audio drift.
4. Click Add Language for Persian (`fa`), Arabic (`ar`), Spanish (`es`), and German (`de`).
5. For each added language, first enter the localized Title and Description so search discovery and mobile browse cards display native metadata immediately.
6. Next, upload the corresponding `.vtt` caption track under Subtitles using Upload file with timing.
7. Save each track as Published while the video itself remains Unlisted, allowing full multi-device QA before public release.

### Viewport Safe-Zone Verification

Subtitles that pass desktop 16:9 review can still wrap onto three lines or collide with mobile UI controls if line budgets are exceeded. Inspect the Unlisted video across three screens:

1. Desktop Chrome at 1920x1080: confirm lower-third graphics and `[ON SCREEN: ...]` Liquid Glass cards leave the bottom 15 percent clear for two-line captions.
2. iOS or Android YouTube app in vertical portrait and horizontal fullscreen: verify no cue wraps onto a third line inside the default caption font scale.
3. Smart TV app or 10-foot dark room preview: confirm high-contrast white-on-translucent-black readability and zero overlap with chapter markers.

## 3. RTL BiDi Number and Citation Rendering (`FA`, `AR`)

Unprotected RTL subtitles break numbers and legal codes on YouTube mobile. On Android and iOS renderers implementing the Unicode Bidirectional Algorithm (UAX #9), ASCII digits (`0-9`) carry weak European-number directionality, while currency signs (`$`), percent signs (`%`), minus signs (`-`), section symbols (`§`), and parentheses (`(` and `)`) carry neutral or weak directionality. When embedded directly inside a Persian or Arabic clause, the renderer applies surrounding RTL ordering to adjacent neutral symbols.

The table below shows how YouTube mobile mangles unprotected financial tokens compared against isolated output.

| Raw Financial Token | Unprotected Mobile Render | BiDi-Isolated Token | Rendered Mobile Output |
| :--- | :--- | :--- | :--- |
| `$40.5T` | `40.5T$` or `T40.5$` | `` `\u2066` `` + `$40.5T` + `` `\u2069` `` | `$40.5T` |
| `86.4%` | `%86.4` | `` `\u2066` `` + `86.4%` + `` `\u2069` `` | `86.4%` |
| `-$42.4B` | `$42.4B-` | `` `\u2066` `` + `-$42.4B` + `` `\u2069` `` | `-$42.4B` |
| `IRC § 168(k)` | `(k)168 § IRC` | `` `\u2066` `` + `IRC § 168(k)` + `` `\u2069` `` | `IRC § 168(k)` |
| `401(k)` | `(k)401` | `` `\u2066` `` + `401(k)` + `` `\u2069` `` | `401(k)` |
| `S&P 500` | `500 S&P` | `` `\u2066` `` + `S&P 500` + `` `\u2069` `` | `S&P 500` |

### Why LRI/PDI Beats Legacy LRM and LRE

Legacy subtitle scripts sometimes insert a single Left-to-Right Mark (`` `\u200E` ``) before a number or wrap spans in Left-to-Right Embedding (`` `\u202A` ``) and Pop Directional Formatting (`` `\u202C` ``). Both fail on edge cases. A bare `` `\u200E` `` does not bind trailing punctuation like `%` or closing parentheses `)` after `401(k)`. Worse, if a subtitle line begins with a Latin token like `Form 10-K` or `401(k)`, an initial `` `\u200E` `` or bare Latin letter forces UAX #9 Rule P2 to classify the entire line as LTR base direction, scrambling the Persian words that follow.

Unicode Left-to-Right Isolate (`` `\u2066` ``, `LRI`) paired with Pop Directional Isolate (`` `\u2069` ``, `PDI`) resolves both failures simultaneously. Inside the isolate pair, `$40.5T`, `86.4%`, and `IRC § 168(k)` execute inside an independent LTR embedding run so signs, decimals, and parentheses stay locked left-to-right. Outside the pair, UAX #9 Rule P2 skips the isolated span when determining paragraph base direction, keeping the cue anchored on the surrounding Persian or Arabic words.

### RTL QA Protocol on Mobile Hardware

1. Run `subtitle_translator_prep.mjs --srt <translated_rtl.srt> --source-lang <fa|ar> --out-dir <qa_dir>` after human translation finishes.
2. Verify `validation.broadcast_compliant` reports `true`, confirming zero lines exceed 42 visible characters and zero cues violate the `1.2s` to `6.5s` window.
3. Inspect `cues` inside the exported `.translation_packet.json` for every currency amount, percentage, negative sign, `401(k)`, `10-K`, and `IRC § 168(k)` to confirm balanced `` `\u2066` `` and `` `\u2069` `` boundaries.
4. Play the Unlisted upload on both an iOS device and an Android device with Persian (`fa`) and Arabic (`ar`) captions enabled, scrubbing directly to cues containing `$40.5T`, `86.4%`, `-$42.4B`, and `IRC § 168(k)` before scheduling release.

## 4. Multi-Language Audio Track (MLA) Dubbing and Sync QA

YouTube Multi-Language Audio lets viewers switch spoken narration natively between `en`, `fa`, `ar`, `es`, and `de` without leaving the main video URL. Because the dub voice shares the exact video timeline and visual graphics of the English cut, audio adaptation requires strict timing parity, stem mixing discipline, and terminology alignment with the localized subtitle track.

### Language Expansion and Pacing Budgets

The English camera cut runs at `150 wpm`. Translated spoken scripts expand in syllable duration depending on target grammar and formal accounting phrasing:

| Track | Expansion Ratio vs EN | Target Dub Strategy |
| :--- | :--- | :--- |
| Persian (`fa`) | 1.05x | Keep English form codes (`10-K`, `ASC 842`, `SPV`) short and crisp; trim redundant filler conjunctions |
| Arabic (`ar`) | 1.08x | Favor concise active verb forms in Modern Standard Arabic so pauses align with visual cuts |
| German (`de`) | 1.10x | Split stacked compound nouns into cleaner two-clause phrasing inside breath gaps |
| Spanish (`es`) | 1.15x | Condense introductory clauses while preserving every statutory citation and dollar figure intact |

Every dubbed segment must land inside the same `[ON SCREEN: ...]` visual beat boundaries as the English track. Voice actors must match the calm, investigative editorial posture of the channel and keep commercial promo cadence out of the booth.

### Stem Mixing and Loudness Targets

Dubbing studios receive two separate stems from the English edit: the clean Dialogue reference stem (for timing and tone matching) and the Music-and-Effects (M&E) stem containing room tone, sound effects, desk props, and score without English voice.

1. Integrated loudness: master each final dubbed mix to `-14.0 LUFS` (`+/- 1.0 LU`) over full episode duration.
2. True peak ceiling: cap peaks at `-1.0 dBTP` to prevent AAC transcode clipping inside YouTube audio encoding.
3. Music and SFX ducking: attenuate the M&E bed by `-18 dB` beneath active dub narration, matching the attack (`40ms`) and release (`250ms`) envelope of the English master.
4. Breath and noise floor: maintain natural room tone during inter-sentence pauses without hard noise-gate drops to digital silence (`-inf dBFS`).
5. Frame-exact total duration: export the final `48 kHz / 24-bit` WAV track at the identical sample count and millisecond length of the English master timeline.

### Cross-Track Synchronization and Release Sign-Off

Before flipping a dubbed episode to Public, an auditor verifies five anchor timestamps per language across the video player: Cold Open hook, primary tax citation (`IRC Section 168(k)` or equivalent), negative cash flow reveal (`-$42.4B`), counterparty SPV debt breakdown, and closing viewer checklist.

At each checkpoint, confirm four gates pass together:

1. Spoken dub term matches the locked entry in `glossary_en_fa.json` (`persian_exact` or `multilang_locks`).
2. Localized `.vtt` subtitle on screen uses the identical legal and accounting term as the spoken dub audio.
3. Graphics card on screen appears during the exact sentence referencing that number or filing.
4. Switching tracks live inside the YouTube gear menu between `en`, `fa`, `ar`, `es`, and `de` produces smooth loudness continuity with zero phase drift or clipped endings.
