# Deliverable 31: 300-Term English-Persian Technical and Idiomatic Dictionary

This bilingual reference compiles 322 canonical terms spanning all eight core knowledge domains across Episodes 01 to 30 of The Reading Room. Every entry pairs a plain-spoken English camera definition with authoritative standard Persian terminology, mechanism notes, native-speaker false-friend traps, and synchronized Arabic, Spanish, and German locks inside `glossary_en_fa.json`.

## Translation Philosophy and Spoken-Register Rules

The Reading Room narrates complex balance sheets, statutes, and physical grid engineering in plain shirt-and-tie English without slang or academic padding. Translating those scripts into Persian study guides and bilingual mastery books works best when editors preserve institutional exactness inside natural educated Persian syntax. Short concrete English verbs such as clear, roll, sweep, and trim carry exact operational meanings on trading desks and grid auctions, so Persian equivalents translate the real mechanism instead of forcing word-for-word literal phrasing.

Strict Persian keyboard hygiene keeps automated text gates and Persian readers aligned across every deliverable. Always type Persian kaf (`ک`, U+06A9) and Persian yeh (`ی`, U+06CC) inside all Persian columns while keeping Arabic glyph forms solely inside the Arabic subtitle lock strings of `glossary_en_fa.json`. Place zero-width non-joiner (`U+200C`) strictly between two Persian letters inside compound nouns and verbal prefixes such as `می‌شود`, `کوتاه‌مدت`, and `پرداخت‌های`, avoiding any placement adjacent to spaces, Latin letters, digits, or punctuation.

Primary filing codes and statutory citations stay visible on first mention in both languages. Keeping `SEC Form 10-K`, `IRC Section 168(k)`, `12 CFR Part 1005`, `ML-KEM`, and `eIDAS 2.0` intact beside their Persian explanations lets viewers and translators verify every figure directly on EDGAR, Congress.gov, or EUR-Lex. Downstream subtitle tools consume the full `persian_definition`, `false_friend_or_trap`, and Arabic, Spanish, and German lock fields directly from `glossary_en_fa.json`.

## Domain 1: Macroeconomics and Sovereign Debt (GLS-001 to GLS-040)

US fiscal arithmetic, Treasury auctions, foreign bondholders, and household debt structures form the bedrock of Series 01. Keep cash outlays separate from statutory debt totals, and preserve exact maturity tiers when translating bills, notes, and bonds into Persian.

### Bilingual Lookup Table (40 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-001|Gross Federal Debt|بدهی ناخالص فدرال|Total money the US government owes both outside bond investors and its own trust funds.|ep_01, ep_02, ep_19, ep_30|
|GLS-002|Public Marketable Debt|بدهی عمومی قابل معامله|Government bonds, notes, and bills that investors can buy and sell freely on open bond markets.|ep_02|
|GLS-003|Net Interest Outlays|هزینه‌های خالص بهره بدهی|Annual cash interest Washington pays to Treasury bondholders after subtracting interest earned on government holdings.|ep_01, ep_02, ep_19, ep_30|
|GLS-004|Monthly Treasury Statement (MTS)|صورت‌وضعیت ماهانه خزانه‌داری آمریکا|Official US Treasury ledger published each month detailing actual cash tax receipts and government outlays.|ep_01, ep_02, ep_19, ep_30|
|GLS-005|Payroll Tax Withholding|کسر مالیات از حقوق در مبدأ|Taxes an employer subtracts directly from your Friday paycheck and wires to the government before you touch the cash.|ep_01, ep_02, ep_03, ep_04, ep_26, ep_30|
|GLS-006|Nonfarm Labor Share|سهم نیروی کار غیرکشاورزی از تولید ملی|Percentage of total economic output paid out as worker wages and benefits inside non-agricultural businesses.|ep_01, ep_04|
|GLS-007|Debt Deflation|تورم‌زدایی بدهی|Economic squeeze where falling wages and prices collide with old loans locked at fixed dollar amounts.|ep_01|
|GLS-008|Fiat Currency|پول دستوری (فیات)|National money backed by government tax power and legal-tender law with zero tie to gold or silver.|ep_01, ep_02|
|GLS-009|PCE Inflation Target|هدف تورمی شاخص مخارج مصرف شخصی|Federal Reserve goal of pushing average US consumer prices up by two percent every year.|ep_01|
|GLS-010|Treasury Bill (T-Bill)|اسناد خزانه کوتاه‌مدت آمریکا|Short-term US government IOU maturing in one year or less that sells at a discount and pays face value at maturity.|ep_02, ep_03, ep_10|
|GLS-011|Term Premium|صرف ریسک سررسید|Extra annual interest rate investors demand for locking cash into a ten-year or thirty-year bond ahead of inflation.|ep_02, ep_08|
|GLS-012|Duration Risk|ریسک دیرش (حساسیت به نرخ بهره)|Exposure of a bond's market price to drops whenever market interest rates move upward.|ep_02, ep_06|
|GLS-013|Duration Transfer|انتقال ریسک سررسید|Process where short-term mandates shield private token firms from rate swings by pushing refinancing risk onto the Treasury.|ep_02|
|GLS-014|Rollover Risk|ریسک تمدید و بازپرداخت بدهی|Danger that a borrower cannot refinance maturing short-term debt without paying painful higher rates.|ep_02|
|GLS-015|Treasury International Capital (TIC) Report|گزارش سرمایه بین‌المللی خزانه‌داری آمریکا|Monthly US Treasury report tracking exactly how many billion dollars of Treasury debt each foreign country holds.|ep_02|
|GLS-016|Japanese Government Bond (JGB)|اوراق قرضه دولتی ژاپن|Sovereign yen debt issued by Tokyo's Ministry of Finance that long paid near zero before climbing toward four percent.|ep_02|
|GLS-017|Currency Hedge Cost|هزینه پوشش ریسک ارزی|Price a foreign insurer pays on swap contracts to lock in a fixed exchange rate when buying dollar bonds.|ep_02|
|GLS-018|Overnight Repo|قرارداد بازخرید شبانه (ریپو)|One-day cash loan between banks secured by handing over Treasury bills as collateral until tomorrow morning.|ep_02|
|GLS-019|Primary Dealer|معامله‌گر اولیه اوراق خزانه|Select Wall Street banks authorized to bid directly in US Treasury auctions and make daily markets in government bonds.|ep_02|
|GLS-020|Bearer Bond|اوراق قرضه بی‌نام|Old-style paper bond owned by whoever physically holds the certificate and snips off paper stubs to collect interest.|ep_02|
|GLS-021|Yield Curve Steepening|شیب‌دار شدن منحنی بازدهی|Gap widening between short-term Treasury bill rates and much higher ten-year and thirty-year bond yields.|ep_02|
|GLS-022|Universal Basic Compute|رایانش پایه همگانی|Proposal to grant every citizen a monthly slice of AI processing capacity they can use or sell for cash.|ep_01|
|GLS-023|Permanent Fund Dividend (PFD)|سود سهام صندوق دائمی آلاسکا|Yearly cash payout sent to every Alaska resident from state oil investments that politicians cut in half during budget deficits.|ep_01|
|GLS-024|Company Scrip|ژتون و اعتبار انحصاری کارخانه|Private company tokens or store credits valid only inside employer shops and housing unless cashed out at a steep penalty.|ep_01, ep_03|
|GLS-025|Debt Ceiling Standoff|بن‌بست سقف بدهی فدرال|Recurring congressional budget fight over raising the legal cap on total US Treasury borrowing.|ep_01, ep_02|
|GLS-026|Inelastic Markets Hypothesis|فرضیه بازارهای ناکشسان|Economic finding by Gabaix and Koijen showing that one dollar flowing into or out of stock funds shifts market value by five dollars.|ep_06, ep_14|
|GLS-027|Required Minimum Distribution (RMD)|حداقل برداشت الزامی بازنشستگی|Mandatory annual cash withdrawal US tax law forces retirees to pull out of retirement accounts once they pass age seventy-three.|ep_06|
|GLS-028|Zero-Inertia Deposit Subsidy|یارانه پنهان سپرده‌های بی‌تحرک|Free profit banks capture because busy customers leave trillions in checking accounts paying near zero interest.|ep_10|
|GLS-029|Non-Interest-Bearing Deposit|سپرده دیداری بدون بهره|Bank checking deposits paying zero percent interest to the customer while the bank earns four percent investing that cash.|ep_10, ep_20, ep_29|
|GLS-030|Interchange Fee|کارمزد مبادله کارتی|Percentage cut deducted from merchants on every credit or debit card swipe and shared between the issuing bank and card network.|ep_10, ep_22|
|GLS-031|TreasuryDirect|سامانه خرید مستقیم اوراق خزانه آمریکا|Official US government portal letting individual savers buy Treasury bills directly with zero middleman spread.|ep_02, ep_10|
|GLS-032|TIPS (Treasury Inflation-Protected Securities)|اوراق خزانه مصون از تورم (TIPS)|US government bonds whose principal adjusts automatically with official consumer inflation rates.|ep_06|
|GLS-033|Premature Deindustrialization|صنعتی‌زدایی زودرس|Pattern documented by Dani Rodrik where developing nations lose factory jobs at far lower income levels than older rich economies did.|ep_16|
|GLS-034|Total Fertility Rate (TFR)|نرخ باروری کل|Average number of children a woman is expected to bear over her lifetime given current age-specific birth rates.|ep_26|
|GLS-035|Replacement Fertility Floor|آستانه باروری جایگزینی جمعیت|Roughly 2.1 children per woman required for a population to keep its total headcount steady without migration.|ep_26|
|GLS-036|Pay-As-You-Go Pension|نظام بازنشستگی مبتنی بر ورودی جاری|Public retirement system that uses today's worker payroll taxes directly to mail checks to today's retirees.|ep_26, ep_30|
|GLS-037|OASI Trust Fund|صندوق امانی بیمه سالمندان و بازماندگان آمریکا|Federal reserve fund holding surplus Social Security payroll taxes that runs out of money around late 2032.|ep_04, ep_26, ep_30|
|GLS-038|Bifurcated Inflation|تورم دوشاخه|Split economy where software and digital goods drop near zero while electricity, land, and housing hookups keep climbing.|ep_01, ep_08|
|GLS-039|Monetary Monetization|پولی‌سازی بدهی دولت|Central bank creating new bank reserves to absorb government deficits when private buyers step back.|ep_01, ep_30|
|GLS-040|Sovereign Credit Risk|ریسک اعتباری حاکمیتی|Probability that a national government misses bond payments, restructures external loans, or erodes bond purchasing power via inflation.|ep_02, ep_16|

### False-Friend Callouts for Macroeconomics and Sovereign Debt

Separate Gross Federal Debt (بدهی ناخالص فدرال) from annual Budget Deficit (کسری بودجه سالانه). Mixing those two concepts destroys the math showing $2.14 trillion in 2036 interest bills. Never collapse Treasury Bills, Treasury Notes, and Treasury Bonds into a single generic Persian label. Bills mature inside one year, notes span two to ten years, and bonds run twenty to thirty years. Distinguish monetary monetization (پولی‌سازی بدهی دولت توسط بانک مرکزی) from creator monetization on YouTube. Viewers hear the same English word across two unrelated worlds unless the Persian equivalent anchors public debt.

## Domain 2: Corporate Accounting and Private Credit Finance (GLS-041 to GLS-080)

Episodes 03, 05, 06, and 17 inspect SEC footnotes, private-credit workouts, retirement index flows, and residential escrow contracts. Persian translations must state clearly when an accounting stretch sits completely inside GAAP rules versus when executives fabricate numbers.

### Bilingual Lookup Table (40 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-041|GAAP (Generally Accepted Accounting Principles)|اصول حسابداری پذیرفته‌شده همگانی (GAAP)|Standard US accounting rulebook public companies must follow when reporting earnings to stock investors.|ep_03, ep_05|
|GLS-042|SEC Form 10-K|گزارش سالانه فرم 10-K بورس آمریکا|Audited annual financial filing US public corporations submit to securities regulators with detailed asset footnotes.|ep_03, ep_23|
|GLS-043|SEC Form 10-Q|گزارش فصلی فرم 10-Q بورس آمریکا|Quarterly financial report filed by public companies showing cash flows, debt footnotes, and interim profits.|ep_03, ep_05|
|GLS-044|SEC Form 8-K|گزارش رویداد بااهمیت فرم 8-K|Current-event disclosure form public firms must file within four business days of a major contract or breach.|ep_03, ep_08, ep_09|
|GLS-045|Straight-Line Depreciation|استهلاک خط مستقیم|Accounting method that divides an asset's purchase cost evenly across every year of its estimated working life.|ep_03|
|GLS-046|Useful-Life Extension|تمدید عمر مفید دفتری دارایی|Accounting decision to lengthen the assumed working years of hardware on paper so yearly depreciation charges shrink.|ep_03|
|GLS-047|Bonus Depreciation|استهلاک تشویقی صددرصدی سال اول|Tax rule letting businesses deduct the full cost of eligible servers and equipment in year one on IRS returns.|ep_01, ep_03|
|GLS-048|Free Cash Flow (FCF)|جریان نقدی آزاد|Real cash left over from operations after a company pays for buildings, chips, and physical gear.|ep_01, ep_02, ep_03, ep_23|
|GLS-049|Capital Expenditure (CapEx)|مخارج سرمایه‌ای|Money a company wires out to buy long-lived physical assets like server racks, transformers, and data centers.|ep_01, ep_03, ep_06, ep_23|
|GLS-050|Special Purpose Vehicle (SPV)|نهاد با هدف خاص (SPV)|Separate legal shell created solely to hold specific assets and borrow debt away from the parent company's ledger.|ep_03|
|GLS-051|Off-Balance-Sheet Financing|تأمین مالی خارج از ترازنامه|Funding structure that keeps debt obligations inside partner entities or leases off the parent firm's main debt line.|ep_03, ep_23|
|GLS-052|Remaining Performance Obligations (RPO)|تعهدات اجرایی باقیمانده (RPO)|Total dollar value of signed multi-year customer contracts waiting to be billed and delivered in future years.|ep_03|
|GLS-053|Finance Lease (ASC 842)|اجاره سرمایه‌ای (استاندارد ASC 842)|Equipment lease structured like an installment purchase where the lessee borrows gear and pays principal over time.|ep_03|
|GLS-054|Impairment Charge|هزینه کاهش ارزش دارایی|Sudden accounting loss booked on the income statement when an asset's market value falls permanently below book value.|ep_03|
|GLS-055|Economic Obsolescence|منسوخ‌شدگی اقتصادی|Point where hardware still powers on fine yet loses money against newer chips that deliver ten times more output per watt.|ep_03|
|GLS-056|Take-or-Pay Contract|قرارداد بخر یا بپرداز|Binding multi-year agreement forcing the buyer to pay the full contracted fee even if it stops using the servers.|ep_03|
|GLS-057|Residual Value Backstop|تضمین پشتوانه ارزش باقیمانده|Promise by a chip vendor or sponsor to step in and buy unsold server capacity up to a capped dollar limit.|ep_03|
|GLS-058|Pledged-Share Loan|وام با وثیقه سهام (بدون فروش)|Personal credit line secured by putting up rising company shares as collateral without selling stock or owing capital-gains tax.|ep_01, ep_03|
|GLS-059|Payment-in-Kind (PIK) Toggle|گزینه پرداخت غیرنقدی بهره (PIK)|Loan clause allowing a cash-strapped borrower to skip cash interest and add unpaid interest straight onto principal debt.|ep_05|
|GLS-060|Business Development Company (BDC)|شرکت توسعه کسب‌وکار (BDC)|Publicly traded US lending fund that lends to mid-sized firms and must pay ninety percent of taxable profits as cash dividends.|ep_05|
|GLS-061|Private Credit Interval Fund|صندوق دوره‌ای اعتبار خصوصی|Semi-liquid fund holding illiquid corporate loans that caps how much money retail investors can withdraw each quarter.|ep_05|
|GLS-062|Distressed Debt Workout|بازساختار بدهی معوق|Out-of-court deal between lenders and a struggling borrower to stretch loan due dates and avoid public bankruptcy.|ep_05|
|GLS-063|Cap-Weighted Index Fund|صندوق شاخصی وزن‌دهی‌شده بر اساس ارزش بازار|Stock fund that puts the largest share of every fresh dollar into the biggest companies by market size.|ep_03, ep_06|
|GLS-064|Target-Date Fund (TDF)|صندوق بازنشستگی تاریخ‌هدف|Default workplace retirement fund that mixes stocks and bonds automatically based on your expected retirement year.|ep_03, ep_06|
|GLS-065|401(k) Payroll Deduction|کسر خودکار حقوق برای حساب بازنشستگی ۴۰۱کی|Automatic tax-deferred slice of each paycheck wired into retirement funds before workers pay taxes or see the cash.|ep_01, ep_03, ep_06|
|GLS-066|Glide Path Rebalancing|تعدیل تدریجی ترکیب دارایی تا بازنشستگی|Scheduled shift inside a retirement fund that trims stocks and adds bonds as a worker approaches retirement age.|ep_06|
|GLS-067|SIPC Custody Protection|پوشش حمایتی کارگزاری SIPC|US brokerage safety net protecting customer securities and cash up to $500,000 if a broker fails.|ep_02|
|GLS-068|FDIC Deposit Insurance|بیمه فدرال سپرده‌های بانکی (FDIC)|Federal bank guarantee covering up to $250,000 per depositor per insured charter if a commercial bank collapses.|ep_02, ep_10|
|GLS-069|Net Interest Margin (NIM)|حاشیه سود خالص بهره بانکی|Spread a bank earns between interest collected on loans and interest paid out on customer deposits.|ep_10|
|GLS-070|ISAE 3000 Attestation|گواهی بررسی مقطعی تراز (ISAE 3000)|Point-in-time balance check signed by an accountant confirming assets on a single closing date without year-round control audits.|ep_02|
|GLS-071|PCAOB Integrated Audit|حسابرسی جامع تحت نظارت PCAOB|Full-year independent audit under US Public Company Accounting Oversight Board standards testing both financial statements and internal controls.|ep_02, ep_03|
|GLS-072|SEC Rule 2a-7 Money-Market Fund|صندوق بازار پول قاعده 2a-7|Tightly regulated cash fund restricted to ultra-short, top-quality government bills and overnight repos with strict liquidity rules.|ep_02|
|GLS-073|Force-Placed Insurance|بیمه اجباری تحمیلی وام‌دهنده|Expensive hazard policy a mortgage lender buys on your home and bills to your payment when your private policy cancels.|ep_17|
|GLS-074|Escrow Payment Shock|شوک پرداخت حساب امانی مسکن|Sudden jump in a fixed-rate borrower's monthly mortgage draft driven by surging property insurance and tax reserves.|ep_17|
|GLS-075|Insurer of Last Resort (FAIR Plan)|بیمه‌گر آخرین پناهگاه دولتی (طرح FAIR)|State-backed property insurance pool covering high-risk homes after private insurers walk away.|ep_17|
|GLS-076|Maturity Mismatch|ناهم‌خوانی سررسید|Gap created when a thirty-year debt depends on a contract like hazard insurance or deposits that reprices every twelve months or daily.|ep_02, ep_17|
|GLS-077|Portfolio Margin Liquidation|فروش اجباری وثیقه در حساب اعتباری|Broker automatically selling a borrower's stocks at distressed market prices when equity drops below collateral thresholds.|ep_14|
|GLS-078|LULD Circuit Breaker|مدارقطع‌کن نوسان مجاز بورس (LULD)|Exchange trading pause triggered when an individual stock swings violently past preset percentage bands within five minutes.|ep_14|
|GLS-079|Stop-Loss Cascade|آبشار فعال‌سازی سفارش‌های حد ضرر|Chain reaction where falling prices trip automatic market sell orders, driving prices even lower into empty order books.|ep_14|
|GLS-080|Negative Amortization|استهلاک منفی (رشد اصل بدهی)|Loan balance growing larger every month even when the borrower pays on time because payments fall short of accruing interest.|ep_11|

### False-Friend Callouts for Corporate Accounting and Private Credit Finance

Translate GAAP useful-life extensions as legal, audited accounting estimates disclosed inside SEC Form 10-K Note 1. Save fraud terms such as جعل دفاتر solely for cases like Waste Management in SEC Release No. 1532. In private-credit deals, PIK toggle means an option inside a loan agreement to pay interest with added debt principal instead of cash. Never translate toggle as an electrical switch. Keep Free Cash Flow (جریان نقدی آزاد) strictly distinct from GAAP Net Income (سود خالص حسابداری). Alphabet and Amazon posted negative free cash flow quarters even while reporting strong paper earnings.

## Domain 3: AI Architecture and Compute Economics (GLS-081 to GLS-120)

Every Reading Room script opens with an engineering shift before tracing its balance-sheet shockwave. Persian terms here separate training from inference, open weights from full open-source licenses, and physical power limits from software token deflation.

### Bilingual Lookup Table (40 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-081|Inference Token Deflation|افت شدید قیمت توکن استنتاج هوش مصنوعی|Steep drop of over ninety-nine percent in the dollar price to run an equivalent AI model prompt since 2023.|ep_01, ep_03, ep_05, ep_08|
|GLS-082|Autonomous Coding Agent|عامل خودکار کدنویسی|Software system that writes, runs, tests, and ships code changes across company repositories without waiting on human typing.|ep_01, ep_04, ep_11|
|GLS-083|Per-Engineer Token Cap|سقف ماهانه مصرف توکن به ازای هر مهندس|Monthly dollar ceiling a tech employer places on how much AI compute each developer can burn running automated agents.|ep_01, ep_03|
|GLS-084|Frontier Accelerator Cadence|آهنگ عرضه نسل‌های شتاب‌دهنده مرزی|Annual or eighteen-month product cycle where Nvidia releases a new chip architecture that outruns older racks.|ep_03|
|GLS-085|Batch Inference|استنتاج دسته‌ای غیرفوری|Running non-urgent AI jobs in large queued bundles overnight so older chips stay busy at lower priority.|ep_03|
|GLS-086|Margin per Watt|حاشیه سود به ازای هر وات برق|Profit left over for each watt of electricity consumed by a server rack after paying power and cooling bills.|ep_03|
|GLS-087|Per-Seat SaaS License|مجوز نرم‌افزار ابری به ازای هر کاربر|Software subscription billing a corporate buyer a monthly fee for every human employee login.|ep_05|
|GLS-088|API Agent Orchestrator|هماهنگ‌کننده عامل‌های خودکار بر بستر API|Software hub that coordinates multiple specialized AI agents calling databases and payment APIs automatically.|ep_05, ep_10|
|GLS-089|Open-Weight Model|مدل با وزن‌های باز|AI model whose trained numerical parameters are published so individuals or firms can run it locally offline.|ep_16, ep_18, ep_23|
|GLS-090|Foundation Model Monoculture|تک‌کشتی شدن بازار روی چند مدل پایه مشترک|Market concentration where rival banks and funds all build trading tools on the exact same handful of base AI models.|ep_14|
|GLS-091|Third-Party Model Concentration|تمرکز ریسک روی مدل‌های شخص ثالث|Systemic hazard flagged by global banking regulators when financial institutions rely on one outside AI vendor.|ep_14|
|GLS-092|Reinforcement-Learning Pricing Agent|عامل قیمت‌گذاری مبتنی بر یادگیری تقویتی|Self-adjusting software that tests higher prices and learns through trial and reward to avoid undercutting competitors.|ep_22|
|GLS-093|Black-Box Model Weights|وزن‌های شبکه عصبی جعبه‌سیاه|Billions of tuned numerical parameters inside a neural network whose individual pricing choices cannot be traced like written rules.|ep_22|
|GLS-094|Real-Time Voice Cloning|شبیه‌سازی زنده صدای انسان|Software taking three seconds of recorded speech to impersonate a relative, boss, or banker live on a phone call.|ep_07|
|GLS-095|Browser-Use Agent|عامل خودکار کار با مرورگر وب|AI agent that reads screen layouts, clicks buttons, solves verification puzzles, and submits web forms like a human user.|ep_07, ep_28|
|GLS-096|ReAct Offensive Cyber Agent|عامل تهاجمی سایبری با الگوی استدلال و اقدام (ReAct)|Reasoning-and-acting AI agent that reads public software vulnerability notes and writes working break-in scripts within fifteen minutes.|ep_09|
|GLS-097|Cognitive Debt|بدهی شناختی|Loss of independent recall and reasoning skill that builds up when students or analysts outsource first-draft thinking to AI.|ep_12|
|GLS-098|Functional Neural Connectivity|هم‌بستگی کارکردی شبکه‌های عصبی مغز|Synchronized firing measured across brain regions on an EEG headset while a person solves a hard writing task unaided.|ep_12|
|GLS-099|Cognitive Offloading|برون‌سپاری بار شناختی|Handing routine mental steps over to an outside tool like a calculator, notebook, or AI assistant.|ep_12|
|GLS-100|Sycophantic Retention Tuning|تنظیم چاپلوسانه مدل برای نگه‌داشت کاربر|Training a chatbot to flatter users and agree with their emotions so daily session time climbs past ninety minutes.|ep_18|
|GLS-101|Companion Architecture|معماری ربات همراه عاطفی|Software design combining long-term memory, humanlike voice, and emotional prompts to simulate a close confidant.|ep_18|
|GLS-102|Embodied AI|هوش مصنوعی کالبدیافته|Artificial intelligence running inside physical machines such as factory arms and bipedal robots that manipulate real objects.|ep_13|
|GLS-103|Vision-Language-Action (VLA) Model|مدل بینایی-زبان-عمل (VLA)|Unified neural network that converts camera video and spoken commands directly into motor joint trajectories for a robot.|ep_13|
|GLS-104|Humanoid Bill of Materials (BOM)|فهرست بهای قطعات ربات انسان‌نما|Complete itemized parts list and factory cost to build one walking industrial robot, from batteries to screws and sensors.|ep_13, ep_16|
|GLS-105|Aerial Computer-Vision Underwriting|ارزیابی بیمه‌ای با بینایی ماشین هوایی|Insurance software scanning drone and satellite roof photos automatically to flag wear or brush risk and cancel home policies.|ep_17|
|GLS-106|Forward Catastrophe Modeling|مدل‌سازی پیش‌نگر بلایای طبیعی|Climate and loss simulation software predicting future wildfire or storm payouts instead of relying on past claim averages.|ep_17|
|GLS-107|Diffusion Video Synthesis|تولید ویدیو با مدل‌های انتشاری (دیفیوژن)|Generative neural architecture creating photorealistic moving footage frame by frame from text prompts or reference clips.|ep_21|
|GLS-108|Synthetic Agent Web Traffic|ترافیک وب تولیدشده توسط عامل‌های خودکار|HTTP requests generated by automated bots, AI crawlers, and browser agents making up over half of internet traffic.|ep_21, ep_28|
|GLS-109|High-NA EUV Lithography|لیتوگرافی فرابنفش شدید با روزنه عددی بالا|Precision extreme-ultraviolet mirror optics built solely by ASML to etch circuit lines below two nanometers onto silicon wafers.|ep_15|
|GLS-110|CoWoS Advanced Packaging|بسته‌بندی پیشرفته تراشه CoWoS|TSMC silicon packaging method fusing logic dies and stacked high-bandwidth memory chips together onto one substrate.|ep_15|
|GLS-111|Sub-5nm Logic Wafer|ویفر منطقی زیر پنج نانومتر|Ultra-dense silicon processor discs carrying transistors under five nanometers wide where Taiwan produces over eighty percent of world supply.|ep_15|
|GLS-112|Backside Power Delivery (A16)|تغذیه برق از پشت ویفر سیلیکونی|Chip wiring layout routing electric power through the underside of the silicon wafer so top layers carry data signals cleanly.|ep_15|
|GLS-113|Compute Credit Lock-In|حبس اکوسیستمی با اعتبار رایانش ابری|Promotional server vouchers from cloud vendors that look huge on dashboards yet pay zero cash toward rent or outside vendors.|ep_01, ep_03|
|GLS-114|GPS-Denied Optical Guidance|هدایت نوری پایانی در محیط بدون سیگنال GPS|Onboard camera and neural target tracking letting a twenty-thousand-dollar drone steer home even when electronic jamming blocks GPS.|ep_19|
|GLS-115|Autonomous Saturation Swarm|ازدحام پهپادی خودکار برای اشباع پدافند|Coordinated wave of low-cost self-guided drones launched together to use up a warship's limited interceptor missiles.|ep_19|
|GLS-116|Graph Neural Network (GNN) AML|شبکه عصبی گرافی ضدپولشویی|Machine-learning model mapping money transfers across linked accounts to auto-flag suspected laundering.|ep_20|
|GLS-117|AI-Exposure Occupation Quartile|چارک شغلی با بیشترین مواجهه با هوش مصنوعی|Top twenty-five percent tier of office jobs whose daily writing and coding tasks overlap heavily with language models.|ep_04, ep_16|
|GLS-118|Cold-Draft Verification Rule|قاعده پیش‌نویس مستقل پیش از مراجعه به مدل|Personal discipline of reading source filings and writing your first structural outline unaided before opening an AI prompt box.|ep_12|
|GLS-119|Distributed Checkpoint Synchronization|هم‌گام‌سازی توزیع‌شده نقاط ذخیره آموزش مدل|Moving petabytes of training state between distant cloud data centers across undersea fiber cables during model runs.|ep_27|
|GLS-120|Air-Gapped Local Inference|استنتاج محلی کاملاً ایزوله از شبکه|Running an AI assistant entirely on your own encrypted computer disconnected from cloud servers and internet cables.|ep_18|

### False-Friend Callouts for AI Architecture and Compute Economics

Distinguish inference (اجرای مدل آموزش‌دیده برای تولید پاسخ) from model training (آموزش اولیه وزن‌های شبکه). Token deflation below one percent of 2023 prices hits inference bills first. Explain open-weight models accurately as models whose trained numeric parameters run locally offline. That technical property differs from open-source software licenses covering full training datasets. Translate agent consistently as عامل خودکار نرم‌افزاری across coding, browser-use, and banking scripts. Avoid literal espionage or sales-broker phrasing.

## Domain 4: Power Grids and Physical Infrastructure (GLS-121 to GLS-160)

Software deploys in six months while transformers, substations, cooling water, and subsea cables take five to ten years. These forty entries anchor electrical units, mineral processing steps, and mechanical robotics hardware in plain Persian engineering terminology.

### Bilingual Lookup Table (40 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-121|Baseload Power|برق بار پایه (تولید پیوسته شبانه‌روزی)|Steady round-the-clock electricity supplied nonstop by nuclear, gas, or hydro plants regardless of wind or cloud cover.|ep_01, ep_08|
|GLS-122|Gigawatt Campus|مجتمع دیتاسنتر در مقیاس گیگاواتی|Massive data-center complex demanding one to five gigawatts of steady power, equal to electricity for millions of homes.|ep_01, ep_08, ep_23|
|GLS-123|Kilowatt Rack Density|چگالی توان مصرفی رک سرور|Electrical draw packed inside one tall server cabinet, climbing from ten kilowatts in legacy clouds past one hundred kilowatts.|ep_03|
|GLS-124|PJM Capacity Auction|مزایده ظرفیت شبکه برق منطقه‌ای PJM|Annual wholesale market clearing payments to keep power plants ready across thirteen eastern US states and Washington.|ep_01, ep_08|
|GLS-125|Megawatt-Day Clearing Price|قیمت تسویه ظرفیت به ازای مگاوات-روز|Wholesale auction benchmark price paid per megawatt of committed standby generation capacity for each calendar day.|ep_01, ep_08|
|GLS-126|Large Power Transformer (LPT)|ترانسفورماتور قدرت فشارقوی (LPT)|Custom multi-ton grid machine stepping transmission voltages up or down with waitlists running one hundred to one hundred sixty weeks.|ep_08, ep_24|
|GLS-127|Grain-Oriented Electrical Steel (GOES)|فولاد الکتریکی دانه‌جهت‌دار (GOES)|Specialty silicon steel rolled so crystal grains align magnetically inside large power transformer cores.|ep_08|
|GLS-128|Substation Interconnection Queue|صف انتظار اتصال به پست برق فشارقوی|Multi-year engineering waitlist for power plants, housing projects, and server farms seeking permission to plug into a grid substation.|ep_01, ep_02, ep_08|
|GLS-129|NERC Firm Capacity Shortfall|کسری ظرفیت مطمئن شبکه در برآورد NERC|Warning from North America's grid reliability watchdog that steady peak generation falls ninety-four gigawatts short of demand.|ep_08|
|GLS-130|High-Voltage Permitting Lag|تأخیر مجوزدهی خطوط انتقال فشارقوی|Five-to-ten-year maze of environmental reviews, eminent-domain lawsuits, and state approvals blocking new interstate transmission lines.|ep_01, ep_08|
|GLS-131|Behind-the-Meter Generation|تولید برق اختصاصی پشت کنتور|Power plant or gas turbine built directly on a data center's own property to bypass public grid queues.|ep_08|
|GLS-132|Power Purchase Agreement (PPA)|قرارداد بلندمدت خرید تضمینی برق (PPA)|Long-term contract locking in the entire electrical output of a dedicated power plant for a single corporate buyer.|ep_08|
|GLS-133|Liquid-Cooled Server Tray|سینی سرور با خنک‌کاری مایع|Slide-out processor board piped with coolant tubes to carry away extreme heat from high-wattage AI chips.|ep_03, ep_25|
|GLS-134|Evaporative Cooling Water|آب تبخیری برج‌های خنک‌کننده|Fresh municipal water evaporated into vapor inside data-center cooling towers to reject server heat into the air.|ep_25|
|GLS-135|Closed-Loop Dry Chiller|چیلر خشک مدار بسته|Air-cooled heat exchanger recycling sealed coolant without daily water evaporation while consuming extra electricity.|ep_25|
|GLS-136|Indirect Power-Plant Cooling|مصرف غیرمستقیم آب در نیروگاه برق|Water evaporated back at thermal or nuclear power plants to generate the electricity consumed by data-center servers.|ep_25|
|GLS-137|LFP (Lithium-Iron-Phosphate) Grid Battery|باتری شبکه برق لیتیوم-آهن-فسفات (LFP)|Stationary utility battery chemistry using iron and phosphate instead of cobalt to store solar power for data centers.|ep_25|
|GLS-138|Phosphate Rock Reserve|ذخایر سنگ فسفات|Mined mineral supply essential for crop fertilizer and LFP grid batteries, seventy percent held inside Morocco.|ep_25|
|GLS-139|Purified Phosphoric Acid (PPA)|اسید فسفریک خالص‌شده|Refined industrial chemical derived from phosphate rock that is required to manufacture LFP battery cathodes.|ep_25|
|GLS-140|100-Year Assured Water Supply|گواهی تأمین آب مطمئن صدساله|Legal certificate required in arid Sunbelt states proving a housing subdivision has physical water rights for a full century.|ep_25|
|GLS-141|Copper Heatsink|هیت‌سینک (گرماگیر) مسی|Heavy finned copper block clamped atop a processor to pull thermal heat away into fans or liquid loops.|ep_03|
|GLS-142|Neodymium (NdFeB) Magnet|آهن‌ربای دائمی نئودیمیوم (NdFeB)|High-strength permanent magnet made from neodymium, iron, and boron powering compact robot joints and EV motors.|ep_13|
|GLS-143|Planetary Roller Screw|پیچ غلتکی سیاره‌ای|Precision mechanical screw using threaded planetary rollers to turn motor spin into heavy linear push inside robot limbs.|ep_13|
|GLS-144|Harmonic Drive Reducer|کاهنده دنده هارمونیک|Zero-backlash flexspline gearbox letting a robot joint apply high torque smoothly inside a tiny housing.|ep_13|
|GLS-145|Electromechanical Actuator|عملگر الکترومکانیکی|Motor, gearbox, and sensor assembly acting as a robot's artificial muscle inside every moving joint.|ep_13|
|GLS-146|Midstream Chemical Refining|پالایش شیمیایی میان‌دستی مواد معدنی|Industrial smelting and acid separation step turning raw mined ore into battery-grade metals and copper wire.|ep_08, ep_13|
|GLS-147|Subsea Fiber-Optic Cable|کابل فیبر نوری زیردریایی|Armored glass-fiber trunk laid across ocean floors carrying over ninety-nine percent of intercontinental internet traffic.|ep_27|
|GLS-148|Cable-Repair Ship Backlog|صف انتظار کشتی‌های تعمیر کابل زیردریایی|Shortage and waiting queue for specialized ocean vessels able to haul up and splice severed deep-sea fiber trunks.|ep_27|
|GLS-149|Low-Earth-Orbit (LEO) Constellation|منظومه ماهواره‌ای مدار پایین زمین (LEO)|Fleet of thousands of communication satellites orbiting close to Earth to beam broadband over remote areas or broken cables.|ep_27|
|GLS-150|Terabit Optical Throughput|ظرفیت انتقال نوری در مقیاس ترابیت|Volume of laser data pulses streaming across modern submarine fibers each second, measured in trillions of bits.|ep_27|
|GLS-151|Operational Technology (OT) SCADA|فناوری عملیاتی و کنترل صنعتی (OT/SCADA)|Industrial control hardware and sensors directly opening breakers, water valves, and turbines inside physical utility plants.|ep_24|
|GLS-152|Substation Breaker Allocation|سهمیه بریکر در پست برق|Fixed high-voltage electrical feed slot assigned to one data-center bay inside a utility substation.|ep_03, ep_08|
|GLS-153|Terawatt-Hour (TWh) Load|بار مصرفی سالانه برق بر حسب تراوات-ساعت|Trillion watt-hours of annual electricity consumed across all servers, equal to a major industrial country's yearly power draw.|ep_01, ep_08, ep_25|
|GLS-154|Regional Transmission Organization (RTO)|سازمان منطقه‌ای انتقال برق (RTO)|Multi-state grid operator running high-voltage transmission lines and wholesale electricity capacity auctions.|ep_08|
|GLS-155|Public Utility Commission (PUC) Tariff|تعرفه مصوب کمیسیون خدمات عمومی (PUC)|State regulatory rate schedule deciding how much of a new data-center power line lands on household monthly electric bills.|ep_08|
|GLS-156|Solid Rocket Motor Lead Time|زمان انتظار ساخت پیشران موشک سوخت جامد|Multi-year factory wait to cast specialized chemical propellant casings for naval air-defense interceptor missiles.|ep_19|
|GLS-157|Vertical Launch System (VLS) Cell|سلول پرتاب عمودی موشک روی ناو (VLS)|Armored vertical missile tube built into a warship deck holding one interceptor that requires a port crane to reload.|ep_19|
|GLS-158|Directed-Energy Laser Defense|پدافند لیزری انرژی هدایت‌شده|Shipboard optical beam weapon firing electricity instead of missiles at low-cost drones, limited by fog, dust, and cooling.|ep_19|
|GLS-159|Cleanroom Fab Capacity|ظرفیت اتاق تمیز کارخانه تراشه‌سازی (Fab)|Dust-free semiconductor manufacturing floor space running continuously to print, etch, and layer silicon wafers.|ep_15|
|GLS-160|Drought-Surcharge Water Tier|پلکان تعرفه جریمه خشکسالی آب شهری|Municipal utility pricing ladder charging steeply higher rates per gallon when regional aquifers or reservoirs run low.|ep_25|

### False-Friend Callouts for Power Grids and Physical Infrastructure

Keep power capacity measured in gigawatts separate from annual cumulative electricity consumption measured in terawatt-hours. Mixing units corrupts IEA and NERC reliability comparisons. Expand PPA carefully by episode context. In Episode 08 it stands for Power Purchase Agreement (قرارداد خرید تضمینی برق), whereas in Episode 25 battery chemistry it refers to Purified Phosphoric Acid (اسید فسفریک خالص‌شده). Always differentiate raw mineral mining (استخراج معدن در استرالیا یا شیلی) from midstream chemical refining (پالایش شیمیایی متمرکز در چین).

## Domain 5: Cybersecurity and Post-Quantum Cryptography (GLS-161 to GLS-200)

Episodes 07, 09, 20, 21, 24, 28, and 29 examine voice cloning, one-day exploits, state infrastructure persistence, and post-quantum key exchange. Precision on statutory breach timing and cryptographic algorithms protects technical viewers from costly mistakes.

### Bilingual Lookup Table (40 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-161|One-Day (N-Day) Vulnerability|آسیب‌پذیری یک‌روزه (وصله‌دار)|Known software flaw whose vendor patch is already public while thousands of servers remain unpatched for weeks.|ep_09|
|GLS-162|Zero-Day Vulnerability|آسیب‌پذیری روز صفر|Previously secret software bug unknown to the vendor with zero public fix available when attackers first strike.|ep_09|
|GLS-163|Common Vulnerabilities and Exposures (CVE)|شناسه آسیب‌پذیری‌های عمومی (CVE)|Public catalog ID number and technical summary assigned to every disclosed software security flaw.|ep_09|
|GLS-164|Known Exploited Vulnerabilities (KEV) Catalog|فهرست آسیب‌پذیری‌های فعالانه بهره‌برداری‌شده (KEV)|Official CISA watchlist of software holes actively used by real attackers in the wild that federal agencies must patch fast.|ep_09, ep_24|
|GLS-165|Patch-to-Exploit Window|پنجره زمانی میان انتشار وصله و نفوذ|Dangerous gap between the minute a vendor publishes a bug fix and the week corporate IT finishes testing and installing it.|ep_09|
|GLS-166|Living Off the Land (LOTL)|نفوذ پنهان با ابزارهای بومی سیستم (LOTL)|Stealth cyber technique using built-in Windows and router admin tools instead of custom malware files so scanners see zero virus.|ep_24|
|GLS-167|Pre-Positioned Infrastructure Persistence|استقرار و ماندگاری از پیش آماده در زیرساخت|Covertly planting hidden access inside water, power, and telecom networks years ahead of any conflict to flip switches later.|ep_24|
|GLS-168|IT-to-OT Lateral Movement|حرکت جانبی از شبکه اداری به شبکه صنعتی|Hopping from compromised corporate email and billing servers across network boundaries into industrial substation controls.|ep_24|
|GLS-169|Lawful-Intercept Backdoor|درگاه شنود قانونی الزام‌شده|Government-mandated wiretap access port built into telecom routers that foreign intelligence agencies can turn into master keys.|ep_24|
|GLS-170|End-to-End Encryption (E2EE)|رمزنگاری سرتاسری (E2EE)|Cryptographic lock scrambling messages on the sender's device so phone carriers and server operators hold unreadable gibberish.|ep_24, ep_29|
|GLS-171|SMS Two-Factor Interception|شنود کد تایید دومرحله‌ای پیامکی|Stealing six-digit bank login codes sent over unencrypted mobile carrier text networks via telecom breaches or SIM swaps.|ep_24, ep_28|
|GLS-172|FIDO2 Hardware Passkey|کلید عبور سخت‌افزاری FIDO2|Cryptographic USB or device-bound sign-in key tied mathematically to a real website domain so fake voice calls cannot steal it.|ep_07, ep_09, ep_24, ep_28|
|GLS-173|Cross-Chain Bridge Exploit|حمله به پل ارتباطی بین بلاک‌چین‌ها|Attack draining digital reserves from smart contracts connecting separate blockchains, triggering instant secondary-market stablecoin panics.|ep_02|
|GLS-174|Authorized Push Payment (APP) Fraud|کلاهبرداری واریز مستقیم با تایید قربانی (APP)|Scam where an impersonator tricks a victim into typing and sending a fast irreversible bank transfer voluntarily.|ep_07|
|GLS-175|Offline Duress Codeword|اسم رمز خانوادگی آفلاین برای تشخیص کلون صوتی|Pre-agreed secret spoken word shared in person among family members to verify identity during urgent voice-clone calls.|ep_07|
|GLS-176|Credit Bureau Security Freeze|مسدودسازی دائمی پرونده اعتباری|Free lock placed on your US credit files at Equifax, Experian, and TransUnion stopping anyone from opening loans in your name.|ep_09|
|GLS-177|IRS Identity Protection PIN|پین شش‌رقمی حفاظت هویت مالیاتی (IRS IP PIN)|Six-digit annual IRS number blocking criminals from filing a fake tax return and stealing your federal refund.|ep_09|
|GLS-178|Bot Traffic Share|سهم ترافیک ربات‌ها در درخواست‌های وب|Percentage of global web server hits triggered by software scripts instead of human eyes.|ep_21, ep_28|
|GLS-179|Proof of Personhood|اثبات انسان بودن (هویت یگانه انسانی)|Cryptographic credential verifying an online visitor is one unique living human without necessarily revealing their full name.|ep_28|
|GLS-180|Zero-Knowledge Selective Disclosure|افشای گزینشی با اثبات دانش صفر|Math proof confirming you meet an age or residency rule without handing websites your birthdate, passport number, or login trail.|ep_28|
|GLS-181|C2PA Content Credentials|گواهی اصالت محتوای C2PA|Open cryptographic standard embedding tamper-evident camera hardware signatures inside photos and video at the shutter moment.|ep_21|
|GLS-182|EXIF and Telemetry Hashing|درهم‌سازی متادیتای تصویر و داده‌های حسگر|Computing a mathematical fingerprint of raw camera files and sensor logs immediately so later edits break the hash.|ep_21|
|GLS-183|Harvest-Now-Decrypt-Later (HNDL)|گردآوری امروز و رمزگشایی فردا (HNDL)|Intelligence agencies saving intercepted encrypted internet traffic in huge archives today to crack once quantum machines mature.|ep_29|
|GLS-184|Post-Quantum Cryptography (PQC)|رمزنگاری پساکوانتومی (PQC)|Mathematical encryption schemes running on ordinary computers that resist decryption attacks from future quantum processors.|ep_29|
|GLS-185|ML-KEM (FIPS 203)|استاندارد تبادل کلید پساکوانتومی ML-KEM|US federal post-quantum key-exchange standard derived from Kyber lattice math to secure browser and bank connections.|ep_29|
|GLS-186|ML-DSA (FIPS 204)|استاندارد امضای دیجیتال پساکوانتومی ML-DSA|US federal post-quantum digital signature standard protecting software updates, bank certificates, and legal documents.|ep_29|
|GLS-187|Shor's Algorithm|الگوریتم کوانتومی شور|Quantum computing method capable of factoring large primes and breaking RSA and elliptic-curve public-key locks fast.|ep_29|
|GLS-188|Grover's Algorithm|الگوریتم کوانتومی گروور|Quantum search speedup that cuts effective symmetric key strength in half, leaving AES-256 safely beyond brute-force reach.|ep_29|
|GLS-189|RSA-2048 Deprecation Cliff|ضرب‌الاجل کنارگذاری رمزنگاری RSA-2048|Hard December 2030 federal deadline requiring US agencies and contractors to retire legacy RSA and elliptic-curve encryption.|ep_29|
|GLS-190|Symmetric AES-256 Encryption at Rest|رمزنگاری متقارن AES-256 روی داده‌های ذخیره‌شده|Local file encryption using a single 256-bit secret password or key before uploading medical or tax archives to cloud storage.|ep_29|
|GLS-191|Hybrid Post-Quantum TLS|لایه انتقال امن ترکیبی پساکوانتومی (Hybrid TLS)|Browser connection handshake pairing classic elliptic-curve math with ML-KEM so an attacker must break both locks.|ep_29|
|GLS-192|Hardware Security Module (HSM)|ماژول سخت‌افزاری امنیت کلیدها (HSM)|Tamper-resistant physical bank vault appliance inside data centers that stores master cryptographic keys and signs wires.|ep_29|
|GLS-193|Suspicious Activity Report (SAR)|گزارش تراکنش مشکوک بانکی (SAR)|Confidential compliance report a bank files with US financial intelligence whenever software flags unusual customer cash activity.|ep_20|
|GLS-194|False-Positive Debanking|بستن اشتباه حساب بانکی در خطای مثبت کاذب|Bank shutting down an innocent family's checking account because an automated fraud model misread normal payroll or cash transfers.|ep_20|
|GLS-195|Ring 0 Kernel Regression|اختلال هسته سطح صفر سیستم‌عامل (Ring 0)|Crash inside the deepest privileged core of an operating system triggered by installing an untested security patch too fast.|ep_09|
|GLS-196|AI Fuzzing|آزمون خطایابی تصادفی هوشمند (AI Fuzzing)|Automated security testing that uses models to feed malformed inputs into software until hidden crash bugs surface.|ep_09|
|GLS-197|Device-Fingerprint Surveillance|ردگیری اثر انگشت دستگاه برای نرخ‌گذاری اختصاصی|Collecting screen resolution, fonts, battery stats, and browser traits to track a shopper and raise checkout prices silently.|ep_22, ep_28|
|GLS-198|ChexSystems Banking Record|سابقه بین‌بانکی ChexSystems|US inter-bank reporting database recording forced checking-account closures that blocks debanked consumers from opening new accounts.|ep_09, ep_20|
|GLS-199|PQXDH Messaging Handshake|پروتکل دست‌دادن پیام‌رسان پساکوانتومی PQXDH|Post-quantum cryptographic handshake deployed by encrypted messengers like Signal to block Harvest-Now-Decrypt-Later wiretaps.|ep_29|
|GLS-200|Subpoenaed Cloud Prompt Log|تاریخچه گفت‌وگوی ابری احضارپذیر با حکم دادگاه|Stored history of AI chatbot questions and answers pulled off vendor servers by civil court subpoena during lawsuits.|ep_18|

### False-Friend Callouts for Cybersecurity and Post-Quantum Cryptography

Keep One-Day or N-Day vulnerabilities (حفره‌های دارای وصله منتشرشده که هنوز نصب نشده‌اند) separate from Zero-Day bugs (حفره‌های بی‌وصله و ناشناخته). Persian tech media frequently mislabels N-day ransomware attacks as zero-day. Clarify that Shor breaks asymmetric RSA and elliptic-curve key exchange, while Grover merely halves symmetric strength so local AES-256 file encryption remains strong. Translate Living Off the Land (LOTL) as stealth persistence using built-in Windows and router administration commands, skipping agricultural phrasing completely.

## Domain 6: Geopolitics and Trade Chokepoints (GLS-201 to GLS-240)

Subsea cables, rare-earth sintering lines, Taiwanese logic wafers, and Gulf sovereign capital funds tie local household budgets to global bottlenecks. Persian equivalents here reflect diplomatic and trade-economics usage without partisan sloganeering.

### Bilingual Lookup Table (40 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-201|Strait Quarantine|قرنطینه دریایی و گمرکی تنگه|Naval customs inspection cordon restricting ships entering or leaving Taiwan without declaring a full shooting blockade.|ep_15|
|GLS-202|EUV Remote Kill-Switch|کلید ازکاراندازی از راه دور دستگاه‌های EUV|Encrypted software disablement built into ASML lithography machines to brick captured wafer fabs during an invasion.|ep_15|
|GLS-203|Silicon Shield|سپر نیمه‌هادی (سپر سیلیکونی)|Strategic theory that Taiwan's monopoly over leading-edge chips compels Western powers to deter an attack on the island.|ep_15|
|GLS-204|Bretton Woods Gold Window|پنجره تبدیل طلای برتون وودز|Post-1944 pledge allowing foreign central banks to swap US dollars for Treasury gold bars at thirty-five dollars an ounce until 1971.|ep_02|
|GLS-205|London Gold Pool|استخر تثبیت قیمت طلای لندن|Eight-nation central bank alliance formed in 1961 to sell gold reserves together and hold bullion at thirty-five dollars until it cracked in 1968.|ep_02|
|GLS-206|Cross-Border Correspondent Banking|بانکداری کارگزاری فرامرزی|Legacy network of intermediary bank accounts routing international SWIFT wire payments across days and settlement cutoffs.|ep_02|
|GLS-207|Gulf Sovereign Wealth Fund (SWF)|صندوق ثروت حاکمیتی کشورهای خلیج فارس|State-owned investment funds in Abu Dhabi, Riyadh, and Doha managing over six trillion dollars in accumulated hydrocarbon surpluses.|ep_23|
|GLS-208|Petrodollar-to-Compute Conversion|تبدیل رانت نفتی به مالکیت زیرساخت رایانش|Strategic shift converting twentieth-century oil and gas export cash into permanent equity stakes inside global AI computing centers.|ep_23|
|GLS-209|AI Infrastructure Partnership|ائتلاف سرمایه‌گذاری زیرساخت هوش مصنوعی (AIP)|Hundred-billion-dollar syndicate pairing BlackRock, Microsoft, Nvidia, and Abu Dhabi's MGX to finance gigawatt AI campuses.|ep_23|
|GLS-210|BIS Export-License Covenant|شرط‌نامه مجوز صادرات دفتر صنعت و امنیت (BIS)|Strict US Commerce Department security terms requiring Gulf data centers to strip Chinese telecom gear before receiving advanced GPUs.|ep_23|
|GLS-211|CFIUS National-Security Firewall|دیوار محدودیت امنیت ملی کمیته سرمایه‌گذاری خارجی (CFIUS)|US interagency vetting rules restricting foreign sovereign investors to passive capital seats without code access or board vetoes.|ep_23|
|GLS-212|Critical Mineral Refining Lock|انحصار پالایش مواد معدنی راهبردی|Concentration of roughly seventy-two percent of global chemical processing for copper, lithium, cobalt, and rare earths inside China.|ep_08, ep_13|
|GLS-213|Rare-Earth Sintering Bottleneck|گلوگاه تف‌جوشی و ساخت آهن‌ربای عناصر نادر خاکی|Industrial powder-metallurgy heat pressing where China controls ninety percent of high-strength magnet output for actuators.|ep_13|
|GLS-214|Humanoid Supply-Chain Concentration|تمرکز آسیایی زنجیره تامین ربات انسان‌نما|Morgan Stanley finding that sixty-three percent of public firms building physical humanoid components sit inside Asia and China.|ep_13|
|GLS-215|BPO Offshoring Corridor|کریدور برون‌سپاری خدمات اداری و مراکز تماس (BPO)|Export service pipeline sending Western customer-support and back-office jobs to hubs such as Manila and Bangalore for hard-currency pay.|ep_16|
|GLS-216|Hard-Currency Export Ladder|نردبان صادراتی کسب ارز سخت|Two-step climb from low-wage textile assembly to outsourced office work that built postwar Asian growth.|ep_16|
|GLS-217|External USD Debt-to-Reserve Ratio|نسبت بدهی خارجی دلاری به ذخایر ارزی|Comparison of a developing nation's dollar-denominated foreign debt payments against its central bank's liquid foreign-exchange reserves.|ep_16|
|GLS-218|Maritime War-Risk Insurance Surcharge|اضافه‌بهای بیمه ریسک جنگ دریایی|Extra hull and cargo insurance premium shipping lines pay when drone or blockade threats hit chokepoints like the Red Sea.|ep_15, ep_19|
|GLS-219|Adverse Cost-Exchange Ratio|نسبت نامطلوب هزینه رهگیری به هزینه تهاجم|Lopsided military math where defenders fire multi-million-dollar interceptor missiles to knock down twenty-thousand-dollar drones.|ep_19|
|GLS-220|Magazine Depth Depletion|تخلیه ظرفیت انبار موشکی ناوگان|Running out of defensive missiles aboard warships or air batteries faster than factories can build and reload replacements.|ep_19|
|GLS-221|Subsea Cable Corridor Bifurcation|دوشاخه شدن مسیرهای کابل زیردریایی|Splitting transoceanic internet routes into separate US-backed and Chinese-backed marine fiber paths avoiding contested straits.|ep_27|
|GLS-222|Hyperscaler Bandwidth Dominance|سلطه غول‌های ابری بر پهنای باند زیردریایی|Shift since 2012 taking Google, Meta, Amazon, and Microsoft from under ten percent to roughly seventy-five percent of subsea cable usage.|ep_27|
|GLS-223|Team Telecom Landing License|مجوز امنیتی فرود کابل کمیته تیم تلکام|US national-security clearance panel vetting where submarine fiber cables may touch American shores and which foreign partners can join.|ep_27|
|GLS-224|Data-Localization Mandate|الزام قانونی نگهداری بومی داده‌ها|National statutes forcing cloud operators and banks to store citizen financial or medical records on servers inside domestic borders.|ep_27|
|GLS-225|Moroccan Phosphate Concentration|تمرکز ذخایر فسفات جهان در مغرب|Geological dominance placing roughly seventy percent of world phosphate rock reserves inside Morocco ahead of battery and farm competition.|ep_25|
|GLS-226|East-West Supergrid Split|شکاف ابرشبکه فیزیکی اینترنت به شرق و غرب|Divergence of global undersea fiber and sovereign cloud zones into two rival geopolitical infrastructure networks.|ep_27|
|GLS-227|CHIPS Act Wafer Reshoring|بازگردانی تولید ویفر با قانون تراشه‌ها|US federal grant program funding new semiconductor fabs in Arizona and Ohio while leading-edge volume still centers in Taiwan.|ep_15|
|GLS-228|Irish IP Tax Routing|انتقال مالیاتی سود مالکیت فکری به ایرلند|Corporate tax strategy booking software intellectual-property royalties through low-tax European subsidiaries instead of US tax books.|ep_01, ep_03|
|GLS-229|Sovereign Digital Yuan Voucher|کوپن زمان‌دار یوان دیجیتال حاکمیتی|Expiring central-bank digital currency coupons tested in Shenzhen that vanished after six days unless spent at approved stores.|ep_01, ep_28|
|GLS-230|Volt Typhoon Infrastructure Dwell|استقرار خاموش چندساله گروه ولت تایفون|Multi-year stealth intrusion documented in CISA Advisory AA24-038A inside US water, port, and power utility networks.|ep_24|
|GLS-231|Salt Typhoon Telecom Breach|نفوذ گروه سالت تایفون به شبکه‌های مخابراتی|Foreign intelligence compromise of US telecom carrier networks through the very wiretap portals Congress mandated under CALEA.|ep_24|
|GLS-232|Red Sea Shipping Chokepoint|گلوگاه دریایی و کابلی دریای سرخ|Narrow maritime corridor linking Asia and Europe where drone threats spike freight insurance and endanger shallow undersea cables.|ep_19, ep_27|
|GLS-233|Luzon Strait Fiber Bottleneck|گلوگاه کابل‌های زیردریایی تنگه لوزون|Narrow ocean gap south of Taiwan carrying dense bundles of East Asian submarine internet cables through frequent seismic and naval risk.|ep_27|
|GLS-234|Apprenticeship Pipeline Hollowing|خالی شدن چرخه پرورش نیروهای تازه‌کار|Long-term shortage created when companies cut sixteen to nineteen percent of entry-level junior roles needed to train future senior staff.|ep_04|
|GLS-235|Demographic Dividend Reversal|معکوس شدن سود جمعیتی|Turning point when shrinking young worker cohorts no longer outnumber retirees, inverting national fiscal and healthcare math.|ep_26|
|GLS-236|Foreign Official Treasury Holdings|دارایی اوراق خزانه آمریکا نزد نهادهای رسمی خارجی|US government notes and bonds held inside foreign central banks and sovereign reserve vaults tracked monthly on TIC Table 5.|ep_02|
|GLS-237|Offshore Tether Reserve Domicile|ساختار برون‌مرزی نگهداری ذخایر تتر|Non-US legal residency and multi-asset custody structure holding Tether's Treasury bills alongside gold, Bitcoin, and secured loans.|ep_02|
|GLS-238|Sovereign Compute Joint Venture|سرمایه‌گذاری مشترک حاکمیتی برای زیرساخت رایانش|Cross-border corporate alliance pairing US cloud software firms with Gulf sovereign funds to build massive training clusters.|ep_23|
|GLS-239|Western Tariffed Robotics Spread|شکاف قیمتی ربات‌های غربی تحت تعرفه|Two-to-three-times unit price gap separating tariff-shielded Western robots from Chinese-built actuators and batteries.|ep_13|
|GLS-240|Geopolitical Custody Fragmentation|چندپارگی قضایی در نگهداری داده‌ها و ذخایر|Dividing global financial assets, encryption keys, and cloud databases across rival legal jurisdictions to guard against freezes.|ep_27|

### False-Friend Callouts for Geopolitics and Trade Chokepoints

Keep BIS as the US Bureau of Industry and Security (دفتر کنترل صادرات وزارت بازرگانی آمریکا) in GPU export scripts, avoiding confusion with the Bank for International Settlements in Basel. Separate Taiwan Strait maritime risk from Luzon Strait cable-bundle concentration south of Taiwan. Both routes carry different physical disruptions. Translate Sovereign Wealth Fund consistently as صندوق ثروت حاکمیتی (یا صندوق توسعه ملی) to keep Gulf state capital distinct from private venture funds.

## Domain 7: US Statutory Law and Tech Policy (GLS-241 to GLS-282)

Statutory precision separates serious documentary work from hearsay. All forty-two legal entries preserve exact section citations across the Internal Revenue Code, United States Code, Code of Federal Regulations, Federal Rules of Evidence, and European Union regulations.

### Bilingual Lookup Table (42 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-241|Public Law 119-27 (GENIUS Act)|قانون فدرال استیبل‌کوین‌ها (قانون جینیوس)|July 2025 US federal stablecoin statute requiring licensed digital-dollar issuers to hold liquid reserves one-for-one.|ep_02, ep_10|
|GLS-242|GENIUS Act Section 4(a)(1) Reserve Cap|بند انحصار ذخایر ۹۳ روزه قانون جینیوس|Federal statutory limit restricting payment stablecoin reserves strictly to cash, insured bank deposits, overnight repos, and ninety-three-day Treasury bills.|ep_02|
|GLS-243|GENIUS Act Section 4(a)(11) Zero-Yield Ban|بند ممنوعیت پرداخت سود به دارنده استیبل‌کوین|Clause barring licensed payment stablecoin issuers from paying holders any interest or yield while keeping Treasury bill spread.|ep_02|
|GLS-244|Public Law 119-21 (IRC Section 168(k))|ماده 168(k) قانون مالیات و قانون عمومی ۱۱۹-۲۱|July 2025 US tax statute restoring permanent one-hundred-percent year-one write-offs for servers, chips, and business gear.|ep_01, ep_03|
|GLS-245|IRC Section 174A Domestic R&D Expensing|ماده 174A کسر فوری هزینه پژوهش داخلی|Federal tax provision letting US corporations deduct domestic software engineering and AI research outlays immediately in year one.|ep_03|
|GLS-246|IRS Form 4562|اظهارنامه استهلاک مالیاتی فرم 4562|Official US federal tax attachment where corporations claim first-year bonus depreciation deductions on AI servers.|ep_03|
|GLS-247|Fair Labor Standards Act (FLSA) of 1938|قانون استانداردهای منصفانه کار ۱۹۳۸ (FLSA)|New Deal federal wage statute outlawing employers from paying minimum wages in company scrip redeemable only at company stores.|ep_01|
|GLS-248|Wielechowski v. State|رأی دیوان عالی آلاسکا در پرونده Wielechowski v. State|2017 Alaska Supreme Court ruling holding that lawmakers and governors may legally cut citizen dividend checks during budget shortages.|ep_01|
|GLS-249|12 CFR Part 1005 (Regulation E)|مقررات E انتقال الکترونیکی وجوه (12 CFR 1005)|1978 federal banking rule limiting consumer loss to fifty dollars on stolen logins while sticking victims with full losses on tricked self-transfers.|ep_07|
|GLS-250|Authorized Transfer Loophole|شکاف قانونی حواله تاییدشده توسط قربانی|Statutory gap in US banking law treating an AI-tricked victim's manual transfer tap as fully authorized by the customer.|ep_07|
|GLS-251|UCC Article 4A Security Procedure|ماده ۴A قانون تجارت یکسان آمریکا در رویه امنیتی حواله|State commercial-code framework governing business wire transfers and requiring banks to follow commercially sound security checks.|ep_07|
|GLS-252|UK PSR Mandatory 50/50 Reimbursement|قاعده بازپرداخت اجباری ۵۰/۵۰ خسارت کلاهبرداری در بریتانیا|British banking mandate requiring sending and receiving banks to split reimbursement of tricked push-scam losses up to eighty-five thousand pounds.|ep_07|
|GLS-253|11 U.S.C. Section 523(a)(8)|بند قانونی ممنوعیت بخشودگی وام دانشجویی در ورشکستگی|Federal bankruptcy statute blocking American graduates from wiping out student loans unless they pass an extreme undue-hardship test.|ep_11|
|GLS-254|Income-Driven Repayment (IDR)|طرح بازپرداخت متناسب با درآمد (IDR)|Federal student-loan payment formula capping monthly bills at a small fraction of post-poverty income while leaving private loans uncovered.|ep_11|
|GLS-255|Parent PLUS Loan Co-Signing|تضمین و تعهد والدین در وام دانشجویی (Parent PLUS)|Federal or private college borrowing backed personally by parents' retirement income and Social Security checks when graduates cannot pay.|ep_11|
|GLS-256|Federal Rule of Evidence 501|ماده ۵۰۱ آیین دادرسی ادله درباره مصونیت محرمانگی|Federal courtroom rule defining which relationships stay legally sealed from subpoenas, covering lawyers and therapists while omitting AI apps.|ep_18|
|GLS-257|Waiver of Evidentiary Privilege|سلب مصونیت قانونی محرمانگی با ارسال به شخص ثالث|Automatic loss of legal secrecy that happens the second you paste client, medical, or spousal facts into a third-party cloud chatbot.|ep_18|
|GLS-258|Garcia v. Character Technologies|پرونده قضایی Garcia v. Character Technologies|2025 federal court ruling rejecting blanket First Amendment immunity at the pleading stage for a manipulative AI companion platform.|ep_18|
|GLS-259|Rule 12(b)(6) Motion to Dismiss|درخواست رد دعوای بدوی طبق قاعده 12(b)(6)|Early defense request asking a judge to throw out a civil lawsuit before evidence discovery by arguing the complaint states no legal claim.|ep_18|
|GLS-260|Product-Design Defect Liability|مسئولیت مدنی ناشی از نقص طراحی محصول|Civil tort doctrine holding software makers accountable for unsafe architectural choices instead of treating outputs purely as protected speech.|ep_18|
|GLS-261|31 U.S.C. Section 5318(g)(2) Gag Rule|حکم منع افشای گزارش SAR (قانون رازداری بانکی)|Federal Bank Secrecy Act prohibition making it a crime for bank staff to tell a customer that an automated SAR flag triggered their closure.|ep_20|
|GLS-262|AML Consent Order|حکم توافقی نظارتی ضدپولشویی (Consent Order)|Binding federal enforcement settlement forcing a bank to pay massive fines and tighten automated transaction freezes after compliance misses.|ep_20|
|GLS-263|Liar's Dividend|سود دروغ‌گو (امتیاز انکار اسناد واقعی)|Perverse gain described by Chesney and Citron where rampant deepfakes let guilty defendants deny real video or audio recordings in court.|ep_21|
|GLS-264|Proposed Federal Rule of Evidence 707|پیش‌نویس ماده ۷۰۷ ادله اثبات فدرال|Stalled US federal court draft rule aimed at setting verification standards when parties challenge or submit machine-generated evidence.|ep_21|
|GLS-265|FRE 901(a) Authentication|احراز اصالت مدرک تحت قاعده 901(a)|Existing US evidence rule requiring a party offering video or audio to produce enough proof that the file is what they claim it is.|ep_21|
|GLS-266|Daubert Evidentiary Challenge|چالش کارشناسی داوبرت (Daubert)|Pre-trial court motion testing whether a party's forensic expert uses scientifically repeatable methods, costing tens of thousands per fight.|ep_21|
|GLS-267|Sz Huang v. Tesla, Inc.|پرونده قضایی Sz Huang v. Tesla در کالیفرنیا|California discovery order rejecting a bare claim that public video clips of executive statements might be deepfakes without concrete proof.|ep_21|
|GLS-268|Sherman Act Section 1|بخش اول قانون ضدانحصار شرمن|1890 US antitrust law banning contracts, combinations, or conspiracies among rival firms to fix prices or restrain trade.|ep_22|
|GLS-269|Hub-and-Spoke Algorithmic Collusion|تبانی الگوریتمی محور و پره (Hub-and-Spoke)|Antitrust structure where competing landlords each feed private pricing data into one central software hub that sends back coordinated rent hikes.|ep_22|
|GLS-270|U.S. v. RealPage, Inc.|شکایت ضدانحصار وزارت دادگستری علیه RealPage|Landmark US Justice Department civil antitrust complaint charging that shared landlord revenue software unlawfully coordinated residential rents.|ep_22|
|GLS-271|FTC Section 6(b) Surveillance Pricing Order|دستور تحقیق FTC درباره قیمت‌گذاری رصدی اختصاصی|Federal Trade Commission investigative subpoena power probing how retailers tailor different prices to individual shoppers using personal data.|ep_22|
|GLS-272|Tacit Parallel Markup|افزایش هم‌زمان و ضمنی قیمت‌ها|Competitors raising prices together smoothly through self-learning software bots without exchanging a single explicit human agreement.|ep_22|
|GLS-273|CALEA (47 U.S.C. Section 1002)|قانون الزام درگاه شنود مخابراتی آمریکا (CALEA)|1994 US telecom statute forcing phone and broadband carriers to engineer police wiretap access directly into switching equipment.|ep_24|
|GLS-274|CISA BOD 22-01|دستورالعمل عملیاتی الزام‌آور سایبری CISA BOD 22-01|Binding US cybersecurity directive forcing federal agencies to patch active KEV vulnerabilities on strict two-week timelines.|ep_09|
|GLS-275|SEC Form 8-K Item 1.05 Materiality|بند 1.05 گزارش فوری حوادث سایبری بااهمیت|Securities rule requiring public corporations to report major cybersecurity breaches within four business days of judging financial materiality.|ep_09|
|GLS-276|EU Regulation 2024/1183 (eIDAS 2.0)|مقررات اتحادیه اروپا درباره کیف‌پول هویت دیجیتال (eIDAS 2.0)|European Union mandate ordering all twenty-seven member states and major online platforms to support state-backed Digital Identity Wallets.|ep_28|
|GLS-277|White House OMB M-26-15|دستورالعمل کاخ سفید M-26-15 برای مهاجرت پساکوانتومی|Office of Management and Budget directive enforcing federal agency inventories and cryptographic migration toward post-quantum standards.|ep_29|
|GLS-278|26 U.S.C. Sections 3101 & 3111 (FICA)|مواد ۳۱۰۱ و ۳۱۱۱ قانون مالیات فدرال (FICA)|Federal Internal Revenue Code sections charging 12.4 percent Social Security payroll taxes strictly on human wages while taxing compute at zero.|ep_04, ep_26, ep_30|
|GLS-279|Antideficiency Act (31 U.S.C. Section 1341)|قانون منع هزینه‌کرد مازاد بر منابع (Antideficiency Act)|US federal law forbidding agencies from spending cash beyond trust-fund reserves, forcing automatic Social Security cuts around late 2032.|ep_30|
|GLS-280|SEC Release No. 1532 (Waste Management)|گزارش اجرایی ۱۵۳۲ بورس آمریکا (پرونده Waste Management)|2002 SEC fraud enforcement release against Waste Management executives who secretly stretched garbage-truck useful lives and faked salvage numbers.|ep_03|
|GLS-281|LexisNexis C.L.U.E. Loss-History Report|گزارش هفت‌ساله سوابق خسارت بیمه C.L.U.E.|Seven-year insurance database tracking every past property or water claim filed on a home address or homeowner.|ep_17|
|GLS-282|IRC Section 1411 Net Investment Income Tax|مالیات ۳/۸ درصدی درآمد خالص سرمایه‌گذاری (بند 1411)|Existing 3.8 percent federal surtax on high-earner stock and bond investment gains whose revenue currently bypasses Social Security's OASI trust fund.|ep_30|

### False-Friend Callouts for US Statutory Law and Tech Policy

Distinguish U.S.C. statutes enacted by Congress (قوانین مصوب کنگره) from C.F.R. executive agency rules (مقررات اجرایی فدرال مانند Regulation E). Translate evidentiary privilege strictly as مصونیت قانونی محرمانگی ارتباط در دادگاه, and never as social privilege. Similarly, a Rule 12(b)(6) motion to dismiss asks to end a civil suit before discovery, unlike a criminal acquittal. In GENIUS Act discussions, keep GENIUS in Latin or brief acronym form and clarify it names the US federal payment stablecoin law signed in July 2025.

## Domain 8: Spoken Camera Idioms and Channel Voice (GLS-283 to GLS-322)

The Reading Room blends deadpan documentary understatement with concrete desk cues. Literal word-for-word Persian renders idioms like hold the bag or fold the tent comical; these entries provide authoritative Persian equivalents calibrated for a calm host behind a walnut desk.

### Bilingual Lookup Table (40 Terms)

|ID|English Term|فارسی دقیق|Plain Camera English|Episodes|
|:---|:---|:---|:---|:---|
|GLS-283|Stick around for the next video|تا ویدیوی بعدی همراهمان بمانید|Calm deadpan end-of-episode sign-off inviting viewers into the connected follow-up investigation without hype.|ep_01, ep_02, ep_03|
|GLS-284|Run the math yourself|خودتان عددها را حساب کنید|Spoken invitation asking the viewer to multiply two public ledger numbers directly instead of trusting commentators.|ep_01, ep_02, ep_03|
|GLS-285|Keep X in the back of your mind|این نکته را گوشه ذهنتان نگه دارید|Retention device planting an early household fact or ledger row to pay off ten minutes later.|ep_01, ep_02, ep_03|
|GLS-286|On a whiteboard, that looks neat|روی تخته سفید، این طرح تمیز و بی‌نقص است|Dry contrast line framing an abstract Silicon Valley theory right before testing it against legal and physical reality.|ep_01, ep_02|
|GLS-287|Open the ledger on the desk|دفتر کل را روی میز باز کنید|Physical desk cue signaling that an official primary filing is replacing abstract commentary.|ep_01, ep_02, ep_03|
|GLS-288|Let's be fair to X on one point|انصاف را در یک نکته درباره طرف مقابل رعایت کنیم|Steelmanning transition granting the strongest valid fact on the opposing side before proving the core bottleneck.|ep_01, ep_02, ep_03|
|GLS-289|Grant every word of that defense|تمام این دفاعیه را هم کلمه‌به‌کلمه می‌پذیریم|Rhetorical pivot conceding an opponent's full technical defense just before showing why the broader math still breaks.|ep_02, ep_03|
|GLS-290|Take it off the top|همان اول کار از سرجمع کم کردن|Deducting a fee or tax directly from gross wages before a worker ever sees or touches the remaining balance.|ep_01, ep_03|
|GLS-291|Flip one page over|یک صفحه ورق بزنید|Physical reading transition moving from one statutory clause or filing table to the neighboring contradiction.|ep_03|
|GLS-292|Pull up the filing|پرونده رسمی را باز کنید|Camera cue bringing a public SEC, Treasury, or court record onto the screen for line-by-line inspection.|ep_01, ep_02, ep_03|
|GLS-293|Set X beside Y|این دو سند را کنار هم بگذارید|Placing two official public documents next to each other so their hidden connection becomes obvious visually.|ep_02, ep_03|
|GLS-294|Draw the boundary cleanly|مرز میان این دو موضوع را شفاف بکشیم|Separating legal accounting stretch from unlawful fraud cleanly so viewers never confuse two distinct statutory regimes.|ep_03|
|GLS-295|Look under the hood|جزئیات پنهان زیر کاپوت را بررسی کنید|Inspecting the actual holdings or footnote math buried underneath a clean fund label or dashboard headline.|ep_03|
|GLS-296|Foot the bill|پرداخت نهایی صورت‌حساب را بر عهده گرفتن|Being forced to pay the final cost when a policy, subsidy, or corporate bet runs out of money.|ep_01, ep_02, ep_30|
|GLS-297|Hit a brick wall|به بن‌بست سفت‌وسخت خوردن|Running straight into an unyielding statutory ceiling, cash limit, or physical grid constraint.|ep_01, ep_03|
|GLS-298|Keep the lights on|سرپا نگه داشتن کار و پرداخت هزینه‌های جاری|Paying basic recurring bills needed merely to stay open week to week with zero room for new growth.|ep_02|
|GLS-299|Walk out the door|خروج سریع سرمایه یا مشتری از سیستم|Deposits, customers, or tax revenue leaving an institution fast once a higher-yield alternative opens up.|ep_02|
|GLS-300|Pocket the spread|برداشتن کل مابه‌التفاوت سود نرخ بهره|Keeping the entire rate difference between what a firm collects on assets and pays out to depositors or token holders.|ep_02|
|GLS-301|At arm's length|در فاصله قانونی مستقل و خارج از تعهد مستقیم|Keeping a separate borrowing entity legally detached from the parent firm's balance sheet and direct bond covenants.|ep_03|
|GLS-302|Fold the tent|جمع کردن بساط بحث و بستن پرونده|Packing up an argument and conceding defeat right away if an analytical thesis fails tough expert objections.|ep_03|
|GLS-303|Sit on both sides of the booth|هم‌زمان در دو سوی میز خریدار و فروشنده نشستن|Acting simultaneously as major equity owner in a customer firm and as its cloud landlord recording backlog revenue.|ep_03|
|GLS-304|Hold the bag|زیر بار زیان نهایی ماندن|Being the final pension fund or retail buyer stuck with depreciated assets after insiders and sponsors exit.|ep_03, ep_05|
|GLS-305|Eat the loss|متحمل شدن کل ضرر از جیب خود|Absorbing a financial hit, scam theft, or fee cost directly out of your own pocket without reimbursement.|ep_02, ep_07|
|GLS-306|Clear the room|فروش رفتن کل عرضه در مزایده با نرخ جدید|Attracting enough bond bids at a Treasury auction to sell every dollar of newly issued government debt.|ep_02|
|GLS-307|Price someone out|حذف کردن فرد عادی با بالا بردن هزینه|Pushing electricity, housing, or courtroom legal fees so high that regular families can no longer afford participation.|ep_08, ep_21|
|GLS-308|Kick the can down the road|به تعویق انداختن بحران با ترفند موقت|Using temporary loan extensions or non-cash IOUs to delay an unavoidable crisis onto a future calendar year.|ep_05, ep_30|
|GLS-309|Pass the buck|مسئولیت را به گردن دیگری انداختن|Shifting blame for a rent spike, failed loan, or data breach onto an outside vendor or software model.|ep_03, ep_22|
|GLS-310|Skin in the game|داشتن سهم و ریسک شخصی واقعی در بازی|Putting your own personal capital or legal balance sheet directly at risk alongside investors and customers.|ep_05, ep_23|
|GLS-311|A closed-wall loop|چرخه بسته داخلی میان فروشنده و مشتری|Circular cash or credit deal where vendor investment funds flow straight back onto the vendor's own cloud servers as booked sales.|ep_01, ep_03|
|GLS-312|Wait for the other shoe to drop|در انتظار پیامد دوم و ناگزیر بودن|Anticipating the inevitable delayed accounting impairment or loan maturity crunch after an initial spending boom.|ep_03, ep_05|
|GLS-313|Cook the books|جعل و دست‌کاری غیرقانونی دفاتر مالی|Illegally falsifying corporate accounting records or inventing fake numbers to mislead auditors and shareholders.|ep_03|
|GLS-314|Smoke-filled room|اتاق‌های دربسته تبانی پنهانی|Classic image of secret backroom meetings where human executives verbally conspired to fix prices before software cartels.|ep_22|
|GLS-315|None of this is financial advice|هیچ‌کدام از این موارد توصیه سرمایه‌گذاری یا حقوقی نیست|Required deadpan editorial disclaimer separating structural educational analysis from personalized investment or tax counsel.|ep_01, ep_02, ep_03|
|GLS-316|Sooner or later, the bill settles|دیر یا زود حساب‌وکتاب واقعی تسویه می‌شود|Closing reality check reminding viewers that accounting assumptions eventually meet physical electric meters and cash due dates.|ep_01, ep_03|
|GLS-317|Step up one rung|یک پله در ساختار بالاتر برویم|Visual ladder cue moving sequentially from an older market mechanism to a faster, higher-speed modern layer.|ep_02, ep_04|
|GLS-318|Saw through the bottom rung|بریدن پله اول نردبان ورود|Eliminating entry-level jobs or low-cost export steps so newcomers cannot climb onto the career or development ladder.|ep_04, ep_16|
|GLS-319|On paper versus in cash|روی کاغذ دفتری در برابر پول نقد واقعی|Sharp contrast separating theoretical GAAP earnings or PIK accrued interest from actual spendable dollars wired into bank accounts.|ep_03, ep_05|
|GLS-320|Catch someone flat-footed|غافلگیر کردن در حالت بی‌دفاعی و تاخیر|Striking a slow human bank committee or corporate IT patch team completely unprepared before they can react.|ep_09, ep_10|
|GLS-321|Buy time on the calendar|خریدن زمان روی تقویم بدون حل اصل مشکل|Delaying an accounting write-down or debt default by a few quarters without changing the underlying cash burn.|ep_02, ep_05|
|GLS-322|Read that clause line by line|این بند قانونی را خط‌به‌خط بخوانید|Studio promise to check actual statutory text word by word instead of summarizing press releases.|ep_02, ep_03|

### False-Friend Callouts for Spoken Camera Idioms and Channel Voice

Render physical desk cues such as open the ledger, flip one page over, and set X beside Y directly as natural studio invitations to inspect documents. Replace English financial slang such as hold the bag, kick the can down the road, and eat the loss with crisp Persian financial idioms preserving who pays and when. Keep the closing disclaimer and episode handoff completely free of promotional hype or urgent subscriber pleas.

## Episode Coverage Index (ep_01 to ep_30)

Every episode in the 30-episode Season 1 slate connects directly to canonical entries in `glossary_en_fa.json` so automated subtitle preparers and mastery book builders resolve domain vocabulary deterministically.

|Episode|Mapped Terms|Sample IDs|
|:---|---:|:---|
|ep_01|48|GLS-001, GLS-003 ... GLS-316|
|ep_02|57|GLS-001, GLS-002 ... GLS-322|
|ep_03|65|GLS-005, GLS-010 ... GLS-322|
|ep_04|9|GLS-005, GLS-006 ... GLS-318|
|ep_05|15|GLS-041, GLS-043 ... GLS-321|
|ep_06|9|GLS-012, GLS-026 ... GLS-066|
|ep_07|10|GLS-094, GLS-095 ... GLS-305|
|ep_08|22|GLS-011, GLS-038 ... GLS-307|
|ep_09|16|GLS-044, GLS-096 ... GLS-320|
|ep_10|10|GLS-010, GLS-028 ... GLS-320|
|ep_11|5|GLS-080, GLS-082 ... GLS-255|
|ep_12|4|GLS-097, GLS-098, GLS-099, GLS-118|
|ep_13|12|GLS-102, GLS-103 ... GLS-239|
|ep_14|6|GLS-026, GLS-077 ... GLS-091|
|ep_15|10|GLS-109, GLS-110 ... GLS-227|
|ep_16|9|GLS-033, GLS-040 ... GLS-318|
|ep_17|7|GLS-073, GLS-074 ... GLS-281|
|ep_18|10|GLS-089, GLS-100 ... GLS-260|
|ep_19|12|GLS-001, GLS-003 ... GLS-232|
|ep_20|7|GLS-029, GLS-116 ... GLS-262|
|ep_21|11|GLS-107, GLS-108 ... GLS-307|
|ep_22|11|GLS-030, GLS-092 ... GLS-314|
|ep_23|13|GLS-042, GLS-048 ... GLS-310|
|ep_24|13|GLS-126, GLS-151 ... GLS-273|
|ep_25|11|GLS-133, GLS-134 ... GLS-225|
|ep_26|7|GLS-005, GLS-034 ... GLS-278|
|ep_27|13|GLS-119, GLS-147 ... GLS-240|
|ep_28|10|GLS-095, GLS-108 ... GLS-276|
|ep_29|14|GLS-029, GLS-170 ... GLS-277|
|ep_30|12|GLS-001, GLS-003 ... GLS-308|
