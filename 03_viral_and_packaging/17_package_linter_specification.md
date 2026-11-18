# Deliverable 17: Title and thumbnail automated linter specification

`03_viral_and_packaging/tools/package_lint.py` is the deterministic packaging compiler gate for The Reading Room Editorial OS. Every candidate A/B/C pair in `03_viral_and_packaging/16_90_pair_title_thumbnail_vault.json` and every ad-hoc studio title swap must pass this five-gate tool before graphic export or YouTube Test and Compare upload.

The script runs on Python 3.9 or newer using only the Python standard library. Color tokens, contrast targets, and studio framing modes lock directly to `01_identity_and_strategy/cinema_schema_contract.json`, while episode horizons and acronym whitelists match `02_research_and_data/slate_30_jan2028.json`.

## Execution modes and CLI surface

Producers and automation scripts can invoke `package_lint.py` in three ways from the repository root:

1. Vault audit mode (`--vault`): loads `03_viral_and_packaging/16_90_pair_title_thumbnail_vault.json` by default, inspects all 30 episodes and 90 A/B/C variant pairs, verifies intra-episode variant uniqueness, and exits `0` when zero pairs fail.
2. Ad-hoc pair mode (`--title` and `--thumb`): evaluates a single proposed title and thumbnail string from the terminal with optional `--episode-id`, `--bg`, `--fg`, `--accent`, `--elements`, and `--composition` flags.
3. Built-in verification mode (`--self-test`): runs 13 deterministic unit and integration assertions, including a full 30-episode strict pass against every working title in `02_research_and_data/slate_30_jan2028.json`.

Adding `--strict` turns target-band advisories into hard failures. Adding `--json` prints structured telemetry to standard output for CI checks and the offline HTML squint tester (`03_viral_and_packaging/tools/thumb_test_sheet.html`).

## Architecture of the five deterministic gates

### Gate 1: character band and proportional pixel-width truncation

Fixed character thresholds miss proportional typography traps because uppercase `W`, `M`, `G`, and `%` glyphs consume up to 3.5 times the horizontal advance of `i`, `l`, or `t` in Roboto Medium and YouTube Sans Medium. Gate 1 combines explicit character bounds with a greedy two-line browser word-wrap simulator (`-webkit-line-clamp: 2`).

Character length rules operate across two tiers:

- Hard failure bounds (active in all modes): any title shorter than `24` characters fails `G1_CHAR_UNDER_HARD_MIN` for starving search and browse context, while any title above `52` characters fails `G1_CHAR_OVER_HARD_MAX`.
- Reading Room target band (`31` to `42` characters): standard mode emits `G1_CHAR_OUTSIDE_TARGET_BAND` as a non-blocking warning between `24` and `30` characters or between `43` and `52` characters, whereas `--strict` escalates any miss outside `31` to `42` characters to a hard failure. Every canonical working title in `slate_30_jan2028.json` lands between `33` and `39` characters.

After checking character length, `simulate_two_line_wrap()` multiplies each character's calibrated Roboto Medium advance width (`em`) by the viewport font size (`px`) and wraps words greedily across four client containers:

| Surface ID | YouTube viewport | Text container (`px`) | Font size (`px`) | Line cap | Two-line capacity (`px`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ios_home_feed` | iOS Home Feed (`390px` card) | `294` | `15` | `2` | `588` |
| `android_suggested_250px` | Android Suggested (`250px`) | `250` | `14` | `2` | `500` |
| `desktop_home_340px` | Desktop Home (`340px` grid) | `340` | `16` | `2` | `680` |
| `desktop_up_next_168px` | Desktop `168px` Up-Next rail | `202` | `14` | `2` | `404` |

On the Desktop Watch Page right rail (`desktop_up_next_168px`), YouTube renders a `168x94` pixel thumbnail beside a `202` pixel metadata column set in `14px` Roboto Medium. Whenever a title wraps onto a third line on any of the four viewports, Gate 1 fails immediately with `G1_PIXEL_TRUNCATION_<SURFACE>`, catching wide-glyph titles even when raw character count sits under `52`.

### Gate 2: zero title-thumbnail lexical and numeric duplication

A title and thumbnail form a single click unit. Repeating the same noun or statistic across both surfaces wastes half of the impression. Gate 2 enforces strict complementary tension through two stem comparators:

1. Content-word morphological stemmer (`G2_DUPLICATE_CONTENT_STEM`): extracts alphabetic words of `3` or more letters after protecting `401(k)` tokens and stripping trailing `'s` possessives. Tiny function and question words (`the`, `a`, `an`, `and`, `of`, `in`, `to`, `on`, `by`, `for`, `at`, `is`, `if`, `or`, `vs`, `from`, `into`, `out`, `now`, `why`, `how`, `who`, `what`, `when`, `where`) are excluded. Remaining content words pass through an irregular financial verb map (`pays`/`paid` to `pay`, `stolen`/`stole` to `steal`, `froze`/`frozen` to `freez`, `buys`/`bought` to `buy`, `breaks`/`broken` to `break`) and deterministic suffix stripping (`-ies`, `-ves`, `-ing`, `-ed`, `-es`, `-s`, `-ly`, plus silent `-e` normalization on stems of `5` or more letters). Pairing `"Why Banks Keep Money Stolen by AI"` with `"BANKING LOOPHOLE"` fails on shared stem `bank`, while pairing it with `"$0 REFUND"` passes cleanly.
2. Scale-normalized numeric comparator (`G2_DUPLICATE_NUMERIC_STEM`): parses currency figures, percentages, multipliers, physical units, comma-formatted thousands (`$16,000` normalized to `16k`), and `401(k)` strings. Exact stem collisions (`$40T` with `$40T`) and rounded headline echoes sharing the same unit at `10` or above (`$40.5T` in the title with `$40T` on the thumbnail, or `86.4%` with `86%`) fail `G2_DUPLICATE_NUMERIC_STEM`. Pairing two distinct ledger numbers such as `"If AI Takes Jobs, Who Pays $40.5T Debt?"` with `"86% WAGES"` passes.

### Gate 3: thumbnail cognitive budget and WCAG 2.1 contrast

Mobile viewers evaluate a feed thumbnail in roughly half a second at `210x118` CSS pixels. Gate 3 locks visual restraint and optical legibility across four deterministic checks:

- Overlay word count (`1` to `3` words): empty strings fail `G3_THUMB_EMPTY`, and overlays of `4` or more words fail `G3_THUMB_OVER_3_WORDS`.
- Overlay character cap (`<= 20` characters): strings exceeding `20` characters fail `G3_THUMB_OVER_20_CHARS` so typography stays bold at compact sidebar scale.
- Focal element cap (`element_count <= 3`): compositions listing `0` or `4+` focal elements fail `G3_ELEMENT_COUNT_OVER_BUDGET`.
- Linearized WCAG 2.1 luminance contrast: `compute_wcag_contrast()` converts `#RRGGBB` values for `background_hex` and `text_hex` into linearized sRGB channels (`s / 12.92` when `s <= 0.04045`, otherwise `((s + 0.055) / 1.055) ** 2.4`), sums relative luminance `L = 0.2126*R + 0.7152*G + 0.0722*B`, and computes `(L_max + 0.05) / (L_min + 0.05)`.

Pairs scoring below `4.5:1` fail `G3_WCAG_CONTRAST_FAIL`. Pairs between `4.5:1` and `6.99:1` clear WCAG AA while raising `G3_WCAG_BELOW_AAA_TARGET` against the `7.0:1` house floor defined in `cinema_schema_contract.json`.

| Palette pairing | `background_hex` | `text_hex` | WCAG 2.1 ratio | Gate 3 result |
| :--- | :--- | :--- | :--- | :--- |
| Smoked Navy primary | `#1C2B3A` | `#FAF8F3` | `13.59:1` | `PASS` (`AAA`) |
| Milk-Page primary | `#FAF8F3` | `#1C2B3A` | `13.59:1` | `PASS` (`AAA`) |
| Liability Brick on Milk-Page | `#FAF8F3` | `#A3402E` | `5.95:1` | `PASS` (`WARN` below `7.0` AAA) |
| Solvent Teal on Milk-Page | `#FAF8F3` | `#2F8F8B` | `3.65:1` | `FAIL` (`< 4.5` AA; accent-only token) |

Because Solvent Teal (`#2F8F8B`) measures `3.65:1` against `#FAF8F3`, editors reserve `#2F8F8B` strictly for `accent_hex` chart bars, callout rules, and highlight strokes while keeping foreground typography in `#1C2B3A` or `#FAF8F3`.

### Gate 4: anti-clickbait, staleness, acronym whitelist, and punctuation

Gate 4 protects The Reading Room's shirt-and-tie investigative authority across five lexical and typographic filters:

1. Forbidden punctuation: rejects `!` (`G4_EXCLAMATION_MARK`), em dashes (`G4_EM_DASH`), en dashes (`G4_EN_DASH`), double hyphens (`G4_DOUBLE_HYPHEN`), ASCII `...` (`G4_ASCII_ELLIPSIS`), and Unicode `…` (`G4_UNICODE_ELLIPSIS`) in both `title` and `thumbnail_text`.
2. Shouting uppercase filter in `title`: rejects uppercase words of `5` or more letters (`G4_SHOUTING_ALL_CAPS`, such as `CRASH`, `SECRET`, or `BROKEN`) and runs of `3` or more short uppercase words (`G4_SHOUTING_TITLE_RUN`). Domain initialisms and statutory names are whitelisted, including `GENIUS`, `CISA`, `ERCOT`, `FICO`, `GAAP`, `GPUs`, `UBI`, `PJM`, `FDIC`, `SWIFT`, `DRAM`, `TSMC`, `ASML`, `SaaS`, and `401(k)`, alongside primary-source agency codes from the 30-episode slate (`FINCEN`, `CALEA`, `KOSTAT`, `MIDAS`, `NERC`, `LBNL`, `USGS`, `OASDI`, `OASI`, `SIPC`, `FICA`, `SCADA`, `COBOL`, `CHIPS`, `eIDAS`, `CFIUS`, `NIST`, `FIPS`).
3. Evergreen calendar lock (`G4_STALE_YEAR_STAMP`): rejects `2021` through `2026` year stamps across `ep_04` through `ep_30` (publishing March 2027 through January 2028) so evergreen episodes never age on arrival. Forward statutory deadlines such as `2027`, `2028`, `2030`, `2032`, and `2036` pass cleanly.
4. Clickbait phrase blacklist (`G4_CLICKBAIT_SLOP`): rejects `shocking`, `insane`, `everything changed`, `changes everything`, `it's over`, `nobody talks about`, `no one talks about`, `secret`, `destroyed`, `terrifying`, `unbelievable`, `you won't believe`, `mind-blowing`, `jaw-dropping`, `gone wrong`, and `must watch`.
5. Anti-AI lexicon and negative-contrast filter (`G4_BANNED_AI_WORD` and `G4_BANNED_AI_PATTERN`): enforces parity with `04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs` by rejecting banned AI vocabulary (`delve`, `tapestry`, `pivotal`, `crucial`, `leverage`, `utilize`, `landscape`, `realm`, `paradigm`, `robust`, `comprehensive`, `seamless`, `nuanced`, `multifaceted`, `foster`, `bolster`, `underscore`, `showcase`, `intricate`, `vibrant`, `enduring`, `unpack`, `interplay`, `genuinely`, `profound`, `remarkable`, `unprecedented`, `transformative`, `groundbreaking`, `paramount`, `deep dive`, `at its core`) and `not X, but Y` or `rather than` pivots.

### Gate 5: deterministic 0 to 100 specificity score

Generic titles depress click-through among analytical viewers. Gate 5 computes an additive `0` to `100` Specificity Score across the combined `(title, thumbnail_text)` pair:

- Quantitative and mechanism anchor (`0` to `40` points): awards `+24` for currency amounts (`$40.5T`, `$176B`, `$20K`, `$0`), `+22` for percentages or ratios (`86%`, `5x`, `1:1`), `+22` for physical units, durations, or statutory years (`128-Week`, `2nm`, `33B`, `401(k)`, `2032`), and `+16` multi-number complement credit when two or more numeric figures appear across the pair (capped at `40`). Non-numeric statutory or physical collisions carrying three or more concrete domain nouns earn `+20` mechanism points.
- Institutional and balance-sheet nouns (`0` to `35` points): awards `+16` for one, `+26` for two, and `+35` for three or more concrete sovereign, statutory, financial, or hardware nouns (`Treasury`, `Debt`, `FDIC`, `GAAP`, `SaaS`, `401(k)`, `Mortgage`, `ERCOT`, `TSMC`, `ASML`, `Subsea`, `Fertilizer`, `Courtroom`, `Cartel`, `Quantum`, `Social Security`).
- Causal and interrogative tension (`0` to `25` points): awards `+15` for interrogative, conditional, or colon-ledger framing (`If`, `Who`, `Why`, `How`, `What`, `When`, `Can`, `:`, or `?`) and `+15` for asymmetric collision verbs or pivots (`vs`, `Pays`, `Buys`, `Erased`, `Stolen`, `Froze`, `Controls`, `Owns`, `Testifies`, `Cliff`, `Clock`, `Trick`, `Trap`, `Shield`, `Switch`), capped at `25`.
- Vagueness penalty: subtracts `15` points per vague filler phrase (`things`, `stuff`, `future of`, `impact of`, `role of`, `modern`, `various`, `interesting`).

Scores below `50` fail `G5_LOW_SPECIFICITY` in all modes. Scores from `50` to `64` trigger `G5_MODERATE_SPECIFICITY` (`WARN` in standard mode, `FAIL` in `--strict`). Across all 90 pairs in `16_90_pair_title_thumbnail_vault.json`, strict audit clears `90 / 90` pairs with a mean specificity of `82.2 / 100` and a mean WCAG contrast of `13.59:1`.

## Rule code and severity reference

| Rule code | Gate | Default | `--strict` | Trigger condition |
| :--- | :--- | :--- | :--- | :--- |
| `G1_CHAR_UNDER_HARD_MIN` | Gate 1 | `FAIL` | `FAIL` | Title shorter than `24` characters |
| `G1_CHAR_OVER_HARD_MAX` | Gate 1 | `FAIL` | `FAIL` | Title longer than `52` characters |
| `G1_CHAR_OUTSIDE_TARGET_BAND` | Gate 1 | `WARN` | `FAIL` | Title length outside `31` to `42` characters |
| `G1_PIXEL_TRUNCATION_*` | Gate 1 | `FAIL` | `FAIL` | Proportional Roboto wrap exceeds `2` lines on viewport |
| `G2_DUPLICATE_CONTENT_STEM` | Gate 2 | `FAIL` | `FAIL` | Shared `>= 3`-letter content-word stem across title and thumb |
| `G2_DUPLICATE_NUMERIC_STEM` | Gate 2 | `FAIL` | `FAIL` | Identical or rounded headline numeric stem across title and thumb |
| `G3_THUMB_EMPTY` | Gate 3 | `FAIL` | `FAIL` | Thumbnail overlay has `0` words |
| `G3_THUMB_OVER_3_WORDS` | Gate 3 | `FAIL` | `FAIL` | Thumbnail overlay exceeds `3` words |
| `G3_THUMB_OVER_20_CHARS` | Gate 3 | `FAIL` | `FAIL` | Thumbnail overlay exceeds `20` characters |
| `G3_ELEMENT_COUNT_OVER_BUDGET` | Gate 3 | `FAIL` | `FAIL` | `element_count` outside `1` to `3` focal elements |
| `G3_WCAG_CONTRAST_FAIL` | Gate 3 | `FAIL` | `FAIL` | WCAG 2.1 luminance contrast below `4.5:1` |
| `G3_WCAG_BELOW_AAA_TARGET` | Gate 3 | `WARN` | `WARN` | WCAG 2.1 luminance contrast between `4.5:1` and `6.99:1` |
| `G4_EXCLAMATION_MARK` / `G4_*` | Gate 4 | `FAIL` | `FAIL` | `!`, `—`, `–`, `--`, `...`, or `…` in title or thumbnail |
| `G4_SHOUTING_ALL_CAPS` | Gate 4 | `FAIL` | `FAIL` | Non-whitelisted uppercase word `>= 5` letters in title |
| `G4_STALE_YEAR_STAMP` | Gate 4 | `FAIL` | `FAIL` | `2021` to `2026` year stamp on `ep_04` through `ep_30` |
| `G4_CLICKBAIT_SLOP` | Gate 4 | `FAIL` | `FAIL` | Clickbait sensationalism token in title or thumbnail |
| `G4_BANNED_AI_WORD` / `PATTERN` | Gate 4 | `FAIL` | `FAIL` | Banned AI word or negative-contrast crutch |
| `G5_LOW_SPECIFICITY` | Gate 5 | `FAIL` | `FAIL` | Specificity Score below `50 / 100` |
| `G5_MODERATE_SPECIFICITY` | Gate 5 | `WARN` | `FAIL` | Specificity Score between `50` and `64 / 100` |

## CLI invocation examples and JSON schema

Run from `d:/Youtube channel/reading-room-editorial-os`:

```bash
# Run the 13-case built-in verification suite (exits 0 on GATE: PASS)
python 03_viral_and_packaging/tools/package_lint.py --self-test

# Audit the full 90-pair packaging vault in strict mode with JSON output
python 03_viral_and_packaging/tools/package_lint.py \
  --vault 03_viral_and_packaging/16_90_pair_title_thumbnail_vault.json \
  --strict --json

# Lint an ad-hoc single pair from the command line
python 03_viral_and_packaging/tools/package_lint.py \
  --title "Why AI Erased the First Career Rung" \
  --thumb "-19% HIRING" \
  --episode-id ep_04 \
  --bg "#FAF8F3" --fg "#1C2B3A" --elements 3 --strict
```

In `--json` vault mode, standard output emits `{ gate, passed, strict, source, summary, schema_issues, results }`. Each item in `results` includes `pair_id`, `episode_id`, `variant_id`, `status`, `specificity_score`, `contrast_ratio`, `wcag_tier`, `violations`, `warnings`, and per-gate diagnostic subtrees (`gate_1_truncation` through `gate_5_specificity`) consumed directly by pre-publish automation.
