# Deliverable 14: Automated staleness and decay audit specification

Document ID: `RR-OS-DIV02-14`
Executable CLI: [`tools/staleness_audit.py`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/tools/staleness_audit.py)
Canonical Fact Ledger: [`data/fact_ledger.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/data/fact_ledger.json)
Operational horizon: February 2027 Launch Trio through January 2028 (`30` flagship uploads)

## 1. Decay taxonomy and Browse half-life mechanics

YouTube's Browse recommender judges every long-form upload twice: first against returning subscribers during the opening seventy-two hours, and second against cold Home-feed viewers six to eighteen months later. Most technology and finance channels optimize only for the first forty-eight hours. They stamp current calendar years into titles, chase single-model leaderboard swaps, or hardcode quarterly bond figures into prose without a refresh protocol. Six weeks later, click-through rate craters because cold viewers skip dated packaging on sight.

*The Reading Room* builds a thirty-episode catalog designed to compound views past January 2028. Achieving multi-year shelf life without sounding like a dry university lecture requires separating perishable news wrappers from ten-year institutional collisions (`2027` to `2036`). [`staleness_audit.py`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/tools/staleness_audit.py) enforces that boundary mechanically across every slate JSON entry, research dossier, and spoken script before camera roll.

### Five-class editorial decay taxonomy

| Decay class | Typical half-life | Browse failure mechanism | Reading Room structural counter-design | Enforcing gate |
| :- | :- | :- | :- | :- |
| Class I: Relative calendar language | `2 to 14 days` | Phrases such as `this week`, `breaking today`, `last month`, or `right now in 2026` betray upload age within seconds of playback. | Stamp cold-open receipts by explicit calendar month and year (`In October 2026`, `In June 2027`). | Gate 1 |
| Class II: Title year-stamps and retro-scandals | `0 to 60 days` | Viewers in late 2027 scroll past `2021` to `2026` title dates and exhausted `FTX` or `Silicon Valley Bank` post-mortems. | Keep evergreen titles undated or forward-looking; confine 2022 to 2024 failures to Act II or Act III stress tests. | Gate 2 |
| Class III: Checkpoint and prompt gimmicks | `21 to 60 days` | Next-quarter model weights invalidate `beats GPT-4o`, `Claude 3.5 Sonnet trick`, and `Chatbot Arena` leaderboard videos overnight. | Audit multi-year unit-cost deflation (`>99%` token drop) colliding with physical grid queues and debt contracts. | Gate 3 |
| Class IV: Unbound volatile macro figures | `60 to 120 days` | Spot Treasury debt, 30-year JGB yields, hyperscaler CapEx, FinCEN SAR totals, and bot-traffic shares drift between research lock and shoot week. | Bind rolling series to `[LIVE_STAT_SLOT:...]` tokens and verified `FL-XXX` entries inside `fact_ledger.json`. | Gate 4 |
| Class V: Structural horizon starvation | `90 to 180 days` | Pitches lacking a multi-year legal, fiscal, or physical bottleneck lose urgency once initial social chatter fades. | Require a `>= 20`-word `late_2027_staleness_immunity_proof` anchored explicitly inside `2027` to `2036`. | Gate 5 |

### Cohort exemptions, economic idioms, and historical stress tests

Blanket regex filtering breaks investigative writing when a tool confuses historical evidence with live-wire gossip. [`staleness_audit.py`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/tools/staleness_audit.py) applies three domain-aware rules so legitimate primary scholarship scores `0` (`IMMUNE`):

1. Pre-recorded Launch Trio hooks (`ep_01` through `ep_03`). Episodes 01, 02, and 03 are filmed ahead of channel launch as a three-part opening cohort. When an entry in that trio carries an explicit `pre_recorded_launch_trio` marker, Gate 1 exempts relative calendar phrasing inside its cold-open hook (`cold_open_hook`, `hook`, or the opening twenty lines prior to Act I) and logs the exemption in the audit trail. Spoofing `pre_recorded_launch_trio` on evergreen episodes (`ep_04` through `ep_30`) is rejected automatically; Gate 1 still fires at full hard-gate weight.
2. Debt-deflation contract idioms. Irving Fisher's 1933 debt-deflation mechanism requires explaining how falling nominal wages collide with liabilities fixed at prior nominal levels (`frozen at yesterday's numbers`, `yesterday's prices`, or `yesterday's contracts`). Gate 1 excludes possessive economic contract idioms via negative lookahead while catching genuine wire-copy traps (`Yesterday, regulators announced`).
3. Anchored Act II and Act III historical stress tests. Standalone retrospectives on 2022 crypto lenders or March 2023 regional bank runs fail Gate 2 immediately. When an episode such as `ep_10` (*When Treasury Agents Move $4 Trillion in Overnight Deposits*) anchors its title and thesis inside `2028` to `2035` programmatic cash sweeps and cites Silicon Valley Bank's 24-hour outflow strictly inside Act II (`FL-071`) as an empirical velocity benchmark, Gate 2 passes with zero penalty. Placing a 2022 to 2024 scandal inside an evergreen cold-open hook triggers an `8`-point soft-drift warning so historical parallels stay inside middle acts.

## 2. Five-gate scoring equations and risk classification

Every audited item $i$ (a master slate episode object, standalone episode JSON, or Markdown dossier/script) receives a deterministic `decay_risk_score` on a `0` to `100` integer scale. Each gate $k \in \{1, 2, 3, 4, 5\}$ accumulates hard-gate violation points $H_k$ up to cap $C_k$ and soft-drift advisory points $D_k$ up to `15`:

```text
G_k(i)             = min(C_k, H_k(i) + min(15, D_k(i)))
hard_gate_score(i) = min(100, H_1(i) + H_2(i) + H_3(i) + H_4(i) + H_5(i))
soft_drift_score(i)= min(30,  min(15, D_1) + min(15, D_2) + min(15, D_3) + min(15, D_4) + min(15, D_5))
decay_risk_score(i)= min(100, hard_gate_score(i) + soft_drift_score(i))
```

Meta-documentation fields (`late_2027_staleness_immunity_proof`, `refresh_instructions`, `kill_gates`, `adversarial_caveat`, `rejected_angle`) are excluded from Gates 1 through 3 text-trap sweeps so an immunity proof can name a rejected 2026 gimmick without self-triggering.

### Gate-by-gate point schedule

| Gate | Cap ($C_k$) | Hard-gate triggers ($H_k$) | Soft-drift triggers ($D_k$) |
| :- | :- | :- | :- |
| Gate 1: Relative Temporal Traps | `35` | Evergreen (`ep_04..ep_30`) match on `this week`, `last week`, `earlier this week`, `this month`, `last month`, `earlier this year`, `early this year`, non-idiom `yesterday`, `right now in 2021-2026`, `breaking today`, `just announced`, `this morning`, `earlier today`: `+22` first hit, `+8` each extra hit. | Launch-trio (`ep_01..ep_03`) relative phrase outside exempted cold open (`+10` per hit); evergreen `in recent weeks/days` or `days/weeks ago` (`+8` per hit). |
| Gate 2: Title Year-Stamps & Retro-Scandals | `40` | `2021` to `2026` year stamp in evergreen title (`+25`); `2022` to `2024` retro-scandal centered in title (`+28`); post-mortem thesis framing (`+28`); retro-scandal in body without a `2027` to `2036` forward horizon (`+28`). | `2021` to `2026` year in launch-trio title (`+10`); retro-scandal placed in evergreen cold-open hook despite valid `2027` to `2036` horizon (`+8`). |
| Gate 3: Brittle Model-Version Gimmicks | `35` | Point-release model stamp (`GPT-4o`, `Claude 3.5`, `Gemini 1.5`, `DeepSeek-R1`) in evergreen title (`+25`); `beats <model>`, `<model> trick/hack`, `new benchmark/arena leader`, `prompt hack`, or `<model> vs <model>` shootout: `+25` first hit, `+10` each extra hit. | None (`0`); structural cost comparisons (`>99%` equivalent token deflation since 2023) pass at `0`. |
| Gate 4: `[LIVE_STAT_SLOT]` Bindings | `35` | Volatile series (debt totals, yields/rates/auctions, CapEx/FCF/RPO/AUM run-rates, FinCEN SAR/fraud/KEV counts, bot-traffic/grid shares) with zero `[LIVE_STAT_SLOT:...]` and zero valid `FL-XXX` bindings (`+22` first, `+6` each extra); malformed slot tag (`+15`); unknown `FL-XXX` absent from `fact_ledger.json` (`+14`); citing only `STATIC_LOCK` `FL-XXX` IDs when episode owns active live slots (`+12`). | None (`0`); spoken scripts backed by `fact_ledger.json` `script_anchors` resolve at `0`. |
| Gate 5: Late-2027 Immunity Proof | `35` | Missing, blank, or placeholder `late_2027_staleness_immunity_proof` on slate entry (`+25`); proof `< 15` words (`+22`); borderline proof `15` to `19` words (`+14`); missing `2027` to `2036` structural horizon (`+20`). | Proof of `20` to `24` words omitting explicit `2027` to `2036` years inside the proof text while horizon exists elsewhere on entry (`+6`). |

### Risk bands and CI exit semantics

| `decay_risk_score` | Classification | Editorial meaning | Standard CLI exit | `--strict` CLI exit |
| :- | :- | :- | :- | :- |
| `0` | `IMMUNE` | Zero hard-gate violations and zero soft recency drift; cleared for late-2027 and January 2028 Browse distribution. | Exit `0` (`PASS`) | Exit `0` (`PASS`) |
| `1 to 15` | `LOW_DRIFT` | Minor soft recency phrasing, launch-trio body phrasing, or a single borderline hard infraction (`+12` static-only binding or `+14` 15-to-19-word proof). | Exit `0` (`PASS`) | Exit `1` (`FAIL`) if any evergreen item has `hard_gate_score > 0`; Exit `0` if soft-only. |
| `16 to 100` | `STALE_RISK` | Perishable packaging, unanchored wire copy, model-version hype, unbound spot figures, or missing forward horizon; blocked from production. | Exit `1` (`FAIL`) | Exit `1` (`FAIL`) |

Notice why separating `hard_gate_score` from `soft_drift_score` matters during wave sign-off. An evergreen episode with a 16-word immunity proof (`+14` hard points) or static-only `FL-XXX` citations alongside active live metrics (`+12` hard points) lands inside `LOW_DRIFT` (`1` to `15`) during exploratory drafting, yet fails automated release gating the moment `--strict` is enabled.

## 3. Shoot-week `[LIVE_STAT_SLOT]` binding and refresh workflow

Dossiers for `ep_04` through `ep_30` lock months ahead of their scheduled 2027 and January 2028 upload dates. Leaving raw numbers like `$40.5 trillion` in federal debt, `4.0%` thirty-year JGB yields, `$824 billion` in annualized hyperscaler CapEx, `4.8 million` FinCEN SAR filings, or `53%` Imperva automated bot traffic as unindexed text guarantees silent rot across quarterly statistical releases.

Gate 4 links every volatile metric across three stages of production:

1. Master slate and dossier lock (`T-90d` to `T-14d`). Every slate object in `slate_30_jan2028.json` declares its rolling hooks inside `live_stat_slots` (`[LIVE_STAT_SLOT:<UPPER_SNAKE_ID>]`) or links directly to `fact_ledger_ids` (`FL-001` through `FL-102`). Research dossiers embed matching YAML `slot_id` blocks:

```yaml
live_stat_slot:
  slot_id: "IMPERVA_BOT_TRAFFIC_SHARE"
  fact_id: "FL-098"
  target_episode: "ep_28"
  fallback_baseline: "53 percent automated internet traffic share"
  refresh_window: "Within 72 hours prior to A-roll recording"
  thesis_break_if: "Automated bot requests drop below 42 percent"
```

2. Shoot-week primary refresh (`T-72h` to `T-24h`). Pull the latest primary release directly from the issuing agency named in `fact_ledger.json` (`48` live slots across Groups A, B, and C). Test the fresh print against `THESIS_BREAK_IF:`. When the figure stays inside thesis bounds, update `exact_value`, `publication_date`, `verification_formula`, and `script_anchors` inside `fact_ledger.json`, then write the spoken number into the teleprompter Markdown script and the corresponding `reading-room-cinema` `#FAF8F3` milk-canvas receipt card. If a statutory repeal or macro reversal breaches `THESIS_BREAK_IF:`, halt recording and return the dossier to Stage 2 Adversarial Red-Team review (`12_adversarial_red_team_protocol.md`).
3. Pre-teleprompter dual verification (`T-12h`). Spoken teleprompter scripts replace bracketed `[LIVE_STAT_SLOT:...]` tokens with natural English words. When `staleness_audit.py` scans a finished Markdown script alongside `fact_ledger.json`, Gate 4 matches spoken lines against the episode's verified `script_anchors` so refreshed teleprompter copy scores `0` (`IMMUNE`) without leaving bracket syntax on screen. Run `validate_fact_ledger.py --verify-script` and `staleness_audit.py --strict` back to back before recording audio.

### Five volatile series families monitored by Gate 4

| Detector family | Monitored macro and market indicators | Canonical `fact_ledger.json` anchors | Shoot-week refresh cadence |
| :- | :- | :- | :- |
| `sovereign_or_household_debt_total` | Gross US federal debt, household debt, student loans, TIC foreign holdings, CBO net interest | `FL-007`, `FL-009`, `FL-011`, `FL-048`, `FL-074` | `24h to 72h` via Treasury Fiscal Data, NY Fed, Federal Reserve `G.19`, and CBO Table 1-1 |
| `market_yield_rate_or_auction` | BOJ policy rate, 10Y/30Y JGB and Treasury yields, Fitch PCDR defaults, PJM clearing caps | `FL-041`, `FL-046`, `FL-047`, `FL-063` | `24h to 72h` via Bank of Japan, Ministry of Finance, Fitch Ratings, and PJM BRA filings |
| `capex_fcf_rpo_or_aum_run_rate` | Hyperscaler CapEx, negative FCF quarters, cloud RPOs, private credit AUM, 401(k)s, T-bills, deposits | `FL-017`, `FL-018`, `FL-049`, `FL-058`, `FL-062`, `FL-065`, `FL-072` | Quarterly within `72h` of recording via SEC EDGAR `10-K`/`10-Q`, ICI, FDIC, and BDO reports |
| `sar_fraud_or_patch_count` | FinCEN annual SAR volume, FTC consumer fraud losses, Verizon DBIR KEV patch remediation days | `FL-066`, `FL-070`, `FL-088` | Semi-annual or annual check within `72h` via FinCEN advisories, FTC Sentinel, and Verizon DBIR |
| `bot_traffic_or_grid_share` | Imperva automated bot share, FSB algorithmic equity volume, US grid gap GW, transformer lead weeks | `FL-067`, `FL-079`, `FL-098` | Annual structural check within `72h` via Imperva Bad Bot Report, FSB, NERC, and LBNL queues |

### Worked slate immunity contract and Hijack Radar handoff

Whenever a breaking 2027 filing enters via `news_to_thesis_radar.mjs` (`11_news_to_thesis_hijack_playbook.md`) under `ROUTE_A_COLD_OPEN_INJECTION` or `ROUTE_C_BREAKER_SLOT_SWAP`, the analyst runs `staleness_audit.py --strict` at Minute `01:45` of the two-hour triage clock. Every greenlit slate entry conforms to this audited JSON contract:

```json
{
  "episode_id": "ep_08",
  "title": "The 94-Gigawatt Bottleneck Behind Your Electric Bill",
  "structural_horizon": "2027-2036",
  "cold_open_hook": "In July 2027, wholesale power capacity auctions hit federal price caps as five-gigawatt server campuses reserved regional substations.",
  "thesis": "PJM capacity clearing prices jumped to $269.92/MW-day while US grid gaps reach 94 GW and large power transformer lead times stretch 100 to 160 weeks through 2034.",
  "live_stat_slots": [
    "[LIVE_STAT_SLOT:PJM_CAPACITY_AUCTION_CLEARING]",
    "[LIVE_STAT_SLOT:US_GRID_GAP_TRANSFORMER_QUEUE]"
  ],
  "fact_ledger_ids": ["FL-041", "FL-067"],
  "late_2027_staleness_immunity_proof": "High-voltage transformer manufacturing queues run 100 to 160 weeks and utility transmission rate-base depreciation spans twenty-five years, keeping residential electric bill collisions active from 2027 through 2036."
}
```

Compare how the scorer treats a rushed wire pitch against that locked entry:

1. Rejected wire draft (`decay_risk_score = 82`, `STALE_RISK`): `2026 Grid Shock: Why Utilities Just Announced Emergency Rate Hikes This Week as AI Campuses Hit 94 GW`. Triggers Gate 1 (`just announced`, `this week`: `+30`), Gate 2 (`2026` in title: `+25`), Gate 4 (unbound `94 GW`: `+22`), and Gate 5 (missing immunity proof: `+25`, capped at `100` across gates).
2. Locked Reading Room slate entry (`decay_risk_score = 0`, `IMMUNE`): undated contradiction title, explicit `July 2027` calendar stamp in the cold open, `[LIVE_STAT_SLOT:...]` plus `FL-041` and `FL-067` bindings, and a 27-word `late_2027_staleness_immunity_proof` anchored in 25-year utility rate recovery through `2036`.

## 4. CLI reference and automated self-test suite

[`tools/staleness_audit.py`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/tools/staleness_audit.py) runs on Python 3.10+ using standard-library modules only (`argparse`, `dataclasses`, `json`, `pathlib`, `re`, `sys`, `typing`).

```powershell
# Run the 10-case synthetic verification suite (zero dependency on slate_30_jan2028.json)
python 02_research_and_data/tools/staleness_audit.py --self-test
python 02_research_and_data/tools/staleness_audit.py --self-test --json

# Audit the 30-episode master slate under strict evergreen release gating
python 02_research_and_data/tools/staleness_audit.py --slate 02_research_and_data/slate_30_jan2028.json --strict

# Audit a single Markdown script or dossier with fact_ledger.json cross-verification
python 02_research_and_data/tools/staleness_audit.py `
  --file 04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md

# Batch-audit all episode dossiers and scripts inside Division 4 (skips spec docs)
python 02_research_and_data/tools/staleness_audit.py --dir 04_scripts_and_dossiers --strict --json
```

### Command-line arguments

| Flag | Default behavior | Purpose |
| :- | :- | :- |
| `--slate <path>` | `02_research_and_data/slate_30_jan2028.json` (when no other target is passed) | Audits a multi-episode slate JSON file and enforces Gate 5 `late_2027_staleness_immunity_proof` on every entry. |
| `--file <path>` | None | Audits one Markdown dossier, spoken script, or standalone JSON episode file. |
| `--dir <path>` | None | Recursively audits `.md` and `.json` episode files in a directory while skipping deliverable specification docs and `tools/` or `data/` folders. |
| `--ledger <path>` | `02_research_and_data/data/fact_ledger.json` | Loads all `102` locked claims (`48` live slots) to verify `FL-XXX` existence, active episode live-slot coverage, and spoken `script_anchors`. |
| `--self-test` | Disabled | Executes ten built-in synthetic `PASS`, `LOW_DRIFT`, and `STALE_RISK` test cases covering all five gates and exits `0` when all assertions hold. |
| `--strict` | Disabled | Exits `1` if any evergreen item (`ep_04..ep_30`) records `hard_gate_score > 0`, even when total score sits inside `LOW_DRIFT` (`1..15`). |
| `--json` | Human-readable table | Prints machine-readable JSON reports for CI pipelines and wave sign-off logs. |

### Machine-readable `--json` output contract

Downstream CI runners and sprint checklists consume deterministic JSON payloads from `--json`. Every audit run emits eight top-level keys (`mode`, `strict`, `ledger_loaded`, `total_items`, `counts`, `passed`, `parse_errors`, and `items`), while each element inside `items` conforms to `ItemAuditResult`:

```json
{
  "item_id": "ep_08",
  "title": "The 94-Gigawatt Bottleneck Behind Your Electric Bill",
  "source_kind": "slate_json",
  "is_evergreen": true,
  "is_launch_trio_exempt_eligible": false,
  "decay_risk_score": 0,
  "hard_gate_score": 0,
  "soft_drift_score": 0,
  "classification": "IMMUNE",
  "gate_scores": {"Gate 1": 0, "Gate 2": 0, "Gate 3": 0, "Gate 4": 0, "Gate 5": 0},
  "live_stat_slots_bound": ["PJM_CAPACITY_AUCTION_CLEARING", "US_GRID_GAP_TRANSFORMER_QUEUE"],
  "fact_ledger_ids_bound": ["FL-041", "FL-067"],
  "immunity_proof_words": 28,
  "has_forward_horizon_2027_2036": true,
  "exemptions": [],
  "findings": []
}
```

### Built-in `--self-test` calibration matrix

| Case ID | Target scenario | Expected score and band | Verified engine behavior |
| :- | :- | :- | :- |
| `CASE_01_PASS_EVERGREEN_IMMUNE` | `ep_08` grid bottleneck with live slots, `FL-041`/`FL-067`, and 31-word proof | `0` (`IMMUNE`) | Confirms clean evergreen flagship clears all five gates at zero risk. |
| `CASE_02_PASS_LAUNCH_TRIO_AND_IDIOM` | `ep_01` marked `pre_recorded_launch_trio` + `yesterday's numbers` idiom | `0` (`IMMUNE`) | Confirms cold-open cohort exemption and Fisher debt-deflation idiom exclusion. |
| `CASE_03_PASS_ANCHORED_ACT_II_STRESS_TEST` | `ep_10` 2028-2035 deposit sweep citing SVB velocity inside Act II | `0` (`IMMUNE`) | Confirms anchored Act II historical parallel avoids false-positive retro flags. |
| `CASE_04_PASS_MARKDOWN_DOSSIER` | `ep_20_dossier.md` with YAML `slot_id`, `FL-088`, and 2027-2034 horizon | `0` (`IMMUNE`) | Confirms Markdown YAML slot parsing and inline `FL-XXX` binding resolution. |
| `CASE_05_FAIL_GATE1_TEMPORAL_TRAP` | `ep_06` spoofing launch-trio flag with `Breaking today` and `right now in 2026` | `35` (`STALE_RISK`) | Confirms Gate 1 blocks relative time traps and rejects spoofed cohort tags on `ep_04+`. |
| `CASE_06_FAIL_GATE2_YEAR_AND_RETRO` | `ep_12` titled `Inside the 2023 Silicon Valley Bank and FTX Collapse` | `60` (`STALE_RISK`) | Confirms Gate 2 (`40`) and Gate 5 (`20`) block dated retro-scandal post-mortems. |
| `CASE_07_FAIL_GATE3_MODEL_GIMMICK` | `ep_15` pitching `Beats GPT-4o With One Prompt Hack` and `Claude 3.5` trick | `35` (`STALE_RISK`) | Confirms Gate 3 blocks checkpoint stamps, leaderboard hooks, and prompt hacks. |
| `CASE_08_FAIL_GATE4_UNBOUND_VOLATILE_STATS` | `ep_28` hardcoding `$40.5T` debt, `4.0%` JGBs, `$824B` CapEx, `4.8M` SARs, `53%` bots | `35` (`STALE_RISK`) | Confirms Gate 4 catches all five volatile macro/market series when unbound. |
| `CASE_09_FAIL_GATE5_STUB_IMMUNITY_PROOF` | `ep_22` with 8-word stub proof and no `2027` to `2036` horizon | `35` (`STALE_RISK`) | Confirms Gate 5 enforces both the 20-word floor and forward horizon lock. |
| `CASE_10_BORDERLINE_LOW_DRIFT_STRICT_GATE` | `ep_19` carrying a 16-word immunity proof (`14` hard points) | `14` (`LOW_DRIFT`) | Confirms `LOW_DRIFT` passes standard mode (`Exit 0`) and fails `--strict` (`Exit 1`). |

### Remediation rules when a gate fires

1. Gate 1 failure: replace relative words (`last week`, `earlier this year`, `this morning`) with explicit month-and-year primary filing dates (`In September 2026`, `In Q2 2027`).
2. Gate 2 failure: strip `2021` through `2026` dates and scandal names from the title, open on the `2027` to `2036` capability collision, and move 2022 to 2024 comparisons into Act II or Act III.
3. Gate 3 failure: delete single-checkpoint rivalries and prompt tricks; re-anchor Layer 1 around multi-year cost curves, enterprise spending caps, or physical compute queues.
4. Gate 4 failure: register the volatile series inside `fact_ledger.json` with `is_live_stat_slot: true` and `THESIS_BREAK_IF:`, then attach its `[LIVE_STAT_SLOT:<ID>]` token or `FL-XXX` reference to the slate or dossier entry.
5. Gate 5 failure: expand `late_2027_staleness_immunity_proof` past twenty words by naming the exact multi-year statute, debt maturity schedule, or physical manufacturing backlog keeping the thesis active between `2027` and `2036`.
