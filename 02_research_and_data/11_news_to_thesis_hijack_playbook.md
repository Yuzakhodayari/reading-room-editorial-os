# Deliverable 11: Live news-to-structural-thesis hijack playbook

Document ID: `RR-OS-DIV02-11`
Executable CLI: [`tools/news_to_thesis_radar.mjs`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/tools/news_to_thesis_radar.mjs)
Calibration dataset: [`data/sample_news_events_2027.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/data/sample_news_events_2027.json)
Operational horizon: February 2027 Launch Trio through January 2028 (`30` flagship uploads)

## 1. Riding 2,000 viral shocks without rotting the back catalog

Between February 2027 and January 2028, roughly 2,000 major stories across frontier AI labs, sovereign bond auctions, corporate Form 10-K filings, regional power grids, and banking fraud dockets will dominate financial and tech feeds. Most solo channels handle that volume poorly, and both standard approaches stall before upload twenty.

Reaction channels chase the morning wire. When a frontier model ships on Tuesday, they record a rushed fifteen-minute recap by Wednesday night. Six weeks later, a cheaper checkpoint ships, search volume on the old model name drops ninety percent, and YouTube's Browse recommender stops testing the upload because cold viewers skip expired version numbers in the title.

Pure academic channels err in the opposite direction. They ignore breaking news entirely and publish timeless textbook primers on central-bank reserves or semiconductor lithography. Their archive ages cleanly, yet viewers scrolling Home feeds pass over their thumbnails because nothing on screen connects to the argument dominating their office Slack that afternoon.

*The Reading Room* separates the front door from the permanent corridor. Every flagship upload locks its fifteen-to-twenty-minute investigative spine onto ten-year balance-sheet math (`2027` to `2036`), while keeping a modular forty-five-second `[LIVE_STAT_SLOT]` window open inside the hook (`0:00` to `0:45`) alongside a fast Community and Shorts circuit outside the long-form feed.

Episode 01 (*The Allowance*) proved this exact structure. On October 29, 2026, Elon Musk posted on X that saving cash for the distant future becomes pointless once super-intelligent machines create abundance. A commentary channel would have spent twelve minutes debating Musk's personality. Episode 01 spent two sentences (`14` seconds) quoting that post, told the viewer to try forwarding it to their landlord on the first of the month, and turned immediately to Table 9 of the Monthly Treasury Statement (`86%` individual and payroll tax dependency), Congressional Budget Office net interest (`$2.1 trillion` by `2036`), and `$19.1 trillion` in fixed household debt. The viral post supplied opening velocity. Ten-year fiscal arithmetic supplied permanence.

### Annual 2,000-shock filtering funnel (`2027-02-02` to `2028-01-31`)

Across a full twelve-month run (`30` flagship uploads on a twelve-day cadence), `news_to_thesis_radar.mjs` enforces strict volume discipline so daily news never derails deep primary research:

1. Raw feed intake (`~2,000` viral headlines per year, roughly `5` to `6` per day across X, Bloomberg, Financial Times, Hacker News, and regulatory wires).
2. Ten-second visual pre-screen kills `~1,820` obvious non-starters on sight (celebrity CEO feuds, product waitlists, routine quarterly earnings beats, partisan cable soundbites).
3. Formal CLI triage (`~180` candidates per year, roughly `3` to `4` runs per week through `news_to_thesis_radar.mjs`).
4. `ROUTE_D_REJECT_NOISE` eliminates `~112` candidates scoring below `55/100` before a single research folder opens.
5. `ROUTE_B_SHORT_AND_COMMUNITY_DROP` routes `~36` verified primary-filing events (`~3` per month) into same-day YouTube Community receipt cards paired with `15` gatekept vertical bridges across the year (`07_omnichannel_and_marketing/41_15_native_vertical_scripts.md`).
6. `ROUTE_A_COLD_OPEN_INJECTION` routes `~27` high-alignment receipts (`72` to `85` points) directly into the forty-five-second `[LIVE_STAT_SLOT]` cold open of upcoming flagships (`EP_04` through `EP_30`) during shoot week.
7. `ROUTE_C_BREAKER_SLOT_SWAP` claims `4` to `6` bi-monthly Rapid-Response Breaker Slots (`score >= 86`) reserved for systemic regime shifts.

Over ninety-six percent of breaking noise dies before touching a teleprompter file, while every major 2027 institutional shock feeds channel growth within hours.

## 2. Two-hour rapid-triage workflow (`00:00` to `02:00`)

Whenever a high-velocity headline crosses the desk in 2027, the analyst starts a 120-minute triage clock before editing a dossier or moving a camera session. Weak items exit inside fifteen minutes. Only verified institutional ledgers survive past Minute 45.

| Clock window | Operational gate | Required action and CLI check | Hard exit condition |
| :- | :- | :- | :- |
| `00:00 to 00:15` | Wire strip and CLI score | Strip social commentary, write a factual two-sentence summary, and run `news_to_thesis_radar.mjs`. | Total score below `55` triggers `ROUTE_D_REJECT_NOISE`; close browser tabs immediately. |
| `00:15 to 00:45` | Primary ledger pull | Download the underlying institutional PDF or CSV from EDGAR, Treasury Direct, Federal Reserve releases, FERC/PJM dockets, CFPB filings, or CISA advisories. | Missing primary document with zero release scheduled inside `48` hours forces downgrade to `ROUTE_D`. |
| `00:45 to 01:15` | Three-layer collision lock | Confirm the matched episode (`EP_01` through `EP_30`) connects Layer 1 (AI curve), Layer 2 (balance sheet), and Layer 3 (household stake). | Single-layer stories lacking household or contract transmission cap at `ROUTE_B` or reject. |
| `01:15 to 01:45` | Staleness-immunity scrub | Strip relative calendar words (`today`, `yesterday`, `breaking`, `this morning`) and draft the undated 45-second hook or 24-hour Community card. | Drafts reliant on 48-hour personality drama get rewritten around statutory or contract dates. |
| `01:45 to 02:00` | Slot commit and ledger log | Write the updated `[LIVE_STAT_SLOT]` figure into the dossier, queue the Community card, or open the bi-monthly Breaker sprint. | Unconfirmed figures remain quarantined behind `[NEEDS SOURCE]` outside teleprompter scripts. |

### CLI execution from the repository root

Run single-headline triage during morning wire checks or execute full batch calibration across JSON event queues:

```powershell
# Inspect CLI flags, allowed domains, and deterministic score bands
node 02_research_and_data/tools/news_to_thesis_radar.mjs --help

# Triage a single breaking headline in under five seconds
node 02_research_and_data/tools/news_to_thesis_radar.mjs --domain finance --date-label "May 2027" --headline "NAIC Schedule BA Audit Exposes $68 Billion in Off-Balance-Sheet GPU Lease SPVs Inside State Pension Portfolios" --summary "SEC Form 8-K covenants and NAIC Schedule BA tables reveal private-credit vehicles securitizing neocloud GPU leases inside worker pension balance sheets just as chip depreciation cuts collateral values by 38 percent."

# Run the 12-event 2027 calibration suite (formatted table + briefs or raw JSON)
node 02_research_and_data/tools/news_to_thesis_radar.mjs --batch 02_research_and_data/data/sample_news_events_2027.json
node 02_research_and_data/tools/news_to_thesis_radar.mjs --batch 02_research_and_data/data/sample_news_events_2027.json --json
```

## 3. The 100-point quantitative scoring rubric

`news_to_thesis_radar.mjs` scores every candidate event across five twenty-point dimensions (`0` to `100` total) and subtracts explicit noise penalties whenever ephemeral chatter, benchmark vanity metrics, or backward-looking nostalgia appear in the text.

### Dimension 1: Multi-year structural persistence (`0` to `20` points)

Evaluates whether the underlying constraint still governs institutional decisions in January 2028 and beyond. Events anchored in statutory rules (`12 CFR Part 1005`, Sherman Act civil dockets, 100-percent bonus-depreciation statutes), physical grid queues (84-month high-voltage transformer lead times, five-gigawatt substation permits), or sovereign bond maturities earn `15` to `20` points.

Explicit noise deductions subtract `5` to `8` points per match across Dimensions 1 through 5:
1. Executive social-media feuds, podcast hot-mic clips, and leaked internal group chats (`-8` base penalty).
2. Benchmark leaderboard swaps where a mid-cycle checkpoint tops a rival model by two points on SWE-bench or Chatbot Arena (`-7` base penalty).
3. Waitlist teasers, logo rebrands, merch drops, and unshipped keynote demo videos (`-6` base penalty).
4. Backward-looking post-mortems revisiting 2022 crypto collapses or March 2023 bank runs (`-6` base penalty).
5. Unnamed "people familiar with the matter" leaks lacking a court docket or agency schedule (`-5` base penalty).

### Dimension 2: Balance-sheet and contract transmission (`0` to `20` points)

Checks whether the shock moves real money across binding legal contracts. High-scoring headlines (`15` to `20` points) cite explicit dollar volumes, basis-point bond auction tails, megawatt-day capacity clearing prices, GAAP useful-life revisions, off-balance-sheet special-purpose vehicles, cyber-insurance exclusion riders, or residential escrow hikes. Pure sentiment pieces with zero accounting line stall below `8` points.

### Dimension 3: Primary institutional filing availability within 48 hours (`0` to `20` points)

Enforces Covenant 3 of the Channel Bible (`01_channel_bible_and_manifesto.md`): every structural claim requires a primary document rendered inside `reading-room-cinema`. Events backed within forty-eight hours by US Treasury MTS Table 9, TIC foreign-holder tables, SEC Form 10-K/10-Q/8-K filings, Federal Reserve H.4.1 or Z.1 schedules, CBO baselines, FERC/PJM auction reports, CFPB supervisory dockets, NAIC Schedule BA tables, or CISA Known Exploited Vulnerabilities advisories earn `15` to `20` points.

### Dimension 4: Household wallet, career, and autonomy stake (`0` to `20` points)

Measures direct incidence on an ordinary viewer's Friday W-2 paycheck, thirty-year fixed mortgage, passive 401(k) target-date balance, monthly residential electric bill, checking-account wire safety, entry-level career ladder, or personal digital autonomy. Macro abstractions that never reach a household ledger cap below `10` points.

### Dimension 5: Collision alignment with the 30-episode master slate (`0` to `20` points)

Measures keyword, domain, and three-layer causal fit against the thirty scheduled flagships (`EP_01` on `2027-02-02` through `EP_30` on `2028-01-16`). Top scores (`17` to `20` points) require activating all three channel gravity layers simultaneously while matching a specific `[LIVE_STAT_SLOT]` in the slate registry.

## 4. Deterministic routing verdicts and Breaker Slot governance

Summing all five dimensions yields a deterministic routing verdict. Every headline receives one unambiguous operational assignment.

| Routing verdict | Deterministic threshold | Turnaround window | Surface deployed | Editorial boundary |
| :- | :- | :- | :- | :- |
| `ROUTE_C_BREAKER_SLOT_SWAP` | `score >= 86` | `96 hours` (full 6-stage pipeline) | Bi-monthly Rapid-Response Flagship Slot (max `1` per `60` days) | Reserved for reserve-level systemic shifts (Fed bank-capital carve-outs, statutory tax shocks, multi-state grid orders). Engineered for 2028+ durability. |
| `ROUTE_A_COLD_OPEN_INJECTION` | `72 <= score <= 85` (unshot `EP_04..30`, filing `>= 13`, slate fit `>= 14`) | `45 minutes` during shoot-week prep | `0:00 to 0:45` `[LIVE_STAT_SLOT]` hook of matching upcoming flagship | Updates the opening two paragraphs with a dated primary receipt while leaving Acts I through IV (`15+` minutes) untouched. |
| `ROUTE_B_SHORT_AND_COMMUNITY_DROP` | `55 <= score <= 71` (or `72..85` matching pre-recorded `EP_01..03`) | `90 minutes` same-day publish | YouTube Community primary-receipt card (`24h`) + `50s` vertical script | Captures live curiosity without touching the 12-day flagship schedule; links vertical viewers strictly via Related Video to the matched flagship. |
| `ROUTE_D_REJECT_NOISE` | `score < 55` | `0 minutes` (immediate stand-down) | None | Zero long-form, Shorts, or Community output. Protects returning-subscriber Browse CTR from hype dilution. |

### Bi-monthly Breaker Slot cap (`ROUTE_C`)

Across thirty uploads over twelve months, at most six production slots (`1` per sixty-day window) can be claimed by `ROUTE_C_BREAKER_SLOT_SWAP`. When a `90/100` event such as an emergency Federal Reserve bank-capital carve-out arrives in March 2027, it swaps cleanly with the nearest unshot sovereign-finance dossier in that two-month window. The Breaker episode inherits that dossier's longitudinal household character, primary archival stress tests, and Stage 2 red-team audit so speed never degrades rigor. If a second `86+` shock fires inside the same sixty-day window, the radar steps it down to `ROUTE_A_COLD_OPEN_INJECTION` on the next aligned episode.

## 5. Architecture of `[LIVE_STAT_SLOT]` cold-open bridges (`ROUTE_A`)

Dossiers `ep_04.md` through `ep_30.md` are drafted weeks before shoot week. Hard-coding volatile spot numbers into early scripts creates needless rewrites when a Monthly Treasury Statement or SEC Form 10-Q drops two days before recording. Isolating spot figures inside a standardized `[LIVE_STAT_SLOT]` block at the top of the cold open keeps every script fresh on upload morning and durable twelve months later.

### Schema lock between dossier and `reading-room-cinema`

Every `[LIVE_STAT_SLOT]` token inside a research dossier maps directly to one replaceable `#FAF8F3` milk-canvas receipt card or `navy-glass` callout in `reading-room-cinema`:

```yaml
live_stat_slot:
  slot_id: "NAIC_SEC_GPU_SPV_SPREAD"
  target_episode: "ep_06"
  runtime_window: "0:00 to 0:45"
  fallback_baseline: "Off-balance-sheet GPU lease SPVs pledged to life insurers and private credit funds"
  injected_2027_receipt: "May 2027 NAIC Schedule BA audit exposing $68B in neocloud GPU lease SPVs across state pension and annuity portfolios"
  primary_table: "SEC Form 8-K Debt Covenants and NAIC Life Insurer Schedule BA"
  cinema_visual_cue: "milk-canvas crop of Schedule BA collateral table with rgba(255, 213, 79, 0.38) marker sweep"
  downstream_lock: "Sentence 6 joins pre-locked Act I script with zero edit to Acts I through IV"
```

### Four rules of the 45-second undated bridge

At *The Reading Room*'s locked cadence of `150` words per minute, forty-five seconds equals `110` to `115` spoken words (`5` to `6` sentences):

1. Stamp the receipt by explicit calendar month and year (`In June 2027, enterprise token pricing...`) and strip relative calendar words (`yesterday`, `this morning`, `last week`). Viewers watching in late 2028 hear a concrete historical date, matching how Episode 01 cites October 29, 2026 and June 2016 without aging.
2. Put the primary institutional table on screen before `0:20`. Collide the viral headline with the exact ledger line that breaks industry consensus.
3. Name the eighteen-turning-twenty-eight generational clock or the household contract before `0:38`. Tie institutional balance sheets directly to a fixed mortgage, pension annuity, W-2 paycheck, or electric bill.
4. Join the pre-tested thesis spine cleanly at `0:45` so zero downstream visual cues inside `reading-room-cinema` shift timing.

### Side-by-side staleness-immunity rewrite (`EVT_2027_05` -> `EP_10`)

Compare how a reaction channel covers a viral June 2027 coding-agent release against *The Reading Room*'s staleness-immune `ROUTE_A` cold open for `EP_10` (*The Entry-Level Ladder Collapse*):

- Perishable news opener (decays within `30` days):
  `Breaking news this morning: a massive new coding agent just launched today and slashed API token prices by 78 percent, shocking tech Twitter and raising huge questions about where software jobs are headed next year.`
- Locked Reading Room `ROUTE_A` bridge (durable past `January 2028`):
  `In June 2027, enterprise token pricing for autonomous repository agents dropped another seventy-eight percent in a single release cycle. Open the New York Federal Reserve's graduate payroll ledger alongside corporate Form 10-Q headcount disclosures from that same quarter, and you see where the savings landed. Entry-level tech and audit hiring fell thirty-four percent while income-driven student loan delinquencies hit a multi-year high. Software capabilities reprice every six months, while a twenty-three-year-old graduate's $38,000 federal loan contract assumes a junior W-2 ladder still exists.`

Even after three newer coding models ship in late 2027, the June 2027 release remains an audited empirical receipt proving the widening speed mismatch between six-month software deflation and ten-year student loan contracts.

## 6. Executing `ROUTE_B` Community cards and 50-second vertical bridges

When an event scores between `55` and `71` (or matches an already-published flagship like Launch Trio `EP_01` through `EP_03`), `ROUTE_B_SHORT_AND_COMMUNITY_DROP` converts the news cycle into back-catalog views inside ninety minutes:

1. Minute `0` to `30`: Crop the exact table row from the newly released filing (for example, Footnote 4 of a March 2027 Form 10-Q reversing server useful-life schedules in `EVT_2027_08`) onto a `#FAF8F3` archival card with a single `#A3402E` brick-red callout box.
2. Minute `30` to `50`: Publish the YouTube Community image post with a three-sentence deadpan note pointing returning subscribers straight to `EP_03` (*The Depreciation Trick*). Community posts reach warm subscribers on mobile Home feeds within hours and validate that *The Reading Room*'s models anticipated the filing months earlier.
3. Minute `50` to `90`: Record a tight 50-second (`125`-word) vertical desk read for Shorts, Reels, and TikTok when the event aligns with one of the fifteen scheduled vertical bridge slots (`0:00-0:08` cold filing number, `0:08-0:36` single balance-sheet transmission line, `0:36-0:50` verbal handoff to the Related Video link). Zero broad meme hooks appear, preventing low-intent Short viewers from diluting long-form Browse CTR.

### Worked `ROUTE_B` asset pair (`EVT_2027_03` -> `EP_04`)

When `EVT_2027_03` scores `70/100` on an April 2027 Consumer Financial Protection Bureau supervisory filing documenting `$4.9 billion` in unreimbursed voice-clone wire losses, the analyst ships both companion assets inside ninety minutes without altering the twelve-day long-form calendar:

```text
COMMUNITY PRIMARY-RECEIPT CARD (PUBLISH WITHIN 50 MINUTES)
Image attachment: #FAF8F3 crop of CFPB Electronic Fund Transfers Supervisory Table 4
with rgba(255, 213, 79, 0.38) sweep over the 89% unrecovered household loss row.

Post copy:
In April 2027, CFPB supervisory tables confirmed American depositors ate 89 percent of
$4.9 billion in instant-wire losses triggered by real-time voice-cloning calls. Under
12 CFR Part 1005 (Regulation E), banks reimburse unauthorized account hacks, while
families absorb the loss the second a cloned voice tricks them into typing their own
wire code. Full statutory audit and hardware-key checking protocol sit inside Episode 04.
```

```text
50-SECOND NATIVE VERTICAL SCRIPT (121 WORDS AT 150 WPM, RELATED VIDEO -> EP_04)
[0:00 - 0:09] If a hacker breaks into your bank login tonight, federal law usually
forces the bank to give your money back. If an AI voice clone of your kid tricks you
into sending the wire yourself, you lose almost everything.
[0:09 - 0:26] Open the April 2027 CFPB supervisory filing on instant payment rails.
Households lost four-point-nine billion dollars to authorized push scams, and banks
refused reimbursement on eighty-nine percent of those dollars.
[0:26 - 0:41] That gap sits inside Regulation E of the Electronic Fund Transfers Act.
Typing your own passcode turns a felony impersonation into an authorized transfer on
your bank's balance sheet.
[0:41 - 0:50] Tap the linked Episode 04 briefing below to lock high-balance checking
behind dual-signer delays before you wire a cent.
```

### 96-hour `ROUTE_C` Breaker Slot sprint clock (`EVT_2027_01`)

When a reserve-level event scores `86` or higher (`EVT_2027_01` at `90/100`), the solo production calendar switches from its twelve-day rhythm into a disciplined 96-hour sprint that still clears all six pipeline gates:

| Breaker sprint window | Pipeline stage | Concrete deliverable locked | Quality gate enforced |
| :- | :- | :- | :- |
| `Hour 00 to Hour 06` | Stage 1: Primary ledger lock | Download Federal Reserve H.4.1 schedules, 12 CFR interim rule text, Treasury auction tail data, and CBO net interest tables. | Minimum three primary institutional PDFs saved locally. |
| `Hour 06 to Hour 18` | Stage 2: Red-team stress test | Run Macroeconomist, CPA, and Banking Lawyer critiques (`12_adversarial_red_team_protocol.md`) to steelman Fed liquidity defense before critiquing real-yield repression. | All counterarguments baked directly into Act II prose. |
| `Hour 18 to Hour 36` | Stages 3 and 4: Outline and draft | Write `3,000+` word teleprompter script around the displaced sovereign-finance dossier's household saver character and three unspoiled escape hatches. | `retention_linter.mjs` verifies decile re-hooks (`<= 0.18` gap). |
| `Hour 36 to Hour 48` | Stage 5 and 6: Voice and anti-AI gate | Read aloud at `150` wpm, calibrate spoken contractions, strip relative dates, and pass `anti_ai_script_gate.mjs` (`score = 0`). | Zero em dashes, zero exclamation points, `15.5-17.5` mean sentence length. |
| `Hour 48 to Hour 72` | Studio A-roll and cinema build | Shoot shirt-and-tie A-roll (`06_camera_and_voice/`), cut retakes via `transcript_edl_cleaner.mjs`, and export visual cues to `reading-room-cinema`. | Three title/thumbnail pairs verified via `package_lint.py`. |
| `Hour 72 to Hour 96` | Final render, QA, and upload | Render 4K timeline, verify chapters and upload metadata (`50_upload_metadata_and_chapters_pack.md`), and publish into Series 01 Playlist. | 24-hour CTR rescue pair staged in YouTube Studio before go-live. |

## 7. Series-level wire feeds and `[LIVE_STAT_SLOT]` lookup matrix

To keep daily monitoring under twenty minutes each morning, monitor only primary institutional release calendars mapped to the four Official Series Playlists:

| Official Series Playlist | Primary wire calendars (`<= 20 min/day`) | Core `[LIVE_STAT_SLOT]` families | Thesis-break audit trigger |
| :- | :- | :- | :- |
| Series 01: `AI Economy, National Debt & Your Money` | Fiscal Data MTS (monthly, 8th business day), CBO Outlook, Treasury auction results, NY Fed & BLS labor tables | `MTS_TABLE9_PAYROLL_SHARE_FY`, `TIC_FOREIGN_OFFICIAL_SHARE`, `NYFED_RECENT_GRAD_UNEMPLOYMENT_GAP`, `SSA_OASI_DEPLETION_YEAR_PAYROLL` | Re-audit tax plumbing if corporate receipts exceed `13.0%` of federal cash for two consecutive quarters. |
| Series 02: `AI Bubble, Corporate Accounting & Wall Street` | SEC EDGAR Form 10-K/10-Q/8-K feeds for top 10 cloud/chip issuers, NAIC Schedule BA updates, Vanguard 401(k) reports | `SEC_10K_SERVER_USEFUL_LIFE_FCF`, `NAIC_SEC_GPU_SPV_SPREAD`, `SEC_SAAS_NET_RETENTION_SEAT_COUNT`, `SP500_TOP7_WEIGHT_CAPEX_RATIO` | Re-audit capex thesis if aggregate hyperscaler free cash flow rebounds above `+$180B` alongside flat server capex. |
| Series 03: `AI Power Grid Crisis, Chip Wars & Geopolitics` | PJM/ERCOT capacity auctions, FERC eLibrary orders, DOE Grid Deployment reports, Commerce BIS export registers | `PJM_ERCOT_CAPACITY_MW_DAY`, `DOE_GDO_TRANSFORMER_LEAD_MONTHS`, `COMMERCE_CHIPS_LEADING_NODE_SHARE`, `CFIUS_SWF_COMPUTE_CAPITAL_COMMITS` | Re-audit grid timeline if large power transformer lead times fall below `24` months nationwide. |
| Series 04: `AI Cybersecurity, Scams, Privacy & Tech Policy` | CISA KEV catalog, CFPB enforcement dockets, FinCEN advisories, DOJ Antitrust & National Security filings | `CFPB_REG_E_APP_FRAUD_LOSS`, `CISA_KEV_EXPLOIT_VELOCITY_HOURS`, `FED_SYNTHETIC_ID_LOSS_BILLIONS`, `DOJ_ALGORITHMIC_PRICING_DOCKET_COUNT` | Re-audit banking defense if Congress amends `12 CFR 1005` to mandate bank reimbursement on authorized push fraud. |

## 8. Calibration audit across the 12-event 2027 test suite

Running `node 02_research_and_data/tools/news_to_thesis_radar.mjs --batch 02_research_and_data/data/sample_news_events_2027.json` produces deterministic scores across twelve representative 2027 shocks (`mean_score = 58.00 / 100`, `2` `ROUTE_C`, `3` `ROUTE_A`, `4` `ROUTE_B`, `3` `ROUTE_D`):

| Event ID | Domain | Persist | Ledger | Filing | Wallet | Slate | Total | Deterministic verdict | Target ep |
| :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
| `EVT_2027_01` | `macro` | `20` | `20` | `20` | `12` | `18` | `90/100` | `ROUTE_C_BREAKER_SLOT_SWAP` | `EP_02` |
| `EVT_2027_06` | `macro` | `19` | `20` | `17` | `12` | `20` | `88/100` | `ROUTE_C_BREAKER_SLOT_SWAP` | `EP_14` |
| `EVT_2027_02` | `geopolitics` | `20` | `12` | `20` | `12` | `20` | `84/100` | `ROUTE_A_COLD_OPEN_INJECTION` | `EP_05` |
| `EVT_2027_04` | `finance` | `15` | `18` | `17` | `14` | `20` | `84/100` | `ROUTE_A_COLD_OPEN_INJECTION` | `EP_06` |
| `EVT_2027_05` | `ai` | `12` | `12` | `16` | `19` | `20` | `79/100` | `ROUTE_A_COLD_OPEN_INJECTION` | `EP_10` |
| `EVT_2027_03` | `cyber` | `12` | `11` | `17` | `12` | `18` | `70/100` | `ROUTE_B_SHORT_AND_COMMUNITY_DROP` | `EP_04` |
| `EVT_2027_09` | `policy` | `8` | `8` | `17` | `12` | `18` | `63/100` | `ROUTE_B_SHORT_AND_COMMUNITY_DROP` | `EP_20` |
| `EVT_2027_07` | `finance` | `8` | `11` | `10` | `12` | `20` | `61/100` | `ROUTE_B_SHORT_AND_COMMUNITY_DROP` | `EP_16` |
| `EVT_2027_08` | `finance` | `11` | `11` | `12` | `4` | `18` | `56/100` | `ROUTE_B_SHORT_AND_COMMUNITY_DROP` | `EP_03` |
| `EVT_2027_12` | `finance` | `0` | `1` | `0` | `0` | `9` | `10/100` | `ROUTE_D_REJECT_NOISE` | `EP_03` |
| `EVT_2027_11` | `ai` | `0` | `0` | `0` | `0` | `6` | `6/100` | `ROUTE_D_REJECT_NOISE` | `EP_10` |
| `EVT_2027_10` | `ai` | `0` | `0` | `0` | `0` | `5` | `5/100` | `ROUTE_D_REJECT_NOISE` | `EP_12` |

### Why intraday flash crashes (`EVT_2027_07`) land in `ROUTE_B`

Look at `EVT_2027_07` (`61/100`), where an algorithmic capex selloff triggers a `7.4%` intraday S&P 500 flash crash across the top seven AI issuers. Market-panic channels scrap their week to upload an emergency crash video, then look foolish forty-eight hours later when index futures recover half the drop.

The radar blocks that mistake mathematically. Because a single-day equity swing scores `8/20` on multi-year persistence, it cannot claim a Breaker Slot or rewrite a flagship script. Because SEC market-halt filings and Federal Reserve equity-concentration tables prove how `36%` index weight hits passive 401(k) target-date savers (`20/20` on Slate Collision with `EP_16`), `ROUTE_B` turns afternoon volatility into a calm 24-hour Community primary-receipt post routing traffic straight into `EP_16` (*401(k) Concentration Risk*).

### Why benchmark flips and leaked chats (`EVT_2027_10` to `EVT_2027_12`) collapse below `15/100`

`EVT_2027_10` (`5/100`, a 1.8-point Chatbot Arena and SWE-bench lead paired with an X feud), `EVT_2027_11` (`6/100`, leaked co-founder group-chat screenshots), and `EVT_2027_12` (`10/100`, a 2022 FTX and 2023 Silicon Valley Bank retrospective podcast clip) trigger automatic `-6` to `-8` noise deductions while scoring `0/20` on primary institutional filings. Rejecting all three saves thirty-plus production hours a month and trains viewers that whenever *The Reading Room* posts, real money or statutory law actually moved.

## 9. Seven-gate pre-publish staleness-immunity checklist

Verify all seven binary checks before publishing any asset routed through `news_to_thesis_radar.mjs`:

1. Zero relative calendar words (`today`, `yesterday`, `this morning`, `last night`, `this week`, `breaking`, `just announced`) appear in narration, titles, Community text, or thumbnails; every spot event carries an explicit month and year (`May 2027`).
2. Zero anonymous forum screenshots, unnamed press leaks, or unverified social claims enter the brief; the primary institutional filing sits downloaded in local research storage cited to exact table and line.
3. Every `ROUTE_A` cold-open bridge finishes at or before `0:45` (`<= 115` spoken words) and joins Sentence 6 of the dossier without modifying Acts I through IV.
4. Every `ROUTE_B` vertical script avoids meme bait and connects exclusively via YouTube Studio's Related Video link to its matched flagship episode (`07_omnichannel_and_marketing/42_short_to_long_bridge_rules.md`).
5. Every `ROUTE_C` Breaker Slot confirms zero prior Breaker episode published within the preceding sixty calendar days and verifies all five rubric dimensions score `12/20` or higher.
6. All prose passes Stage 6 anti-AI and spoken-cadence locks (`0` em dashes, `0` exclamation marks, `0` spoken semicolons, `0` negative-contrast crutches, `0` banned AI words, natural contractions).
7. The target episode's `[LIVE_STAT_SLOT]` entry and `02_research_and_data/data/fact_ledger.json` citation record are updated before camera roll.
