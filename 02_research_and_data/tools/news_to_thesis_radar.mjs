#!/usr/bin/env node
/**
 * Deliverable #11: Live News-to-Structural-Thesis Hijack Radar CLI
 * Repository: reading-room-editorial-os/02_research_and_data/tools/news_to_thesis_radar.mjs
 * Runtime: Node.js >= 20 ESM, zero external npm dependencies.
 *
 * Evaluates breaking 2027 headlines across AI, macroeconomics, finance,
 * cybersecurity, geopolitics, tech policy, and household life inside a
 * two-hour rapid-triage window. Scores five 20-point quantitative dimensions
 * (100 points total), assigns one of four deterministic routing verdicts,
 * and generates a staleness-immune Structural Hijack Brief.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_BATCH_PATH = path.join(REPO_ROOT, "02_research_and_data", "data", "sample_news_events_2027.json");
const EXTERNAL_SLATE_PATH = path.join(REPO_ROOT, "02_research_and_data", "slate_30_jan2028.json");

const VALID_DOMAINS = new Set(["ai", "macro", "finance", "cyber", "geopolitics", "policy", "life"]);

const MASTER_SLATE_30 = [
  {
    ep_id: "ep_01",
    publish_date: "2027-02-02",
    preset: "STR-GEN-EXPLAINER",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "The Allowance: AI Paychecks vs. $40.5T National Debt",
    pre_recorded: true,
    domains: ["ai", "macro", "life"],
    live_stat_slot_id: "MTS_TABLE9_PAYROLL_SHARE_FY",
    fallback_baseline: "86.1 percent individual and payroll share of federal receipts in fiscal 2026",
    primary_table: "US Treasury Monthly Treasury Statement Table 9 and CBO 10-Year Net Interest Baseline",
    character_anchor: "Claire, 32, Austin software engineer carrying a $3,400 fixed 30-year mortgage",
    keywords: ["payroll tax", "w-2", "universal basic", "ubi", "dividend", "national debt", "treasury", "40.5 trillion", "paycheck", "abundance", "allowance", "withholding", "interest payments"]
  },
  {
    ep_id: "ep_02",
    publish_date: "2027-02-14",
    preset: "STR-FISHER-ARTIFACT",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "Who Buys the Debt When Foreign Central Banks Step Back",
    pre_recorded: true,
    domains: ["macro", "finance", "geopolitics"],
    live_stat_slot_id: "TIC_FOREIGN_OFFICIAL_SHARE",
    fallback_baseline: "Foreign official Treasury holdings share and quarterly primary-dealer takedown ratio",
    primary_table: "US Treasury TIC Major Foreign Holders Schedule and NY Fed Primary Dealer Statistics",
    character_anchor: "Municipal pension beneficiary and 10-year mortgage rate shopper",
    keywords: ["bond auction", "treasury auction", "foreign central bank", "primary dealer", "yield", "10-year", "tic", "sovereign debt", "pension", "repo", "liquidity", "tail"]
  },
  {
    ep_id: "ep_03",
    publish_date: "2027-02-26",
    preset: "STR-BOYLE-CHAPTERED",
    series: "Series 02: AI Bubble, Corporate Accounting & Wall Street Math",
    title: "The Depreciation Trick Hiding Inside Big Tech Earnings",
    pre_recorded: true,
    domains: ["finance", "ai", "life"],
    live_stat_slot_id: "SEC_10K_SERVER_USEFUL_LIFE_FCF",
    fallback_baseline: "$740B to $820B annual hyperscaler capex vs. 5-to-6-year server depreciation schedules",
    primary_table: "SEC Form 10-K Property and Equipment Footnotes and Consolidated Statements of Cash Flows",
    character_anchor: "Passive S&P 500 401(k) target-date saver concentrated in top five tech issuers",
    keywords: ["depreciation", "useful life", "capex", "free cash flow", "10-k", "10-q", "server", "hyperscaler", "impairment", "write-down", "earnings", "gaap"]
  },
  {
    ep_id: "ep_04",
    publish_date: "2027-03-10",
    preset: "STR-HMW-PRIMER",
    series: "Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy",
    title: "Authorized Push Fraud: Why Banks Keep Your Money After an AI Clone Call",
    pre_recorded: false,
    domains: ["cyber", "policy", "life", "finance"],
    live_stat_slot_id: "CFPB_REG_E_APP_FRAUD_LOSS",
    fallback_baseline: "Regulation E 12 CFR 1005 liability split on authorized wire and instant-rail transfers",
    primary_table: "CFPB Electronic Fund Transfers Docket, FedNow Loss Reports, and 12 CFR Part 1005",
    character_anchor: "Suburban parents wiring a home closing deposit after a cloned voice call",
    keywords: ["voice clone", "wire fraud", "regulation e", "authorized push", "zed", "fednow", "zelle", "bank liability", "impersonation", "scam", "deepfake", "depositor"]
  },
  {
    ep_id: "ep_05",
    publish_date: "2027-03-22",
    preset: "STR-GEN-EXPLAINER",
    series: "Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics",
    title: "Why Your Electric Bill Subsidizes Five-Gigawatt Server Campuses",
    pre_recorded: false,
    domains: ["geopolitics", "macro", "life", "ai"],
    live_stat_slot_id: "PJM_ERCOT_CAPACITY_MW_DAY",
    fallback_baseline: "PJM capacity clearing jump from $28.92 to $269.92 per megawatt-day",
    primary_table: "PJM Base Residual Auction Report, State PUC Tariff Dockets, and FERC Interconnection Queues",
    character_anchor: "Ohio and Virginia residential utility ratepayers funding 20-year substation upgrades",
    keywords: ["pjm", "ercot", "megawatt", "gigawatt", "capacity auction", "electric bill", "utility", "substation", "data center", "ratepayer", "tariff", "nuclear", "grid"]
  },
  {
    ep_id: "ep_06",
    publish_date: "2027-04-03",
    preset: "STR-MAX-ESSAY",
    series: "Series 02: AI Bubble, Corporate Accounting & Wall Street Math",
    title: "Shadow GPU Debt: Private Credit Special-Purpose Vehicles Backed by Silicon",
    pre_recorded: false,
    domains: ["finance", "ai", "macro"],
    live_stat_slot_id: "NAIC_SEC_GPU_SPV_SPREAD",
    fallback_baseline: "Off-balance-sheet GPU lease SPVs pledged to life insurers and private credit funds",
    primary_table: "SEC Form 8-K Debt Covenants, NAIC Life Insurer Schedule BA, and BIS Private Credit Bulletins",
    character_anchor: "Annuity holder and state pension fund allocated to private-credit vehicles",
    keywords: ["private credit", "spv", "gpu", "collateral", "lease", "off-balance-sheet", "insurer", "covenant", "neocloud", "chip collateral", "securitization"]
  },
  {
    ep_id: "ep_07",
    publish_date: "2027-04-15",
    preset: "STR-AIC-SPECULATIVE",
    series: "Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics",
    title: "The Eight-Year Wait for High-Voltage Transformers",
    pre_recorded: false,
    domains: ["geopolitics", "ai", "macro"],
    live_stat_slot_id: "DOE_GDO_TRANSFORMER_LEAD_MONTHS",
    fallback_baseline: "48-to-96-month large power transformer delivery lead times and grain-oriented steel supply",
    primary_table: "US DOE Grid Deployment Office Supply Assessment and USITC Electrical Steel Import Filings",
    character_anchor: "Regional homebuilder with 400 finished lots waiting on substation energization",
    keywords: ["transformer", "grain-oriented", "electrical steel", "substation", "transmission", "copper", "lead time", "interconnection", "grid bottleneck"]
  },
  {
    ep_id: "ep_08",
    publish_date: "2027-04-27",
    preset: "STR-MAX-ESSAY",
    series: "Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy",
    title: "Autonomous Zero-Day Agents vs. Corporate Cyber Insurance Exclusions",
    pre_recorded: false,
    domains: ["cyber", "finance", "policy"],
    live_stat_slot_id: "CISA_KEV_EXPLOIT_VELOCITY_HOURS",
    fallback_baseline: "Median hours between CVE disclosure and automated exploitation vs. Lloyd's war/AI exclusions",
    primary_table: "CISA Known Exploited Vulnerabilities Catalog, NIST NVD, and Commercial Cyber Policy Endorsements",
    character_anchor: "Mid-market hospital CFO denied ransomware business-interruption payout",
    keywords: ["cve", "zero-day", "cisa", "ransomware", "cyber insurance", "exclusion", "exploit", "vulnerability", "patch", "autonomous agent", "breach"]
  },
  {
    ep_id: "ep_09",
    publish_date: "2027-05-09",
    preset: "STR-FISHER-ARTIFACT",
    series: "Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics",
    title: "Subsea Cables, Sovereign Compute Zones, and the Splinternet Ledger",
    pre_recorded: false,
    domains: ["geopolitics", "cyber", "policy"],
    live_stat_slot_id: "FCC_TELEGEOGRAPHY_CABLE_LANDINGS",
    fallback_baseline: "Hyperscaler ownership share of transoceanic fiber capacity and sovereign data-residency mandates",
    primary_table: "FCC Submarine Cable Landing Licenses and EU/Gulf Sovereign Cloud Procurement Filings",
    character_anchor: "Cross-border SaaS founder hit by regional compute localization rules",
    keywords: ["subsea cable", "submarine cable", "data residency", "sovereign cloud", "export control", "fiber", "chokepoint", "strait"]
  },
  {
    ep_id: "ep_10",
    publish_date: "2027-05-21",
    preset: "STR-BOYLE-CHAPTERED",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "The Entry-Level Ladder Collapse: Junior Wages and Student Loan Math",
    pre_recorded: false,
    domains: ["life", "macro", "ai"],
    live_stat_slot_id: "NYFED_RECENT_GRAD_UNEMPLOYMENT_GAP",
    fallback_baseline: "New-graduate underemployment spread and federal student-loan income-driven delinquency rate",
    primary_table: "NY Fed Labor Market for Recent College Graduates and US Ed FSA Portfolio Summary",
    character_anchor: "23-year-old accounting and CS graduates pricing $38,000 student debt against junior hiring freezes",
    keywords: ["junior", "entry-level", "graduate", "hiring freeze", "student loan", "intern", "associate", "headcount", "coding agent", "paralegal", "analyst"]
  },
  {
    ep_id: "ep_11",
    publish_date: "2027-06-02",
    preset: "STR-GEN-EXPLAINER",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "Municipal Bond Trap: What Happens to Downtown Tax Bases When Offices Empty",
    pre_recorded: false,
    domains: ["macro", "finance", "life"],
    live_stat_slot_id: "CMBS_OFFICE_DELINQUENCY_MUNI_SHARE",
    fallback_baseline: "Commercial office CMBS special-servicing rate vs. city property-tax budget dependency",
    primary_table: "Trepp/Fed Z.1 Commercial Real Estate Debt Series and Big-City Audited Annual Financial Statements",
    character_anchor: "Public school teacher and homeowner absorbing residential property-tax reassessments",
    keywords: ["commercial real estate", "office", "cmbs", "municipal bond", "property tax", "vacancy", "downtown", "transit", "city budget"]
  },
  {
    ep_id: "ep_12",
    publish_date: "2027-06-14",
    preset: "STR-HMW-PRIMER",
    series: "Series 02: AI Bubble, Corporate Accounting & Wall Street Math",
    title: "Token Deflation vs. Seat Licenses: The SaaS Seat-Compression Audit",
    pre_recorded: false,
    domains: ["finance", "ai", "life"],
    live_stat_slot_id: "SEC_SAAS_NET_RETENTION_SEAT_COUNT",
    fallback_baseline: "Enterprise SaaS net-dollar-retention compression as per-seat headcount contracts",
    primary_table: "SEC Form 10-Q Remaining Performance Obligations and Enterprise Seat-License Disclosures",
    character_anchor: "Enterprise procurement lead renegotiating per-seat CRM and workflow contracts",
    keywords: ["per-seat", "saas", "seat license", "net retention", "token", "pricing", "enterprise software", "rpo", "churn", "agent pricing"]
  },
  {
    ep_id: "ep_13",
    publish_date: "2027-06-26",
    preset: "STR-AOTP-LADDER",
    series: "Series 02: AI Bubble, Corporate Accounting & Wall Street Math",
    title: "Circular Revenue: Cloud Credits Counted as AI Startup Growth",
    pre_recorded: false,
    domains: ["finance", "ai", "policy"],
    live_stat_slot_id: "SEC_RELATED_PARTY_CLOUD_COMMITS",
    fallback_baseline: "Strategic cloud-credit investments booked against multi-year compute purchase commitments",
    primary_table: "SEC Form 10-K Related-Party Footnotes, ASC 606 Revenue Recognition Disclosures, and FTC 6(b) Reports",
    character_anchor: "Late-stage crossover fund investor inside retail interval funds",
    keywords: ["cloud credit", "round-trip", "circular revenue", "asc 606", "related party", "compute commitment", "strategic investment", "valuation"]
  },
  {
    ep_id: "ep_14",
    publish_date: "2027-07-08",
    preset: "STR-FISHER-ARTIFACT",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "Irish IP Routing and Bonus Depreciation: Why AI Booms Starve Corporate Tax",
    pre_recorded: false,
    domains: ["macro", "policy", "finance"],
    live_stat_slot_id: "TREASURY_CORP_TAX_SHARE_EFFECTIVE",
    fallback_baseline: "Corporate income tax share at 7.1 percent of federal receipts post-100-percent expensing",
    primary_table: "US Treasury MTS Table 9, IRS SOI Corporate Schedule M-3, and OECD Pillar Two Filings",
    character_anchor: "Domestic W-2 household paying 24 percent marginal withholding plus FICA",
    keywords: ["corporate tax", "bonus depreciation", "100 percent", "expensing", "ireland", "intellectual property", "tax code", "effective tax rate", "oecd"]
  },
  {
    ep_id: "ep_15",
    publish_date: "2027-07-20",
    preset: "STR-AIC-CLOCKED",
    series: "Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics",
    title: "Taiwan Silicon Shield vs. Domestic Fab Water and Labor Arithmetic",
    pre_recorded: false,
    domains: ["geopolitics", "ai", "macro"],
    live_stat_slot_id: "COMMERCE_CHIPS_LEADING_NODE_SHARE",
    fallback_baseline: "Sub-3nm logic wafer geographic concentration and US fab wafer cost premium",
    primary_table: "US Commerce Industrial Base Assessments, TSMC/Intel Form 20-F/10-K Capex, and Municipal Water Permits",
    character_anchor: "Phoenix industrial technician and consumer electronics buyer",
    keywords: ["tsmc", "taiwan", "semiconductor", "fab", "lithography", "asml", "wafer", "chips act", "export ban", "2nm", "3nm", "packaging"]
  },
  {
    ep_id: "ep_16",
    publish_date: "2027-08-01",
    preset: "STR-BOYLE-CHAPTERED",
    series: "Series 02: AI Bubble, Corporate Accounting & Wall Street Math",
    title: "401(k) Concentration Risk: Seven Tickers Carrying Passive Retirement",
    pre_recorded: false,
    domains: ["finance", "life", "macro"],
    live_stat_slot_id: "SP500_TOP7_WEIGHT_CAPEX_RATIO",
    fallback_baseline: "Top-seven issuer market-cap share of S&P 500 vs. trailing free-cash-flow yield",
    primary_table: "Vanguard/Fidelity 401(k) Plan Holdings Filings, S&P Index Weight Tables, and Fed SCF",
    character_anchor: "54-year-old engineer 11 years from retirement with 85 percent target-date equity weight",
    keywords: ["401(k)", "index fund", "s&p 500", "concentration", "passive", "retirement", "magnificent", "top seven", "target-date", "multiple"]
  },
  {
    ep_id: "ep_17",
    publish_date: "2027-08-13",
    preset: "STR-GEN-EXPLAINER",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "Social Security Trust Fund Depletion Accelerated by Payroll Automation",
    pre_recorded: false,
    domains: ["macro", "life", "policy"],
    live_stat_slot_id: "SSA_OASI_DEPLETION_YEAR_PAYROLL",
    fallback_baseline: "SSA Trustees OASI trust-fund exhaustion date and taxable payroll cap share",
    primary_table: "Social Security Trustees Annual Report Table II.D2 and CBO OASDI Projections",
    character_anchor: "61-year-old retiree and 26-year-old FICA contributor funding OASI",
    keywords: ["social security", "oasi", "trust fund", "fica", "payroll", "medicare", "benefit cut", "retirement age", "trustees report"]
  },
  {
    ep_id: "ep_18",
    publish_date: "2027-08-25",
    preset: "STR-MAX-ESSAY",
    series: "Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy",
    title: "Synthetic Identity Farms and the Death of Knowledge-Based Verification",
    pre_recorded: false,
    domains: ["cyber", "finance", "life"],
    live_stat_slot_id: "FED_SYNTHETIC_ID_LOSS_BILLIONS",
    fallback_baseline: "US lender synthetic-identity charge-offs and credit-bureau freeze adoption rate",
    primary_table: "Federal Reserve Synthetic Identity Fraud White Papers, FinCEN SAR Trends, and FCRA Dockets",
    character_anchor: "Renter discovering a synthetic credit file tied to a child Social Security number",
    keywords: ["synthetic identity", "kyc", "fincen", "credit bureau", "ssn", "identity theft", "charge-off", "authentication", "passkey", "hardware key"]
  },
  {
    ep_id: "ep_19",
    publish_date: "2027-09-06",
    preset: "STR-AIC-SPECULATIVE",
    series: "Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy",
    title: "Programmable Wallets, Expiring Credits, and Modern Company Scrip",
    pre_recorded: false,
    domains: ["policy", "cyber", "life", "macro"],
    live_stat_slot_id: "BIS_CBDC_STABLECOIN_PROGRAMMABLE_SHARE",
    fallback_baseline: "Closed-loop platform wallet exit fees and programmable transfer restrictions",
    primary_table: "BIS Project Rosalind/Agorá Reports, 1938 FLSA Section 3(m) Case Law, and Stablecoin Reserve Filings",
    character_anchor: "Gig contractor paid inside an ecosystem wallet charging instant-cashout fees",
    keywords: ["cbdc", "programmable money", "stablecoin", "scrip", "closed-loop", "wallet", "cashout fee", "digital currency", "token wallet"]
  },
  {
    ep_id: "ep_20",
    publish_date: "2027-09-18",
    preset: "STR-HMW-PRIMER",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "Algorithmic Rent, Dynamic Pricing, and Antitrust Statutory Limits",
    pre_recorded: false,
    domains: ["policy", "life", "finance"],
    live_stat_slot_id: "DOJ_ALGORITHMIC_PRICING_DOCKET_COUNT",
    fallback_baseline: "Multi-family algorithmic revenue-management share and Sherman Act Section 1 filings",
    primary_table: "DOJ Antitrust Division Civil Complaints, CFPB Tenant Screening Reports, and CPI Shelter Weights",
    character_anchor: "27-year-old apartment renter facing synchronized renewal quotes across six landlords",
    keywords: ["algorithmic pricing", "dynamic pricing", "rent", "antitrust", "sherman act", "collusion", "landlord", "shelter", "lease renewal"]
  },
  {
    ep_id: "ep_21",
    publish_date: "2027-09-30",
    preset: "STR-FISHER-ARTIFACT",
    series: "Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy",
    title: "Training-Data Copyright Settlements vs. Open-Web Collapse",
    pre_recorded: false,
    domains: ["policy", "ai", "finance"],
    live_stat_slot_id: "SDNY_NDCA_AI_LICENSING_DEAL_TOTAL",
    fallback_baseline: "Annual publisher AI licensing fees vs. open-web referral traffic decline",
    primary_table: "Federal District Court Fair-Use Dockets (SDNY/NDCA) and Public Publisher 10-K Licensing Disclosures",
    character_anchor: "Independent technical publisher losing 60 percent search click-through to answer engines",
    keywords: ["copyright", "fair use", "training data", "licensing", "publisher", "lawsuit", "search traffic", "synthetic data"]
  },
  {
    ep_id: "ep_22",
    publish_date: "2027-10-12",
    preset: "STR-GEN-EXPLAINER",
    series: "Series 02: AI Bubble, Corporate Accounting & Wall Street Math",
    title: "Stock-Based Compensation Dilution When Engineers Get Replaced by Compute",
    pre_recorded: false,
    domains: ["finance", "ai", "life"],
    live_stat_slot_id: "SEC_SBC_TO_CAPEX_SHIFT_RATIO",
    fallback_baseline: "Tech SBC share of revenue vs. hardware depreciation and share-buyback outlays",
    primary_table: "SEC Form 10-K Statements of Stockholders Equity and Non-GAAP Reconciliation Tables",
    character_anchor: "Mid-level tech employee whose unvested RSU refresh shrinks alongside headcount",
    keywords: ["stock-based compensation", "sbc", "rsu", "buyback", "dilution", "non-gaap", "compensation", "equity grant"]
  },
  {
    ep_id: "ep_23",
    publish_date: "2027-10-24",
    preset: "STR-BOYLE-CHAPTERED",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "Financial Repression: How Governments Clear Debt Through Yield Caps",
    pre_recorded: false,
    domains: ["macro", "finance", "life"],
    live_stat_slot_id: "FED_TREASURY_REAL_YIELD_DEBT_GDP",
    fallback_baseline: "Federal debt held by the public >100 percent of GDP vs. 1942-1951 Treasury-Fed yield peg",
    primary_table: "Federal Reserve Archival FOMC Minutes (1942-1951), CBO Long-Term Outlook, and Bank SLR Rules",
    character_anchor: "Household holding cash T-bills and CDs earning negative real after-tax yield",
    keywords: ["yield curve control", "financial repression", "slr", "bank capital exemption", "real yield", "inflation", "fomc", "fed balance sheet", "qe"]
  },
  {
    ep_id: "ep_24",
    publish_date: "2027-11-05",
    preset: "STR-AOTP-LADDER",
    series: "Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy",
    title: "Attention Capture Engineering and Youth Platform Liability Laws",
    pre_recorded: false,
    domains: ["policy", "life", "ai"],
    live_stat_slot_id: "STATE_AG_ALGORITHMIC_FEED_DOCKETS",
    fallback_baseline: "Multi-state AG youth-feed litigation dockets and short-video daily engagement minutes",
    primary_table: "State Attorneys General Multidistrict Litigation Filings, Section 230 Appellate Rulings, and Surgeon General Data",
    character_anchor: "High-school student and household setting device-level protocol locks",
    keywords: ["section 230", "social media", "youth", "addiction", "recommendation", "feed", "age verification", "attorney general"]
  },
  {
    ep_id: "ep_25",
    publish_date: "2027-11-17",
    preset: "STR-AIC-SPECULATIVE",
    series: "Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics",
    title: "Autonomous Port, Warehouse, and Trucking Economics vs. Regional Tax Towns",
    pre_recorded: false,
    domains: ["ai", "macro", "geopolitics", "life"],
    live_stat_slot_id: "BTS_PORT_AUTOMATION_FREIGHT_TON_MILE",
    fallback_baseline: "Automated container-terminal throughput cost vs. freight corridor payroll employment",
    primary_table: "US Bureau of Transportation Statistics Freight Ledgers, Maritime Contract Filings, and FMCSA Autonomous Dockets",
    character_anchor: "Midwest logistics owner-operator carrying a $165,000 commercial rig loan",
    keywords: ["port", "trucking", "warehouse", "robotics", "freight", "autonomous vehicle", "supply chain", "logistics", "dockworker"]
  },
  {
    ep_id: "ep_26",
    publish_date: "2027-11-29",
    preset: "STR-GEN-EXPLAINER",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "Homeowners Insurance Withdrawal + Fixed 30-Year Mortgages",
    pre_recorded: false,
    domains: ["life", "finance", "macro"],
    live_stat_slot_id: "NAIC_TREASURY_FIO_NONRENEWAL_PREMIUM",
    fallback_baseline: "US Treasury FIO county-level homeowners policy non-renewal and escrow jump rates",
    primary_table: "US Treasury Federal Insurance Office Climate/Actuarial Dataset and State FAIR Plan Filings",
    character_anchor: "Homeowner whose fixed monthly housing draft jumps $620 via property insurance escrow",
    keywords: ["homeowners insurance", "escrow", "non-renewal", "reinsurance", "fair plan", "mortgage", "actuarial", "premium"]
  },
  {
    ep_id: "ep_27",
    publish_date: "2027-12-11",
    preset: "STR-FISHER-ARTIFACT",
    series: "Series 03: AI Power Grid Crisis, Chip Wars & Geopolitics",
    title: "Sovereign Wealth Funds as the Lenders of Last Resort for Compute",
    pre_recorded: false,
    domains: ["geopolitics", "finance", "ai"],
    live_stat_slot_id: "CFIUS_SWF_COMPUTE_CAPITAL_COMMITS",
    fallback_baseline: "Gulf and Asian sovereign-wealth commitments into US frontier compute infrastructure",
    primary_table: "US Treasury CFIUS Annual Report to Congress and Sovereign Fund SEC Schedule 13D/13G Filings",
    character_anchor: "US taxpayer subsidizing grid upgrades for foreign-backed compute clusters",
    keywords: ["sovereign wealth", "cfius", "gulf", "middle east", "foreign investment", "compute fund", "national security"]
  },
  {
    ep_id: "ep_28",
    publish_date: "2027-12-23",
    preset: "STR-HMW-PRIMER",
    series: "Series 02: AI Bubble, Corporate Accounting & Wall Street Math",
    title: "Healthcare Billing Agents vs. Claim-Denial Arms Races",
    pre_recorded: false,
    domains: ["life", "policy", "finance", "ai"],
    live_stat_slot_id: "CMS_MA_PRIOR_AUTH_ALGORITHMIC_DENIAL",
    fallback_baseline: "Medicare Advantage prior-authorization appeal overturn rates and medical-loss ratios",
    primary_table: "HHS OIG Prior-Authorization Audits, CMS Star-Rating Dockets, and Insurer 10-K MLR Disclosures",
    character_anchor: "Family contesting an automated post-acute care denial inside a 72-hour billing window",
    keywords: ["prior authorization", "claim denial", "healthcare", "medicare", "insurer", "medical bill", "hospital", "cms"]
  },
  {
    ep_id: "ep_29",
    publish_date: "2028-01-04",
    preset: "STR-BOYLE-CHAPTERED",
    series: "Series 04: AI Cybersecurity, Scams, Privacy & Tech Policy",
    title: "Model-Weight Espionage, Insider Exfiltration, and Industrial Sabotage",
    pre_recorded: false,
    domains: ["cyber", "geopolitics", "ai"],
    live_stat_slot_id: "DOJ_NSD_WEIGHT_EXFILTRATION_INDICTMENTS",
    fallback_baseline: "RAND security-level weight controls vs. DOJ export-violation and trade-secret indictments",
    primary_table: "DOJ National Security Division Criminal Indictments, BIS Export Enforcement Orders, and NIST AI 800-1",
    character_anchor: "Infrastructure security engineer hardening air-gapped build and inference pipelines",
    keywords: ["model weights", "exfiltration", "espionage", "trade secret", "indictment", "insider", "scada", "sabotage"]
  },
  {
    ep_id: "ep_30",
    publish_date: "2028-01-16",
    preset: "STR-AIC-CLOCKED",
    series: "Series 01: AI Economy, National Debt & Your Money",
    title: "The 2028-2036 Household Balance-Sheet Playbook: Owning the Bottlenecks",
    pre_recorded: false,
    domains: ["life", "macro", "finance", "ai"],
    live_stat_slot_id: "FED_SCF_LABOR_VS_ASSET_SHARE_2028",
    fallback_baseline: "BLS nonfarm labor share at ~53 percent vs. top-decile equity and physical-asset return spread",
    primary_table: "Federal Reserve Survey of Consumer Finances, BLS Labor Share Series, and CBO 2028-2038 Baseline",
    character_anchor: "28-year-old household structuring debt duration, liquidity keys, and productive bottleneck equity",
    keywords: ["labor share", "balance sheet", "household debt", "productive equity", "bottleneck", "2036", "bargaining power", "net worth"]
  }
];

function loadSlateCatalog() {
  if (fs.existsSync(EXTERNAL_SLATE_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(EXTERNAL_SLATE_PATH, "utf8"));
      const list = Array.isArray(raw) ? raw : raw.episodes;
      if (Array.isArray(list) && list.length === 30 && list[0].keywords) {
        return list;
      }
    } catch {
      // Fall back to embedded canonical 30-episode registry if external file uses a different schema.
    }
  }
  return MASTER_SLATE_30;
}

const STRUCTURAL_SIGNALS = [
  { pattern: /\b(2028|2029|203\d|204\d|205\d|ten-year|10-year|20-year|30-year|multi-year|decade)\b/gi, pts: 4, note: "multi-year horizon" },
  { pattern: /\b(statute|statutory|act of|congress|legislation|constitutional|supreme court|appellate|regulation [a-z]|12 cfr|usc|mandate|ban|treaty|tariff|moratorium)\b/gi, pts: 4, note: "statutory or regulatory rule" },
  { pattern: /\b(substation|transformer|megawatt|gigawatt|terawatt|interconnection queue|fab|wafer|subsea|transmission|nuclear|grid|port|copper)\b/gi, pts: 4, note: "physical infrastructure constraint" },
  { pattern: /\b(sovereign debt|national debt|payroll tax|withholding|trust fund|social security|pension|bond auction|yield curve|fomc|reserve requirement|slr)\b/gi, pts: 4, note: "sovereign fiscal or monetary plumbing" },
  { pattern: /\b(depreciation|amortization|covenant|spv|securitization|impairment|restatement|underwriting|exclusion|reinsurance)\b/gi, pts: 3, note: "multi-year accounting or contract lock" },
  { pattern: /\b(emergency order|systemic|mandatory|nationwide|federal reserve emergency|circuit breaker|default|receivership)\b/gi, pts: 3, note: "systemic regime shift" }
];

const NOISE_PENALTIES = [
  { pattern: /\b(feud|clapback|slam|drama|beef|twitter war|x feud|podcast clip|hot mic|rumor|gossip|leaked slack|leaked group chat|anonymous screenshot|blind item)\b/gi, penalty: 8, label: "48-hour personality drama or unverified chat leak" },
  { pattern: /\b(leaderboard|mmlu|swe-bench|elo score|arena rank|beats? gpt|tops? claude|by [0-9.]+%|by [0-9.]+ points|benchmark crown|chatbot arena)\b/gi, penalty: 7, label: "ephemeral model leaderboard flip" },
  { pattern: /\b(waitlist|teaser|demo video|coming soon|product hunt|merch|logo redesign|rebrand|keynote hype|vibes)\b/gi, penalty: 6, label: "PR waitlist or marketing stunt" },
  { pattern: /\b(ftx|sam bankman|svb collapse|2022 crypto|metaverse 2021|retrospective)\b/gi, penalty: 6, label: "backward-looking 2021-2024 retrospective" },
  { pattern: /\b(people familiar with the matter|unnamed sources say|insiders hint|unconfirmed rumor)\b/gi, penalty: 5, label: "unnamed leak with zero verifiable docket" }
];

const BALANCE_SHEET_SIGNALS = [
  { pattern: /\$([0-9,.]+)\s*(trillion|billion|million|t|b|m)\b/gi, pts: 4, note: "explicit dollar balance or flow" },
  { pattern: /\b([0-9,.]+)\s*(percent|%|bps|basis points|megawatt-day|mw-day)\b/gi, pts: 3, note: "quantified rate, spread, or tariff unit" },
  { pattern: /\b(free cash flow|capex|capital expenditure|useful life|write-down|impairment|ebitda|margin|net interest|deficit|revenue|tax receipt)\b/gi, pts: 4, note: "income or cash-flow transmission" },
  { pattern: /\b(mortgage|loan|debt|bond|treasury|yield|auction|lease|collateral|covenant|credit|default|delinquency|charge-off)\b/gi, pts: 4, note: "debt or credit contract transmission" },
  { pattern: /\b(liability|indemnity|exclusion|deductible|escrow|premium|ratepayer|tariff|surcharge|fee|withholding)\b/gi, pts: 4, note: "contractual cost allocation" },
  { pattern: /\b(401\(k\)|pension|balance sheet|insurer|bank|underwriter|clearinghouse)\b/gi, pts: 2, note: "institutional balance-sheet holder" }
];

const PRIMARY_FILING_SIGNALS = [
  { pattern: /\b(monthly treasury statement|mts|table 9|tic\b|treasury bulletin|daily treasury)\b/gi, pts: 6, note: "US Treasury primary ledger" },
  { pattern: /\b(form 10-k|form 10-q|form 8-k|10-k|10-q|8-k|sec filing|edgar|schedule 13[dg]|form 20-f|asc 606)\b/gi, pts: 6, note: "SEC EDGAR corporate filing" },
  { pattern: /\b(cbo\b|congressional budget office|trustees report|irs soi|omb\b)\b/gi, pts: 5, note: "CBO or federal actuarial baseline" },
  { pattern: /\b(federal reserve|fomc|z\.1|h\.4\.1|survey of consumer finances|scf\b|fednow|fincen|bls\b|cpi\b|cfpb)\b/gi, pts: 5, note: "Federal Reserve, BLS, or CFPB release" },
  { pattern: /\b(pjm\b|ercot|ferc|nerc|iea\b|eia\b|public utility commission|puc\b|rate case|doe\b|cfius|usitc|bts\b)\b/gi, pts: 5, note: "energy, grid, trade, or CFIUS docket" },
  { pattern: /\b(cisa|kev\b|cve-\d{4}-\d+|nist|indictment|docket|supreme court|circuit court|sdny|ndca|12 cfr|doj\b|ftc\b|naic|cms\b|hhs oig|bis\b)\b/gi, pts: 5, note: "court docket, statutory rule, or CISA/CVE advisory" }
];

const HOUSEHOLD_SIGNALS = [
  { pattern: /\b(paycheck|wage|salary|w-2|hiring|layoff|entry-level|junior|career|income|worker|freelance|contractor)\b/gi, pts: 5, note: "household wage or career bargaining stake" },
  { pattern: /\b(mortgage|rent|tenant|homeowner|housing|electric bill|utility bill|power bill|escrow|property tax|homeowners insurance)\b/gi, pts: 5, note: "monthly housing or utility draft" },
  { pattern: /\b(401\(k\)|retirement|pension|savings|checking account|depositor|wire transfer|student loan|credit score|medical bill)\b/gi, pts: 5, note: "household savings, checking, or retirement balance" },
  { pattern: /\b(voice clone|scam|identity theft|fraud|wallet|cashout|privacy|passkey|autonomy|ration|scrip)\b/gi, pts: 4, note: "personal security or financial autonomy" },
  { pattern: /\b(family|household|consumer|ratepayer|taxpayer|borrower|saver|graduate)\b/gi, pts: 3, note: "direct household incidence" }
];

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function scoreSignalTable(text, table, baseFloor, cap = 20) {
  let raw = baseFloor;
  const matchedNotes = [];
  for (const row of table) {
    const matches = text.match(row.pattern);
    if (matches && matches.length > 0) {
      const extra = matches.length > 2 ? 1 : 0;
      raw += row.pts + extra;
      matchedNotes.push(row.note);
    }
  }
  return { points: clamp(raw, 0, cap), matchedNotes };
}

function detectPenalties(text) {
  let totalPenalty = 0;
  const labels = [];
  for (const item of NOISE_PENALTIES) {
    if (item.pattern.test(text)) {
      totalPenalty += item.penalty;
      labels.push(`${item.label} (-${item.penalty})`);
    }
    item.pattern.lastIndex = 0;
  }
  return { totalPenalty, labels };
}

function matchSlateEpisode(event, textLower, slate) {
  let bestEp = slate[0];
  let bestRaw = -1;
  let bestKeywords = [];

  for (const ep of slate) {
    let score = 0;
    const matchedKw = [];
    if (ep.domains.includes(event.domain)) {
      score += 4;
    }
    if (ep.domains[0] === event.domain) {
      score += 2;
    }
    for (const kw of ep.keywords) {
      if (textLower.includes(kw.toLowerCase())) {
        score += kw.includes(" ") ? 4 : 3;
        matchedKw.push(kw);
      }
    }
    if (event.target_ep && ep.ep_id === event.target_ep) {
      score += 12;
    }
    if (score > bestRaw) {
      bestRaw = score;
      bestEp = ep;
      bestKeywords = matchedKw;
    }
  }

  const hasLayer1 = /\b(ai|agent|autonomous|compute|gpu|server|model|token|robot|synthetic|voice clone|algorithmic|chip|data center|hyperscaler)\b/i.test(textLower) || event.domain === "ai";
  const hasLayer2 = /\b(\$|treasury|bond|debt|tax|10-k|10-q|capex|auction|yield|credit|tariff|covenant|balance sheet|liability|insurer|deficit)\b/i.test(textLower) || ["macro", "finance"].includes(event.domain);
  const hasLayer3 = /\b(household|mortgage|rent|paycheck|wage|401\(k\)|utility|electric bill|checking|depositor|worker|student|family|ratepayer|scam)\b/i.test(textLower) || ["life", "cyber", "policy"].includes(event.domain);

  const layerCount = (hasLayer1 ? 1 : 0) + (hasLayer2 ? 1 : 0) + (hasLayer3 ? 1 : 0);
  const alignmentPts = clamp(4 + Math.min(10, bestRaw) + layerCount * 2, 0, 20);

  return {
    matchedEpisode: bestEp,
    alignmentPts,
    matchedKeywords: bestKeywords,
    layersActivated: {
      layer_1_ai_curve: hasLayer1,
      layer_2_institutional_ledger: hasLayer2,
      layer_3_household_protection: hasLayer3,
      active_count: layerCount
    }
  };
}

function stripRelativeDates(headline) {
  return headline
    .replace(/\b(breaking|just in|exclusive|watch|live updates?)\s*:?\s*/gi, "")
    .replace(/\b(today|yesterday|this morning|tonight|last night|this week|just announced)\b/gi, "")
    .replace(/!/g, "")
    .replace(/\u2014|\u2013|--/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildStalenessRewrite(headline, matchedEpisode, domain) {
  const cleaned = stripRelativeDates(headline);
  const jan2028Framing = `Anchor the spot event as a dated primary receipt inside ${matchedEpisode.ep_id.toUpperCase()} (${matchedEpisode.live_stat_slot_id}), then frame the core tension around 2027-to-2036 ${domain} contract mechanics and ${matchedEpisode.primary_table}.`;
  return {
    raw_perishable_wrapper: headline.replace(/!/g, ".").replace(/\u2014|\u2013|--/g, ","),
    cleaned_receipt_clause: cleaned,
    jan2028_immune_directive: jan2028Framing,
    banned_time_words_stripped: ["today", "yesterday", "this morning", "breaking", "just now", "next week"]
  };
}

function buildColdOpenBridge(event, matchedEp, routeCode, cleanedHeadline) {
  if (routeCode === "ROUTE_D_REJECT_NOISE") {
    return [
      "STAND DOWN DIRECTIVE: Do not record A-roll or open a Community post for this item.",
      `This headline fails the 55-point structural floor and carries perishable news-cycle decay.`,
      `If a verifiable filing later surfaces inside ${matchedEp.primary_table}, log the figure silently inside ${matchedEp.live_stat_slot_id} during scheduled shoot-week prep for ${matchedEp.ep_id.toUpperCase()}.`
    ].join(" ");
  }

  const receiptLead = event.date_label
    ? `In ${event.date_label}, new filings around ${cleanedHeadline.toLowerCase()} put a hard number on a problem most commentators still treat as theory.`
    : `A fresh institutional filing around ${cleanedHeadline.toLowerCase()} just put a hard number on a problem most commentators still treat as theory.`;

  return [
    receiptLead,
    `Open ${matchedEp.primary_table} alongside that headline and you hit an immediate balance-sheet wall.`,
    `Software capabilities reprice in six-month cycles, while thirty-year mortgages, sovereign bond coupons, and utility debt schedules stay locked at yesterday's terms.`,
    `I'm eighteen right now, which means I turn twenty-eight in 2036 right as these ten-year obligations come due.`,
    `Before you trust the press release, check who absorbs the loss inside ${matchedEp.character_anchor.toLowerCase()}, because every standard fix on the table shifts the bill back onto regular households.`
  ].join(" ");
}

function buildCommunityAndShortBrief(event, matchedEp, routeCode, cleanedHeadline) {
  if (routeCode === "ROUTE_D_REJECT_NOISE") {
    return {
      community_post_24h: "NONE (Noise rejected to protect returning-subscriber Browse CTR).",
      vertical_script_50s: "NONE (Zero vertical cut authorized)."
    };
  }
  return {
    community_post_24h: `Primary receipt check on ${cleanedHeadline}: skip the press-conference soundbites and pull ${matchedEp.primary_table}. Full balance-sheet audit connects directly to ${matchedEp.ep_id.toUpperCase()} (${matchedEp.title}).`,
    vertical_script_50s: `0:00-0:08 Cold number from ${matchedEp.primary_table} colliding with ${cleanedHeadline.toLowerCase()}. 0:08-0:35 Walk one line item showing how fast AI repricing hits ${matchedEp.character_anchor.toLowerCase()}. 0:35-0:50 Verbal bridge routing viewers via the Related Video link to ${matchedEp.ep_id.toUpperCase()}.`
  };
}

export function evaluateNewsEvent(rawEvent, slate = loadSlateCatalog()) {
  const domain = String(rawEvent.domain || "ai").toLowerCase().trim();
  if (!VALID_DOMAINS.has(domain)) {
    throw new Error(`Invalid domain "${rawEvent.domain}". Allowed: ${Array.from(VALID_DOMAINS).join(", ")}`);
  }

  const headline = String(rawEvent.headline || "").trim();
  const summary = String(rawEvent.summary || "").trim();
  const sourceHint = String(rawEvent.source_hint || "").trim();
  if (!headline) {
    throw new Error("Missing required headline text.");
  }

  const fullText = `${headline} ${summary} ${sourceHint}`.trim();
  const fullTextLower = fullText.toLowerCase();

  const penalties = detectPenalties(fullText);

  const persistenceRes = scoreSignalTable(fullText, STRUCTURAL_SIGNALS, 6);
  const hasExplicitFiling = PRIMARY_FILING_SIGNALS.some((s) => {
    s.pattern.lastIndex = 0;
    const hit = s.pattern.test(fullText);
    s.pattern.lastIndex = 0;
    return hit;
  });

  const structuralPersistence = clamp(
    persistenceRes.points - penalties.totalPenalty + (hasExplicitFiling ? 2 : 0),
    0,
    20
  );

  const balanceRes = scoreSignalTable(fullText, BALANCE_SHEET_SIGNALS, 4);
  const balanceSheetTransmission = clamp(
    balanceRes.points - Math.floor(penalties.totalPenalty * 0.4),
    0,
    20
  );

  const filingBase = /\b(anonymous|unconfirmed|rumor|leaked chat|blind item)\b/i.test(fullText) ? 1 : 5;
  const filingRes = scoreSignalTable(fullText, PRIMARY_FILING_SIGNALS, filingBase);
  const primaryFiling48h = clamp(
    filingRes.points - Math.floor(penalties.totalPenalty * 0.5),
    0,
    20
  );

  const householdRes = scoreSignalTable(fullText, HOUSEHOLD_SIGNALS, 4);
  const householdStake = clamp(
    householdRes.points - Math.floor(penalties.totalPenalty * 0.3),
    0,
    20
  );

  const slateMatch = matchSlateEpisode({ ...rawEvent, domain }, fullTextLower, slate);
  const slateCollisionAlignment = clamp(
    slateMatch.alignmentPts - Math.floor(penalties.totalPenalty * 0.4),
    0,
    20
  );

  const totalScore =
    structuralPersistence +
    balanceSheetTransmission +
    primaryFiling48h +
    householdStake +
    slateCollisionAlignment;

  let routeCode = "ROUTE_D_REJECT_NOISE";
  let operationalAction = "";

  if (totalScore < 55) {
    routeCode = "ROUTE_D_REJECT_NOISE";
    operationalAction =
      "Ignore completely on YouTube, Shorts, and Community tab. Log zero production hours so channel Browse CTR stays clean.";
  } else if (totalScore >= 86) {
    routeCode = "ROUTE_C_BREAKER_SLOT_SWAP";
    operationalAction =
      "Claim the current bi-monthly Rapid-Response Breaker Slot. Pull primary dockets within 2 hours, lock Stage 2 red-team audit by Hour 18, and ship full staleness-immune flagship within 96 hours.";
  } else if (
    totalScore >= 72 &&
    slateMatch.matchedEpisode.pre_recorded === false &&
    primaryFiling48h >= 13 &&
    slateCollisionAlignment >= 14
  ) {
    routeCode = "ROUTE_A_COLD_OPEN_INJECTION";
    operationalAction = `Inject dated receipt into the 45-second [LIVE_STAT_SLOT] cold open of upcoming ${slateMatch.matchedEpisode.ep_id.toUpperCase()} during shoot week while keeping Acts I through IV unchanged.`;
  } else {
    routeCode = "ROUTE_B_SHORT_AND_COMMUNITY_DROP";
    operationalAction = `Publish a 24-hour Community primary-receipt card plus one 50-second vertical script linked via Related Video to ${slateMatch.matchedEpisode.ep_id.toUpperCase()} without altering the flagship upload schedule.`;
  }

  const cleanedHeadline = stripRelativeDates(headline);
  const ep = slateMatch.matchedEpisode;

  return {
    event_id: rawEvent.event_id || "LIVE_TRIAGE_SINGLE",
    date_label: rawEvent.date_label || "2027 Live Desk",
    domain,
    headline,
    summary,
    dimension_scores: {
      structural_persistence: {
        score: structuralPersistence,
        max: 20,
        signals: persistenceRes.matchedNotes
      },
      balance_sheet_transmission: {
        score: balanceSheetTransmission,
        max: 20,
        signals: balanceRes.matchedNotes
      },
      primary_filing_48h: {
        score: primaryFiling48h,
        max: 20,
        signals: filingRes.matchedNotes
      },
      household_stake: {
        score: householdStake,
        max: 20,
        signals: householdRes.matchedNotes
      },
      slate_collision_alignment: {
        score: slateCollisionAlignment,
        max: 20,
        matched_keywords: slateMatch.matchedKeywords,
        layers_activated: slateMatch.layersActivated
      },
      penalties_applied: penalties.labels,
      total_score: totalScore,
      max_total: 100
    },
    routing_verdict: {
      route_code: routeCode,
      triage_sla_minutes: 120,
      matched_episode: {
        ep_id: ep.ep_id,
        publish_date: ep.publish_date,
        series: ep.series,
        title: ep.title,
        pre_recorded_launch_trio: ep.pre_recorded,
        live_stat_slot_id: ep.live_stat_slot_id
      },
      operational_action: operationalAction
    },
    structural_hijack_brief: {
      primary_table_to_pull: ep.primary_table,
      live_stat_slot_token: {
        slot_id: ep.live_stat_slot_id,
        fallback_baseline: ep.fallback_baseline,
        refresh_window: "Within 72 hours prior to A-roll recording",
        thesis_protection_rule: "Update spot number inside 0:00-0:45 hook only; leave 15-to-20-minute structural spine untouched"
      },
      cold_open_bridge_45s: buildColdOpenBridge(rawEvent, ep, routeCode, cleanedHeadline),
      community_and_short_drop: buildCommunityAndShortBrief(rawEvent, ep, routeCode, cleanedHeadline),
      staleness_immunity_rewrite: buildStalenessRewrite(headline, ep, domain)
    }
  };
}

function formatHumanSingleReport(res) {
  const d = res.dimension_scores;
  const r = res.routing_verdict;
  const b = res.structural_hijack_brief;
  const lines = [
    "================================================================================",
    `READING ROOM HIJACK RADAR | ${res.event_id} (${res.domain.toUpperCase()})`,
    "================================================================================",
    `Headline:        ${res.headline}`,
    `Total Score:     ${d.total_score} / 100`,
    `Routing Verdict: ${r.route_code}`,
    `Matched Slate:   ${r.matched_episode.ep_id.toUpperCase()} | ${r.matched_episode.title} (${r.matched_episode.publish_date})`,
    `Stat Slot ID:    [${r.matched_episode.live_stat_slot_id}]`,
    "",
    "5-DIMENSION QUANTITATIVE BREAKDOWN:",
    `  1. Multi-Year Structural Persistence:      ${String(d.structural_persistence.score).padStart(2, " ")} / 20  (${d.structural_persistence.signals.join(", ") || "baseline"})`,
    `  2. Balance-Sheet / Contract Transmission:  ${String(d.balance_sheet_transmission.score).padStart(2, " ")} / 20  (${d.balance_sheet_transmission.signals.join(", ") || "baseline"})`,
    `  3. Primary Institutional Filing <= 48h:    ${String(d.primary_filing_48h.score).padStart(2, " ")} / 20  (${d.primary_filing_48h.signals.join(", ") || "baseline"})`,
    `  4. Household Wallet / Career / Autonomy:   ${String(d.household_stake.score).padStart(2, " ")} / 20  (${d.household_stake.signals.join(", ") || "baseline"})`,
    `  5. 30-Episode Master Slate Collision:      ${String(d.slate_collision_alignment.score).padStart(2, " ")} / 20  (layers=${d.slate_collision_alignment.layers_activated.active_count}/3, kw=${d.slate_collision_alignment.matched_keywords.join(", ") || "domain fit"})`,
    `  Penalties Applied:                         ${d.penalties_applied.length > 0 ? d.penalties_applied.join("; ") : "None"}`,
    "",
    "2-HOUR OPERATIONAL ACTION:",
    `  ${r.operational_action}`,
    "",
    "STRUCTURAL HIJACK BRIEF:",
    `  Primary Table to Pull: ${b.primary_table_to_pull}`,
    `  Staleness Rewrite:     ${b.staleness_immunity_rewrite.jan2028_immune_directive}`,
    "",
    "  45-Second Undated Cold-Open Bridge Draft:",
    `  "${b.cold_open_bridge_45s}"`,
    ""
  ];
  return lines.join("\n");
}

function formatHumanBatchReport(batchPayload) {
  const lines = [
    "================================================================================",
    "THE READING ROOM | LIVE NEWS-TO-STRUCTURAL-THESIS HIJACK RADAR (BATCH TRIAGE)",
    "================================================================================",
    `Events Evaluated: ${batchPayload.summary.total_events}`,
    `Verdict Counts:   ROUTE_C_BREAKER=${batchPayload.summary.verdict_counts.ROUTE_C_BREAKER_SLOT_SWAP} | ROUTE_A_COLD_OPEN=${batchPayload.summary.verdict_counts.ROUTE_A_COLD_OPEN_INJECTION} | ROUTE_B_SHORT_COMMUNITY=${batchPayload.summary.verdict_counts.ROUTE_B_SHORT_AND_COMMUNITY_DROP} | ROUTE_D_REJECT=${batchPayload.summary.verdict_counts.ROUTE_D_REJECT_NOISE}`,
    "================================================================================",
    "ID          | SCORE  | VERDICT                          | SLATE | HEADLINE",
    "================================================================================"
  ];

  for (const item of batchPayload.results) {
    const idCol = item.event_id.padEnd(11, " ").slice(0, 11);
    const scoreCol = `${String(item.dimension_scores.total_score).padStart(3, " ")}/100`;
    const routeCol = item.routing_verdict.route_code.padEnd(32, " ");
    const epCol = item.routing_verdict.matched_episode.ep_id.toUpperCase().padEnd(5, " ");
    const shortHead = item.headline.length > 56 ? `${item.headline.slice(0, 53)}...` : item.headline;
    lines.push(`${idCol} | ${scoreCol} | ${routeCol} | ${epCol} | ${shortHead}`);
  }

  lines.push("================================================================================");
  lines.push("");

  for (const item of batchPayload.results) {
    lines.push(formatHumanSingleReport(item));
  }

  return lines.join("\n");
}

function printHelp() {
  const usage = `Usage:
  node 02_research_and_data/tools/news_to_thesis_radar.mjs --headline "..." --domain <domain> --summary "..." [--json]
  node 02_research_and_data/tools/news_to_thesis_radar.mjs --batch <json-file> [--json] [--out <report-path>]

Allowed --domain values:
  ai | macro | finance | cyber | geopolitics | policy | life

Options:
  --headline <string>     Breaking news headline to evaluate
  --domain <string>       Primary domain bucket (ai, macro, finance, cyber, geopolitics, policy, life)
  --summary <string>      2-to-4 sentence factual summary including named filings or numbers
  --source-hint <string>  Optional primary ledger or docket hint available within 48 hours
  --date-label <string>   Optional month/year stamp for undated cold-open framing (e.g. "April 2027")
  --batch <path>          Evaluate a JSON file containing an array of news events
  --out <path>            Write formatted output (JSON or text) to a target file
  --json                  Emit deterministic JSON output to stdout
  --help, -h              Show this usage guide and exit 0

Routing Verdicts (0-100 Quantitative Rubric):
  ROUTE_C_BREAKER_SLOT_SWAP        score >= 86 (reserve-level systemic event)
  ROUTE_A_COLD_OPEN_INJECTION      72 <= score <= 85 on unshot upcoming slate episode
  ROUTE_B_SHORT_AND_COMMUNITY_DROP 55 <= score <= 71 (or 72-85 bridged to existing flagship)
  ROUTE_D_REJECT_NOISE             score < 55 (ephemeral gossip, PR stunts, benchmark flips)
`;
  process.stdout.write(usage);
}

function main() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        headline: { type: "string" },
        domain: { type: "string" },
        summary: { type: "string" },
        "source-hint": { type: "string" },
        "date-label": { type: "string" },
        batch: { type: "string" },
        out: { type: "string" },
        json: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false }
      },
      allowPositionals: false
    });
  } catch (err) {
    process.stderr.write(`Argument error: ${err.message}\nRun with --help for usage.\n`);
    process.exit(1);
  }

  const { values } = parsed;
  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const slate = loadSlateCatalog();

  let batchFile = values.batch;
  if (!batchFile && !values.headline) {
    if (fs.existsSync(DEFAULT_BATCH_PATH)) {
      batchFile = DEFAULT_BATCH_PATH;
    } else {
      printHelp();
      process.exit(0);
    }
  }

  if (batchFile) {
    const resolvedBatch = path.resolve(process.cwd(), batchFile);
    if (!fs.existsSync(resolvedBatch)) {
      process.stderr.write(`Batch file not found: ${resolvedBatch}\n`);
      process.exit(1);
    }
    const rawJson = JSON.parse(fs.readFileSync(resolvedBatch, "utf8"));
    const events = Array.isArray(rawJson) ? rawJson : rawJson.events;
    if (!Array.isArray(events) || events.length === 0) {
      process.stderr.write("Batch JSON must contain a non-empty array or { events: [...] }.\n");
      process.exit(1);
    }

    const results = events.map((ev) => evaluateNewsEvent(ev, slate));
    const counts = {
      ROUTE_A_COLD_OPEN_INJECTION: 0,
      ROUTE_B_SHORT_AND_COMMUNITY_DROP: 0,
      ROUTE_C_BREAKER_SLOT_SWAP: 0,
      ROUTE_D_REJECT_NOISE: 0
    };
    for (const r of results) {
      counts[r.routing_verdict.route_code] += 1;
    }

    const payload = {
      tool: "news_to_thesis_radar",
      version: "1.0.0",
      source_batch: path.relative(REPO_ROOT, resolvedBatch).replace(/\\/g, "/"),
      summary: {
        total_events: results.length,
        mean_score: Number((results.reduce((acc, x) => acc + x.dimension_scores.total_score, 0) / results.length).toFixed(2)),
        verdict_counts: counts
      },
      results
    };

    const outputText = values.json ? `${JSON.stringify(payload, null, 2)}\n` : formatHumanBatchReport(payload);
    if (values.out) {
      const outPath = path.resolve(process.cwd(), values.out);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, outputText, "utf8");
    }
    process.stdout.write(outputText);
    process.exit(0);
  }

  const singleResult = evaluateNewsEvent(
    {
      event_id: "CLI_LIVE_EVENT",
      headline: values.headline,
      domain: values.domain || "ai",
      summary: values.summary || "",
      source_hint: values["source-hint"] || "",
      date_label: values["date-label"] || "2027 Live Desk"
    },
    slate
  );

  const singleOut = values.json
    ? `${JSON.stringify(singleResult, null, 2)}\n`
    : formatHumanSingleReport(singleResult);

  if (values.out) {
    const outPath = path.resolve(process.cwd(), values.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, singleOut, "utf8");
  }
  process.stdout.write(singleOut);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  main();
}
