# Deliverable 26: Pacing, Re-Hook, and Retention Drop-Off Auditor Specification

Document ID: `RR-OS-DIV04-26`  
Executable Tool: [`04_scripts_and_dossiers/tools/retention_linter.mjs`](file:///d:/Youtube%20channel/reading-room-editorial-os/04_scripts_and_dossiers/tools/retention_linter.mjs)  
Package Script: `npm run gate:retention`  
Canonical Benchmark: [`04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md`](file:///d:/Youtube%20channel/reading-room-editorial-os/04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md)

## 1. Pipeline Position and Late-Night Viewer Physics

Attention runs on math. *The Reading Room* publishes twenty-to-thirty-minute forensic investigations watched mostly between 9:30 PM and 1:00 AM by numerically literate adults (`01_identity_and_strategy/04_viewer_avatar_and_psychology_map.md`), and holding half of a cold Home Browse audience past minute ten requires treating spoken word intervals like a strict physical budget.

Inside the mandatory 6-Stage Script Pipeline (`docs/EXECUTION_ROADMAP.md`), `retention_linter.mjs` sits as the automated quality gate locking Stages 3 and 4 (`channel-structure`, `channel-storytelling`, and `channel-audience`) before a script enters Stage 6 prose checks (`anti_ai_script_gate.mjs`) or camera rehearsal. Every threshold in the auditor maps directly to a real drop-off failure observed in high-RPM long-form video:

1. Viewers swipe back inside the first fifteen seconds whenever an opening paragraph clears its throat with channel greetings or delays the concrete balance-sheet contradiction past word fifty.
2. Viewers drift to the sidebar during middle acts whenever a script goes more than ninety seconds (`220` words at `150 wpm`) explaining abstract institutional theory without putting a document on screen, asking a question, planting a forward loop, or shocking the scale with a primary figure.
3. Viewers abandon the final ninety seconds the moment a narrator telegraphs a textbook wrap-up (`In conclusion`, `To summarize`) or breaks analytical trust mid-video to beg for likes and subscriptions.

Running `retention_linter.mjs` turns subjective pacing debates into deterministic word-offset diagnostics with exit code `0` required for greenlight.

## 2. Spoken-Word Tokenization and Stage-Cue Isolation

Teleprompter drafts and director-annotated scripts frequently mix spoken narration with production brackets such as `[STAGE CUE: Slow 104% camera creep]` or `[ON SCREEN: US Treasury MTS Table 9]`. Counting production notes as spoken dialogue distorts runtime estimates and masks dry stretches.

`tokenizeSpokenScript(rawText, options)` separates spoken narration from non-spoken stage markup in four steps:

1. Frontmatter and heading removal: YAML frontmatter blocks (`---`) and structural Markdown section headers (`# Act I`) are stripped prior to word indexing so act labels never inflate spoken runtime.
2. Bracket classification before removal: Every bracketed span `[...]` is evaluated at its exact position in the paragraph before removal from the spoken token stream. Visual production cues matching `ON SCREEN`, `GRAPHIC`, `CHART`, `MAP`, `EXHIBIT`, `TABLE`, `DOCUMENT`, `CUTAWAY`, `PROP`, or `ARCHIVE` attach a Category `(a)` visual reset event to the immediately preceding spoken word index while adding zero words to `spoken_words`. Non-visual stage cues (`STAGE CUE`, `CAMERA`, `SFX`, `MUSIC`, `PAUSE`, `BEAT`) are stripped silently without registering a retention reset.
3. Surface normalization: Bold, italic, and inline-code wrappers are stripped from spoken tokens while preserving currency prefixes (`$`), percentage signs (`%`), hyphens (`thirty-year`), parentheses (`401(k)`), and question marks (`?`).
4. Deterministic `150 wpm` clock projection: Each spoken word index `k` (`1..N`) receives a cumulative timestamp `timeSec = ((k - 1) / wpm) * 60` using *The Reading Room* baseline delivery cadence of `150` words per minute (`2.5` words per second).

## 3. Gate 1: The 220-Word Dry-Stretch Scanner (`P0` Hard Gate)

Eighty-eight seconds is the ceiling. At `150 wpm`, any span exceeding `220` consecutive spoken words in `longform` mode (`75` words or `30.0` seconds in `vertical` mode) without at least one active retention reset triggers a hard `P0` failure (`DRY_STRETCH_EXCEEDED`). Zero unanchored stretches clear pre-flight.

### 3.1 The Four Valid Retention Reset Classes

`collectRetentionResets(parsed)` scans every spoken paragraph and anchored stage event across four distinct mechanism classes:

| Reset Class | Code Key | Trigger Tokens and Spoken Constructions | Psychological Job by Viewer Avatar |
| :- | :- | :- | :- |
| `(a)` Visual or document cue | `visual_cue` | `[ON SCREEN...]`, `Table`, `Look at`, `Open Table / Open the`, `Pull up`, `Picture <scene>`, `Watch what/how`, `chart`, `map`, `filing`, `ledger`, `docket`, `10-K`, `10-Q`, `whiteboard`, `spreadsheet`, `dashboard` | Re-engages visual processing and proves primary-source rigor for Devon and Elena |
| `(b)` Open loop or callback | `open_loop_callback` | `in a minute`, `back of your mind`, `get to`, `get into`, `remember`, `brings us to`, `bring all of this back to`, `come back to`, `escape hatch number`, `more on that`, `hold that thought` | Opens or resolves forward causal tension (`A16`), holding Marcus and Claire across act breaks |
| `(c)` Viewer stake or question | `viewer_stake_question` | Any spoken question (`?`), `your rent`, `your mortgage`, `your paycheck`, `your Friday labor`, `your income`, `your bank`, `your checking account`, `your 401(k)`, `your electric bill`, `your phone screen`, `locking yourself into ... debt` | Places the viewer's own monthly cash flow directly inside the macro collision (`A01`) |
| `(d)` Concrete numeric shock | `numeric_shock` | `$` currency figures (`$40.5`, `$3,400`, `$269.92`), `%` or spoken percentages/fractions (`84.1 percent`, `eighty-six percent`, `two-thirds`), physical/fiscal magnitudes (`trillion`, `billion`, `gigawatt`, `terawatt-hours`, `megawatt-day`) | Replaces vague adjectives with hard balance-sheet or wattage scale |

### 3.2 Window Arithmetic and Surgical Repair Walkthrough

Let `r_1 < r_2 < ... < r_m` denote the sorted unique word indices carrying at least one reset across `[1..N]`. Every sliding window of `221` consecutive spoken words contains at least one reset if and only if every reset-free interval (`[1, r_1 - 1]`, `[r_i + 1, r_{i+1} - 1]`, and `[r_m + 1, N]`) spans at most `220` words.

When `retention_linter.mjs` flags `DRY_STRETCH_EXCEEDED` on `wA-wB`, repair the stretch without inserting fake drama:

1. Check whether an unnamed institutional source inside `wA-wB` can be opened directly on camera (`Open Schedule BA of the insurer filing` or `[ON SCREEN: FERC Queue Table]`).
2. Convert a passive declarative transition near the midpoint `(A + B) / 2` into an explicit causal question (`?`) or test the mechanism against the episode's household balance-sheet character.
3. Anchor unscaled macro concepts in physical household wattage or dollar monthly drafts, mirroring Episode 01's step from a ten-watt phone charger to one million nonstop kitchen microwaves (`1` gigawatt).

```text
FAILING DRAFT SPAN (242 words without reset):
  ...three paragraphs of uninterrupted historical narrative describing how municipal
  assessment formulas evolved after commercial real-estate cycles in midwestern cities...

SURGICAL REPAIR (splits 242w span into 118w + 112w):
  "Open Page 44 of the city's audited annual financial statement and look at what
   happens to your property-tax bill the year downtown tower assessments drop twenty-eight percent."
```

## 4. Gate 2: First-15-Second Cold-Open Clock (`<= 50` Words)

Cold viewers decide whether to lock horizontal orientation or swipe out inside the opening fifteen to twenty seconds (`37` to `50` words at `150 wpm`). `auditColdOpenClock` enforces two strict `P0` locks on the opening window (`50` words in `longform`, `25` words in `vertical`):

1. Zero throat-clearing (`COLD_OPEN_THROAT_CLEARING`): Scans the opening `65` words (`35` in `vertical`) and rejects `Welcome back`, `Welcome to the channel`, `In this video`, `In today's video`, `Hey guys`, `What's up guys`, `Today we're going to talk about`, `Without further ado`, and early subscribe requests.
2. Concrete number plus stake lock (`COLD_OPEN_LATE_STAKE`): Requires both a specific numeric anchor (`COLD_OPEN_NUMBER_RE`) and a concrete household or institutional stake (`paycheck`, `rent`, `mortgage`, `tax dollar`, `national debt`, `Treasury`, `bank`, `401(k)`, `electric bill`, `wire fraud`, `pension`, `insurance`) to land at or before word `50`.

In Episode 01, Sentence 1 opens straight on the fiscal ratio (`Roughly two-thirds of every tax dollar Washington collects comes straight out of somebody's paycheck`), locking `firstNumberWord = 2` (`two-thirds`) and `firstStakeWord = 6` (`tax dollar`) at `2.4` seconds (`w6 <= 50`).

```text
FAILING COLD OPEN (w64 lock, throat-clearing):
  "Welcome back to The Reading Room. In this video we are going to examine the
   fiscal relationship between autonomous software deployment, federal revenue collection,
   and long-term sovereign debt sustainability before looking at $40.5 trillion..."

PASSING COLD OPEN (w6 lock, zero throat-clearing):
  "Roughly two-thirds of every tax dollar Washington collects comes straight out of
   somebody's paycheck."
```

## 5. Gate 3: Ten-Decile Re-Hook Density Audit (`D1..D10`)

Front-loaded scripts sag at midpoint. Concentrating twenty numbers in Act I while leaving Act III starved of resets ruins average view duration, so `auditDecileDensity` partitions total spoken words `N` into ten equal deciles `D1` through `D10` (`floor((d - 1) * N / 10) + 1` to `floor(d * N / 10)`), projects the `150 wpm` timestamp window for each slice, and counts all four reset categories alongside adversarial steelman concessions (`let's be fair`, `give Silicon Valley credit`, `if an economist's watching`, `Wall Street optimists`). Every decile must carry weight.

| Profile Mode | Hard Gate Floor (`P0` `EMPTY_DECILE_REHOOK`) | Max Empty Adjacent Deciles | Advisory Warning (`P1` `THIN_DECILE_DENSITY`) |
| :- | :- | :- | :- |
| `longform` (`2,400` to `7,000w`) | `10 / 10` active deciles (`>= 1` device in every decile) | `0` | Fewer than `2` devices in any single decile |
| `vertical` (`90` to `240w`) | `>= 6 / 10` active deciles | `2` | Fewer than `1` device per active decile |

Tracking adversarial concessions across deciles also confirms `R19`/`R40` compliance (`05_visual_audio_signature_and_cinema_lock.md`), verifying that domain experts (`Devon` and `Elena`) hear their strongest technical objections voiced fairly before the final act.

## 6. Gate 4: Mid-Video Subscribe-Nag Ban and Final-Window Closing Bridge

High-earning technical and financial viewers penalize needy creator panhandling immediately (`04_viewer_avatar_and_psychology_map.md`, Anti-trigger 5). `auditCtaAndClosingWindow` splits the script at fractional position `0.90` (`0.85` in `vertical` mode):

1. Mid-video subscribe-nag ban (`0.00` to `0.90`, `P0` `MID_VIDEO_SUBSCRIBE_NAG`): Any occurrence of `like and subscribe`, `smash/hit that like button`, `subscribe to the channel`, `don't forget to subscribe`, `hit the bell`, or `let me know in the comments` prior to `0.90` fails the build immediately.
2. Telegraphed wrap-up ban (`0.90` to `1.00`, `P0` `TELEGRAPHED_WRAPUP_CLICHE`): Phrases such as `In conclusion`, `In summary`, `To summarize`, and `To wrap things up` announce that new insight has ended and trigger steep final-minute abandonment before the end-screen card renders.
3. Single restrained closing bridge (`0.90` to `1.00`, `P0` `MISSING_CLOSING_BRIDGE` / `HYPE_SUBSCRIBE_CTA`): Requires one clean forward bridge in the final ten percent (`stick around for the next video`, `see you in the next video`, `send this video`, or `full breakdown is linked below` on Shorts) with zero hype begging. Stacking more than two asks in `longform` emits a `P1` `STACKED_CLOSING_CTAS` warning.

## 7. Flag Catalog, Scoring Arithmetic, and Cinema Bridge Integration

Every audit starts at `100` points, subtracts `25` points per `P0` hard-gate violation, and subtracts `5` points per `P1` advisory warning (`status = "PASS"` requires `p0_violations === 0`).

| Flag Code | Tier | Trigger Condition | Downstream Gate Impact |
| :- | :- | :- | :- |
| `SCRIPT_TOO_SHORT` | `P0` | Fewer than `30` spoken words after stage-cue removal | Blocks CLI and cinema export |
| `DRY_STRETCH_EXCEEDED` | `P0` | `> 220` consecutive reset-free words (`> 75` in `vertical`) | Blocks Stage 4 sign-off |
| `COLD_OPEN_THROAT_CLEARING` | `P0` | Meta-greeting or agenda phrase inside opening `65` words | Blocks Stage 3/4 sign-off |
| `COLD_OPEN_LATE_STAKE` | `P0` | Missing concrete number or household/system stake inside `<= 50w` | Blocks Stage 3/4 sign-off |
| `EMPTY_DECILE_REHOOK` | `P0` | Zero active retention devices in any longform decile `D1..D10` | Blocks `validateStrategyPacket` (`R13`) |
| `MID_VIDEO_SUBSCRIBE_NAG` | `P0` | Subscribe, bell, like, or generic comment beg in `0.00-0.90` | Blocks `validateStrategyPacket` (`R22`) |
| `TELEGRAPHED_WRAPUP_CLICHE` | `P0` | Textbook summary opener in `0.90-1.00` | Blocks final-act conversion gate |
| `HYPE_SUBSCRIBE_CTA` | `P0` | Hype engagement begging inside `0.90-1.00` | Blocks channel voice contract |
| `MISSING_CLOSING_BRIDGE` | `P0` | Zero next-video or related-video bridges inside final window | Breaks 30-node binge-seam chain |
| `THIN_DECILE_DENSITY` | `P1` | Active longform decile contains only `1` retention device | Advisory warning (`-5` pts, exit `0`) |
| `STACKED_CLOSING_CTAS` | `P1` | More than `2` closing bridge phrases in final `10%` | Advisory warning (`-5` pts, exit `0`) |

When `tools/export_cinema_bundle.mjs` prepares an episode bundle for `reading-room-cinema`, it imports `auditScriptRetention` directly to populate `strategyAudit.hookWordsToFirstStake`, `coveredRehookDeciles`, `midVideoSubscribeAskCount`, and `ctaCount` inside `episodes-vault.json`.

## 8. Canonical Episode 01 Audit Results and CLI Reference

Running `node 04_scripts_and_dossiers/tools/retention_linter.mjs` against `source_video_01_script.md` produces a `100/100` `PASS` score (`0` `P0` violations, `0` `P1` warnings):

```text
Spoken Words:       3,323 words (58 paragraphs, 0 stage cues stripped)
Estimated Runtime:  22:09 (22.15 min @ 150 wpm)
Retention Resets:   129 total (38.82 per 1,000 words)
Cold-Open Lock:     Word #6 (2.4s) | 0 throat-clearing phrases
Max Dry Stretch:    171 words at w1350-w1520 (09:00-10:08, limit <= 220w)
Active Deciles:     10 / 10 (min 8 devices in D7/D8/D10, max 23 devices in D3)
CTA Window Check:   0 mid-video nags | 0 wrap-up cliches | 1 closing bridge (frac 0.9967)
```

### 8.1 CLI Invocation Matrix

```bash
# Audit canonical Episode 01 script (default target for npm run gate:retention)
node 04_scripts_and_dossiers/tools/retention_linter.mjs

# Audit an explicit long-form script and emit machine-readable JSON
node 04_scripts_and_dossiers/tools/retention_linter.mjs --file path/to/script.md --mode longform --json

# Audit a 60-second vertical script under the tighter 75-word / 25-word cold-open profile
node 04_scripts_and_dossiers/tools/retention_linter.mjs --file path/to/short_01.md --mode vertical

# Run the built-in 6-case verification suite (Episode 01 + stage-cue + negative failure traps)
node 04_scripts_and_dossiers/tools/retention_linter.mjs --self-test
```

### 8.2 JSON Output Contract (`--json`)

Downstream orchestrators (`tools/run_editorial_exam.mjs` and `tools/export_cinema_bundle.mjs`) consume the top-level JSON schema directly:

```json
{
  "tool": "retention_linter",
  "version": "1.0.0",
  "file": "04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md",
  "mode": "longform",
  "status": "PASS",
  "score": 100,
  "summary": {
    "spoken_words": 3323,
    "paragraph_count": 58,
    "stripped_stage_cues": 0,
    "wpm": 150,
    "estimated_runtime_mmss": "22:09",
    "estimated_runtime_minutes": 22.15,
    "total_retention_resets": 129,
    "resets_per_1k_words": 38.82,
    "p0_violations": 0,
    "p1_warnings": 0
  }
}
```
