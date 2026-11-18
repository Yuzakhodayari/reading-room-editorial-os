# Deliverable 10: Fact-lock and primary citation ledger specification

A twenty-minute investigative documentary loses credibility the moment one viewer checks a footnote and finds a rounded press-release rumor where a federal table should sit. *The Reading Room* publishes thirty flagship episodes between launch and January 2028 across sovereign debt, corporate accounting, power grids, cybersecurity, and statutory law. Every empirical number spoken on camera, printed inside a bilingual Persian-English mastery book, or rendered onto a `#FAF8F3` milk-canvas ledger card in `reading-room-cinema` originates from one canonical file: `02_research_and_data/data/fact_ledger.json`.

No script enters A-roll recording until `02_research_and_data/tools/validate_fact_ledger.py` exits with code `0` against both the master JSON database and the episode's Markdown script.

## 1. Ledger architecture and thirty-episode coverage

`fact_ledger.json` locks `102` atomic primary claims (`FL-001` through `FL-102`), split between `48` dynamic shoot-week `[LIVE_STAT_SLOT]` entries and `54` permanent `STATIC_LOCK` historical, judicial, or statutory records. Every episode across the thirty-video January 2028 slate (`ep_01` through `ep_30`) carries dedicated primary anchors inside the database.

| Slate segment | Fact ID range | Claim count | Primary institutional spine |
|---|---|---|---|
| Episode 01 (*The Allowance*) | `FL-001` to `FL-045` | `45` | Treasury MTS Table 9 (`84.1%` FY24 to `86.4%` FY26 individual/payroll share; `10.8%` to `7.1%` corporate share), IRS SOI Table 1.4 (`68.2%` wage AGI share), `$40.5T` gross debt, NY Fed `$19.1T` household debt (`70.2%` mortgages), CBO `$2.14T` 2036 net interest, Pub. L. 119-21 (`168(k)` and `174A`), BLS productivity (`+20.6%`) and post-1947 labor share (`53.2%`), `$742B`/`$824B` hyperscaler CapEx, Alphabet/Amazon negative FCF, Fed SCF/DFA equity concentration, *Wielechowski v. State* (`403 P.3d 1141`), Uber `$1,500` monthly agent cap, `>99%` token deflation, `29 CFR 531.34` coal scrip ban, Shenzhen `6`-day e-CNY expiry, NextEra `5 GW` requests, IEA `415` to `945 TWh`, West London M4 substation queue, PJM `$28.92` to `$269.92/MW-day` (`+833.3%`), Three Mile Island Unit 1 PPA, and UK December 1, 1941 `16`-point rationing |
| Episode 02 (*Who Buys the Debt*) | `FL-046` to `FL-052` | `7` | Bank of Japan `1.25%` policy rate, `~4.0%` 30-year JGB yield, US Treasury TIC `$1,068.3B` Japan holdings, Tether Q3 2026 BDO attestation (`$132.4B` T-bills inside `$191.45B` assets), Circle `~$68.0B` USDC reserves, and July 2025 GENIUS Act (`Pub. L. 119-27`) `1:1` `<=93`-day T-bill backing plus `0.0%` holder yield prohibition |
| Episode 03 (*The Depreciation Trick*) | `FL-053` to `FL-060` | `8` | `$720B-$828B` hyperscaler CapEx running `3.5x` GAAP depreciation, Form 10-K server useful-life extensions (`3` years to `5-6` years), `~$176B` cumulative 2026-2028 understated depreciation math, CoreWeave Q3 2026 Form 10-Q (`$46.9B` debt + `$19.3B` leases = `$66.2B`), Nvidia `$6.3B` Form 8-K capacity backstop through April 2032, OpenAI `$300B` Oracle and `$250B` Azure RPO commitments, and xAI `$20B` GPU SPV |
| Episodes 04 to 30 (Flagship Dossiers) | `FL-061` to `FL-102` | `42` | Stanford ADP `22-25` age `-16%` to `-19%` employment drop, `$2.5T` Private Credit / `$500B` SaaS LBOs / `6.3%` Fitch PCDR / `88%` PIK workouts, Gabaix-Koijen `5.0x` inelastic multiplier and `$10.8T` 401(k)s, Regulation E `12 CFR 1005.6` and `$12.5B` FTC fraud, `94 GW` grid gap / `100-160w` transformers / `72%` China mineral refining, UIUC `87%` 1-day CVE exploit and Verizon `32-43d` KEV patching, SVB `$42B/24h` run / `$4.04T` `0%` deposits / `$198.25B` Nilson fees, Fed `G.19` `$1.81T` student debt and NY Fed `42.5%` underemployment, MIT EEG `55%` drop and Microsoft/CMU `936` workflows, Morgan Stanley *Humanoid 100* `63%` China share and `$16k-$30k` BOM, FSB `70%-80%` automated equity volume, Taiwan `80%-90%` `<5nm` / `$14T` market cap / `$10T` blockade / ASML EUV lock, IMF `SDN/2024/001` and Rodrik `NBER 20935`, CA FAIR Plan `+29.1%` and `$13.4T` mortgages, Character.AI `93-120m/day` and *Garcia* ruling, `$20k` drones vs `$2.1M-$4M` interceptors, FinCEN `4.6M-4.8M` SARs and `31 U.S.C. 5318(g)(2)`, Chesney-Citron *Liar's Dividend* / *Huang v. Tesla* / pulled-back `Rule 707`, DOJ *RealPage* and FTC `6(b)`, `$6.1T` Gulf SWFs and `$100B` AIP, *Volt/Salt Typhoon* and `CALEA`, LBNL `17B-33B` gal water and `70%` Moroccan phosphate, South Korea `0.72` TFR, TeleGeography `550+` cables and `75%` Big Tech share, Imperva `53%` bots and `EU 2024/1183` Dec 2027 Digital IDs, NIST `FIPS 203/204/205` and `OMB M-26-15` Dec 2030 keys, and Social Security `Q4 2032` OASI `-22%` to `-26%` cut vs `12.4%` FICA |

## 2. Mandatory thirteen-field claim schema

Every object inside the top-level `facts` array must populate thirteen required keys with strict Python types. Omitting a key, leaving whitespace-only strings, or inserting placeholder tokens (`TODO`, `TBD`, `FIXME`) fails Gate 2 and Gate 4 immediately.

```json
{
  "fact_id": "FL-041",
  "episode_refs": ["ep_01", "ep_08"],
  "claim_summary": "In PJM Interconnection's 2025/2026 Base Residual Auction across 13 states and Washington, D.C., wholesale capacity clearing prices jumped 833.3% from $28.92 to $269.92 per megawatt-day.",
  "exact_value": "$28.92 -> $269.92/MW-day (+833.3%)",
  "unit": "USD per megawatt-day",
  "institution": "PJM Interconnection, L.L.C.",
  "source_document": "2025/2026 Base Residual Auction Report",
  "table_or_section": "Table 1: RTO Resource Clearing Prices ($269.92/MW-day vs $28.92/MW-day in 2024/2025 BRA; BGE $466.35, Dominion $444.26)",
  "publication_date": "2024-07-30",
  "verification_formula": "round((269.92 - 28.92) / 28.92 * 100, 1) == 833.3 and 13 + 1 == 14  # +833.3% RTO jump across 13 states + 1 federal district",
  "adversarial_caveat": "Grid Engineer check: thermal coal/gas plant retirements (~13 GW) and PJM ELCC accreditation rule changes drove the 2025/2026 spike alongside data-center load growth in Dominion Virginia; subsequent 2026/2027 auctions hit the FERC $329.17 price cap.",
  "is_live_stat_slot": true,
  "refresh_instructions": "[LIVE_STAT_SLOT:PJM_CAPACITY_AUCTION_CLEARING] Refresh upon each PJM Base Residual Auction release within 72h of shoot week; keep 2025/2026 ($28.92 -> $269.92, +833%) historical inflection and append latest cap if newer. THESIS_BREAK_IF: PJM RTO clearing price drops back below $75/MW-day.",
  "script_anchors": ["jumped from $28.92 to $269.92 per megawatt-day", "833 percent spike", "833 percent price spike"]
}
```

### Field-by-field rules

1. `fact_id` (`str`): Globally unique identifier matching `^FL-\d{3}$`. Never reuse retired IDs.
2. `episode_refs` (`list[str]`): One or more canonical episode slugs matching `^ep_(?:0[1-9]|[12]\d|30)$`. Cross-episode receipts list every script or dossier that cites the number.
3. `claim_summary` (`str`, minimum 25 characters): Plain, active English sentence stating what the primary filing proves. Subject to full Anti-AI vocabulary, punctuation, and negative-contrast scanning.
4. `exact_value` (`str`): Exact locked primary figure, range, docket number, or statutory code ready for `reading-room-cinema` lower-third callouts.
5. `unit` (`str`): Explicit denomination (`USD trillions`, `percent of federal receipts`, `terawatt-hours per year`, `federal district court product-liability ruling`).
6. `institution` (`str`): Official issuing body, court, statistical agency, or SEC registrant. Secondary blogs, social threads, and unattributed press roundups are rejected unless the quote itself is the dated subject being audited.
7. `source_document` (`str`): Full title of the report, Public Law, Form 10-K/10-Q, court opinion, or peer-reviewed paper.
8. `table_or_section` (`str`): Exact table number, statutory section, accounting footnote, or page range so a fact-checker can locate the figure in under two minutes.
9. `publication_date` (`str`): ISO `YYYY-MM-DD` or `YYYY-MM` date between `1900` and `2036`.
10. `verification_formula` (`str`): Safe mathematical assertion parsed via Python's `ast` module without `eval()`. Formulas must combine at least one binary arithmetic operation (`+`, `-`, `*`, `/`, `//`, `%`, `**`) or numeric function (`round`, `abs`, `min`, `max`) with a numeric comparison (`==`, `<=`, `>=`, `<`, `>`) that evaluates to `True`. Trivial tautologies (`100 == 100`) fail automatically. Optional context notes follow `#`.
11. `adversarial_caveat` (`str`, minimum 35 characters): Records the Stage 2 Red-Team boundary check (Macroeconomist, CPA, Grid Engineer, Security Researcher, or Tech Lawyer) so narration pre-empts expert counterarguments honestly.
12. `is_live_stat_slot` (`bool`): `true` for quarterly, monthly, or annual rolling balances that require shoot-week verification; `false` for closed historical years, enacted statutes, court holdings, and fixed experimental datasets.
13. `refresh_instructions` (`str`): Governs pre-shoot maintenance under two mutually exclusive prefixes (`[LIVE_STAT_SLOT:<SLOT_ID>]` when `is_live_stat_slot` is `true`, or `STATIC_LOCK:` when `false`).
14. `script_anchors` (`list[str]`, optional): Case-insensitive substrings linking the ledger entry to exact spoken lines during `--verify-script` runs.

### Separating longitudinal character math from empirical filings

Every flagship script follows a named human character (such as Claire, a thirty-two-year-old software engineer in Austin paying a `$3,400` fixed monthly mortgage in Episode 01) alongside unit-cost illustrations (`$120` running shoes). Storing fictional character budgets inside primary institutional rows would corrupt citation integrity, while ignoring dollar signs in a script would let unverified statistics slip onto YouTube.

`fact_ledger.json` solves both problems through the top-level `narrative_persona_allowlists` map keyed by episode ID. Each allowlist entry documents the exact spoken phrase and narrative rationale. During `--verify-script`, any currency, percentage, or physical unit in the script that does not match a documented persona illustration must map directly to a verified `fact_id` on that exact line.

## 3. Shoot-week `[LIVE_STAT_SLOT]` standard operating procedure

Because *The Reading Room* builds dossiers months ahead of late-2027 and January 2028 publication dates, spot balances such as Treasury debt, JGB yields, hyperscaler CapEx, and PJM auction caps drift between research lock and A-roll recording. Run this five-step refresh protocol inside the 72-hour window before stepping in front of the teleprompter.

### Step 1: Isolate active slots for the target episode

Filter `fact_ledger.json` for entries where `episode_refs` contains the upcoming episode slug and `is_live_stat_slot` equals `true`. Every active slot begins its `refresh_instructions` with a globally unique `[LIVE_STAT_SLOT:<UPPER_SNAKE_ID>]` tag, a mandatory refresh window (`24h`, `48h`, `72h`, `monthly`, `quarterly`, or `annual`), and an explicit `THESIS_BREAK_IF:` threshold.

### Step 2: Pull the latest primary release directly from the issuing agency

Open the exact institutional series named in `source_document` and `table_or_section`. Never pull updated figures from financial news headlines or LLM memory. Check whether the agency revised prior-year comparison baselines alongside the latest print.

### Step 3: Evaluate the `THESIS_BREAK_IF` circuit breaker

Compare the fresh primary print against the `THESIS_BREAK_IF:` condition inside `refresh_instructions`:

1. Normal drift inside thesis bounds. Suppose US gross federal debt (`[LIVE_STAT_SLOT:US_GROSS_FEDERAL_DEBT]`) moves from `$40.5T` to `$41.8T`, well above its `$36.0T` break floor. Update `exact_value`, `publication_date`, `verification_formula`, the spoken number in the script, and the `reading-room-cinema` artifact JSON card.
2. Circuit-breaker breach. Suppose Congress amends the corporate tax code and corporate receipts (`[LIVE_STAT_SLOT:MTS_TABLE9_CORP_SHARE_FY]`) climb past `13.0%` of federal revenue. Halt A-roll production immediately. Return the script to Stage 2 Adversarial Red-Team review so the structural argument reflects the new fiscal reality before filming.

### Step 4: Leave `STATIC_LOCK` rows untouched

Entries marked `is_live_stat_slot: false` carry a `STATIC_LOCK:` prefix because they anchor closed fiscal baselines (FY2024 MTS Table 9 at `84.1%`), enacted statutory text (`Pub. L. 119-21`, `Pub. L. 119-27`, `29 CFR 531.34`, `EU 2024/1183`), appellate precedent (*Wielechowski v. State*), or historical stress tests (December 1, 1941 British points rationing; October 2020 Shenzhen e-CNY pilot). Never overwrite a `STATIC_LOCK` baseline during shoot week. When an episode contrasts an older inflection point with a new print, keep the static baseline intact and append the newer figure as its own `fact_id` or inside the paired live slot.

### Step 5: Re-verify arithmetic, Anti-AI hygiene, and 100% script coverage

After saving any shoot-week update to `fact_ledger.json` and the episode script, run the validator CLI before generating teleprompter HTML or `reading-room-cinema` scene bundles.

## 4. Validator CLI reference (`validate_fact_ledger.py`)

`02_research_and_data/tools/validate_fact_ledger.py` uses Python 3.10+ standard-library modules only (`argparse`, `ast`, `datetime`, `json`, `math`, `operator`, `pathlib`, `re`, `sys`). It exits with code `0` when every gate passes and code `1` on any schema, citation, math, prose, or script-coverage violation.

```powershell
# Full ledger audit + bidirectional Episode 01 script claim verification
python 02_research_and_data/tools/validate_fact_ledger.py `
  --verify-script 04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md

# Emit structured JSON audit report for automated CI / wave readiness gates
python 02_research_and_data/tools/validate_fact_ledger.py `
  --verify-script 04_scripts_and_dossiers/ep_01_the_allowance/source_video_01_script.md `
  --json

# Audit both the JSON ledger and this Markdown specification for Anti-AI compliance
python 02_research_and_data/tools/validate_fact_ledger.py `
  --audit-markdown 02_research_and_data/10_fact_ledger_specification.md
```

### Summary of automated enforcement gates

| Gate | What `validate_fact_ledger.py` enforces | Failure condition |
|---|---|---|
| Gate 1 | Top-level counts (`total_facts`, `live_stat_slot_count`) and `>= 85` minimum claim floor | Declared count mismatch or fewer than `85` locked claims |
| Gate 2 | Presence and exact Python types across all 13 mandatory claim fields | Missing key or wrong data type (such as `int` or `str` on boolean `is_live_stat_slot`) |
| Gate 3 | Unique `FL-XXX` IDs, valid `ep_01..ep_30` slugs, and 30-episode slate span | Duplicate ID, malformed episode slug, or duplicate episode ref inside one row |
| Gate 4 | Non-empty citations, minimum caveat depth, placeholder ban, and ISO date check | Blank source/section, `TODO`/`TBD` text, or invalid calendar date |
| Gate 5 | Safe AST arithmetic evaluation of `verification_formula` | Syntax error, unsafe node, tautology (`x == x`), or formula evaluating to `False` |
| Gate 6 | `[LIVE_STAT_SLOT]` prefix, unique `<SLOT_ID>`, refresh cadence, and `THESIS_BREAK_IF:` rule | Missing or duplicate slot ID, missing circuit breaker, or `STATIC_LOCK:` omitted when `false` |
| Gate 7 | Anti-AI prose scan plus `--verify-script` forward/reverse empirical coverage | Any dash, exclamation mark, banned AI word, negative contrast crutch, unmatched anchor, or unbacked statistic in `<script.md>` |

## 5. Primary source hierarchy and verification standards

Every `institution` and `source_document` entry in `fact_ledger.json` follows a four-tier evidentiary hierarchy. Higher tiers govern whenever two sources publish conflicting estimates.

### Tier 1: Statutory, judicial, and sovereign accounting ledgers

1. Federal fiscal and debt ledgers: US Treasury Bureau of the Fiscal Service *Final Monthly Treasury Statement* (Tables 3, 4, and 9), *Debt to the Penny*, *Monthly Statement of the Public Debt*, and *Treasury International Capital (TIC)* Table 5.
2. Legislative statutes and regulatory codes: enacted Public Laws (`Pub. L. 119-21` OBBBA, `Pub. L. 119-27` GENIUS Act), codified United States Code (`26 U.S.C.`, `29 U.S.C.`, `31 U.S.C.`, `47 U.S.C.`), Code of Federal Regulations (`12 CFR Part 1005`, `29 CFR Section 531.34`), and Official Journal EU Regulations (`Regulation (EU) 2024/1183`).
3. Appellate and trial court dockets: state supreme court holdings (*Wielechowski v. State*, `403 P.3d 1141`), federal district court orders (*Garcia v. Character Technologies*, `No. 6:24-cv-01903`; *U.S. v. RealPage*, `No. 1:24-cv-00710`), and discovery orders (*Sz Huang v. Tesla*, `No. 19CV346663`).

### Tier 2: Audited corporate filings and central-bank statistical releases

1. SEC EDGAR filings: annual Form 10-K (Note 1 useful-life policies, PP&E schedules, income statements), quarterly Form 10-Q (condensed cash flows, debt/lease footnotes, Remaining Performance Obligations), and Form 8-K material definitive agreements.
2. Central-bank and statistical agency series: Federal Reserve *Distributional Financial Accounts*, *Survey of Consumer Finances*, `G.19` Consumer Credit, NY Fed *Household Debt and Credit*, FDIC *Quarterly Banking Profile*, BLS *Major Sector Productivity and Costs*, CBO *Budget and Economic Outlook*, Bank of Japan policy statements, and Statistics Korea vital statistics.
3. Independent reserve assurance attestations: BDO Italia S.p.A. quarterly ISAE 3000 consolidated reserve reports for Tether and Deloitte monthly reserve examinations for Circle USDC, always paired with an explicit CPA scope caveat distinguishing point-in-time reserve attestations from full PCAOB financial audits.

### Tier 3: Grid operators, defense justification books, and treaty organizations

1. Wholesale power and physical resource ledgers: PJM Interconnection Base Residual Auction reports, NERC *Long-Term Reliability Assessments*, Lawrence Berkeley National Laboratory (`LBNL-2001637` and *Queued Up*), International Energy Agency (*Energy and AI* and *Global Critical Minerals Outlook*), and USGS *Mineral Commodity Summaries*.
2. National security and procurement dockets: DoD Comptroller *Weapons Procurement Justification Books*, Congressional Research Service (`CRS R47885`), NIST Federal Information Processing Standards (`FIPS 203`, `204`, `205`), and Joint CISA/NSA/FBI advisories (`AA24-038A`).

### Tier 4: Peer-reviewed empirical benchmarks and named executive disclosures

1. Academic and institutional benchmarks: Econometrica (Fisher 1933), Quarterly Journal of Economics (Gabaix and Koijen 2021), NBER (`WP 20935`), Stanford Digital Economy Lab ADP payroll panels, MIT Media Lab EEG recordings, ACM CHI (`936` workflows), and UIUC CVE agent benchmarks (`arXiv:2404.08144`).
2. Dated executive statements: timestamped public statements by Elon Musk, Sam Altman, Jensen Huang, John Ketchum, or Praveen Neppalli Naga enter the ledger solely to anchor the specific industry claim or spending cap that Layer 2 ledgers then audit.

## 6. Master shoot-week `[LIVE_STAT_SLOT]` registry

All `48` live slots in `fact_ledger.json` map to deterministic agency release calendars. Producers check the cadence group matching the upcoming shoot week.

### Group A: Market-rate and daily/monthly sovereign feeds (check within 24h to 72h of shoot)

| Slot ID | Fact ID | Episodes | Locked baseline | Circuit breaker (`THESIS_BREAK_IF`) |
|---|---|---|---|---|
| `US_GROSS_FEDERAL_DEBT` | `FL-007` | `ep_01, ep_02, ep_30` | `$40.5T` | Gross debt drops below `$36.0T` |
| `BOJ_OVERNIGHT_POLICY_RATE` | `FL-046` | `ep_02` | `1.25%` | BOJ cuts policy rate below `0.25%` |
| `JAPAN_30Y_JGB_YIELD` | `FL-047` | `ep_02` | `~4.0% (3.98%)` | 30Y JGB yield collapses below `2.0%` |
| `TIC_JAPAN_TREASURY_HOLDINGS` | `FL-048` | `ep_02` | `$1,068.3B` | Japan drops below `$700B` or exits top-two |
| `CIRCLE_USDC_CIRCULATION` | `FL-050` | `ep_02` | `~$68.0B` | USDC circulation falls below `$35B` |

### Group B: Quarterly SEC, Federal Reserve, FDIC, and credit ledgers (check within 72h of shoot)

| Slot ID | Fact ID | Episodes | Locked baseline | Circuit breaker (`THESIS_BREAK_IF`) |
|---|---|---|---|---|
| `NYFED_HOUSEHOLD_DEBT_TOTAL` | `FL-009` | `ep_01, ep_17` | `$19.1T / 70.2%` | Total `< $16.0T` or mortgage share `< 60.0%` |
| `BLS_NONFARM_PRODUCTIVITY_SINCE_2017` | `FL-015` | `ep_01` | `+20.6%` | Post-2017 gain revises below `15.0%` |
| `BLS_LABOR_SHARE_POST1947` | `FL-016` | `ep_01` | `53.2%` | Nonfarm labor share rebounds above `58.0%` |
| `HYPERSCALER_ANNUALIZED_CAPEX` | `FL-017` | `ep_01, ep_03` | `$742B / $824B` | Big Five CapEx falls below `$500B` |
| `ALPHABET_FCF_QUARTERS` | `FL-018` | `ep_01, ep_03` | `2 neg. quarters` | Alphabet 4Q FCF `> +$60B` while cutting CapEx |
| `AMAZON_TTM_FCF` | `FL-019` | `ep_01, ep_03` | `-$42.4B` | Amazon TTM FCF `> +$30B` without debt |
| `FED_DFA_EQUITY_CONCENTRATION` | `FL-021` | `ep_01, ep_06` | `92.5% / 1.0%` | Top 10% `< 80.0%` or Bottom 50% `> 5.0%` |
| `TETHER_TBILL_RESERVES` | `FL-049` | `ep_02` | `$132.4B / $191.45B` | Tether US T-bills fall below `$80B` |
| `HYPERSCALER_CAPEX_DEPRECIATION_RATIO` | `FL-053` | `ep_03` | `3.5x ratio` | Ratio compresses below `1.6x` |
| `COREWEAVE_DEBT_AND_LEASES` | `FL-056` | `ep_03` | `$66.2B total` | Total debt + leases drops below `$25.0B` |
| `OPENAI_ORACLE_RPO` | `FL-058` | `ep_03` | `$300B RPO` | Oracle RPO drops below `$120B` |
| `OPENAI_AZURE_RPO` | `FL-059` | `ep_03` | `$250B RPO` | Microsoft AI lab RPO shrinks by `>50%` |
| `FITCH_PRIVATE_CREDIT_DEFAULT_PIK` | `FL-063` | `ep_05` | `6.3% / 88% PIK` | PCDR `< 2.5%` and bad-PIK `< 30%` |
| `ICI_401K_TOTAL_ASSETS` | `FL-065` | `ep_06` | `$10.8T` | 401(k) asset pool drops below `$7.0T` |
| `FDIC_ZERO_YIELD_DEPOSITS` | `FL-072` | `ep_10` | `$4.04T` | Non-interest deposits fall below `$2.0T` |
| `FED_G19_STUDENT_DEBT` | `FL-074` | `ep_11` | `$1.81T` | Student loan debt drops below `$1.3T` |
| `NYFED_COLLEGE_UNDEREMPLOYMENT` | `FL-075` | `ep_11` | `42.5%` | Underemployment drops below `30.0%` |

### Group C: Fiscal-year-end, semi-annual, and annual structural series (check within 72h of shoot)

| Slot ID | Fact ID | Episodes | Locked baseline | Circuit breaker (`THESIS_BREAK_IF`) |
|---|---|---|---|---|
| `US_PAYCHECK_WITHHELD_TAX_SHARE` | `FL-001` | `ep_01` | `67.4%` | Withheld + FICA share `< 55.0%` |
| `MTS_TABLE9_INDIV_PAYROLL_SHARE_FY` | `FL-004` | `ep_01` | `86.4%` | Combined share drops below `80.0%` |
| `MTS_TABLE9_CORP_SHARE_FY` | `FL-006` | `ep_01` | `7.1%` | Corporate share exceeds `13.0%` |
| `CBO_10YR_NET_INTEREST_OUTLAY` | `FL-011` | `ep_01, ep_02, ep_30` | `$2.14T` | 10-year terminal net interest `< $1.5T` |
| `MTS_NET_INTEREST_VS_DEFENSE` | `FL-012` | `ep_01, ep_02` | `$1.05T vs $0.93T` | Net interest `< $900B` or `< Defense` |
| `LLM_EQUIVALENT_TOKEN_DEFLATION` | `FL-034` | `ep_01` | `>99% drop` | Equivalent token prices exceed 2023 |
| `IEA_DATACENTER_TWH_2030` | `FL-039` | `ep_01, ep_08` | `415 -> 945 TWh` | IEA 2030 Base Case `< 600 TWh` |
| `PJM_CAPACITY_AUCTION_CLEARING` | `FL-041` | `ep_01, ep_08` | `$269.92/MW-day` | PJM RTO clearing drops below `$75/MW-day` |
| `STANFORD_ADP_JUNIOR_EMPLOYMENT_DROP` | `FL-061` | `ep_04` | `-16% to -19%` | Ages 22-25 gap narrows within `3.0%` |
| `PRIVATE_CREDIT_SAAS_AUM` | `FL-062` | `ep_05` | `$2.5T / $500B` | Software lending share `< 10%` |
| `FTC_ANNUAL_FRAUD_LOSSES` | `FL-066` | `ep_07` | `$12.5B` | Congress mandates 100% APP bank refund |
| `US_GRID_GAP_TRANSFORMER_QUEUE` | `FL-067` | `ep_08` | `94 GW / 100-160w` | LPT lead times fall below `40 weeks` |
| `VERIZON_DBIR_KEV_PATCH_DAYS` | `FL-070` | `ep_09` | `32 to 43 days` | Median KEV patching `< 48 hours` |
| `NILSON_US_CARD_FEES` | `FL-073` | `ep_10` | `$198.25B` | US card merchant fees `< $120B` |
| `HUMANOID_SUPPLY_CHAIN_BOM` | `FL-078` | `ep_13` | `63% / $16k-$30k` | Non-Asian hardware share `> 55%` |
| `FSB_AUTOMATED_EQUITY_VOLUME` | `FL-079` | `ep_14` | `70% to 80%` | Algorithmic US equity share `< 50%` |
| `TAIWAN_SUB5NM_FOUNDRY_SHARE` | `FL-080` | `ep_15` | `80%-90% / $10T` | Taiwan `<5nm` global share `< 60%` |
| `CA_FAIR_PLAN_EXPOSURE_GROWTH` | `FL-084` | `ep_17` | `+29.1% / $13.4T` | FAIR Plan policies shrink `>15% YoY` |
| `AI_COMPANION_DAILY_MINUTES` | `FL-085` | `ep_18` | `93 to 120 min` | Active daily dwell drops `< 35 min` |
| `FINCEN_ANNUAL_SAR_VOLUME` | `FL-088` | `ep_20` | `4.6M to 4.8M` | SARs `< 2.5M` or `5318(g)(2)` repealed |
| `GULF_SWF_AUM_AND_AIP` | `FL-092` | `ep_23` | `$6.1T / $100B` | Gulf SWF AUM `< $4.5T` or export ban |
| `LBNL_DATACENTER_WATER_GALLONS` | `FL-094` | `ep_25` | `17B -> 33B gal` | Direct cooling water `< 12B gal` |
| `SOUTH_KOREA_TFR` | `FL-096` | `ep_26` | `0.72 TFR` | South Korea TFR climbs `> 1.30` |
| `TELEGEOGRAPHY_SUBSEA_CABLE_SHARE` | `FL-097` | `ep_27` | `550+ / ~75%` | Big Tech subsea share `< 55%` |
| `IMPERVA_BOT_TRAFFIC_SHARE` | `FL-098` | `ep_28` | `53% bot share` | Automated bot requests `< 42%` |
| `SSA_OASI_DEPLETION_AND_CUT` | `FL-101` | `ep_30` | `Q4 2032 / -22%` | Solvency law pushes depletion `> 2050` |

## 7. Worked shoot-week refresh example (Episode 05 sprint)

Suppose production opens on Episode 05 (*Private Credit & SaaS LBOs*) in April 2027, seventy-two hours before A-roll recording:

1. Run `python 02_research_and_data/tools/validate_fact_ledger.py --json` and inspect all entries referencing `ep_05` (`FL-062` and `FL-063`, both carrying `is_live_stat_slot: true`).
2. Download the Q1 2027 Fitch U.S. Private Credit Default Rate report. Suppose Fitch reports the trailing-twelve-month default rate ticked up from `6.3%` to `7.1%`, while PIK and maturity-extension workouts rose from `88%` to `91%`.
3. Check the circuit breaker on `FL-063` (`THESIS_BREAK_IF: Fitch PCDR falls below 2.5% and bad-PIK share drops below 30%`). Both metrics moved further in the direction of the structural thesis, so no Stage 2 Red-Team halt triggers.
4. Update `FL-063` inside `fact_ledger.json`: set `exact_value` to `"7.1% Fitch PCDR / 91% PIK and maturity extensions"`, update `publication_date` to `"2027-04-14"`, update `verification_formula` to `"round(7.1 * 0.91, 2) == 6.46 and 100 - 91 == 9"`, and update `script_anchors` to `["7.1 percent", "91 percent", "PIK"]`.
5. Replace `[LIVE_STAT_SLOT:FITCH_PRIVATE_CREDIT_DEFAULT_PIK]` inside the Episode 05 final script with the spoken words `7.1 percent` and `91 percent`, then execute `python 02_research_and_data/tools/validate_fact_ledger.py --verify-script 04_scripts_and_dossiers/ep_05_.../script.md` and confirm `[PASS]` with exit code `0` before exporting to teleprompter and `reading-room-cinema`.

## 8. Common validator failure modes and remediation

When `validate_fact_ledger.py` returns exit code `1` during a sprint, resolve the reported diagnostic using these exact rules:

1. `Formula evaluated to False` or `Trivial tautology rejected`. Recompute the arithmetic expression from the raw primary table numbers using `round(<numerator> / <denominator> * 100, 1) == <target>` so the left-hand expression derives the locked `exact_value` from underlying components.
2. `duplicate LIVE_STAT_SLOT ID` or missing `THESIS_BREAK_IF:`. Give every rolling metric a distinct upper-snake-case identifier inside `[LIVE_STAT_SLOT:<SLOT_ID>]` and append an explicit numeric or statutory threshold after `THESIS_BREAK_IF:`.
3. `empirical currency/percent claim has no backing fact_id in ledger`. Either locate the primary filing and add a new `FL-XXX` entry with `script_anchors` matching the spoken line, or if the figure is a fictional household character budget item (such as a monthly rent payment), document the exact spoken phrase inside `narrative_persona_allowlists` for that episode.
4. `contains forbidden contrast pattern` or `contains banned AI vocabulary`. Rewrite `claim_summary`, `adversarial_caveat`, or `refresh_instructions` in direct positive prose without dashes, exclamation marks, negative contrast frames, or banned AI words, then re-run `validate_fact_ledger.py` until errors drop to zero.


