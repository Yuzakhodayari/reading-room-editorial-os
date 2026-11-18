# Deliverable #9: Quantitative Macro, AI & Security Dataset Analyzer Guide and Verified Stat-Cards

**Tool Path:** `02_research_and_data/tools/analyze_datasets.py`  
**Curated Datasets:** `02_research_and_data/datasets/` (5 primary institutional files)  
**JSON Stat-Card Ledger:** `02_research_and_data/data/verified_stat_cards.json`  
**Cinema Contract Target:** `01_identity_and_strategy/cinema_schema_contract.json`

## 1. Purpose and Quantitative Scope

Every balance-sheet argument on The Reading Room rests on primary government ledgers, SEC cash-flow filings, and wholesale power-market clearing reports. `analyze_datasets.py` runs on the Python 3 standard library with zero external packages. It reads CSV and JSON tables, verifies multi-year growth rates and distributional skews, and compiles camera-ready Stat-Cards wired directly into `reading-room-cinema` optical substrates.

Four mathematical engines anchor the tool:

1. **Nominal and Fisher-Deflated Real Growth (`cagr`):** Computes exact compound annual growth over fractional or integer year spans (`FY2024`, `2026-Q2`, `2025/2026`). Whenever a CPI or price-index column is present, the analyzer deflates terminal values into base-period purchasing power (`V_real = V_end * (CPI_start / CPI_end)`) so inflation never masquerades as real wage or revenue expansion.
2. **Basis-Point Spreads and Index Divergence (`spread`):** Tracks cross-column cumulative wedges (such as nonfarm output per hour against real hourly compensation on a `2017 = 100` base), cross-series fiscal crossovers (`OUT_NET_INT` minus `OUT_DEFENSE`), and sequential regime jumps in capacity auctions.
3. **Distributional Concentration and Lorenz Geometry (`deciles`):** Orders wealth brackets from bottom to top, integrates the piecewise trapezoidal area under the Lorenz curve (`Gini = 1 - 2B`), computes the Hoover redistribution index, and separates aggregate bracket ratios (`89.80x`) from per-household intensity ratios (`449.00x`).
4. **Corporate Cash Conversion and Silicon Depreciation Sensitivity (`capex-fcf`):** Evaluates `FCF = OCF - CapEx` and `CapEx-to-OCF` ratios across the Big-4 (`GOOGL`, `AMZN`, `MSFT`, `META`) and Big-5 (adding `ORCL`) hyperscalers, then compares `6-year` accounting server schedules against a `3-year` GPU replacement cycle (`Delta_EBIT = -(K/3 - K/6)`).

## 2. CLI Operator Reference and Shoot-Week Workflow

Global flags (`--input`, `--json`, `--out`) work either before or after the subcommand name. Exit code `0` indicates clean parsing and finite numerical output.

| Subcommand | Primary Function | Key Optional Flags |
| :- | :- | :- |
| `summary` | Count, missingness, period bounds, first/last, % change, mean, median, pstdev, and IQR | `--group-by`, `--value-col`, `--period-col` |
| `cagr` | Nominal CAGR, CPI-deflated real CAGR, multiples, annualized bps, and doubling time | `--series-col`, `--series`, `--deflator-col`, `--start`, `--end` |
| `spread` | Cross-column index wedge, cross-series dollar/bps spread, or within-series jumps | `--lhs`, `--rhs`, `--series-col`, `--value-col` |
| `deciles` | Top 10% vs Bottom 50% aggregate and per-household ratios, Lorenz curve, and Gini | `--period`, `--pop-col`, `--share-col`, `--value-col` |
| `capex-fcf` | Per-company and Big-4/Big-5 FCF, CapEx/OCF, and 3-year vs 6-year EBIT compression | `--year`, `--short-life`, `--long-life`, `--tax-rate` |
| `export-cards` | Rebuilds all 12 verified Stat-Cards into JSON and Markdown from raw datasets | `--datasets-dir`, `--out`, `--markdown-out` |

### Reproducible Command Invocations

```bash
# 1. Summarize Treasury Table 9 receipts and outlays by budget section
python 02_research_and_data/tools/analyze_datasets.py summary \
  --input 02_research_and_data/datasets/us_treasury_mts_table9_fy2024_fy2026.csv \
  --group-by section --value-col amount_usd_billions

# 2. Compute nominal and CPI-deflated real CAGRs across PJM auctions and IEA load
python 02_research_and_data/tools/analyze_datasets.py cagr \
  --input 02_research_and_data/datasets/pjm_capacity_auctions_and_iea_dc_load.csv --json

# 3. Measure 2017-2026 BLS productivity-to-pay divergence and labor-share compression
python 02_research_and_data/tools/analyze_datasets.py spread \
  --input 02_research_and_data/datasets/bls_productivity_vs_compensation_2017_2026.csv

# 4. Audit Federal Reserve DFA household equity concentration and Lorenz/Gini
python 02_research_and_data/tools/analyze_datasets.py deciles \
  --input 02_research_and_data/datasets/fed_dfa_equity_wealth_deciles.csv --period 2026-Q2

# 5. Stress-test Big-5 hyperscaler FCF and 3-year vs 6-year server depreciation
python 02_research_and_data/tools/analyze_datasets.py capex-fcf \
  --input 02_research_and_data/datasets/hyperscaler_capex_fcf_depreciation_2023_2026.json \
  --year 2026 --short-life 3 --long-life 6

# 6. Regenerate canonical JSON Stat-Cards and this Markdown dossier
python 02_research_and_data/tools/analyze_datasets.py export-cards \
  --datasets-dir 02_research_and_data/datasets \
  --out 02_research_and_data/data/verified_stat_cards.json \
  --markdown-out 02_research_and_data/09_quantitative_analyzer_guide_and_cards.md
```

### Shoot-Week `[LIVE_STAT_SLOT]` Refresh Protocol

Episodes 4 through 30 stay evergreen through January 2028 by isolating fast-moving market or fiscal spot numbers inside `[LIVE_STAT_SLOT]` markers. Forty-eight hours before recording A-roll, append the latest Monthly Treasury Statement, 10-Q cash-flow row, or RTO auction result to the corresponding file in `02_research_and_data/datasets/` and run `export-cards`. Every downstream `formula_audit_trail`, `exact_figures` block, and `macroTelemetry` sparkline updates deterministically in one pass.

## 3. Live Cross-Dataset Synthesis Ledgers

### 3.1 U.S. Treasury MTS Table 9 Fiscal Shift (`FY2024` to `FY2026`)

| Series Code | Budget Line Item | FY2024 ($B) | FY2024 Share | FY2026 ($B) | FY2026 Share | 2-Yr Shift |
| :- | :- | :- | :- | :- | :- | :- |
| `REC_INDIV_INC` | Individual Income Taxes | $2,426.07B | 49.32% | $2,792.22B | 51.90% | +258 bps |
| `REC_SOC_INS` | Social Insurance and Retirement Receipts | $1,709.57B | 34.76% | $1,856.10B | 34.50% | -26 bps |
| `AGG_INDIV_PAYROLL` | Combined Individual Income and Payroll Taxes | $4,135.64B | 84.08% | $4,648.32B | 86.40% | +232 bps |
| `REC_CORP_INC` | Corporation Income Taxes | $529.87B | 10.77% | $382.00B | 7.10% | -367 bps |
| `AGG_RECEIPTS_TOTAL` | Total Federal Receipts | $4,918.73B | 100.00% | $5,380.00B | 100.00% | +9.38% ($) |
| `OUT_NET_INT` | Net Interest | $881.68B | 13.06% | $1,052.00B | 14.23% | +117 bps |
| `OUT_DEFENSE` | National Defense | $873.51B | 12.94% | $965.00B | 13.05% | +11 bps |
| `AGG_OUTLAYS_TOTAL` | Total Federal Outlays | $6,751.56B | 100.00% | $7,395.00B | 100.00% | +9.53% ($) |

### 3.2 BLS Nonfarm Productivity vs Real Hourly Pay (`2017 = 100`)

| Year | Output / Hour | Real Hourly Pay | Nominal Pay | CPI-U (`2017=100`) | Wedge (idx pts) | Labor Share (%) |
| :- | :- | :- | :- | :- | :- | :- |
| 2017 | 100.00 | 100.00 | 100.00 | 100.00 | 0.00 | 56.90% |
| 2018 | 101.50 | 100.90 | 103.32 | 102.40 | 0.60 | 56.60% |
| 2019 | 103.60 | 102.90 | 107.32 | 104.30 | 0.70 | 56.80% |
| 2020 | 109.10 | 109.90 | 116.05 | 105.60 | -0.80 | 57.90% |
| 2021 | 111.30 | 109.80 | 121.33 | 110.50 | 1.50 | 56.60% |
| 2022 | 109.60 | 105.70 | 126.10 | 119.30 | 3.90 | 55.40% |
| 2023 | 111.40 | 106.20 | 131.90 | 124.20 | 5.20 | 54.70% |
| 2024 | 114.50 | 108.00 | 138.02 | 127.80 | 6.50 | 54.10% |
| 2025 | 117.40 | 108.90 | 142.77 | 131.10 | 8.50 | 53.40% |
| 2026 | 120.80 | 109.60 | 147.41 | 134.50 | 11.20 | 52.90% |

### 3.3 Hyperscaler 2026 Cash Conversion and 3-Year vs 6-Year Server Depreciation

| Ticker | 2026 OCF | 2026 CapEx | 2026 FCF | CapEx/OCF | Active 3Yr AI PP&E | 6Yr Dep/yr | 3Yr Dep/yr | Pre-Tax EBIT Hit |
| :- | :- | :- | :- | :- | :- | :- | :- | :- |
| `GOOGL` | $168.40B | $182.00B | -$13.60B | 108.08% | $231.69B | $38.62B | $77.23B | -$38.62B (27.3% EBIT) |
| `AMZN` | $169.60B | $212.00B | -$42.40B | 125.00% | $289.02B | $48.17B | $96.34B | -$48.17B (54.0% EBIT) |
| `MSFT` | $164.50B | $194.00B | -$29.50B | 117.93% | $238.24B | $39.71B | $79.41B | -$39.71B (28.6% EBIT) |
| `META` | $126.80B | $154.00B | -$27.20B | 121.45% | $195.76B | $32.63B | $65.25B | -$32.63B (35.3% EBIT) |
| `ORCL` | $24.80B | $82.50B | -$57.70B | 332.66% | $94.04B | $15.67B | $31.35B | -$15.67B (77.2% EBIT) |

### 3.4 Federal Reserve DFA Corporate Equity Distribution (`2026-Q2`)

| Wealth Bracket | Pop Share | Households (M) | Equity Held ($T) | Share of Equity | Mean Equity / HH |
| :- | :- | :- | :- | :- | :- |
| Bottom 50% | 50.0% | 67.0M | $0.55T | 1.00% | $8,209 |
| 50th-90th Percentile | 40.0% | 53.6M | $5.06T | 9.20% | $94,403 |
| 90th-99th Percentile | 9.0% | 12.1M | $21.73T | 39.50% | $1,795,868 |
| Top 1% | 1.0% | 1.3M | $27.67T | 50.30% | $21,284,615 |

### 3.5 PJM Wholesale Capacity Clearing Prices and IEA Data Center Load

| Series ID | Period | Value | Unit | Benchmark Note |
| :- | :- | :- | :- | :- |
| `PJM_BRA_RTO_PRICE` | 2024/2025 | 28.92 | USD/MW-day | Trough RTO capacity price ($2.2B total wholesale capacity cost) |
| `PJM_BRA_RTO_PRICE` | 2025/2026 | 269.92 | USD/MW-day | 833.33% single-auction spike ($14.7B total cost) driven by Northern Virginia and Ohio data center load |
| `PJM_BRA_RTO_PRICE` | 2026/2027 | 329.17 | USD/MW-day | Cleared at FERC-approved price cap across entire RTO ($16.1B total cost; +1038.21% vs 2024/2025) |
| `IEA_GLOBAL_DC_LOAD_TWH` | 2024 | 415.00 | TWh | Roughly 1.5 percent of global electricity consumption (415 TWh) |
| `IEA_GLOBAL_DC_LOAD_TWH` | 2026 | 565.00 | TWh | Continuous agentic inference and frontier training load |
| `IEA_GLOBAL_DC_LOAD_TWH` | 2030 | 945.00 | TWh | Base-case projection (945 TWh) surpasses Japan total annual electricity demand (~939 TWh) |

## 4. Canonical Verified Stat-Cards (`12` Cards)

Each Stat-Card below pairs primary-source math with a spoken camera rescale line (zero semicolons, zero exclamation marks, zero dash crutches) and a `reading-room-cinema` `macroTelemetry` block respecting the two-accent ceiling in `cinema_schema_contract.json`.

### STAT-MTS-01 · Individual Income and Payroll Tax Share of Federal Receipts
- **Bound Episodes:** `ep_01`, `ep_02` (`sovereign_finance`)
- **Dataset & Window:** `02_research_and_data/datasets/us_treasury_mts_table9_fy2024_fy2026.csv` (`FY2024` to `FY2026`, `annual_fiscal`)
- **Units:** % of unified federal receipts (and USD billions)
- **Primary Source:** U.S. Treasury Final Monthly Treasury Statement, Table 9 (Sept 2024 - Sept 2026)
- **Exact Figures:** `fy2024_share_pct=84.08`, `fy2024_headline_1dp_pct=84.1`, `fy2026_share_pct=86.4`, `fy2026_amount_usd_b=4648.32`, `fy2026_total_receipts_usd_b=5380.0`, `share_shift_bps=232.0`, `nominal_cagr_pct=6.017`, `real_cagr_pct=3.379`
- **Formula Audit Trail:** FY2024: ($2,426.07B individual + $1,709.57B payroll) / $4,918.73B = 84.08% (84.1% at 1dp). FY2026: ($2,792.22B + $1,856.10B) / $5,380.00B = 86.40%. Shift = +232.0 bps; nominal CAGR = 6.017%, real CAGR = 3.379%.
- **Camera Rescale Line:** "Out of every dollar Washington collects to keep the lights on and pay bondholders, more than eighty-six cents comes straight out of human paychecks and individual tax filings."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=milk-page-editorial`, `registerId=page_editorial`, `paletteMode=page`, `componentHint=TreasuryTable9Scene`, `glassPreset=card`, `semanticAccents=['statutory', 'liability']`

### STAT-MTS-02 · Corporate Income Tax Revenue Share Drop Under Immediate Hardware Expensing
- **Bound Episodes:** `ep_01`, `ep_03` (`sovereign_finance`)
- **Dataset & Window:** `02_research_and_data/datasets/us_treasury_mts_table9_fy2024_fy2026.csv` (`FY2024` to `FY2026`, `annual_fiscal`)
- **Units:** % of unified federal receipts (and USD billions)
- **Primary Source:** U.S. Treasury Final Monthly Treasury Statement, Table 9; July 2025 OBBBA Expensing Provisions
- **Exact Figures:** `fy2024_share_1dp_pct=10.8`, `fy2024_share_exact_pct=10.77`, `fy2024_amount_usd_b=529.87`, `fy2026_share_exact_pct=7.1`, `fy2026_amount_usd_b=382.0`, `share_drop_bps_1dp=-370.0`, `share_drop_bps_exact=-367.0`, `nominal_cagr_pct=-15.092`, `real_cagr_pct=-17.206`
- **Formula Audit Trail:** Corporate receipts fell from $529.87B (10.77%, 10.8% at 1dp) in FY2024 to $382.00B (7.10%) in FY2026. Dollar change = -$147.87B (-27.91%); nominal CAGR = -15.092%; CPI-deflated real CAGR = -17.206%.
- **Camera Rescale Line:** "Right in the middle of an eight-hundred-billion-dollar server boom, corporate income taxes fell from ten-point-eight percent of federal revenue down to seven-point-one percent because companies deduct new chips the year they buy them."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=milk-page-editorial`, `registerId=page_editorial`, `paletteMode=page`, `componentHint=DataPhysicalCard`, `glassPreset=card`, `semanticAccents=['statutory', 'liability']`

### STAT-MTS-03 · Federal Net Interest Surpassing Total National Defense Outlays
- **Bound Episodes:** `ep_01`, `ep_02` (`sovereign_finance`)
- **Dataset & Window:** `02_research_and_data/datasets/us_treasury_mts_table9_fy2024_fy2026.csv` (`FY2024` to `FY2026`, `annual_fiscal`)
- **Units:** USD billions
- **Primary Source:** U.S. Treasury Final Monthly Treasury Statement, Table 9 (Function 900 Net Interest vs Function 050 Defense)
- **Exact Figures:** `fy2026_net_interest_usd_b=1052.0`, `fy2026_defense_usd_b=965.0`, `interest_over_defense_spread_usd_b=87.0`, `interest_over_defense_pct=9.02`, `interest_share_of_receipts_pct=19.55`, `net_interest_nominal_cagr_pct=9.233`
- **Formula Audit Trail:** FY2026 Net Interest ($1,052.00B) minus National Defense ($965.00B) = +$87.00B (+9.02% above defense), widening from +$8.17B in FY2024. Net interest consumes 19.55% of all FY2026 federal tax receipts.
- **Camera Rescale Line:** "Washington paid one-point-zero-five-two trillion dollars in net bond interest during fiscal 2026, beating the entire nine-hundred-sixty-five-billion-dollar defense budget by eighty-seven billion dollars."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=smoked-navy-glass`, `registerId=page_editorial`, `paletteMode=over-footage`, `componentHint=GlassTelemetryStrip`, `glassPreset=telemetry-strip`, `semanticAccents=['liability', 'statutory']`

### STAT-BLS-01 · U.S. Nonfarm Output per Hour vs Real Hourly Compensation Wedge
- **Bound Episodes:** `ep_01`, `ep_04` (`ai_economics`)
- **Dataset & Window:** `02_research_and_data/datasets/bls_productivity_vs_compensation_2017_2026.csv` (`2017` to `2026`, `annual`)
- **Units:** Index (2017 = 100.0)
- **Primary Source:** Bureau of Labor Statistics Major Sector Productivity and Costs (Series OPHNFB & COMPRNFB)
- **Exact Figures:** `base_2017_index=100.0`, `output_per_hour_2026_idx=120.8`, `real_hourly_comp_2026_idx=109.6`, `cumulative_wedge_idx_pts=11.2`, `cumulative_wedge_bps=1120.0`, `productivity_cagr_pct=2.122`, `real_comp_cagr_pct=1.024`, `fisher_deflated_nominal_comp_cagr_pct=1.024`
- **Formula Audit Trail:** Output per hour grew from 100.0 (2017) to 120.80 (2026), a +20.80% gain (2.122% CAGR). Real hourly pay reached 109.60 (+9.60%, 1.024% CAGR; verified via nominal pay 147.41 / CPI 134.50 = 109.60). Wedge = +11.20 pts (+1,120 bps).
- **Camera Rescale Line:** "Since 2017, the output an American worker produces every hour climbed twenty-point-eight percent, while inflation-adjusted hourly pay rose nine-point-six percent, leaving an eleven-point gap on the table."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=milk-page-editorial`, `registerId=page_editorial`, `paletteMode=page`, `componentHint=ChartInstrumentFrame`, `glassPreset=card`, `semanticAccents=['capital', 'statutory']`

### STAT-BLS-02 · Nonfarm Business Labor Share Drop to Post-1947 Record Low
- **Bound Episodes:** `ep_01`, `ep_04` (`ai_economics`)
- **Dataset & Window:** `02_research_and_data/datasets/bls_productivity_vs_compensation_2017_2026.csv` (`2017` to `2026`, `annual`)
- **Units:** % of nonfarm business sector output
- **Primary Source:** Bureau of Labor Statistics Series PRS85006173 (Nonfarm Business Labor Share, 1947-2026)
- **Exact Figures:** `labor_share_2017_pct=56.9`, `labor_share_2026_annual_pct=52.9`, `labor_share_2026_q3_trough_pct=52.8`, `post_1947_historical_mean_pct=61.8`, `drift_2017_2026_bps=-400.0`, `spread_vs_postwar_mean_bps=-890.0`
- **Formula Audit Trail:** Nonfarm labor share moved from 56.90% in 2017 to 52.90% annual average in 2026 (52.80% Q3 trough), a -4.00 percentage-point (-400.0 bps) compression and -890.0 bps below the 61.80% post-1947 historical mean.
- **Camera Rescale Line:** "Workers collected roughly sixty-two cents of every nonfarm business dollar across the postwar decades, and by 2026 that slice dropped below fifty-three cents, the lowest reading since federal tracking started in 1947."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=archival-light-table`, `registerId=archival_parchment`, `paletteMode=page`, `componentHint=ChartInstrumentFrame`, `glassPreset=card`, `semanticAccents=['liability', 'statutory']`

### STAT-CAPEX-01 · Big-4 and Big-5 Hyperscaler Annual CapEx Surge ($742B to $824.5B)
- **Bound Episodes:** `ep_01`, `ep_03` (`ai_economics`)
- **Dataset & Window:** `02_research_and_data/datasets/hyperscaler_capex_fcf_depreciation_2023_2026.json` (`2023` to `2026`, `annual`)
- **Units:** USD billions
- **Primary Source:** SEC Form 10-K and Form 10-Q Cash Flow Statements (GOOGL, AMZN, MSFT, META, ORCL)
- **Exact Figures:** `big4_capex_2023_usd_b=140.36`, `big4_capex_2026_usd_b=742.0`, `big5_capex_2023_usd_b=149.05`, `big5_capex_2026_usd_b=824.5`, `big5_capex_to_ocf_2026_pct=126.05`, `big5_3yr_nominal_cagr_pct=76.86`
- **Formula Audit Trail:** 2026 Big-4 CapEx = $182.00B (GOOGL) + $212.00B (AMZN) + $194.00B (MSFT) + $154.00B (META) = $742.00B. Adding ORCL ($82.50B) yields $824.50B against $654.10B combined OCF (126.05% CapEx-to-OCF).
- **Camera Rescale Line:** "Alphabet, Amazon, Microsoft, and Meta are spending seven-hundred-forty-two billion dollars a year on servers and data centers, climbing past eight-hundred-twenty-four billion once you add Oracle."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=blueprint-schematic`, `registerId=drafting_blueprint`, `paletteMode=page`, `componentHint=IsometricDiorama3D`, `glassPreset=stat-triptych`, `semanticAccents=['capital', 'liability']`

### STAT-CAPEX-02 · Hyperscaler Free Cash Flow Inversion: Amazon -$42.4B TTM and Alphabet Negative Quarters
- **Bound Episodes:** `ep_01`, `ep_03` (`ai_economics`)
- **Dataset & Window:** `02_research_and_data/datasets/hyperscaler_capex_fcf_depreciation_2023_2026.json` (`2024` to `2026-Q3 TTM`, `quarterly_and_ttm`)
- **Units:** USD billions
- **Primary Source:** Amazon Q3 2026 Form 10-Q TTM Cash Flows; Alphabet Q2 2026 & Q3 2026 Form 10-Q Filings
- **Exact Figures:** `amzn_2026_ttm_fcf_usd_b=-42.4`, `amzn_2026_capex_to_ocf_pct=125.0`, `googl_2026_q2_fcf_usd_b=-5.6`, `googl_2026_q3_fcf_usd_b=-7.9`, `googl_2026_annual_fcf_usd_b=-13.6`, `big5_2024_fcf_usd_b=230.99`, `big5_2026_fcf_usd_b=-170.4`, `two_year_fcf_reversal_usd_b=-401.39`
- **Formula Audit Trail:** FCF = Operating Cash Flow minus CapEx. Amazon 2026 TTM: $169.60B - $212.00B = -$42.40B (125.00% CapEx-to-OCF). Alphabet Q2 2026: $41.20B - $46.80B = -$5.60B; Q3 2026: $43.50B - $51.40B = -$7.90B. Big-5 combined FCF swung from +$230.99B (2024) to -$170.40B (2026).
- **Camera Rescale Line:** "Alphabet posted back-to-back quarters of negative free cash flow in mid-2026, and Amazon burned forty-two-point-four billion dollars more in capital spending than its operations brought in over twelve months."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=smoked-navy-glass`, `registerId=page_editorial`, `paletteMode=over-footage`, `componentHint=GlassTelemetryStrip`, `glassPreset=telemetry-strip`, `semanticAccents=['liability', 'solvent']`

### STAT-CAPEX-03 · Straight-Line Server Useful-Life Sensitivity: 3-Year Silicon Cadence vs 6-Year Schedule
- **Bound Episodes:** `ep_03` (`ai_economics`)
- **Dataset & Window:** `02_research_and_data/datasets/hyperscaler_capex_fcf_depreciation_2023_2026.json` (`2024 cohort` to `2026 active stack`, `annual`)
- **Units:** USD billions per year (and % of GAAP operating income)
- **Primary Source:** SEC Form 10-K Accounting Policies Notes (Property and Equipment Useful-Life Schedules, 2023-2026)
- **Exact Figures:** `active_3yr_ai_hardware_ppe_usd_b=1048.75`, `annual_dep_6yr_schedule_usd_b=174.79`, `annual_dep_3yr_schedule_usd_b=349.58`, `pretax_ebit_hit_active_stack_usd_b=-174.79`, `after_tax_ni_hit_active_stack_usd_b=-138.09`, `ebit_compression_pct=36.26`, `single_2026_vintage_pretax_hit_usd_b=-99.15`
- **Formula Audit Trail:** Active 2024-2026 Big-5 AI hardware gross PP&E = $1,048.75B. 6-year straight-line D6 = K/6 = $174.79B/yr; 3-year D3 = K/3 = $349.58B/yr. Pre-tax operating income hit = -$174.79B/yr (36.26% of $482.00B Big-5 EBIT).
- **Camera Rescale Line:** "Stretching AI chip depreciation out to six years while new Nvidia architectures arrive every twenty-four to thirty-six months shields nearly one-hundred-seventy-five billion dollars a year in pre-tax tech profits."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=archival-light-table`, `registerId=archival_parchment`, `paletteMode=page`, `componentHint=GlassSplitModal`, `glassPreset=compare-scale`, `semanticAccents=['capital', 'liability']`

### STAT-DFA-01 · U.S. Household Corporate Equity Ownership Concentration (Top 10% vs Bottom 50%)
- **Bound Episodes:** `ep_01`, `ep_05` (`sovereign_finance`)
- **Dataset & Window:** `02_research_and_data/datasets/fed_dfa_equity_wealth_deciles.csv` (`2026-Q2` to `2026-Q2`, `quarterly_cross_section`)
- **Units:** % of household corporate equities and mutual fund shares (and USD trillions)
- **Primary Source:** Federal Reserve Distributional Financial Accounts (Release Z.1 DFA, 2026-Q2)
- **Exact Figures:** `top_1_share_pct=50.3`, `next_9_share_pct=39.5`, `top_10_share_pct=89.8`, `bottom_50_share_pct=1.0`, `top_10_usd_trillions=49.4`, `bottom_50_usd_trillions=0.55`, `aggregate_ratio_top10_vs_bot50_x=89.8`, `per_household_ratio_top10_vs_bot50_x=449.0`, `grouped_equity_gini=0.8813`
- **Formula Audit Trail:** Top 10% share = Top 1% (50.30%) + Next 9% (39.50%) = 89.80% ($49.40T of $55.01T) vs Bottom 50% at 1.00% ($0.55T across 67.0M households). Aggregate ratio = 89.80x; per-household ratio = 449.00x; grouped Gini = 0.8813.
- **Camera Rescale Line:** "Sixty percent of American families own at least some stock, yet the richest ten percent hold eighty-nine-point-eight percent of all stock-market wealth while the bottom sixty-seven million households split a single percent."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=milk-page-editorial`, `registerId=page_editorial`, `paletteMode=page`, `componentHint=DataPhysicalCard`, `glassPreset=card`, `semanticAccents=['capital', 'liability']`

### STAT-DFA-02 · Thirty-Seven-Year Equity Concentration Drift and Upper-Middle Squeeze (1989-Q3 to 2026-Q2)
- **Bound Episodes:** `ep_01`, `ep_05` (`sovereign_finance`)
- **Dataset & Window:** `02_research_and_data/datasets/fed_dfa_equity_wealth_deciles.csv` (`1989-Q3` to `2026-Q2`, `multi_decade_panel`)
- **Units:** Percentage points and basis points of equity ownership share
- **Primary Source:** Federal Reserve Release Z.1 DFA Historical Series (1989-2026) & Survey of Consumer Finances
- **Exact Figures:** `top_10_share_1989_q3_pct=81.8`, `top_10_share_2026_q2_pct=89.8`, `top_10_gain_bps=800.0`, `next_40_share_1989_q3_pct=17.1`, `next_40_share_2026_q2_pct=9.2`, `next_40_loss_bps=-790.0`, `scf_participation_1989_pct=31.9`, `scf_participation_2026_pct=60.1`
- **Formula Audit Trail:** Between 1989-Q3 and 2026-Q2, Top 10% equity share rose from 81.80% (42.40% + 39.40%) to 89.80% (+800.0 bps), while the 50th-90th percentile fell from 17.10% to 9.20% (-790.0 bps) and the Bottom 50% moved from 1.10% to 1.00% (-10.0 bps).
- **Camera Rescale Line:** "Forty years of 401(k) enrollment doubled the share of families holding a brokerage account, while the fifty-to-ninetieth-percentile middle class lost nearly half its slice of total stock ownership to the top ten percent."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=smoked-navy-glass`, `registerId=page_editorial`, `paletteMode=over-footage`, `componentHint=GlassTelemetryStrip`, `glassPreset=telemetry-strip`, `semanticAccents=['capital', 'statutory']`

### STAT-GRID-01 · PJM 13-State Wholesale Capacity Clearing Price Surge ($28.92 to $329.17/MW-day)
- **Bound Episodes:** `ep_01`, `ep_06` (`physical_grid_and_security`)
- **Dataset & Window:** `02_research_and_data/datasets/pjm_capacity_auctions_and_iea_dc_load.csv` (`2024/2025` to `2026/2027`, `delivery_year`)
- **Units:** USD per megawatt-day (and USD billions annual wholesale cost)
- **Primary Source:** PJM Interconnection Base Residual Auction Reports (2024/2025, 2025/2026, and 2026/2027 Delivery Years)
- **Exact Figures:** `price_2024_2025_usd_mw_day=28.92`, `price_2025_2026_usd_mw_day=269.92`, `price_2026_2027_usd_mw_day=329.17`, `single_auction_jump_25_26_pct=833.33`, `cumulative_jump_24_27_pct=1038.21`, `cumulative_multiple_x=11.382`, `nominal_2yr_cagr_pct=237.374`, `real_2yr_cagr_pct=228.977`, `total_procurement_2026_2027_usd_b=16.1`
- **Formula Audit Trail:** 2024/2025 ($28.92/MW-day) to 2025/2026 ($269.92/MW-day) = +833.33% (+$241.00/MW-day). 2026/2027 hit the FERC cap at $329.17/MW-day (+1038.21% cumulative, 11.382x; 2-yr nominal CAGR = 237.374%, CPI-adjusted real CAGR = 228.977%). Wholesale capacity bill rose from $2.20B to $16.10B.
- **Camera Rescale Line:** "Across thirteen states and Washington, D.C., the wholesale price paid just to keep power plants standing by jumped from twenty-eight dollars and ninety-two cents per megawatt-day to two-hundred-sixty-nine, then capped out above three-hundred-twenty-nine."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=geospatial-telemetry`, `registerId=midnight_telemetry`, `paletteMode=page`, `componentHint=MapExplainer`, `glassPreset=map-callout`, `semanticAccents=['liability', 'capital']`

### STAT-GRID-02 · IEA Global and U.S. Data Center Electricity Demand Surge (415 TWh to 945 TWh)
- **Bound Episodes:** `ep_01`, `ep_06` (`physical_grid_and_security`)
- **Dataset & Window:** `02_research_and_data/datasets/pjm_capacity_auctions_and_iea_dc_load.csv` (`2024` to `2030`, `annual_projection`)
- **Units:** Terawatt-hours (TWh) per year
- **Primary Source:** International Energy Agency (IEA) Energy and AI Special Report (Base Case)
- **Exact Figures:** `global_2024_twh=415.0`, `global_2030_twh=945.0`, `global_net_addition_twh=530.0`, `global_pct_growth=127.71`, `global_6yr_cagr_pct=14.7`, `us_2024_twh=183.0`, `us_2030_twh=426.0`, `us_pct_growth=132.79`, `japan_annual_consumption_benchmark_twh=939.0`
- **Formula Audit Trail:** Global data center demand rises from 415.0 TWh (2024) to 945.0 TWh (2030): +530.0 TWh (+127.71%, 6-year CAGR = 14.700%), passing Japan (~939 TWh). U.S. demand climbs from 183.0 TWh to 426.0 TWh (+243.0 TWh, +132.79%, CAGR = 15.122%, 45.85% of global net additions).
- **Camera Rescale Line:** "Worldwide server farms drew four-hundred-fifteen terawatt-hours of electricity in 2024, and by 2030 they are on track to pull nine-hundred-forty-five terawatt-hours, more power than the entire nation of Japan uses in a year."
- **Cinema `macroTelemetry` Binding:** `visualRegisterId=geospatial-telemetry`, `registerId=midnight_telemetry`, `paletteMode=page`, `componentHint=ChartInstrumentFrame`, `glassPreset=telemetry-strip`, `semanticAccents=['capital', 'solvent']`

## 5. Adversarial Accounting and Econometric Guardrails

1. **Corporate Expensing vs Vendor Tax Incidence (`STAT-MTS-02`):** Immediate 100% write-offs on domestic servers and chips under the July 2025 tax law compress corporate income tax payments at the hyperscaler buyer (`10.8%` down to `7.1%` of federal receipts), while hardware margins still generate taxable revenue at chip designers, foundries, and electrical contractors. The structural fiscal risk sits in collection friction: Friday W-2 withholding captures payroll taxes automatically before cash hits checking accounts, whereas corporate profits can be offset by hardware deductions, routed across intellectual-property jurisdictions, or held unrealized inside appreciated equity.
2. **Pandemic Composition Spike in BLS Productivity (`STAT-BLS-01`):** Both output per hour (`109.1`) and real hourly pay (`109.9`) jumped artificially in 2020 because lockdowns removed millions of lower-paid hospitality and retail hours from the denominator. Measuring the full 2017-to-2026 cycle looks past that temporary composition swing and isolates the post-2022 divergence where productivity rose to `120.8` while real pay stalled at `109.6`.
3. **Household Stock Participation vs Dollar Concentration (`STAT-DFA-01` & `STAT-DFA-02`):** Survey of Consumer Finances data confirms that `60.1%` of American families hold some direct or retirement-account equity. Distributional Financial Accounts dollar totals show why broad participation fails to replace lost wages: the bottom `67.0 million` households split `1.00%` (`$0.55T`, averaging `$8,209` per household), while the top `10%` own `89.80%` (`$49.40T`).
4. **Short-Run Grid Bottlenecks vs Multi-Decade Supply Elasticity (`STAT-GRID-01`):** An `833.33%` PJM capacity jump followed by a capped `$329.17/MW-day` clearing price triggers turbine, battery, and nuclear restart contracts over a ten-year horizon. Household utility bills absorb the squeeze during the five-to-ten-year permitting and transformer lead time separating six-month software rollouts from high-voltage substation energizing.
