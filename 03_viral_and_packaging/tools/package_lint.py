#!/usr/bin/env python3
"""
The Reading Room Editorial OS: Deliverable #17
Title & Thumbnail Automated Linter (package_lint.py)

Zero-dependency Python 3 deterministic pre-flight linter for YouTube packaging pairs
and the 90-pair title/thumbnail vault (16_90_pair_title_thumbnail_vault.json).

Deterministic 5-Gate Pipeline:
  Gate 1 (TRUNCATION)   : 31..42 char target band in --strict (<24 or >52 hard fail)
                          + proportional Roboto/YouTube Sans pixel-width truncation
                          across iOS Home Feed, Android Suggested (250px),
                          Desktop Home (340px), and Desktop 168px Up-Next.
  Gate 2 (DUPLICATION)  : Zero shared content-word stem (>=3 letters excluding tiny
                          function words) and zero identical/rounded numeric stem
                          between title and thumbnail_text.
  Gate 3 (THUMB_WCAG)   : 1..3 thumbnail words (<=20 chars), element_count <= 3,
                          and real W3C WCAG 2.1 relative luminance contrast >= 4.5
                          (>= 7.0 AAA target) from background_hex and text_hex.
  Gate 4 (HYGIENE)      : Rejects !, —, –, --, ..., Unicode ellipsis, shouting
                          ALL-CAPS words >=5 letters in title (whitelisting domain
                          acronyms), 2021..2026 stale year stamps on ep_04..ep_30,
                          clickbait slop, negative-contrast crutches, and banned AI words.
  Gate 5 (SPECIFICITY)  : Deterministic 0..100 Specificity Score across numeric/unit
                          anchors, institutional/balance-sheet nouns, and causal or
                          interrogative tension.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# ---------------------------------------------------------------------------
# Constants & Canonical Reading Room Tokens
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
PACKAGING_DIR = SCRIPT_DIR.parent
REPO_ROOT = PACKAGING_DIR.parent
DEFAULT_VAULT_PATH = PACKAGING_DIR / "16_90_pair_title_thumbnail_vault.json"

CANONICAL_PALETTE_HEX: Dict[str, str] = {
    "#FAF8F3": "Milk-Page Paper Light",
    "#F2F0EA": "Milk-Page Paper",
    "#F4EFE6": "Archival Light-Table Parchment",
    "#FAF7F1": "Restraint Vellum",
    "#1C2B3A": "Smoked Navy Primary",
    "#0F1923": "Smoked Navy Deep",
    "#0F2236": "Drafting Blueprint Navy",
    "#0D0C0B": "Silver-Gelatin Carbon",
    "#111315": "Geospatial Telemetry Obsidian",
    "#2F8F8B": "Solvent Teal Secondary",
    "#4FB3AE": "Over-Footage Solvent Teal",
    "#A3402E": "Liability Brick Red",
    "#E27358": "Over-Footage Brick Coral",
    "#FFF6E5": "Over-Footage Headline Cream",
    "#FAECD4": "Over-Footage Body Cream",
    "#3E6A94": "Statutory Slate Blue",
}

VALID_COMPOSITION_MODES: Set[str] = {
    "shirt_and_tie_plus_artifact",
    "milk_page_data_split",
    "smoked_navy_forensic_closeup",
}

# Gate 1: Proportional glyph advance widths (em units for Roboto Medium 500 / YouTube Sans 500)
GLYPH_ADVANCE_EM: Dict[str, float] = {
    " ": 0.27, "!": 0.28, '"': 0.37, "#": 0.56, "$": 0.56, "%": 0.74, "&": 0.66,
    "'": 0.22, "\u2019": 0.22, "(": 0.34, ")": 0.34, "*": 0.42, "+": 0.56, ",": 0.26,
    "-": 0.34, ".": 0.26, "/": 0.41, ":": 0.27, ";": 0.27, "<": 0.52, "=": 0.56,
    ">": 0.52, "?": 0.49, "@": 0.88, "[": 0.32, "\\": 0.41, "]": 0.32, "_": 0.50,
    "0": 0.56, "1": 0.52, "2": 0.56, "3": 0.56, "4": 0.56,
    "5": 0.56, "6": 0.56, "7": 0.56, "8": 0.56, "9": 0.56,
    "a": 0.54, "b": 0.56, "c": 0.51, "d": 0.56, "e": 0.54, "f": 0.36, "g": 0.56,
    "h": 0.56, "i": 0.26, "j": 0.27, "k": 0.52, "l": 0.26, "m": 0.86, "n": 0.56,
    "o": 0.56, "p": 0.56, "q": 0.56, "r": 0.37, "s": 0.50, "t": 0.35, "u": 0.56,
    "v": 0.50, "w": 0.75, "x": 0.50, "y": 0.50, "z": 0.49,
    "A": 0.66, "B": 0.64, "C": 0.65, "D": 0.67, "E": 0.58, "F": 0.56, "G": 0.68,
    "H": 0.70, "I": 0.29, "J": 0.53, "K": 0.64, "L": 0.55, "M": 0.87, "N": 0.70,
    "O": 0.70, "P": 0.63, "Q": 0.70, "R": 0.64, "S": 0.61, "T": 0.60, "U": 0.67,
    "V": 0.64, "W": 0.92, "X": 0.63, "Y": 0.61, "Z": 0.60,
}
DEFAULT_GLYPH_EM = 0.56

YOUTUBE_VIEWPORT_SURFACES: List[Dict[str, Any]] = [
    {
        "surface_id": "ios_home_feed",
        "label": "iOS Home Feed",
        "container_px": 294.0,
        "font_px": 15.0,
        "max_lines": 2,
        "ellipsis_reserve_px": 15.0,
    },
    {
        "surface_id": "android_suggested_250px",
        "label": "Android Suggested (250px)",
        "container_px": 250.0,
        "font_px": 14.0,
        "max_lines": 2,
        "ellipsis_reserve_px": 14.0,
    },
    {
        "surface_id": "desktop_home_340px",
        "label": "Desktop Home (340px)",
        "container_px": 340.0,
        "font_px": 16.0,
        "max_lines": 2,
        "ellipsis_reserve_px": 16.0,
    },
    {
        "surface_id": "desktop_up_next_168px",
        "label": "Desktop 168px Up-Next",
        "container_px": 202.0,
        "font_px": 14.0,
        "max_lines": 2,
        "ellipsis_reserve_px": 14.0,
    },
]

# Gate 2: Function words excluded from >=3-letter content stem deduplication
FUNCTION_WORDS: Set[str] = {
    "the", "a", "an", "and", "of", "in", "to", "on", "by", "for", "at", "is",
    "if", "or", "vs", "from", "into", "out", "now", "why", "how", "who",
    "what", "when", "where",
}

IRREGULAR_STEMS: Dict[str, str] = {
    "paid": "pay", "pays": "pay", "paying": "pay",
    "stolen": "steal", "stole": "steal", "steals": "steal", "stealing": "steal",
    "froze": "freez", "frozen": "freez", "freezes": "freez", "freezing": "freez", "freeze": "freez",
    "bought": "buy", "buys": "buy", "buying": "buy",
    "sold": "sell", "sells": "sell", "selling": "sell",
    "broke": "break", "broken": "break", "breaks": "break", "breaking": "break",
    "took": "take", "taken": "take", "takes": "take", "taking": "take",
    "lost": "lose", "loses": "lose", "losing": "lose",
    "losses": "loss", "loss": "loss",
    "men": "man", "women": "woman", "children": "child",
    "taxes": "tax", "taxed": "tax", "taxing": "tax",
    "dies": "die", "died": "die", "dying": "die",
    "lies": "lie", "lied": "lie", "lying": "lie",
    "liars": "liar", "liar": "liar",
    "halves": "half", "wives": "wife", "lives": "life",
}

# Gate 4: Domain acronym whitelist for title ALL-CAPS inspection
WHITELISTED_TITLE_ACRONYMS: Set[str] = {
    # Mandatory prompt whitelist
    "GENIUS", "CISA", "ERCOT", "FICO", "GAAP", "GPUS", "UBI", "PJM",
    "FDIC", "SWIFT", "DRAM", "TSMC", "ASML", "SAAS", "401(K)", "401K",
    # Canonical primary-source statutory/agency initialisms in slate_30_jan2028.json
    "FINCEN", "CALEA", "KOSTAT", "MIDAS", "NERC", "LBNL", "USGS", "OASDI",
    "OASI", "SIPC", "FICA", "SCADA", "COBOL", "CHIPS", "EIDAS", "CFIUS",
    "NATO", "OECD", "FIDO", "FIDO2", "C2PA", "NIST", "FIPS", "SLOAS",
    "REIT", "REITS",
}

SHORT_SAFE_ACRONYMS: Set[str] = {
    "AI", "US", "UK", "EU", "UN", "IT", "OT", "IP", "ID", "IDS", "HR", "PR",
    "GDP", "CPI", "PCE", "FED", "BOJ", "ECB", "IMF", "BIS", "SEC", "FTC",
    "DOJ", "FBI", "NSA", "DOD", "CRS", "CBO", "BLS", "OMB", "FCC", "PUC",
    "FERC", "NERC", "MIT", "CMU", "UIUC", "ICI", "FSB", "SIA", "BCG", "IEA",
    "LLM", "LLMS", "GPU", "CPU", "NPU", "RAM", "EUV", "API", "APIS", "VPN",
    "DNS", "TLS", "RSA", "ECC", "AES", "PQC", "HSM", "ZKP", "SMS", "2FA",
    "SSN", "SSNS", "CVE", "CVES", "KEV", "KEVS", "SAR", "SARS", "AML", "KYC",
    "APP", "ACH", "SVB", "FCF", "EPS", "RPO", "RPOS", "SPV", "SPVS", "AUM",
    "LBO", "BDC", "BDCS", "PIK", "ETF", "ETFS", "NAV", "RMD", "RMDS", "IDR",
    "TFR", "VAT", "BPO", "BOM", "PPA", "LFP", "LNG", "TWH", "MWH", "KWH",
    "GW", "MW", "KW", "NM", "CEO", "CFO", "CTO", "IPO", "IRS", "10K", "10Q",
    "8K", "20F", "Q1", "Q2", "Q3", "Q4", "FY", "YOY", "TTM", "R&D", "S&P",
}

CLICKBAIT_SLOP_PATTERNS: List[Tuple[str, re.Pattern[str]]] = [
    ("shocking", re.compile(r"\bshock(?:ing|ed)\b", re.IGNORECASE)),
    ("insane", re.compile(r"\binsane(?:ly)?\b", re.IGNORECASE)),
    ("everything changed", re.compile(r"\b(?:everything\s+changed|changes\s+everything)\b", re.IGNORECASE)),
    ("it's over", re.compile(r"\b(?:it['\u2019]?s\s+over|is\s+over\s+forever)\b", re.IGNORECASE)),
    ("nobody talks about", re.compile(r"\b(?:nobody|no\s+one)\s+(?:is\s+)?talk(?:s|ing)\s+about\b", re.IGNORECASE)),
    ("secret", re.compile(r"\bsecrets?\b", re.IGNORECASE)),
    ("destroyed", re.compile(r"\bdestroy(?:ed|s|ing)\b", re.IGNORECASE)),
    ("terrifying", re.compile(r"\bterrif(?:ying|ied)\b", re.IGNORECASE)),
    ("unbelievable", re.compile(r"\bunbelievable\b", re.IGNORECASE)),
    ("you won't believe", re.compile(r"\byou\s+won['\u2019]?t\s+believe\b", re.IGNORECASE)),
    ("mind-blowing", re.compile(r"\bmind[- ]?blowing\b|\bjaw[- ]?dropping\b", re.IGNORECASE)),
    ("gone wrong / must watch", re.compile(r"\bgone\s+wrong\b|\bmust\s+watch\b", re.IGNORECASE)),
]

BANNED_AI_WORDS: Set[str] = {
    "delve", "delves", "delving", "delved",
    "tapestry", "tapestries",
    "testament", "testaments",
    "pivotal", "crucial", "crucially",
    "leverage", "leverages", "leveraging", "leveraged",
    "utilize", "utilizes", "utilizing", "utilized", "utilization",
    "landscape", "landscapes",
    "realm", "realms",
    "paradigm", "paradigms",
    "robust", "robustly",
    "comprehensive", "comprehensively",
    "seamless", "seamlessly",
    "nuanced", "multifaceted",
    "foster", "fosters", "fostering", "fostered",
    "bolster", "bolsters", "bolstering", "bolstered",
    "underscore", "underscores", "underscoring", "underscored",
    "showcase", "showcases", "showcasing", "showcased",
    "intricate", "intricately", "intricacies",
    "vibrant", "vibrantly", "enduring",
    "unpack", "unpacks", "unpacking", "unpacked",
    "interplay", "genuinely", "profound", "profoundly",
    "remarkable", "remarkably", "unprecedented",
    "transformative", "groundbreaking", "paramount",
    "revolutionize", "revolutionizes", "revolutionizing", "revolutionized",
    "spearhead", "spearheads", "spearheading",
    "synergy", "synergies", "holistic", "overarching", "myriad", "plethora",
}

BANNED_AI_PHRASES: List[Tuple[str, re.Pattern[str]]] = [
    ("deep dive", re.compile(r"\bdeep\s+dives?\b", re.IGNORECASE)),
    ("at its core", re.compile(r"\bat\s+its\s+core\b", re.IGNORECASE)),
    ("game-changer", re.compile(r"\bgame[- ]chang(?:er|ing)\b", re.IGNORECASE)),
    ("cutting-edge", re.compile(r"\bcutting[- ]edge\b", re.IGNORECASE)),
    ("highlight (verb)", re.compile(r"\b(?:will|can|to|these|filings?|numbers?|data)\s+highlights?\b|\bhighlight(?:ed|ing)\b", re.IGNORECASE)),
    ("negative contrast crutch", re.compile(r"\brather\s+than\b|\bnot\s+only\b.+?\bbut\b|\b(?:isn['\u2019]?t|is\s+not)\b.+?,\s*(?:it['\u2019]?s|it\s+is)\b|\bnot\s+[A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+){0,3},\s*but\b", re.IGNORECASE)),
]

# Gate 5: Specificity lexicon
INSTITUTIONAL_AND_DOMAIN_TERMS: Set[str] = {
    "ai", "debt", "treasury", "tbill", "tbills", "bond", "bonds", "yield", "yields",
    "bank", "banks", "banking", "checking", "deposit", "deposits", "fdic", "swift",
    "fincen", "sar", "sars", "irs", "fica", "gaap", "sec", "ftc", "doj", "cbo", "fed",
    "boj", "imf", "nist", "cisa", "calea", "genius", "eidas", "cfius", "ferc", "nerc",
    "ercot", "pjm", "fico", "sipc", "oasi", "oasdi", "401k", "roth", "pension",
    "mortgage", "mortgages", "escrow", "insurance", "fair", "student", "tuition",
    "wage", "wages", "paycheck", "paychecks", "payroll", "career", "rung", "jobs",
    "hiring", "junior", "saas", "credit", "pik", "shadow", "buyout", "spv", "rpo",
    "capex", "profit", "profits", "cash", "margin", "margins", "tax", "taxes", "untaxed",
    "chip", "chips", "wafer", "wafers", "gpu", "gpus", "dram", "euv", "2nm", "tsmc",
    "asml", "taiwan", "china", "japan", "korea", "gulf", "oil", "petrodollar", "swf",
    "grid", "power", "transformer", "substation", "nuclear", "tokens", "compute",
    "water", "cooling", "fertilizer", "phosphate", "cable", "cables", "subsea", "fiber",
    "drone", "drones", "defense", "pentagon", "missile", "navy", "robot", "robots",
    "humanoid", "actuator", "factory", "nations", "court", "courtroom", "courtrooms",
    "subpoena", "privilege", "law", "statute", "cartel", "rent", "price", "dividend",
    "quantum", "decryption", "encryption", "patch", "patches", "hack", "hacks", "cve",
    "bot", "bots", "traffic", "wallet", "wallets", "companion", "brain", "deskilling",
    "satellite", "birth", "fertility", "social", "security", "allowance", "ubi",
    "america", "american", "us", "wall", "tech", "big", "money", "refund", "gallons",
    "gallon", "wiretap", "syndicate", "export", "checks", "proof", "weights", "cyber",
    "server", "servers", "cloud", "silicon", "lithography", "tariff", "tariffs",
    "cliff", "harvest", "rsa", "ecc", "tls", "fips", "hsm", "cobol", "scada",
    "adp", "labor", "hire", "hires", "loan", "loans", "seat", "seats", "default",
    "outflow", "stock", "stocks", "passive", "capacity", "hospital", "hospitals",
    "bug", "bugs", "underemployment", "grad", "grads", "mit", "eeg", "copilot",
    "workflow", "workflows", "prompt", "prompts", "qa", "verifier", "premium",
    "fsb", "algorithmic", "bid", "bids", "dollar", "shortage", "emerging",
    "roof", "pool", "chatbot", "logs", "defect", "airframe", "airframes",
    "launch", "cells", "criminal", "gag", "closure", "flag", "flags", "appeal",
    "federal", "judge", "judges", "metadata", "algorithm", "algorithms", "checkout",
    "browser", "hacker", "hackers", "carrier", "backdoor", "hardware", "key", "keys",
    "sunbelt", "drought", "morocco", "battery", "batteries", "phosphate", "cohort",
    "cohorts", "retiree", "retirees", "seafloor", "data", "tollbooth", "orbit",
    "laser", "lasers", "europe", "mandate", "password", "passwords", "login", "logins",
    "aes", "trust", "fund", "funds", "congress", "stablecoin", "stablecoins",
    "antitrust", "sherman", "lease", "leases",
}

INSTITUTIONAL_DOMAIN_STEMS: Set[str] = set(INSTITUTIONAL_AND_DOMAIN_TERMS)

TENSION_VERBS_AND_PIVOTS: Set[str] = {
    "vs", "versus", "behind", "inside", "against", "break", "breaks", "broken",
    "erased", "erase", "keep", "keeps", "stolen", "steal", "froze", "frozen", "freeze",
    "sell", "sells", "sold", "buys", "buy", "pays", "pay", "controls", "control",
    "owns", "own", "costs", "cost", "testifies", "testify", "cliff", "clock", "run",
    "trick", "lock", "locks", "locked", "shield", "switch", "cartel", "dividend",
    "shadow", "captive", "untaxed", "mandatory", "missing", "trap", "dead", "cut",
    "cuts", "drops", "drop", "shares", "starves", "drains", "blocks", "jump", "jumped",
    "hit", "low", "fewer", "slower", "empty", "shortage", "gone", "faded", "dull",
    "weaponize", "weaponizes", "firing", "waive", "pulled", "hikes", "warned", "warning",
    "smaller", "replace", "saves", "leak", "risk", "gap", "shock", "loss", "flight",
    "no", "zero", "subpoena", "subpoenaed", "discoverable",
}

INTERROGATIVE_TRIGGERS: Set[str] = {
    "who", "why", "how", "what", "when", "where", "can", "if", "will", "does",
}

VAGUE_FILLER_PATTERNS: List[Tuple[str, re.Pattern[str]]] = [
    ("things/stuff", re.compile(r"\b(?:things?|stuff|something)\b", re.IGNORECASE)),
    ("future/impact/role of", re.compile(r"\b(?:the\s+)?(?:future|impact|role|power|world|state)\s+of\b", re.IGNORECASE)),
    ("modern/various/interesting", re.compile(r"\b(?:modern|various|interesting|important)\b", re.IGNORECASE)),
]


# ---------------------------------------------------------------------------
# Gate 1 Helpers: Proportional Glyph Width & Line-Box Truncation
# ---------------------------------------------------------------------------

def measure_text_px(text: str, font_px: float) -> float:
    """Computes proportional pixel advance width for Roboto/YouTube Sans Medium."""
    em_sum = 0.0
    for ch in text:
        em_sum += GLYPH_ADVANCE_EM.get(ch, DEFAULT_GLYPH_EM)
    return round(em_sum * font_px, 2)


def simulate_two_line_wrap(
    title: str,
    container_px: float,
    font_px: float,
    max_lines: int = 2,
    ellipsis_reserve_px: float = 14.0,
) -> Dict[str, Any]:
    """Simulates browser greedy word-wrapping with -webkit-line-clamp: 2."""
    words = [w for w in title.strip().split(" ") if w]
    if not words:
        return {
            "single_line_px": 0.0,
            "lines_used": 0,
            "line_widths_px": [],
            "utilization_pct": 0.0,
            "truncated": False,
        }

    space_px = GLYPH_ADVANCE_EM[" "] * font_px
    lines: List[float] = []
    cur_line_px = 0.0

    for word in words:
        w_px = measure_text_px(word, font_px)
        # If a single unbreakable token exceeds the container width, split across lines
        if w_px > container_px:
            if cur_line_px > 0:
                lines.append(round(cur_line_px, 2))
                cur_line_px = 0.0
            remaining = w_px
            while remaining > container_px:
                lines.append(round(container_px, 2))
                remaining -= container_px
            cur_line_px = remaining
            continue

        if cur_line_px == 0.0:
            cur_line_px = w_px
        elif cur_line_px + space_px + w_px <= container_px:
            cur_line_px += space_px + w_px
        else:
            lines.append(round(cur_line_px, 2))
            cur_line_px = w_px

    if cur_line_px > 0.0:
        lines.append(round(cur_line_px, 2))

    single_line_px = measure_text_px(title.strip(), font_px)
    lines_used = len(lines)
    # Truncates if words spill past max_lines
    truncated = lines_used > max_lines
    two_line_budget = container_px * max_lines
    utilization_pct = round((single_line_px / two_line_budget) * 100.0, 1) if two_line_budget > 0 else 0.0

    return {
        "single_line_px": single_line_px,
        "lines_used": lines_used,
        "line_widths_px": lines,
        "utilization_pct": utilization_pct,
        "truncated": truncated,
    }


def evaluate_gate1_truncation(
    title: str,
    strict: bool = False,
    reported_char_count: Optional[int] = None,
) -> Dict[str, Any]:
    clean_title = title.strip()
    char_count = len(clean_title)
    violations: List[Dict[str, str]] = []
    warnings: List[Dict[str, str]] = []

    if reported_char_count is not None and reported_char_count != char_count:
        warnings.append({
            "code": "G1_CHAR_COUNT_METADATA_DRIFT",
            "severity": "WARN",
            "message": f"Reported title_char_count ({reported_char_count}) differs from actual length ({char_count}).",
        })

    if char_count < 24:
        violations.append({
            "code": "G1_CHAR_UNDER_HARD_MIN",
            "severity": "FAIL",
            "message": f"Title length is {char_count} chars (< 24 hard minimum; starves search and browse context).",
        })
    elif char_count > 52:
        violations.append({
            "code": "G1_CHAR_OVER_HARD_MAX",
            "severity": "FAIL",
            "message": f"Title length is {char_count} chars (> 52 hard cap; clips across mobile and Up-Next rails).",
        })
    elif char_count < 31 or char_count > 42:
        entry = {
            "code": "G1_CHAR_OUTSIDE_TARGET_BAND",
            "severity": "FAIL" if strict else "WARN",
            "message": f"Title length is {char_count} chars (outside 31..42 Reading Room target band).",
        }
        if strict:
            violations.append(entry)
        else:
            warnings.append(entry)

    surface_reports: List[Dict[str, Any]] = []
    for surf in YOUTUBE_VIEWPORT_SURFACES:
        sim = simulate_two_line_wrap(
            clean_title,
            container_px=surf["container_px"],
            font_px=surf["font_px"],
            max_lines=surf["max_lines"],
            ellipsis_reserve_px=surf["ellipsis_reserve_px"],
        )
        surf_entry = {
            "surface_id": surf["surface_id"],
            "label": surf["label"],
            "container_px": surf["container_px"],
            "font_px": surf["font_px"],
            **sim,
        }
        surface_reports.append(surf_entry)
        if sim["truncated"]:
            violations.append({
                "code": f"G1_PIXEL_TRUNCATION_{surf['surface_id'].upper()}",
                "severity": "FAIL",
                "message": (
                    f"{surf['label']} ({int(surf['container_px'])}px @ {int(surf['font_px'])}px Roboto) "
                    f"wraps to {sim['lines_used']} lines ({sim['single_line_px']}px total) and clips with ellipsis."
                ),
            })

    return {
        "gate_id": "GATE_1_TRUNCATION",
        "passed": len(violations) == 0,
        "char_count": char_count,
        "target_band": [31, 42],
        "hard_bounds": [24, 52],
        "surfaces": surface_reports,
        "violations": violations,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# Gate 2 Helpers: Morphological Content-Word & Numeric Stem Deduplication
# ---------------------------------------------------------------------------

def stem_content_word(word: str) -> str:
    """Deterministic English morphological stemmer for >=3-letter packaging words."""
    w = word.lower().strip("'")
    if w.endswith("'s"):
        w = w[:-2]
    if len(w) < 3:
        return w
    if w in IRREGULAR_STEMS:
        return IRREGULAR_STEMS[w]

    # Step 1: Plurals and verbal inflections
    if w.endswith("ies") and len(w) > 4:
        w = w[:-3] + "y"
    elif w.endswith("ves") and len(w) > 4:
        w = w[:-3] + "f"
    elif w.endswith("ing") and len(w) >= 6:
        base = w[:-3]
        if len(base) >= 4 and base[-1] == base[-2] and base[-1] not in "aeioulsz":
            base = base[:-1]
        w = base
    elif w.endswith("ed") and len(w) >= 5:
        if w.endswith("ied") and len(w) > 4:
            w = w[:-3] + "y"
        else:
            base = w[:-2]
            if len(base) >= 4 and base[-1] == base[-2] and base[-1] not in "aeioulsz":
                base = base[:-1]
            # Keep 4-letter -e roots intact (e.g., rated -> rate, waged -> wage, coded -> code)
            if len(base) == 3 and w[:-1] in {
                "rate", "wage", "code", "note", "line", "file", "fine", "rule",
                "site", "care", "wire", "hire", "fire", "save", "move", "vote",
                "owe", "use", "age", "ban",
            }:
                w = w[:-1]
            else:
                w = base
    elif w.endswith(("ches", "shes", "xes", "zes", "sses")) and len(w) >= 5:
        w = w[:-2]
    elif w.endswith("s") and not w.endswith(("ss", "us", "is")) and len(w) >= 4:
        w = w[:-1]

    # Step 2: Light derivational suffixes (-er / -ers / -ly)
    if w.endswith("ly") and len(w) >= 6:
        w = w[:-2]

    # Step 3: Silent-e normalization ONLY on >=5-letter words so 4-letter roots (car vs care) stay distinct
    if len(w) >= 5 and w.endswith("e") and not w.endswith(("ee", "oe", "ye")):
        w = w[:-1]

    return IRREGULAR_STEMS.get(w, w)


def extract_content_stems(text: str) -> Dict[str, str]:
    """Returns mapping of {stem: original_surface_token} for >=3-letter content words."""
    normalized = text.replace("\u2019", "'")
    # Protect 401(k) so '(k)' does not create a stray single-letter token
    normalized = re.sub(r"\b401\(k\)s?\b", " 401k ", normalized, flags=re.IGNORECASE)
    stems: Dict[str, str] = {}
    for match in re.finditer(r"[A-Za-z]+(?:'[A-Za-z]+)?", normalized):
        raw = match.group(0)
        clean = raw.lower()
        if clean.endswith("'s"):
            clean = clean[:-2]
        clean = clean.strip("'")
        if len(clean) < 3 or clean in FUNCTION_WORDS:
            continue
        stem = stem_content_word(clean)
        if len(stem) >= 3 and stem not in FUNCTION_WORDS:
            stems.setdefault(stem, raw)
    return stems


NUMERIC_TOKEN_RE = re.compile(
    r"(?<![A-Za-z0-9])(\$?\d+(?:,\d{3})*(?:\.\d+)?)\s*"
    r"(%|percent|pct|trillion|billion|million|thousand|[kmbtKMBT]|x|nm|gw|mw|twh|yr|hr)?(?![A-Za-z0-9])",
    re.IGNORECASE,
)


def extract_numeric_stems(text: str) -> List[Dict[str, Any]]:
    """Extracts normalized numeric/scale stems (including 401(k) and magnitude-normalized forms)."""
    results: List[Dict[str, Any]] = []
    if re.search(r"\b401\(?k\)?s?\b", text, re.IGNORECASE):
        results.append({
            "raw": "401(k)",
            "stem": "401k",
            "value": 401.0,
            "unit": "401k",
        })

    scrubbed = re.sub(r"\b401\(?k\)?s?\b", " ", text, flags=re.IGNORECASE)
    unit_map = {
        "%": "%", "percent": "%", "pct": "%",
        "t": "t", "trillion": "t",
        "b": "b", "billion": "b",
        "m": "m", "million": "m",
        "k": "k", "thousand": "k",
        "x": "x", "nm": "nm", "gw": "gw", "mw": "mw", "twh": "twh",
        "yr": "yr", "hr": "hr",
    }

    for m in NUMERIC_TOKEN_RE.finditer(scrubbed):
        raw_full = m.group(0).strip()
        num_part = m.group(1)
        unit_raw = (m.group(2) or "").lower()
        has_dollar = num_part.startswith("$")
        clean_digits = num_part.lstrip("$").replace(",", "")
        try:
            val = float(clean_digits)
        except ValueError:
            continue

        unit = unit_map.get(unit_raw, "")
        # Normalize >=1,000 raw comma numbers into k/m/b stems so $16,000 matches $16K
        if unit == "" and val >= 1000.0 and val % 1000.0 == 0.0:
            if val >= 1_000_000_000_000.0:
                val = val / 1_000_000_000_000.0
                unit = "t"
            elif val >= 1_000_000_000.0:
                val = val / 1_000_000_000.0
                unit = "b"
            elif val >= 1_000_000.0:
                val = val / 1_000_000.0
                unit = "m"
            else:
                val = val / 1_000.0
                unit = "k"

        val_str = str(int(val)) if val.is_integer() else f"{val:g}"
        stem = f"{val_str}{unit}"
        results.append({
            "raw": raw_full,
            "stem": stem,
            "value": val,
            "unit": unit,
            "has_dollar": has_dollar,
        })
    return results


def evaluate_gate2_duplication(title: str, thumbnail_text: str) -> Dict[str, Any]:
    title_words = extract_content_stems(title)
    thumb_words = extract_content_stems(thumbnail_text)
    violations: List[Dict[str, str]] = []

    shared_word_stems = sorted(set(title_words.keys()) & set(thumb_words.keys()))
    for st in shared_word_stems:
        violations.append({
            "code": "G2_DUPLICATE_CONTENT_STEM",
            "severity": "FAIL",
            "message": (
                f"Shared content-word stem '{st}' repeats across title ('{title_words[st]}') "
                f"and thumbnail ('{thumb_words[st]}'). Use complementary language."
            ),
        })

    title_nums = extract_numeric_stems(title)
    thumb_nums = extract_numeric_stems(thumbnail_text)
    seen_num_pairs: Set[Tuple[str, str]] = set()

    for tn in title_nums:
        for thn in thumb_nums:
            exact_match = tn["stem"] == thn["stem"]
            # Catch rounded headline stat echo (e.g. $40.5T in title + $40T in thumb, or 86.4% + 86%)
            rounded_match = (
                tn["unit"] != ""
                and tn["unit"] == thn["unit"]
                and min(tn["value"], thn["value"]) >= 10.0
                and (
                    int(tn["value"]) == int(thn["value"])
                    or round(tn["value"]) == round(thn["value"])
                )
            )
            if exact_match or rounded_match:
                key = (tn["raw"], thn["raw"])
                if key not in seen_num_pairs:
                    seen_num_pairs.add(key)
                    violations.append({
                        "code": "G2_DUPLICATE_NUMERIC_STEM",
                        "severity": "FAIL",
                        "message": (
                            f"Shared numeric stem repeats across title ('{tn['raw']}') "
                            f"and thumbnail ('{thn['raw']}'). Pair two distinct statistics instead."
                        ),
                    })

    return {
        "gate_id": "GATE_2_ZERO_DUPLICATION",
        "passed": len(violations) == 0,
        "title_content_stems": sorted(title_words.keys()),
        "thumb_content_stems": sorted(thumb_words.keys()),
        "shared_content_stems": shared_word_stems,
        "title_numeric_stems": [x["stem"] for x in title_nums],
        "thumb_numeric_stems": [x["stem"] for x in thumb_nums],
        "violations": violations,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Gate 3 Helpers: Thumbnail Cognitive Budget & W3C WCAG 2.1 Contrast
# ---------------------------------------------------------------------------

HEX_COLOR_RE = re.compile(r"^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$")


def parse_hex_rgb(hex_str: str) -> Optional[Tuple[int, int, int]]:
    s = hex_str.strip()
    if not HEX_COLOR_RE.match(s):
        return None
    body = s[1:]
    if len(body) == 3:
        body = "".join(ch * 2 for ch in body)
    return (int(body[0:2], 16), int(body[2:4], 16), int(body[4:6], 16))


def relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """Computes W3C WCAG 2.1 linearized sRGB relative luminance."""
    channels: List[float] = []
    for c in rgb:
        s = c / 255.0
        if s <= 0.04045:
            channels.append(s / 12.92)
        else:
            channels.append(((s + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def compute_wcag_contrast(hex_a: str, hex_b: str) -> Optional[float]:
    rgb_a = parse_hex_rgb(hex_a)
    rgb_b = parse_hex_rgb(hex_b)
    if rgb_a is None or rgb_b is None:
        return None
    lum_a = relative_luminance(rgb_a)
    lum_b = relative_luminance(rgb_b)
    lighter = max(lum_a, lum_b)
    darker = min(lum_a, lum_b)
    return round((lighter + 0.05) / (darker + 0.05), 2)


def evaluate_gate3_thumb_and_contrast(
    thumbnail_text: str,
    background_hex: str,
    text_hex: str,
    element_count: int = 3,
    accent_hex: Optional[str] = None,
    reported_word_count: Optional[int] = None,
    reported_contrast: Optional[float] = None,
) -> Dict[str, Any]:
    clean_thumb = thumbnail_text.strip()
    words = [w for w in clean_thumb.split() if w]
    word_count = len(words)
    char_count = len(clean_thumb)

    violations: List[Dict[str, str]] = []
    warnings: List[Dict[str, str]] = []

    if reported_word_count is not None and reported_word_count != word_count:
        warnings.append({
            "code": "G3_WORD_COUNT_METADATA_DRIFT",
            "severity": "WARN",
            "message": f"Reported thumbnail_word_count ({reported_word_count}) differs from actual word count ({word_count}).",
        })

    if word_count < 1:
        violations.append({
            "code": "G3_THUMB_EMPTY",
            "severity": "FAIL",
            "message": "Thumbnail text has 0 words; Reading Room thumbnails require 1..3 crisp words.",
        })
    elif word_count > 3:
        violations.append({
            "code": "G3_THUMB_OVER_3_WORDS",
            "severity": "FAIL",
            "message": f"Thumbnail text has {word_count} words ('{clean_thumb}'); maximum budget is 3 words.",
        })

    if char_count > 20:
        violations.append({
            "code": "G3_THUMB_OVER_20_CHARS",
            "severity": "FAIL",
            "message": f"Thumbnail text is {char_count} chars ('{clean_thumb}'); maximum budget is 20 chars.",
        })

    if element_count < 1 or element_count > 3:
        violations.append({
            "code": "G3_ELEMENT_COUNT_OVER_BUDGET",
            "severity": "FAIL",
            "message": f"Thumbnail element_count is {element_count}; cognitive glance ceiling is 1..3 focal elements.",
        })

    if accent_hex is not None and parse_hex_rgb(accent_hex) is None:
        violations.append({
            "code": "G3_INVALID_ACCENT_HEX",
            "severity": "FAIL",
            "message": f"Invalid accent_hex '{accent_hex}'; expected #RRGGBB hex string.",
        })

    contrast = compute_wcag_contrast(background_hex, text_hex)
    wcag_tier = "INVALID_HEX"
    if contrast is None:
        violations.append({
            "code": "G3_INVALID_HEX",
            "severity": "FAIL",
            "message": f"Invalid background_hex ('{background_hex}') or text_hex ('{text_hex}').",
        })
    else:
        if reported_contrast is not None and abs(reported_contrast - contrast) > 0.25:
            warnings.append({
                "code": "G3_CONTRAST_METADATA_DRIFT",
                "severity": "WARN",
                "message": f"Reported contrast_ratio ({reported_contrast}) differs from WCAG 2.1 calculation ({contrast}).",
            })
        if contrast < 4.5:
            wcag_tier = "FAIL_BELOW_AA"
            violations.append({
                "code": "G3_WCAG_CONTRAST_FAIL",
                "severity": "FAIL",
                "message": (
                    f"WCAG 2.1 contrast between {background_hex} and {text_hex} is {contrast}:1 "
                    f"(< 4.5:1 AA minimum; target >= 7.0:1 AAA)."
                ),
            })
        elif contrast < 7.0:
            wcag_tier = "AA_PASS_BELOW_AAA"
            warnings.append({
                "code": "G3_WCAG_BELOW_AAA_TARGET",
                "severity": "WARN",
                "message": (
                    f"WCAG 2.1 contrast is {contrast}:1 (clears 4.5:1 AA floor, below 7.0:1 AAA Reading Room target)."
                ),
            })
        else:
            wcag_tier = "AAA"

    if background_hex.strip().upper() == "#FFFFFF":
        warnings.append({
            "code": "G3_PURE_WHITE_FORBIDDEN_TOKEN",
            "severity": "WARN",
            "message": "background_hex uses optical pure white (#FFFFFF); prefer Reading Room Milk-Page (#FAF8F3).",
        })

    return {
        "gate_id": "GATE_3_THUMB_AND_CONTRAST",
        "passed": len(violations) == 0,
        "thumb_word_count": word_count,
        "thumb_char_count": char_count,
        "element_count": element_count,
        "background_hex": background_hex,
        "text_hex": text_hex,
        "accent_hex": accent_hex,
        "contrast_ratio": contrast,
        "wcag_tier": wcag_tier,
        "violations": violations,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# Gate 4 Helpers: Anti-Clickbait, Staleness, Acronym Whitelist & Punctuation
# ---------------------------------------------------------------------------

def parse_episode_number(episode_id: Optional[str], episode_number: Optional[int] = None) -> Optional[int]:
    if episode_number is not None:
        return int(episode_number)
    if not episode_id:
        return None
    m = re.search(r"ep_?0*(\d+)", str(episode_id), re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def is_whitelisted_title_caps_token(raw_token: str) -> bool:
    """Checks whether an uppercase token in title is a permitted technical/statutory acronym."""
    cleaned = raw_token.strip(".,:;?()[]\"'\u2019$")
    if cleaned.endswith("'s") or cleaned.endswith("\u2019s"):
        cleaned = cleaned[:-2]
    upper_exact = cleaned.upper()
    if upper_exact in WHITELISTED_TITLE_ACRONYMS or upper_exact in SHORT_SAFE_ACRONYMS:
        return True
    # Handle pluralized acronyms with trailing lowercase 's' (e.g. GPUs, SaaS, 401(k)s, SARs)
    if len(cleaned) >= 3 and cleaned.endswith("s") and not cleaned.endswith("SS"):
        singular_upper = cleaned[:-1].upper()
        if singular_upper in WHITELISTED_TITLE_ACRONYMS or singular_upper in SHORT_SAFE_ACRONYMS:
            return True
    # Mixed-case stylized technical terms (e.g. SaaS, PaaS, eIDAS, iOS, macOS, CoWoS, FedNow, RealPage)
    letters_only = [c for c in cleaned if c.isalpha()]
    if any(c.islower() for c in letters_only):
        return True
    return False


def evaluate_gate4_hygiene(
    title: str,
    thumbnail_text: str,
    episode_id: Optional[str] = None,
    episode_number: Optional[int] = None,
) -> Dict[str, Any]:
    violations: List[Dict[str, str]] = []
    warnings: List[Dict[str, str]] = []

    surfaces = [("title", title), ("thumbnail_text", thumbnail_text)]

    # 1. Hard punctuation lock
    punct_checks = [
        ("G4_EXCLAMATION_MARK", "!", "Remove exclamation mark (!); let verified numbers carry urgency."),
        ("G4_EM_DASH", "\u2014", "Remove em dash (\u2014); use a colon, comma, or 'vs'."),
        ("G4_EN_DASH", "\u2013", "Remove en dash (\u2013); use ASCII hyphen inside compounds or 'to'/'vs'."),
        ("G4_DOUBLE_HYPHEN", "--", "Remove double hyphen (--)."),
        ("G4_ASCII_ELLIPSIS", "...", "Remove trailing or mid-line ellipsis (...)."),
        ("G4_UNICODE_ELLIPSIS", "\u2026", "Remove Unicode ellipsis (\u2026)."),
    ]
    for surface_name, content in surfaces:
        for code, needle, hint in punct_checks:
            if needle in content:
                violations.append({
                    "code": code,
                    "severity": "FAIL",
                    "message": f"Forbidden punctuation '{needle}' in {surface_name}: {hint}",
                })

    # 2. Shouting ALL-CAPS words >= 5 letters in title (with domain acronym whitelist)
    shouting_words: List[str] = []
    short_shouting_words: List[str] = []
    for raw_tok in re.findall(r"[A-Za-z0-9()&'\u2019-]+", title):
        # Inspect hyphenated parts separately (e.g. ALL-CAPS or 128-WEEK)
        sub_tokens = [raw_tok] if re.match(r"^401\(k\)s?$", raw_tok, re.IGNORECASE) else raw_tok.split("-")
        for sub in sub_tokens:
            if not sub:
                continue
            if is_whitelisted_title_caps_token(sub):
                continue
            letters = [c for c in sub if c.isalpha()]
            if not letters:
                continue
            if all(c.isupper() for c in letters):
                if len(letters) >= 5:
                    shouting_words.append(sub)
                elif len(letters) >= 3:
                    short_shouting_words.append(sub)

    for sw in shouting_words:
        violations.append({
            "code": "G4_SHOUTING_ALL_CAPS",
            "severity": "FAIL",
            "message": (
                f"Shouting ALL-CAPS word '{sw}' (>= 5 letters) in title violates shirt-and-tie editorial restraint."
            ),
        })
    if len(short_shouting_words) >= 3 and not shouting_words:
        violations.append({
            "code": "G4_SHOUTING_TITLE_RUN",
            "severity": "FAIL",
            "message": f"Title stacks {len(short_shouting_words)} uppercase non-acronym words ({', '.join(short_shouting_words)}).",
        })

    # 3. Staleness gate: reject 2021..2026 year stamps on ep_04..ep_30 (and default ad-hoc)
    ep_num = parse_episode_number(episode_id, episode_number)
    enforce_evergreen_year_ban = (ep_num is None) or (ep_num >= 4)
    for surface_name, content in surfaces:
        for ym in re.finditer(r"\b(202[1-6])\b", content):
            yr = ym.group(1)
            if enforce_evergreen_year_ban:
                violations.append({
                    "code": "G4_STALE_YEAR_STAMP",
                    "severity": "FAIL",
                    "message": (
                        f"Stale year stamp '{yr}' in {surface_name} on {episode_id or 'evergreen mode'} "
                        f"(2021..2026 stamps are banned across ep_04..ep_30)."
                    ),
                })
            else:
                warnings.append({
                    "code": "G4_LAUNCH_TRIO_PAST_YEAR",
                    "severity": "WARN",
                    "message": f"Past year stamp '{yr}' in {surface_name} on pre-recorded launch episode {episode_id}.",
                })

    # 4. Clickbait slop catalog
    for surface_name, content in surfaces:
        for label, pattern in CLICKBAIT_SLOP_PATTERNS:
            m = pattern.search(content)
            if m:
                violations.append({
                    "code": "G4_CLICKBAIT_SLOP",
                    "severity": "FAIL",
                    "message": f"Clickbait phrase '{m.group(0)}' ({label}) found in {surface_name}.",
                })

    # 5. Banned AI vocabulary & negative-contrast crutches
    for surface_name, content in surfaces:
        for wm in re.finditer(r"\b[A-Za-z]+(?:-[A-Za-z]+)*\b", content):
            tok = wm.group(0)
            if tok.lower() in BANNED_AI_WORDS:
                violations.append({
                    "code": "G4_BANNED_AI_WORD",
                    "severity": "FAIL",
                    "message": f"Banned AI vocabulary word '{tok}' found in {surface_name}.",
                })
        for label, pattern in BANNED_AI_PHRASES:
            pm = pattern.search(content)
            if pm:
                violations.append({
                    "code": "G4_BANNED_AI_PATTERN",
                    "severity": "FAIL",
                    "message": f"Banned AI pattern '{pm.group(0)}' ({label}) found in {surface_name}.",
                })

    return {
        "gate_id": "GATE_4_HYGIENE_AND_STALENESS",
        "passed": len(violations) == 0,
        "episode_number_resolved": ep_num,
        "evergreen_year_ban_active": enforce_evergreen_year_ban,
        "violations": violations,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# Gate 5 Helpers: Deterministic 0..100 Specificity Score
# ---------------------------------------------------------------------------

def evaluate_gate5_specificity(
    title: str,
    thumbnail_text: str,
    strict: bool = False,
) -> Dict[str, Any]:
    combined = f"{title} {thumbnail_text}"
    title_nums = extract_numeric_stems(title)
    thumb_nums = extract_numeric_stems(thumbnail_text)

    # Pillar A: Quantitative, Monetary, Rate, or Concrete Mechanism Anchor (0..40)
    pillar_a = 0
    has_currency = bool(re.search(r"\$\d", combined))
    has_percent_or_mult = bool(re.search(r"\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|\b1:1\b", combined, re.IGNORECASE))
    has_unit_or_year = bool(re.search(
        r"\b\d+(?:[.,]\d+)?\s*(?:-[A-Za-z]+|nm|gw|mw|twh|kw|yr|hr|min|mins|minute|minutes|sec|secs|second|seconds|day|days|week|weeks|month|months|year|years|k|m|b|t)\b|\b401\(k\)|\b20[23]\d\b",
        combined,
        re.IGNORECASE,
    ))
    has_spelled_num = bool(re.search(r"\b(?:zero|one|first|two|three|billion|trillion|million)\b", combined, re.IGNORECASE))

    if has_currency:
        pillar_a += 24
    if has_percent_or_mult:
        pillar_a += 22
    if has_unit_or_year:
        pillar_a += 22
    if pillar_a == 0 and (title_nums or thumb_nums):
        pillar_a += 24
    if pillar_a == 0 and has_spelled_num:
        pillar_a += 20
    if (len(title_nums) + len(thumb_nums)) >= 2:
        pillar_a += 16

    # Partial mechanism credit for concrete non-numeric statutory/physical collisions (e.g. Courtrooms, Fertilizer, Cartel)
    cleaned_combined = re.sub(r"401\(k\)s?", "401k", combined.replace("\u2019", "'"), flags=re.IGNORECASE)
    tokens_lower = [
        (t.lower()[:-2] if t.lower().endswith("'s") else t.lower().strip("'"))
        for t in re.findall(r"[A-Za-z0-9']+", cleaned_combined)
    ]
    stemmed_domain_pool = INSTITUTIONAL_DOMAIN_STEMS | {stem_content_word(x) for x in INSTITUTIONAL_DOMAIN_STEMS}
    matched_domain = sorted({
        tok for tok in tokens_lower
        if tok and (
            tok in stemmed_domain_pool
            or stem_content_word(tok) in stemmed_domain_pool
            or tok.upper() in WHITELISTED_TITLE_ACRONYMS
            or (len(tok) >= 3 and tok.upper() in SHORT_SAFE_ACRONYMS)
        )
    })
    if pillar_a == 0 and len(matched_domain) >= 3:
        pillar_a = 20

    pillar_a = min(40, pillar_a)

    # Pillar B: Institutional, Statutory, Hardware, and Balance-Sheet Nouns (0..35)
    if len(matched_domain) >= 3:
        pillar_b = 35
    elif len(matched_domain) == 2:
        pillar_b = 26
    elif len(matched_domain) == 1:
        pillar_b = 16
    else:
        pillar_b = 0

    # Pillar C: Causal, Interrogative, Colon-Ledger, and Asymmetric Collision Tension (0..25)
    pillar_c = 0
    title_words_lower = [w.lower().strip("?.,:") for w in title.strip().split() if w]
    has_question_or_if = (
        "?" in title
        or ":" in title
        or any(w in INTERROGATIVE_TRIGGERS for w in title_words_lower[:4])
    )
    matched_tension = sorted({
        tok for tok in tokens_lower if tok in TENSION_VERBS_AND_PIVOTS
    })

    if has_question_or_if:
        pillar_c += 15
    if matched_tension:
        pillar_c += 15
    pillar_c = min(25, pillar_c)

    # Vagueness deductions
    vagueness_penalty = 0
    vague_hits: List[str] = []
    for label, pat in VAGUE_FILLER_PATTERNS:
        m = pat.search(combined)
        if m:
            vagueness_penalty += 15
            vague_hits.append(m.group(0))

    score = max(0, min(100, pillar_a + pillar_b + pillar_c - vagueness_penalty))

    violations: List[Dict[str, str]] = []
    warnings: List[Dict[str, str]] = []

    if score < 50:
        violations.append({
            "code": "G5_LOW_SPECIFICITY",
            "severity": "FAIL",
            "message": (
                f"Specificity Score is {score}/100 (< 50 minimum floor); "
                f"add concrete dollar/percent figures, named institutions, and causal tension."
            ),
        })
    elif score < 65:
        entry = {
            "code": "G5_MODERATE_SPECIFICITY",
            "severity": "FAIL" if strict else "WARN",
            "message": f"Specificity Score is {score}/100 (below 65 --strict institutional benchmark).",
        }
        if strict:
            violations.append(entry)
        else:
            warnings.append(entry)

    return {
        "gate_id": "GATE_5_SPECIFICITY",
        "passed": len(violations) == 0,
        "specificity_score": score,
        "breakdown": {
            "quantitative_anchor_pts": pillar_a,
            "institutional_noun_pts": pillar_b,
            "causal_tension_pts": pillar_c,
            "vagueness_penalty_pts": vagueness_penalty,
        },
        "matched_domain_terms": matched_domain,
        "matched_tension_terms": matched_tension,
        "vague_hits": vague_hits,
        "violations": violations,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# Unified Pair & Vault Evaluation
# ---------------------------------------------------------------------------

def lint_pair(
    title: str,
    thumbnail_text: str,
    *,
    episode_id: Optional[str] = None,
    episode_number: Optional[int] = None,
    pair_id: str = "AD_HOC",
    variant_id: str = "A",
    background_hex: str = "#1C2B3A",
    text_hex: str = "#FAF8F3",
    accent_hex: Optional[str] = "#2F8F8B",
    element_count: int = 3,
    visual_composition_mode: Optional[str] = None,
    reported_char_count: Optional[int] = None,
    reported_word_count: Optional[int] = None,
    reported_contrast: Optional[float] = None,
    strict: bool = False,
) -> Dict[str, Any]:
    g1 = evaluate_gate1_truncation(title, strict=strict, reported_char_count=reported_char_count)
    g2 = evaluate_gate2_duplication(title, thumbnail_text)
    g3 = evaluate_gate3_thumb_and_contrast(
        thumbnail_text=thumbnail_text,
        background_hex=background_hex,
        text_hex=text_hex,
        element_count=element_count,
        accent_hex=accent_hex,
        reported_word_count=reported_word_count,
        reported_contrast=reported_contrast,
    )
    g4 = evaluate_gate4_hygiene(
        title=title,
        thumbnail_text=thumbnail_text,
        episode_id=episode_id,
        episode_number=episode_number,
    )
    g5 = evaluate_gate5_specificity(title=title, thumbnail_text=thumbnail_text, strict=strict)

    gates = [g1, g2, g3, g4, g5]
    all_violations: List[Dict[str, str]] = []
    all_warnings: List[Dict[str, str]] = []
    for g in gates:
        all_violations.extend(g["violations"])
        all_warnings.extend(g["warnings"])

    if visual_composition_mode is not None and visual_composition_mode not in VALID_COMPOSITION_MODES:
        all_warnings.append({
            "code": "SCHEMA_UNKNOWN_COMPOSITION_MODE",
            "severity": "WARN",
            "message": (
                f"visual_composition_mode '{visual_composition_mode}' is outside canonical set "
                f"{sorted(VALID_COMPOSITION_MODES)}."
            ),
        })

    passed = len(all_violations) == 0
    status = "PASS" if (passed and len(all_warnings) == 0) else ("WARN" if passed else "FAIL")

    return {
        "pair_id": pair_id,
        "episode_id": episode_id,
        "variant_id": variant_id,
        "title": title,
        "thumbnail_text": thumbnail_text,
        "visual_composition_mode": visual_composition_mode,
        "passed": passed,
        "status": status,
        "strict": strict,
        "specificity_score": g5["specificity_score"],
        "contrast_ratio": g3["contrast_ratio"],
        "wcag_tier": g3["wcag_tier"],
        "title_char_count": g1["char_count"],
        "thumbnail_word_count": g3["thumb_word_count"],
        "violation_count": len(all_violations),
        "warning_count": len(all_warnings),
        "violations": all_violations,
        "warnings": all_warnings,
        "gates": {
            "gate_1_truncation": g1,
            "gate_2_duplication": g2,
            "gate_3_thumb_wcag": g3,
            "gate_4_hygiene": g4,
            "gate_5_specificity": g5,
        },
    }


def lint_vault_data(vault_payload: Any, strict: bool = False, source_label: str = "<memory>") -> Dict[str, Any]:
    episodes: List[Dict[str, Any]]
    if isinstance(vault_payload, dict) and isinstance(vault_payload.get("episodes"), list):
        episodes = vault_payload["episodes"]
    elif isinstance(vault_payload, list):
        episodes = vault_payload
    else:
        raise ValueError("Vault JSON must contain a top-level 'episodes' array or be an array of episode records.")

    pair_results: List[Dict[str, Any]] = []
    schema_issues: List[Dict[str, str]] = []

    for ep_idx, ep in enumerate(episodes):
        ep_id = ep.get("episode_id", f"ep_{ep_idx + 1:02d}")
        ep_num = ep.get("episode_number")
        variants = ep.get("variants", [])
        if not isinstance(variants, list) or len(variants) == 0:
            schema_issues.append({
                "code": "VAULT_EMPTY_VARIANTS",
                "severity": "FAIL",
                "message": f"Episode {ep_id} contains no 'variants' list.",
            })
            continue

        seen_titles: Set[str] = set()
        seen_thumbs: Set[str] = set()

        for v_idx, var in enumerate(variants):
            var_id = str(var.get("variant_id", chr(65 + v_idx)))
            pair_id = str(var.get("pair_id", f"{ep_id}_{var_id}"))
            v_title = str(var.get("title", ""))
            v_thumb = str(var.get("thumbnail_text", ""))

            res = lint_pair(
                title=v_title,
                thumbnail_text=v_thumb,
                episode_id=ep_id,
                episode_number=ep_num,
                pair_id=pair_id,
                variant_id=var_id,
                background_hex=str(var.get("background_hex", "#1C2B3A")),
                text_hex=str(var.get("text_hex", "#FAF8F3")),
                accent_hex=var.get("accent_hex"),
                element_count=int(var.get("element_count", 3)),
                visual_composition_mode=var.get("visual_composition_mode"),
                reported_char_count=var.get("title_char_count"),
                reported_word_count=var.get("thumbnail_word_count"),
                reported_contrast=var.get("contrast_ratio"),
                strict=strict,
            )

            norm_t = v_title.strip().lower()
            norm_th = v_thumb.strip().lower()
            if norm_t in seen_titles:
                res["warnings"].append({
                    "code": "VAULT_DUPLICATE_VARIANT_TITLE",
                    "severity": "WARN",
                    "message": f"Episode {ep_id} repeats identical title across A/B/C variants.",
                })
                res["warning_count"] = len(res["warnings"])
                if res["passed"] and res["status"] == "PASS":
                    res["status"] = "WARN"
            seen_titles.add(norm_t)

            if norm_th in seen_thumbs:
                res["warnings"].append({
                    "code": "VAULT_DUPLICATE_VARIANT_THUMB",
                    "severity": "WARN",
                    "message": f"Episode {ep_id} repeats identical thumbnail_text across A/B/C variants.",
                })
                res["warning_count"] = len(res["warnings"])
                if res["passed"] and res["status"] == "PASS":
                    res["status"] = "WARN"
            seen_thumbs.add(norm_th)

            pair_results.append(res)

    total_pairs = len(pair_results)
    fail_pairs = [r for r in pair_results if not r["passed"]]
    warn_only_pairs = [r for r in pair_results if r["passed"] and r["warning_count"] > 0]
    clean_pass_pairs = [r for r in pair_results if r["passed"] and r["warning_count"] == 0]

    mean_spec = (
        round(sum(r["specificity_score"] for r in pair_results) / total_pairs, 2)
        if total_pairs > 0 else 0.0
    )
    valid_contrasts = [r["contrast_ratio"] for r in pair_results if r["contrast_ratio"] is not None]
    mean_contrast = (
        round(sum(valid_contrasts) / len(valid_contrasts), 2)
        if valid_contrasts else 0.0
    )

    gate_keys = [
        "gate_1_truncation",
        "gate_2_duplication",
        "gate_3_thumb_wcag",
        "gate_4_hygiene",
        "gate_5_specificity",
    ]
    gate_pass_counts = {
        gk: sum(1 for r in pair_results if r["gates"][gk]["passed"])
        for gk in gate_keys
    }

    overall_passed = (len(fail_pairs) == 0) and (len(schema_issues) == 0) and (total_pairs > 0)

    return {
        "gate": "PASS" if overall_passed else "FAIL",
        "passed": overall_passed,
        "strict": strict,
        "source": source_label,
        "summary": {
            "episodes_count": len(episodes),
            "pairs_audited": total_pairs,
            "passed_clean_count": len(clean_pass_pairs),
            "passed_with_warnings_count": len(warn_only_pairs),
            "failed_count": len(fail_pairs),
            "schema_issue_count": len(schema_issues),
            "mean_specificity_score": mean_spec,
            "mean_contrast_ratio": mean_contrast,
            "gate_pass_counts": gate_pass_counts,
        },
        "schema_issues": schema_issues,
        "results": pair_results,
    }


# ---------------------------------------------------------------------------
# Human-Readable CLI Formatting
# ---------------------------------------------------------------------------

def format_pair_human(res: Dict[str, Any]) -> str:
    lines: List[str] = []
    badge = f"[{res['status']}]"
    ep_str = f" ({res['episode_id']})" if res.get("episode_id") else ""
    lines.append(
        f"{badge} {res['pair_id']}{ep_str} | "
        f"Title ({res['title_char_count']}c): \"{res['title']}\" | "
        f"Thumb ({res['thumbnail_word_count']}w): \"{res['thumbnail_text']}\""
    )
    lines.append(
        f"  WCAG Contrast: {res['contrast_ratio']}:1 ({res['wcag_tier']}) | "
        f"Specificity: {res['specificity_score']}/100 | "
        f"Strict: {'ON' if res['strict'] else 'OFF'}"
    )
    g1_surfaces = res["gates"]["gate_1_truncation"]["surfaces"]
    surf_summary = ", ".join(
        f"{s['label']}={s['single_line_px']}px/{s['lines_used']}L({'CLIP' if s['truncated'] else 'FIT'})"
        for s in g1_surfaces
    )
    lines.append(f"  Viewports: {surf_summary}")
    for v in res["violations"]:
        lines.append(f"  [FAIL] {v['code']}: {v['message']}")
    for w in res["warnings"]:
        lines.append(f"  [WARN] {w['code']}: {w['message']}")
    return "\n".join(lines)


def format_vault_human(report: Dict[str, Any]) -> str:
    s = report["summary"]
    lines: List[str] = [
        f"=== The Reading Room Package Linter | GATE: {report['gate']} ===",
        f"Source           : {report['source']}",
        f"Episodes / Pairs : {s['episodes_count']} episodes / {s['pairs_audited']} pairs (strict={report['strict']})",
        f"Pass / Warn / Fail: {s['passed_clean_count']} clean | {s['passed_with_warnings_count']} warn | {s['failed_count']} fail",
        f"Mean Specificity : {s['mean_specificity_score']}/100 | Mean WCAG Contrast: {s['mean_contrast_ratio']}:1",
        "Gate Pass Totals : " + ", ".join(
            f"{k}={v}/{s['pairs_audited']}" for k, v in s["gate_pass_counts"].items()
        ),
    ]
    for issue in report["schema_issues"]:
        lines.append(f"  [SCHEMA FAIL] {issue['code']}: {issue['message']}")

    flagged = [r for r in report["results"] if (not r["passed"]) or r["warning_count"] > 0]
    if flagged:
        lines.append("")
        lines.append("--- Flagged Pairs (Violations & Advisories) ---")
        for r in flagged:
            lines.append(format_pair_human(r))
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Built-In Deterministic Self-Test Suite (--self-test)
# ---------------------------------------------------------------------------

def run_self_tests() -> Tuple[bool, List[Dict[str, Any]]]:
    checks: List[Dict[str, Any]] = []

    def record(name: str, condition: bool, detail: str = "") -> None:
        checks.append({"test": name, "passed": bool(condition), "detail": detail})

    # Test 1: Canonical Ep 01 pair passes cleanly in --strict with AAA contrast & high specificity
    r1 = lint_pair(
        title="If AI Takes Jobs, Who Pays $40.5T Debt?",
        thumbnail_text="86% WAGES",
        episode_id="ep_01",
        background_hex="#1C2B3A",
        text_hex="#FAF8F3",
        accent_hex="#2F8F8B",
        element_count=3,
        visual_composition_mode="shirt_and_tie_plus_artifact",
        strict=True,
    )
    record(
        "T01_canonical_strict_pass",
        r1["passed"] and r1["wcag_tier"] == "AAA" and r1["specificity_score"] >= 85,
        f"status={r1['status']}, contrast={r1['contrast_ratio']}, spec={r1['specificity_score']}",
    )

    # Test 2: Milk-page inverse palette (#FAF8F3 bg, #1C2B3A text) WCAG symmetry
    r2 = lint_pair(
        title="Big Tech's $176B AI Profit Trick?",
        thumbnail_text="6-YR FOOTNOTE",
        episode_id="ep_03",
        background_hex="#FAF8F3",
        text_hex="#1C2B3A",
        accent_hex="#A3402E",
        element_count=2,
        visual_composition_mode="milk_page_data_split",
        strict=True,
    )
    record(
        "T02_milk_page_palette_symmetry",
        r2["passed"] and r2["contrast_ratio"] == r1["contrast_ratio"] and r2["contrast_ratio"] >= 13.0,
        f"contrast={r2['contrast_ratio']}",
    )

    # Test 3: Gate 1 strict band rejects 28-char title in --strict while allowing in standard mode
    r3_std = lint_pair(
        title="Who Pays $40.5T Debt Today?",  # 27 chars
        thumbnail_text="86% WAGES",
        episode_id="ep_01",
        strict=False,
    )
    r3_strict = lint_pair(
        title="Who Pays $40.5T Debt Today?",  # 27 chars
        thumbnail_text="86% WAGES",
        episode_id="ep_01",
        strict=True,
    )
    record(
        "T03_gate1_strict_band_enforcement",
        r3_std["passed"] and (not r3_strict["passed"]) and any(
            v["code"] == "G1_CHAR_OUTSIDE_TARGET_BAND" for v in r3_strict["violations"]
        ),
        f"chars={r3_std['title_char_count']}, std={r3_std['passed']}, strict={r3_strict['passed']}",
    )

    # Test 4: Gate 1 hard character bounds (<24 and >52) fail even without --strict
    r4_short = lint_pair(title="Who Pays $40T Debt?", thumbnail_text="86% WAGES", strict=False)
    r4_long = lint_pair(
        title="If Autonomous Agents Take White-Collar Jobs Who Pays $40.5T Debt?",
        thumbnail_text="86% WAGES",
        strict=False,
    )
    record(
        "T04_gate1_hard_char_bounds",
        (not r4_short["passed"]) and (not r4_long["passed"]),
        f"short={r4_short['title_char_count']}c, long={r4_long['title_char_count']}c",
    )

    # Test 5: Gate 1 proportional pixel truncation catches ultra-wide glyph string <= 52 chars
    wide_title = "WWWW MMMM GGGG OOOO QQQQ WWWW MMMM GGGG OOOO $40T?"  # 50 chars, extreme width
    r5 = lint_pair(title=wide_title, thumbnail_text="86% WAGES", strict=False)
    record(
        "T05_gate1_proportional_pixel_truncation",
        len(wide_title) <= 52 and any("G1_PIXEL_TRUNCATION_" in v["code"] for v in r5["violations"]),
        f"len={len(wide_title)}, codes={[v['code'] for v in r5['violations']]}",
    )

    # Test 6: Gate 2 numeric deduplication ($40.5T + 86% = PASS; $40T + $40T = FAIL; $40.5T + $40T = FAIL)
    r6_pass = lint_pair(title="If AI Takes Jobs, Who Pays $40.5T Debt?", thumbnail_text="86% WAGES")
    r6_exact_fail = lint_pair(title="Who Buys America's $40T Debt Now?", thumbnail_text="$40T HOLE")
    r6_round_fail = lint_pair(title="If AI Takes Jobs, Who Pays $40.5T Debt?", thumbnail_text="$40T IOUS")
    record(
        "T06_gate2_numeric_stem_deduplication",
        r6_pass["passed"]
        and any(v["code"] == "G2_DUPLICATE_NUMERIC_STEM" for v in r6_exact_fail["violations"])
        and any(v["code"] == "G2_DUPLICATE_NUMERIC_STEM" for v in r6_round_fail["violations"]),
        "verified $40.5T+86% PASS and $40T/$40.5T+$40T FAIL",
    )

    # Test 7: Gate 2 morphological content-word stem deduplication (Banks vs BANKING = FAIL; function words = PASS)
    r7_dup = lint_pair(title="Why Banks Keep Money Stolen by AI", thumbnail_text="BANKING LOOPHOLE")
    r7_func = lint_pair(title="Why Banks Keep Money Stolen by AI", thumbnail_text="WHY ZERO REFUND")
    record(
        "T07_gate2_content_stem_vs_function_words",
        any(v["code"] == "G2_DUPLICATE_CONTENT_STEM" for v in r7_dup["violations"]) and r7_func["passed"],
        f"dup_stems={r7_dup['gates']['gate_2_duplication']['shared_content_stems']}, func_pass={r7_func['passed']}",
    )

    # Test 8: Gate 3 thumb word budget (0 words, 4 words, >20 chars), element_count > 3, and low WCAG contrast
    r8_4w = lint_pair(title="Who Buys America's $40T Debt Now?", thumbnail_text="NO ONE BUYS THIS")
    r8_elem = lint_pair(title="Who Buys America's $40T Debt Now?", thumbnail_text="93-DAY TRAP", element_count=4)
    r8_wcag = lint_pair(
        title="Who Buys America's $40T Debt Now?",
        thumbnail_text="93-DAY TRAP",
        background_hex="#FAF8F3",
        text_hex="#2F8F8B",  # ~3.65:1 < 4.5 AA minimum
    )
    record(
        "T08_gate3_budget_and_wcag_failure",
        any(v["code"] == "G3_THUMB_OVER_3_WORDS" for v in r8_4w["violations"])
        and any(v["code"] == "G3_ELEMENT_COUNT_OVER_BUDGET" for v in r8_elem["violations"])
        and any(v["code"] == "G3_WCAG_CONTRAST_FAIL" for v in r8_wcag["violations"]),
        f"teal_on_cream_contrast={r8_wcag['contrast_ratio']}",
    )

    # Test 9: Gate 4 acronym whitelist vs shouting ALL-CAPS >=5 letters in title
    r9_acronyms = lint_pair(
        title="GENIUS, ERCOT, SWIFT & TSMC 401(k) Math",
        thumbnail_text="86% LOCKED",
        episode_id="ep_08",
        strict=True,
    )
    r9_shout = lint_pair(
        title="Why ERCOT Grid Locks CRASH Texas Power",
        thumbnail_text="128 WEEKS",
        episode_id="ep_08",
    )
    record(
        "T09_gate4_acronym_whitelist_vs_shouting",
        r9_acronyms["passed"]
        and any(v["code"] == "G4_SHOUTING_ALL_CAPS" for v in r9_shout["violations"]),
        f"acronyms_pass={r9_acronyms['passed']}, shout_codes={[v['code'] for v in r9_shout['violations']]}",
    )

    # Test 10: Gate 4 stale year stamps (2021..2026 rejected on ep_04..ep_30; forward 2030/2032 allowed)
    r10_stale = lint_pair(
        title="Why the 2025 AI Debt Bubble Hit SaaS",
        thumbnail_text="88% PIK IOUS",
        episode_id="ep_05",
    )
    r10_forward = lint_pair(
        title="The 2032 Social Security Cut Clock",
        thumbnail_text="-24% CHECKS",
        episode_id="ep_30",
        strict=True,
    )
    record(
        "T10_gate4_staleness_vs_forward_horizon",
        any(v["code"] == "G4_STALE_YEAR_STAMP" for v in r10_stale["violations"]) and r10_forward["passed"],
        f"stale_pass={r10_stale['passed']}, forward_2032_pass={r10_forward['passed']}",
    )

    # Test 11: Gate 4 punctuation, clickbait slop, and banned AI vocabulary
    r11 = lint_pair(
        title="The Shocking Secret Paradigm — Delve In!",
        thumbnail_text="IT'S OVER...",
        episode_id="ep_10",
    )
    r11_codes = {v["code"] for v in r11["violations"]}
    record(
        "T11_gate4_punctuation_clickbait_banned_ai",
        {"G4_EXCLAMATION_MARK", "G4_EM_DASH", "G4_ASCII_ELLIPSIS", "G4_CLICKBAIT_SLOP", "G4_BANNED_AI_WORD"}.issubset(
            r11_codes
        ),
        f"codes={sorted(r11_codes)}",
    )

    # Test 12: Gate 5 specificity rejects vague filler packaging
    r12 = lint_pair(
        title="The Modern Impact of Software Things",
        thumbnail_text="NEW SHIFT",
        episode_id="ep_12",
        strict=True,
    )
    record(
        "T12_gate5_vague_specificity_fail",
        (not r12["passed"]) and r12["specificity_score"] < 50,
        f"vague_spec={r12['specificity_score']}",
    )

    # Test 13: All 30 canonical working titles in slate_30_jan2028.json pass when paired with non-overlapping thumbs
    slate_path = REPO_ROOT / "02_research_and_data" / "slate_30_jan2028.json"
    if slate_path.is_file():
        slate_eps = json.loads(slate_path.read_text(encoding="utf-8"))
        companion_thumbs = {
            "ep_01": "86% WAGES", "ep_02": "93-DAY TRAP", "ep_03": "6-YR FOOTNOTE",
            "ep_04": "-19% HIRING", "ep_05": "88% PIK IOUS", "ep_06": "5X EXIT",
            "ep_07": "$0 REFUND", "ep_08": "+833% POWER", "ep_09": "87% EXPLOITED",
            "ep_10": "$4.04T FLIGHT", "ep_11": "42.5% STUCK", "ep_12": "-55% SIGNAL",
            "ep_13": "72% REFINED", "ep_14": "80% HERDING", "ep_15": "$10T SHOCK",
            "ep_16": "NO EXPORT LADDER", "ep_17": "+29% ESCROW", "ep_18": "ZERO PRIVILEGE",
            "ep_19": "$2.1M SHOT", "ep_20": "GAG STATUTE", "ep_21": "$100K PROOF",
            "ep_22": "SHARED WEIGHTS", "ep_23": "$100B SYNDICATE", "ep_24": "WIRETAP KEY",
            "ep_25": "33B GALLONS", "ep_26": "0% FICA", "ep_27": "550 FIBERS",
            "ep_28": "DEC 2027 LAW", "ep_29": "HARVEST NOW", "ep_30": "-24% CHECKS",
        }
        synthetic_vault = {
            "episodes": [
                {
                    "episode_id": ep["episode_id"],
                    "episode_number": ep["episode_number"],
                    "variants": [
                        {
                            "pair_id": f"{ep['episode_id']}_A",
                            "variant_id": "A",
                            "title": ep["working_title"],
                            "title_char_count": len(ep["working_title"]),
                            "thumbnail_text": companion_thumbs[ep["episode_id"]],
                            "thumbnail_word_count": len(companion_thumbs[ep["episode_id"]].split()),
                            "visual_composition_mode": "shirt_and_tie_plus_artifact",
                            "element_count": 3,
                            "background_hex": "#1C2B3A",
                            "accent_hex": "#2F8F8B",
                            "text_hex": "#FAF8F3",
                            "contrast_ratio": 13.59,
                        }
                    ],
                }
                for ep in slate_eps
            ]
        }
        v_rep = lint_vault_data(synthetic_vault, strict=True, source_label="slate_30_synthetic_verification")
        record(
            "T13_all_30_slate_titles_strict_vault_pass",
            v_rep["passed"] and v_rep["summary"]["pairs_audited"] == 30 and v_rep["summary"]["failed_count"] == 0,
            f"audited={v_rep['summary']['pairs_audited']}, failed={v_rep['summary']['failed_count']}, mean_spec={v_rep['summary']['mean_specificity_score']}",
        )

    all_ok = all(c["passed"] for c in checks)
    return all_ok, checks


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------

def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="package_lint.py",
        description=(
            "Deterministic 5-gate YouTube Title & Thumbnail Linter for "
            "The Reading Room Editorial OS (Deliverable #17)."
        ),
    )
    parser.add_argument(
        "--vault",
        type=str,
        default=None,
        help=f"Path to vault JSON file (default: {DEFAULT_VAULT_PATH.relative_to(REPO_ROOT).as_posix()}).",
    )
    parser.add_argument("--title", type=str, default=None, help="Ad-hoc YouTube video title string to lint.")
    parser.add_argument("--thumb", type=str, default=None, help="Ad-hoc 1..3 word thumbnail overlay text.")
    parser.add_argument(
        "--episode-id",
        type=str,
        default=None,
        help="Optional episode ID (e.g., ep_01 or ep_04; ep_04..ep_30 enforce 2021..2026 year-stamp ban).",
    )
    parser.add_argument(
        "--bg",
        type=str,
        default="#1C2B3A",
        help="Thumbnail background hex color (default: #1C2B3A).",
    )
    parser.add_argument(
        "--fg",
        "--text-hex",
        dest="fg",
        type=str,
        default="#FAF8F3",
        help="Thumbnail foreground text hex color (default: #FAF8F3).",
    )
    parser.add_argument(
        "--accent",
        type=str,
        default="#2F8F8B",
        help="Optional thumbnail accent hex color (default: #2F8F8B).",
    )
    parser.add_argument(
        "--elements",
        type=int,
        default=3,
        help="Visual focal element count on thumbnail (default: 3; ceiling: 3).",
    )
    parser.add_argument(
        "--composition",
        type=str,
        default=None,
        help="Optional visual_composition_mode value to validate.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Enforce strict 31..42 title character band and >=65 specificity benchmark.",
    )
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="Run the deterministic built-in 13-case verification suite and exit.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON report to stdout.",
    )
    return parser


def resolve_vault_path(raw_vault_arg: Optional[str]) -> Path:
    if raw_vault_arg:
        candidate = Path(raw_vault_arg)
        if candidate.is_file():
            return candidate.resolve()
        repo_rel = REPO_ROOT / raw_vault_arg
        if repo_rel.is_file():
            return repo_rel.resolve()
        return candidate
    return DEFAULT_VAULT_PATH


def main(argv: Optional[List[str]] = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = build_arg_parser()
    args = parser.parse_args(argv)

    # Mode 1: Built-in self-test suite
    if args.self_test:
        passed, checks = run_self_tests()
        payload = {
            "gate": "PASS" if passed else "FAIL",
            "mode": "self-test",
            "passed": passed,
            "total_tests": len(checks),
            "passed_tests": sum(1 for c in checks if c["passed"]),
            "checks": checks,
        }
        if args.json:
            print(json.dumps(payload, indent=2))
        else:
            print(
                f"=== package_lint.py --self-test | GATE: {payload['gate']} "
                f"({payload['passed_tests']}/{payload['total_tests']} passed) ==="
            )
            for c in checks:
                mark = "PASS" if c["passed"] else "FAIL"
                print(f"  [{mark}] {c['test']}: {c['detail']}")
        return 0 if passed else 1

    # Mode 2: Single ad-hoc pair lint
    if args.title is not None or args.thumb is not None:
        if args.title is None or args.thumb is None:
            parser.error("Ad-hoc mode requires both --title and --thumb.")
        res = lint_pair(
            title=args.title,
            thumbnail_text=args.thumb,
            episode_id=args.episode_id,
            pair_id="AD_HOC_PAIR",
            variant_id="AD_HOC",
            background_hex=args.bg,
            text_hex=args.fg,
            accent_hex=args.accent,
            element_count=args.elements,
            visual_composition_mode=args.composition,
            strict=args.strict,
        )
        if args.json:
            print(json.dumps({"gate": "PASS" if res["passed"] else "FAIL", "result": res}, indent=2))
        else:
            print(format_pair_human(res))
        return 0 if res["passed"] else 1

    # Mode 3: Vault JSON audit
    vault_path = resolve_vault_path(args.vault)
    if not vault_path.is_file():
        err_obj = {
            "gate": "FAIL",
            "error": f"Vault file not found at '{vault_path}'. Pass --vault <path>, --title/--thumb, or --self-test.",
        }
        if args.json:
            print(json.dumps(err_obj, indent=2))
        else:
            print(f"[ERROR] {err_obj['error']}", file=sys.stderr)
        return 2

    try:
        raw_data = json.loads(vault_path.read_text(encoding="utf-8"))
        report = lint_vault_data(raw_data, strict=args.strict, source_label=str(vault_path))
    except Exception as exc:
        if args.json:
            print(json.dumps({"gate": "FAIL", "error": str(exc)}, indent=2))
        else:
            print(f"[ERROR] Failed to parse or lint vault '{vault_path}': {exc}", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(format_vault_human(report))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
