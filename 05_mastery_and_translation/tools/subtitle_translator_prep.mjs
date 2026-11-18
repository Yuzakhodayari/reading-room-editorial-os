#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LRI = "\u2066";
const PDI = "\u2069";
const RLM = "\u200F";
const BIDI_INVISIBLE_RE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const RTL_CHAR_RE = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const SUPPORTED_LANGS = ["en", "fa", "ar", "es", "de"];
const RTL_LANGS = new Set(["fa", "ar"]);

const MAX_LINE_CHARS = 42;
const MAX_LINES_PER_CUE = 2;
const MIN_DURATION_MS = 1200;
const MAX_DURATION_MS = 6500;
const INTER_CUE_GAP_MS = 40;

const BUILTIN_FALLBACK_GLOSSARY = {
  schema_version: "1.0.0",
  source: "builtin_25_term_fallback",
  terms: [
    {
      term_id: "TRM-001",
      english_term: "Form 10-K",
      aliases: ["10-K", "SEC Form 10-K"],
      domain: "SEC Filings",
      plain_camera_english: "the annual audited report public US companies file with the SEC",
      persian_exact: "گزارش سالانه فرم 10-K",
      persian_definition: "گزارش سالانه حسابرسی‌شده‌ای که شرکت‌های سهامی عام آمریکا به کمیسیون بورس و اوراق بهادار ارائه می‌کنند.",
      false_friend_or_trap: "Do not translate as a generic tax form or quarterly update.",
      multilang_locks: {
        ar: "التقرير السنوي نموذج 10-K",
        es: "Formulario anual 10-K",
        de: "Jahresbericht Form 10-K"
      },
      mapped_episodes: ["ep_01", "ep_02", "ep_03"]
    },
    {
      term_id: "TRM-002",
      english_term: "Form 10-Q",
      aliases: ["10-Q", "SEC Form 10-Q"],
      domain: "SEC Filings",
      plain_camera_english: "the quarterly financial report filed with the SEC",
      persian_exact: "گزارش فصلی فرم 10-Q",
      persian_definition: "گزارش مالی سه‌ماهه شرکت‌های سهامی عام در سامانه EDGAR.",
      false_friend_or_trap: "Distinguish clearly from the audited annual Form 10-K.",
      multilang_locks: {
        ar: "التقرير الفصلي نموذج 10-Q",
        es: "Formulario trimestral 10-Q",
        de: "Quartalsbericht Form 10-Q"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-003",
      english_term: "Form 8-K",
      aliases: ["8-K", "SEC Form 8-K"],
      domain: "SEC Filings",
      plain_camera_english: "the unscheduled material-event disclosure filed with the SEC",
      persian_exact: "گزارش رویداد بااهمیت فرم 8-K",
      persian_definition: "گزارش فوری برای اعلام قراردادها یا رویدادهای مالی بااهمیت به سرمایه‌گذاران.",
      false_friend_or_trap: "Keep the 8-K code intact rather than paraphrasing as a press release.",
      multilang_locks: {
        ar: "إفصاح الأحداث الجوهرية نموذج 8-K",
        es: "Formulario de hecho relevante 8-K",
        de: "Ad-hoc-Meldung Form 8-K"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-004",
      english_term: "Note 1",
      aliases: ["Property and Equipment footnote"],
      domain: "GAAP Accounting",
      plain_camera_english: "the accounting-policy footnote explaining asset useful lives",
      persian_exact: "یادداشت توضیحی شماره 1",
      persian_definition: "نخستین یادداشت صورت‌های مالی که رویه حسابداری و عمر مفید دارایی‌ها را شرح می‌دهد.",
      false_friend_or_trap: "Never translate Note as a casual memo; it is an audited financial footnote.",
      multilang_locks: {
        ar: "الإيضاح المتمم رقم 1",
        es: "Nota 1 de los estados financieros",
        de: "Anhangangabe Note 1"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-005",
      english_term: "useful life",
      aliases: ["useful-life", "useful lives", "server life", "server lives"],
      domain: "GAAP Accounting",
      plain_camera_english: "the number of years a company spreads an asset's purchase cost across",
      persian_exact: "عمر مفید",
      persian_definition: "مدت زمانی که شرکت هزینه خرید یک دارایی را در صورت سود و زیان مستهلک می‌کند.",
      false_friend_or_trap: "Accounting useful life reflects economic earning span, distinct from physical survival.",
      multilang_locks: {
        ar: "العمر الإنتاجي المقدر",
        es: "vida útil",
        de: "Nutzungsdauer"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-006",
      english_term: "straight-line depreciation",
      aliases: ["straight-line rules", "depreciation"],
      domain: "GAAP Accounting",
      plain_camera_english: "dividing an asset's cost evenly across every year of its schedule",
      persian_exact: "استهلاک خط مستقیم",
      persian_definition: "روشی که بهای تمام‌شده دارایی را به‌طور مساوی بر سال‌های عمر مفید تقسیم می‌کند.",
      false_friend_or_trap: "Avoid rendering depreciation as market price drop or currency devaluation.",
      multilang_locks: {
        ar: "الإهلاك الثابت بالقسط المتساوي",
        es: "depreciación lineal",
        de: "lineare Abschreibung"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-007",
      english_term: "bonus depreciation",
      aliases: ["first-year bonus depreciation", "first-year write-offs"],
      domain: "US Tax Code",
      plain_camera_english: "accelerated tax deduction letting firms expense hardware in year one",
      persian_exact: "استهلاک تشویقی سال اول",
      persian_definition: "معافیت مالیاتی شتاب‌یافته که به شرکت‌ها اجازه می‌دهد کل هزینه تجهیزات را در سال خرید کسر کنند.",
      false_friend_or_trap: "Do not translate bonus as an employee cash reward.",
      multilang_locks: {
        ar: "الإهلاك الضريبي المعجل",
        es: "depreciación acelerada adicional",
        de: "Sonderabschreibung im ersten Jahr"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-008",
      english_term: "IRC Section 168(k)",
      aliases: ["IRC § 168(k)", "Section 168(k)", "168(k)"],
      domain: "US Tax Code",
      plain_camera_english: "the federal tax provision granting immediate 100 percent equipment write-offs",
      persian_exact: "بند 168(k) قانون مالیات داخلی آمریکا",
      persian_definition: "ماده قانونی حاکم بر استهلاک تشویقی صددرصدی تجهیزات و سرورها در سال نخست.",
      false_friend_or_trap: "Keep 168(k) wrapped in BiDi LTR isolates so parentheses never flip in RTL subtitles.",
      multilang_locks: {
        ar: "المادة 168(k) من قانون الإيرادات الداخلية",
        es: "Sección 168(k) del IRC",
        de: "IRC Section 168(k)"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-009",
      english_term: "GAAP",
      aliases: ["GAAP rules", "GAAP operating profit", "GAAP earnings per share"],
      domain: "GAAP Accounting",
      plain_camera_english: "standard US accounting rules used for shareholder profit reports",
      persian_exact: "اصول حسابداری پذیرفته‌شده همگانی (GAAP)",
      persian_definition: "مجموعه قواعد استاندارد حسابداری در آمریکا برای گزارشگری به سهام‌داران و بورس.",
      false_friend_or_trap: "Preserve the English acronym GAAP alongside the localized term.",
      multilang_locks: {
        ar: "مبادئ المحاسبة المقبولة عموماً (GAAP)",
        es: "principios contables GAAP",
        de: "US-GAAP-Rechnungslegung"
      },
      mapped_episodes: ["ep_02", "ep_03"]
    },
    {
      term_id: "TRM-010",
      english_term: "free cash flow",
      aliases: ["negative free cash flow"],
      domain: "Corporate Finance",
      plain_camera_english: "cash left over after paying operations and capital equipment bills",
      persian_exact: "جریان نقدی آزاد",
      persian_definition: "نقدینگی باقی‌مانده پس از کسر مخارج سرمایه‌ای از جریان نقدی عملیاتی.",
      false_friend_or_trap: "Free means uncommitted cash after CapEx, never complimentary money.",
      multilang_locks: {
        ar: "التدفق النقدي الحر",
        es: "flujo de caja libre",
        de: "freier Cashflow"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-011",
      english_term: "operating cash flow",
      aliases: ["operating cash"],
      domain: "Corporate Finance",
      plain_camera_english: "real cash collected from core day-to-day business operations",
      persian_exact: "جریان نقدی عملیاتی",
      persian_definition: "وجوه نقد واقعی ورودی از فعالیت‌های اصلی کسب‌وکار پیش از مخارج سرمایه‌ای.",
      false_friend_or_trap: "Do not confuse with GAAP operating income, which includes non-cash estimates.",
      multilang_locks: {
        ar: "التدفق النقدي التشغيلي",
        es: "flujo de caja operativo",
        de: "operativer Cashflow"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-012",
      english_term: "Statement of Cash Flows",
      aliases: ["cash-flow tables", "cash flow statement"],
      domain: "GAAP Accounting",
      plain_camera_english: "the financial statement tracking actual bank wires in and out",
      persian_exact: "صورت جریان‌های نقدی",
      persian_definition: "گزارش مالی رسمی که ورودی و خروجی واقعی پول نقد شرکت را ثبت می‌کند.",
      false_friend_or_trap: "Always use the formal Persian accounting title rather than a literal cash-stream gloss.",
      multilang_locks: {
        ar: "قائمة التدفقات النقدية",
        es: "Estado de flujos de efectivo",
        de: "Kapitalflussrechnung"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-013",
      english_term: "capital spending",
      aliases: ["CapEx", "cash CapEx", "cash capital spending"],
      domain: "Corporate Finance",
      plain_camera_english: "money spent buying long-lived servers, buildings, and power gear",
      persian_exact: "مخارج سرمایه‌ای",
      persian_definition: "وجوه نقدی که صرف خرید یا ارتقای دارایی‌های بلندمدت مانند سرورها و مراکز داده می‌شود.",
      false_friend_or_trap: "Distinguish from operating expenses (OpEx) hit immediately on the income statement.",
      multilang_locks: {
        ar: "النفقات الرأسمالية",
        es: "gasto de capital (CapEx)",
        de: "Investitionsausgaben (CapEx)"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-014",
      english_term: "Special Purpose Vehicle",
      aliases: ["Special Purpose Vehicles", "SPV", "SPVs", "off-balance-sheet SPV"],
      domain: "Structured Finance",
      plain_camera_english: "a separate legal entity built to hold specific assets and debt off the parent balance sheet",
      persian_exact: "نهاد با هدف خاص (SPV)",
      persian_definition: "شخصیت حقوقی مستقل که برای نگهداری دارایی و بدهی خارج از ترازنامه شرکت مادر تشکیل می‌شود.",
      false_friend_or_trap: "Never translate vehicle literally as a car or truck.",
      multilang_locks: {
        ar: "شركة ذات غرض خاص (SPV)",
        es: "vehículo de propósito especial (SPV)",
        de: "Zweckgesellschaft (SPV)"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-015",
      english_term: "ASC 842",
      aliases: ["equipment finance leases", "equipment lease principal", "finance leases"],
      domain: "GAAP Accounting",
      plain_camera_english: "the US lease-accounting standard governing financed server leases",
      persian_exact: "استاندارد اجاره ASC 842",
      persian_definition: "استاندارد حسابداری آمریکا برای ثبت اجاره‌های تأمینی و عملیاتی تجهیزات.",
      false_friend_or_trap: "Keep ASC 842 exact and avoid swapping in international IFRS 16.",
      multilang_locks: {
        ar: "معيار الإيجار ASC 842",
        es: "norma de arrendamientos ASC 842",
        de: "Leasingstandard ASC 842"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-016",
      english_term: "Remaining Performance Obligations",
      aliases: ["RPO", "RPOs", "ASC 606"],
      domain: "GAAP Accounting",
      plain_camera_english: "total value of signed multi-year customer contracts not yet billed",
      persian_exact: "تعهدات اجرایی باقی‌مانده (RPO)",
      persian_definition: "مجموع ارزش قراردادهای امضاشده آینده که هنوز صورتحساب و درآمد قطعی نشده‌اند.",
      false_friend_or_trap: "RPO is contracted future backlog, never cash already sitting in the bank.",
      multilang_locks: {
        ar: "التزامات الأداء المتبقية (RPO)",
        es: "obligaciones de desempeño pendientes (RPO)",
        de: "ausstehende Leistungsverpflichtungen (RPO)"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-017",
      english_term: "take-or-pay",
      aliases: ["take-or-pay contracts", "take-or-pay leases"],
      domain: "Credit Markets",
      plain_camera_english: "a contract requiring payment even if the buyer skips using the capacity",
      persian_exact: "قرارداد برداشت یا پرداخت",
      persian_definition: "قراردادی که خریدار را ملزم می‌کند حتی در صورت عدم استفاده از ظرفیت سرور، مبلغ اجاره را بپردازد.",
      false_friend_or_trap: "Keep the commercial structure explicit; avoid vague phrasing like strict contract.",
      multilang_locks: {
        ar: "عقد الأخذ أو الدفع",
        es: "contrato take-or-pay",
        de: "Take-or-Pay-Vertrag"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-018",
      english_term: "impairment charges",
      aliases: ["impairment charge", "write down racks"],
      domain: "GAAP Accounting",
      plain_camera_english: "sudden profit losses booked when equipment loses economic value early",
      persian_exact: "زیان کاهش ارزش دارایی",
      persian_definition: "هزینه ناگهانی ثبت‌شده در صورت سود و زیان هنگامی که ارزش اقتصادی تجهیز پیش از موعد افت می‌کند.",
      false_friend_or_trap: "Do not render impairment as physical damage or mechanical breakdown.",
      multilang_locks: {
        ar: "خسائر انخفاض القيمة",
        es: "cargos por deterioro",
        de: "Wertminderungsaufwendungen"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-019",
      english_term: "restatement",
      aliases: ["financial restatement"],
      domain: "SEC Enforcement",
      plain_camera_english: "officially revising and reissuing prior audited financial statements",
      persian_exact: "تجدید ارائه صورت‌های مالی",
      persian_definition: "اصلاح و انتشار رسمی دوباره گزارش‌های مالی پیشین به دلیل خطا یا تخلف حسابداری.",
      false_friend_or_trap: "Do not translate as a simple verbal repetition.",
      multilang_locks: {
        ar: "إعادة إصدار القوائم المالية",
        es: "reexpresión contable",
        de: "Korrektur früherer Abschlüsse"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-020",
      english_term: "salvage values",
      aliases: ["salvage value"],
      domain: "GAAP Accounting",
      plain_camera_english: "estimated resale scrap value left at the end of an asset's life",
      persian_exact: "ارزش اسقاط",
      persian_definition: "ارزش برآوردی باقیمانده یک دارایی در پایان دوره عمر مفید آن.",
      false_friend_or_trap: "Keep the accounting phrase ارزش اسقاط rather than rescue value.",
      multilang_locks: {
        ar: "القيمة التخريدية",
        es: "valor residual",
        de: "Restwert"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-021",
      english_term: "401(k)",
      aliases: ["target-date 401(k)", "retirement fund", "retirement account"],
      domain: "US Household Finance",
      plain_camera_english: "employer-sponsored US retirement savings account funded from paychecks",
      persian_exact: "حساب بازنشستگی 401(k)",
      persian_definition: "طرح پس‌انداز بازنشستگی کارمندی در آمریکا با کسر خودکار از حقوق.",
      false_friend_or_trap: "Always wrap 401(k) in BiDi LTR isolation in Arabic and Persian subtitles.",
      multilang_locks: {
        ar: "حساب التقاعد 401(k)",
        es: "plan de jubilación 401(k)",
        de: "Altersvorsorgekonto 401(k)"
      },
      mapped_episodes: ["ep_01", "ep_03"]
    },
    {
      term_id: "TRM-022",
      english_term: "S&P 500",
      aliases: ["cap-weighted S&P 500", "US stock index"],
      domain: "Equity Markets",
      plain_camera_english: "the benchmark index tracking 500 large US public companies by market size",
      persian_exact: "شاخص S&P 500",
      persian_definition: "شاخص معیار بازار سهام آمریکا شامل پانصد شرکت بزرگ بورس بر اساس ارزش بازار.",
      false_friend_or_trap: "Wrap S&P 500 in LRI/PDI so the ampersand and number stay in proper LTR order.",
      multilang_locks: {
        ar: "مؤشر S&P 500",
        es: "índice S&P 500",
        de: "S&P 500-Index"
      },
      mapped_episodes: ["ep_01", "ep_03"]
    },
    {
      term_id: "TRM-023",
      english_term: "Treasury bills",
      aliases: ["short-term Treasury bills", "short-duration Treasury bills"],
      domain: "Treasury Markets",
      plain_camera_english: "short-term US government debt maturing within one year",
      persian_exact: "اسناد خزانه کوتاه‌مدت آمریکا",
      persian_definition: "اوراق بدهی کوتاه‌مدت دولت فدرال آمریکا با سررسید یک سال یا کمتر.",
      false_friend_or_trap: "Distinguish T-bills (under 1 year) from long-term Treasury bonds.",
      multilang_locks: {
        ar: "أذون الخزانة الأمريكية",
        es: "letras del Tesoro",
        de: "US-Schatzwechsel (T-Bills)"
      },
      mapped_episodes: ["ep_01", "ep_03"]
    },
    {
      term_id: "TRM-024",
      english_term: "Form 4562",
      aliases: ["IRS Form 4562"],
      domain: "US Tax Code",
      plain_camera_english: "the IRS tax attachment where companies claim depreciation deductions",
      persian_exact: "فرم مالیاتی 4562",
      persian_definition: "فرم رسمی اداره مالیات آمریکا برای ثبت و کسر هزینه استهلاک تجهیزات و دارایی‌ها.",
      false_friend_or_trap: "Keep 4562 in Western digits inside BiDi isolates.",
      multilang_locks: {
        ar: "النموذج الضريبي 4562",
        es: "Formulario fiscal 4562",
        de: "Steuerformular Form 4562"
      },
      mapped_episodes: ["ep_03"]
    },
    {
      term_id: "TRM-025",
      english_term: "Internal Revenue Code",
      aliases: ["IRS tax filings", "tax shield"],
      domain: "US Tax Code",
      plain_camera_english: "the statutory federal tax law administered by the IRS",
      persian_exact: "قانون مالیات داخلی آمریکا (IRC)",
      persian_definition: "مجموعه قوانین مالیاتی فدرال آمریکا که مبنای محاسبه مالیات شرکت‌ها در اداره IRS است.",
      false_friend_or_trap: "Do not equate IRS tax rules with SEC GAAP reporting rules.",
      multilang_locks: {
        ar: "قانون الإيرادات الداخلية الأمريكي",
        es: "Código de Rentas Internas (IRC)",
        de: "US-Steuergesetzbuch (IRC)"
      },
      mapped_episodes: ["ep_03"]
    }
  ]
};

function printHelp() {
  const helpText = `subtitle_translator_prep.mjs - Multi-Language Broadcast Subtitle & Glossary Prep CLI

Usage:
  node subtitle_translator_prep.mjs --script <md_path> [options]
  node subtitle_translator_prep.mjs --srt <srt_or_vtt_path> [options]
  node subtitle_translator_prep.mjs --self-test [--json]

Options:
  --script <path>       Markdown script file (strips YAML frontmatter and [ON SCREEN]/[STAGE] cues)
  --srt <path>          Existing .srt or .vtt file to parse, validate, glossary-scan, and BiDi-isolate
  --glossary <path>     Path to glossary_en_fa.json (auto-discovers or uses 25-term fallback if omitted)
  --langs <list>        Comma-separated language codes (default: en,fa,ar,es,de)
  --wpm <number>        Target speaking pace in words per minute (default: 150)
  --source-lang <code>  Override source language detection (en, fa, ar, es, de)
  --out-dir <dir>       Write .srt, .vtt, per-language prep files, and translation_packet.json
  --json                Print full JSON report to stdout
  --self-test           Run built-in test suite covering stripping, cues, glossary, BiDi, and exports
  --help, -h            Show this help message
`;
  process.stdout.write(helpText);
}

function parseArgs(argv) {
  const opts = {
    script: null,
    srt: null,
    glossary: null,
    langs: ["en", "fa", "ar", "es", "de"],
    wpm: 150,
    sourceLang: null,
    outDir: null,
    selfTest: false,
    json: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--self-test") {
      opts.selfTest = true;
    } else if (arg === "--json") {
      opts.json = true;
    } else if (arg === "--script") {
      opts.script = argv[++i] ?? null;
      if (!opts.script) throw new Error("Missing path after --script");
    } else if (arg === "--srt") {
      opts.srt = argv[++i] ?? null;
      if (!opts.srt) throw new Error("Missing path after --srt");
    } else if (arg === "--glossary") {
      opts.glossary = argv[++i] ?? null;
      if (!opts.glossary) throw new Error("Missing path after --glossary");
    } else if (arg === "--langs") {
      const raw = argv[++i] ?? "";
      if (!raw) throw new Error("Missing language list after --langs");
      const parsed = raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      for (const code of parsed) {
        if (!SUPPORTED_LANGS.includes(code)) {
          throw new Error(`Unsupported language code "${code}". Supported: ${SUPPORTED_LANGS.join(", ")}`);
        }
      }
      opts.langs = [...new Set(parsed)];
    } else if (arg === "--wpm") {
      const raw = Number(argv[++i]);
      if (!Number.isFinite(raw) || raw <= 0) {
        throw new Error(`Invalid --wpm value. Expected positive number.`);
      }
      opts.wpm = raw;
    } else if (arg === "--source-lang") {
      const raw = (argv[++i] ?? "").trim().toLowerCase();
      if (!SUPPORTED_LANGS.includes(raw)) {
        throw new Error(`Unsupported --source-lang "${raw}". Supported: ${SUPPORTED_LANGS.join(", ")}`);
      }
      opts.sourceLang = raw;
    } else if (arg === "--out-dir") {
      opts.outDir = argv[++i] ?? null;
      if (!opts.outDir) throw new Error("Missing directory path after --out-dir");
    } else {
      throw new Error(`Unknown CLI argument: ${arg}`);
    }
  }

  return opts;
}

function visibleLength(text) {
  return text.replace(BIDI_INVISIBLE_RE, "").length;
}

function countWords(text) {
  const cleaned = text.replace(BIDI_INVISIBLE_RE, "").trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

function loadGlossary(explicitPath, { forceBuiltin = false } = {}) {
  if (forceBuiltin) {
    return {
      glossarySource: "builtin_25_term_fallback",
      terms: BUILTIN_FALLBACK_GLOSSARY.terms
    };
  }

  if (explicitPath) {
    const resolved = path.resolve(explicitPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Glossary file not found: ${resolved}`);
    }
    const parsed = JSON.parse(fs.readFileSync(resolved, "utf8"));
    const terms = Array.isArray(parsed) ? parsed : parsed.terms;
    if (!Array.isArray(terms)) {
      throw new Error(`Invalid glossary schema in ${resolved}: expected "terms" array`);
    }
    return {
      glossarySource: resolved,
      terms
    };
  }

  const candidatePaths = [
    path.resolve(__dirname, "..", "glossary_en_fa.json"),
    path.resolve(process.cwd(), "05_mastery_and_translation", "glossary_en_fa.json"),
    path.resolve(process.cwd(), "glossary_en_fa.json")
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(candidate, "utf8"));
        const terms = Array.isArray(parsed) ? parsed : parsed.terms;
        if (Array.isArray(terms) && terms.length > 0) {
          return {
            glossarySource: candidate,
            terms
          };
        }
      } catch {
        // Fall through to next candidate or built-in fallback if file is incomplete.
      }
    }
  }

  return {
    glossarySource: "builtin_25_term_fallback",
    terms: BUILTIN_FALLBACK_GLOSSARY.terms
  };
}

function stripYamlAndStageCues(markdownText) {
  const frontmatter = {};
  let body = markdownText.replace(/^\uFEFF/, "");

  const fmMatch = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fmMatch) {
    const fmLines = fmMatch[1].split(/\r?\n/);
    for (const line of fmLines) {
      const kv = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (kv) {
        frontmatter[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, "");
      }
    }
    body = body.slice(fmMatch[0].length);
  }

  let strippedStageCues = 0;
  const stageTagRegex =
    /\[(?:ON SCREEN|ON-SCREEN|STAGE|VISUAL|AUDIO|SFX|MUSIC|CHYRON|CARD|CUTAWAY|B-ROLL|GRAPHICS)\s*:[^\]]*\]/gi;
  body = body.replace(stageTagRegex, () => {
    strippedStageCues++;
    return "";
  });

  const rawLines = body.split(/\r?\n/);
  const paragraphs = [];
  let buffer = [];

  const flushBuffer = () => {
    if (buffer.length === 0) return;
    let joined = buffer.join(" ").replace(/\s+/g, " ").trim();
    joined = joined
      .replace(/^#{1,6}\s+/, "")
      .replace(/^>\s*/, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
    if (joined && !/^[-*_]{3,}$/.test(joined)) {
      paragraphs.push(joined);
    }
    buffer = [];
  };

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBuffer();
      continue;
    }
    if (/^#{1,6}\s+/.test(trimmed)) {
      flushBuffer();
      continue;
    }
    buffer.push(trimmed);
  }
  flushBuffer();

  return {
    frontmatter,
    strippedStageCues,
    paragraphs
  };
}

function splitParagraphIntoSentences(paragraph) {
  const protectedText = paragraph
    .replace(/\b(No|v|Mr|Ms|Mrs|Dr|Prof|Inc|Corp|Ltd|Co|U\.S|et al)\./g, "$1\u0000")
    .replace(/(\d)\.(\d)/g, "$1\u0001$2");

  const rawSentences = protectedText
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"'\u201C\u2018(])/)
    .map((s) =>
      s
        .replace(/\u0000/g, ".")
        .replace(/\u0001/g, ".")
        .trim()
    )
    .filter(Boolean);

  return rawSentences.length > 0 ? rawSentences : [paragraph];
}

function tryWrapTwoLines(text, maxLineChars = MAX_LINE_CHARS) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [""];
  if (visibleLength(clean) <= maxLineChars) {
    return [clean];
  }

  const words = clean.split(" ");
  if (words.length === 1) {
    if (visibleLength(clean) <= maxLineChars) return [clean];
    const parts = [];
    for (let i = 0; i < clean.length; i += maxLineChars) {
      parts.push(clean.slice(i, i + maxLineChars));
    }
    return parts.slice(0, MAX_LINES_PER_CUE);
  }

  let bestSplit = null;
  let bestScore = Infinity;
  const totalLen = visibleLength(clean);

  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(" ");
    const line2 = words.slice(i).join(" ");
    const l1 = visibleLength(line1);
    const l2 = visibleLength(line2);
    if (l1 <= maxLineChars && l2 <= maxLineChars) {
      let balancePenalty = Math.abs(l1 - l2);
      if (/[,;:]$/.test(words[i - 1])) {
        balancePenalty -= 6;
      }
      if (l1 < totalLen * 0.25 || l2 < totalLen * 0.2) {
        balancePenalty += 12;
      }
      if (balancePenalty < bestScore) {
        bestScore = balancePenalty;
        bestSplit = [line1, line2];
      }
    }
  }

  return bestSplit;
}

function forceWrapText(text, maxLineChars = MAX_LINE_CHARS) {
  const wrapped = tryWrapTwoLines(text, maxLineChars);
  if (wrapped) return wrapped;
  const words = text.split(/\s+/);
  const line1 = [];
  const line2 = [];
  for (const w of words) {
    const cand1 = [...line1, w].join(" ");
    if (line2.length === 0 && visibleLength(cand1) <= maxLineChars) {
      line1.push(w);
    } else {
      line2.push(w);
    }
  }
  const l1 = line1.join(" ") || text.slice(0, maxLineChars);
  const l2 = line2.join(" ").slice(0, maxLineChars);
  return l2 ? [l1, l2] : [l1];
}

function splitSentenceIntoCueChunks(sentence, maxLineChars, maxWordsPerCue) {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length <= maxWordsPerCue && tryWrapTwoLines(sentence, maxLineChars)) {
    return [sentence];
  }

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    let bestEnd = start;
    const hardLimit = Math.min(words.length, start + maxWordsPerCue);

    for (let end = start + 1; end <= hardLimit; end++) {
      const candidate = words.slice(start, end).join(" ");
      if (tryWrapTwoLines(candidate, maxLineChars)) {
        bestEnd = end;
      } else {
        break;
      }
    }

    if (bestEnd === start) {
      const single = words[start];
      chunks.push(single.slice(0, maxLineChars));
      if (single.length > maxLineChars) {
        words[start] = single.slice(maxLineChars);
      } else {
        start++;
      }
      continue;
    }

    if (bestEnd < words.length) {
      const minAcceptable = start + Math.max(2, Math.floor((bestEnd - start) * 0.55));
      let preferredEnd = bestEnd;
      for (let k = bestEnd; k >= minAcceptable; k--) {
        const w = words[k - 1];
        const nextW = words[k] ?? "";
        if (/[,;:]$/.test(w)) {
          preferredEnd = k;
          break;
        }
        if (/^(and|or|but|while|when|where|because|until|unless|that|which|with|for|under|across|inside|without)$/i.test(nextW)) {
          preferredEnd = k;
          break;
        }
      }
      bestEnd = preferredEnd;
    }

    chunks.push(words.slice(start, bestEnd).join(" "));
    start = bestEnd;
  }

  return chunks;
}

function computeCueDurationMs(text, wpm) {
  const words = Math.max(1, countWords(text));
  const rawMs = Math.round((words / wpm) * 60 * 1000);
  return Math.max(MIN_DURATION_MS, Math.min(MAX_DURATION_MS, rawMs));
}

function compileCuesFromParagraphs(paragraphs, wpm = 150) {
  const maxWordsPerCue = Math.max(2, Math.floor((MAX_DURATION_MS / 1000) * (wpm / 60)));
  const minNaturalWords = Math.ceil((MIN_DURATION_MS / 1000) * (wpm / 60));

  const rawCueTexts = [];

  for (const para of paragraphs) {
    const sentences = splitParagraphIntoSentences(para);
    const paraChunks = [];
    for (const sentence of sentences) {
      const parts = splitSentenceIntoCueChunks(sentence, MAX_LINE_CHARS, maxWordsPerCue);
      paraChunks.push(...parts);
    }

    let i = 0;
    while (i < paraChunks.length) {
      let current = paraChunks[i];
      while (
        i + 1 < paraChunks.length &&
        (countWords(current) < minNaturalWords || countWords(paraChunks[i + 1]) < minNaturalWords)
      ) {
        const merged = `${current} ${paraChunks[i + 1]}`;
        if (countWords(merged) <= maxWordsPerCue && tryWrapTwoLines(merged, MAX_LINE_CHARS)) {
          current = merged;
          i++;
        } else {
          break;
        }
      }
      rawCueTexts.push(current);
      i++;
    }
  }

  const cues = [];
  let cursorMs = 0;

  for (let idx = 0; idx < rawCueTexts.length; idx++) {
    const text = rawCueTexts[idx];
    const lines = forceWrapText(text, MAX_LINE_CHARS);
    const durationMs = computeCueDurationMs(text, wpm);
    const startMs = cursorMs;
    const endMs = startMs + durationMs;
    cursorMs = endMs + INTER_CUE_GAP_MS;

    cues.push({
      index: idx + 1,
      start_ms: startMs,
      end_ms: endMs,
      duration_ms: durationMs,
      start_srt: formatTimestampSrt(startMs),
      end_srt: formatTimestampSrt(endMs),
      start_vtt: formatTimestampVtt(startMs),
      end_vtt: formatTimestampVtt(endMs),
      word_count: countWords(text),
      lines,
      text: lines.join("\n")
    });
  }

  return cues;
}

function parseTimestampMs(raw) {
  const trimmed = raw.trim().replace(",", ".");
  const parts = trimmed.split(":");
  if (parts.length === 3) {
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const s = Number(parts[2]);
    return Math.round((h * 3600 + m * 60 + s) * 1000);
  }
  if (parts.length === 2) {
    const m = Number(parts[0]);
    const s = Number(parts[1]);
    return Math.round((m * 60 + s) * 1000);
  }
  throw new Error(`Invalid subtitle timestamp: ${raw}`);
}

function formatTimestampSrt(ms) {
  const safe = Math.max(0, Math.round(ms));
  const hours = Math.floor(safe / 3600000);
  const mins = Math.floor((safe % 3600000) / 60000);
  const secs = Math.floor((safe % 60000) / 1000);
  const millis = safe % 1000;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function formatTimestampVtt(ms) {
  return formatTimestampSrt(ms).replace(",", ".");
}

function parseSrtOrVtt(rawContent, wpm = 150) {
  const normalized = rawContent.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const isVtt = /^WEBVTT\b/i.test(normalized.trimStart());
  const blocks = normalized.split(/\n{2,}/);
  const cues = [];
  const inputViolations = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l, idx) => !(idx === 0 && l === ""));
    if (lines.length === 0) continue;
    const head = lines[0].trim();
    if (/^(WEBVTT|NOTE|STYLE|REGION)\b/i.test(head)) continue;

    let timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1) continue;

    const timeLine = lines[timeLineIdx];
    const timeMatch = timeLine.match(
      /^(\d{1,2}:?\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,2}:?\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})/
    );
    if (!timeMatch) continue;

    const startMs = parseTimestampMs(timeMatch[1]);
    const endMs = parseTimestampMs(timeMatch[2]);
    const rawTextLines = lines
      .slice(timeLineIdx + 1)
      .map((l) => l.replace(/<\/?[a-zA-Z][^>]*>/g, "").trim())
      .filter(Boolean);

    if (rawTextLines.length === 0) continue;

    const cueNumber = cues.length + 1;
    const rawDuration = endMs - startMs;

    if (rawTextLines.length > MAX_LINES_PER_CUE) {
      inputViolations.push({ cue: cueNumber, type: "line_count", value: rawTextLines.length });
    }
    for (const l of rawTextLines) {
      if (visibleLength(l) > MAX_LINE_CHARS) {
        inputViolations.push({ cue: cueNumber, type: "line_length", value: visibleLength(l) });
      }
    }
    if (rawDuration < MIN_DURATION_MS || rawDuration > MAX_DURATION_MS) {
      inputViolations.push({ cue: cueNumber, type: "duration_ms", value: rawDuration });
    }

    const combinedText = rawTextLines.join(" ").replace(/\s+/g, " ").trim();
    const maxWordsPerCue = Math.max(2, Math.floor((MAX_DURATION_MS / 1000) * (wpm / 60)));

    if (
      rawTextLines.length <= MAX_LINES_PER_CUE &&
      rawTextLines.every((l) => visibleLength(l) <= MAX_LINE_CHARS) &&
      rawDuration >= MIN_DURATION_MS &&
      rawDuration <= MAX_DURATION_MS
    ) {
      cues.push({
        index: cueNumber,
        start_ms: startMs,
        end_ms: endMs,
        duration_ms: rawDuration,
        start_srt: formatTimestampSrt(startMs),
        end_srt: formatTimestampSrt(endMs),
        start_vtt: formatTimestampVtt(startMs),
        end_vtt: formatTimestampVtt(endMs),
        word_count: countWords(combinedText),
        lines: rawTextLines,
        text: rawTextLines.join("\n")
      });
    } else if (tryWrapTwoLines(combinedText, MAX_LINE_CHARS) && rawDuration >= MIN_DURATION_MS && rawDuration <= MAX_DURATION_MS) {
      const rewrapped = forceWrapText(combinedText, MAX_LINE_CHARS);
      cues.push({
        index: cueNumber,
        start_ms: startMs,
        end_ms: endMs,
        duration_ms: rawDuration,
        start_srt: formatTimestampSrt(startMs),
        end_srt: formatTimestampSrt(endMs),
        start_vtt: formatTimestampVtt(startMs),
        end_vtt: formatTimestampVtt(endMs),
        word_count: countWords(combinedText),
        lines: rewrapped,
        text: rewrapped.join("\n")
      });
    } else {
      const subChunks = splitSentenceIntoCueChunks(combinedText, MAX_LINE_CHARS, maxWordsPerCue);
      const totalWords = Math.max(1, countWords(combinedText));
      let subCursor = startMs;
      for (let sIdx = 0; sIdx < subChunks.length; sIdx++) {
        const chunk = subChunks[sIdx];
        const ratio = countWords(chunk) / totalWords;
        const proportionalMs = Math.round(rawDuration * ratio);
        const dur = Math.max(MIN_DURATION_MS, Math.min(MAX_DURATION_MS, proportionalMs || computeCueDurationMs(chunk, wpm)));
        const cStart = subCursor;
        const cEnd = cStart + dur;
        subCursor = cEnd + INTER_CUE_GAP_MS;
        const wrapped = forceWrapText(chunk, MAX_LINE_CHARS);
        cues.push({
          index: cues.length + 1,
          start_ms: cStart,
          end_ms: cEnd,
          duration_ms: dur,
          start_srt: formatTimestampSrt(cStart),
          end_srt: formatTimestampSrt(cEnd),
          start_vtt: formatTimestampVtt(cStart),
          end_vtt: formatTimestampVtt(cEnd),
          word_count: countWords(chunk),
          lines: wrapped,
          text: wrapped.join("\n")
        });
      }
    }
  }

  return {
    inputFormat: isVtt ? "vtt" : "srt",
    cues,
    inputViolations
  };
}

/**
 * Wraps LTR numeric tokens, currencies, percentages, statutory citations,
 * and Latin brand/code phrases in Unicode LRI (\u2066) ... PDI (\u2069)
 * so RTL subtitle rendering never reverses $40.5T, 86.4%, or IRC § 168(k).
 */
function isolateLtrTokensForRtl(text) {
  if (!text) return text;

  const segmentRegex = new RegExp(`(${LRI}[^${PDI}]*${PDI})`, "g");
  const segments = text.split(segmentRegex);

  const ltrAtom =
    "(?:[+\\-−]?[$€£¥](?:\\s?\\d[\\d.,\\-−A-Za-z()]*(?:\\s?(?:billion|million|trillion|thousand)|[KMBTkmbt%])?)?|§|[+\\-−]?\\d[\\d.,\\-−/]*(?:[A-Za-z][A-Za-z0-9\\-−/]*)*(?:%|x|s|ms|kW|MW|GW)?(?:\\([A-Za-z0-9]+\\))?|[A-Za-z][A-Za-z0-9&./\\-−']*(?:\\([A-Za-z0-9]+\\))?)";
  const ltrSequenceRegex = new RegExp(
    `(?<![\\u0600-\\u06FF\\u0590-\\u05FFA-Za-z0-9${LRI}])(${ltrAtom}(?:\\s+${ltrAtom})*)(?![A-Za-z0-9${PDI}])`,
    "g"
  );

  const transformed = segments.map((seg) => {
    if (seg.startsWith(LRI) && seg.endsWith(PDI)) {
      return seg;
    }
    return seg.replace(ltrSequenceRegex, (match) => {
      let core = match;
      let suffix = "";
      while (/[.,:;!?]$/.test(core) && !/\b(?:al|No|v|Mr|Ms|Dr|U\.S)\.$/i.test(core)) {
        suffix = core.slice(-1) + suffix;
        core = core.slice(0, -1);
      }
      if (!core || !/[A-Za-z0-9$€£¥§]/.test(core)) {
        return match;
      }
      if (core === "§") {
        return match;
      }
      return `${LRI}${core}${PDI}${suffix}`;
    });
  });

  return transformed.join("");
}

function extractBidiTokensFromSource(text) {
  if (!text) return [];
  if (RTL_CHAR_RE.test(text)) {
    const isolated = isolateLtrTokensForRtl(text);
    const matches = [];
    const re = new RegExp(`${LRI}([^${PDI}]+)${PDI}`, "g");
    let m;
    while ((m = re.exec(isolated)) !== null) {
      const token = m[1];
      matches.push({
        raw: token,
        isolated: `${LRI}${token}${PDI}`
      });
    }
    return matches;
  }

  const tokenRegex =
    /(?:IRC\s+(?:§|Section)\s*\d+\([A-Za-z0-9]+\)|Public Law\s+\d+-\d+|SEC Release No\.\s*\d+|(?:SEC\s+)?Form\s+\d+(?:-[A-Za-z0-9]+)?|(?:ASC|Item|Section|Note)\s+\d+(?:\.\d+)?[A-Za-z]?|401\(k\)|S&P\s+500|W-2|H\d{2,3}|Q[1-4]\s+\d{4}|[+\-−]?[$€£¥]\d[\d.,]*(?:\s?(?:billion|million|trillion|thousand)|[KMBTkmbt]\b)?|\d[\d.,]*(?:%|x|kW|MW|GW|\s?percent)|\b[A-Z]{2,}(?:s)?\b|\b\d[\d.,\-−]*\b)/g;

  const seen = new Set();
  const matches = [];
  let m;
  while ((m = tokenRegex.exec(text)) !== null) {
    const raw = m[0].trim();
    if (!raw || seen.has(raw)) continue;
    seen.add(raw);
    matches.push({
      raw,
      isolated: `${LRI}${raw}${PDI}`
    });
  }
  return matches;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileGlossaryMatchers(terms) {
  const candidates = [];
  for (const term of terms) {
    const patterns = [term.english_term, ...(Array.isArray(term.aliases) ? term.aliases : [])]
      .map((p) => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean);
    for (const pat of patterns) {
      candidates.push({ term, pattern: pat });
    }
  }
  candidates.sort((a, b) => b.pattern.length - a.pattern.length);

  return candidates.map((c) => {
    const escaped = escapeRegExp(c.pattern).replace(/\s+/g, "\\s+");
    const regex = new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "gi");
    return {
      term: c.term,
      pattern: c.pattern,
      regex
    };
  });
}

function scanCueGlossary(cueText, matchers, targetLangs) {
  const flatText = cueText.replace(/\n/g, " ");
  const occupied = [];
  const foundByTermId = new Map();

  for (const matcher of matchers) {
    matcher.regex.lastIndex = 0;
    let m;
    while ((m = matcher.regex.exec(flatText)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      const overlaps = occupied.some((r) => !(end <= r.start || start >= r.end));
      if (overlaps) continue;
      occupied.push({ start, end });

      if (!foundByTermId.has(matcher.term.term_id)) {
        const t = matcher.term;
        const locks = {};
        for (const lang of targetLangs) {
          if (lang === "en") {
            locks.en = t.english_term;
          } else if (lang === "fa") {
            const faVal = t.persian_exact || t.english_term;
            locks.fa = faVal;
            locks.fa_bidi = isolateLtrTokensForRtl(faVal);
          } else if (t.multilang_locks && t.multilang_locks[lang]) {
            const val = t.multilang_locks[lang];
            locks[lang] = val;
            if (RTL_LANGS.has(lang)) {
              locks[`${lang}_bidi`] = isolateLtrTokensForRtl(val);
            }
          } else {
            locks[lang] = t.english_term;
          }
        }

        foundByTermId.set(t.term_id, {
          term_id: t.term_id,
          english_term: t.english_term,
          matched_text: m[0],
          match_offset: start,
          domain: t.domain || "Finance",
          plain_camera_english: t.plain_camera_english || "",
          false_friend_or_trap: t.false_friend_or_trap || "",
          locks
        });
      }
    }
  }

  return Array.from(foundByTermId.values()).sort((a, b) => a.match_offset - b.match_offset);
}

function validateCues(cues) {
  let lineLengthViolations = 0;
  let lineCountViolations = 0;
  let durationViolations = 0;
  let maxLineVisibleChars = 0;
  let minDurationMs = cues.length ? Infinity : 0;
  let maxDurationMs = 0;

  for (const cue of cues) {
    if (cue.lines.length > MAX_LINES_PER_CUE) {
      lineCountViolations++;
    }
    for (const line of cue.lines) {
      const vLen = visibleLength(line);
      if (vLen > maxLineVisibleChars) maxLineVisibleChars = vLen;
      if (vLen > MAX_LINE_CHARS) {
        lineLengthViolations++;
      }
    }
    if (cue.duration_ms < minDurationMs) minDurationMs = cue.duration_ms;
    if (cue.duration_ms > maxDurationMs) maxDurationMs = cue.duration_ms;
    if (cue.duration_ms < MIN_DURATION_MS || cue.duration_ms > MAX_DURATION_MS) {
      durationViolations++;
    }
  }

  return {
    total_cues: cues.length,
    line_length_violations: lineLengthViolations,
    line_count_violations: lineCountViolations,
    duration_violations: durationViolations,
    max_line_visible_chars: maxLineVisibleChars,
    min_duration_ms: minDurationMs,
    max_duration_ms: maxDurationMs,
    broadcast_compliant:
      lineLengthViolations === 0 && lineCountViolations === 0 && durationViolations === 0
  };
}

function formatSrt(cues, lineTransform = (l) => l) {
  return cues
    .map((cue) => {
      const renderedLines = cue.lines.map(lineTransform).join("\n");
      return `${cue.index}\n${cue.start_srt} --> ${cue.end_srt}\n${renderedLines}`;
    })
    .join("\n\n")
    .concat("\n");
}

function formatVtt(cues, { headerNote = null, lineTransform = (l) => l } = {}) {
  const parts = ["WEBVTT"];
  if (headerNote) {
    parts.push(`NOTE ${headerNote}`);
  }
  for (const cue of cues) {
    const renderedLines = cue.lines.map(lineTransform).join("\n");
    parts.push(`${cue.index}\n${cue.start_vtt} --> ${cue.end_vtt}\n${renderedLines}`);
  }
  return parts.join("\n\n").concat("\n");
}

function formatPrepSrt(cues, lang) {
  const isRtl = RTL_LANGS.has(lang);
  return cues
    .map((cue) => {
      const lockParts = cue.glossary_locks.map((g) => {
        const val = isRtl ? g.locks[`${lang}_bidi`] || g.locks[lang] : g.locks[lang];
        return `${g.english_term} => ${val}`;
      });
      const baseText = cue.lines.join("\n");
      const prepLine =
        isRtl && cue.source_is_rtl
          ? cue.lines.map((l) => isolateLtrTokensForRtl(l)).join("\n")
          : lockParts.length > 0
            ? `${baseText}\n[${lang.toUpperCase()} LOCKS: ${lockParts.join(" | ")}]`
            : baseText;
      return `${cue.index}\n${cue.start_srt} --> ${cue.end_srt}\n${prepLine}`;
    })
    .join("\n\n")
    .concat("\n");
}

function formatPrepVtt(cues, lang, glossarySource) {
  const isRtl = RTL_LANGS.has(lang);
  const parts = [`WEBVTT\nNOTE Target=${lang.toUpperCase()} | Glossary=${path.basename(glossarySource)}`];

  for (const cue of cues) {
    if (cue.glossary_locks.length > 0 || (isRtl && cue.bidi_isolated_tokens.length > 0)) {
      const notes = [];
      for (const g of cue.glossary_locks) {
        const val = isRtl ? g.locks[`${lang}_bidi`] || g.locks[lang] : g.locks[lang];
        notes.push(`LOCK ${g.term_id}: ${g.english_term} => ${val}`);
      }
      if (isRtl && cue.bidi_isolated_tokens.length > 0) {
        notes.push(
          `BIDI: ${cue.bidi_isolated_tokens.map((t) => `${t.raw} => ${t.isolated}`).join(", ")}`
        );
      }
      parts.push(`NOTE ${notes.join(" ; ")}`);
    }

    const body =
      isRtl && cue.source_is_rtl
        ? cue.lines.map((l) => isolateLtrTokensForRtl(l)).join("\n")
        : cue.lines.join("\n");
    parts.push(`${cue.index}\n${cue.start_vtt} --> ${cue.end_vtt}\n${body}`);
  }

  return parts.join("\n\n").concat("\n");
}

function detectSourceLang(cues, overrideLang) {
  if (overrideLang) return overrideLang;
  const sample = cues.slice(0, 15).map((c) => c.text).join(" ");
  if (RTL_CHAR_RE.test(sample)) {
    return /[\u06AF\u0686\u067E\u0698\u06CC\u06A9]/.test(sample) ? "fa" : "ar";
  }
  return "en";
}

function runPipeline(opts, { forceBuiltinGlossary = false } = {}) {
  const { glossarySource, terms } = loadGlossary(opts.glossary, {
    forceBuiltin: forceBuiltinGlossary
  });
  const matchers = compileGlossaryMatchers(terms);

  let mode;
  let inputPath;
  let frontmatter = {};
  let strippedStageCues = 0;
  let paragraphsCount = 0;
  let spokenWords = 0;
  let cues = [];
  let inputViolations = [];

  if (opts.script) {
    mode = "script";
    inputPath = path.resolve(opts.script);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Script file not found: ${inputPath}`);
    }
    const rawMd = fs.readFileSync(inputPath, "utf8");
    const extracted = stripYamlAndStageCues(rawMd);
    frontmatter = extracted.frontmatter;
    strippedStageCues = extracted.strippedStageCues;
    paragraphsCount = extracted.paragraphs.length;
    spokenWords = extracted.paragraphs.reduce((acc, p) => acc + countWords(p), 0);
    cues = compileCuesFromParagraphs(extracted.paragraphs, opts.wpm);
  } else if (opts.srt) {
    mode = "subtitle";
    inputPath = path.resolve(opts.srt);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Subtitle file not found: ${inputPath}`);
    }
    const rawSub = fs.readFileSync(inputPath, "utf8");
    const parsed = parseSrtOrVtt(rawSub, opts.wpm);
    cues = parsed.cues;
    inputViolations = parsed.inputViolations;
    spokenWords = cues.reduce((acc, c) => acc + c.word_count, 0);
  } else {
    throw new Error("Either --script <md_path> or --srt <srt_or_vtt_path> is required.");
  }

  const sourceLang = detectSourceLang(cues, opts.sourceLang);
  const sourceIsRtl = RTL_LANGS.has(sourceLang);

  const termFrequency = new Map();
  const enrichedCues = cues.map((cue) => {
    const rawText = cue.lines.join(" ");
    const bidiLines = sourceIsRtl ? cue.lines.map((l) => isolateLtrTokensForRtl(l)) : cue.lines;
    const bidiTokens = extractBidiTokensFromSource(rawText);
    const locks = scanCueGlossary(rawText, matchers, opts.langs);

    for (const lock of locks) {
      if (!termFrequency.has(lock.term_id)) {
        termFrequency.set(lock.term_id, {
          term_id: lock.term_id,
          english_term: lock.english_term,
          occurrences: 0,
          cue_indices: [],
          locks: lock.locks,
          false_friend_or_trap: lock.false_friend_or_trap
        });
      }
      const entry = termFrequency.get(lock.term_id);
      entry.occurrences++;
      entry.cue_indices.push(cue.index);
    }

    return {
      ...cue,
      lines: bidiLines,
      text: bidiLines.join("\n"),
      source_is_rtl: sourceIsRtl,
      bidi_isolated_tokens: bidiTokens,
      glossary_locks: locks
    };
  });

  const validation = validateCues(enrichedCues);
  const matchedTermsSummary = Array.from(termFrequency.values()).sort((a, b) =>
    a.term_id.localeCompare(b.term_id)
  );

  const packet = {
    tool: "subtitle_translator_prep",
    mode,
    input_file: inputPath,
    source_lang: sourceLang,
    target_langs: opts.langs,
    wpm: opts.wpm,
    glossary_source: glossarySource,
    glossary_term_count: terms.length,
    frontmatter,
    extraction_stats: {
      stripped_stage_cues: strippedStageCues,
      paragraphs: paragraphsCount,
      spoken_words: spokenWords,
      estimated_runtime_seconds: enrichedCues.length
        ? Number((enrichedCues[enrichedCues.length - 1].end_ms / 1000).toFixed(2))
        : 0
    },
    validation,
    input_violations: inputViolations,
    matched_terms_count: matchedTermsSummary.length,
    matched_terms_summary: matchedTermsSummary,
    cues: enrichedCues
  };

  const writtenFiles = [];
  if (opts.outDir) {
    const outDirAbs = path.resolve(opts.outDir);
    fs.mkdirSync(outDirAbs, { recursive: true });
    const baseName = path.basename(inputPath, path.extname(inputPath));

    const masterSrtPath = path.join(outDirAbs, `${baseName}.${sourceLang}.srt`);
    const masterVttPath = path.join(outDirAbs, `${baseName}.${sourceLang}.vtt`);
    fs.writeFileSync(masterSrtPath, formatSrt(enrichedCues), "utf8");
    fs.writeFileSync(
      masterVttPath,
      formatVtt(enrichedCues, {
        headerNote: `Source=${sourceLang.toUpperCase()} | WPM=${opts.wpm} | Cues=${enrichedCues.length}`
      }),
      "utf8"
    );
    writtenFiles.push(masterSrtPath, masterVttPath);

    for (const lang of opts.langs) {
      if (lang === sourceLang) continue;
      if (sourceIsRtl && RTL_LANGS.has(lang)) {
        const rtlSrt = path.join(outDirAbs, `${baseName}.${lang}.srt`);
        const rtlVtt = path.join(outDirAbs, `${baseName}.${lang}.vtt`);
        fs.writeFileSync(rtlSrt, formatSrt(enrichedCues, isolateLtrTokensForRtl), "utf8");
        fs.writeFileSync(
          rtlVtt,
          formatVtt(enrichedCues, {
            headerNote: `Target=${lang.toUpperCase()} | BiDi=LRI_PDI`,
            lineTransform: isolateLtrTokensForRtl
          }),
          "utf8"
        );
        writtenFiles.push(rtlSrt, rtlVtt);
      } else {
        const prepSrt = path.join(outDirAbs, `${baseName}.${lang}.prep.srt`);
        const prepVtt = path.join(outDirAbs, `${baseName}.${lang}.prep.vtt`);
        fs.writeFileSync(prepSrt, formatPrepSrt(enrichedCues, lang), "utf8");
        fs.writeFileSync(prepVtt, formatPrepVtt(enrichedCues, lang, glossarySource), "utf8");
        writtenFiles.push(prepSrt, prepVtt);
      }
    }

    const packetPath = path.join(outDirAbs, `${baseName}.translation_packet.json`);
    fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2), "utf8");
    writtenFiles.push(packetPath);
  }

  packet.written_files = writtenFiles;
  return packet;
}

function runSelfTest() {
  const results = [];

  // 1. Test YAML frontmatter + [ON SCREEN] cue stripping
  const sampleMd = `---
episode_id: ep_test
working_title: "Self Test"
---

[ON SCREEN: Smoked-navy Liquid Glass card showing $40.5T debt and IRC § 168(k)]

Big Tech pours $824 billion a year into AI servers and deducts the bill under IRC § 168(k). Flip to Form 10-K Note 1, and stretching those useful lives across six years inflates GAAP profits by 86.4% inside your 401(k).

[STAGE: Cut to copper heatsink]

That single footnote covers $40.5T in market claims while Amazon burns free cash flow through ASC 842 leases and Special Purpose Vehicles.
`;
  const stripped = stripYamlAndStageCues(sampleMd);
  assert.equal(stripped.frontmatter.episode_id, "ep_test");
  assert.equal(stripped.strippedStageCues, 2);
  assert.equal(stripped.paragraphs.length, 2);
  results.push("PASS: YAML frontmatter and [ON SCREEN]/[STAGE] stripping");

  // 2. Test broadcast cue compilation limits (<= 42 chars/line, <= 2 lines, 1.2s-6.5s)
  const cues = compileCuesFromParagraphs(stripped.paragraphs, 150);
  const val = validateCues(cues);
  assert.equal(val.broadcast_compliant, true);
  assert.equal(val.line_length_violations, 0);
  assert.equal(val.line_count_violations, 0);
  assert.equal(val.duration_violations, 0);
  assert.ok(val.max_line_visible_chars <= 42);
  assert.ok(val.min_duration_ms >= 1200);
  assert.ok(val.max_duration_ms <= 6500);
  results.push("PASS: Broadcast cue bounds (<=42 chars/line, <=2 lines, 1.2s-6.5s at 150 wpm)");

  // 3. Test built-in 25-term fallback glossary + alias matching across all 5 languages
  const { terms } = loadGlossary(null, { forceBuiltin: true });
  assert.equal(terms.length, 25);
  const matchers = compileGlossaryMatchers(terms);
  const combinedText = cues.map((c) => c.text).join(" ");
  const locks = scanCueGlossary(combinedText, matchers, SUPPORTED_LANGS);
  const lockedIds = new Set(locks.map((l) => l.term_id));
  assert.ok(lockedIds.has("TRM-008"), "Should match IRC § 168(k) alias");
  assert.ok(lockedIds.has("TRM-001"), "Should match Form 10-K");
  assert.ok(lockedIds.has("TRM-004"), "Should match Note 1");
  assert.ok(lockedIds.has("TRM-005"), "Should match useful lives alias");
  assert.ok(lockedIds.has("TRM-009"), "Should match GAAP");
  assert.ok(lockedIds.has("TRM-021"), "Should match 401(k)");
  assert.ok(lockedIds.has("TRM-010"), "Should match free cash flow");
  assert.ok(lockedIds.has("TRM-015"), "Should match ASC 842");
  assert.ok(lockedIds.has("TRM-014"), "Should match Special Purpose Vehicles alias");
  for (const lock of locks) {
    for (const lang of SUPPORTED_LANGS) {
      assert.ok(lock.locks[lang], `Missing ${lang} lock for ${lock.term_id}`);
    }
  }
  results.push("PASS: Built-in 25-term fallback glossary + alias matching across en/fa/ar/es/de");

  // 4. Test Unicode BiDi LRI/PDI isolation for RTL (fa & ar)
  const faInput = "بدهی به $40.5T رسید و نرخ 86.4% تحت بند IRC § 168(k) ثبت شد.";
  const faIsolated = isolateLtrTokensForRtl(faInput);
  assert.ok(faIsolated.includes(`${LRI}$40.5T${PDI}`), "Must isolate $40.5T");
  assert.ok(faIsolated.includes(`${LRI}86.4%${PDI}`), "Must isolate 86.4%");
  assert.ok(faIsolated.includes(`${LRI}IRC § 168(k)${PDI}`), "Must isolate IRC § 168(k)");
  assert.equal(isolateLtrTokensForRtl(faIsolated), faIsolated, "BiDi isolation must be idempotent");

  const arInput = "بلغ الدين $40.5T بنسبة 86.4% وفقاً للمادة IRC § 168(k) وتقرير 10-K، وحساب 401(k).";
  const arIsolated = isolateLtrTokensForRtl(arInput);
  assert.ok(arIsolated.includes(`${LRI}$40.5T${PDI}`));
  assert.ok(arIsolated.includes(`${LRI}86.4%${PDI}`));
  assert.ok(arIsolated.includes(`${LRI}IRC § 168(k)${PDI}`));
  assert.ok(arIsolated.includes(`${LRI}10-K${PDI}`));
  assert.ok(arIsolated.includes(`${LRI}401(k)${PDI}`));

  const extractedEnTokens = extractBidiTokensFromSource(
    "Big Tech pours $824 billion under IRC § 168(k) inside your 401(k) at 86.4%."
  ).map((t) => t.raw);
  assert.ok(extractedEnTokens.includes("$824 billion"));
  assert.ok(extractedEnTokens.includes("IRC § 168(k)"));
  assert.ok(extractedEnTokens.includes("401(k)"));
  assert.ok(extractedEnTokens.includes("86.4%"));
  assert.ok(!extractedEnTokens.some((t) => t.includes("Big Tech pours")));
  results.push("PASS: Unicode BiDi LRI/PDI (\\u2066...\\u2069) isolation for $40.5T, 86.4%, IRC § 168(k)");

  // 5. Test temp-dir full pipeline export (.srt, .vtt, .json) + round-trip --srt parsing
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rr-sub-prep-"));
  try {
    const tmpScript = path.join(tmpDir, "test_script.md");
    const tmpOut = path.join(tmpDir, "out");
    fs.writeFileSync(tmpScript, sampleMd, "utf8");

    const scriptPacket = runPipeline(
      {
        script: tmpScript,
        srt: null,
        glossary: null,
        langs: SUPPORTED_LANGS,
        wpm: 150,
        sourceLang: null,
        outDir: tmpOut
      },
      { forceBuiltinGlossary: true }
    );
    assert.equal(scriptPacket.validation.broadcast_compliant, true);
    assert.ok(fs.existsSync(path.join(tmpOut, "test_script.en.srt")));
    assert.ok(fs.existsSync(path.join(tmpOut, "test_script.en.vtt")));
    assert.ok(fs.existsSync(path.join(tmpOut, "test_script.fa.prep.vtt")));
    assert.ok(fs.existsSync(path.join(tmpOut, "test_script.ar.prep.srt")));
    assert.ok(fs.existsSync(path.join(tmpOut, "test_script.translation_packet.json")));

    const rtlSrt = path.join(tmpDir, "sample_fa.srt");
    fs.writeFileSync(
      rtlSrt,
      `1\n00:00:00,000 --> 00:00:04,200\nبدهی کل به $40.5T رسید و 86.4% رشد داشت.\n\n2\n00:00:04,240 --> 00:00:08,500\nاین کسر طبق IRC § 168(k) ثبت شد.\n`,
      "utf8"
    );
    const rtlPacket = runPipeline(
      {
        script: null,
        srt: rtlSrt,
        glossary: null,
        langs: ["fa", "ar"],
        wpm: 150,
        sourceLang: "fa",
        outDir: tmpOut
      },
      { forceBuiltinGlossary: true }
    );
    assert.equal(rtlPacket.source_lang, "fa");
    assert.equal(rtlPacket.cues.length, 2);
    assert.ok(rtlPacket.cues[0].text.includes(`${LRI}$40.5T${PDI}`));
    assert.ok(rtlPacket.cues[0].text.includes(`${LRI}86.4%${PDI}`));
    assert.ok(rtlPacket.cues[1].text.includes(`${LRI}IRC § 168(k)${PDI}`));
    assert.equal(rtlPacket.validation.broadcast_compliant, true);
    results.push("PASS: Full export (.srt/.vtt/.json) and RTL SRT round-trip BiDi hardening");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  return {
    status: "PASS",
    tests_passed: results.length,
    results
  };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  if (opts.selfTest) {
    try {
      const report = runSelfTest();
      if (opts.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      } else {
        for (const line of report.results) {
          process.stdout.write(`${line}\n`);
        }
        process.stdout.write(`SELF-TEST COMPLETE: ${report.tests_passed}/${report.tests_passed} passed\n`);
      }
      process.exit(0);
    } catch (err) {
      process.stderr.write(`SELF-TEST FAILED: ${err.stack || err.message}\n`);
      process.exit(1);
    }
  }

  if (!opts.script && !opts.srt) {
    printHelp();
    process.exit(1);
  }

  try {
    const packet = runPipeline(opts);
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
    } else {
      process.stdout.write(
        [
          `Mode: ${packet.mode}`,
          `Input: ${packet.input_file}`,
          `Source Lang: ${packet.source_lang} | Target Langs: ${packet.target_langs.join(",")}`,
          `Glossary: ${packet.glossary_source} (${packet.glossary_term_count} terms)`,
          `Spoken Words: ${packet.extraction_stats.spoken_words} | Cues: ${packet.validation.total_cues} | Est Runtime: ${packet.extraction_stats.estimated_runtime_seconds}s`,
          `Matched Glossary Terms: ${packet.matched_terms_count}`,
          `Validation: compliant=${packet.validation.broadcast_compliant} (max_line=${packet.validation.max_line_visible_chars} chars, min_dur=${packet.validation.min_duration_ms}ms, max_dur=${packet.validation.max_duration_ms}ms)`,
          packet.written_files.length
            ? `Written Files:\n  - ${packet.written_files.join("\n  - ")}`
            : `Written Files: none (pass --out-dir <dir> to export .srt, .vtt, and JSON packet)`
        ].join("\n") + "\n"
      );
    }
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
