# Deliverable 20: 24-hour post-publish CTR and title/thumb rescue playbook

`03_viral_and_packaging/20_24hr_ctr_rescue_playbook.md` defines the live post-publish packaging, YouTube Studio `Test & Compare`, and retention triage standard operating procedure for *The Reading Room* across all thirty flagship uploads (`2027-02-02` through `2028-01-16`).

Every threshold in this playbook locks directly to the Monte Carlo growth simulator in `01_identity_and_strategy/models/growth_simulation.py` and its `500`-run dataset in `01_identity_and_strategy/models/cohort_projection_jan2028.json`. In that model, an upload's algorithmic trajectory across YouTube's four-layer impression cascade depends on three coupled variables: surface-isolated `Browse CTR` (`4.50%` to `8.50%` channel band, `P50` mean `5.90%`), Average Percentage Viewed `AVD` (`45.0%` to `56.0%` across `20.5` to `35.0` minute runtimes, `P50` mean `49.60%`), and composite watch minutes per Browse impression:

```text
W = CTR_browse * Duration_min * AVD
```

Clearing Layer 2 (`Adjacent Creator Lookalikes`, `210K` to `460K` base impressions) requires `Browse CTR >= 4.70%` and `AVD >= 45.8%`. Clearing Layer 3 (`Broad Macro, Finance & AI Desk`, `680K` to `1.42M` base impressions) requires `Browse CTR >= 5.30%`, `AVD >= 48.2%`, and `W >= 0.62` watch minutes per Browse impression. Clearing Layer 4 (`Cross-Platform Breakout Wave`, `2.40M` to `3.85M` times Pareto tail `[1.0, 4.6]`) requires `Browse CTR >= 6.00%`, `AVD >= 50.2%`, and `W >= 0.74`.

Whenever an upload's raw Browse package opens below `4.90%` while the film itself holds viewers, executing a disciplined 24-hour swap to pre-rendered `Pair B` or `Pair C` recovers `+0.45%` to `+0.95%` (`+45` to `+95` basis points) of Browse CTR (`growth_simulation.py` lines `181` to `186`). In the representative median run inside `cohort_projection_jan2028.json`, six uploads (`ep_02, ep_03, ep_07, ep_08, ep_12, ep_17`) fire `ctr_rescued_24h: true`: `ep_02` and `ep_03` lift to `5.26%` and `5.01%` Browse CTR to unlock YouTube Partner Program monetization right on Episode `3`, and `ep_12` lifts to `5.70%` Browse CTR (`48.30%` AVD, `W = 0.716`), turning a stalled upload into a `3.17M`-impression Layer-3 performer (`249,486` views, `$7,285.76` AdSense).

## Pre-publish three-variant staging lock (`T-02:00` before upload)

Never design a rescue thumbnail while watching live analytics drop. Before scheduling any flagship episode, stage three complete, pre-linted packaging pairs (`Pair A`, `Pair B`, `Pair C`) from `16_90_pair_title_thumbnail_vault.json` that pass `package_lint.py` (`0` echo words, `<= 55` title chars, `0` to `3` thumb words) and clear the `168x94 px` squint check in `thumb_test_sheet.html`.

Each variant must test a distinct visual axis instead of recoloring the same layout:

1. `Pair A` (Primary launch lead): Assigned by the episode's `STR-*` preset under `15_viral_outlier_forensic_analysis.md` (for example, shirt-and-tie host plus MTS Table 9 `86% WAGES` split on `ep_01`, or dark geospatial chokepoint map on `ep_15`).
2. `Pair B` (Literal primary-document receipt): 100% full-bleed `#F4EFE6` or `#FAF8F3` archival crop of the episode's `primary_desk_artifact` (`Form 10-K Note 1`, `Public Law 119-27`, `12 CFR 1005.6`, `CISA AA24-038A`) with chisel amber sweep and `1` to `2` brick-red `#A3402E` stamp words, paired with a direct mechanism title. `Pair B` doubles as both the first CTR rescue backup and the emergency `0:30` cliff stabilizer.
3. `Pair C` (Asymmetric unit-cost or two-object collision): Zero-face high-contrast scale diagram on `#0F2236` `drafting_blueprint` or `#111315` `midnight_telemetry` paired with a stark `X vs Y` or `Who Pays $Z?` question title under `46` characters.

### Native YouTube Studio `Test & Compare` vs manual sequential swaps

YouTube Studio's native `Thumbnail Test & Compare` splits impressions evenly across up to three thumbnails while holding the title fixed, declaring a winner on `Watch Time Share` (the exact empirical twin of `W = CTR_browse * Duration * AVD`). Whether to launch with native `Test & Compare` or a single `Pair A` depends on channel epoch impression velocity:

| Cohort phase (`cohort_projection_jan2028.json`) | Active subscriber base (`P50`) | Cold-start ramp factor | 24h Browse impression volume | Required `Test & Compare` protocol |
| :--- | :--- | :--- | :--- | :--- |
| Epochs `ep_01` to `ep_05` (`Feb` to `Mar 2027`) | `0` to `6,044` subs | `0.16` to `0.54` | `8,000` to `32,000` | Launch single `Pair A` manually. Splitting `12,000` early impressions three ways starves statistical convergence (`< 4,000` per arm); use manual `A -> B -> C` swaps at Hours `6`, `12`, and `24`. |
| Epochs `ep_06` to `ep_15` (`Apr` to `Jul 2027`) | `8,201` to `39,575` subs | `0.62` to `0.86` | `38,000` to `145,000` | Enable 2-way native `Test & Compare` (`Thumb A` vs `Thumb B`) under `Title A`. Hold `Pair C` (`Title C` + `Thumb C`) in reserve for manual Hour `12` or Hour `24` escalation if combined Browse CTR sits below `4.90%`. |
| Epochs `ep_16` to `ep_30` (`Aug 2027` to `Jan 2028`) | `45,533` to `136,821` subs | `0.89` to `0.99` | `150,000` to `650,000+` | Enable full 3-way native `Test & Compare` (`Thumb A`, `Thumb B`, `Thumb C`) at publish. Lock the `Watch Time Share` leader once each arm clears `>= 25,000` Browse impressions (typically Hour `8` to Hour `14`), and rotate `Title A -> Title B` only if winning Browse CTR remains `< 4.90%`. |

Always inspect CTR inside `YouTube Studio -> Analytics -> Content -> Impressions click-through rate -> See More (Advanced Mode) -> Traffic source -> Browse features`. Blended overview CTR mixes `12.25%` Search CTR, `10.80%` External receipt seeding (`Reddit`, `Hacker News`, `X`), and `2.65%` Gatekept Shorts bridges into one noisy average that hides real Home-feed performance.

## Five-checkpoint timeline (`Hour 2` through `Day 7`)

| Checkpoint | Minimum Browse sample (`ep_01..05` / `ep_06..15` / `ep_16..30`) | Studio metrics available | Calibration adjustment (`growth_simulation.py`) | Permitted operator action |
| :--- | :--- | :--- | :--- | :--- |
| `Hour 2` (`T+02:00`) | `1,500` / `5,000` / `12,000` | Realtime views, surface impressions, early Browse & External CTR | Returning subscribers (`36%` to `48%` active reach) inflate Hour-2 CTR `+1.8%` to `+3.2%` above cold Layer-2 baseline | Sanity check only: fix cropping bugs, broken timestamps, or catastrophic `< 3.80%` warm Browse CTR. Otherwise hold fire. |
| `Hour 6` (`T+06:00`) | `4,000` / `15,000` / `40,000` | Layer-1 to Layer-2 transition CTR, first `0:30` retention curve & preliminary `AVD` | Warm-sub bias fades toward `+0.6%`; `0:30` retention target `>= 70%` (`> 72%` strong, `< 58%` cliff) | Classify into Quadrant `1, 2, 3,` or `4`. Trigger immediate Quadrant 2 literal-document swap if `0:30 < 58%`, or early `A -> B` swap on `ep_01..05` if Browse CTR `< 4.60%` with `0:30 > 72%`. |
| `Hour 12` (`T+12:00`) | `8,500` / `32,000` / `90,000` | Stabilized Layer-2 Browse CTR, full decile retention curve, live `W` calculation | Layer-2 gate requires `Browse CTR >= 4.70%` & `AVD >= 45.8%`; rescue trigger fires at `Browse CTR < 4.90%` | Primary intervention window: execute `Pair A -> Pair B` swap in Quadrant 1, or lock clear `Watch Time Share` winner (`>= +12%` lead) in `Test & Compare`. |
| `Hour 24` (`T+24:00`) | `16,000` / `65,000` / `180,000` | Post-swap `Pair B` delta (`Hour 12..24` slice), Suggested rail pickup (`8.66%` target CTR), Layer-3 gate check | Layer-3 gate requires `Browse CTR >= 5.30%`, `AVD >= 48.2%`, and `W >= 0.62` min/impression | Secondary rescue escalation: if `Pair B` gained `< +0.35%` Browse CTR and total Browse CTR stays `< 4.90%` with `AVD > 48%`, swap `Pair B -> Pair C`. Freeze further Browse swaps after `Pair C`. |
| `Day 7` (`T+168:00`) | Full first-week cohort (`58%` of 12-day epoch) | Layer-3/4 tail velocity, `YouTube Search` CTR (`10%` to `14%`), `SessionMultiplier` playlist continuation | Horizon Library floor (`~32.1%` of slate) pivots from Browse to `12.25%` Search CTR + playlist back-fill | If locked in Layer 1 (`< 50K` views, Quadrant 4), shift title to high-intent evergreen Search phrasing (`10%` to `14%` CTR) and run `retention_autopsy.py` before shooting `ep_{k+1}`. |

### Step-by-step checkpoint execution notes

At `Hour 2`, check technical integrity first: verify `-14.0 LUFS` audio playback on mobile speakers, chapter markers, pinned primary-receipt comment, Related Video link from the companion vertical Short, and thumbnail legibility in dark and light mobile themes. Because `VelocityLift(S_k) = 1.0 + 0.36 * ln(1 + S_k / 15,000)` concentrates loyal returning viewers into the opening two hours, a `6.8%` Browse CTR at `Hour 2` on a `50,000`-subscriber channel often settles near `5.4%` once Layer-2 lookalike testing widens. Never celebrate or panic off two-hour warm numbers unless Browse CTR sits below `3.80%` after `>= 5,000` impressions.

At `Hour 6`, YouTube Studio finishes indexing the first Audience Retention curve under the `Engagement` tab. Pull three exact numbers: surface-isolated `Browse CTR`, the retention percentage at `0:30`, and whole-video `AVD` percentage. Compute `W = CTR_browse * Duration_min * AVD` (for a `26.5`-minute episode like `ep_03` at `4.60%` Browse CTR and `48.13%` AVD, `W = 0.046 * 26.5 * 0.4813 = 0.587`, sitting just `0.033` watch minutes per impression short of the `0.62` Layer-3 threshold). Lifting `ep_03`'s Browse CTR by `+0.50%` via `Pair B` pushes `W` to `0.650` and unlocks `680K` to `1.42M` Layer-3 impressions.

At `Hour 12` and `Hour 24`, log the exact UTC timestamp, cumulative Browse impressions, and cumulative Browse clicks in the episode dossier before saving any metadata edit in Studio. To evaluate `Pair B` cleanly at `Hour 24`, subtract the `Hour 12` snapshot from the `Hour 24` cumulative totals:

```text
Incremental_CTR_PairB = (Browse_Clicks_H24 - Browse_Clicks_H12) / (Browse_Imps_H24 - Browse_Imps_H12)
```

Evaluating cumulative lifetime CTR instead of incremental window CTR blinds the operator because `Pair A`'s earlier `40,000` low-CTR impressions weigh down the lifetime average even when `Pair B` is already clicking at `5.85%`.

At `Day 7` (five days before the next `12-day` upload), audit where the episode settled across the three simulator tiers (`breakout_outlier`, `mid_performer`, `horizon_library`). Episodes clearing Layer 3 or Layer 4 stay completely untouched. Episodes resting in `horizon_library` (`ep_01` in the median simulation, which opened at `21,353` epoch views before earning `91,907` downstream playlist continuation views and `12.68%` Search CTR) keep their highest-clarity institutional Search title (`If AI Takes Jobs, Who Pays $40.5T Debt?`) so evergreen searchers and playlist bingers convert at `1.43%` to `1.93%` for the rest of the year.

## Four diagnostic quadrants and mandatory decision rules

Every upload at `Hour 6`, `Hour 12`, and `Hour 24` falls into one of four mutually exclusive diagnostic states. Misdiagnosing Quadrant 3 as Quadrant 1 kills breakout hits; misdiagnosing Quadrant 2 or Quadrant 4 as Quadrant 1 burns backup thumbnails on retention problems.

| Quadrant | Browse CTR signal | `0:30` hook & `AVD` signal | Impression trajectory | Root mechanical cause | Mandatory Studio action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Quadrant 1` | Low (`< 4.90%` Browse) | High (`0:30 > 72%`, `AVD > 48.0%`) | Flat or slow Layer-1 / Layer-2 trickle | Packaging bottleneck hiding a high-retention film | Swap `Pair A -> Pair B` at Hour 6/12; escalate `Pair B -> Pair C` at Hour 24 if incremental Browse CTR stays `< 4.90%`. |
| `Quadrant 2` | High (`>= 6.20%` Browse) | Steep cliff (`0:30 < 58%`, `AVD < 45.8%`) | Early spike followed by sharp Hour 8..18 throttling | Promise-to-hook mismatch or over-broad curiosity gap | Swap immediately to literal document-grounded variant (`Pair B` primary filing crop + literal statutory/dollar title). |
| `Quadrant 3` | Falling (`8.5% -> 5.2%`) | Healthy (`0:30 >= 66%`, `AVD >= 49.5%`, `W >= 0.62`) | Surging `5x` to `10x` hourly impressions in cold Browse | Healthy cold-audience pool dilution across Layer 3 & Layer 4 | DO NOT TOUCH title or thumbnail. Leave metadata 100% locked while recommender expands reach. |
| `Quadrant 4` | Low (`< 4.70%` across `A, B, C`) | Weak (`0:30 < 62%`, `AVD < 45.8%`) | Stalled inside Layer 1 (`< 150K` total impressions) | Structural topic-filter miss, slow cold open, or mid-act sag | Stop swapping after `Pair C`; lock clean Search title (`10%` to `14%` CTR) and feed Studio CSVs into `retention_autopsy.py`. |

### Quadrant 1: Low CTR (`< 4.90%`) + high `0:30` retention (`> 72%`) and `AVD` (`> 48%`)

Viewers who click love the investigation (`> 72%` still watching at thirty seconds, `> 48%` watching `12` to `17` minutes of a `26`-minute runtime), proving the cold open, audio master, and act pacing work. The package simply failed to stop thumbs on mobile Home feeds.

Execute a strict one-variable-first rescue sequence:

1. Change the thumbnail before changing the title if `Title A` already carries a concrete dollar figure under `48` characters (`Test & Compare` handles this automatically on `ep_06..30`). Visual area occupies roughly `75%` of mobile card pixels and produces `70%` of rescue variance.
2. When swapping manually at `Hour 12` (`ep_01..05` or when `Test & Compare` arms all lag `< 4.90%`), deploy full `Pair B` (both `Title B` and `Thumb B` together so the title-thumbnail lexical disjunction circuit stays intact; never pair `Title A` with a `Thumb B` that repeats one of `Title A`'s nouns).
3. Wait until `Pair B` accumulates at least `8,000` new Browse impressions (`ep_01..05`) or `25,000` new Browse impressions (`ep_06..30`), or until `Hour 24`. If `Incremental_CTR_PairB` clears `>= 5.10%` (pushing `W >= 0.62`), lock `Pair B` permanently.
4. If `Incremental_CTR_PairB` improves by less than `+0.35%` and remains below `4.90%` at `Hour 24`, execute one final swap to `Pair C` (`Asymmetric unit-cost / two-object collision`). Never perform a fourth edit inside `48` hours; rapid repeated re-indexing prevents YouTube's exploration bandit from accumulating clean arm statistics.

### Quadrant 2: High CTR (`>= 6.20%`) + steep `0:30` cliff (`< 58%`)

High CTR paired with a `42%+` viewer walkout inside thirty seconds means the package wrote a check the opening fifty words did not cash. Common triggers include framing a structural balance-sheet essay (`STR-BOYLE-CHAPTERED` or `STR-FISHER-ARTIFACT`) like a breaking crisis alert, leaving the subject ambiguous so viewers expect consumer tech reviews instead of sovereign debt math, or violating `19_first_15s_hook_alignment_matrix.md` by delaying the title's promised document past `0:20`.

Left uncorrected, a `< 58%` thirty-second cliff drags whole-video `AVD` below the `45.8%` Layer-2 floor and collapses `W`, causing YouTube to shut off Browse impressions entirely by `Hour 18`.

Execute the literal document-grounded reset immediately at `Hour 6`:

1. Replace the high-curiosity package with the literal primary-artifact variant (`Pair B`): show the actual printed filing (`MTS Table 9`, `Form 10-K Note 1`, `12 CFR 1005.6`, `NIST FIPS 203`) on `#F4EFE6` cotton stock and state the exact institutional mechanism in the title.
2. Accept a deliberate `-0.6%` to `-1.1%` drop in raw Browse CTR (`for example, 6.8% -> 5.7%`) in exchange for filtering out mismatched clickers and lifting `0:30` retention back above `70%` and `AVD` above `49%`. A `5.7%` Browse CTR at `50.0%` AVD on a `28`-minute video yields `W = 0.798` (Layer-4 breakout territory), whereas `6.8%` CTR at `39.0%` AVD yields `W = 0.742` while failing the `45.8%` AVD gate and stalling in Layer 1.
3. Only in extreme cases where an unscripted `5`-to-`8` second throat-clearing preamble slipped past `prep-aroll.mjs` at `0:00`, use `YouTube Studio -> Editor -> Trim & cut` to snip the dead opening seconds cleanly down to the first stake sentence without losing existing URL or comment equity.

### Quadrant 3: Falling CTR (`8.5% -> 5.2%`) while impressions surge `5x` to `10x` in cold Browse

This is the single most dangerous false alarm in YouTube Studio. Every Layer-4 breakout outlier in `cohort_projection_jan2028.json` (`ep_04` at `4.87M` impressions and `6.74%` Browse CTR; `ep_10` at `7.09M` impressions and `6.55%` CTR; `ep_11` at `7.51M` impressions and `6.88%` CTR; `ep_14` at `13.66M` impressions and `6.42%` CTR; `ep_23` at `10.45M` impressions and `6.97%` CTR; `ep_29` at `7.90M` impressions and `6.95%` CTR) exhibits a downward-sloping CTR line during hours `6` through `36`.

The math is pure denominator expansion:

- During Hours `0` to `4` (Layer 1), `20,000` warm subscribers and core macro fans click at `8.5%` to `9.8%`.
- At Hour `8`, `W >= 0.74` triggers Layer 3 and Layer 4 promotion, and YouTube sprays `250,000` impressions per hour across cold audiences who normally watch general history, engineering, or mainstream news.
- Those cold cohorts click at `5.2%` to `6.1%` while still watching `51%` to `53%` of a `28`-minute investigation (`W = 0.76` to `0.85`), generating `8,000` to `15,000` net new subscribers on a single upload (`+15,399` subs on `ep_14` alone).

Creators who see `8.5%` fall to `5.2%` on the Studio overview card and swap the thumbnail in panic invalidate the active recommendation cluster and flatten the impression curve within two hours. Whenever hourly Browse impressions are expanding `>= 3x` over the prior six-hour average and `AVD` holds `>= 48.2%`, enforce a hard freeze: touch nothing in title, thumbnail, tags, or description.

### Quadrant 4: Low CTR (`< 4.70%`) + low `AVD` (`< 45.8%`) across all 3 variants (`A`, `B`, `C`)

When `Pair A`, `Pair B`, and `Pair C` all remain trapped below `4.70%` Browse CTR after `24` hours and viewers who do click drop below `62%` at `0:30` and below `45.8%` overall `AVD`, the upload missed on both topic framing and script execution. Continuing to swap titles on Day 2 through Day 6 accomplishes nothing.

Execute the post-mortem containment and autopsy pipeline:

1. Lock long-tail Search packaging at `Hour 36`: select whichever title among `A, B, C` matches clean high-intent YouTube Search queries (`10.0%` to `14.0%` Search CTR band in `cohort_projection_jan2028.json`, such as naming the exact statute, tax code, or institution inside the first `38` characters) and verify end-screen inflows from adjacent Series Playlist episodes (`47_endscreen_and_binge_routing_graph.md`). Even a Layer-1 `horizon_library` upload averages `180,955` cumulative views by January 2028 when anchored inside playlist chains (`ep_17` and `ep_20`).
2. Export Studio telemetry at `Day 7`: download `Audience_Retention.csv` (elapsed seconds + `audienceWatchRatio`) and `Traffic_Source.csv` from YouTube Studio Advanced Mode.
3. Run deterministic autopsy before filming the next sprint (`ep_{k+1}`): pass the Studio retention export, timestamped `.srt` transcript, and script file straight into Deliverable 52 (`08_ops_monetization_and_qa/tools/retention_autopsy.py`) alongside Deliverable 26 (`04_scripts_and_dossiers/tools/retention_linter.mjs`):

```powershell
# Correlate live YouTube Studio drop-off cliffs against script deciles and cinema scene types
python 08_ops_monetization_and_qa/tools/retention_autopsy.py `
  --retention-csv exports/ep_XX_retention.csv `
  --traffic-csv exports/ep_XX_traffic.csv `
  --script 04_scripts_and_dossiers/dossiers/ep_XX.md `
  --json

# Re-verify R01..R47 structural and re-hook cadence gates on the next episode's script before shoot day
node 04_scripts_and_dossiers/tools/retention_linter.mjs `
  --file 04_scripts_and_dossiers/dossiers/ep_NEXT.md
```

`retention_autopsy.py` maps every `>= 3.5%` single-interval retention drop directly against the active spoken sentence and `reading-room-cinema` `StyleRecipe` (`talking-head-full` over-stay past `36%` A-roll ceiling, unbridged primer exceeding `450` words, decile re-hook gap violating `R13 > 0.18`, or cold open exceeding `R01`'s `50`-word stake budget), converting a single underperforming upload into concrete structural guardrails for the very next `12-day` production sprint.
