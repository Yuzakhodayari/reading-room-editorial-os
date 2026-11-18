# 06. Zero-to-100K Subscriber Cohort Simulation Report (`2027-02-02` to `2028-01-31`)

**Deliverable ID:** Division 1, Gate #06  
**Executable Simulator:** [`models/growth_simulation.py`](file:///d:/Youtube%20channel/reading-room-editorial-os/01_identity_and_strategy/models/growth_simulation.py)  
**Exported Monte Carlo Dataset:** [`models/cohort_projection_jan2028.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/01_identity_and_strategy/models/cohort_projection_jan2028.json) (`500` seeded runs, `seed = 42`)

## 1. Executive Horizon Summary (`30` Flagship Uploads, `12-Day` Cadence)

Linear channel spreadsheets assume every upload earns `3,333` subscribers on schedule. Real long-form documentary channels compound through cold-start friction, Pareto outlier jumps, Evergreen Search tails, and Series Playlist binge bridges that pull new viewers backward into older investigations.

Running `models/growth_simulation.py` across `500` seeded Monte Carlo cohorts models *The Reading Room* from Launch Trio Episode 01 on **`2027-02-02`** through Episode 30 on **`2028-01-16`**, closing the evaluation window on **`2028-01-31`** (`363` calendar days).

| Horizon Metric (`2028-01-31`) | `P05` | `P10` (Bear) | `P25` | `P50` (Median) | `P75` | `P90` (Bull) | Mean (`StDev`) |
| :- | :- | :- | :- | :- | :- | :- | :- |
| **Net Subscribers** | `81,866` | **`90,763`** | `107,646` | **`136,821`** | `186,050` | **`223,795`** | `150,201` (`56,499`) |
| **Cumulative Views** | `5,233,120` | **`5,837,400`** | `6,866,155` | **`8,681,770`** | `11,704,670` | **`14,196,070`** | `9,487,311` (`3,500,118`) |
| **Total Impressions** | `68.49M` | **`76.13M`** | `88.66M` | **`112.09M`** | `146.74M` | **`178.54M`** | `120.90M` (`42.74M`) |
| **Public Watch Hours** | `1,181,983` | **`1,320,876`** | `1,555,504` | **`1,994,250`** | `2,694,322` | **`3,263,624`** | `2,182,534` (`827,050`) |
| **Pure AdSense Revenue** | `$134,786.50` | **`$148,420.36`** | `$178,022.04` | **`$227,135.91`** | `$303,949.28` | **`$373,051.03`** | `$248,617.46` (`$94,639.81`) |
| **Blended Monetized RPM** | `$25.38` | **`$25.62`** | `$26.15` | **`$26.69`** | `$27.22` | **`$27.70`** | `$26.69` (`$0.80`) |
| **Mean Browse CTR** | `5.64%` | **`5.69%`** | `5.78%` | **`5.90%`** | `6.02%` | **`6.13%`** | `5.91%` (`0.18%`) |
| **Mean Search CTR** | `11.97%` | **`12.04%`** | `12.14%` | **`12.25%`** | `12.34%` | **`12.44%`** | `12.24%` (`0.16%`) |
| **Mean AVD Retention** | `48.92%` | **`49.05%`** | `49.32%` | **`49.60%`** | `49.93%` | **`50.20%`** | `49.62%` (`0.45%`) |
| **Net Sub Conversion** | `1.71%` | **`1.71%`** | `1.72%` | **`1.73%`** | `1.74%` | **`1.75%`** | `1.73%` (`0.01%`) |
| **Terminal Session Depth** | `3.15` | **`3.18`** | `3.25` | **`3.32`** | `3.41` | **`3.45`** | `3.32` (`0.10`) |

### Key Milestone Arrival Probabilities
* **Probability of Passing `100,000` Subscribers by `2028-01-31`:** **`82.20%`** across all `500` runs.
* **Median (`P50`) `100,000` Subscriber Crossing:** Cleared between **Episode 25 and Episode 26** (`2027-11-29` in the representative median cohort), nine weeks ahead of the January 2028 deadline.
* **Bull (`P90`) `100,000` Subscriber Crossing:** Cleared at **Episode 19** (`2027-09-06`), driven by early Layer-4 Breakout Outliers in Q2 and Q3 2027.
* **Bear (`P10`) Downside Trajectory:** Reaches **`90,763` subscribers** on `2028-01-31` when Layer-4 breakouts under-index (`2` to `3` breakouts across `30` uploads). At its terminal velocity of `+6,602` net subscribers per twelve-day epoch (`84,161` at Episode 29 to `90,763` at Episode 30), the `P10` bear cohort clears `100,000` subscribers by **mid-February 2028** (`Episode 32`) on existing catalog momentum alone.
* **YouTube Partner Program (`YPP`) Monetization Gate (`1,000` Subscribers + `4,000` Watch Hours):** Cleared at median **Episode `3.0`** (`mean = 2.4`, `P90 = 3.0`), turning AdSense active immediately after the pre-recorded February 2027 Launch Trio.

## 2. Structural Cohort Equations (`growth_simulation.py`)

Each Monte Carlo trajectory steps chronologically across thirty `12-day` upload epochs (`k = 0..29`) plus Episode 30's fifteen-day January tail:

1. **Cold-Start Recommender Exploration Ramp:** On Upload 01 (`0` subscribers, zero watch-history cluster), YouTube restricts Browse exploration until viewer overlap with adjacent documentary channels (*AI In Context*, *Max Fisher*, *Patrick Boyle*, *How Money Works*, *Maxinomics*, *Art of the Problem*) stabilizes:
   $$\text{ColdStartRamp}(k) = 0.16 + 0.84 \cdot \left(1 - e^{-k / 5.5}\right)$$
   Episode 01 opens at a realistic median of `21,353` views (`338` net subscribers) during its first twelve days before compounding across the remaining twenty-nine epochs.
2. **Four-Layer YouTube Impression Test Cascade:** Every upload draws surface CTRs (`Browse` bounded inside `4.5%` to `8.5%`; `Search` inside `10.0%` to `14.0%`) and Average Percentage Viewed (`AVD` inside `45.0%` to `56.0%` across `20.5` to `35.0` minute spoken runtimes, yielding `10.5` to `18.2` minutes of watch time per view). Composite watch minutes per Browse impression (`W = CTR_browse * Duration * AVD`) gates algorithmic promotion:
   * **Layer 1 (`Seed Cohort`, `85K` to `195K` base pool scaled by ramp):** Active returning subscribers plus external receipt spark.
   * **Layer 2 (`Adjacent Creator Lookalikes`, `210K` to `460K` base pool):** Unlocked when `CTR_browse >= 4.7%` and `AVD >= 45.8%`.
   * **Layer 3 (`Broad Macro, Finance & AI Desk`, `680K` to `1.42M` base pool):** Unlocked when `CTR_browse >= 5.3%`, `AVD >= 48.2%`, and `W >= 0.62` watch minutes per impression.
   * **Layer 4 (`Cross-Platform Breakout Wave`, `2.40M` to `3.85M` x Pareto tail `[1.0, 4.6]`):** Triggered on `breakout_outlier` draws clearing `CTR_browse >= 6.0%`, `AVD >= 50.2%`, and `W >= 0.74` watch minutes per impression.
3. **24-Hour Post-Publish CTR Rescue Floor:** Whenever an upload's initial Browse package opens below `4.90%` CTR, swapping to pre-vetted Backup Pair B or C from the 90-pair packaging vault recovers `+0.45%` to `+0.95%` Browse CTR across remaining impressions.
4. **Returning-Subscriber Velocity Lift:** Existing subscribers `S_k` generate high-retention (`36%` to `48%` active home/notification reach) views within the first `48` hours, multiplying algorithmic pool depth via `VelocityLift(S_k) = 1.0 + 0.36 * ln(1 + S_k / 15,000)`.
5. **Concave Series Playlist Session-Continuation Bridge (`1.20` to `3.32+` Views per Start):** As the interconnected structural slate expands from `1` video to `30` videos linked by explicit `0.98` to `1.00` verbal next-video bridges (`R27`), session depth follows:
   $$\text{SessionMultiplier}(n) = 1.20 + \left(M_{\max} - 1.20\right) \cdot \left(\frac{n - 1}{29}\right)^{0.76}, \quad M_{\max} \sim \mathcal{N}(3.32, 0.11^2)$$
   Incremental binge clicks (`~11.5%` end-screen and playlist CTR) route directly into already-published thematic neighbors (`1.45x` same-domain weight) and Launch Trio anchors (`1.30x` weight).
6. **Non-Subscribed View-to-Subscriber Conversion (`1.40%` to `2.10%`):** Returning-subscriber views add watch hours and AdSense revenue without double-counting as new subscribers. Non-subscribed views convert strictly inside `[1.40%, 2.10%]`, rising with `AVD` retention and multi-video session depth while applying `-0.09%` cold-audience dilution on massive Layer-4 viral waves.

## 3. Traffic Impression Pool Breakdown and Shorts Gatekeeping

| Traffic Pool | `P50` Impressions | `P50` Views | Impression Share | View Share | Effective CTR | Role in Growth Architecture |
| :- | :- | :- | :- | :- | :- | :- |
| **Suggested + Series Playlists** | `43,795,916` | `3,752,538` | `40.10%` | **`44.27%`** | `8.66%` | Combines adjacent-channel Up Next rails (`4.4%` to `7.6%` CTR) with high-intent internal Series Playlist and end-screen continuation (`11.5%` CTR). |
| **Browse Features (Home)** | `55,185,512` | `3,547,922` | `49.60%` | **`41.35%`** | `6.54%` | Primary top-of-funnel discovery engine driven by Layer 3 and Layer 4 cascade breakouts. |
| **Evergreen YouTube Search** | `9,855,471` | `1,203,671` | `8.13%` | **`12.69%`** | `12.25%` | Compounds across every 12-day epoch on staleness-immune debt, AI capex, accounting, and grid queries (`10%` to `14%` CTR). |
| **External Receipt Seeding** | `1,116,272` | `120,492` | `0.93%` | **`1.28%`** | `10.80%` | Reddit, Hacker News, X/Threads primary-filing threads, and newsletter dossiers supplying cold-start Layer-1 velocity on Videos 01 through 08. |
| **Gatekept Vertical Bridges** | `1,503,201` | `39,630` | `1.24%` | **`0.42%`** | `2.65%` | Fifteen thesis-locked vertical clips (`0.5` per flagship upload) routing strictly via Related Video links; zero broad meme bait protects long-form Browse CTR from dead-subscriber dilution. |

## 4. Power-Law Outlier Tier Economics and Launch Trio Back-Fill

| Performance Tier | Mean Episodes (`Share`) | `P50` Tier Views | Share of Channel Views | Mean Views / Episode | Strategic Function |
| :- | :- | :- | :- | :- | :- |
| **Tier 1: Breakout Outliers** | `5.42` (`18.07%`) | `3,561,104` | **`44.60%`** | `780,394` | Clears Layer 4 (`600K` to `1.8M+` views); creates step-function subscriber leaps and floods Series Playlists with first-time binge viewers. |
| **Tier 2: Mid-Performers** | `14.94` (`49.79%`) | `3,391,965` | **`37.01%`** | `235,086` | Clears Layer 2 and Layer 3; sustains predictable 12-day subscriber cadence and mid-year sponsor rate-card floors. |
| **Tier 3: Horizon Library** | `9.64` (`32.14%`) | `1,651,773` | **`18.39%`** | `180,955` | Modest launch-week velocity (`20K` to `65K` initial views) that compounds steadily via `12.25%` CTR Search and downstream playlist bridges. |

**Empirical Proof of Back-Catalog Compounding (`ep_01` in the Representative Median Run):** In `cohort_projection_jan2028.json`, Episode 01 (`STR-GEN-EXPLAINER`, `24.5 min`) draws a conservative `horizon_library` Layer-1 start (`4.99%` Browse CTR, `45.0%` AVD), earning roughly `21K` views in its opening twelve-day window. Across the next twenty-nine uploads, downstream Series Playlist bridges deliver **`91,907` additional continuation views** (`53.4%` of its **`172,081` cumulative views** by January 2028) plus continuous `12.68%` CTR Search traffic. Early craftsmanship on Videos 01 through 05 pays dividends nine months later when subscribers pass `100,000`.

## 5. Complete 30-Episode Cohort Trajectory (`2027-02-02` to `2028-01-31`)

| Ep | Publish Date | Strategy Preset | Domain Vertical | Sess. Mult | Subs `P10` | Subs `P50` | Subs `P90` | Views `P50` | Watch Hrs `P50` | AdSense `P50` |
| :- | :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
| `01` | `2027-02-02` | `STR-GEN-EXPLAINER` | `sovereign_finance` | `1.20x` | `191` | `338` | `3,653` | `21,353` | `4,351` | `$0.00` |
| `02` | `2027-02-14` | `STR-FISHER-ARTIFACT` | `sovereign_finance` | `1.36x` | `556` | `999` | `6,223` | `64,670` | `14,060` | `$0.00` |
| `03` | `2027-02-26` | `STR-BOYLE-CHAPTERED` | `ai_economics` | `1.48x` | `1,177` | `2,150` | `9,008` | `139,958` | `30,785` | `$0.00` |
| `04` | `2027-03-10` | `STR-HMW-PRIMER` | `ai_economics` | `1.58x` | `1,966` | `3,511` | `11,134` | `229,265` | `49,578` | `$2,693.93` |
| `05` | `2027-03-22` | `STR-GEN-EXPLAINER` | `sovereign_finance` | `1.67x` | `2,810` | `6,044` | `14,101` | `395,164` | `86,268` | `$5,204.72` |
| `06` | `2027-04-03` | `STR-MAX-ESSAY` | `ai_economics` | `1.76x` | `3,938` | `8,201` | `17,910` | `535,581` | `113,554` | `$8,582.78` |
| `07` | `2027-04-15` | `STR-AIC-SPECULATIVE` | `cyber_geopolitics` | `1.84x` | `5,285` | `10,860` | `23,204` | `707,913` | `156,162` | `$13,037.51` |
| `08` | `2027-04-27` | `STR-MAX-ESSAY` | `cyber_geopolitics` | `1.92x` | `6,709` | `13,104` | `27,590` | `865,974` | `186,965` | `$16,680.25` |
| `09` | `2027-05-09` | `STR-FISHER-ARTIFACT` | `cyber_geopolitics` | `2.00x` | `8,436` | `16,667` | `34,018` | `1,082,899` | `239,814` | `$21,560.60` |
| `10` | `2027-05-21` | `STR-BOYLE-CHAPTERED` | `sovereign_finance` | `2.07x` | `10,292` | `19,911` | `39,225` | `1,297,428` | `286,726` | `$27,363.59` |
| `11` | `2027-06-02` | `STR-GEN-EXPLAINER` | `sovereign_finance` | `2.15x` | `12,828` | `23,460` | `45,670` | `1,530,747` | `336,745` | `$33,880.71` |
| `12` | `2027-06-14` | `STR-HMW-PRIMER` | `ai_economics` | `2.22x` | `14,966` | `27,101` | `52,933` | `1,755,173` | `386,554` | `$40,580.85` |
| `13` | `2027-06-26` | `STR-AOTP-LADDER` | `ai_economics` | `2.29x` | `17,049` | `30,466` | `59,650` | `1,970,493` | `421,827` | `$44,694.61` |
| `14` | `2027-07-08` | `STR-FISHER-ARTIFACT` | `sovereign_finance` | `2.35x` | `20,091` | `35,565` | `66,361` | `2,310,274` | `504,379` | `$53,369.41` |
| `15` | `2027-07-20` | `STR-AIC-CLOCKED` | `cyber_geopolitics` | `2.42x` | `23,504` | `39,575` | `71,791` | `2,567,742` | `568,756` | `$59,895.20` |
| `16` | `2027-08-01` | `STR-BOYLE-CHAPTERED` | `ai_economics` | `2.49x` | `26,768` | `45,533` | `80,636` | `2,939,480` | `651,969` | `$68,946.65` |
| `17` | `2027-08-13` | `STR-GEN-EXPLAINER` | `sovereign_finance` | `2.55x` | `30,583` | `49,822` | `89,028` | `3,214,089` | `724,973` | `$77,195.79` |
| `18` | `2027-08-25` | `STR-MAX-ESSAY` | `ai_economics` | `2.62x` | `33,535` | `54,586` | `98,373` | `3,512,675` | `779,971` | `$84,346.80` |
| `19` | `2027-09-06` | `STR-AIC-SPECULATIVE` | `cyber_geopolitics` | `2.68x` | `37,669` | `60,557` | **`106,174`** | `3,898,902` | `877,854` | `$93,671.70` |
| `20` | `2027-09-18` | `STR-HMW-PRIMER` | `sovereign_finance` | `2.74x` | `41,328` | `66,694` | `114,212` | `4,255,225` | `959,366` | `$103,642.41` |
| `21` | `2027-09-30` | `STR-FISHER-ARTIFACT` | `cyber_geopolitics` | `2.80x` | `45,297` | `71,861` | `125,763` | `4,597,509` | `1,047,284` | `$113,010.60` |
| `22` | `2027-10-12` | `STR-GEN-EXPLAINER` | `ai_economics` | `2.86x` | `49,517` | `78,768` | `131,916` | `5,022,113` | `1,132,940` | `$125,551.51` |
| `23` | `2027-10-24` | `STR-BOYLE-CHAPTERED` | `sovereign_finance` | `2.92x` | `53,389` | `85,101` | `142,834` | `5,452,887` | `1,229,434` | `$137,552.90` |
| `24` | `2027-11-05` | `STR-AOTP-LADDER` | `cyber_geopolitics` | `2.98x` | `57,934` | `91,070` | `149,820` | `5,809,686` | `1,296,365` | `$145,944.10` |
| `25` | `2027-11-17` | `STR-AIC-SPECULATIVE` | `ai_economics` | `3.04x` | `64,040` | `97,535` | `160,176` | `6,256,572` | `1,393,156` | `$159,480.51` |
| `26` | `2027-11-29` | `STR-GEN-EXPLAINER` | `sovereign_finance` | `3.10x` | `67,752` | **`104,999`** | `176,219` | `6,702,863` | `1,517,798` | `$172,919.43` |
| `27` | `2027-12-11` | `STR-FISHER-ARTIFACT` | `sovereign_finance` | `3.15x` | `72,978` | `113,556` | `190,531` | `7,232,493` | `1,632,684` | `$188,357.47` |
| `28` | `2027-12-23` | `STR-HMW-PRIMER` | `ai_economics` | `3.21x` | `78,620` | `120,837` | `197,848` | `7,665,021` | `1,732,004` | `$199,771.93` |
| `29` | `2028-01-04` | `STR-BOYLE-CHAPTERED` | `cyber_geopolitics` | `3.27x` | `84,161` | `127,844` | `212,805` | `8,187,523` | `1,843,748` | `$210,737.40` |
| `30` | `2028-01-16` | `STR-AIC-CLOCKED` | `sovereign_finance` | `3.32x` | **`90,763`** | **`136,821`** | **`223,795`** | **`8,681,770`** | **`1,994,250`** | **`$227,135.91`** |

## 6. Domain AdSense RPM Stratification (`$18` to `$34`) and Revenue Floor

AdSense calculations enforce `$0.00` revenue prior to clearing `1,000` subscribers and `4,000` public watch hours (`Episodes 01` through `03` in `P50`). Post-YPP monetized views earn domain-specific, duration-scaled, and seasonally adjusted RPMs bounded strictly between **`$18.00` and `$34.00`** per `1,000` views:
* **Sovereign Finance & Macro Debt (`12` of `30` uploads):** Base `$25.50` to `$33.20` RPM, bid up by institutional brokerage, treasury-yield, wealth-management, and tax-advisory advertisers targeting high-income `25` to `54` Tier-1 viewers.
* **AI Economics & Infrastructure Capex (`10` of `30` uploads):** Base `$22.00` to `$29.80` RPM, supported by cloud compute, enterprise B2B software, and developer-platform auction demand.
* **Cybersecurity & Physical Chokepoints (`8` of `30` uploads):** Base `$18.40` to `$25.80` RPM, anchored by enterprise identity, zero-trust security, and hardware-key advertisers while keeping broad geopolitical viewers monetized cleanly.
* **Q4 Auction Surge vs Q1 Reset:** Monthly multipliers scale base RPM from `0.89x` in January up to `1.15x` in November and `1.17x` in December, explaining the `$54,216` jump in `P50` AdSense between Episode 26 (`2027-11-29`) and Episode 30 (`2028-01-31`). Direct mid-roll sponsorships (`25,000+` subscriber threshold reached around Episode 11 to Episode 12 in June 2027) are excluded from these totals so pure platform revenue remains uninflated.

## 7. CLI Reproduction and Live 2027 Variance Triggers

Reproduce the canonical `500`-run projection, inspect CLI flags, or export custom sensitivity tables from the repository root:

```powershell
# Inspect CLI options
python 01_identity_and_strategy/models/growth_simulation.py --help

# Reproduce canonical 500-run January 2028 cohort JSON
python 01_identity_and_strategy/models/growth_simulation.py --episodes 30 --cadence-days 12 --seed 42 --monte-carlo 500 --export-json 01_identity_and_strategy/models/cohort_projection_jan2028.json

# Stream raw JSON or export CSV trajectory for spreadsheet auditing
python 01_identity_and_strategy/models/growth_simulation.py --monte-carlo 500 --export-csv 01_identity_and_strategy/models/trajectory_jan2028.csv
python 01_identity_and_strategy/models/growth_simulation.py --monte-carlo 100 --json
```

### Live Studio Intervention Thresholds
1. **Browse CTR Below `4.90%` at Hour 24:** Execute `03_viral_and_packaging/20_24hr_ctr_rescue_playbook.md` immediately, swapping Title/Thumbnail Pair A to pre-rendered Pair B before Layer-2 impressions decay.
2. **AVD Retention Below `46.0%`:** Run `08_ops_monetization_and_qa/tools/retention_autopsy.py` against YouTube Studio CSV curves to isolate deciles violating the `0.18` max re-hook gap (`R13`) or over-staying `presenterARollTarget` bands.
3. **Session Continuation Below `1.80x` by Episode 08:** Audit `0.98` to `1.00` spoken end-screen bridges (`07_omnichannel_and_marketing/47_endscreen_and_binge_routing_graph.md`) and pin thematic Series Playlist links in top comments.
4. **Zero Layer-4 Breakouts Across Eight Consecutive Uploads:** Shift two upcoming Mid-Performer slots toward high-curiosity `STR-GEN-EXPLAINER` wallet-stake titles audited against `03_viral_and_packaging/viral_outliers_db.json`.
