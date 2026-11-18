# Deliverable 25: Stage 6 anti-AI and spoken-cadence gate specification

`04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs` is the deterministic Stage 6 compiler gate for The Reading Room Editorial OS. Every flagship teleprompter script, vertical Short cut, research dossier, and production specification must clear this gate with `score = 0` before entering studio recording or Cinema timeline compilation.

The tool runs on Node.js 20 or newer as a standalone ES module with zero external npm packages. Thresholds lock directly to `01_identity_and_strategy/creator_blend_weights.json` and the calibrated Episode 01 benchmark (`04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md`, which measures `3,324` words, `200` sentences, `16.62` mean words per sentence, `7.00%` sentences above `30` words, `15.34` spoken contractions per `1,000` words, and a `9.28` Flesch-Kincaid Grade Level).

## Validation profiles across editorial surfaces

Pass `--mode <script|vertical|prose>` to select the surface ruleset. When omitted, the gate defaults to `script`.

| Dimension | `script` (Flagship long-form) | `vertical` (45 to 60s Shorts) | `prose` (Dossiers and specs) |
| :--- | :--- | :--- | :--- |
| Check 1 banned catalog (239 entries) | Enforced (`0` hits) | Enforced (`0` hits) | Enforced (`0` hits) |
| Check 2 host `avoid-ai-writing` check | Enforced (`score = 0`, `general`) | Enforced (`score = 0`, `general`) | Enforced (`score = 0`, `technical`) |
| Check 3 negative-contrast crutches | Enforced (`0` hits) | Enforced (`0` hits) | Enforced (`0` hits) |
| Check 4 em/en dashes, `--`, and `!` | Enforced (`0` hits) | Enforced (`0` hits) | Enforced (`0` hits outside code) |
| Check 4 semicolons (`;`) | Banned (`0` hits) | Banned (`0` hits) | Permitted in written prose |
| Check 5 triads, 3x equal length, parataxis | Enforced (`0` hits) | Enforced (`0` hits) | Enforced on narrative paragraphs |
| Check 6 mean sentence words | `15.5` to `17.5` (`~16.6` target) | `11.0` to `17.5` | Telemetry reported (unbounded) |
| Check 6 sentences `> 30` words | `< 8.0%` | `< 8.0%` | Telemetry reported |
| Check 6 spoken contractions per `1k` | `>= 10.0` | `>= 10.0` | Telemetry reported |
| Check 6 Flesch-Kincaid Grade Level | `<= 10.5` | `<= 10.5` | Telemetry reported |

## Architecture of the six deterministic checks

### Check 1: 112+ banned AI vocabulary, slop phrase, and cluster catalog

Check 1 embeds `239` lexical entries organized into four deterministic layers mapped to house rules `L32` and `L13_L14_HOUSE`:

1. Tier 1A unconditional word families (`141` inflected forms): flags stock LLM vocabulary on first sighting, including `delve`, `tapestry`, `testament`, `pivotal`, `crucial`, `utilize`, `realm`, `paradigm`, `comprehensive`, `seamless`, `nuanced`, `multifaceted`, `bolster`, `underscore`, `showcase`, `intricate`, `vibrant`, `enduring`, `interplay`, `genuinely`, `profound`, `remarkable`, `unprecedented`, `transformative`, `groundbreaking`, `paramount`, `moreover`, `furthermore`, `additionally`, `notably`, `game-changer`, `cutting-edge`, `meticulous`, `garner`, `commence`, `synergy`, `holistic`, `actionable`, `spearhead`, `revolutionize`, `elucidate`, `juxtapose`, and `reimagine`.
2. Context-disambiguated stems (`8` stems): flags figurative `landscape` while sparing physical geography (`arid desert landscape`), flags buzzword/verb `leverage` while sparing accounting ratios (`balance-sheet leverage ratios`, `financial leverage`), flags `robust` outside statistical prose (`robust standard errors`), flags verb `highlight` (`these filings highlight`) while sparing physical nouns (`one yellow highlight`), flags metaphorical `unpack` while sparing physical containers, and spares capitalized surname `Foster`.
3. Tier 1B boilerplate phrases and chatbot residue (`30` multi-branch regexes covering `55+` surface phrases): catches `deep dive`, `let's dive in`, `at its core`, `here's the thing`, `truth is,`, `buckle up`, `let that sink in`, `read that again`, `in conclusion`, `in today's fast-paced`, `it's worth noting`, `at the end of the day`, `watershed moment`, `only time will tell`, `move the needle`, unnamed authority (`experts believe`, `studies show`), and cutoff disclaimers. Tier 1C locks shirt-and-tie restraint (`0` profanity or street-slang tokens).
4. Tier 2 paragraph cluster gate (`60` inflected forms): permits a single isolated occurrence of words like `quietly`, `ecosystem`, `navigate`, `harness`, `facilitate`, `underpin`, or `burgeoning`, and triggers `L32_TIER2_CLUSTER` whenever two or more distinct Tier 2 words stack inside one paragraph.

Before lexical scanning, `scanAndNormalizeObfuscation()` flags invisible zero-width bypass characters (`U+200B` through `U+200D`, `U+FEFF`, `U+2060`) and swaps Cyrillic or Greek Latin-lookalike homoglyphs inside Latin words so obfuscated tokens still fail both `L32_HOMOGLYPH_BYPASS` and `L32_BANNED_VOCAB`.

Primary-source protection runs first via `buildWorkingViews()`. Verbatim double-quoted excerpts up to `320` characters, italicized case or publication citations (`*Wielechowski v. State*`), and capitalized statutory titles (`Fair Labor Standards Act of 1938`) are replaced with spaces while keeping every newline character at its original index. Offending tokens inside protected citations appear in `checks[0].protectedHits` for audit visibility without failing the build.

### Check 2: optional host `avoid-ai-writing` detector cross-check

Check 2 probes for an installed `avoid-ai-writing` detector (`detector/patterns.js`) in three locations: `process.env.AVOID_AI_WRITING_DETECTOR_PATH`, `C:/Users/youza/.gemini/config/skills/avoid-ai-writing/detector/patterns.js`, and `~/.gemini/config/skills/avoid-ai-writing/detector/patterns.js`.

When the host detector exists on disk, the gate loads it via `createRequire(import.meta.url)` and runs `analyzeText()` against the primary-source-masked buffer (`contextMode: 'general'` for scripts; `contextMode: 'technical'` and `sourceMode: 'rendered-markdown'` for prose). Passing requires `score === 0` and `document_classification === 'HUMAN_ONLY'`. Any nonzero score maps each detector issue back to its exact `1`-indexed line and column. On clean GitHub clones or CI runners where the global skill directory is absent, Check 2 records `STANDALONE_SKIP` and relies on the five internal checks with zero external failures.

### Check 3: zero negative-contrast crutches

Check 3 enforces rule `L50` across eight regex detectors with span deduplication. It rejects `rather than`, `not merely`, `not only X, but Y`, `not just X, but Y`, `not just X, it's Y`, `isn't X, it's Y`, `aren't X, they're Y`, `not X, but Y`, and split two-sentence reversals (`It's not X. It's Y.`). Writers must state what a mechanism actually does directly in positive terms, or compare two concrete options with `instead of` when both sides carry real numbers.

### Check 4: hard punctuation discipline

Check 4 enforces house rule `L33_HOUSE` on character codepoints:

- `U+2014` em dash: `0` allowed in any mode.
- `U+2013` en dash: `0` allowed in any mode (write `2025 to 2036` in spoken scripts and prose).
- `--` double or spaced hyphen splice: `0` allowed in spoken scripts, and `0` allowed in prose outside masked fenced code blocks, inline code spans, horizontal rules, and Markdown table separator lines.
- `U+0021` exclamation mark: `0` allowed in any mode.
- `U+003B` semicolon: `0` allowed in `script` and `vertical` teleprompter modes; permitted in `prose` mode.

### Check 5: anti-triad and sentence-length collision gate

Check 5 blocks three structural AI rhythm tells (`L31` and `L51`):

1. `L31_ABSTRACT_TRIAD`: scans `X, Y, and/or Z` constructions and checks whether all three head nouns carry abstract nominalization morphology (`-tion`, `-sion`, `-ity`, `-ness`, `-ism`, `-ance`, `-ence`, `-ency`, `-ment`, `-ship`, `-acy`, `-itude`) or belong to the abstract lexicon (`transparency`, `resilience`, `autonomy`, `sovereignty`, `synergy`). A concrete exemption set spares physical and institutional plurals (`substations`, `apartments`, `corporations`, `institutions`, `utilities`, `batteries`, `factories`, `ministries`, `payments`, `documents`), while clause-boundary guards stop the third slot before conjunctions such as `while` or `when`.
2. `L51_EQUAL_LENGTH_RUN`: flags any three consecutive sentences with identical word counts (`w[i] === w[i+1] === w[i+2]`).
3. `L51_PARATAXIS_CHAIN`: caps consecutive short declarative fragments (`<= 6` words) at two; three or more `<= 6`-word sentences in a row fail immediately.

### Check 6: spoken cadence and clarity band

Check 6 verifies camera-delivery rhythm across `script` and `vertical` modes:

- Mean sentence length must land inside `15.5` to `17.5` words for long-form scripts (`~16.6` channel blend target) or `11.0` to `17.5` words for `vertical` Shorts. When a draft misses the band, the diagnostic prints the exact line numbers and word counts of the four longest or shortest sentences to split or merge.
- Long-sentence tail (`> 30` words) must stay strictly below `8.0%`, listing the longest offending line numbers on failure.
- Spoken contractions density must reach `>= 10.0` per `1,000` words, counting `*n't`, `*'m`, `*'re`, `*'ve`, `*'ll`, `*'d`, pronoun/interrogative `*'s` forms (`it's`, `that's`, `who's`, `what's`, `let's`, `there's`), and noun `*'s` auxiliary contractions before articles, adverbs, and participles (`money's supposed`, `Washington's printing`, `Claire's a`) while ignoring possessive `'s` nouns (`America's debt`).
- Flesch-Kincaid Grade Level (`0.39 * ASL + 11.8 * ASW - 15.59`) must stay `<= 10.5` so complex sovereign-debt and engineering arguments sound natural out loud.

## Rule code and severity matrix

Each violation adds `5` points (`P0` hard lock) or `2` points (`P1` rhythm/cadence lock) to the failure score; the overall score takes `max(internalScore, hostDetectorScore)`.

| Rule code | Check | Severity | Trigger condition |
| :--- | :--- | :--- | :--- |
| `L32_BANNED_VOCAB` | Check 1 | `P0` (`+5`) | Unconditional Tier 1A AI word or unpermitted `robust` / `foster` / `unpack` |
| `L32_METAPHORICAL_LANDSCAPE` | Check 1 | `P0` (`+5`) | Non-geographic `landscape` or `landscapes` |
| `L32_LEVERAGE_BUZZWORD` | Check 1 | `P0` (`+5`) | Verb or buzzword `leverage` outside accounting ratio compounds |
| `L32_HIGHLIGHT_VERB` | Check 1 | `P0` (`+5`) | Verb `highlight`, `highlights`, or `highlighted` |
| `L32_SLOP_PHRASE` | Check 1 | `P0` (`+5`) | Staged opener, cliché closer, chatbot wrapper, or unnamed `experts believe` |
| `L32_UNICODE_BYPASS` | Check 1 | `P0` (`+5`) | Zero-width character (`U+200B` to `U+200D`, `U+FEFF`, `U+2060`) |
| `L32_HOMOGLYPH_BYPASS` | Check 1 | `P0` (`+5`) | Cyrillic or Greek lookalike letter inside a Latin token |
| `L13_L14_HOUSE` | Check 1 | `P0` (`+5`) | Profanity or street slang violating shirt-and-tie posture |
| `L32_TIER2_CLUSTER` | Check 1 | `P1` (`+2`) | Two or more distinct Tier 2 stems inside the same paragraph |
| `L46_HOST_*` | Check 2 | `P0`/`P1` | Nonzero `avoid-ai-writing` host detector score or non-`HUMAN_ONLY` label |
| `L50_*` | Check 3 | `P0` (`+5`) | Any `not X, but Y`, `not just`, `isn't X, it's Y`, or `rather than` pivot |
| `L33_*` | Check 4 | `P0` (`+5`) | `U+2014`, `U+2013`, `--`, `!`, or spoken-mode `;` |
| `L31_ABSTRACT_TRIAD` | Check 5 | `P0` (`+5`) | Three conjoined abstract head nouns (`X, Y, and/or Z`) |
| `L51_EQUAL_LENGTH_RUN` | Check 5 | `P1` (`+2`) | Three consecutive sentences with the exact same word count |
| `L51_PARATAXIS_CHAIN` | Check 5 | `P1` (`+2`) | Three or more consecutive sentences of `<= 6` words |
| `L51_MEAN_SENTENCE_LENGTH` | Check 6 | `P1` (`+2`) | Mean sentence words outside `[15.5, 17.5]` (`script`) or `[11.0, 17.5]` (`vertical`) |
| `L51_LONG_SENTENCE_TAIL` | Check 6 | `P1` (`+2`) | Sentences above `30` words reaching `>= 8.0%` of total sentences |
| `L09_CONTRACTION_DENSITY` | Check 6 | `P1` (`+2`) | Spoken contractions below `10.0` per `1,000` words |
| `L52_FK_GRADE_LEVEL` | Check 6 | `P1` (`+2`) | Flesch-Kincaid Grade Level above `10.5` |

## Sentence and word tokenizer protections

Naive `.split(/[.!?]/)` tokenizers corrupt word-count collision checks on legal and financial scripts. Before splitting sentences, `maskNonTerminalPeriods()` substitutes `U+E000` (preserving exact `1:1` UTF-16 string length and line offsets) inside five protected dot contexts:

1. Decimal numerals and version strings: `$40.5`, `$269.92`, `86.4`, `v1.2`.
2. Legal, legislative, corporate, and honorific abbreviations: `v.`, `vs.`, `Mr.`, `Mrs.`, `Ms.`, `Dr.`, `Prof.`, `Sen.`, `Rep.`, `Gov.`, `Gen.`, `No.`, `Vol.`, `Fig.`, `Sec.`, `Art.`, `Pub.`, `L.`, `Inc.`, `Corp.`, `Ltd.`, `Jr.`, `Sr.`.
3. Abbreviated calendar months preceding day numerals or commas: `Jan. 15`, `Oct.,`.
4. Scholarly Latin abbreviations: `e.g.`, `i.e.`, `viz.`, `cf.`, `et al.`, `etc.`.
5. Multi-period initialisms: `U.S.`, `D.C.`, `E.U.`, `U.S.A.`, `a.m.`, `p.m.`. Internal dots always stay masked; the trailing dot stays masked when modifying a following noun (`the U.S. government`), and releases cleanly as a sentence terminator when followed by whitespace and a capitalized sentence-starter (`plus Washington, D.C. In its capacity auction...`).

`WORD_TOKEN_RE` counts multi-period initialisms (`U.S.`, `D.C.`), formatted currency/percentage figures (`$40.5`, `$8,208`, `401(k)s`), and hyphenated or contracted words (`thirty-two-year-old`, `don't`) as single word tokens.

## Iterative Stage 6 repair workflow and rewrite patterns

When `anti_ai_script_gate.mjs` exits `1`, editors and agents execute at most three surgical repair passes (`max_detector_repair_loops: 3` under rule `L46`):

1. Pass 1 (P0 lexical, contrast, and punctuation cleanup): resolve every `CHECK_1`, `CHECK_3`, and `CHECK_4` line diagnostic in place. Replace banned words with concrete mechanisms or quantities already verified in the episode research dossier. Split semicolons into separate spoken sentences, convert em dashes to commas or periods, and rewrite negative contrasts into direct positive statements.
2. Pass 2 (P1 rhythm and cadence tuning): resolve `CHECK_5` equal-length collisions, parataxis chains, and `CHECK_6` band misses using the line-numbered sentence hints. Split `> 30`-word multi-clause sentences at causal conjunctions, or merge choppy `<= 6`-word fragments when mean sentence length dips below `15.5` words. Convert stiff uncontracted auxiliaries (`do not`, `will not`, `it is`) into spoken contractions if contraction density sits below `10.0` per `1,000` words.
3. Pass 3 (host cross-check and preservation audit): re-run the gate to confirm `GATE: PASS (score = 0)`. Leave clean human paragraphs untouched. Never invent unverified dates, quotes, personal experiences (`A44`), or deliberate typos (`L48`) to game a metric.

Canonical repair transformations:

```text
FAIL [L50_ISNT_ITS_PIVOT + L33_EM_DASH]:
  "Universal Basic Compute isn't a paycheck — it's company scrip."
PASS:
  "Universal Basic Compute works like digital company scrip that spoils on Tuesday night."

FAIL [L31_ABSTRACT_TRIAD + L32_HIGHLIGHT_VERB]:
  "These numbers highlight a crisis of governance, accountability, and sustainability."
PASS:
  "Table 9 shows net bond interest passing $1 trillion while corporate tax receipts fell to 7.1 percent."

FAIL [L51_PARATAXIS_CHAIN]:
  "Wages fell fast. Prices dropped too. Debts stayed frozen."
PASS:
  "Wages and retail prices dropped together, while thirty-year mortgages stayed frozen at yesterday's numbers."
```

## CLI usage, JSON output contract, and ESM API

Run from the repository root (`d:/Youtube channel/reading-room-editorial-os`):

```bash
# Audit a flagship long-form script (exits 0 on GATE: PASS, 1 on GATE: FAIL)
node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs \
  --file 04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md

# Audit a 45-to-60s vertical Short script
node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs \
  --mode vertical --file 04_scripts_and_dossiers/ep_01_the_allowance/short_01.md

# Audit a Markdown specification or research dossier in prose mode with JSON output
node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs \
  --mode prose --json --file 04_scripts_and_dossiers/25_anti_ai_gate_specification.md

# Recursively audit a directory of scripts or run the 11-case built-in self-test suite
node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs --dir 04_scripts_and_dossiers/ep_01_the_allowance
node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs --self-test
```

When `--json` is supplied, stdout emits `{ gate, score, totalFiles, totalViolations, catalogSummary, results }`, where each entry in `results` carries `{ filePath, mode, gate, passed, score, violationCount, metrics, protectedCitationCount, checks, violations }`.

Representative JSON payload structure returned on `GATE: PASS`:

```json
{
  "gate": "PASS",
  "score": 0,
  "totalFiles": 1,
  "totalViolations": 0,
  "catalogSummary": {
    "tier1UnconditionalForms": 141,
    "tier1ContextDisambiguatedStems": 8,
    "tier1SlopPhrasePatterns": 30,
    "tier2ClusterForms": 60,
    "totalCatalogEntries": 239
  },
  "results": [
    {
      "filePath": "04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md",
      "mode": "script",
      "gate": "PASS",
      "passed": true,
      "score": 0,
      "violationCount": 0,
      "metrics": {
        "wordCount": 3324,
        "sentenceCount": 200,
        "meanSentenceWords": 16.62,
        "sentencesGt30Pct": 7.0,
        "contractionsPer1k": 15.34,
        "fleschKincaidGrade": 9.28
      },
      "protectedCitationCount": 4
    }
  ]
}
```

Downstream Node tools can also import `analyzeDocument(rawText, { mode, filePath })`, `tokenizeSentences()`, `countWords()`, and `runSelfTests()` directly from `./tools/anti_ai_script_gate.mjs`.
