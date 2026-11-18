# Deliverable 22C: Episode 02 Production Cue, Live-Slot, and Citation Master

Document ID: `RR-OS-DIV04-22C`  
Clean Teleprompter Script: [`ep_02_script_clean.md`](./ep_02_script_clean.md) (`3,300` spoken words, `22:00` @ `150 wpm`, `179` lines, `21` visual cues)  
Adversarial Stress Test: [`ep_02_adversarial_audit.md`](./ep_02_adversarial_audit.md)  
Strategy & Visual Lock: `STR-FISHER-ARTIFACT` + `archival-light-table` (`PAGE_PALETTE` `#FAF8F3` / `#F4EFE6` + `OVER_FOOTAGE_PALETTE` Liquid Glass)  
Upstream Schemas: [`slate_30_jan2028.json`](../../02_research_and_data/slate_30_jan2028.json), [`fact_ledger.json`](../../02_research_and_data/data/fact_ledger.json), [`19_first_15s_hook_alignment_matrix.json`](../../03_viral_and_packaging/19_first_15s_hook_alignment_matrix.json), and [`continuity_graph.json`](../continuity_graph.json)

## 1. Episode Architecture, Desk Continuity, and 6-Stage Pipeline Lock

Episode 02 (*Who Buys America's $40T Debt Now?*, codename `The Captive Buyer`, scheduled for `2027-02-14` inside the pre-recorded Launch Trio) answers the unsolved fiscal cliff planted in the closing minute of Episode 01 (*The Allowance*). Once autonomous software erodes human W-2 payroll withholding (`>86%` of federal receipts) while permanent first-year hardware write-offs compress corporate tax share (`~7.1%`), Congress has to finance widening deficits and a `$1.05 trillion` net interest bill (`$2.14 trillion` by 2036) through continuous Treasury auctions.

```yaml
continuity_and_studio_lock:
  episode_id: "ep_02"
  episode_number: 2
  official_series: "Series 01: AI Economy, National Debt & Your Money (2027-2036)"
  strategy_preset_id: "STR-FISHER-ARTIFACT"
  visual_register_id: "archival-light-table"
  primary_vehicle_id: "VEH_CIVIC_MUNI"
  supporting_callback_vehicle_id: "VEH_CLAIRE_AUSTIN"
  claire_callback_line: "L62 (20 spoken words, standalone framing, <=25w cap)"
  host_generational_stake_line: "L22 (age 18 in 2026/2027 -> age 28 in 2036)"
  historical_precedent_id: "HIST_EP02_LONDON_GOLD_POOL_AND_2019_REPO"
  retired_after_episode: true
  active_motifs:
    - "MOTIF_WHITEBOARD_VS_30YR_LOAN"
  desk_wardrobe_and_props:
    shirt_spec: "Warm unbleached Oxford cloth button-down (#F2ECE1, >=2.0mm weave)"
    tie_semantic_role: "statutory_navy (#1C2B3A matte grenadine silk, four-in-hand)"
    cotton_exhibits: "Pub. L. 119-27 Sec. 4, US Treasury TIC Table 5, Tether BDO Q3 Report, OFR WP 20-02"
    foreground_scale_prop_id: "prop_ep02_bearer_treasury_coupon_sheet"
    cinema_entity_id: "ENT_MUNI_TAX_BASE"
  binge_routing:
    incoming_from: "ep_01"
    chronological_next: "ep_03"
    series_playlist_next: "ep_10"
```

### Act-by-Act Structural and Pacing Breakdown (`150 wpm` Baseline)

| Structural Block | Script Lines | Spoken Word Span | Est. Clock (`150 wpm`) | Fractional Window | Active Pipeline Function |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Cold Open & Three-Exhibit Board | `L10-L26` | `w1-w332` (`332w`) | `00:00-02:13` | `0.00-0.10` | Exact locked `43w` `statutory_clause_reveal` hook (`w3` number, `w7` stake), Ep 01 W-2 tax bridge, `18->28` host stake, unspoiled `R02` board. |
| Act I: Exhibit One (The Tokyo Exit) | `L28-L66` | `w333-w1057` (`725w`) | `02:13-07:03` | `0.10-0.32` | `TIC Table 5` (`$1,068.3B`), `1.25%` BOJ rate, `4.0%` 30Y JGB yield, JGB paper-loss concession (`L50`), `VEH_CIVIC_MUNI` Touch 1 (`400` lots, `28%` office tax) + `20w` Claire callback (`L62`). |
| Act II: Exhibit Two (`Pub. L. 119-27`) | `L68-L108` | `w1058-w1890` (`833w`) | `07:03-12:36` | `0.32-0.57` | Cross-border API steelman (`L72`), `GENIUS Act` `Sec. 4(a)(1)` (`<=93d` T-bills) & `Sec. 4(a)(11)` (`0.0%` holder yield), Tether (`$132.4B`) + Circle (`$68.0B`) = `$200.4B` (`$8.52B/yr` spread). |
| Act III: Exhibit Three (Stress Test & Run) | `L110-L158` | `w1891-w2888` (`998w`) | `12:36-19:15` | `0.57-0.88` | `<30%` foreign share + SVB + `ISAE 3000` steelman (`L114-L120`), Duration Transfer (`3.92x/yr` rollovers), 1968 to 1971 Gold Pool (`L134`), bearer-bond scissors to Sept 17, 2019 `10.0%` repo spike to 48h weekend bot run (`L144-L156`). |
| Act IV: Household Defense & Ep 03 Seam | `L160-L178` | `w2889-w3300` (`412w`) | `19:15-22:00` | `0.88-1.00` | `VEH_CIVIC_MUNI` 2036 convergence (`L164`), safe-harbor guard (`L166`), `TreasuryDirect` / `SIPC` MMF yield capture (`L170`), refi stress test (`L172`), verdict (`L176`), Ep 03 `$176B` Note 1 bridge (`L178`). |

## 2. Primary Citation Ledger Mapping (`FL-*` Anchor Registry)

Every quantitative claim in [`ep_02_script_clean.md`](./ep_02_script_clean.md) maps to a verified record in [`fact_ledger.json`](../../02_research_and_data/data/fact_ledger.json).

| Fact ID | Locked Value | Primary Institution & Filing | Verification Formula | Exact Script Lines |
| :--- | :--- | :--- | :--- | :--- |
| `FL-007` | `$40.5T` gross (`~$32.9T` public) | US Treasury Fiscal Service, *Debt to the Penny / MSPD* | `32.9 + 7.6 == 40.5` | `L16`, `L22`, `L114`, `L130`, `L176` |
| `FL-011` | `$2.14T/yr` in FY2036 | Congressional Budget Office, *Budget and Economic Outlook: 2026 to 2036*, Table 1-1 | `2.14 - 1.05 == 1.09` | `L18`, `L20`, `L130`, `L164` |
| `FL-012` | `$1.05T` net interest vs `$0.93T` defense | US Treasury *Final Monthly Treasury Statement (FY2026)*, Table 9 (`Fn 900` vs `Fn 050`) | `1048.0 - 931.0 == 117.0` | `L16`, `L130` |
| `FL-046` | `1.25%` (`+135 bps` from `-0.10%`) | Bank of Japan, *Statement on Monetary Policy* (Uncollateralized Overnight Call Rate) | `(1.25 - (-0.10)) * 100 == 135` | `L34`, `L38`, `L40` |
| `FL-047` | `~4.0%` (`3.98%`, up from `~0.75%`) | Ministry of Finance Japan, *Historical JGB Interest Rate Statistics* (30Y Benchmark) | `3.98 - 0.75 == 3.23` | `L12`, `L34`, `L38`, `L42`, `L44`, `L50`, `L52`, `L176` |
| `FL-048` | `$1,068.3B` (`3.25%` of public float; `<30%` all foreign) | US Treasury *TIC System Monthly Report*, Table 5 (*Major Foreign Holders*) | `round(1068.3 / 32900 * 100, 2) == 3.25` | `L10`, `L12`, `L28`, `L30`, `L46`, `L104`, `L106`, `L114`, `L164` |
| `FL-049` | `$132.4B` US T-bills / `$191.45B` assets (`69.2%`) | Tether Holdings & BDO Italia S.p.A., *Q3 2026 Consolidated Reserves Report* (`ISAE 3000`) | `round(132.4 / 191.45 * 100, 1) == 69.2` | `L98`, `L100`, `L104`, `L106`, `L118`, `L120` |
| `FL-050` | `~$68.0B` USDC (`$200.4B` combined w/ Tether) | Circle Internet Group, Deloitte Exam & BlackRock *Circle Reserve Fund (`USDXX`)* | `132.4 + 68.0 == 200.4` | `L98`, `L102`, `L104`, `L106`, `L118`, `L120` |
| `FL-051` | `1:1` backing in `<=93-day` US T-bills (`3.92x/yr`) | 119th US Congress, *GENIUS Act*, `Public Law 119-27`, Section `4(a)(1)` (July 18, 2025) | `round(365 / 93, 2) == 3.92` | `L10`, `L12`, `L24`, `L78`, `L80`, `L84`, `L86`, `L124`, `L128`, `L156`, `L164`, `L172` |
| `FL-052` | `0.0%` holder yield (`~$8.52B/yr` issuer spread @ `4.25%`) | 119th US Congress, *GENIUS Act*, `Public Law 119-27`, Section `4(a)(11)` (July 18, 2025) | `round(200.4 * 0.0425, 2) == 8.52` | `L10`, `L12`, `L88`, `L90`, `L92`, `L94`, `L96`, `L106`, `L120`, `L168`, `L170`, `L176` |

Cross-episode continuity citations connect both ends of the Launch Trio cleanly. Line `14` bridges from Episode 01 via `FL-004` (`>86%` individual plus payroll tax share), `FL-006` (`7.1%` corporate share), and `FL-023` (`100%` first-year server expensing). Lines `14`, `158`, and `178` plant Episode 03's anchors via `FL-017` (`$824B` Big Five AI CapEx), `FL-018` and `FL-019` (Alphabet and Amazon negative FCF), `FL-054` (6-year `Note 1` server life), and `FL-055` (`$176B` understated depreciation). Historical receipts at `L134-L136` and `L146` bind to `Federal Reserve Archival FOMC Memoranda (August 1971)` and `Office of Financial Research Working Paper 20-02` (`2.1%` to `10.0%` Sept 17, 2019 repo jump).

## 3. Shoot-Week Refresh Protocol: `8` `[LIVE_STAT_SLOT:...]` Rules

Prior to recording studio A-roll or running `tools/staleness_audit.py`, the producer refreshes all eight live slots declared for `ep_02` in [`slate_30_jan2028.json`](../../02_research_and_data/slate_30_jan2028.json). Static statutory locks (`FL-051` and `FL-052`) never change unless Congress amends `Public Law 119-27`.

| Slot Token | Fact ID | Baseline Value | Refresh Window & Authoritative Feed | `THESIS_BREAK_IF` Tripwire | Target Lines in `ep_02_script_clean.md` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `[LIVE_STAT_SLOT:US_GROSS_FEDERAL_DEBT]` | `FL-007` | `$40.5T` (`$32.9T` public) | Within `24h` of shoot via Treasury Fiscal Data *Debt to the Penny* API | Gross US federal debt drops below `$36.0T` | `L16`, `L22`, `L114`, `L130`, `L176` |
| `[LIVE_STAT_SLOT:CBO_10YR_NET_INTEREST_OUTLAY]` | `FL-011` | `$2.14T` (`FY2036`) | Semi-annually (`<=72h` pre-shoot check) from CBO *Budget & Economic Outlook* Table 1-1 | 10-year terminal net interest projection drops below `$1.5T` | `L18`, `L20`, `L130`, `L164` |
| `[LIVE_STAT_SLOT:MTS_NET_INTEREST_VS_DEFENSE]` | `FL-012` | `$1.05T` vs `$0.93T` | Within `72h` of shoot from latest Final September *MTS* Table 9 (`Fn 900` vs `Fn 050`) | Net Interest falls below `$900B` or drops below Defense | `L16`, `L130` |
| `[LIVE_STAT_SLOT:BOJ_OVERNIGHT_POLICY_RATE]` | `FL-046` | `1.25%` (`+135 bps`) | Within `48h` of shoot from Bank of Japan *Monetary Policy Releases* | BOJ cuts overnight call rate back below `0.25%` | `L38`, `L40` |
| `[LIVE_STAT_SLOT:JAPAN_30Y_JGB_YIELD]` | `FL-047` | `~4.0%` (`3.98%`) | Within `48h` of shoot from Ministry of Finance Japan daily JGB yield table | 30Y JGB benchmark yield collapses below `2.0%` | `L12`, `L38`, `L42`, `L44`, `L50`, `L52`, `L176` |
| `[LIVE_STAT_SLOT:TIC_JAPAN_TREASURY_HOLDINGS]` | `FL-048` | `$1,068.3B` | Monthly (`<=72h` pre-shoot check) from US Treasury *TIC Table 5* | Japan drops out of top-two foreign holders or falls `<$700B` | `L10`, `L12`, `L28`, `L30`, `L46`, `L114`, `L164` |
| `[LIVE_STAT_SLOT:TETHER_TBILL_RESERVES]` | `FL-049` | `$132.4B` / `$191.45B` | Quarterly (`<=72h` pre-shoot check) from Tether BDO *Consolidated Reserves Report* | Tether US T-bill exposure falls below `$80.0B` | `L98`, `L100`, `L104`, `L106`, `L118`, `L120` |
| `[LIVE_STAT_SLOT:CIRCLE_USDC_CIRCULATION]` | `FL-050` | `~$68.0B` USDC | Monthly (`<=72h` pre-shoot check) from Circle *Reserve Examination Report* (`USDXX`) | USDC circulation falls below `$35.0B` | `L98`, `L102`, `L104`, `L106`, `L118`, `L120` |

Whenever `FL-049` or `FL-050` updates during shoot week, recalculate their sum (`Tether T-bills + Circle USDC`, baseline `$200.4B` at `L104` and `L106`) and multiply by the prevailing 13-week Treasury bill auction rate (`baseline 4.25% -> $8.52B/yr` gross issuer spread at `L106`). Re-run `anti_ai_script_gate.mjs` and `retention_linter.mjs` afterward to verify zero cadence drift.

## 4. Complete `21`-Cue `archival-light-table` Asset and Cinema Registry

All `21` `[ON SCREEN: ...]` visual beats bind deterministically to `reading-room-cinema` Dual-Palette tokens (`archival_parchment` `#F4EFE6` / `paperLight` `#FAF8F3` for `page` cutaways; `OVER_FOOTAGE_PALETTE` smoked-navy Liquid Glass in `rightThird` for `over-footage` cards).

| Cue # | Line | Word / Time | Cinema `StyleRecipe` | Palette & Substrate | Visual Asset Specification & Foley / Score State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | `L10` | `w1` (`00:00`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | Locked Frame-One Platen: `Pub. L. 119-27` `Sec. 4` (`93-day` & `0.0%` circled in `#A3402E`), `TIC Table 5`, clipped bearer coupons. SFX: `paper-slide` + `marker-sweep`. Score: `calm`. |
| `02` | `L18` | `w171` (`01:08`) | `doc-visual-investigation` | `page` (`#FAF8F3`) | Split platen: CBO Table 1-1 (`$2.14T` FY2036 net interest) beside blank 2036 30-year mortgage note. SFX: `data-tick`. Score: `calm`. |
| `03` | `L28` | `w333` (`02:13`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | Exhibit One header; US Treasury `TIC Table 5` cotton printout with Japan `$1,068.3B` swept in warm amber (`rgba(255,213,79,0.38)`). SFX: `marker-sweep`. Score: `pulse`. |
| `04` | `L38` | `w519` (`03:27`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | BOJ Monetary Policy Statement (`1.25%` call rate) paired with MOF Japan 30Y JGB curve hitting `3.98%` (`~4.0%`). SFX: `paper-slide`. Score: `pulse`. |
| `05` | `L48` | `w702` (`04:40`) | `liquid-glass-card` | `over-footage` (`rightThird`) | Smoked-navy glass card over left-framed host: legacy `0.75%` JGB unrealized loss brake vs `4.0%` fresh yen onshore inflow. SFX: `glass-enter`. Score: `pulse`. |
| `06` | `L58` | `w876` (`05:50`) | `doc-visual-investigation` | `page` (`#FAF8F3`) | `ENT_MUNI_TAX_BASE` Touch 1: audited city ACFR (`28%` office tax share) + `400`-lot subdivision plat + `72`-month substation queue. SFX: `flash-cut`. Score: `pulse`. |
| `07` | `L68` | `w1058` (`07:03`) | `diagram-isometric` | `page` (`#FAF8F3`) | Showstopper `bp_ep02_swift_vs_api_rails`: 3-day correspondent SWIFT hops (`Dhaka`/`Sao Paulo`) vs 24/7 API digital-dollar T-bill loop. SFX: `data-tick`. Score: `calm`. |
| `08` | `L78` | `w1246` (`08:18`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | Exhibit Two macro: `Public Law 119-27` (`GENIUS Act`, July 18, 2025) enacting clause, `Sec. 4(a)(1)` amber sweep, `Sec. 4(a)(11)` `#A3402E` ring. SFX: `paper-slide`. Score: `pulse`. |
| `09` | `L88` | `w1402` (`09:20`) | `liquid-glass-card` | `over-footage` (`rightThird`) | Statutory spread split: `4.25%` 13-week T-bill yield retained `100%` by issuer vs `0.0%` holder cap under `Sec. 4(a)(11)`. SFX: `glass-enter`. Score: `pulse`. |
| `10` | `L98` | `w1574` (`10:29`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | Tether Q3 2026 BDO Italia Assurance schedule (`$132.4B` T-bills / `$191.45B` total) beside Circle `USDXX` Deloitte exam (`$68.0B`). SFX: `paper-slide`. Score: `pulse`. |
| `11` | `L104` | `w1698` (`11:19`) | `data-physical-card` | `page` (`#FAF8F3`) | Bar ranking placing `$200.4B` Tether+Circle T-bill pool directly against `TIC Table 5` sovereign rows (`Germany`, `South Korea`, `Saudi Arabia`). SFX: `data-tick`. Score: `pulse`. |
| `12` | `L110` | `w1780` (`11:52`) | `doc-visual-investigation` | `page` (`#FAF8F3`) | Exhibit Three adversarial matrix: SVB March 2023 10Y bond loss (`-20%`) vs `<=93d` T-bill shield + `<30%` foreign public debt share (`3.25%` Japan). SFX: `flash-cut`. Score: `tense`. |
| `13` | `L118` | `w1958` (`13:03`) | `liquid-glass-card` | `over-footage` (`rightThird`) | Forensic CPA card: SEC Rule 2a-7 `USDXX` custody vs BDO `ISAE 3000` single-day snapshot + offshore BTC/gold/loans. SFX: `glass-enter`. Score: `tense`. |
| `14` | `L126` | `w2141` (`14:16`) | `diagram-isometric` | `page` (`#FAF8F3`) | Showstopper `bp_ep02_duration_transfer_wheel`: 30Y Tokyo lock (`2016->2046`) vs `93d` T-bill treadmill (`3.92x/yr` Jan/Apr/Jul/Oct rollovers). SFX: `warning-thud`. Score: `tense`. |
| `15` | `L132` | `w2305` (`15:22`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | Declassified August 1971 Fed FOMC memoranda (`1968 to 1971` `$35/oz` London Gold Pool runoff) paired with 10Y vs 3M curve steepener. SFX: `paper-slide`. Score: `tense`. |
| `16` | `L140` | `w2496` (`16:38`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | Showstopper `bp_ep02_scissors_to_repo_spike`: 60-coupon `$10,000` bearer bond beside `OFR Working Paper 20-02` Sept 17, 2019 `2.1%->10.0%` repo chart. SFX: `telestrator-draw`. Score: `tense`. |
| `17` | `L148` | `w2674` (`17:49`) | `data-map-explainer` | `page` (`#111315` `midnight_telemetry`) | 48-hour Friday `11:00 PM` (`$0.997` peg slip) to Monday `8:00 AM` timeline: 24/7 API bot redemptions vs dark Fedwire/dealer repo windows. SFX: `data-tick`. Score: `tense`. |
| `18` | `L154` | `w2777` (`18:30`) | `diagram-isometric` | `page` (`#FAF8F3`) | Showstopper `bp_ep02_monday_dealer_bottleneck`: queued `$B` 93-day T-bill liquidations hitting post-2008 primary-dealer balance-sheet caps. SFX: `warning-thud`. Score: `tense`. |
| `19` | `L160` | `w2890` (`19:16`) | `doc-visual-investigation` | `page` (`#FAF8F3`) | `ENT_MUNI_TAX_BASE` 2036 convergence: `400`-lot builder + `28%`-office-tax city pension + steep 10Y mortgage vs `0.0%` wallet & `4.25%` T-bill. SFX: `glass-dock`. Score: `calm`. |
| `20` | `L168` | `w3026` (`20:10`) | `liquid-glass-card` | `over-footage` (`rightThird`) | Non-advisory balance-sheet checklist: `0.0%` `Sec. 4(a)(11)` token & `0.01%` bank checking vs direct `TreasuryDirect` 4w/13w T-bills & `SIPC` MMF. SFX: `glass-enter`. Score: `calm`. |
| `21` | `L174` | `w3194` (`21:17`) | `doc-archive-light-table` | `page` (`#F4EFE6`) | Pull-back from `Pub. L. 119-27` across walnut blotter to `SEC Form 10-K Note 1` 6-year server life table (`$176B` Ep 03 bridge). SFX: `paper-slide`. Score: `drop-silence` at `L176`. |

### `episodes-vault.json` Anti-Repetition Handoff Summary (`ep_02_who_buys_the_debt`)

1. Primary and secondary visual registers bind to `archival-light-table` (`page` `#F4EFE6`) paired with `smoked-navy-glass` (`over-footage`).
2. Procedural score stems rotate onto `forensic-clockwork` (`calm`, `pulse`, `tense`, `drop-silence`), maintaining full cooldown separation from Episode 01's `reading-room-chamber` suite.
3. Bespoke showstopper set pieces declare four timelines: `bp_ep02_swift_vs_api_rails`, `bp_ep02_duration_transfer_wheel`, `bp_ep02_scissors_to_repo_spike`, and `bp_ep02_monday_dealer_bottleneck`.
4. Stateful continuity entities lock `ENT_MUNI_TAX_BASE` (`act1_400_lots_and_28pct_office_tax` -> `act3_10y_term_premium_freeze` -> `act4_2036_curve_convergence`) alongside `ENT_THREE_EXHIBIT_LIGHT_TABLE` (`exhibit1_tic_tokyo` -> `exhibit2_pl119_27` -> `exhibit3_392x_rollover_stamped`).
