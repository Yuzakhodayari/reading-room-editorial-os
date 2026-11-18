# Deliverable 08: Primary institutional source directory

Secondary journalism, viral social charts, and sell-side slide decks never qualify as citations inside *The Reading Room Editorial OS*. A reporter summarizing a government release frequently mixes fiscal years with calendar years, confuses gross Treasury interest with net interest outlays, or treats custodial bond centers in Belgium and the Cayman Islands as beneficial sovereign buyers. One sloppy denominator in Act II gives institutional viewers a reason to click off and discredits the household warnings in Act IV.

Every quantitative claim across our thirty-episode slate through January 2028 traces back to an original statutory filing, central-bank release, regulatory docket, or physical grid schedule. Stage 1 of the six-stage script pipeline opens with downloading the raw CSV, XBRL JSON, or PDF table directly from the issuing institution, logging its SHA-256 hash inside `02_research_and_data/data/fact_ledger.json`, and binding any volatile metric to a `[LIVE_STAT_SLOT]` token refreshed within seventy-two hours of recording. Machine-readable metadata for every dataset in this manual lives inside `02_research_and_data/data/institutional_sources_registry.json` so `analyze_datasets.py` and `staleness_audit.py` can query endpoints programmatically.

## 1. Evidence tiers and Stage 1 verification rules

Research dossiers rank incoming evidence across four strict tiers before a single line of spoken narration is drafted.

1. Tier A covers audited statutory and sovereign ledgers: US Treasury accounting statements, Congressional Budget Office baselines, Social Security and Medicare Trustees reports, SEC EDGAR `10-K`, `10-Q`, and `8-K` filings, federal and state appellate opinions, and mandatory wholesale electricity auction results. Tier A sources carry standalone authority in every act of a script.
2. Tier B covers official statistical series, supervisory banking aggregates, and federal technical standards: Federal Reserve `Z.1`, `DFA`, `SCF`, and `G.19` releases, NY Fed Equifax credit panels, FDIC Quarterly Banking Profiles, BLS productivity indexes, USGS mineral balances, NIST cryptographic standards, CISA Known Exploited Vulnerabilities feeds, and FinCEN Suspicious Activity Report aggregates. Tier B sources anchor Act II and Act III collisions whenever paired with exact series codes and vintage dates.
3. Tier C covers multilateral compendia and primary incident-response telemetry: Bank for International Settlements banking tables, IMF World Economic Outlook databases, International Energy Agency load models, TeleGeography subsea cable registries, Lloyd's Joint War Committee circulars, Verizon DBIR breach tallies, and Mandiant M-Trends dwell-time medians. Scripts name the institution and methodology explicitly whenever citing Tier C projections.
4. Tier D covers press articles, corporate blog posts, executive interviews, podcast quotes, and Wall Street research notes. Tier D material can document what a public figure promised on a specific date, such as Elon Musk's October 29, 2026 X post or Sam Altman's May 2024 Universal Basic Compute pitch in Episode 01, yet it never proves an economic, physical, or legal fact on its own.

Three operational rules govern every pull from this directory:

1. Record both the observation period and the publication vintage, because BLS productivity series, BEA national accounts, and Treasury TIC tables undergo scheduled benchmark revisions months after initial release.
2. Crop visual evidence for `reading-room-cinema` directly from the official PDF table or raw XBRL statement onto the `#FAF8F3` milk canvas so viewers can read the exact line title, table number, and unit header (`$ in millions` versus `$ in billions`).
3. Verify accounting basis before comparing two agencies. Treasury Monthly Treasury Statements track cash receipts and outlays inside federal fiscal years (`October 1` through `September 30`), whereas SEC corporate filings follow company-specific fiscal calendars on an accrual GAAP basis.

## 2. US Treasury Fiscal Data ledgers

All sovereign cash-flow, public-debt, and foreign-creditor audits begin at the Bureau of the Fiscal Service (`fiscaldata.treasury.gov`) and the Office of International Affairs (`ticdata.treasury.gov`).

| Dataset and exact table | Primary URL and REST endpoint | Release schedule | Core series and fields |
|---|---|---|---|
| Monthly Treasury Statement (`MTS`), Table 9 (`Summary of Receipts by Source, and Outlays by Function`) | `https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/` API: `v1/accounting/mts/mts_table_9` | 8th business day of each month at `14:00 ET` (`September` issue in mid-October locks full `FY` totals) | Receipts: `Individual Income Taxes`, `Social Insurance and Retirement Receipts`, `Corporation Income Taxes`. Outlays: `Net Interest` (Function 900), `National Defense` (Function 050), `Social Security` (Function 650) |
| Debt to the Penny (`Daily Public Debt Outstanding`) | `https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny` API: `v2/accounting/od/debt_to_penny` | Every federal business day around `15:30 ET` covering the prior business day | `tot_pub_debt_out_amt` (Total Gross Debt), `debt_held_public_amt` (Marketable bills, notes, bonds, TIPS, FRNs), `intragov_hold_amt` (Trust-fund Government Account Series) |
| Treasury International Capital (`TIC`), Major Foreign Holders (`MFH` Table 5 & `SHLA` Annual Survey) | `https://ticdata.treasury.gov/resource-center/data-chart-center/tic/Documents/slt_table5.html` | Monthly around the `16th` at `16:00 ET` (`2-month` lag); `SHLA` benchmark every `April/June` | Country-level holdings of marketable long-term and short-term US Treasury securities (`Japan`, `UK`, `China`, `Cayman Islands`, `Belgium`, `Luxembourg`) |

### Monthly Treasury Statement (`MTS` Table 9) lookup protocol and traps

Episode 01 (*The Allowance*) anchors its fiscal collision inside `MTS Table 9`. Combining `Individual Income Taxes` with `Social Insurance and Retirement Receipts` (FICA Old-Age, Survivors, and Disability Insurance plus Hospital Insurance withheld from paychecks) shows regular workers and individual filers supplying `84.1 percent` of federal cash receipts in fiscal 2024 and passing `86 percent` in fiscal 2026. Over that same span, `Corporation Income Taxes` fell from `10.8 percent` down to `7.1 percent` after Congress permanently restored `100 percent` first-year bonus depreciation and domestic Section 174 R&D expensing in July 2025. Further down `Table 9`, `Net Interest` (`Function 900`) crossed `$1.0 trillion` in fiscal 2026, overtaking `National Defense` (`Function 050`).

Pull machine-verified `Table 9` rows directly from the Fiscal Service REST endpoint without API keys:

```text
GET https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_9?filter=record_date:gte:2024-09-30&page[size]=500
Fields: record_date, classification_desc, current_month_rcpt_outly_amt, current_fytd_rcpt_outly_amt, prior_fytd_rcpt_outly_amt
```

Watch three traps whenever pulling `MTS` numbers:

1. Never compare a single corporate installment month (`April`, `June`, `September`, `December`) against a non-installment month (`May` or `August`) to claim corporate taxes surged or collapsed. Always pull `current_fytd_rcpt_outly_amt` in the `September` fiscal year-end statement or sum rolling twelve-month windows.
2. Distinguish `Net Interest` on `Table 9` (`Function 900`) from `Gross Interest on Treasury Debt Securities` on `Table 5`. Gross interest includes non-cash internal book entries credited to Social Security, Medicare, and military retirement trust funds; `Net Interest` isolates actual debt-service pressure after intragovernmental interest offsets.
3. Remember that `Individual Income Taxes` combine W-2 paycheck withholding with non-withheld quarterly payments on pass-through business income (`S-corporations` and partnerships) and realized capital gains. When separating pure paycheck withholding from capital gains, cross-check `Daily Treasury Statement` (`DTS`) line `Withheld Income and Employment Taxes`.

### Debt to the Penny and TIC foreign-holder traps

Total Gross Federal Debt (`$40.5 trillion` horizon anchor in Episode 01) splits into two distinct buckets inside `Debt to the Penny`:

```text
GET https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page[size]=5
Identity: tot_pub_debt_out_amt = debt_held_public_amt + intragov_hold_amt
```

`Debt Held by the Public` measures marketable securities sold at auction to domestic commercial banks, money-market funds, pension funds, households, foreign central banks, and the Federal Reserve's System Open Market Account (`SOMA`). `Intragovernmental Holdings` measure non-marketable Government Account Series IOUs owed by the Treasury General Fund to internal trust funds such as `OASI`. When `OASI` runs a cash deficit and redeems its internal IOUs to pay retirees, total gross debt barely moves, yet `Debt Held by the Public` rises dollar-for-dollar because Treasury has to auction fresh marketable bills and notes to Wall Street to raise the cash.

Inside the `TIC Major Foreign Holders` table, Episode 02 (*Who Buys the Debt*) audits foreign central-bank appetite alongside domestic buyers. Two custodial traps ruin amateur TIC commentary:

1. Custodial bias inflates financial plumbing hubs. Securities held by sovereign wealth funds or Asian institutions inside Euroclear appear under `Belgium`; Clearstream custody appears under `Luxembourg`; London clearing desks inflate `United Kingdom`; levered hedge-fund Treasury cash-futures basis trades inflate the `Cayman Islands`. Always pair the monthly `SLT/MFH` release with the annual `SHLA` Foreign Portfolio Holdings benchmark survey to verify custodial reattribution.
2. Valuation shifts mimic selling. Monthly `SLT` holdings are marked to market value. When ten-year Treasury yields rise fifty basis points in a single month, the market value of long-duration bonds drops automatically even if a foreign central bank sold zero par value. Check the `TIC Transactions` (`net foreign purchases of long-term Treasuries`) series before claiming a country dumped US debt.

## 3. Federal Reserve, BLS, NY Fed, and FDIC datasets

Labor-share erosion, household equity concentration, consumer credit lock-in, and commercial-bank deposit pricing live across five statistical releases accessible directly or via St. Louis Fed `FRED` (`fred.stlouisfed.org`).

| Institution and release | Exact series IDs and tables | URL | Cadence and lag |
|---|---|---|---|
| BLS Major Sector Productivity and Costs (`LPC` via `FRED`) | `OPHNFB` (Output/Hour, `2017=100`), `COMPRNFB` (Real Hourly Compensation, `2017=100`), `PRS85006173` & `LPC` nominal `Labor Share %` | `https://fred.stlouisfed.org/series/OPHNFB` and `https://www.bls.gov/lpc/tables.htm` | `8x` yearly (`Prelim` ~35d, `Revised` ~65d after quarter close, `08:30 ET`) |
| Federal Reserve `Z.1` Financial Accounts of the US | Table `B.101` & `B.101.h` (Households), `B.103` (Nonfinancial Corporates), `L.210` (Treasury Holders); FRED `TABSHNO`, `TLBSHNO` | `https://www.federalreserve.gov/releases/z1/` | Quarterly, ~10 weeks after quarter end (`12:00 ET`) |
| Federal Reserve Distributional Financial Accounts (`DFA`) & `SCF` | `WFRBST01134` (Top `1%` equity share), `WFRBSN09161` (`90-99%` share), `WFRBSB50215` (Bottom `50%` share) | `https://www.federalreserve.gov/releases/efa/efa-distributional-financial-accounts.htm` | `DFA` quarterly (~11-12w lag); `SCF` microdata triennial |
| Federal Reserve `G.19` & NY Fed Household Debt and Credit (`HHDC`) | `G.19`: `TOTALSL`, `REVOLSL`, `TERMCBCCALLNS`. `HHDC`: Total debt (`$19.1T`), mortgage share (`~70%`), 90+d delinquencies | `https://www.newyorkfed.org/microeconomics/hhdc` and `https://www.federalreserve.gov/releases/g19/` | `G.19` monthly (5th business day of month +2); `HHDC` quarterly (`Feb/May/Aug/Nov`) |
| FDIC Quarterly Banking Profile (`QBP`) & National Deposit Rates | `QBP` Table `III-A` (Domestic/Uninsured/Noninterest Deposits), `AFS/HTM` unrealized losses; Checking rate (`~0.07%`) | `https://www.fdic.gov/quarterly-banking-profile` and `https://www.fdic.gov/resources/bankers/national-rates/` | `QBP` quarterly (~60d lag); National Rates 3rd Monday monthly |

### Productivity (`OPHNFB`), compensation (`COMPRNFB`), and labor-share traps

Episode 01 tracks the divergence since 2017 where nonfarm business output per hour (`OPHNFB`) climbed past `20 percent` while real hourly pay (`COMPRNFB`) trailed behind, pushing labor's share of nonfarm business income down to roughly `53 percent` in 2026, its lowest reading since post-war tracking started in 1947. Direct CSV pulls from `FRED` require zero authentication for standard series:

```text
https://fred.stlouisfed.org/graph/fredgraph.csv?id=OPHNFB
https://fred.stlouisfed.org/graph/fredgraph.csv?id=COMPRNFB
https://fred.stlouisfed.org/graph/fredgraph.csv?id=PRS85006173
```

Two technical checks keep this comparison honest:

1. Deflator divergence accounts for part of the wedge between `OPHNFB` and `COMPRNFB`. BLS deflates business output using the implicit price deflator for nonfarm business (`IPDNBS`, which includes cheaper capital goods and software), while deflating worker wages by consumer prices (`CPI-U-RS`, weighted heavily toward shelter, food, and medical care). Nominal `Labor Share` in the BLS `LPC` master workbook (`employee compensation + imputed proprietor labor / nominal nonfarm output`) removes deflator differences because numerator and denominator sit in current dollars, making that `~53 percent` reading the cleanest structural proof.
2. `COMPRNFB` covers `All Workers`, including top corporate officers exercising stock options and imputed labor wages for self-employed proprietors. Median production and nonsupervisory hourly wages (`CES0500000008` deflated by `CPIAUCSL`) lag mean compensation whenever executive equity pay spikes.

### Wealth deciles (`DFA`), household debt (`HHDC` vs `G.19`), and FDIC bank deposits

When Wall Street optimists argue that broad `401(k)` ownership turns AI wage losses into household capital gains, `DFA` and `SCF` tables close the debate immediately. Roughly `60 percent` of American families own some equity exposure, yet combining `WFRBST01134` (`Top 1%`) with `WFRBSN09161` (`90th to 99th percentile`) confirms the richest `10 percent` hold roughly `90 percent` of corporate equities and mutual-fund wealth, while the bottom `50 percent` (`WFRBSB50215`) hold roughly `1 percent`. Even a thirty-two-year-old engineer holding `$45,000` inside a `401(k)` faces ordinary income tax plus a `10 percent` early distribution penalty under `26 U.S.C. § 72(t)` if forced to raid retirement savings before age `59.5` to cover Tuesday's mortgage draft.

Keep four balance-sheet distinctions straight across `Z.1`, `G.19`, `HHDC`, and `FDIC QBP`:

1. Table `B.101` of the Fed `Z.1` release pools households with nonprofit institutions (`university endowments`, `hospital systems`, `foundations`). Use supplemental Table `B.101.h` (`Households Only`) or the `DFA` decile tables when quoting family net worth.
2. Never cite Fed `G.19` (`TOTALSL`, roughly `$5.1 trillion`) as total household debt, because `G.19` excludes residential mortgages and home-equity lines. Cite the NY Fed Equifax `HHDC` report (`$19.1 trillion` total household debt in Episode 01, with roughly `70 percent` locked into mortgages) for complete household liabilities.
3. Inside `HHDC` and `G.19`, separate total credit-card balances from revolving interest-bearing balances. Roughly half of reported monthly card balances belong to transactors who pay statements in full before the grace period closes; `TERMCBCCALLNS` (`commercial bank credit-card plans assessed interest`, `21%+` APR) tracks actual borrowers carrying revolving debt.
4. Inside `FDIC` data, commercial banks pay a national average of roughly `0.07 percent` APY on interest checking accounts while holding trillions more in noninterest-bearing transaction accounts (`QBP` Table `III-A`), earning wide net interest margins by parking depositor cash at the Fed's `Interest on Reserve Balances` (`IORB`) rate or inside Treasury bills. Always inspect `QBP` footnotes for unrealized losses on `Held-to-Maturity` (`HTM`) bonds, which sit outside regulatory capital ratios (`AOCI` opt-out) for non-advanced regional banks until deposit outflows force asset sales.

## 4. Congressional Budget Office and entitlement Trustees reports

Long-horizon fiscal collisions between `2027` and `2036` rely on two statutory scorekeepers: the Congressional Budget Office (`cbo.gov`) and the Social Security and Medicare Boards of Trustees (`ssa.gov` and `cms.gov`).

| Report and issuing body | URL | Cadence | Primary tables and horizon metrics |
|---|---|---|---|
| CBO *The Budget and Economic Outlook* (10-Year Baseline) & *Long-Term Budget Outlook* (30-Year) | `https://www.cbo.gov/data/budget-economic-data` | `Jan/Feb` initial baseline, `May/June` update, `Mar/June` 30-year outlook | `Table 1-1` Deficits & Debt; `Revenue Projections by Category` (Individual, Payroll, Corporate % of GDP); `Net Interest` passing `$2.1T/yr` by `2036` |
| Social Security (`OASDI`) & Medicare (`HI`/`SMI`) Annual Trustees Reports (+ CBO Social Security Outlook) | `https://www.ssa.gov/oact/TR/` and `https://www.cms.gov/data-research/statistics-trends-and-reports/trustees-report-trust-funds` | Annually each `Spring` (`March-May`) | `OASDI Table IV.B3` & `VI.G2`: `OASI` reserve depletion (`Q4 2032` CBO / `2033` Trustees), payable share (`~77-80%`), `HI` Hospital Insurance exhaustion |

### CBO current-law baseline rules and `OASI` exhaustion mechanics

1. Current-Law Baseline Trap (`2 U.S.C. § 907`). Under Section 257 of the Balanced Budget and Emergency Deficit Control Act, CBO is legally forced to assume expiring tax provisions sunset on schedule and discretionary appropriations grow strictly at inflation. Whenever Congress passes temporary tax breaks with fake five-year sunsets, the official CBO baseline prints an artificial revenue surge in out-years. Always download CBO's *Budgetary Outcomes Under Alternative Assumptions About Spending and Revenues* alongside the baseline workbook before quoting ten-year debt trajectories.
2. Interest-Rate Sensitivity Workbook. CBO publishes an interactive *Workbook for How Changes in Economic Conditions Might Affect the Federal Budget*. Use it to verify how a `100-basis-point` upward shift in Treasury yields adds hundreds of billions in cumulative ten-year `Net Interest` outlays as short-dated bills roll over.
3. Trust-Fund Exhaustion Misreading Trap. Never claim Social Security monthly checks fall to `$0` when the `Old-Age and Survivors Insurance` (`OASI`) trust fund exhausts its `$2.5T+` Government Account Series reserve around `Q4 2032`. Continuing FICA payroll taxes still cover roughly `77 to 80 percent` of scheduled benefits, which triggers an automatic `20 to 23 percent` across-the-board cut under the Antideficiency Act unless Congress changes the law. Keep `OASI` distinct from the `Disability Insurance` (`DI`) trust fund; merging `OASDI` on paper requires explicit statutory reallocation by Congress.

## 5. Corporate SEC EDGAR filings, private credit BDCs, and reserve attestations

Series 02 (*AI Bubble, Corporate Accounting & Wall Street Math*) and Act II corporate audits pull raw disclosures from SEC EDGAR (`https://www.sec.gov/edgar/searchedgar/companysearch` and XBRL JSON `https://data.sec.gov/api/xbrl/companyfacts/CIK{10-digit-CIK}.json`, passing a compliant `User-Agent: ReadingRoomEditorialOS/1.0` header). Core CIKs: Alphabet (`0001652044`), Amazon (`0001018724`), Microsoft (`0000789019`), Meta (`0001326801`), Nvidia (`0001045810`), and Oracle (`0001341439`).

| Filing or report type | Statutory window and authority | Exact schedule or footnote to extract | Primary analytical trap |
|---|---|---|---|
| SEC Form `10-K` (Annual Audited Report) | Large Accelerated Filers within `60` days of fiscal year-end (`17 CFR § 249.310`) | `Note 1` / `Property and Equipment` server useful-life table; `ASC 606` Remaining Performance Obligations (`RPO`); `ASC 740` Cash Taxes Paid vs GAAP Tax Provision | Extending server depreciation schedules (`3y` to `5-6y`) boosts GAAP Operating Income while changing cash burn by `$0`; `RPO` mixes firm billings with multi-year cloud commitments |
| SEC Form `10-Q` (Quarterly Report) | Within `40` days of `Q1/Q2/Q3` close (`17 CFR § 249.308a`) | `Condensed Consolidated Statements of Cash Flows`: `Operating Cash Flow (OCF)` minus `CapEx` and `ASC 842` finance-lease principal payments | Quoting `OCF` without deducting `CapEx`, ignoring `Stock-Based Compensation` (`SBC`) add-backs inside `OCF`, or missing server campuses acquired under finance leases |
| BDC Form `10-Q` / `10-K` (`Schedule of Investments`) | Quarterly/Annual under `ASC 946` (`ARCC` `0001287750`, `OBDC` `0001655888`, `BXSL` `0001736035`, `FSK` `0001422183`) | Loan-by-loan `Schedule of Investments`: `PIK` (`Payment-in-Kind`) interest rate column, `Amortized Cost` vs `Fair Value` (`Level 3`), non-accrual flags | `PIK` interest lets distressed borrowers pay interest with new debt IOU balances; BDCs book non-cash `PIK` as positive GAAP income and pay cash dividends from credit lines |
| SEC Form `8-K` (Current Report) | Within `4` business days of trigger event | `Item 1.01` (Material Contracts), `Item 2.03` (Off-Balance-Sheet SPV GPU Obligations), `Item 1.05` (Material Cyber Incidents) | Treating an `Item 1.05` cyber `8-K` initial notice as the complete breach perimeter before amended forensic filings arrive |
| Stablecoin / Custodial Reserve Attestations | Monthly/Quarterly (`AICPA AT-C Section 205` / `ISAE 3000`, e.g., `BDO` Tether, `Deloitte` USDC) | Treasury bill maturity table, overnight reverse-repo collateral, excess equity cushion, cut-off timestamp | Calling a point-in-time `AT-C 205` management assertion snapshot (`23:59 UTC` on month-end) a full `PCAOB` financial audit covering intra-month encumbrances |

### Form `10-K` server useful-life footnotes, `RPO` backlogs, and `ASC 740` tax reconciliation

Episode 03 (*The Depreciation Trick*) dissects three footnotes inside every hyperscaler `10-K`:

1. Property and Equipment Useful-Life Schedule (`Note 1` / `Change in Accounting Estimate` under `ASC 250`). Between 2021 and 2026, major cloud providers repeatedly extended estimated server and networking useful lives from `3 years` out to `5 or 6 years`. Stretching `$120 billion` of AI servers from a three-year straight-line schedule (`$40B/yr` expense) to a six-year schedule (`$20B/yr` expense) adds `$20 billion` directly to GAAP Operating Income in year one without generating a single dollar of cash, even when Nvidia's twelve-to-eighteen-month GPU cadence renders older clusters economically uncompetitive per watt well before year six.
2. Remaining Performance Obligations (`ASC 606-10-50-13`). Cloud vendors tout `$200B+` `RPO` backlogs as guaranteed future AI revenue. Always open the `Revenue` footnote to split `current RPO` (`expected to recognize within 12 months`) from `non-current RPO` (`years 2 to 5+`), and inspect related-party or equity-investee footnotes whenever a cloud giant invests `$4B-$10B` in a model lab that commits to spend that exact capital back on the investor's own cloud servers.
3. Income Tax Footnote (`ASC 740`) and Supplemental Cash Flow Disclosures. Compare `Provision for income taxes` on the Income Statement against actual `Cash paid for income taxes, net of refunds` at the bottom of the Cash Flow Statement. Under the July 2025 permanent restoration of `100 percent` bonus depreciation (`IRC § 168(k)`) and domestic R&D expensing (`IRC § 174A`), hyperscalers deduct full hardware spend immediately on their IRS return while depreciating it slowly over five to six years on their GAAP shareholder books, swelling `Deferred Tax Liabilities` and depressing cash corporate tax receipts on Treasury `MTS Table 9`.

### Form `10-Q` free cash flow, BDC `PIK` flags, and `AT-C 205` attestations

Extract quarterly corporate cash burn using four exact XBRL tags inside `companyfacts/CIK{cik}.json`:

```text
OCF:   us-gaap:NetCashProvidedByUsedInOperatingActivities
CapEx: us-gaap:PaymentsToAcquirePropertyPlantAndEquipment
SBC:   us-gaap:ShareBasedCompensation
Lease: us-gaap:FinanceLeasePrincipalPayments (plus RightOfUseAssetObtainedInExchangeForFinanceLeaseLiability)
True Infrastructure FCF = OCF - CapEx - FinanceLeasePrincipalPayments
```

In Episode 01, combined annual capital expenditures across Alphabet, Amazon, Meta, Microsoft, and Oracle reached the `$740 billion to $820 billion` range, pushing Alphabet into consecutive quarters of negative free cash flow in 2026 and driving Amazon's trailing twelve-month free cash flow past negative `$42 billion`. Always check `Supplemental Cash Flow Information` for data centers acquired under finance leases (`ASC 842`) or unconsolidated joint-venture SPVs (`Form 8-K Item 2.03`), which keep initial construction CapEx off the `PaymentsToAcquirePropertyPlantAndEquipment` line.

When auditing the `$1.7 trillion+` private-credit shadow banking market (which rarely trades on public screens), open the quarterly `Form 10-Q` of publicly listed Business Development Companies (`ARCC`, `OBDC`, `BXSL`, `FSK`). Every BDC must file a line-by-line `Schedule of Investments` under `ASC 946` listing every private middle-market software or healthcare borrower, coupon spread (`SOFR + 550 bps`), `Amortized Cost`, internal `Level 3 Fair Value`, and any `PIK` (`Payment-in-Kind`) slice. Rising `PIK` income as a share of `Total Investment Income` (`8%` climbing past `12-15%`) proves legacy enterprise software borrowers disrupted by AI agents can no longer service cash interest and are amending covenants to capitalize unpaid interest onto principal instead of triggering a headline default.

Finally, when auditing crypto stablecoins or non-bank fintech custodians, verify the exact accounting standard printed in the independent accountant's header. `AICPA AT-C Section 205` or `ISAE 3000` attestation reports (`BDO Italia` for Tether, `Deloitte` for Circle USDC) verify management's balance snapshot at a single minute (`23:59 UTC` on the reporting date). They do not audit full-period cash flows, intra-quarter repo encumbrances, or off-shore sister-company liabilities the way a `PCAOB` Form `10-K` audit does.

## 6. Global macro, wholesale power grids, and physical chokepoints

Software scales at marginal electricity cost until it hits physical transformers, mineral refineries, undersea fiber landings, and maritime war-risk insurance. Series 03 (*AI Power Grid Crisis, Chip Wars & Geopolitics*) pulls from six institutional registries.

| Institution and dataset | Official URL | Release cadence | Core metrics and misreading traps |
|---|---|---|---|
| Bank for International Settlements (`BIS`) *Quarterly Review* & Banking Stats | `https://www.bis.org/publ/qtrpdf/r_qt.htm` and `https://data.bis.org/` | Quarterly (`Mar, Jun, Sep, Dec`) | Off-balance-sheet FX swap dollar obligations (`$65T-$80T+`), Global Liquidity Indicators (`GLI`), non-bank repo funding |
| IMF *World Economic Outlook* (`WEO`), *Fiscal Monitor* & `AIPI` | `https://www.imf.org/en/Publications/WEO` and `.../datamapper/datasets/AIPI` | `WEO`/`Fiscal Monitor` in `Apr` & `Oct`; `AIPI` periodic | Sovereign debt-to-GDP across `190` economies; `174-country` AI Preparedness Index (`AIPI`) |
| International Energy Agency (`IEA`) *Energy and AI* & *Critical Minerals Outlook* | `https://www.iea.org/reports/energy-and-ai` and `.../global-critical-minerals-outlook` | Annual / Special Outlooks (`Apr/May`) | Global data-center electricity load (`415 TWh` in `2024` to `945 TWh` base case by `2030`, passing Japan's total demand); mineral refining shares |
| US Geological Survey (`USGS`) *Mineral Commodity Summaries* (`MCS`) | `https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries` | Annually each `Jan/Feb` | `90` mineral commodities, US `Net Import Reliance %`, global mine output vs reserves (`gallium`, `germanium`, `copper`, `silicon`, `graphite`) |
| PJM `Base Residual Auction` (`BRA`), ERCOT `GIS` & EIA Form `860M` | `https://www.pjm.com/markets-and-operations/rpm`, `https://www.ercot.com/gridinfo/resource`, `https://www.eia.gov/electricity/data/eia860m/` | PJM `BRA` per delivery year; ERCOT `GIS` & EIA `860M` monthly | PJM `2025/2026` capacity clearing spike (`$28.92` to `$269.92/MW-day`, `+833%`), large-load interconnection queues, generator retirements |
| TeleGeography *Submarine Cable Map* & Lloyd's Joint War Committee (`JWLA`) | `https://www.submarinecablemap.com/` and `https://www.lmalloyds.com/lma/underwriting/marine/JWC/` | TeleGeography rolling/annual; Lloyd's `JWLA` circulars on threat escalation | `550+` subsea cable landings (`Luzon`, `Red Sea/Egypt`, `Malacca`); `JWLA` Listed Areas triggering `7-day` hull war-risk surcharges |

### BIS dollar swaps, IMF `WEO`/`AIPI`, and USGS versus IEA mineral balances

1. BIS Off-Balance-Sheet Dollar Debt (`BIS Quarterly Review`). Foreign pension funds, insurers, and commercial banks owe over `$65 trillion to $80 trillion` in short-term US dollar payment obligations buried inside FX swaps and forwards that never appear as on-balance-sheet debt under GAAP or IFRS. Treat this figure accurately as gross short-term dollar rollover funding exposure (which triggers acute Federal Reserve swap-line squeezes when dollar liquidity dries up), never as net uncollateralized credit loss.
2. IMF *Fiscal Monitor* and `AI Preparedness Index` (`AIPI`). When comparing US debt-to-GDP against European or Asian peers in IMF tables, check whether the table reports `General Government Gross Debt` (which adds state, provincial, and municipal debt onto sovereign debt) or `Central Government Debt`. Pair sovereign fiscal room against the `174-economy` IMF `AIPI` dashboard (`Digital Infrastructure`, `Human Capital and Labor Market Policies`, `Innovation and Economic Integration`, `Regulation and Ethics`) to expose emerging markets facing simultaneous AI back-office export displacement and external dollar debt walls.
3. USGS Mine Extraction versus IEA Midstream Refining. Amateur commodity commentary looks up `Copper` or `Rare Earths` in the annual `USGS Mineral Commodity Summaries` and assumes dispersed mine output (`Chile`, `Peru`, `DRC`, `Australia`, `United States`) guarantees supply security. Always cross-tabulate `USGS` mine production against the `IEA Global Critical Minerals Outlook` midstream chemical refining and smelting tables, where single-country processing shares reach `45 percent` in refined copper, `65+ percent` in battery-grade lithium and cobalt, `90 percent` in rare-earth magnet separation, and `98 percent` in primary gallium. Also separate `Mineral Resources` (geologically present rock) from `Mineral Reserves` (economically extractable at current prices and permits).

### Wholesale electricity auctions (`PJM`/`ERCOT`), subsea cables, and Lloyd's war-risk zones

Episode 01 links `5-gigawatt` AI campus requests and IEA's `945 TWh` 2030 data-center load directly to PJM Interconnection's `2025/2026 Base Residual Auction`, where wholesale capacity prices across thirteen states and Washington, D.C. jumped `833 percent` from `$28.92` to `$269.92 per megawatt-day` right before Microsoft locked up all `835 MW` of the restarted Unit 1 nuclear reactor at Three Mile Island for twenty years. Keep four engineering rules locked during every grid and chokepoint script:

1. Power (`MW`/`GW`) versus Energy (`MWh`/`TWh`). Instantaneous load is measured in megawatts or gigawatts (`1 GW = 1,000 MW = 1,000,000 kW`, roughly one million `1-kW` microwaves running simultaneously). Cumulative energy over time is measured in watt-hours (`1 GW` running continuously across `8,760 hours/year` at a `100 percent` capacity factor consumes `8.76 TWh`).
2. Nameplate `MW` versus Accredited `UCAP` (`Unforced Capacity`). Never equate `1,000 MW` of nameplate solar panels (`~22-26 percent` annual capacity factor, zero midnight output) with `1,000 MW` of nuclear baseload (`~92+ percent` capacity factor) or combined-cycle gas (`~55-65 percent`, dispatchable on command). PJM and ERCOT accredit intermittent generators using `Effective Load Carrying Capability` (`ELCC`) derate percentages when scoring winter peak reliability.
3. Interconnection Queue Withdrawal Rates (`EIA Form 860M`, `ERCOT GIS`, `LBNL Queued Up`). Over `2,500 GW` of generation sits in US interconnection queues, yet historical `LBNL` tracking shows roughly `70 to 80 percent` of queued projects withdraw before commercial operation due to network-upgrade cost allocations and `3-to-4-year` large power transformer (`LPT`) delivery backlogs. Cite projects with executed `Interconnection Agreements` (`IA`) and air/site permits (`EIA 860M` status codes `U` under construction or `V` testing) when forecasting near-term relief.
4. Subsea Fiber (`TeleGeography`) and Maritime Insurance (`Lloyd's JWLA`). Over `99 percent` of intercontinental internet and cloud replication traffic rides `550+` undersea fiber-optic cables while satellites carry under one percent, funneling global data through narrow repair hazards in the `Luzon Strait`, `Red Sea / Bab el-Mandeb`, `Egyptian terrestrial Suez corridor`, and `Strait of Malacca`. Pair physical cable maps with `Lloyd's Market Association Joint War Committee` (`JWLA`) Listed Areas circulars: commercial LNG tankers, container ships, and cable-repair vessels halt or reroute around the Cape of Good Hope the morning `JWLA` designates a waterway and `7-day` war-risk hull premiums jump from `0.05 percent` to `0.75-1.0 percent` of vessel value, long before a formal naval blockade is declared.

## 7. Federal dockets, antitrust, post-quantum cryptography, and cyber intelligence

Series 04 (*AI Cybersecurity, Scams, Privacy & Tech Policy*) and statutory escape-hatch audits in Series 01 through 03 rely on six primary legal and technical repositories.

| Repository and authority | Primary URL and feed | Update schedule | Primary lookup scope |
|---|---|---|---|
| CourtListener / Free Law Project `RECAP` & State Appellate Opinions | `https://www.courtlistener.com/` API: `https://www.courtlistener.com/api/rest/v4/` | Real-time `PACER/RECAP` sync and daily slip opinions | Federal antitrust remedies (*U.S. v. Google*), Regulation E wire-fraud rulings, AI copyright dockets, state fiscal precedents (*Wielechowski v. State*, `403 P.3d 1141`, Alaska `2017`) |
| Federal Trade Commission (`FTC`) Section `6(b)` Studies & Consent Orders | `https://www.ftc.gov/reports` and `https://www.ftc.gov/legal-library/browse/cases-proceedings` | Event-driven under `15 U.S.C. § 46(b)` and `§ 45` | Compulsory-subpoena staff reports on cloud-AI round-trip compute credits, algorithmic pricing, and youth feed retention; administrative `Consent Orders` |
| NIST Post-Quantum Standards (`FIPS 203`, `204`, `205`) & `IR 8547` | `https://csrc.nist.gov/pubs/fips/203/final` (`204`, `205`) and `.../pubs/ir/8547/ipd` | Finalized `FIPS`; `IR 8547` transition milestones (`2030` deprecate, `2035` disallow) | `ML-KEM` (`FIPS 203` key establishment), `ML-DSA` (`FIPS 204` signatures), `SLH-DSA` (`FIPS 205` hash signatures), RSA/ECC sunset timelines |
| CISA Known Exploited Vulnerabilities (`KEV`) & Joint Advisories (`CSAs`) | `https://www.cisa.gov/known-exploited-vulnerabilities-catalog` JSON: `.../feeds/known_exploited_vulnerabilities.json` | Rolling updates within `24-48h` of confirmed wild exploitation (`BOD 22-01`) | Confirmed in-the-wild exploited `CVEs`, ransomware campaign flag, federal agency remediation deadlines, critical-infrastructure `LOTL` advisories |
| Verizon `DBIR` & Google Cloud / Mandiant *M-Trends* | `https://www.verizon.com/business/resources/reports/dbir/` and `https://cloud.google.com/security/resources/m-trends` | Annual (`April/May`) | Confirmed breach root causes (stolen credentials, social engineering, unpatched `N-day` vulnerabilities), global `Median Dwell Time`, zero-day share |
| FinCEN `SAR` Statistics & Financial Trend Analyses (`FTAs`) | `https://www.fincen.gov/reports/sar-stats` and `https://www.fincen.gov/news-room/financial-trend-analyses` | Monthly `SAR` dashboard updates; periodic `FTA` bulletins | Depository and MSB Suspicious Activity Report counts (`Check Fraud`, `Elder Exploitation`, `BEC`, `Identity Theft`, `Virtual Currency`) |

### CourtListener dockets, FTC Section `6(b)` subpoenas, and FinCEN `SAR` rules

1. Procedural Posture Verification (`CourtListener / RECAP`). Every judicial citation must identify the exact procedural stage: a party's unverified `Complaint`, a `Rule 12(b)(6)` motion-to-dismiss order (where the judge must assume plaintiff's factual allegations are true strictly to test legal sufficiency), `Summary Judgment` (`Rule 56`) evidentiary findings, post-trial `Findings of Fact and Conclusions of Law`, or a binding appellate holding such as the Alaska Supreme Court's unanimous ruling in *Wielechowski v. State*, `403 P.3d 1141` (`Alaska 2017`) confirming statutory citizen dividends lack constitutional dedication against a governor's line-item budget veto.
2. FTC Section `6(b)` Market Studies (`15 U.S.C. § 46(b)`). Unlike ordinary policy whitepapers, FTC `6(b)` studies compel sworn internal contracts and accounting tables from uncharged corporations, including the FTC's *Partnerships Between Cloud Service Providers and AI Developers* staff report exposing how multibillion-dollar hyperscaler "investments" into frontier AI labs return to the investor as cloud-compute revenue credits and exclusive hosting locks. When citing FTC `Consent Orders`, note that respondents settle without admitting statutory liability, though breaching a final order carries strict per-violation civil penalties under `15 U.S.C. § 45(l)`.
3. FinCEN Suspicious Activity Reports (`SAR Stats`). FinCEN's public dashboard tracks million-scale annual filing surges across check fraud, elder financial exploitation, and synthetic identity account openings. Never sum dollar figures on `SAR` filings and call the total "confirmed bank losses": compliance departments file defensive `SARs` on blocked attempts and multi-bank wire hops, and federal anti-tipping-off law (`31 U.S.C. § 5318(g)(2)`) makes revealing the existence of an individual `SAR` a felony.

### NIST post-quantum standards, CISA `KEV`, Verizon `DBIR`, and Mandiant *M-Trends*

1. Post-Quantum Cryptography (`NIST FIPS 203/204/205` and `IR 8547`). NIST finalized `FIPS 203` (`ML-KEM` lattice key encapsulation), `FIPS 204` (`ML-DSA` lattice digital signatures), and `FIPS 205` (`SLH-DSA` stateless hash-based signatures), while `NIST IR 8547` sets `2030` to deprecate legacy `RSA-2048` and elliptic-curve (`ECDSA`/`ECDH`) public-key cryptography and `2035` to disallow them completely. Keep quantum physics accurate: Shor's algorithm threatens asymmetric public-key exchange (`RSA`, `ECDH`), creating immediate `Harvest-Now-Decrypt-Later` (`HNDL`) risk for encrypted traffic carrying a ten-to-thirty-year secrecy shelf life, whereas symmetric `AES-256` data-at-rest encryption resists Grover's algorithm with `128+ bits` of post-quantum security.
2. CISA `KEV` versus Raw `NVD CVSS` Scores. Over `35,000 CVEs` enter the NIST National Vulnerability Database annually, and thousands carry `CVSS 9.0+` critical ratings while sitting unexploited in academic proof-of-concept repos. `CISA KEV` (`known_exploited_vulnerabilities.json`, enforced on federal civilian agencies under `BOD 22-01`) isolates the roughly `1,200+` cataloged vulnerabilities with verified active exploitation in the wild, complete with `knownRansomwareCampaignUse` flags and `dueDate` deadlines.
3. Verizon `DBIR` and Mandiant *M-Trends* Telemetry Traps. Inside Verizon `DBIR`, always cite the `Confirmed Breaches` denominator (`verified data disclosure`) separately from `Security Incidents` (which gets skewed by tens of thousands of automated `DDoS` floods). Inside Mandiant *M-Trends*, track global `Median Dwell Time` (`~10-16 days`) alongside the breakdown between external detection (`law enforcement / threat-intel notification`) and internal defender detection, noting that noisy ransomware encryption lowers median dwell time while state-sponsored `living-off-the-land` (`LOTL`) espionage inside routers and edge appliances persists undetected for hundreds of days.

## 8. Archival naming convention and pre-shoot `[LIVE_STAT_SLOT]` SOP

Every primary file pulled during Stage 1 is saved locally inside the episode research packet using a deterministic filename before entering `fact_ledger.json`:

```text
{EP_ID}_{SOURCE_ID}_{OBSERVATION_PERIOD}_pulled-{YYYYMMDD}.{ext}
Example: ep01_UST_MTS_TABLE9_FY2026-SEP_pulled-20261102.pdf
Example: ep03_SEC_10K_GOOGL_FY2025_pulled-20261110.json
Example: ep06_PJM_BRA_2025-2026_pulled-20261114.pdf
```

Every volatile figure in a research dossier (`ep_04.md` through `ep_30.md`) binds to a registry entry in `data/institutional_sources_registry.json` via this canonical `[LIVE_STAT_SLOT]` block:

```yaml
live_stat_slot:
  slot_id: "UST_DEBT_PENNY_TOTAL_GROSS"
  registry_source_id: "UST_DEBT_TO_PENNY"
  script_fallback_text: "$40.5 trillion in national debt"
  api_field: "tot_pub_debt_out_amt"
  refresh_window_hours_before_shoot: 72
  cinema_scene_sync_required: true
  thesis_break_condition: "Halt and re-run Stage 2 if statutory debt restructuring or yield-curve control is enacted"
```

Seventy-two hours before A-roll camera roll, execute this five-step Stage 1 lock verification:

1. Run `analyze_datasets.py` to pull the newest release across every active `registry_source_id` in the episode script (`MTS Table 9`, `Debt to the Penny`, `FRED OPHNFB/DFA`, `NY Fed HHDC`, `SEC EDGAR XBRL`, `PJM BRA`, `CISA KEV`).
2. Compare the fresh print against `script_fallback_text` and confirm no `thesis_break_condition` tripped.
3. Update both the teleprompter narration and the `reading-room-cinema` `#FAF8F3` document callout crop in lockstep so spoken numbers and on-screen tables agree to the exact decimal.
4. Append the fresh file hash, retrieval timestamp, and exact page or API row reference into `02_research_and_data/data/fact_ledger.json`.
5. Hand the locked Stage 1 evidence packet to Stage 2 (`12_adversarial_red_team_protocol.md`) for five-seat specialist stress testing.

## 9. Annual institutional release calendar and quick-lookup code index

Production sprints run on a twelve-day cadence through January 2028 (`53_12day_solo_production_sprint_sop.md`). Before locking a shoot week, check this annual calendar to avoid publishing an episode forty-eight hours before an annual benchmark revision overwrites a headline metric.

| Calendar window | Major institutional benchmarks releasing | Editorial slate impact |
|---|---|---|
| `January - February` | CBO *10-Year Budget and Economic Outlook*; USGS *Mineral Commodity Summaries*; Big Tech (`GOOGL`, `AMZN`, `META`, `NVDA`) annual `Form 10-K` filings; NY Fed `Q4 HHDC` | Refresh ten-year `Net Interest` (`$2.1T` 2036 baseline), server useful-life changes, full-year hyperscaler `FCF`, and `90-mineral` import reliance |
| `March` | Federal Reserve `Q4 Z.1` & `DFA`; BIS `March Quarterly Review`; FDIC `Q4 Quarterly Banking Profile`; CBO *30-Year Long-Term Budget Outlook* | Update top-decile equity concentration, bank `HTM` unrealized bond losses, and global off-balance-sheet FX swap funding totals |
| `April - May` | Social Security & Medicare *Trustees Reports*; IMF Spring *WEO* & *Fiscal Monitor*; Verizon `DBIR` & Mandiant *M-Trends*; IEA *Energy and AI* / *Critical Minerals*; `SHLA` TIC Draft | Lock updated `OASI` depletion quarter (`Q4 2032`), global breach root-cause medians, median attacker dwell time, and data-center `TWh` curves |
| `June - July` | CBO Mid-Year Budget Update; Fed `Q1 Z.1` & `DFA`; BIS `June Quarterly Review`; Treasury `SHLA` Final Benchmark Survey; PJM `Base Residual Auction` windows | Reconcile custodial Treasury bond reattribution (`Cayman`, `Belgium`, `UK`) and wholesale `$/MW-day` capacity clearing prices |
| `August - September` | Microsoft (`FY-end June 30`) `Form 10-K`; NY Fed `Q2 HHDC`; Fed `Q2 Z.1` & `DFA`; BIS `September Quarterly Review`; LBNL *Queued Up* grid update | Audit Microsoft `RPO` cloud backlogs, finance-lease GPU additions, and regional interconnection withdrawal rates |
| `October` | Treasury `September MTS` (`Full Federal Fiscal Year` lock); IMF Annual Meetings *WEO* & *Fiscal Monitor* | Lock full-year federal receipt shares (`Individual + Payroll` vs `Corporate`) and full-year `Net Interest` vs `National Defense` |
| `November - December` | NY Fed `Q3 HHDC`; Fed `Q3 Z.1` & `DFA`; FDIC `Q3 QBP`; BIS `December Quarterly Review`; `Q3 Form 10-Q` BDC `PIK` schedules | Audit year-end household mortgage/card delinquencies and private-credit `PIK` toggle escalation heading into winter uploads |

### Master code, XBRL tag, CIK, and statutory lookup index

Use these exact identifiers inside `analyze_datasets.py`, `fact_ledger.json`, and episode dossiers:

| Domain | Identifier / code | Exact series, tag, entity, or legal rule | Registry ID |
|---|---|---|---|
| Treasury Fiscal | `mts_table_9` (`Function 900`) | Monthly Treasury Statement Table 9 Receipts by Source & Net Interest | `UST_MTS_TABLE9` |
| Treasury Fiscal | `tot_pub_debt_out_amt` | Total Public Debt Outstanding (`debt_held_public_amt` + `intragov_hold_amt`) | `UST_DEBT_TO_PENNY` |
| Treasury TIC | `slt_table5` / `SHLA` | Major Foreign Holders of Treasury Securities & Annual Custodial Survey | `UST_TIC_MFH` |
| BLS / FRED | `OPHNFB` | Nonfarm Business Sector: Output per Hour for All Workers (`2017=100`) | `FRED_BLS_LPC` |
| BLS / FRED | `COMPRNFB` | Nonfarm Business Sector: Real Hourly Compensation (`2017=100`) | `FRED_BLS_LPC` |
| BLS / FRED | `PRS85006173` | Nonfarm Business Sector: Labor Share for All Workers | `FRED_BLS_LPC` |
| BLS / FRED | `CES0500000008` | Average Hourly Earnings of Production and Nonsupervisory Employees | `FRED_BLS_LPC` |
| Fed Z.1 / FRED | `TABSHNO` / `TLBSHNO` | Households & Nonprofits Total Assets and Total Liabilities (`Table B.101.h` for families) | `FED_Z1_ACCOUNTS` |
| Fed DFA / FRED | `WFRBST01134` | Top `1%` Share of Corporate Equities and Mutual Fund Shares | `FED_DFA_SCF` |
| Fed DFA / FRED | `WFRBSN09161` | `90th to 99th` Percentile Share of Corporate Equities and Mutual Funds | `FED_DFA_SCF` |
| Fed DFA / FRED | `WFRBSB50215` | Bottom `50%` Share of Corporate Equities and Mutual Fund Shares | `FED_DFA_SCF` |
| Fed G.19 / FRED | `TOTALSL` / `REVOLSL` | Total & Revolving Non-Mortgage Consumer Credit Outstanding | `FED_G19_CREDIT` |
| Fed G.19 / FRED | `TERMCBCCALLNS` | Commercial Bank Credit Card APR on Accounts Assessed Interest | `FED_G19_CREDIT` |
| NY Fed Credit | `HHDC` Equifax Panel | Total Household Debt (`$19.1T`), Mortgage Share (`~70%`), Delinquency Transitions | `NYFED_HHDC` |
| FDIC Banking | `QBP Table III-A` | Insured, Uninsured, and Noninterest Deposits + `~0.07%` National Checking Rate | `FDIC_QBP_RATES` |
| CBO Baseline | `2 U.S.C. § 907` | 10-Year Budget Baseline (`$2.1T` 2036 Net Interest) & Current-Law Sunset Rule | `CBO_OUTLOOK` |
| Entitlements | `OASDI Table VI.G2` | `OASI` Trust Fund Depletion Window (`Q4 2032` / `2033`, `~77-80%` payable) | `SSA_CMS_TRUSTEES` |
| SEC EDGAR CIK | `0001652044` / `0001018724` | Alphabet Inc. (`GOOGL`) and Amazon.com Inc. (`AMZN`) `10-K` / `10-Q` | `SEC_EDGAR_10K_10Q` |
| SEC EDGAR CIK | `0000789019` / `0001326801` | Microsoft Corp. (`MSFT`) and Meta Platforms Inc. (`META`) `10-K` / `10-Q` | `SEC_EDGAR_10K_10Q` |
| SEC EDGAR CIK | `0001045810` / `0001341439` | Nvidia Corp. (`NVDA`) and Oracle Corp. (`ORCL`) `10-K` / `10-Q` | `SEC_EDGAR_10K_10Q` |
| SEC XBRL Tag | `NetCashProvidedByUsedInOperatingActivities` | GAAP Operating Cash Flow (`OCF`) before capital expenditures | `SEC_EDGAR_10K_10Q` |
| SEC XBRL Tag | `PaymentsToAcquirePropertyPlantAndEquipment` | Cash Capital Expenditures (`CapEx`, subtract with finance leases from `OCF`) | `SEC_EDGAR_10K_10Q` |
| SEC XBRL Tag | `RemainingPerformanceObligation` | Contracted `ASC 606` Cloud/AI Revenue Backlog (`current` vs `non-current`) | `SEC_EDGAR_10K_10Q` |
| SEC BDC CIKs | `0001287750` / `0001655888` | Ares Capital (`ARCC`) and Blue Owl Capital (`OBDC`) `ASC 946` `PIK` Schedules | `SEC_BDC_SOI` |
| Reserve Audit | `AICPA AT-C 205` / `ISAE 3000` | Point-in-time Stablecoin & Custodial Reserve Attestations (`BDO`, `Deloitte`) | `ATTEST_RESERVES` |
| Global Macro | `BIS GLI` & `FX Swaps` | Bank for International Settlements Off-Balance-Sheet Dollar Swap Funding | `BIS_QUARTERLY` |
| Global Macro | `IMF WEO` & `AIPI` | Sovereign Fiscal Monitor & `174-Country` AI Preparedness Index | `IMF_WEO_AIPI` |
| Energy & Grids | `IEA Energy and AI` | Global Data-Center Demand (`415 TWh` to `945 TWh` by `2030`) & Mineral Refining | `IEA_ENERGY_MINERALS` |
| Minerals | `USGS MCS` | Annual `90-Commodity` US Net Import Reliance, Mine Production, and Reserves | `USGS_MINERALS` |
| Wholesale Power | `PJM RPM BRA` / `EIA 860M` | Capacity Clearing Prices (`$269.92/MW-day`) & Generator Interconnection Queues | `GRID_PJM_ERCOT_EIA` |
| Chokepoints | `TeleGeography` / `JWLA` | `550+` Subsea Fiber Landings & Lloyd's Joint War Committee Listed Areas | `CHOKE_CABLE_LLOYDS` |
| Case Law | `403 P.3d 1141` (`Alaska 2017`) | *Wielechowski v. State* Statutory Dividend Veto Precedent (`CourtListener`) | `LAW_COURTLISTENER` |
| Antitrust | `15 U.S.C. § 46(b)` | FTC Section `6(b)` Compulsory Subpoena Studies & Administrative Consent Orders | `LAW_FTC_6B` |
| Cryptography | `FIPS 203` / `204` / `205` & `IR 8547` | NIST Post-Quantum `ML-KEM`, `ML-DSA`, `SLH-DSA` & `2030/2035` Sunset Rules | `CYBER_NIST_PQC` |
| Cyber Exploits | `BOD 22-01` (`KEV JSON`) | CISA Known Exploited Vulnerabilities Catalog & Joint Infrastructure Advisories | `CYBER_CISA_KEV` |
| Breach Telemetry | `DBIR` & *M-Trends* | Verizon Confirmed Breach Root Causes & Mandiant Global Median Dwell Time | `CYBER_DBIR_MTRENDS` |
| Banking Secrecy | `31 U.S.C. § 5318(g)(2)` | FinCEN `SAR` Statistics & Mandatory Anti-Tipping-Off Confidentiality Rule | `FINCEN_SAR_STATS` |

### Automated rate-limit and ingestion rules for `analyze_datasets.py`

When automated Editorial OS scripts pull live numbers from `data/institutional_sources_registry.json`, enforce four endpoint rules so institutional firewalls never block shoot-week refreshes:

1. SEC EDGAR (`data.sec.gov`) blocks default Python `urllib` and Node `fetch` headers with `HTTP 403`. Pass a descriptive `User-Agent: ReadingRoomEditorialOS/1.0 (editorial-audit@readingroom.local)` header and throttle batch CIK loops below `10 requests per second`, padding every CIK to ten digits with leading zeros (`CIK0001652044.json`).
2. Bureau of the Fiscal Service (`api.fiscaldata.treasury.gov`) defaults to `page[size]=100` and sorts oldest-first unless `sort=-record_date` is appended explicitly. Always pass `page[size]=1000` and verify `meta.total-pages` before aggregating twelve-month receipts.
3. St. Louis Fed `FRED` serves direct CSV histories at `https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES_ID}` with zero API key required. Filter out missing-observation rows marked with a single period (`.`) on federal holidays before computing rolling percentages.
4. CISA `KEV` (`known_exploited_vulnerabilities.json`) publishes as a single UTF-8 JSON document (`catalogVersion`, `dateReleased`, `vulnerabilities[]`). Diff `dateAdded` against the prior episode snapshot to isolate newly weaponized `N-day` flaws without scraping HTML advisories.


