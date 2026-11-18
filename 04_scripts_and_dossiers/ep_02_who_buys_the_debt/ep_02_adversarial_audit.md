# Deliverable 22B: Episode 02 Stage 2 Adversarial Red-Team Stress Test

Document ID: `RR-OS-DIV04-22B`  
Episode Target: [`ep_02_script_clean.md`](./ep_02_script_clean.md) (*Who Buys America's $40T Debt Now?*)  
Codename: `The Captive Buyer` (`STR-FISHER-ARTIFACT` / `archival-light-table`)  
Upstream Protocol: [`12_adversarial_red_team_protocol.md`](../../02_research_and_data/12_adversarial_red_team_protocol.md) and [`red_team_checklists.json`](../../02_research_and_data/data/red_team_checklists.json)

## 1. Stage 2 Audit Mandate and Executive Clearance

Populist debt videos routinely lose institutional viewers in the first three minutes by claiming Tokyo is about to dump a trillion dollars of US bonds in a single morning, pretending foreign central banks still own over half the Treasury market, or treating all crypto reserve reports as identical audited balance sheets. Fixed-income traders, Big Four assurance partners, and banking attorneys spot those shortcuts immediately.

Episode 02 runs our Stage 2 adversarial protocol before locking its `3,300`-word teleprompter script (`179` lines and `21` `[ON SCREEN]` visual cues). Specialists across `SEAT_01_MACRO`, `SEAT_02_CPA`, `SEAT_04_CYBER`, and `SEAT_05_POLICY` (alongside supporting grid-queue verification from `SEAT_03_GRID`) attacked every claim in the Stage 1 primary evidence packet (`FL-007`, `FL-011`, `FL-012`, and `FL-046` through `FL-052`). Valid orthodox defenses were baked straight into spoken narration using the three-move `Grant-Recalculate-Tighten` turn before proving the episode's two structural failure modes: sovereign duration transfer (`3.92` rollovers per year) and forty-eight-hour weekend API redemption bottlenecks.

```yaml
stage_2_red_team_clearance:
  episode_id: "EP_02_THE_CAPTIVE_BUYER"
  target_script: "04_scripts_and_dossiers/ep_02_who_buys_the_debt/ep_02_script_clean.md"
  checklist_schema_version: "1.0.0"
  fatal_thesis_breaks_remaining: 0
  seat_verdicts:
    SEAT_01_MACRO: "PASS (Patches at L50-L52, L114, L122-L130, L136-L138; <30% foreign share and floating fiat rules locked)"
    SEAT_02_CPA: "PASS (Patches at L16, L100-L106, L116-L120, L158; SVB duration math and ISAE 3000 vs Rule 2a-7 split locked)"
    SEAT_03_GRID: "PASS (Supporting 72-month substation queue on 400-lot VEH_CIVIC_MUNI ledger verified at L60)"
    SEAT_04_CYBER: "PASS (Patches at L72-L76, L146-L156; Ring 3 24/7 API redemption bots vs 5-day Fedwire/repo hours locked)"
    SEAT_05_POLICY: "PASS (Patches at L80-L96, L120, L166-L172; Pub. L. 119-27 Sec. 4(a)(1)/(11) and non-advisory guard locked)"
  cleared_for_stage_3_structure: true
```

## 2. Seat-by-Seat Stress Test and Exact Script Line Mapping

### 2.1 `SEAT_01_MACRO`: Federal Reserve and Sovereign Macroeconomist

#### Finding `EP02-M01` (`MANDATORY_PROSE_CONCESSION`): Domestic Market Share vs. Marginal Long-End Duration Loss
1. Hostile institutional attack: "Foreigners do not run the US bond market anymore. Foreign official and private holders combined own under thirty percent of marketable Treasuries, down from over half in 2014, and Japan's `$1,068.3B` (`FL-048`) is just `3.25%` of `$32.9T` in debt held by the public (`FL-007`). Domestic households, pensions, and money-market funds already clear most Treasury auctions."
2. Exact script resolution (`L114` and `L122-L130`): Line `114` grants the exact macro share upfront, stating that foreign ownership dropped from over half in 2014 to under thirty percent of `$32.9 trillion` in public marketable debt, with Japan holding `3.25 percent`. Lines `122` through `130` then recalculate the maturity calendar: domestic payment stablecoins are barred by statute from buying ten-year notes or thirty-year bonds, forcing Treasury to roll ninety-three-day bills `3.92` times a year while private bond funds demand higher term premiums to absorb unanchored long-duration auctions.

#### Finding `EP02-M02` (`DENOMINATOR_PRECISION_FIX`): Tokyo Domestic JGB Mark-to-Market Brake (`FL-047`)
1. Hostile institutional attack: "Japanese life insurers will not dump `$1,068.3B` in US bonds overnight because `4.0%` thirty-year JGB yields inflict unrealized mark-to-market accounting losses on their existing low-coupon domestic JGB portfolios, constraining sudden balance-sheet turnover."
2. Exact script resolution (`L46` and `L50-L52`): Line `46` explicitly rejects panic-liquidation alarmism, stating Tokyo funds never need to dump `$1,068.3 billion` on a Tuesday morning. Lines `50` through `52` voice the bond strategist's exact accounting brake (paper price drops on older `0.75 percent` domestic JGBs slowing portfolio reshuffling) and isolate the marginal flow problem: fresh yen inflows stay onshore at `4.0 percent` instead of bidding at New York ten-year and thirty-year auctions.

#### Finding `EP02-M03` (`MANDATORY_PROSE_CONCESSION`, Check `RT_M01`/`RT_M02`): Floating Fiat Regime vs. 1968 to 1971 Bretton Woods Gold Pool
1. Hostile institutional attack: "Comparing 2027 Treasury auctions to the 1968 to 1971 London Gold Pool collapse (`Federal Reserve FOMC Memoranda, August 1971`) confuses a fixed `$35/oz` gold convertibility promise with a modern floating fiat currency. The consolidated US government issues dollars and cannot run out of gold bars."
2. Exact script resolution (`L134-L138`): After walking through the March 1968 to August 15, 1971 Gold Pool runoff (`L134-L136`), Line `138` locks the monetary regime boundary directly: today's dollar floats free of a `$35` gold peg, so Washington cannot run out of metal bars or miss a nominal debt payment unless Congress blocks the debt limit. The script shows that in a floating fiat regime, the pressure valve moves out of the bullion vault and into elevated ten-year yields that price household mortgages even when the Fed cuts overnight rates.

### 2.2 `SEAT_02_CPA`: Forensic CPA and Institutional Credit Analyst

#### Finding `EP02-C01` (`MANDATORY_PROSE_CONCESSION`): Silicon Valley Bank Duration Shield vs. Sovereign Duration Transfer
1. Hostile institutional attack: "Forcing payment stablecoins into `<=93-day` Treasury bills (`Public Law 119-27`, Section `4(a)(1)`) is textbook prudential risk management. Silicon Valley Bank failed in March 2023 because it backed demand deposits with ten-year bonds that lost twenty percent when rates rose. Twelve-week T-bills have near-zero mark-to-market rate sensitivity."
2. Exact script resolution (`L116` and `L122-L128`): Line `116` steelmans bank examiners directly, walking through SVB's March 2023 ten-year bond wipeout and conceding that ninety-three-day bills barely budge in market price during rate hikes. Lines `122` through `128` tighten the accounting identity: maturity risk is conserved across consolidated balance sheets. Insulating Circle and Tether from thirty-year duration risk shifts one hundred percent of that refinancing exposure onto the US Treasury (`365 / 93 = 3.92` rollovers per year) and mortgage borrowers.

#### Finding `EP02-C02` (`DENOMINATOR_PRECISION_FIX`, Check `RT_C03`): ISAE 3000 Point-in-Time Attestation vs. SEC Rule 2a-7 Custody (`FL-049`, `FL-050`)
1. Hostile institutional attack: "Do not lump Tether and Circle into one audited bucket. Circle parks its `~$68.0B` USDC reserves inside an SEC-registered Rule 2a-7 government money-market fund (`USDXX`) examined by Deloitte, whereas Tether's BDO Italia report (`$132.4B` US T-bill exposure inside `$191.45B` total assets) is an `ISAE 3000` point-in-time snapshot attestation alongside offshore Bitcoin, gold, and secured loans."
2. Exact script resolution (`L100-L102` and `L120`): Lines `100` through `102` report direct and indirect T-bill components accurately (`$132.4B` of `$191.45B`, or `69.2%`, at Tether alongside `~$68.0B` at Circle). Line `120` voices the forensic CPA distinction word for word, separating Circle's SEC-registered Rule 2a-7 fund from Tether's `ISAE 3000` single-day closing snapshot, noting the absence of an annual PCAOB internal-control audit, and naming Tether's offshore Bitcoin, gold, and loan holdings.

#### Finding `EP02-C03` (`DENOMINATOR_PRECISION_FIX`, Check `RT_C02`): Net Interest Function 900 (`FL-012`) and Cash `FCF` vs. GAAP Earnings (`ep_03` Seam)
1. Hostile institutional attack: "Keep Function 900 Net Interest (`$1.05T`) distinct from gross Treasury interest (`>$1.3T`) when comparing against Function 050 National Defense (`$0.93T`), and never confuse Big Tech's `$824B` cash CapEx drain with GAAP accrual net income."
2. Exact script resolution (`L14`, `L16`, `L158`, `L178`): Line `16` cites fiscal 2026 `annual net interest` at `$1.05 trillion` against the `$0.93 trillion` defense budget (`FL-012`). Lines `14` and `158` isolate negative cash `Free Cash Flow` at Alphabet and Amazon caused by `$824 billion` in AI server spending, setting up Line `178`'s clean handoff to Episode 03's SEC `Form 10-K Note 1` six-year depreciation audit (`$176 billion`).

### 2.3 `SEAT_04_CYBER` (`SEAT_04_SEC`): Settlement Plumbing, API Automation, and Cyber Researcher

#### Finding `EP02-S01` (`MANDATORY_PROSE_CONCESSION` + `DENOMINATOR_PRECISION_FIX`, Check `RT_S01`/`RT_S02`): Legitimate Cross-Border Utility vs. Ring 3 Weekend API Herding
1. Hostile institutional attack: "First, cross-border stablecoin APIs solve a real three-day correspondent banking delay for emerging-market importers, instead of serving pure crypto speculation. Second, do not invent sci-fi AI zero-day attacks against the Federal Reserve to explain a stablecoin run; real liquidity shocks come from ordinary `Ring 3` automated treasury scripts reacting to custodian freezes, stolen cross-chain bridge keys, or `$0.997` secondary peg slips while traditional bank rails are shut for the weekend."
2. Exact script resolution (`L72-L76` and `L146-L156`): Lines `72` through `76` credit fintech engineers first, contrasting Friday-to-Tuesday correspondent wire hops for suppliers in Dhaka and Sao Paulo against instant `24/7` web API dollar settlement. Lines `146` through `156` anchor the run scenario in verified institutional plumbing: first citing `Office of Financial Research Working Paper 20-02` on the Tuesday, September 17, 2019 repo spike (`2.1%` to `10.0%` on routine tax and settlement drains), then showing how user-space corporate risk bots polling `24/7` price feeds queue tens of billions in redemptions across a forty-eight-hour weekend before hitting balance-sheet-constrained primary dealers at `8:00 AM` Monday.

### 2.4 `SEAT_05_POLICY` (`SEAT_05_LAW`): Banking Regulatory, Statutory, and Safe-Harbor Counsel

#### Finding `EP02-L01` (`DENOMINATOR_PRECISION_FIX`): Exact Statutory Scope of `Public Law 119-27` (`FL-051`, `FL-052`) and Affiliate Reward Policing
1. Hostile institutional attack: "Cite exact subsections of the July 18, 2025 `GENIUS Act` (`Public Law 119-27`): `Section 4(a)(1)` governs `1:1` permissible reserves (`<=93-day` T-bills, cash, insured deposits, overnight repos) and `Section 4(a)(11)` bars issuer yield pass-through (`0.0%`). Also note that exchanges attempt indirect affiliate 'reward' workarounds, triggering Fed and OCC anti-evasion rules. Finally, never equate municipal bond budget pressure (`VEH_CIVIC_MUNI`) with federal sovereign default."
2. Exact script resolution (`L62`, `L80-L96`, `L120`, `L138`, `L164`): Lines `80` through `96` walk straight through `Public Law 119-27`, `Section 4(a)(1)`, and `Section 4(a)(11)` with exact statutory precision. Line `120` notes exchange affiliate-reward workarounds and Fed/OCC rules against backdoor yield. Lines `62`, `138`, and `164` keep municipal pension and property-tax compression (`28%` downtown office tax share) strictly separate from federal nominal solvency.

#### Finding `EP02-L02` (`LEGAL_SAFE_HARBOR_GUARD`, Check `RT_L04`): Act IV Non-Advisory Framing and Custodial Accuracy
1. Hostile institutional attack: "Instructing viewers to move checking cash into Treasury bills or money-market funds without an explicit non-advisory disclaimer and accurate custodial terminology (`TreasuryDirect` vs `SIPC`-custodied brokerage accounts, keeping `FDIC` bank insurance distinct) violates house safe-harbor rules."
2. Exact script resolution (`L166-L172`): Line `166` opens the takeaway block with an explicit first-person safe harbor (`None of this is financial or legal advice, and I don't know which quarterly Treasury refunding will test dealer limits first`). Line `170` keeps `0.01 percent` bank checking accounts (`monthly bill cash`), `0.0 percent` `Section 4(a)(11)` payment stablecoins, direct `TreasuryDirect` four-week and thirteen-week T-bills (noting state and local income-tax exemption), and `SIPC-custodied` short-term Treasury money-market funds legally and custodially exact.

## 3. Master Summary of Embedded `Grant-Recalculate-Tighten` Patches

| Patch ID | Specialist Seat(s) | Script Lines | Institutional Defense Granted (`Move 1`) | Household / Treasury Recalculation (`Move 2 & Move 3`) |
| :--- | :--- | :--- | :--- | :--- |
| `PATCH_EP02_01` | `SEAT_01_MACRO` | `L50-L52` | Rising `4.0%` 30Y JGB yields cause paper losses on older `0.75%` JGBs at Tokyo insurers, slowing outright bond sales. | Fresh yen inflows still stay onshore in Tokyo, removing marginal foreign demand from New York 10Y and 30Y auctions that price US mortgages. |
| `PATCH_EP02_02` | `SEAT_04_CYBER` + `SEAT_05_POLICY` | `L72-L76` | Cross-border 24/7 digital-dollar APIs fix slow, high-fee three-day correspondent bank wires for global suppliers. | Rising `$200B+` global transactional demand gives Congress a captive pool forced into `<=93-day` bills at `0.0%` holder interest. |
| `PATCH_EP02_03` | `SEAT_01_MACRO` + `SEAT_02_CPA` | `L114-L124` | Foreigners own `<30%` of marketable debt (`3.25%` Japan), and `<=93-day` bills prevent SVB-style 10-year bond mark-to-market wipeouts. | Duration risk shifts 100% onto Treasury (`3.92x` annual rollovers) while `0` stablecoin dollars replace Tokyo on 10Y/30Y mortgage-benchmark bonds. |
| `PATCH_EP02_04` | `SEAT_02_CPA` + `SEAT_05_POLICY` | `L120` | Circle uses an SEC Rule 2a-7 fund while Tether relies on a narrower BDO `ISAE 3000` closing-day snapshot alongside offshore assets. | Attestation opacity and offshore holdings raise Friday-night peg sensitivity (`$0.997`), priming 48-hour weekend automated API redemptions. |
| `PATCH_EP02_05` | `SEAT_01_MACRO` | `L136-L138` | Unlike the 1968 to 1971 `$35/oz` Bretton Woods Gold Pool, today's floating fiat dollar cannot run out of bullion reserves. | Without a gold peg, the escape valve sits in long-end term premiums, keeping 10Y mortgage rates and 400-lot builder loans elevated even if short rates drop. |
