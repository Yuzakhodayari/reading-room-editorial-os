#!/usr/bin/env python3
"""
Automated Staleness and Decay Scorer for The Reading Room Editorial OS (Deliverable #14).

Audits master slate JSON files, episode research dossiers, and spoken Markdown scripts
across five deterministic decay-detection gates:
  Gate 1: Relative Temporal Trap Detector (unanchored perishable calendar phrases;
          honors explicit pre_recorded_launch_trio cold-open exemptions on ep_01..ep_03).
  Gate 2: Title Year-Stamp and Retro-Scandal Detector (2021-2026 stamps in evergreen
          ep_04..ep_30 titles; standalone 2022-2024 retro-scandal framing without a
          2027-2036 structural horizon).
  Gate 3: Brittle Model-Version Gimmick Detector (point-release benchmark hooks,
          leaderboard swaps, and prompt-hack tutorials).
  Gate 4: [LIVE_STAT_SLOT] Binding Checker (verifies volatile macro/market metrics carry
          [LIVE_STAT_SLOT:...] bindings or verified fact_ledger_ids).
  Gate 5: Late-2027 Staleness Immunity Proof Checker (verifies slate entries carry a
          substantive late_2027_staleness_immunity_proof >= 20 words and a 2027-2036
          structural horizon).

Computes per-item decay_risk_score (0..100): 0 = IMMUNE, 1..15 = LOW_DRIFT, 16+ = STALE_RISK.
"""

from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass, field
import json
import pathlib
import re
import sys
from typing import Any

EPISODE_NUM_RE = re.compile(r"(?:^|[^a-z0-9])ep[_-]?0*([1-9]|[12]\d|30)(?:[^0-9]|$)", re.IGNORECASE)
LIVE_SLOT_TOKEN_RE = re.compile(r"\[LIVE_STAT_SLOT:([A-Z0-9_]{4,64})\]")
ANY_LIVE_SLOT_BRACKET_RE = re.compile(r"\[LIVE_STAT_SLOT(?::[^\]]*)?\]", re.IGNORECASE)
BARE_SLOT_ID_RE = re.compile(r"^[A-Z][A-Z0-9_]{3,63}$")
FACT_ID_RE = re.compile(r"\b(FL-\d{3})\b")
WORD_TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9'/-]*")
PLACEHOLDER_RE = re.compile(r"\b(?:TODO|TBD|FIXME|PLACEHOLDER|LOREM IPSUM)\b", re.IGNORECASE)
HORIZON_YEAR_RE = re.compile(r"\b(20(?:2[7-9]|3[0-6]))\b")
YEAR_RANGE_RE = re.compile(r"\b(20\d{2})\s*(?:[-\u2013\u2014]|to|through)\s*(20\d{2})\b", re.IGNORECASE)
TITLE_STALE_YEAR_RE = re.compile(r"\b(?:FY\s*|Q[1-4]\s*)?(202[1-6])\b", re.IGNORECASE)

GATE1_HARD_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("this week", re.compile(r"\bthis\s+week\b", re.IGNORECASE)),
    ("last week", re.compile(r"\blast\s+week\b", re.IGNORECASE)),
    ("earlier this week", re.compile(r"\bearlier\s+this\s+week\b", re.IGNORECASE)),
    ("this month", re.compile(r"\bthis\s+month\b", re.IGNORECASE)),
    ("last month", re.compile(r"\blast\s+month\b", re.IGNORECASE)),
    ("earlier this year", re.compile(r"\bearlier\s+this\s+year\b", re.IGNORECASE)),
    ("early this year", re.compile(r"\bearly\s+this\s+year\b", re.IGNORECASE)),
    ("yesterday", re.compile(r"\byesterday\b(?!\s*['\u2019]s\s+(?:numbers?|prices?|wages?|dollars?|contracts?|ledgers?|rates?|math|rules?|debts?))", re.IGNORECASE)),
    ("right now in 2021-2026", re.compile(r"\bright\s+now\s+in\s+202[1-6]\b", re.IGNORECASE)),
    ("breaking today", re.compile(r"\bbreaking\s+(?:today|this\s+morning|tonight|news\s+today)\b", re.IGNORECASE)),
    ("just announced", re.compile(r"\bjust\s+(?:announced|dropped|launched|released)(?:\s+today|\s+this\s+morning|\s+yesterday)?\b", re.IGNORECASE)),
    ("this morning", re.compile(r"\bthis\s+morning\b", re.IGNORECASE)),
    ("earlier today", re.compile(r"\bearlier\s+today\b", re.IGNORECASE)),
)
GATE1_SOFT_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("in recent weeks/days", re.compile(r"\bin\s+recent\s+(?:weeks|days)\b", re.IGNORECASE)),
    ("just days/weeks ago", re.compile(r"\b(?:just\s+)?(?:a\s+few\s+)?(?:days|weeks)\s+ago\b", re.IGNORECASE)),
)
RETRO_SCANDAL_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("FTX / Sam Bankman-Fried", re.compile(r"\b(?:FTX|Sam\s+Bankman[-\s]Fried|Alameda\s+Research)\b", re.IGNORECASE)),
    ("2022 crypto lending collapse", re.compile(r"\b(?:Terra\s*Luna|TerraUSD|Celsius\s+Network|Three\s+Arrows\s+Capital|BlockFi|2022\s+crypto\s+(?:crash|winter|collapse|freeze|contagion))\b", re.IGNORECASE)),
    ("2023 regional bank run", re.compile(r"\b(?:Silicon\s+Valley\s+Bank|SVB|Signature\s+Bank|First\s+Republic\s+Bank|Silvergate|(?:March\s+)?2023\s+bank(?:ing)?\s+(?:run|crisis|collapse))\b", re.IGNORECASE)),
    ("2023 boardroom/chatbot nostalgia", re.compile(r"\b(?:November\s+2023\s+board(?:room)?|early\s+2023\s+chatbot)\b", re.IGNORECASE)),
)
RETRO_POSTMORTEM_RE = re.compile(
    r"\b(?:how|why|inside|story\s+of|anatomy\s+of)\b[^.?!]{0,60}"
    r"\b(?:FTX|Silicon\s+Valley\s+Bank|SVB|Terra|Celsius|Sam\s+Bankman[-\s]Fried|2022\s+crypto|2023\s+bank)\b"
    r"[^.?!]{0,45}\b(?:collapsed|collapse|failed|failure|imploded|crashed|run|crisis)\b",
    re.IGNORECASE,
)
GATE3_GIMMICK_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("beats rival model checkpoint", re.compile(r"\b(?:beats?|crushes|destroys|dethrones|outperforms|kills)\s+(?:GPT-[0-9A-Za-z.-]+|Claude\s*[0-9A-Za-z.\s]*(?:Sonnet|Opus|Haiku)?|Gemini\s*[0-9A-Za-z.-]*|Llama\s*[0-9A-Za-z.-]*|DeepSeek[-\s]?[0-9A-Za-z.-]*|Grok\s*[0-9A-Za-z.-]*|o1(?:-preview|-mini)?|o3(?:-mini)?)\b", re.IGNORECASE)),
    ("model-version trick or hack", re.compile(r"\b(?:GPT-[0-9A-Za-z.-]+|Claude\s*[0-9A-Za-z.\s]*(?:Sonnet|Opus|Haiku)?|Gemini\s*[0-9A-Za-z.-]*|Llama\s*[0-9A-Za-z.-]*|DeepSeek[-\s]?[0-9A-Za-z.-]*|ChatGPT)\s+(?:trick|tricks|hack|hacks|cheat\s*code|secret\s+prompt|jailbreak|hidden\s+feature)\b", re.IGNORECASE)),
    ("new benchmark or leaderboard crown", re.compile(r"\b(?:new\s+(?:benchmark|arena|leaderboard|coding|AI|LLM)\s+(?:leader|king|champion|crown|#1|number\s+one)|(?:Chatbot\s+Arena|LMSYS\s+Arena|SWE-bench|MMLU|HumanEval|LiveBench)\s+(?:leaderboard|crown|#1|winner|top\s+spot|shakeup))\b", re.IGNORECASE)),
    ("prompt-hack tutorial gimmick", re.compile(r"\b(?:prompt\s+hacks?|prompt\s+engineering\s+tricks?|secret\s+prompts?|god[-\s]?mode\s+prompts?|mega[-\s]?prompts?)\b", re.IGNORECASE)),
    ("checkpoint-versus-checkpoint shootout", re.compile(r"\b(?:GPT-4o?|GPT-4\.5|Claude\s+3(?:\.\d+)?(?:\s+(?:Sonnet|Opus|Haiku))?|Gemini\s+[12](?:\.\d+)?(?:\s+Pro|\s+Flash)?|Llama\s+3(?:\.\d+)?|DeepSeek[-\s]?R1|DeepSeek[-\s]?V3)\s+(?:vs\.?|versus)\s+(?:GPT-[0-9A-Za-z.-]+|Claude\s*[0-9A-Za-z.-]*|Gemini\s*[0-9A-Za-z.-]*|Llama\s*[0-9A-Za-z.-]*|DeepSeek[-\s]?[0-9A-Za-z.-]*|Grok\s*[0-9A-Za-z.-]*)\b", re.IGNORECASE)),
)
TITLE_POINT_MODEL_RE = re.compile(
    r"\b(?:GPT-3\.5|GPT-4o?|GPT-4\.5|o1-preview|o3-mini|Claude\s+3(?:\.\d+)?(?:\s+(?:Sonnet|Opus|Haiku))?|"
    r"Gemini\s+1\.5|Gemini\s+2\.0|Llama\s+3(?:\.\d+)?|DeepSeek[-\s]?R1|DeepSeek[-\s]?V3)\b",
    re.IGNORECASE,
)
VOLATILE_SERIES_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("sovereign_or_household_debt_total", re.compile(r"(?:\$\d[\d,.]*\s*(?:trillion|billion|T|B)\b[^.?!;\n]{0,65}\b(?:gross\s+federal\s+debt|national\s+debt|public\s+debt|household\s+debt|student\s+(?:loan\s+)?debt|Treasury\s+holdings|net\s+interest)\b|\b(?:gross\s+federal\s+debt|national\s+debt|public\s+debt|household\s+debt|student\s+(?:loan\s+)?debt|Treasury\s+holdings|net\s+interest(?:\s+outlays?)?)\b[^.?!;\n]{0,65}\$\d[\d,.]*\s*(?:trillion|billion|T|B)\b)", re.IGNORECASE)),
    ("market_yield_rate_or_auction", re.compile(r"(?:\b(?:JGB\s+yields?|Treasury\s+yields?|(?:10|30)-year\s+(?:JGB|Treasury|bond)\s+yields?|policy\s+rate|overnight\s+rate|default\s+rate|PCDR|capacity\s+auction|clearing\s+prices?)\b[^.?!;\n]{0,65}(?:\d+(?:\.\d+)?\s*(?:%|percent|bps)|\$\d[\d,.]*(?:/MW-day|\s+per\s+megawatt-day))|(?:\d+(?:\.\d+)?\s*(?:%|percent)|\$\d[\d,.]*(?:/MW-day|\s+per\s+megawatt-day))\b[^.?!;\n]{0,55}\b(?:JGB\s+yields?|Treasury\s+yields?|policy\s+rate|default\s+rate|PCDR|clearing\s+prices?)\b)", re.IGNORECASE)),
    ("capex_fcf_rpo_or_aum_run_rate", re.compile(r"(?:\$\d[\d,.]*\s*(?:trillion|billion|T|B)\b[^.?!;\n]{0,65}\b(?:annual(?:ized)?\s+capex|hyperscaler\s+capex|capital\s+expenditures?|AI\s+and\s+cloud\s+infrastructure|free\s+cash\s+flow|TTM\s+FCF|RPO|remaining\s+performance\s+obligations|private\s+credit|401\(k\)\s+assets?|SWF\s+AUM|T-bill\s+reserves?|USDC\s+circulation|zero-yield\s+deposits?)\b|\b(?:annual(?:ized)?\s+capex|hyperscaler\s+capex|capital\s+expenditures?|free\s+cash\s+flow|TTM\s+FCF|RPO|remaining\s+performance\s+obligations|private\s+credit|401\(k\)\s+assets?|SWF\s+AUM|T-bill\s+reserves?|USDC\s+circulation|zero-yield\s+deposits?)\b[^.?!;\n]{0,65}\$\d[\d,.]*\s*(?:trillion|billion|T|B)\b)", re.IGNORECASE)),
    ("sar_fraud_or_patch_count", re.compile(r"(?:\b(?:FinCEN|SARs?|Suspicious\s+Activity\s+Reports?|FTC\s+(?:annual\s+)?fraud(?:\s+losses)?|KEV\s+patch(?:ing)?)\b[^.?!;\n]{0,65}\b(?:\$?\d[\d,.]*\s*(?:million|billion|M|B|days)\b)|\b(?:\$?\d[\d,.]*\s*(?:million|billion|M|B))\b[^.?!;\n]{0,50}\b(?:SARs?|Suspicious\s+Activity\s+Reports?|fraud\s+losses)\b)", re.IGNORECASE)),
    ("bot_traffic_or_grid_share", re.compile(r"(?:\b(?:bot[-\s]traffic|automated\s+bot(?:\s+requests|\s+traffic)?|Imperva\s+bot|automated\s+equity\s+volume|transformer\s+lead\s+times?|grid\s+gap)\b[^.?!;\n]{0,65}\b(?:\d+(?:\.\d+)?\s*(?:%|percent|GW|gigawatts|weeks))|\b(?:\d+(?:\.\d+)?\s*(?:%|percent))\b[^.?!;\n]{0,45}\b(?:bot[-\s]traffic|automated\s+bots?|bot\s+share|automated\s+equity\s+volume)\b)", re.IGNORECASE)),
)

META_SKIP_KEYS: frozenset[str] = frozenset({
    "late_2027_staleness_immunity_proof", "staleness_immunity_proof", "refresh_instructions",
    "kill_gates", "anti_angle", "rejected_angle", "adversarial_caveat",
})
COLD_OPEN_KEYS: frozenset[str] = frozenset({
    "cold_open", "cold_open_hook", "hook", "opening_hook",
    "cold_open_bridge", "cold_open_receipt", "hook_summary",
})
TITLE_KEYS: tuple[str, ...] = ("title", "working_title", "episode_title", "youtube_title", "packaging_title")


@dataclass
class GateFinding:
    gate: str
    severity: str
    points: int
    field_or_loc: str
    snippet: str
    message: str


@dataclass
class ItemAuditResult:
    item_id: str
    title: str
    source_kind: str
    is_evergreen: bool
    is_launch_trio_exempt_eligible: bool
    decay_risk_score: int
    hard_gate_score: int
    soft_drift_score: int
    classification: str
    gate_scores: dict[str, int] = field(default_factory=dict)
    live_stat_slots_bound: list[str] = field(default_factory=list)
    fact_ledger_ids_bound: list[str] = field(default_factory=list)
    immunity_proof_words: int | None = None
    has_forward_horizon_2027_2036: bool = False
    exemptions: list[str] = field(default_factory=list)
    findings: list[GateFinding] = field(default_factory=list)


@dataclass
class LedgerContext:
    loaded: bool = False
    facts_by_id: dict[str, dict[str, Any]] = field(default_factory=dict)
    live_slot_ids: set[str] = field(default_factory=set)
    episode_has_live_slots: set[str] = field(default_factory=set)
    episode_live_anchors: dict[str, list[str]] = field(default_factory=dict)


def load_ledger_context(ledger_path: pathlib.Path | None) -> LedgerContext:
    ctx = LedgerContext()
    if ledger_path is None or not ledger_path.is_file():
        return ctx
    try:
        data = json.loads(ledger_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return ctx
    facts = data.get("facts")
    if not isinstance(facts, list):
        return ctx
    ctx.loaded = True
    for row in facts:
        if not isinstance(row, dict) or not isinstance(row.get("fact_id"), str):
            continue
        fid = row["fact_id"]
        ctx.facts_by_id[fid] = row
        is_live = row.get("is_live_stat_slot") is True
        for slot_id in LIVE_SLOT_TOKEN_RE.findall(str(row.get("refresh_instructions", ""))):
            ctx.live_slot_ids.add(slot_id)
        anchors = [str(a).lower() for a in row.get("script_anchors", []) if isinstance(a, str) and a.strip()]
        for ep in row.get("episode_refs", []) if isinstance(row.get("episode_refs"), list) else []:
            ep_norm = normalize_episode_id(ep)
            if ep_norm and is_live:
                ctx.episode_has_live_slots.add(ep_norm)
            if ep_norm and anchors:
                ctx.episode_live_anchors.setdefault(ep_norm, []).extend(anchors)
    return ctx


def normalize_episode_id(raw: Any) -> str | None:
    if isinstance(raw, int) and 1 <= raw <= 30:
        return f"ep_{raw:02d}"
    if not isinstance(raw, str):
        return None
    stripped = raw.strip()
    if stripped.isdigit() and 1 <= int(stripped) <= 30:
        return f"ep_{int(stripped):02d}"
    match = EPISODE_NUM_RE.search(stripped)
    return f"ep_{int(match.group(1)):02d}" if match else None


def episode_number(ep_id: str | None) -> int | None:
    if not ep_id or not ep_id.startswith("ep_"):
        return None
    try:
        return int(ep_id.split("_", 1)[1])
    except (IndexError, ValueError):
        return None


def has_horizon_2027_2036(text: str) -> bool:
    if HORIZON_YEAR_RE.search(text):
        return True
    for start_s, end_s in YEAR_RANGE_RE.findall(text):
        start_y, end_y = int(start_s), int(end_s)
        if start_y <= end_y and end_y >= 2027 and start_y <= 2036:
            return True
    return False


def classify_score(score: int) -> str:
    if score <= 0:
        return "IMMUNE"
    return "LOW_DRIFT" if score <= 15 else "STALE_RISK"


def _walk_json_strings(obj: Any, path_prefix: str = "") -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.extend(_walk_json_strings(v, f"{path_prefix}.{k}" if path_prefix else str(k)))
    elif isinstance(obj, list):
        for idx, item in enumerate(obj):
            out.extend(_walk_json_strings(item, f"{path_prefix}[{idx}]"))
    elif isinstance(obj, str):
        out.append((path_prefix, obj))
    return out


def _find_key_recursive(obj: Any, target_key: str) -> Any:
    if isinstance(obj, dict):
        if target_key in obj:
            return obj[target_key]
        for v in obj.values():
            found = _find_key_recursive(v, target_key)
            if found is not None:
                return found
    elif isinstance(obj, list):
        for item in obj:
            found = _find_key_recursive(item, target_key)
            if found is not None:
                return found
    return None


def _scan_titles_and_segments(
    item_id: str,
    titles: list[tuple[str, str]],
    segments: list[tuple[str, str, bool]],
    is_evergreen: bool,
    launch_exempt_ok: bool,
    has_horizon: bool,
) -> tuple[list[GateFinding], list[str]]:
    findings: list[GateFinding] = []
    exemptions: list[str] = []
    g1_hard = 0
    g3_hard = 0
    retro_hard = False

    for tloc, tval in titles:
        ymatch = TITLE_STALE_YEAR_RE.search(tval)
        if ymatch:
            sev, pts = ("HARD", 25) if is_evergreen else ("SOFT", 10)
            findings.append(GateFinding("Gate 2", sev, pts, tloc, ymatch.group(0), f"2021-2026 year stamp '{ymatch.group(0)}' in title."))
        for label, rpat in RETRO_SCANDAL_PATTERNS:
            rmatch = rpat.search(tval)
            if rmatch:
                retro_hard = True
                findings.append(GateFinding("Gate 2", "HARD", 28, tloc, rmatch.group(0), f"2022-2024 retro-scandal ({label}) centered in title."))
                break
        if is_evergreen:
            m_ver = TITLE_POINT_MODEL_RE.search(tval)
            if m_ver:
                g3_hard += 1
                findings.append(GateFinding("Gate 3", "HARD", 25, tloc, m_ver.group(0), f"Point-release model '{m_ver.group(0)}' stamped into evergreen title."))

    for loc, text, in_cold_open in segments:
        for label, pat in GATE1_HARD_PATTERNS:
            for match in pat.finditer(text):
                if not is_evergreen and launch_exempt_ok and in_cold_open:
                    exemptions.append(f"Gate 1 launch-trio exemption ({item_id}.{loc}): '{match.group(0)}'")
                    continue
                if is_evergreen:
                    pts = 22 if g1_hard == 0 else 8
                    g1_hard += 1
                    findings.append(GateFinding("Gate 1", "HARD", pts, loc, match.group(0), f"Unanchored perishable time phrase ({label}) in evergreen slot."))
                else:
                    findings.append(GateFinding("Gate 1", "SOFT", 10, loc, match.group(0), f"Relative time phrase ({label}) outside exempted launch-trio hook."))
        if is_evergreen:
            for label, pat in GATE1_SOFT_PATTERNS:
                for match in pat.finditer(text):
                    findings.append(GateFinding("Gate 1", "SOFT", 8, loc, match.group(0), f"Soft recency drift ({label}); prefer explicit calendar month and year."))

        if not retro_hard:
            pm = RETRO_POSTMORTEM_RE.search(text)
            if pm:
                retro_hard = True
                findings.append(GateFinding("Gate 2", "HARD", 28, loc, pm.group(0), "Standalone 2022-2024 post-mortem framing violates forward horizon rule."))
            else:
                for label, rpat in RETRO_SCANDAL_PATTERNS:
                    rmatch = rpat.search(text)
                    if not rmatch:
                        continue
                    if not has_horizon:
                        retro_hard = True
                        findings.append(GateFinding("Gate 2", "HARD", 28, loc, rmatch.group(0), f"Retro-scandal ({label}) lacks a 2027-2036 forward horizon anchor."))
                        break
                    if in_cold_open and is_evergreen:
                        findings.append(GateFinding("Gate 2", "SOFT", 8, loc, rmatch.group(0), f"Retro-scandal ({label}) placed in hook; confine to Act II/III stress tests."))

        for label, gpat in GATE3_GIMMICK_PATTERNS:
            for gmatch in gpat.finditer(text):
                pts = 25 if g3_hard == 0 else 10
                g3_hard += 1
                findings.append(GateFinding("Gate 3", "HARD", pts, loc, gmatch.group(0), f"Perishable model-version or benchmark gimmick ({label})."))

    return findings, exemptions


def _score_immunity_proof(proof_val: Any, require_proof: bool, has_horizon: bool, horizon_loc: str) -> tuple[int | None, list[GateFinding]]:
    findings: list[GateFinding] = []
    proof_words: int | None = None
    if require_proof or proof_val is not None:
        if not isinstance(proof_val, str) or not proof_val.strip() or PLACEHOLDER_RE.search(proof_val):
            proof_words = 0
            findings.append(GateFinding("Gate 5", "HARD", 25, "late_2027_staleness_immunity_proof", str(proof_val or ""), "Missing or placeholder late_2027_staleness_immunity_proof (requires >= 20 words)."))
        else:
            proof_words = len(WORD_TOKEN_RE.findall(proof_val))
            if proof_words < 15:
                findings.append(GateFinding("Gate 5", "HARD", 22, "late_2027_staleness_immunity_proof", proof_val[:80], f"late_2027_staleness_immunity_proof has {proof_words} words (requires >= 20)."))
            elif proof_words < 20:
                findings.append(GateFinding("Gate 5", "HARD", 14, "late_2027_staleness_immunity_proof", proof_val[:80], f"Borderline late_2027_staleness_immunity_proof has {proof_words} words (requires >= 20)."))
            elif proof_words < 25 and not has_horizon_2027_2036(proof_val) and has_horizon:
                findings.append(GateFinding("Gate 5", "SOFT", 6, "late_2027_staleness_immunity_proof", proof_val[:80], "Immunity proof meets word floor without explicit 2027-2036 years inside proof text."))
    if not has_horizon:
        findings.append(GateFinding("Gate 5", "HARD", 20, horizon_loc, "missing 2027-2036", "Item lacks a verifiable 2027-2036 forward structural horizon."))
    return proof_words, findings


def audit_json_entry(
    entry: dict[str, Any],
    fallback_id: str,
    is_slate_entry: bool,
    ledger_ctx: LedgerContext,
    slate_meta_text: str = "",
) -> ItemAuditResult:
    raw_id = entry.get("episode_id") or entry.get("id") or entry.get("ep_id") or entry.get("slug") or entry.get("episode_number") or fallback_id
    norm_ep = normalize_episode_id(raw_id)
    item_id = norm_ep or str(raw_id)
    ep_num = episode_number(norm_ep)
    is_evergreen = ep_num is None or ep_num >= 4

    all_strings = _walk_json_strings(entry)
    launch_exempt_ok = (ep_num in (1, 2, 3)) and (
        any(_find_key_recursive(entry, k) is True for k in ("pre_recorded_launch_trio", "is_pre_recorded_launch_trio", "is_launch_trio"))
        or any("pre_recorded_launch_trio" in v.lower() for _, v in all_strings)
        or ("pre_recorded_launch_trio" in slate_meta_text.lower())
    )

    titles: list[tuple[str, str]] = [(k, entry[k].strip()) for k in TITLE_KEYS if isinstance(entry.get(k), str) and entry[k].strip()]
    for var_key in ("title_variants", "ab_titles"):
        if isinstance(entry.get(var_key), list):
            titles.extend((f"{var_key}[{i}]", v.strip()) for i, v in enumerate(entry[var_key]) if isinstance(v, str) and v.strip())
    primary_title = titles[0][1] if titles else item_id

    segments: list[tuple[str, str, bool]] = []
    for kpath, val in all_strings:
        parts = [p.split("[", 1)[0] for p in kpath.split(".")]
        if set(parts) & META_SKIP_KEYS:
            continue
        segments.append((kpath, val, any(p.lower() in COLD_OPEN_KEYS for p in parts)))

    has_horizon = has_horizon_2027_2036("\n".join(v for _, v in all_strings))
    explicit_horizon = entry.get("structural_horizon") or entry.get("horizon") or entry.get("time_horizon") or entry.get("forward_horizon")
    if isinstance(explicit_horizon, str) and explicit_horizon.strip():
        has_horizon = has_horizon_2027_2036(explicit_horizon)

    findings, exemptions = _scan_titles_and_segments(item_id, titles, segments, is_evergreen, launch_exempt_ok, has_horizon)

    live_slots: set[str] = set()
    fact_ids: set[str] = set()
    for kpath, val in all_strings:
        leaf = kpath.rsplit(".", 1)[-1].split("[", 1)[0].lower()
        for raw_b in ANY_LIVE_SLOT_BRACKET_RE.findall(val):
            m_ok = LIVE_SLOT_TOKEN_RE.fullmatch(raw_b)
            if m_ok and not PLACEHOLDER_RE.search(m_ok.group(1)):
                live_slots.add(m_ok.group(1))
            else:
                findings.append(GateFinding("Gate 4", "HARD", 15, kpath, raw_b, "Malformed [LIVE_STAT_SLOT:<UPPER_SNAKE_ID>] identifier."))
        fact_ids.update(FACT_ID_RE.findall(val))
        if leaf in ("slot_id", "live_stat_slot", "live_stat_slots", "live_stat_slot_ids", "stat_slots"):
            s = val.strip()
            if BARE_SLOT_ID_RE.match(s) and not PLACEHOLDER_RE.search(s):
                live_slots.add(s)
            elif s and not ANY_LIVE_SLOT_BRACKET_RE.search(s):
                findings.append(GateFinding("Gate 4", "HARD", 15, kpath, s, "Malformed bare LIVE_STAT_SLOT identifier."))

    valid_fact_ids: list[str] = []
    has_live_ledger_fact = False
    for fid in sorted(fact_ids):
        if ledger_ctx.loaded and fid not in ledger_ctx.facts_by_id:
            findings.append(GateFinding("Gate 4", "HARD", 14, "fact_ledger_ids", fid, f"Referenced fact_id '{fid}' not found in fact_ledger.json."))
        else:
            valid_fact_ids.append(fid)
            if ledger_ctx.loaded and ledger_ctx.facts_by_id[fid].get("is_live_stat_slot") is True:
                has_live_ledger_fact = True

    volatile_hits = [
        (cat, loc, m.group(0))
        for loc, val, _ in segments
        if loc.rsplit(".", 1)[-1].split("[", 1)[0].lower() not in ("source_document", "table_or_section", "verification_formula")
        for cat, vpat in VOLATILE_SERIES_PATTERNS
        for m in vpat.finditer(val)
    ]
    if volatile_hits:
        if not live_slots and not valid_fact_ids:
            for idx, (cat, loc, snip) in enumerate(volatile_hits):
                findings.append(GateFinding("Gate 4", "HARD", 22 if idx == 0 else 6, loc, snip, f"Unbound volatile {cat} figure; attach [LIVE_STAT_SLOT:...] or fact_ledger_ids."))
        elif ledger_ctx.loaded and not live_slots and not has_live_ledger_fact and norm_ep in ledger_ctx.episode_has_live_slots:
            cat0, loc0, snip0 = volatile_hits[0]
            findings.append(GateFinding("Gate 4", "HARD", 12, loc0, snip0, f"Volatile {cat0} claim cites only STATIC_LOCK fact_ids while {norm_ep} has active live slots."))

    proof_val = _find_key_recursive(entry, "late_2027_staleness_immunity_proof")
    proof_words, g5_findings = _score_immunity_proof(proof_val, is_slate_entry, has_horizon, "structural_horizon")
    findings.extend(g5_findings)

    return _finalize_item_result(
        item_id, primary_title, "slate_json" if is_slate_entry else "episode_json",
        is_evergreen, launch_exempt_ok, sorted(live_slots), valid_fact_ids,
        proof_words, has_horizon, exemptions, findings,
    )


def audit_markdown_text(raw_text: str, source_name: str, ledger_ctx: LedgerContext) -> ItemAuditResult:
    src_path = pathlib.Path(source_name)
    m_meta_ep = re.search(r"^\s*episode(?:_id)?\s*:\s*['\"]?(ep[_-]?\d{1,2})['\"]?\s*$", raw_text[:800], re.MULTILINE | re.IGNORECASE)
    norm_ep = normalize_episode_id(src_path.name) or normalize_episode_id(src_path.parent.name) or (normalize_episode_id(m_meta_ep.group(1)) if m_meta_ep else None)
    item_id = norm_ep or src_path.stem
    ep_num = episode_number(norm_ep)
    is_evergreen = ep_num is None or ep_num >= 4
    launch_exempt_ok = (ep_num in (1, 2, 3)) and ("pre_recorded_launch_trio" in raw_text.lower())

    lines = raw_text.splitlines()
    title = item_id
    for line in lines[:30]:
        s = line.strip()
        if s.startswith("# "):
            title = s[2:].strip()
            break
        m_wt = re.match(r"^(?:working_title|title)\s*:\s*['\"]?(.+?)['\"]?\s*$", s, re.IGNORECASE)
        if m_wt:
            title = m_wt.group(1).strip()
            break

    live_slots = set(LIVE_SLOT_TOKEN_RE.findall(raw_text))
    for m_yaml in re.finditer(r"^\s*slot_id\s*:\s*['\"]?([A-Z0-9_]{4,64})['\"]?\s*$", raw_text, re.MULTILINE):
        if not PLACEHOLDER_RE.search(m_yaml.group(1)):
            live_slots.add(m_yaml.group(1))
    fact_ids = sorted(set(FACT_ID_RE.findall(raw_text)))
    valid_fact_ids = [fid for fid in fact_ids if (not ledger_ctx.loaded or fid in ledger_ctx.facts_by_id)]

    in_fence = False
    in_cold = True
    segments: list[tuple[str, str, bool]] = []
    for line_no, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or re.match(r"^late_2027_staleness_immunity_proof\s*:", stripped, re.IGNORECASE):
            continue
        if re.match(r"^#{1,3}\s+Act\s+(?:I|1)\b", stripped, re.IGNORECASE) or line_no > 20:
            in_cold = False
        segments.append((f"L{line_no}", line, in_cold))

    has_horizon = has_horizon_2027_2036(raw_text)
    title_list = [(f"{source_name}:title", title)] if title != item_id else []
    findings, exemptions = _scan_titles_and_segments(item_id, title_list, segments, is_evergreen, launch_exempt_ok, has_horizon)

    for bad in ANY_LIVE_SLOT_BRACKET_RE.findall(raw_text):
        m_ok = LIVE_SLOT_TOKEN_RE.fullmatch(bad)
        if not m_ok or PLACEHOLDER_RE.search(m_ok.group(1)):
            findings.append(GateFinding("Gate 4", "HARD", 15, source_name, bad, "Malformed [LIVE_STAT_SLOT:<UPPER_SNAKE_ID>] token in Markdown."))
    if ledger_ctx.loaded:
        for fid in fact_ids:
            if fid not in ledger_ctx.facts_by_id:
                findings.append(GateFinding("Gate 4", "HARD", 14, source_name, fid, f"Referenced fact_id '{fid}' not found in fact_ledger.json."))

    unbound_count = 0
    ep_anchors = ledger_ctx.episode_live_anchors.get(norm_ep or "", [])
    for loc, line, _ in segments:
        line_lower = line.lower()
        for cat, vpat in VOLATILE_SERIES_PATTERNS:
            for vmatch in vpat.finditer(line):
                bound = (
                    bool(LIVE_SLOT_TOKEN_RE.search(line)) or bool(FACT_ID_RE.search(line))
                    or bool(live_slots) or bool(valid_fact_ids)
                    or any(anchor in line_lower for anchor in ep_anchors)
                )
                if not bound:
                    findings.append(GateFinding("Gate 4", "HARD", 22 if unbound_count == 0 else 6, loc, vmatch.group(0), f"Unbound volatile {cat} claim in Markdown; bind via [LIVE_STAT_SLOT:...] or FL-XXX."))
                    unbound_count += 1

    m_proof = re.search(r"late_2027_staleness_immunity_proof\s*:\s*['\"]?(.+?)['\"]?\s*$", raw_text, re.MULTILINE | re.IGNORECASE)
    proof_words, g5_findings = _score_immunity_proof(m_proof.group(1).strip() if m_proof else None, False, has_horizon, source_name)
    findings.extend(g5_findings)

    return _finalize_item_result(
        item_id, title, "markdown", is_evergreen, launch_exempt_ok,
        sorted(live_slots), valid_fact_ids, proof_words, has_horizon, exemptions, findings,
    )


def _finalize_item_result(
    item_id: str, title: str, source_kind: str, is_evergreen: bool, launch_exempt_ok: bool,
    live_slots: list[str], fact_ids: list[str], proof_words: int | None,
    has_horizon: bool, exemptions: list[str], findings: list[GateFinding],
) -> ItemAuditResult:
    caps = {"Gate 1": 35, "Gate 2": 40, "Gate 3": 35, "Gate 4": 35, "Gate 5": 35}
    hard = {g: 0 for g in caps}
    soft = {g: 0 for g in caps}
    for f in findings:
        if f.severity == "HARD":
            hard[f.gate] = min(caps[f.gate], hard[f.gate] + f.points)
        else:
            soft[f.gate] = min(15, soft[f.gate] + f.points)
    gate_scores = {g: min(caps[g], hard[g] + soft[g]) for g in caps}
    hard_total = min(100, sum(hard.values()))
    soft_total = min(30, sum(soft.values()))
    total = min(100, hard_total + soft_total)
    return ItemAuditResult(
        item_id=item_id, title=title, source_kind=source_kind, is_evergreen=is_evergreen,
        is_launch_trio_exempt_eligible=launch_exempt_ok, decay_risk_score=total,
        hard_gate_score=hard_total, soft_drift_score=soft_total, classification=classify_score(total),
        gate_scores=gate_scores, live_stat_slots_bound=live_slots, fact_ledger_ids_bound=fact_ids,
        immunity_proof_words=proof_words, has_forward_horizon_2027_2036=has_horizon,
        exemptions=exemptions, findings=findings,
    )


def extract_episodes_from_json_payload(payload: Any) -> tuple[list[dict[str, Any]], bool, str]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)], True, ""
    if isinstance(payload, dict):
        meta_str = " ".join(str(v) for k, v in payload.items() if k not in ("episodes", "slate", "items", "videos") and isinstance(v, (str, list, dict)))
        for list_key in ("episodes", "slate", "items", "videos"):
            if isinstance(payload.get(list_key), list):
                return [x for x in payload[list_key] if isinstance(x, dict)], True, meta_str
        return [payload], False, ""
    return [], False, ""


def evaluate_pass_status(results: list[ItemAuditResult], strict: bool, parse_errors: list[str]) -> bool:
    if parse_errors or any(r.classification == "STALE_RISK" for r in results):
        return False
    if strict and any(r.is_evergreen and r.hard_gate_score > 0 for r in results):
        return False
    return True


def audit_target_file(target_path: pathlib.Path, force_slate: bool, ledger_ctx: LedgerContext) -> tuple[list[ItemAuditResult], list[str]]:
    if not target_path.is_file():
        return [], [f"File not found: {target_path}"]
    try:
        raw = target_path.read_text(encoding="utf-8")
    except OSError as exc:
        return [], [f"Cannot read {target_path}: {exc}"]
    if target_path.suffix.lower() == ".json" or force_slate:
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            return [], [f"Invalid JSON in {target_path}: {exc}"]
        entries, inferred_slate, slate_meta = extract_episodes_from_json_payload(payload)
        if not entries:
            return [], [f"No episode objects found in {target_path}"]
        return [
            audit_json_entry(e, f"item_{idx:02d}", force_slate or inferred_slate, ledger_ctx, slate_meta)
            for idx, e in enumerate(entries, start=1)
        ], []
    return [audit_markdown_text(raw, str(target_path), ledger_ctx)], []


def run_self_test(ledger_ctx: LedgerContext) -> dict[str, Any]:
    j = lambda d, eid="ep_08": audit_json_entry(d, eid, True, ledger_ctx)
    c1 = j({
        "episode_id": "ep_08", "title": "The 94-Gigawatt Bottleneck Behind Your Electric Bill", "structural_horizon": "2027-2036",
        "cold_open_hook": "In July 2027, wholesale power capacity auctions cleared at record caps as five-gigawatt server campuses locked up substations.",
        "thesis": "PJM capacity clearing prices hit $269.92/MW-day while US grid gaps reach 94 GW and transformer lead times stretch 100 to 160 weeks through 2034.",
        "live_stat_slots": ["[LIVE_STAT_SLOT:PJM_CAPACITY_AUCTION_CLEARING]", "[LIVE_STAT_SLOT:US_GRID_GAP_TRANSFORMER_QUEUE]"],
        "fact_ledger_ids": ["FL-041", "FL-067"],
        "late_2027_staleness_immunity_proof": "High-voltage transformer manufacturing queues run 100 to 160 weeks and utility transmission depreciation spans twenty-five years, keeping residential tariff collisions active from 2027 through 2036 regardless of quarterly chip releases.",
    })
    c2 = j({
        "episode_id": "ep_01", "cohort": "pre_recorded_launch_trio", "title": "The Allowance", "structural_horizon": "2027-2036",
        "cold_open_hook": "Earlier this year, enterprise engineering teams hit $1,500 monthly coding-agent caps.",
        "thesis": "Wages fall while fixed mortgages stay frozen at yesterday's numbers against $40.5 trillion in national debt through 2036.",
        "live_stat_slots": ["[LIVE_STAT_SLOT:US_GROSS_FEDERAL_DEBT]"], "fact_ledger_ids": ["FL-001", "FL-007", "FL-011"],
        "late_2027_staleness_immunity_proof": "Federal payroll-tax dependency above eighty-six percent and thirty-year fixed mortgage contracts govern household solvency from 2027 through 2036 under Congressional Budget Office net-interest baselines.",
    }, "ep_01")
    c3 = j({
        "episode_id": "ep_10", "title": "When Treasury Agents Move $4 Trillion in Overnight Deposits", "structural_horizon": "2028-2035",
        "act_ii_stress_test": "Compares 2030 autonomous corporate cash-sweep agents against Silicon Valley Bank's 24-hour deposit outflow velocity.",
        "thesis": "Commercial banks hold $4.04 trillion in zero-yield deposits exposed to programmatic treasury rebalancing through 2035.",
        "live_stat_slots": ["[LIVE_STAT_SLOT:FDIC_ZERO_YIELD_DEPOSITS]"], "fact_ledger_ids": ["FL-071", "FL-072"],
        "late_2027_staleness_immunity_proof": "Commercial bank net-interest margins depend on $4.04 trillion in non-interest checking balances whose statutory liquidity coverage rules persist across 2028 through 2035.",
    }, "ep_10")
    md_pass = (
        "# The Compliance Black Hole\nepisode_id: ep_20\n"
        "late_2027_staleness_immunity_proof: Bank Secrecy Act safe-harbor immunity under 31 U.S.C. 5318(g)(2) "
        "drives automated account freezes across 2027 through 2034 until Congress amends statutory liability.\n\n"
        "```yaml\nlive_stat_slot:\n  slot_id: \"FINCEN_ANNUAL_SAR_VOLUME\"\n```\n"
        "FinCEN processes 4.8 million Suspicious Activity Reports a year (`FL-088`) between 2027 and 2034.\n"
    )
    c4 = audit_markdown_text(md_pass, "ep_20_dossier.md", ledger_ctx)
    c5 = j({
        "episode_id": "ep_06", "cohort": "pre_recorded_launch_trio", "title": "Passive Index Concentration and Retirement Risk", "structural_horizon": "2027-2034",
        "cold_open_hook": "Breaking today, regulators just announced an inquiry after last week's selloff right now in 2026.",
        "fact_ledger_ids": ["FL-064", "FL-065"],
        "late_2027_staleness_immunity_proof": "Target-date 401(k) glide paths allocate worker contributions into top-heavy cap-weighted indices across 2027 through 2034 under federal ERISA fiduciary defaults.",
    }, "ep_06")
    c6 = j({
        "episode_id": "ep_12", "title": "Inside the 2023 Silicon Valley Bank and FTX Collapse",
        "thesis": "How FTX and SVB collapsed during the 2022-2023 rate hike cycle.", "fact_ledger_ids": ["FL-076"],
        "late_2027_staleness_immunity_proof": "Examines banking bond duration losses, uninsured corporate deposits, and exchange commingling lessons from past financial cycles for modern household depositors.",
    }, "ep_12")
    c7 = j({
        "episode_id": "ep_15", "title": "New Benchmark Leader Beats GPT-4o With One Prompt Hack", "structural_horizon": "2027-2032",
        "cold_open_hook": "This Claude 3.5 Sonnet trick crushes Gemini 1.5 on the Chatbot Arena leaderboard.", "fact_ledger_ids": ["FL-080"],
        "late_2027_staleness_immunity_proof": "Sub-5nm extreme ultraviolet lithography concentration in Taiwan governs global accelerator supply chains, foundry insurance pricing, and sovereign defense risk from 2027 through 2032.",
    }, "ep_15")
    c8 = j({
        "episode_id": "ep_28", "title": "Dead Internet Verification and Mandatory Digital IDs", "structural_horizon": "2027-2035",
        "thesis": "Gross federal debt reached $40.5 trillion, 30-year JGB yields hit 4.0%, hyperscaler capex passed $824 billion, FinCEN SARs hit 4.8 million, and automated bot traffic reached 53%.",
        "late_2027_staleness_immunity_proof": "European eIDAS 2.0 mandatory digital identity wallet statutes taking effect in December 2027 restructure browser authentication, payment compliance, and online privacy from 2027 through 2035.",
    }, "ep_28")
    c9 = j({
        "episode_id": "ep_22", "title": "Algorithmic Rent Collusion", "thesis": "Property managers pool lease renewals through shared pricing software.",
        "fact_ledger_ids": ["FL-091"], "late_2027_staleness_immunity_proof": "Rent software lawsuits will matter for years.",
    }, "ep_22")
    c10 = j({
        "episode_id": "ep_19", "title": "Attritable Drone Swarms Versus $4 Million Interceptors", "structural_horizon": "2027-2035",
        "thesis": "Asymmetric defense munition cost ratios drain naval magazine depth from 2027 through 2035.", "fact_ledger_ids": ["FL-087"],
        "late_2027_staleness_immunity_proof": "Naval interceptor procurement lead times and magazine replenishment contracts span 2027 through 2035 across Pentagon budgets.",
    }, "ep_19")

    specs = [
        ("CASE_01_PASS_EVERGREEN_IMMUNE", c1, lambda r: r.decay_risk_score == 0 and r.classification == "IMMUNE"),
        ("CASE_02_PASS_LAUNCH_TRIO_AND_IDIOM", c2, lambda r: r.decay_risk_score == 0 and len(r.exemptions) == 1),
        ("CASE_03_PASS_ANCHORED_ACT_II_STRESS_TEST", c3, lambda r: r.decay_risk_score == 0 and r.classification == "IMMUNE"),
        ("CASE_04_PASS_MARKDOWN_DOSSIER", c4, lambda r: r.decay_risk_score == 0 and r.classification == "IMMUNE"),
        ("CASE_05_FAIL_GATE1_TEMPORAL_TRAP", c5, lambda r: r.gate_scores["Gate 1"] == 35 and r.classification == "STALE_RISK"),
        ("CASE_06_FAIL_GATE2_YEAR_AND_RETRO", c6, lambda r: r.gate_scores["Gate 2"] == 40 and r.classification == "STALE_RISK"),
        ("CASE_07_FAIL_GATE3_MODEL_GIMMICK", c7, lambda r: r.gate_scores["Gate 3"] == 35 and r.decay_risk_score == 35),
        ("CASE_08_FAIL_GATE4_UNBOUND_VOLATILE_STATS", c8, lambda r: r.gate_scores["Gate 4"] == 35 and r.decay_risk_score == 35),
        ("CASE_09_FAIL_GATE5_STUB_IMMUNITY_PROOF", c9, lambda r: r.gate_scores["Gate 5"] == 35 and r.decay_risk_score == 35),
        ("CASE_10_BORDERLINE_LOW_DRIFT_STRICT_GATE", c10, lambda r: r.classification == "LOW_DRIFT" and r.decay_risk_score == 14 and r.hard_gate_score == 14 and evaluate_pass_status([r], False, []) is True and evaluate_pass_status([r], True, []) is False),
    ]
    rows = []
    all_ok = True
    for cid, res, pred in specs:
        ok = bool(pred(res))
        all_ok = all_ok and ok
        rows.append({
            "case_id": cid, "passed_assertion": ok, "item_id": res.item_id,
            "decay_risk_score": res.decay_risk_score, "hard_gate_score": res.hard_gate_score,
            "classification": res.classification, "gate_scores": res.gate_scores,
        })
    return {"mode": "self_test", "total_cases": len(rows), "assertions_passed": sum(1 for x in rows if x["passed_assertion"]), "passed": all_ok, "cases": rows}


def format_audit_report(report: dict[str, Any]) -> str:
    if report.get("mode") == "self_test":
        status = "PASS" if report["passed"] else "FAIL"
        lines = [f"[{status}] Staleness & Decay Scorer Self-Test ({report['assertions_passed']}/{report['total_cases']} assertions verified)"]
        for c in report["cases"]:
            lines.append(f"  [{'OK' if c['passed_assertion'] else 'FAIL'}] {c['case_id']:<40} score={c['decay_risk_score']:>3} ({c['classification']:<10}) gates={c['gate_scores']}")
        return "\n".join(lines)

    status = "PASS" if report["passed"] else "FAIL"
    lines = [
        f"[{status}] Reading Room Staleness & Decay Audit (strict={report['strict']})",
        f"  Items audited : {report['total_items']} (IMMUNE={report['counts']['IMMUNE']}, LOW_DRIFT={report['counts']['LOW_DRIFT']}, STALE_RISK={report['counts']['STALE_RISK']})",
    ]
    for err in report.get("parse_errors", []):
        lines.append(f"  [ERROR] {err}")
    for item in report.get("items", []):
        lines.append(f"  - {item['item_id']:<8} | score={item['decay_risk_score']:>3} (hard={item['hard_gate_score']:>2}, soft={item['soft_drift_score']:>2}) | {item['classification']:<10} | {item['title']}")
        for ex in item.get("exemptions", []):
            lines.append(f"      [EXEMPT] {ex}")
        for f in item.get("findings", []):
            lines.append(f"      [{f['gate']} {f['severity']} +{f['points']}] ({f['field_or_loc']}) '{f['snippet']}' -> {f['message']}")
    return "\n".join(lines)


def build_arg_parser() -> argparse.ArgumentParser:
    div2_root = pathlib.Path(__file__).resolve().parent.parent
    default_slate = div2_root / "slate_30_jan2028.json"
    default_ledger = div2_root / "data" / "fact_ledger.json"
    parser = argparse.ArgumentParser(
        prog="staleness_audit.py",
        description="Audit Reading Room master slates, research dossiers, and scripts across five deterministic staleness and decay gates (0..100 decay_risk_score).",
    )
    parser.add_argument("--slate", type=pathlib.Path, default=None, help=f"Path to master slate JSON (defaults to {default_slate} when no other target is set).")
    parser.add_argument("--file", dest="target_file", type=pathlib.Path, default=None, help="Audit a single Markdown dossier/script or JSON episode file.")
    parser.add_argument("--dir", dest="target_dir", type=pathlib.Path, default=None, help="Audit all .md and .json episode dossiers/scripts inside a directory.")
    parser.add_argument("--ledger", type=pathlib.Path, default=default_ledger, help=f"Path to canonical fact_ledger.json for Gate 4 cross-verification (default: {default_ledger}).")
    parser.add_argument("--self-test", dest="self_test", action="store_true", help="Run built-in synthetic PASS and FAIL test cases without reading slate_30_jan2028.json.")
    parser.add_argument("--strict", action="store_true", help="Exit non-zero if any evergreen item (ep_04..ep_30) scores > 0 on hard gates.")
    parser.add_argument("--json", dest="as_json", action="store_true", help="Emit structured JSON output.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    ledger_ctx = load_ledger_context(args.ledger.resolve() if args.ledger else None)
    if args.self_test:
        st_report = run_self_test(ledger_ctx)
        print(json.dumps(st_report, indent=2) if args.as_json else format_audit_report(st_report))
        return 0 if st_report["passed"] else 1

    results: list[ItemAuditResult] = []
    parse_errors: list[str] = []
    if args.slate is not None:
        r, errs = audit_target_file(args.slate.resolve(), True, ledger_ctx)
        results.extend(r)
        parse_errors.extend(errs)
    if args.target_file is not None:
        r, errs = audit_target_file(args.target_file.resolve(), False, ledger_ctx)
        results.extend(r)
        parse_errors.extend(errs)
    if args.target_dir is not None:
        tdir = args.target_dir.resolve()
        if not tdir.is_dir():
            parse_errors.append(f"Directory not found: {tdir}")
        else:
            skip_spec_re = re.compile(r"^\d{2}_.*(?:specification|playbook|protocol|guide|bible|manifesto|architecture|sop).*\.md$", re.IGNORECASE)
            candidates = sorted(
                p for p in tdir.rglob("*")
                if p.is_file()
                and p.suffix.lower() in (".md", ".json")
                and p.name.lower() != "readme.md"
                and not ({part.lower() for part in p.relative_to(tdir).parts} & {"tools", "data", "datasets"})
                and not skip_spec_re.match(p.name)
            )
            if not candidates:
                parse_errors.append(f"No .md or .json episode files found under {tdir}")
            for path in candidates:
                r, errs = audit_target_file(path, False, ledger_ctx)
                results.extend(r)
                parse_errors.extend(errs)

    if args.slate is None and args.target_file is None and args.target_dir is None:
        default_slate = pathlib.Path(__file__).resolve().parent.parent / "slate_30_jan2028.json"
        if default_slate.is_file():
            r, errs = audit_target_file(default_slate, True, ledger_ctx)
            results.extend(r)
            parse_errors.extend(errs)
        else:
            parse_errors.append(f"Default slate '{default_slate}' is not present yet; pass --self-test, --file, --dir, or --slate.")

    passed = evaluate_pass_status(results, args.strict, parse_errors)
    counts = {band: sum(1 for x in results if x.classification == band) for band in ("IMMUNE", "LOW_DRIFT", "STALE_RISK")}
    report = {
        "mode": "audit", "strict": args.strict, "ledger_loaded": ledger_ctx.loaded,
        "total_items": len(results), "counts": counts, "passed": passed,
        "parse_errors": parse_errors, "items": [asdict(x) for x in results],
    }
    print(json.dumps(report, indent=2) if args.as_json else format_audit_report(report))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
