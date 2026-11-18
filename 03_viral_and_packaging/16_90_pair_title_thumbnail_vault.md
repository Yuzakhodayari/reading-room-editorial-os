# Deliverable 16: 90-pair title and thumbnail vault

Document ID: `RR-OS-DIV03-16`
Machine Vault: [`16_90_pair_title_thumbnail_vault.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/03_viral_and_packaging/16_90_pair_title_thumbnail_vault.json)
Master Slate Lock: [`slate_30_jan2028.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/slate_30_jan2028.json)
Cinema Palette Contract: [`cinema_schema_contract.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/01_identity_and_strategy/cinema_schema_contract.json)
Fact-Lock Ledger: [`fact_ledger.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/02_research_and_data/data/fact_ledger.json)

## 1. Unified click-surface engineering and anti-duplication laws

A YouTube title and thumbnail operate inside a single two-hundred-millisecond eye fixation on mobile Home and Browse feeds (`210 x 118 px` thumbnail beside truncated title text). Most educational creators draft the title in a document and design the thumbnail hours later in an image editor, repeating the exact same noun or dollar figure across both surfaces. Repeating words wastes half the click budget.

*The Reading Room* locks all ninety pre-engineered packages across Season 1 (`ep_01` through `ep_30`, February 2027 through January 2028) to five deterministic rules before a camera rolls or a canvas opens:

1. Strict mobile character band (`31` to `42` characters). Every Variant `A`, `B`, and `C` title stays inside `31` to `42` characters so mobile viewports render the full grammatical clause without clipping the subject or question mark.
2. Three-word uppercase thumbnail ceiling (`1` to `3` words, `<= 18` characters). Overlay stamps use `Newsreader` or `IBM Plex Mono` uppercase lettering capped at three words and eighteen characters so every letter stays legible on a `360 px` phone screen.
3. Zero stem and digit overlap. Within every single pair, normalized word stems (`>= 3` letters outside tiny function prepositions) and numeric digit stems shared between `title` and `thumbnail_text` equal zero. When `EP01-A` puts `$40.5T Debt` in the title, the thumbnail answers with `86% FROM WAGES` from Treasury Table 9 (`FL-004`, `FL-007`).
4. Dual-palette WCAG AAA contrast (`13.59:1`). Every thumbnail binds strictly to `cinema_schema_contract.json` tokens: `PAGE_PALETTE` pairs `#1C2B3A` Prussian navy ink on `#FAF8F3` milk cotton paper, while `OVER_FOOTAGE_PALETTE` pairs `#FAF8F3` warm paper lettering on `#1C2B3A` smoked-navy studio shadow, accented solely by `#A3402E` brick red or `#2F8F8B` solvent teal.
5. Primary-filing specificity over empty adjectives. Vague hype words, exclamation points, ellipses, em dashes, and `2021` through `2026` retro year stamps are banned across the vault.

## 2. Three-archetype A/B/C Test and Compare methodology

Swapping background colors on the same visual layout teaches nothing about audience psychology. Inside every episode block below, Variants `A`, `B`, and `C` form a one-to-one orthogonal rotation across three conceptual packaging archetypes and three `reading-room-cinema` visual composition modes.

| Axis dimension | Option 1 | Option 2 | Option 3 |
| :--- | :--- | :--- | :--- |
| `package_archetype` | `balance_sheet_paradox` (pits two verified macro or unit-cost numbers that cannot both hold through `2036`) | `household_stake_shock` (anchors the collision on a viewer's mortgage, checking account, degree, or job rung) | `forensic_document_anomaly` (leads with the exact statute, court order, SEC footnote, or federal advisory) |
| `visual_composition_mode` | `shirt_and_tie_plus_artifact` (`2` or `3` elements: 18-turning-28 host in matte shirt and tie holding one physical filing or prop) | `milk_page_data_split` (`2` elements: `#FAF8F3` two-column chart or balance scale with `#1C2B3A` ink) | `smoked_navy_forensic_closeup` (`2` elements: tight `#1C2B3A` dark-field crop of a primary statutory clause circled in `#A3402E` or `#2F8F8B`) |

### Live YouTube Studio Test and Compare execution protocol

1. Launch-hour upload (`T+0h`). Load Variant `A` (`working_title` locked in `slate_30_jan2028.json`) as the public title, and load the three distinct thumbnail renders corresponding to `shirt_and_tie_plus_artifact`, `milk_page_data_split`, and `smoked_navy_forensic_closeup` into YouTube Studio's native `Test & Compare` three-way thumbnail split.
2. Impression sample floor (`T+6h` to `T+24h`). Hold title copy constant while YouTube distributes randomized Browse impressions across the three visual compositions until the test reaches at least `15,000` Browse impressions or declares a `Watch-Time Share` leader above `38.0%`.
3. Winner lock and CTR rescue escalation (`T+24h`). When Variant `A` clears a `>= 5.5%` Browse CTR and `>= 45%` average percentage viewed, lock the winning thumbnail composition permanently. If Browse CTR sits below `4.5%` at `T+24h` while thirty-second hook retention holds above `70%` (`20_24hr_ctr_rescue_playbook.md`), promote Variant `B` as a synchronized title-and-thumbnail unit for hours `24` through `48`, reserving Variant `C` for the `T+48h` secondary pivot.
4. Evergreen catalog stability (`T+14d` through `2028`). Once an episode settles above channel-median `Watch-Time per Impression`, freeze its winning package so returning Browse cohorts recognize the visual anchor across playlist routing.

### Optical geometry, typography, and safe-zone lock (`1280 x 720` to `210 x 118` mobile)

Every thumbnail renders at `1280 x 720 px` (`16:9`, lossless PNG under `2 MB`) and passes a `210 x 118 px` phone-feed squint check (`tools/thumb_test_sheet.html`) before export:

| Composition mode | Left zone (`X: 64 to 620`) | Right zone (`X: 640 to 1216`) | Typography & safe-zone lock |
| :--- | :--- | :--- | :--- |
| `shirt_and_tie_plus_artifact` | Host chest-and-collar portrait in matte oxford shirt and semantic grenadine/wool tie, eyes locked at `Y: 230 to 255` | Physical cotton filing or scale prop angled `6 deg` beneath uppercase stamp in upper-right band (`Y: 90 to 280`) | `Newsreader` Bold (`96` to `116 px`, `-0.02em` tracking); keep `X: 1030 to 1280, Y: 620 to 720` empty for YouTube's duration pill |
| `milk_page_data_split` | `#FAF8F3` left column displaying the solvent or baseline series in `#2F8F8B` teal or `#1C2B3A` ink | `#FAF8F3` right column displaying the deficit, lag, or cost shock in `#A3402E` brick red | `IBM Plex Mono` SemiBold (`88` to `108 px`) for numeric stamps; `2 px` `#E1DED5` vertical rule separating halves |
| `smoked_navy_forensic_closeup` | Macro crop of the primary statute, court order, or `10-K` table angled `4 deg` over `#1C2B3A` shadow | High-contrast `#FAF8F3` stamp stacked in two lines beside a `6 px` `#A3402E` or `#2F8F8B` callout bracket | `Newsreader` Medium + `IBM Plex Mono` figures; zero `#1C2B3A` dark ink over dark backgrounds (`13.59:1` floor) |

## 3. Master 90-pair packaging vault (`EP01-A` through `EP30-C`)

### Episode 01 (`ep_01`): The Allowance

Target publish date: `2027-02-02` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-GEN-EXPLAINER` | Primary register: `milk-page-editorial` | Fact anchors: `FL-001`, `FL-002`, `FL-003`, `FL-004`, `FL-005`, `FL-006` (+39 more).

Test hypothesis: Tests whether cold Browse viewers click hardest on the macro $40.5T sovereign-debt paradox (Variant A), the household mortgage-versus-bond-interest squeeze (Variant B), or the Alaska statutory dividend veto exhibit (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP01-A` | `balance_sheet_paradox` | If AI Takes Jobs, Who Pays $40.5T Debt? | `39` | `86% FROM WAGES` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host in ecru oxford shirt and oxblood tie holding Treasury Table 9 with a brick-red circle on individual tax receipts. Pairs Silicon Valley's jobless-abundance forecast with the federal tax schedule showing human paychecks fund almost the entire government. |
| `EP01-B` | `household_stake_shock` | Can Robots Pay $2.14T in Bond Interest? | `39` | `FROZEN MORTGAGE` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Vertical split comparing falling software wage bars in teal against a flat brick-red residential loan schedule through 2055. Contrasts deflating white-collar labor income against thirty-year nominal housing obligations that never reset downward. |
| `EP01-C` | `forensic_document_anomaly` | Why 7.1% Corporate Tax Starves AI UBI | `37` | `VETOED CHECKS` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro crop of Alaska House Bill 256 showing the gubernatorial line-item slash cutting citizen dividend transfers in half. Exposes the enacted state precedent where an existing resource payout lost half its cash value once budget deficits opened. |

### Episode 02 (`ep_02`): The Captive Buyer

Target publish date: `2027-02-14` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-FISHER-ARTIFACT` | Primary register: `archival-light-table` | Fact anchors: `FL-007`, `FL-011`, `FL-012`, `FL-046`, `FL-047`, `FL-048` (+4 more).

Test hypothesis: Isolates whether click-through responds fastest to the open sovereign-buyer question (Variant A), the GENIUS Act zero-yield statutory clause (Variant B), or the direct Tokyo-to-US mortgage rate transmission (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP02-A` | `balance_sheet_paradox` | Who Buys America's $40T Debt Now? | `33` | `93 DAY BILLS` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host seated beside Treasury TIC Table 5 with a brick-red arrow linking retreating foreign bond rows to stablecoin reserve rules. Questions which domestic balance sheet replaces patient thirty-year foreign central banks with quarterly debt rollovers. |
| `EP02-B` | `forensic_document_anomaly` | How Congress Locked $200B Into T-Bills | `38` | `ZERO HOLDER YIELD` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Overhead close-up of Public Law 119-27 Section 4(a)(11) outlined in coral ink barring interest payouts to payment-token holders. Shows how federal statute turns private digital dollars into a captive buyer for short-dated government paper. |
| `EP02-C` | `household_stake_shock` | Japan's 4% Yield vs US Mortgage Rates | `37` | `TOKYO PULLS BACK` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Side-by-side chart contrasting rising thirty-year Japanese government bond yields in teal with unanchored domestic home-loan curves. Links a sovereign bond repricing across the Pacific directly to steeper long-term borrowing costs for American homebuyers. |

### Episode 03 (`ep_03`): The Six-Year Footnote

Target publish date: `2027-02-26` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-BOYLE-CHAPTERED` | Primary register: `smoked-navy-glass` | Fact anchors: `FL-017`, `FL-018`, `FL-019`, `FL-023`, `FL-053`, `FL-054` (+6 more).

Test hypothesis: Measures CTR across a forensic accounting-trick question (Variant A), the cash-flow-versus-GAAP-earnings divergence (Variant B), and retirement index exposure to off-balance-sheet GPU debt (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP03-A` | `forensic_document_anomaly` | Big Tech's $176B AI Profit Trick? | `33` | `3X CAPEX WEDGE` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Form 10-K Note 1 server equipment tables showing useful-life extensions circled in brick-red ink. Contrasts first-year tax-return write-offs for new chips against six-year income-statement schedules flattering stock multiples. |
| `EP03-B` | `balance_sheet_paradox` | Why $824B AI CapEx Drains Cash Flows | `36` | `PAPER EARNINGS` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split ledger comparing rising GAAP operating income bars in teal against Amazon's negative forty-two-billion cash bar in red. Reveals how trillion-dollar cloud platforms report smooth accounting profit in the exact quarters free cash turns negative. |
| `EP03-C` | `household_stake_shock` | CoreWeave's $66.2B GPU Debt Stack | `33` | `401K INDEX RISK` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in slate-chambray shirt holding CoreWeave's Form 10-Q lease schedule beside an eighteen-month silicon cadence chart. Connects special-purpose server borrowing directly to passive retirement accounts holding top-heavy mega-cap weights. |

### Episode 04 (`ep_04`): The Missing Rung

Target publish date: `2027-03-10` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-HMW-PRIMER` | Primary register: `milk-page-editorial` | Fact anchors: `FL-061`, `FL-016`, `FL-032`.

Test hypothesis: Compares generational career-ladder framing (Variant A) against the corporate management-pipeline paradox (Variant B) and postwar BLS labor-share primary data (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP04-A` | `household_stake_shock` | Why AI Erased the First Career Rung | `35` | `19% PAYROLL DROP` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host pointing a brass fountain pen at Stanford's ADP age-cohort chart with a brick-red bracket around ages twenty-two to twenty-five. Shows administrative payroll records proving automation cuts entry-level hires while leaving senior headcount flat. |
| `EP04-B` | `balance_sheet_paradox` | 19% Fewer Junior Hires: Who Leads Next? | `39` | `NO BENCH LEFT` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Two-tier corporate staffing diagram showing an intact senior tier in teal suspended over a hollowed entry base in brick red. Asks where firms find seasoned mid-level operators by 2033 after severing their own two-year apprenticeship track. |
| `EP04-C` | `forensic_document_anomaly` | US Labor Share Hit a 79-Year Low at 53% | `39` | `ADP COHORT DATA` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro crop of Bureau of Labor Statistics nonfarm output tables showing worker compensation sliding to its postwar floor. Places recent graduate hiring freezes inside an eight-decade macro shift from wages toward capital depreciation. |

### Episode 05 (`ep_05`): The PIK Toggle

Target publish date: `2027-03-22` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-GEN-EXPLAINER` | Primary register: `investigation-switchboard` | Fact anchors: `FL-062`, `FL-063`, `FL-034`.

Test hypothesis: Tests macro shadow-debt scale (Variant A) against the specific Form 10-Q PIK accrual mechanism (Variant B) and per-seat enterprise software loan vulnerability (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP05-A` | `balance_sheet_paradox` | The $2.5T Shadow Debt Behind AI SaaS | `36` | `88% IOU TOGGLES` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split schedule contrasting shrinking enterprise software seat counts in teal with ballooning PIK loan principal in brick red. Uncovers how private-credit software lenders mask cash shortfalls by folding unpaid interest back into loan principal. |
| `EP05-B` | `forensic_document_anomaly` | How 88% PIK Toggles Hide SaaS Defaults | `38` | `$500B SEAT LOANS` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of a Form 10-Q BDC Schedule of Investments with Payment-in-Kind accrual columns circled in coral ink. Isolates the exact filing column letting credit funds book paper income when software borrowers stop paying cash coupons. |
| `EP05-C` | `household_stake_shock` | Why $500B in Software Loans Need Seats | `38` | `6% DEFAULT RATE` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `3` | Host holding Fitch's Private Credit Default Monitor beside IMF stability tables marked with amber sweep bands. Warns retail interval-fund buyers and pension beneficiaries what breaks when lean APIs replace five hundred human licenses. |

### Episode 06 (`ep_06`): The Five-Dollar Exit

Target publish date: `2027-04-03` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-MAX-ESSAY` | Primary register: `blueprint-schematic` | Fact anchors: `FL-020`, `FL-021`, `FL-064`, `FL-065`.

Test hypothesis: Evaluates personal retirement-account urgency (Variant A) against the clean 5x Gabaix-Koijen price-multiplier ratio (Variant B) and $10.8T institutional crowding telemetry (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP06-A` | `household_stake_shock` | What Happens When 401(k)s Sell AI? | `34` | `5X EXIT DROP` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `3` | Host in navy grenadine tie beside the Quarterly Journal of Economics elasticity table with a brick-red downward arrow. Tests what happens to passive equity prices when white-collar layoffs flip automatic Friday retirement inflows negative. |
| `EP06-B` | `balance_sheet_paradox` | How $1 of Outflow Cuts $5 Off Stocks | `36` | `PASSIVE TRAP` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Mechanical balance beam on cream cotton stock showing one dollar coin tipping a five-dollar market-cap block downward. Visualizes Gabaix and Koijen's inelastic-market multiplier running in reverse as boomer withdrawals meet payroll cuts. |
| `EP06-C` | `forensic_document_anomaly` | Inside America's $10.8T Index Crowding | `38` | `TOP 92% WEALTH` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `2` | Close-up of Federal Reserve Distributional Financial Accounts tables contrasting top-decile equity concentration with median savers. Shows how thirty-six percent mega-cap index weights expose automatic target-date savers to synchronized drawdowns. |

### Episode 07 (`ep_07`): Authorized Loss

Target publish date: `2027-04-15` | Series: Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy | Strategy preset: `STR-AIC-SPECULATIVE` | Primary register: `restraint-vellum` | Fact anchors: `FL-066`, `FL-072`, `FL-034`.

Test hypothesis: Tests moral-outrage bank retention framing (Variant A) against the 1978 Regulation E statutory loophole (Variant B) and the stark $50-versus-100% consumer liability cliff (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP07-A` | `household_stake_shock` | Why Banks Keep Money Stolen by AI | `33` | `100% YOUR LOSS` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host holding printed Code of Federal Regulations 12 CFR 1005.6 with a brick-red underline beneath the sender-authorization rule. Explains why federal law caps hacked-password theft at fifty dollars yet leaves voice-cloned wire victims uncompensated. |
| `EP07-B` | `forensic_document_anomaly` | The 1978 Law Behind $12.5B Wire Scams | `37` | `CLONED VOICE` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro crop of Regulation E statutory definitions paired with an audio waveform spoofing a three-second family call clip. Exposes the statutory line treating real-time impersonation push transfers as voluntary customer instructions. |
| `EP07-C` | `balance_sheet_paradox` | $50 Hack Cap vs 100% Voice-Clone Loss | `37` | `NO BANK REFUND` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Two-column legal liability table contrasting stolen-password reimbursement in teal against authorized-push denial in red. Shows how typing a six-digit bank code during a spoofed escrow call forfeits every federal fraud shield. |

### Episode 08 (`ep_08`): Bits vs Watts

Target publish date: `2027-04-27` | Series: Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics | Strategy preset: `STR-MAX-ESSAY` | Primary register: `silver-gelatin-chronicle` | Fact anchors: `FL-038`, `FL-039`, `FL-040`, `FL-041`, `FL-042`, `FL-043` (+4 more).

Test hypothesis: Compares the bifurcated-inflation bits-versus-watts contrast (Variant A), household electric-bill shock from 5GW campuses (Variant B), and PJM's 833% auction table (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP08-A` | `balance_sheet_paradox` | Free AI Tokens vs 128-Week Grid Locks | `37` | `833% POWER JUMP` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split chart contrasting crashing API inference curves in teal against PJM wholesale capacity clearing bars in brick red. Pits near-zero digital token costs against three-year transformer backlogs pushing server power upgrades onto home meters. |
| `EP08-B` | `household_stake_shock` | Why 5GW Data Campuses Spike Power Bills | `39` | `3 YEAR BACKLOG` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `3` | Host in Prussian slate tie holding NERC's reliability map beside a heavy copper substation busbar on dark leather. Explains why sixty-percent-margin cloud buyers lock up nuclear reactors while homeowners amortize twenty-year grid upgrades. |
| `EP08-C` | `forensic_document_anomaly` | PJM's 833% Capacity Jump and 94GW Gap | `37` | `72% REFINED EAST` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `2` | Close-up of PJM's Base Residual Auction clearing schedule paired with IEA critical-mineral refining concentration bars. Traces residential electricity inflation back to grain-oriented electrical steel queues and Chinese chemical refining locks. |

### Episode 09 (`ep_09`): Patch Tuesday Dead

Target publish date: `2027-05-09` | Series: Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy | Strategy preset: `STR-FISHER-ARTIFACT` | Primary register: `investigation-switchboard` | Fact anchors: `FL-069`, `FL-070`, `FL-034`.

Test hypothesis: Tests attacker-versus-defender clock speed (Variant A) against UIUC's 87% one-day CVE benchmark (Variant B) and hospital ransomware exposure across 43-day patch queues (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP09-A` | `balance_sheet_paradox` | 15-Minute AI Hacks vs 43-Day Patches | `36` | `87% EXPLOIT RATE` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split timeline comparing a half-hour agent weaponization clock in brick red against Verizon's six-week remediation curve. Shows how monthly vendor security advisories become automated breach blueprints weeks before enterprise IT teams patch. |
| `EP09-B` | `forensic_document_anomaly` | How Agents Weaponize 87% of Public CVEs | `39` | `PATCH NOTES LEAK` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro shot of UIUC Table 1 benchmark rows contrasting autonomous exploit synthesis against zero-percent legacy scanners. Proves offensive software needs zero exotic unknown bugs once vendors publish plain-English vulnerability descriptions. |
| `EP09-C` | `household_stake_shock` | Why Hospitals Leave Bugs Open 43 Days | `37` | `1500X SLOWER IT` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `3` | Host holding CISA's Known Exploited Vulnerabilities directive beside Verizon's survival curve marked in amber ink. Explains why clinics and city portals delay critical updates for five weeks and how families lock their credit files first. |

### Episode 10 (`ep_10`): Zero-Inertia Banking

Target publish date: `2027-05-21` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-BOYLE-CHAPTERED` | Primary register: `milk-page-editorial` | Fact anchors: `FL-071`, `FL-072`, `FL-073`, `FL-051`.

Test hypothesis: Tests 60-second autonomous run velocity (Variant A) against FDIC's $4.04T zero-interest deposit subsidy (Variant B) and Nilson's $198B merchant card-fee tollbooth (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP10-A` | `household_stake_shock` | The 60-Second Autonomous Bank Run | `33` | `SLEEPY $4T CASH` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host seated with FDIC Quarterly Banking Profile Table III-A showing noninterest checking balances circled in brick red. Tests regional lender stability once fiduciary wallet agents sweep idle checking deposits into four-percent Treasury bills. |
| `EP10-B` | `balance_sheet_paradox` | Why Banks Rely on $4.04T at 0% Interest | `39` | `INSTANT SWEEPS` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Split ledger comparing zero-percent commercial checking yields in red against ninety-three-day Treasury bill yields in teal. Reveals the hundred-seventy-billion-dollar inertia subsidy propping up local banks only while depositors leave cash idle. |
| `EP10-C` | `forensic_document_anomaly` | How Wallet Bots Cut $198B in Card Fees | `38` | `DIRECT RAIL EXIT` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `2` | Macro crop of Nilson merchant-processing fee summaries paired with instant FedNow settlement routing diagrams. Shows how automated checkout agents bypass two-percent plastic swipe tolls over instant bank-to-bank settlement rails. |

### Episode 11 (`ep_11`): Non-Dischargeable

Target publish date: `2027-06-02` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-GEN-EXPLAINER` | Primary register: `smoked-navy-glass` | Fact anchors: `FL-074`, `FL-075`, `FL-061`.

Test hypothesis: Measures young-adult and parent click intent across the $1.8T wage-versus-debt clash (Variant A), NY Fed's 42.5% graduate underemployment print (Variant B), and Section 523(a)(8) statutory lock-in (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP11-A` | `balance_sheet_paradox` | AI Wages vs $1.8T in Student Debt | `33` | `NO BANKRUPTCY` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Title 11 Section 523(a)(8) statutory text barring standard court discharge on undergraduate loan balances. Pits shrinking entry-level white-collar salaries against the one consumer loan Congress shields from ordinary bankruptcy. |
| `EP11-B` | `household_stake_shock` | 42.5% Grad Underemployment vs Tuition | `37` | `LOCKED FOR LIFE` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `3` | Host in oxblood tie holding Federal Reserve G.19 credit tables beside New York Fed graduate occupational-match charts. Tests six-figure degree borrowing when more than two in five recent graduates work in roles needing no diploma. |
| `EP11-C` | `forensic_document_anomaly` | Why Section 523 Locks $1.81T of Loans | `37` | `PARENT PLUS TRAP` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Two-column repayment ledger contrasting capped federal income-driven plans in teal against uncapped family obligations in red. Maps how parent co-signers inherit unshielded compounding balances when junior coding and analyst seats contract. |

### Episode 12 (`ep_12`): Cognitive Debt

Target publish date: `2027-06-14` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-HMW-PRIMER` | Primary register: `archival-light-table` | Fact anchors: `FL-076`, `FL-077`, `FL-061`, `FL-015`.

Test hypothesis: Tests direct personal cognitive-cost framing (Variant A) against MIT Media Lab's 55% EEG neural connectivity drop (Variant B) and Microsoft-CMU's 936-workflow audit (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP12-A` | `household_stake_shock` | What AI Deskilling Costs Your Brain | `35` | `55% WEAKER LINK` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host holding MIT Media Lab thirty-two-electrode EEG connectivity maps contrasting unaided writers against copilot users. Quantifies the neurological coupling drop recorded when analysts outsource first-draft reasoning before building domain memory. |
| `EP12-B` | `forensic_document_anomaly` | MIT's 55% EEG Drop in Copilot Writers | `37` | `MEMORY FADED` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Dynamic Directed Transfer Function scalp diagrams comparing dense teal neural links with sparse red lines. Shows why crossover test subjects struggled to recall their own essays once model assistance was switched off. |
| `EP12-C` | `balance_sheet_paradox` | 936 Workflows Show How Prompts Dull QA | `38` | `VERIFIER PREMIUM` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Split chart from Microsoft and Carnegie Mellon regression tables linking high model confidence to falling error checks. Explains how future wage pricing power splits between interchangeable prompt operators and unaided domain verifiers. |

### Episode 13 (`ep_13`): Actuator Lock

Target publish date: `2027-06-26` | Series: Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics | Strategy preset: `STR-AOTP-LADDER` | Primary register: `blueprint-schematic` | Fact anchors: `FL-078`, `FL-068`, `FL-016`.

Test hypothesis: Evaluates supply-chain control curiosity (Variant A) against China's 72% midstream mineral lock (Variant B) and unit-level $16K robot teardown economics (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP13-A` | `balance_sheet_paradox` | Who Controls the $30K Humanoid Chain? | `37` | `63% BUILT EAST` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in slate-chambray shirt holding Morgan Stanley's Humanoid 100 teardown beside a steel planetary roller screw. Contrasts Western robot simulation software with the Asian actuator and magnet parks manufacturing physical joints. |
| `EP13-B` | `forensic_document_anomaly` | China's 72% Mineral Lock on US Robots | `37` | `MAGNET CHOKE` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Blueprint close-up of neodymium motor assemblies paired with IEA midstream chemical refining concentration bars. Traces why Western factories face double or triple hardware bills when scaling embodied automation behind tariff walls. |
| `EP13-C` | `household_stake_shock` | Inside a $16K Robot Bill of Materials | `37` | `ACTUATOR SHORTAGE` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Exploded mechanical cost breakdown comparing high-margin Western model weights in teal against Asian harmonic reducers in red. Maps where skilled mechatronics technicians and allied component makers capture tariff-insulated pricing power. |

### Episode 14 (`ep_14`): Shared Weights

Target publish date: `2027-07-08` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-FISHER-ARTIFACT` | Primary register: `geospatial-telemetry` | Fact anchors: `FL-079`, `FL-064`, `FL-065`.

Test hypothesis: Tests the vivid shared-brain Wall Street metaphor (Variant A) against official Financial Stability Board systemic warnings (Variant B) and retail stop-loss flash-crash mechanics (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP14-A` | `balance_sheet_paradox` | When Every Wall St Bot Shares One Brain | `39` | `80% AUTO VOLUME` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Financial Stability Board Section 3.2 concentration diagrams above an emptying SEC MIDAS order-book depth chart. Shows how foundation-model monoculture turns rival funds into a single synchronized seller during macro surprises. |
| `EP14-B` | `forensic_document_anomaly` | FSB's Warning on 80% Algorithmic Stocks | `39` | `EMPTY BID BOOK` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in navy grenadine tie holding the printed Financial Stability Board AI report marked with coral margin brackets. Explains why exchange circuit breakers pause single-minute drops without preventing multi-day correlated de-grossing. |
| `EP14-C` | `household_stake_shock` | How Shared Weights Hit $10.8T of 401(k)s | `40` | `STOP LOSS WIPEOUT` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split tick chart comparing limit-order discipline in teal against retail market stop-loss fills at trough ticks in red. Demonstrates why resting retail stop orders fill at the bottom of an algorithmic air pocket before bids return. |

### Episode 15 (`ep_15`): The Lithography Switch

Target publish date: `2027-07-20` | Series: Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics | Strategy preset: `STR-AIC-CLOCKED` | Primary register: `restraint-vellum` | Fact anchors: `FL-080`, `FL-081`, `FL-017`.

Test hypothesis: Compares geopolitical kill-switch intrigue (Variant A) against 90% single-island foundry concentration (Variant B) and the $10T household inflation shock of a Strait quarantine (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP15-A` | `forensic_document_anomaly` | Taiwan's 2nm Shield and ASML's Switch | `37` | `$10T GDP SHOCK` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host beside ASML Form 20-F EUV maintenance disclosures and SIA sub-five-nanometer wafer tables marked in brick red. Reveals why remotely disabling captured lithography scanners denies chips to an adversary while halting global industry too. |
| `EP15-B` | `balance_sheet_paradox` | 90% of Top AI Chips Sit on One Island | `37` | `REMOTE EUV LOCK` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Split wafer map comparing Arizona Fab 21 phases in teal against Hsinchu and Tainan leading-edge packaging volume in red. Tests domestic foundry subsidies against capacity schedules keeping advanced CoWoS packaging concentrated across the Strait. |
| `EP15-C` | `household_stake_shock` | What a $10T Strait Quarantine Costs You | `39` | `90% WAFER FREEZE` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Geospatial shipping chart of the Taiwan Strait paired with Bloomberg Economics first-year global GDP loss schedules. Traces how customs inspections without a single missile strike reprice vehicles, medical hardware, and retirement funds. |

### Episode 16 (`ep_16`): The Broken Factory Ladder

Target publish date: `2027-08-01` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-BOYLE-CHAPTERED` | Primary register: `silver-gelatin-chronicle` | Fact anchors: `FL-082`, `FL-083`, `FL-078`, `FL-034`.

Test hypothesis: Tests $3-per-hour robot wage substitution (Variant A) against IMF 40% exposure data (Variant B) and Dani Rodrik's 60%-earlier premature deindustrialization curves (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP16-A` | `balance_sheet_paradox` | How $3/Hr Robots Break Poor Nations | `35` | `EXPORT LADDER CUT` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split chart of Dani Rodrik's manufacturing curves showing post-1990 developing nations peaking sixty percent lower. Shows how three-dollar factory arms and voice agents sever garment assembly and call-center dollar inflows together. |
| `EP16-B` | `forensic_document_anomaly` | IMF Data: 40% Global Job Exposure Gap | `37` | `DOLLAR SHORTAGE` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro crop of IMF Staff Discussion Note occupational tables beside emerging-market external sovereign debt schedules. Explains why low domestic farm automation offers zero buffer when Western buyers cancel offshore service contracts. |
| `EP16-C` | `household_stake_shock` | Why Emerging Factories Peak 60% Sooner | `38` | `CALL CENTERS GONE` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in forest grenadine tie holding NBER Working Paper 20935 beside remittance-dependent sovereign bond tables. Equips savers to separate vulnerable labor-arbitrage sovereign bonds from solvent copper and critical-mineral exporters. |

### Episode 17 (`ep_17`): The Escrow Trap

Target publish date: `2027-08-13` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-GEN-EXPLAINER` | Primary register: `milk-page-editorial` | Fact anchors: `FL-084`, `FL-009`, `FL-014`.

Test hypothesis: Isolates homeowner CTR across aerial satellite roof drops (Variant A), the 29-year loan-versus-policy maturity mismatch (Variant B), and California FAIR Plan's 29.1% surge (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP17-A` | `household_stake_shock` | AI Satellite Drops vs 30-Year Mortgages | `39` | `12 MONTH POLICY` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host holding Fannie Mae hazard-insurance default clauses beside aerial roof-scoring grids stamped with red non-renewal marks. Uncovers the quiet contract mismatch binding thirty-year mortgages to property policies repriced every twelve months. |
| `EP17-B` | `balance_sheet_paradox` | The 29-Year Trap in $13.4T of Home Debt | `39` | `ESCROW SURGE` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Split monthly housing bar showing flat principal-and-interest in teal overwhelmed by spiking force-placed coverage in red. Demonstrates how forward catastrophe models break fixed monthly housing budgets without a single central-bank rate hike. |
| `EP17-C` | `forensic_document_anomaly` | Why Last-Resort Roof Plans Jumped 29.1% | `39` | `$600B STATE POOL` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of California FAIR Plan operational exposure tables circled in coral ink alongside parcel brush-clearance scores. Shows homebuyers how to run seven-year loss-history checks before signing onto an uninsurable parcel at closing. |

### Episode 18 (`ep_18`): Zero Privilege

Target publish date: `2027-08-25` | Series: Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy | Strategy preset: `STR-MAX-ESSAY` | Primary register: `smoked-navy-glass` | Fact anchors: `FL-085`, `FL-086`, `FL-044`.

Test hypothesis: Tests courtroom-betrayal framing (Variant A) against 120-minute daily companion usage telemetry (Variant B) and Federal Rule of Evidence 501 privilege waiver law (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP18-A` | `household_stake_shock` | Your AI Companion Testifies in Court | `36` | `ZERO PRIVILEGE` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Federal Rule of Evidence 501 paired with a civil subpoena stamp across exported cloud companion chat logs. Warns users that therapy-style chatbots carry zero legal confidentiality when civil or criminal litigators subpoena servers. |
| `EP18-B` | `balance_sheet_paradox` | 120 Minutes a Day With Subpoenaed Bots | `38` | `DISCOVERABLE LOGS` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Two-column evidentiary chart contrasting protected doctor-and-lawyer privilege in teal against cloud terms of service in red. Contrasts seven hundred annual hours of private user disclosures with corporate retention models built to monetize engagement. |
| `EP18-C` | `forensic_document_anomaly` | Rule 501: Why Chatbot Logs Waive Rights | `39` | `DESIGN DEFECT LAW` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `3` | Host holding the federal district court order in Garcia v. Character Technologies marked with amber and coral brackets. Connects federal product-liability rulings on sycophantic retention tuning to air-gapped local privacy habits. |

### Episode 19 (`ep_19`): The Attrition Ledger

Target publish date: `2027-09-06` | Series: Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics | Strategy preset: `STR-AIC-SPECULATIVE` | Primary register: `geospatial-telemetry` | Fact anchors: `FL-087`, `FL-012`, `FL-007`.

Test hypothesis: Compares $20K-versus-$1T defense asymmetry (Variant A) against unit-level $4M missile procurement ledgers (Variant B) and federal bond interest surpassing Pentagon outlays (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP19-A` | `balance_sheet_paradox` | $20K Drones vs America's $1T Defense | `36` | `$4M PER MISSILE` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Unit-cost balance scale contrasting one four-million-dollar naval interceptor bar in red against cheap swarm airframes in teal. Exposes the procurement math forcing Western navies to expend multi-million-dollar rockets on twenty-thousand-dollar drones. |
| `EP19-B` | `forensic_document_anomaly` | Firing $4M Missiles at $20K Airframes | `37` | `96 LAUNCH CELLS` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Pentagon Missile Procurement Justification Book unit-cost rows beside a destroyer vertical-launch magazine diagram. Shows how finite shipboard missile cells and multi-year solid-rocket lead times turn naval deterrence into factory math. |
| `EP19-C` | `household_stake_shock` | $1.05T Debt Interest Beats Pentagon Pay | `39` | `CARGO WAR TARIFF` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in navy tie holding Treasury Table 9 Function 900 interest rows beside CRS Red Sea maritime war-risk schedules. Links sovereign bond coupon outlays and sea-lane insurance surcharges directly to household fuel and goods inflation. |

### Episode 20 (`ep_20`): The Silent Freeze

Target publish date: `2027-09-18` | Series: Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy | Strategy preset: `STR-HMW-PRIMER` | Primary register: `blueprint-schematic` | Fact anchors: `FL-088`, `FL-072`, `FL-066`.

Test hypothesis: Tests debanking scale (Variant A) against the 31 U.S.C. 5318(g)(2) criminal gag statute (Variant B) and daily automated compliance flag volume with zero customer appeal (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP20-A` | `household_stake_shock` | Why AI Froze 4.6M US Bank Accounts | `34` | `FEDERAL GAG LAW` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `3` | Host holding printed Title 31 Section 5318(g)(2) statutory gag provisions beside FinCEN annual suspicious-activity tables. Explains why federal law makes it a crime for bank staff to tell locked-out depositors an algorithm flagged their account. |
| `EP20-B` | `forensic_document_anomaly` | The Criminal Gag Law Behind 4.8M SARs | `37` | `SILENT CLOSURE` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro crop of Bank Secrecy Act confidentiality clauses paired with CFPB checking-account termination complaint dockets. Reveals the regulatory fine asymmetry punishing banks billions for missed flags while charging zero for false closures. |
| `EP20-C` | `balance_sheet_paradox` | 12,877 Daily Bank Flags and Zero Appeal | `39` | `SPLIT PAYROLL` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Diagram comparing a single frozen checking node in red against a dual-charter paycheck routing architecture in teal. Shows freelancers and households how to structure two independent banking charters so rent clears during a compliance freeze. |

### Episode 21 (`ep_21`): The Liar's Dividend

Target publish date: `2027-09-30` | Series: Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy | Strategy preset: `STR-FISHER-ARTIFACT` | Primary register: `archival-light-table` | Fact anchors: `FL-089`, `FL-090`, `FL-066`, `FL-098`.

Test hypothesis: Evaluates Chesney and Citron's named legal doctrine (Variant A) against the $50K household dashcam authentication bill (Variant B) and the stalled Federal Rule 707 docket (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP21-A` | `forensic_document_anomaly` | The Liar's Dividend in AI Courtrooms | `36` | `REAL VIDEO DENIED` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host holding Judge Pennypacker's Santa Clara discovery order alongside the pulled Federal Rule of Evidence 707 docket. Inverts conventional deepfake fears by showing how synthetic media lets corporate defendants dismiss genuine recordings. |
| `EP21-B` | `household_stake_shock` | When Real Dashcam Proof Costs $50K | `34` | `RULE 707 STALLED` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Split litigation ledger contrasting smartphone video capture in teal against five-figure expert authentication bills in red. Demonstrates how well-funded litigants multiply pre-trial forensic motions until individual plaintiffs drop valid claims. |
| `EP21-C` | `balance_sheet_paradox` | Why Federal Judges Pulled Back Rule 707 | `39` | `SIGNED METADATA` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `2` | Macro crop of Judicial Conference Evidence Advisory Committee minutes paired with cryptographic C2PA camera hash headers. Equips drivers and tenants with original-file preservation habits that survive courtroom authenticity challenges. |

### Episode 22 (`ep_22`): Tacit Collusion

Target publish date: `2027-10-12` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-GEN-EXPLAINER` | Primary register: `investigation-switchboard` | Fact anchors: `FL-091`, `FL-009`, `FL-073`.

Test hypothesis: Tests antitrust cartel framing (Variant A) against direct renter lease-coordination stakes (Variant B) and FTC Section 6(b) surveillance checkout pricing orders (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP22-A` | `forensic_document_anomaly` | Can an AI Price Cartel Break the Law? | `37` | `SHARED RENT POOL` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of the DOJ Antitrust Division complaint in United States v. RealPage mapping hub-and-spoke lease data flows. Tests century-old Sherman Act conspiracy rules when rival landlords feed confidential renewal data into one shared model. |
| `EP22-B` | `household_stake_shock` | How 1 Shared Algorithm Hikes Your Rent | `38` | `NO SMOKE ROOMS` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host seated beside FTC Section 6(b) surveillance-pricing orders and an annotated residential lease-renewal notice. Shows apartment renters how shared revenue algorithms tolerate higher vacancies to hold coordinated monthly markups. |
| `EP22-C` | `balance_sheet_paradox` | FTC 6(b) Orders on Dynamic Checkout Pay | `39` | `BROWSER PROFILED` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Side-by-side checkout comparison showing two different travel quotes generated from cookie-tracked browser profiles. Separates lawful public-inventory pricing from individualized willingness-to-pay extraction across logged-in shopping rails. |

### Episode 23 (`ep_23`): Petrodollar Compute

Target publish date: `2027-10-24` | Series: Series 02: AI Bubble, Corporate Accounting & Wall Street Math | Strategy preset: `STR-BOYLE-CHAPTERED` | Primary register: `milk-page-editorial` | Fact anchors: `FL-092`, `FL-017`, `FL-018`.

Test hypothesis: Measures CTR across sovereign oil-fund ownership of US compute (Variant A), the $100B debt-and-equity syndicate structure (Variant B), and Big Tech cash-flow exhaustion (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP23-A` | `balance_sheet_paradox` | Why $6T Oil Funds Own US AI Compute | `35` | `$100B DEAL STACK` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `3` | Host holding the AI Infrastructure Partnership joint formation filing beside Global SWF sovereign asset schedules. Explains why cash-burning cloud giants turned to Abu Dhabi and Riyadh surpluses to bankroll five-gigawatt campuses. |
| `EP23-B` | `forensic_document_anomaly` | Inside the $100B Gulf GPU Debt Syndicate | `40` | `CRUDE TO CLUSTERS` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `2` | Macro crop of US Bureau of Industry and Security GPU export-license covenants beside thirty-billion-dollar JV equity tables. Maps the security covenants Washington attaches when Gulf sovereign funds co-own frontier compute clusters. |
| `EP23-C` | `household_stake_shock` | Why $824B Cloud CapEx Needs Gulf Equity | `39` | `NEGATIVE FCF` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split cash-flow bridge contrasting negative quarterly free-cash bars in red against sovereign project-finance inflows in teal. Shows index shareholders how ring-fenced sovereign joint ventures split parent claims on future datacenter cash flows. |

### Episode 24 (`ep_24`): Living Off the Land

Target publish date: `2027-11-05` | Series: Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics | Strategy preset: `STR-AOTP-LADDER` | Primary register: `silver-gelatin-chronicle` | Fact anchors: `FL-093`, `FL-067`, `FL-070`.

Test hypothesis: Tests five-year silent grid persistence (Variant A) against the 1994 CALEA statutory wiretap backdoor irony (Variant B) and CISA's consumer SMS-2FA warning (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP24-A` | `forensic_document_anomaly` | 5 Years Inside America's Power Grid | `35` | `ADMIN CREDENTIALS` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Joint CISA Advisory AA24-038A documenting five-year living-off-the-land router persistence in brick-red ink. Reveals how state operators dwelled inside legitimate municipal utility commands for half a decade without custom malware. |
| `EP24-B` | `balance_sheet_paradox` | How 1994 Wiretap Law Let Hackers In | `35` | `CARRIER BACKDOOR` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Architectural network split contrasting CALEA-mandated telecom intercept switches in red with end-to-end encrypted pipes in teal. Proves statutory wiretap portals built for domestic policing eventually function as master keys for foreign intelligence. |
| `EP24-C` | `household_stake_shock` | Why CISA Warned Against Text 2FA Logins | `39` | `HARDWARE KEYS` | `2` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in slate wool tie holding Title 47 Section 1002 beside a physical FIDO2 security key on dark walnut leather. Translates carrier switching breaches into immediate household upgrades across hardware passkeys and backup water stores. |

### Episode 25 (`ep_25`): Water and Rock

Target publish date: `2027-11-17` | Series: Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics | Strategy preset: `STR-AIC-SPECULATIVE` | Primary register: `geospatial-telemetry` | Fact anchors: `FL-094`, `FL-095`, `FL-039`.

Test hypothesis: Compares the cooling-water-versus-fertilizer resource clash (Variant A), 33B-gallon Sunbelt municipal water bills (Variant B), and Morocco's 70% phosphate rock reserve lock (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP25-A` | `balance_sheet_paradox` | AI Cooling Water vs Global Fertilizer | `37` | `70% ONE NATION` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Split resource ledger pitting utility-scale LFP battery packs in teal against agricultural crop-nutrient tonnage in red. Connects datacenter grid-storage chemistry directly to the single North African country holding most global phosphate. |
| `EP25-B` | `household_stake_shock` | 33B Gallons: Sunbelt Server Water Bills | `39` | `DROUGHT TARIFFS` | `2` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `3` | Host holding Lawrence Berkeley National Laboratory Report 2001637 beside arid municipal water-tier surcharge schedules. Shows Sunbelt homebuyers why closed-loop dry chillers push evaporative water demand onto regional power-plant cooling towers. |
| `EP25-C` | `forensic_document_anomaly` | Morocco's 70% Lock on Battery Phosphate | `39` | `FOOD OR STORAGE` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro crop of USGS Mineral Commodity Summaries showing fifty billion metric tons of Moroccan rock reserves circled in coral. Exposes the geological bottleneck forcing stationary grid batteries to bid against grocery supply chains for phosphoric acid. |

### Episode 26 (`ep_26`): The Inverted Pyramid

Target publish date: `2027-11-29` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-GEN-EXPLAINER` | Primary register: `smoked-navy-glass` | Fact anchors: `FL-096`, `FL-102`, `FL-078`.

Test hypothesis: Tests South Korea's 0.72 fertility-versus-robots paradox (Variant A) against 26 U.S.C. 3101's zero-percent robot payroll levy (Variant B) and 65% generational cohort shrinkage (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP26-A` | `balance_sheet_paradox` | 0.72 Birth Rates vs Untaxed Robots | `34` | `PENSION DEFICIT` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Inverted demographic pyramid from Statistics Korea paired with a brick-red zero-dollar payroll-tax line for factory machines. Proves humanoid workers can replace missing hospital and factory hands physically while starving wage-funded retiree pools. |
| `EP26-B` | `forensic_document_anomaly` | Why Robots Pay 0% Into National Pensions | `40` | `SHRINKING COHORT` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Title 26 Sections 3101 and 3111 restricting social-insurance contributions strictly to covered human wages. Isolates the statutory tax-code gap leaving a shrinking young workforce to fund elderly care and bond coupons alone. |
| `EP26-C` | `household_stake_shock` | 65% Smaller Cohorts: Who Funds Retirees? | `40` | `LATER EXIT AGE` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in oxblood tie holding KOSTAT vital-statistics tables beside OECD statutory retirement-age schedules. Shows workers under thirty-five why portable global equity beats single-city housing in rapidly shrinking tax bases. |

### Episode 27 (`ep_27`): Subsea Sovereignty

Target publish date: `2027-12-11` | Series: Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics | Strategy preset: `STR-FISHER-ARTIFACT` | Primary register: `investigation-switchboard` | Fact anchors: `FL-097`, `FL-039`, `FL-068`.

Test hypothesis: Evaluates Big Tech's 75% subsea bandwidth ownership (Variant A) against physical 550-cable seafloor vulnerability (Variant B) and the <1% satellite terabit ceiling (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP27-A` | `balance_sheet_paradox` | Big Tech Owns 75% of Subsea Cables | `34` | `99% SEAFLOOR DATA` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `3` | Host holding TeleGeography's Submarine Cable Map beside a physical cross-section of armored undersea optical fiber. Replaces the weightless cloud myth with four US tech firms controlling three-quarters of transoceanic glass trunks. |
| `EP27-B` | `forensic_document_anomaly` | 550 Seafloor Fibers Carry 99% of Data | `37` | `PRIVATE TOLLBOOTH` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of FCC Team Telecom landing-license dockets paired with bifurcated Red Sea and Luzon Strait cable maps. Traces how rival subsea funding blocs and repair-ship backlogs split global internet routing into two walled supergrids. |
| `EP27-C` | `household_stake_shock` | Why Orbit Lasers Replace <1% of Fiber | `37` | `ANCHOR DRAG RISK` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Throughput bar chart contrasting satellite terabit ceilings in teal against multi-hundred-terabit seabed trunks in brick red. Proves orbital constellations cannot carry interbank clearing or cloud replication when shallow-water anchors sever cables. |

### Episode 28 (`ep_28`): Proof of Personhood

Target publish date: `2027-12-23` | Series: Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy | Strategy preset: `STR-HMW-PRIMER` | Primary register: `blueprint-schematic` | Fact anchors: `FL-098`, `FL-099`, `FL-037`.

Test hypothesis: Tests Imperva's 53% majority-bot web milestone (Variant A) against EU eIDAS 2.0's 27-nation statutory rollout (Variant B) and cryptographic zero-knowledge privacy protection (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP28-A` | `balance_sheet_paradox` | 53% Bot Traffic and Mandatory Web IDs | `37` | `PROVE HUMANITY` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `2` | Split traffic chart showing automated requests crossing half the web in brick red beside a state wallet login prompt. Connects the economic failure of CAPTCHAs and anonymous sign-ups directly to sovereign digital-identity mandates. |
| `EP28-B` | `forensic_document_anomaly` | Inside Europe's 27-Nation Wallet Mandate | `40` | `REVOCABLE LOGIN` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Macro crop of Official Journal Articles 5a and 5f compelling major online platforms to accept state identity wallets. Examines how voluntary statutory wallets become de facto keys to banking and speech once platforms degrade unverified accounts. |
| `EP28-C` | `household_stake_shock` | When 37% Bad Bots Break Password Logins | `39` | `ZERO KNOWLEDGE ID` | `3` | `shirt_and_tie_plus_artifact` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `3` | Host in Prussian slate tie holding Imperva's bot report beside a hardware FIDO2 key and selective-disclosure wallet spec. Separates linkable state-ID tracking from local zero-knowledge proofs that verify personhood without issuer telemetry. |

### Episode 29 (`ep_29`): Harvest Now

Target publish date: `2028-01-04` | Series: Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy | Strategy preset: `STR-BOYLE-CHAPTERED` | Primary register: `archival-light-table` | Fact anchors: `FL-100`, `FL-070`, `FL-072`.

Test hypothesis: Compares the federal 2030 decryption cliff (Variant A) against NIST's RSA-2048 deprecation mandate on legacy banks (Variant B) and personal Harvest-Now-Decrypt-Later TLS risk (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP29-A` | `forensic_document_anomaly` | The 2030 Quantum Decryption Cliff | `33` | `HARVESTED TRAFFIC` | `2` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host holding NIST IR 8547 and White House Directive M-26-15 with a brick-red circle on the December 2030 deprecation line. Explains why intelligence archives intercept encrypted medical and tax files years before fault-tolerant quantum hardware arrives. |
| `EP29-B` | `balance_sheet_paradox` | Why NIST Kills RSA-2048 Keys by Dec 2030 | `40` | `BANKING OVERHAUL` | `2` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#2F8F8B`) | `2` | Close-up of FIPS 203 lattice-key schedules contrasted against forty-three-day enterprise vulnerability patching lags. Measures the multi-billion-dollar cryptographic migration colliding with legacy bank hardware-security-module upgrades. |
| `EP29-C` | `household_stake_shock` | Harvest Now: Why AES-256 Saves Your Data | `40` | `POST QUANTUM KEY` | `3` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Split cipher table separating vulnerable elliptic-curve web sessions in red from symmetric AES-256 local archives in teal. Shows households which thirty-year genomic, estate, and tax files require local encryption and hybrid post-quantum browsers. |

### Episode 30 (`ep_30`): The 2032 Cut Clock

Target publish date: `2028-01-16` | Series: Series 01: AI Economy, National Debt & Your Money (2027-2036) | Strategy preset: `STR-AIC-CLOCKED` | Primary register: `restraint-vellum` | Fact anchors: `FL-101`, `FL-102`, `FL-007`, `FL-011`, `FL-001`, `FL-016`.

Test hypothesis: Tests the Q4 2032 Social Security countdown clock (Variant A) against the Antideficiency Act automatic-cut mechanism (Variant B) and the 12.4%-versus-0% FICA compute tax split (Variant C).

| Pair ID | Archetype | Locked title (`31..42` chars) | Chars | Thumbnail stamp (`<=18c`) | Words | Composition & palette (`13.59:1`) | Els | Focal subject & curiosity gap |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- | :---: | :--- |
| `EP30-A` | `household_stake_shock` | The 2032 Social Security Cut Clock | `34` | `TRUST FUND EMPTY` | `3` | `shirt_and_tie_plus_artifact` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#A3402E`) | `3` | Host holding Social Security Trustees Table II.D1 beside Episode 01's annotated Treasury Table 9 on cream cotton paper. Places the exact statutory exhaustion date on the desk where shrinking W-2 payrolls trigger automatic benefit reductions. |
| `EP30-B` | `forensic_document_anomaly` | Why OASI Reserves Trigger a 26% Law Cut | `39` | `NO BORROWING RULE` | `3` | `smoked_navy_forensic_closeup` (`OVER_FOOTAGE_PALETTE`, bg `#1C2B3A`, text `#FAF8F3`, accent `#A3402E`) | `2` | Close-up of Antideficiency Act Title 31 Section 1341 barring trust-fund deficit payouts once reserves reach zero. Explains why federal law forbids Social Security from borrowing on its own unless Congress enacts new taxes or debt. |
| `EP30-C` | `balance_sheet_paradox` | 12.4% Wage Tax vs 0% Tax on GPU Clusters | `40` | `PAYROLL CLIFF` | `2` | `milk_page_data_split` (`PAGE_PALETTE`, bg `#FAF8F3`, text `#1C2B3A`, accent `#2F8F8B`) | `2` | Season-closing ledger contrasting FICA-taxed worker paychecks in teal against untaxed datacenter depreciation in brick red. Closes the thirty-episode arc by testing every Congressional rescue bill against two-trillion-dollar annual bond interest. |

## 4. Programmatic verification summary across all 90 pairs

| Verification invariant | Target bound | Audited vault result |
| :--- | :--- | :--- |
| Total flagship episodes aligned to `slate_30_jan2028.json` | `30` episodes (`ep_01` to `ep_30`) | `30 / 30` matched |
| Total title-and-thumbnail pairs (`A`, `B`, `C` per episode) | `90` unique pairs (`EP01-A` to `EP30-C`) | `90 / 90` unique |
| Variant `A` `working_title` preservation | Exact match to `slate_30_jan2028.json` | `30 / 30` exact |
| Title character length band | `31 <= len(title) <= 42` | `90 / 90` (`33` to `40` chars) |
| Thumbnail word count & character ceiling | `1` to `3` uppercase words, `<= 18` chars | `90 / 90` (`2` to `3` words, `12` to `17` chars) |
| Title-thumbnail word-stem & digit-stem overlap | `0` shared stems or numeric digits | `0` collisions across all `90` pairs |
| Intra-episode archetype & composition orthogonality | `3` distinct archetypes + `3` distinct modes per episode | `30 / 30` orthogonal |
| Dual-palette WCAG 2.1 relative luminance contrast | `>= 12.0:1` (`#FAF8F3` vs `#1C2B3A`) | `13.59:1` across all `90` pairs |
| Anti-AI gate (`anti_ai_script_gate.mjs --mode prose`) | `GATE: PASS (score = 0)` | `PASS (score = 0)` |
| Staleness scorer (`staleness_audit.py --strict`) | `PASS (score = 0, IMMUNE)` | `PASS (score = 0)` |
