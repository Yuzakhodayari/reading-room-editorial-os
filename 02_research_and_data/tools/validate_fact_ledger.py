#!/usr/bin/env python3
"""
Fact-Lock and Primary Citation Ledger Validator for The Reading Room Editorial OS.

Validates `02_research_and_data/data/fact_ledger.json` across seven quality gates:
1. Top-level metadata integrity and minimum claim threshold (default >= 85 facts).
2. Schema completeness and strict field types across all 13 mandatory keys.
3. Unique fact IDs, valid episode references (ep_01 through ep_30), and full 30-episode coverage.
4. Non-empty primary institutional citations and valid ISO publication dates.
5. Safe AST arithmetic formula parsing and evaluation (zero `eval()`, tautology rejection).
6. Shoot-week `[LIVE_STAT_SLOT]` governance rules, unique slot IDs, and circuit breakers.
7. Anti-AI prose hygiene plus optional `--verify-script <script.md>` bidirectional claim coverage.
"""

from __future__ import annotations

import argparse
import ast
import datetime
import json
import math
import operator
import pathlib
import re
import sys
from typing import Any


REQUIRED_FACT_FIELDS: dict[str, type] = {
    "fact_id": str,
    "episode_refs": list,
    "claim_summary": str,
    "exact_value": str,
    "unit": str,
    "institution": str,
    "source_document": str,
    "table_or_section": str,
    "publication_date": str,
    "verification_formula": str,
    "adversarial_caveat": str,
    "is_live_stat_slot": bool,
    "refresh_instructions": str,
}

FACT_ID_RE = re.compile(r"^FL-\d{3}$")
EPISODE_ID_RE = re.compile(r"^ep_(?:0[1-9]|[12]\d|30)$")
ISO_DATE_FULL_RE = re.compile(r"^(\d{4})-(\d{2})-(\d{2})$")
ISO_DATE_MONTH_RE = re.compile(r"^(\d{4})-(\d{2})$")
LIVE_SLOT_PREFIX_RE = re.compile(r"^\[LIVE_STAT_SLOT:([A-Z0-9_]{4,64})\]\s+(.+)$")
SCRIPT_LIVE_SLOT_TOKEN_RE = re.compile(r"\[LIVE_STAT_SLOT:([A-Z0-9_]{4,64})\]")
PLACEHOLDER_RE = re.compile(
    r"\b(?:TODO|TBD|FIXME|PLACEHOLDER|LOREM IPSUM)\b", re.IGNORECASE
)

BANNED_AI_WORDS: tuple[str, ...] = (
    "delve",
    "delves",
    "delving",
    "tapestry",
    "tapestries",
    "testament",
    "pivotal",
    "crucial",
    "leverage",
    "leveraging",
    "leveraged",
    "utilize",
    "utilizes",
    "utilizing",
    "utilized",
    "landscape",
    "landscapes",
    "realm",
    "realms",
    "paradigm",
    "paradigms",
    "robust",
    "comprehensive",
    "seamless",
    "seamlessly",
    "nuanced",
    "nuance",
    "multifaceted",
    "foster",
    "fosters",
    "fostering",
    "fostered",
    "bolster",
    "bolsters",
    "bolstering",
    "bolstered",
    "underscore",
    "underscores",
    "underscoring",
    "underscored",
    "showcase",
    "showcases",
    "showcasing",
    "showcased",
    "highlight",
    "highlights",
    "highlighting",
    "highlighted",
    "intricate",
    "intricacies",
    "vibrant",
    "enduring",
    "deep dive",
    "unpack",
    "unpacks",
    "unpacking",
    "at its core",
    "interplay",
    "genuinely",
    "profound",
    "profoundly",
    "remarkable",
    "remarkably",
    "unprecedented",
    "transformative",
    "groundbreaking",
    "paramount",
)

BANNED_WORD_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (word, re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE))
    for word in BANNED_AI_WORDS
]

NEGATIVE_CONTRAST_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("rather than", re.compile(r"\brather\s+than\b", re.IGNORECASE)),
    ("not just/only/merely X", re.compile(r"\bnot\s+(?:just|only|merely)\b", re.IGNORECASE)),
    ("not X, but Y", re.compile(r"\bnot\s+[^,;.]{1,45},\s*but\b", re.IGNORECASE)),
    ("isn't X, it's Y", re.compile(r"\bisn['\u2019]t\s+[^,;.]{1,45},\s*it['\u2019]s\b", re.IGNORECASE)),
]

EMPIRICAL_TOKEN_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (
        "currency",
        re.compile(
            r"\$[0-9][0-9,]*(?:\.[0-9]+)?(?:\s+(?:trillion|billion|million|thousand))?",
            re.IGNORECASE,
        ),
    ),
    (
        "numeric_percent",
        re.compile(r"\b[0-9]+(?:\.[0-9]+)?\s*(?:percent|%)", re.IGNORECASE),
    ),
    (
        "spoken_share",
        re.compile(
            r"\b(?:two-thirds|one hundred percent|ninety-nine(?:-point-nine)? percent|"
            r"ninety percent|eighty-six percent|eighty percent|seventy percent|"
            r"sixty percent|fifty-three percent|twenty-five percent|twenty percent|"
            r"ten percent|two percent|one percent)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "physical_unit",
        re.compile(
            r"\b(?:five gigawatts|one gigawatt|[0-9,]+\s+terawatt-hours|"
            r"sixteen ration points)\b",
            re.IGNORECASE,
        ),
    ),
]

SAFE_BIN_OPS: dict[type, Any] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
}

SAFE_UNARY_OPS: dict[type, Any] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

SAFE_FUNCS: dict[str, Any] = {
    "round": round,
    "abs": abs,
    "min": min,
    "max": max,
}


class FormulaValidationError(ValueError):
    """Raised when a verification_formula expression fails syntax, safety, or math checks."""


def _eval_ast_node(node: ast.AST) -> float | int | bool:
    if isinstance(node, ast.Expression):
        return _eval_ast_node(node.body)

    if isinstance(node, ast.Constant):
        if isinstance(node.value, bool) or not isinstance(node.value, (int, float)):
            raise FormulaValidationError(
                f"Unsupported constant literal {node.value!r}; use int or float numbers."
            )
        return node.value

    if isinstance(node, ast.UnaryOp):
        op_fn = SAFE_UNARY_OPS.get(type(node.op))
        if op_fn is None:
            raise FormulaValidationError(f"Unsupported unary operator {type(node.op).__name__}.")
        operand = _eval_ast_node(node.operand)
        if isinstance(operand, bool):
            raise FormulaValidationError("Boolean operand inside arithmetic unary operation.")
        return op_fn(operand)

    if isinstance(node, ast.BinOp):
        left = _eval_ast_node(node.left)
        right = _eval_ast_node(node.right)
        if isinstance(left, bool) or isinstance(right, bool):
            raise FormulaValidationError("Boolean operand inside arithmetic binary operation.")
        if isinstance(node.op, ast.Pow):
            if abs(right) > 100:
                raise FormulaValidationError(f"Exponent magnitude {right} exceeds safety cap 100.")
            return float(left**right)
        op_fn = SAFE_BIN_OPS.get(type(node.op))
        if op_fn is None:
            raise FormulaValidationError(f"Unsupported binary operator {type(node.op).__name__}.")
        if isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)) and right == 0:
            raise FormulaValidationError("Division by zero in verification_formula.")
        return op_fn(left, right)

    if isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name) or node.func.id not in SAFE_FUNCS:
            func_name = getattr(node.func, "id", type(node.func).__name__)
            raise FormulaValidationError(
                f"Disallowed function call '{func_name}'; allowed: {sorted(SAFE_FUNCS)}."
            )
        if node.keywords:
            raise FormulaValidationError("Keyword arguments disallowed in verification_formula.")
        evaluated_args = [_eval_ast_node(arg) for arg in node.args]
        if any(isinstance(arg, bool) for arg in evaluated_args):
            raise FormulaValidationError("Boolean argument passed to numeric function.")
        return SAFE_FUNCS[node.func.id](*evaluated_args)

    if isinstance(node, ast.Compare):
        if len(node.ops) == 1 and ast.dump(node.left) == ast.dump(node.comparators[0]):
            raise FormulaValidationError(
                "Trivial tautology rejected: left and right sides of comparison are identical."
            )
        left_val = _eval_ast_node(node.left)
        for op, comparator in zip(node.ops, node.comparators):
            right_val = _eval_ast_node(comparator)
            if isinstance(left_val, bool) or isinstance(right_val, bool):
                raise FormulaValidationError("Comparison operands must evaluate to numeric values.")
            if isinstance(op, ast.Eq):
                matched = math.isclose(float(left_val), float(right_val), rel_tol=1e-6, abs_tol=1e-6)
            elif isinstance(op, ast.Lt):
                matched = float(left_val) < float(right_val)
            elif isinstance(op, ast.LtE):
                matched = float(left_val) <= float(right_val) or math.isclose(
                    float(left_val), float(right_val), rel_tol=1e-6, abs_tol=1e-6
                )
            elif isinstance(op, ast.Gt):
                matched = float(left_val) > float(right_val)
            elif isinstance(op, ast.GtE):
                matched = float(left_val) >= float(right_val) or math.isclose(
                    float(left_val), float(right_val), rel_tol=1e-6, abs_tol=1e-6
                )
            else:
                raise FormulaValidationError(f"Unsupported comparison operator {type(op).__name__}.")
            if not matched:
                return False
            left_val = right_val
        return True

    if isinstance(node, ast.BoolOp):
        values = [_eval_ast_node(val) for val in node.values]
        if not all(isinstance(val, bool) for val in values):
            raise FormulaValidationError("Boolean conjunctions must join comparison clauses.")
        if isinstance(node.op, ast.And):
            return all(values)
        if isinstance(node.op, ast.Or):
            return any(values)
        raise FormulaValidationError(f"Unsupported boolean operator {type(node.op).__name__}.")

    raise FormulaValidationError(f"Disallowed AST construct {type(node).__name__}.")


def validate_formula_expression(formula_raw: str) -> tuple[bool, str]:
    expr_part = formula_raw.split("#", 1)[0].strip()
    if not expr_part:
        return False, "Empty arithmetic expression before optional '#' annotation."
    try:
        tree = ast.parse(expr_part, mode="eval")
    except SyntaxError as exc:
        return False, f"Syntax error in verification_formula: {exc.msg}."

    has_math_op = any(isinstance(n, (ast.BinOp, ast.Call)) for n in ast.walk(tree))
    has_compare = any(isinstance(n, ast.Compare) for n in ast.walk(tree))
    if not has_math_op:
        return False, "Formula must include at least one arithmetic operation or numeric function."
    if not has_compare:
        return False, "Formula must assert a numeric comparison (e.g., lhs == rhs)."

    try:
        outcome = _eval_ast_node(tree)
    except FormulaValidationError as exc:
        return False, str(exc)
    except Exception as exc:  # pragma: no cover - defensive guard
        return False, f"Arithmetic evaluation error: {exc}."

    if outcome is not True:
        return False, f"Formula evaluated to False: `{expr_part}`."
    return True, "OK"


def validate_iso_publication_date(date_str: str) -> tuple[bool, str]:
    full_match = ISO_DATE_FULL_RE.match(date_str)
    if full_match:
        year, month, day = (int(g) for g in full_match.groups())
        try:
            dt = datetime.date(year, month, day)
        except ValueError as exc:
            return False, f"Invalid calendar date '{date_str}': {exc}."
        if not (1900 <= dt.year <= 2036):
            return False, f"Publication year {dt.year} outside valid range 1900..2036."
        return True, "OK"

    month_match = ISO_DATE_MONTH_RE.match(date_str)
    if month_match:
        year, month = (int(g) for g in month_match.groups())
        if not (1900 <= year <= 2036) or not (1 <= month <= 12):
            return False, f"Invalid year-month '{date_str}'."
        return True, "OK"

    return False, f"Date '{date_str}' must match YYYY-MM-DD or YYYY-MM."


def scan_prose_anti_ai(text: str, location: str, check_enabled: bool = True) -> list[str]:
    if not check_enabled:
        return []
    violations: list[str] = []
    if "\u2014" in text or "\u2013" in text or " -- " in text:
        violations.append(f"{location}: contains forbidden em/en dash or double-hyphen dash.")
    if "!" in text:
        violations.append(f"{location}: contains forbidden exclamation mark.")
    for label, pattern in NEGATIVE_CONTRAST_PATTERNS:
        match = pattern.search(text)
        if match:
            violations.append(
                f"{location}: contains forbidden contrast pattern ({label}: '{match.group(0)}')."
            )
    for word, pattern in BANNED_WORD_PATTERNS:
        if pattern.search(text):
            violations.append(f"{location}: contains banned AI vocabulary '{word}'.")
    return violations


def infer_episode_from_path(script_path: pathlib.Path) -> str | None:
    normalized = script_path.as_posix()
    ep_match = re.search(
        r"(?:^|[^a-zA-Z0-9])ep[_-]?(0[1-9]|[12]\d|30)(?:[^0-9]|$)",
        normalized,
        re.IGNORECASE,
    )
    if ep_match:
        return f"ep_{ep_match.group(1)}"
    vid_match = re.search(
        r"(?:^|[^a-zA-Z0-9])video[_-]?(0[1-9]|[12]\d|30)(?:[^0-9]|$)",
        normalized,
        re.IGNORECASE,
    )
    if vid_match:
        return f"ep_{vid_match.group(1)}"
    return None


def verify_script_coverage(
    ledger_data: dict[str, Any],
    script_path: pathlib.Path,
    explicit_episode: str | None = None,
) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []

    if not script_path.is_file():
        return {
            "script_path": str(script_path),
            "episode_id": explicit_episode,
            "passed": False,
            "errors": [f"Script file not found: {script_path}"],
            "warnings": [],
        }

    episode_id = explicit_episode or infer_episode_from_path(script_path)
    if not episode_id or not EPISODE_ID_RE.match(episode_id):
        return {
            "script_path": str(script_path),
            "episode_id": episode_id,
            "passed": False,
            "errors": [
                f"Could not infer valid episode ID (ep_01..ep_30) from path '{script_path}'; "
                "pass --episode ep_XX explicitly."
            ],
            "warnings": [],
        }

    raw_text = script_path.read_text(encoding="utf-8")
    lines = raw_text.splitlines()
    lower_lines = [line.lower() for line in lines]

    facts: list[dict[str, Any]] = ledger_data.get("facts", [])
    episode_facts = [
        f for f in facts if isinstance(f, dict) and episode_id in f.get("episode_refs", [])
    ]
    if not episode_facts:
        errors.append(f"No facts in ledger reference episode '{episode_id}'.")

    # Build slot lookup map for `[LIVE_STAT_SLOT:ID]` tokens
    slot_to_fact: dict[str, str] = {}
    for fact in facts:
        if isinstance(fact, dict) and fact.get("is_live_stat_slot") is True:
            m = LIVE_SLOT_PREFIX_RE.match(str(fact.get("refresh_instructions", "")))
            if m:
                slot_to_fact[m.group(1)] = str(fact.get("fact_id", ""))

    # Check 7C: verify any raw [LIVE_STAT_SLOT:...] markers present in the script/dossier
    live_tokens_found: list[dict[str, Any]] = []
    covered_lines: dict[int, list[str]] = {}
    for idx, line in enumerate(lines, start=1):
        for slot_match in SCRIPT_LIVE_SLOT_TOKEN_RE.finditer(line):
            slot_id = slot_match.group(1)
            mapped_fact_id = slot_to_fact.get(slot_id)
            live_tokens_found.append(
                {"line": idx, "slot_id": slot_id, "fact_id": mapped_fact_id}
            )
            if not mapped_fact_id:
                errors.append(
                    f"Line {idx}: unknown [LIVE_STAT_SLOT:{slot_id}] absent from fact_ledger.json."
                )
            else:
                covered_lines.setdefault(idx, []).append(mapped_fact_id)

    # Check 7A: forward anchor check from ledger facts to script lines
    fact_line_hits: dict[str, list[int]] = {}
    unmatched_episode_facts: list[str] = []
    for fact in episode_facts:
        fid = str(fact.get("fact_id", ""))
        anchors = fact.get("script_anchors", [])
        candidates: list[str] = []
        if isinstance(anchors, list):
            candidates.extend(str(a).strip() for a in anchors if str(a).strip())
        slot_m = LIVE_SLOT_PREFIX_RE.match(str(fact.get("refresh_instructions", "")))
        if slot_m:
            candidates.append(f"[LIVE_STAT_SLOT:{slot_m.group(1)}]")

        hit_lines: list[int] = []
        for candidate in candidates:
            cand_lower = candidate.lower()
            for line_no, line_lower in enumerate(lower_lines, start=1):
                if cand_lower in line_lower:
                    if line_no not in hit_lines:
                        hit_lines.append(line_no)
                    if fid not in covered_lines.setdefault(line_no, []):
                        covered_lines[line_no].append(fid)
        hit_lines.sort()
        fact_line_hits[fid] = hit_lines
        if anchors and not hit_lines:
            unmatched_episode_facts.append(fid)
            errors.append(
                f"{fid} ({episode_id}): none of script_anchors {anchors!r} matched in {script_path.name}."
            )

    # Check 7B: reverse scan of empirical tokens inside script lines
    persona_allowlists = ledger_data.get("narrative_persona_allowlists", {})
    ep_allowlist_entries = persona_allowlists.get(episode_id, [])
    allowlist_substrings: list[str] = []
    for item in ep_allowlist_entries:
        if isinstance(item, dict) and item.get("phrase"):
            allowlist_substrings.append(str(item["phrase"]).lower())
        elif isinstance(item, str):
            allowlist_substrings.append(item.lower())

    extracted_claims: list[dict[str, Any]] = []
    unbacked_claims: list[dict[str, Any]] = []
    persona_exempt_count = 0

    for line_no, line in enumerate(lines, start=1):
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        line_lower = stripped.lower()
        for category, pattern in EMPIRICAL_TOKEN_PATTERNS:
            for match in pattern.finditer(stripped):
                token = match.group(0)
                start_idx = max(0, match.start() - 40)
                end_idx = min(len(stripped), match.end() + 45)
                context_window = stripped[start_idx:end_idx].lower()

                is_persona_illustration = any(
                    allow_phrase in context_window or allow_phrase in line_lower
                    for allow_phrase in allowlist_substrings
                    if token.lower() in allow_phrase
                )
                if is_persona_illustration:
                    persona_exempt_count += 1
                    continue

                backing_facts = covered_lines.get(line_no, [])
                record = {
                    "line": line_no,
                    "category": category,
                    "token": token,
                    "backing_fact_ids": backing_facts,
                }
                extracted_claims.append(record)
                if not backing_facts:
                    unbacked_claims.append(record)
                    errors.append(
                        f"Line {line_no}: empirical {category} claim '{token}' has no backing fact_id in ledger."
                    )

    total_emp = len(extracted_claims)
    backed_emp = total_emp - len(unbacked_claims)
    coverage_pct = 100.0 if total_emp == 0 else round(backed_emp / total_emp * 100.0, 2)

    return {
        "script_path": str(script_path),
        "episode_id": episode_id,
        "episode_facts_in_ledger": len(episode_facts),
        "episode_facts_matched_in_script": sum(1 for v in fact_line_hits.values() if v),
        "unmatched_episode_facts": unmatched_episode_facts,
        "empirical_tokens_detected": total_emp,
        "empirical_tokens_backed": backed_emp,
        "narrative_persona_tokens_exempted": persona_exempt_count,
        "empirical_coverage_pct": coverage_pct,
        "live_stat_slot_tokens_in_script": len(live_tokens_found),
        "fact_line_map": fact_line_hits,
        "unbacked_claims": unbacked_claims,
        "warnings": warnings,
        "errors": errors,
        "passed": len(errors) == 0,
    }


def validate_ledger(
    ledger_path: pathlib.Path,
    min_facts: int = 85,
    check_anti_ai: bool = True,
    verify_script_path: pathlib.Path | None = None,
    explicit_episode: str | None = None,
) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []

    if not ledger_path.is_file():
        return {
            "ledger_path": str(ledger_path),
            "passed": False,
            "errors": [f"Ledger file does not exist: {ledger_path}"],
            "warnings": [],
        }

    try:
        raw_content = ledger_path.read_text(encoding="utf-8")
        data = json.loads(raw_content)
    except json.JSONDecodeError as exc:
        return {
            "ledger_path": str(ledger_path),
            "passed": False,
            "errors": [f"Invalid JSON in {ledger_path}: {exc}"],
            "warnings": [],
        }

    if not isinstance(data, dict):
        return {
            "ledger_path": str(ledger_path),
            "passed": False,
            "errors": ["Top-level JSON root must be an object."],
            "warnings": [],
        }

    for top_key in ("schema_version", "deliverable_id", "total_facts", "live_stat_slot_count", "facts"):
        if top_key not in data:
            errors.append(f"Missing top-level metadata key '{top_key}'.")

    facts = data.get("facts")
    if not isinstance(facts, list):
        errors.append("Top-level 'facts' field must be a JSON array.")
        facts = []

    actual_count = len(facts)
    if actual_count < min_facts:
        errors.append(
            f"Fact count {actual_count} falls below minimum threshold of {min_facts} locked claims."
        )

    declared_total = data.get("total_facts")
    if isinstance(declared_total, int) and declared_total != actual_count:
        errors.append(
            f"Top-level total_facts ({declared_total}) disagrees with actual facts length ({actual_count})."
        )

    seen_ids: set[str] = set()
    seen_slot_ids: dict[str, str] = {}
    episodes_covered: set[str] = set()
    formulas_verified = 0
    live_slot_count = 0

    for idx, entry in enumerate(facts):
        loc = f"facts[{idx}]"
        if not isinstance(entry, dict):
            errors.append(f"{loc}: entry must be a JSON object.")
            continue

        fid = entry.get("fact_id", f"<missing@{idx}>")
        loc = f"{fid} (facts[{idx}])"

        # Gate 2: Mandatory fields and exact types
        missing_fields = [k for k in REQUIRED_FACT_FIELDS if k not in entry]
        if missing_fields:
            errors.append(f"{loc}: missing required fields {missing_fields}.")
            continue

        type_error = False
        for field_name, expected_type in REQUIRED_FACT_FIELDS.items():
            val = entry[field_name]
            if expected_type is bool:
                if not isinstance(val, bool):
                    errors.append(f"{loc}: field '{field_name}' must be boolean.")
                    type_error = True
            elif isinstance(val, bool) or not isinstance(val, expected_type):
                errors.append(
                    f"{loc}: field '{field_name}' must be {expected_type.__name__}, got {type(val).__name__}."
                )
                type_error = True
        if type_error:
            continue

        # Gate 3: Unique fact_id and valid episode_refs
        if not FACT_ID_RE.match(fid):
            errors.append(f"{loc}: fact_id '{fid}' must match pattern FL-XXX (e.g., FL-001).")
        if fid in seen_ids:
            errors.append(f"{loc}: duplicate fact_id '{fid}'.")
        seen_ids.add(fid)

        ep_refs = entry["episode_refs"]
        if not ep_refs:
            errors.append(f"{loc}: episode_refs must contain at least one episode ID.")
        seen_ep_in_entry: set[str] = set()
        for ep in ep_refs:
            if not isinstance(ep, str) or not EPISODE_ID_RE.match(ep):
                errors.append(f"{loc}: invalid episode reference '{ep}' (expected ep_01..ep_30).")
            elif ep in seen_ep_in_entry:
                errors.append(f"{loc}: duplicate episode reference '{ep}' within episode_refs.")
            else:
                seen_ep_in_entry.add(ep)
                episodes_covered.add(ep)

        # Gate 4: Non-empty strings, minimum depth, and valid publication date
        for str_field in (
            "claim_summary",
            "exact_value",
            "unit",
            "institution",
            "source_document",
            "table_or_section",
            "publication_date",
            "verification_formula",
            "adversarial_caveat",
            "refresh_instructions",
        ):
            text_val = entry[str_field].strip()
            if not text_val:
                errors.append(f"{loc}: field '{str_field}' must be non-empty.")
            elif PLACEHOLDER_RE.search(text_val):
                errors.append(f"{loc}: field '{str_field}' contains unfinished placeholder text.")

        if len(entry["claim_summary"].strip()) < 25:
            errors.append(f"{loc}: claim_summary is too terse (<25 chars).")
        if len(entry["adversarial_caveat"].strip()) < 35:
            errors.append(f"{loc}: adversarial_caveat is too terse (<35 chars).")

        date_ok, date_msg = validate_iso_publication_date(entry["publication_date"].strip())
        if not date_ok:
            errors.append(f"{loc}: {date_msg}")

        # Gate 5: Safe AST arithmetic verification_formula check
        formula_ok, formula_msg = validate_formula_expression(entry["verification_formula"])
        if not formula_ok:
            errors.append(f"{loc}: {formula_msg}")
        else:
            formulas_verified += 1

        # Gate 6: [LIVE_STAT_SLOT] governance rules
        refresh_text = entry["refresh_instructions"].strip()
        if entry["is_live_stat_slot"]:
            live_slot_count += 1
            slot_match = LIVE_SLOT_PREFIX_RE.match(refresh_text)
            if not slot_match:
                errors.append(
                    f"{loc}: is_live_stat_slot=true requires refresh_instructions starting with "
                    "'[LIVE_STAT_SLOT:<UPPER_SNAKE_ID>] <instructions>'."
                )
            else:
                slot_id, instructions_body = slot_match.groups()
                if slot_id in seen_slot_ids:
                    errors.append(
                        f"{loc}: duplicate LIVE_STAT_SLOT ID '{slot_id}' (already used by {seen_slot_ids[slot_id]})."
                    )
                seen_slot_ids[slot_id] = fid
                if "THESIS_BREAK_IF:" not in instructions_body:
                    errors.append(
                        f"{loc}: LIVE_STAT_SLOT refresh_instructions must include a 'THESIS_BREAK_IF:' threshold."
                    )
                if not re.search(r"\b(?:72h|48h|24h|shoot week|quarterly|monthly|annual)\b", instructions_body, re.IGNORECASE):
                    errors.append(
                        f"{loc}: LIVE_STAT_SLOT refresh_instructions must state a concrete refresh window."
                    )
        else:
            if "[LIVE_STAT_SLOT" in refresh_text:
                errors.append(
                    f"{loc}: is_live_stat_slot=false cannot include '[LIVE_STAT_SLOT' marker."
                )
            if not refresh_text.startswith("STATIC_LOCK:"):
                errors.append(
                    f"{loc}: is_live_stat_slot=false requires refresh_instructions starting with 'STATIC_LOCK:'."
                )

        # Gate 7A: Anti-AI prose scan on authored prose fields
        for prose_field in ("claim_summary", "adversarial_caveat", "refresh_instructions"):
            errors.extend(
                scan_prose_anti_ai(
                    entry[prose_field],
                    f"{loc}.{prose_field}",
                    check_enabled=check_anti_ai,
                )
            )

    declared_live_slots = data.get("live_stat_slot_count")
    if isinstance(declared_live_slots, int) and declared_live_slots != live_slot_count:
        errors.append(
            f"Top-level live_stat_slot_count ({declared_live_slots}) disagrees with actual count ({live_slot_count})."
        )

    expected_all_episodes = {f"ep_{i:02d}" for i in range(1, 31)}
    missing_episodes = sorted(expected_all_episodes - episodes_covered)
    if missing_episodes:
        warnings.append(f"Episodes without dedicated anchor claims in ledger: {missing_episodes}")

    script_report: dict[str, Any] | None = None
    if verify_script_path is not None:
        script_report = verify_script_coverage(
            ledger_data=data,
            script_path=verify_script_path,
            explicit_episode=explicit_episode,
        )
        errors.extend(script_report.get("errors", []))
        warnings.extend(script_report.get("warnings", []))

    return {
        "ledger_path": str(ledger_path),
        "schema_version": data.get("schema_version"),
        "total_facts": actual_count,
        "min_facts_required": min_facts,
        "formulas_verified": formulas_verified,
        "live_stat_slots": live_slot_count,
        "static_locked_facts": actual_count - live_slot_count,
        "episodes_covered_count": len(episodes_covered),
        "missing_episodes": missing_episodes,
        "anti_ai_prose_checked": check_anti_ai,
        "script_verification": script_report,
        "warnings": warnings,
        "errors": errors,
        "passed": len(errors) == 0,
    }


def format_human_report(report: dict[str, Any]) -> str:
    lines: list[str] = []
    status = "PASS" if report["passed"] else "FAIL"
    lines.append(f"[{status}] Fact-Lock & Primary Citation Ledger Audit")
    lines.append(f"  Ledger file           : {report.get('ledger_path')}")
    if "total_facts" in report:
        lines.append(
            f"  Locked primary claims : {report['total_facts']} (minimum required: {report['min_facts_required']})"
        )
        lines.append(
            f"  AST math verified     : {report['formulas_verified']} / {report['total_facts']}"
        )
        lines.append(
            f"  Live stat slots       : {report['live_stat_slots']} active | {report['static_locked_facts']} static locks"
        )
        lines.append(
            f"  30-episode slate span : {report['episodes_covered_count']} / 30 episodes anchored"
        )
        lines.append(
            f"  Anti-AI prose gate    : {'ENABLED (0 violations)' if report['anti_ai_prose_checked'] and not report['errors'] else ('ENABLED' if report['anti_ai_prose_checked'] else 'SKIPPED')}"
        )

    script_rep = report.get("script_verification")
    if script_rep:
        s_status = "PASS" if script_rep["passed"] else "FAIL"
        lines.append("")
        lines.append(f"[{s_status}] Script Claim Coverage Verification ({script_rep.get('episode_id')})")
        lines.append(f"  Script path           : {script_rep.get('script_path')}")
        if "episode_facts_in_ledger" in script_rep:
            lines.append(
                f"  Episode ledger facts  : {script_rep['episode_facts_matched_in_script']} / "
                f"{script_rep['episode_facts_in_ledger']} matched to spoken script lines"
            )
            lines.append(
                f"  Empirical script stats: {script_rep['empirical_tokens_backed']} / "
                f"{script_rep['empirical_tokens_detected']} backed ({script_rep['empirical_coverage_pct']}%)"
            )
            lines.append(
                f"  Persona illustrations : {script_rep['narrative_persona_tokens_exempted']} documented character/unit tokens exempted"
            )

    if report.get("warnings"):
        lines.append("")
        lines.append(f"Warnings ({len(report['warnings'])}):")
        for warn in report["warnings"]:
            lines.append(f"  - {warn}")

    if report.get("errors"):
        lines.append("")
        lines.append(f"Validation Errors ({len(report['errors'])}):")
        for err in report["errors"]:
            lines.append(f"  - {err}")

    return "\n".join(lines)


def build_arg_parser() -> argparse.ArgumentParser:
    default_ledger = (
        pathlib.Path(__file__).resolve().parent.parent / "data" / "fact_ledger.json"
    )
    parser = argparse.ArgumentParser(
        prog="validate_fact_ledger.py",
        description=(
            "Validate The Reading Room Primary Citation Ledger (schema, duplicate IDs, "
            "ISO dates, safe AST arithmetic formulas, [LIVE_STAT_SLOT] rules, Anti-AI prose, "
            "and bidirectional script claim coverage)."
        ),
    )
    parser.add_argument(
        "--ledger",
        type=pathlib.Path,
        default=default_ledger,
        help=f"Path to fact_ledger.json (default: {default_ledger})",
    )
    parser.add_argument(
        "--verify-script",
        dest="verify_script",
        type=pathlib.Path,
        default=None,
        help="Optional Markdown script or dossier path to audit for 100%% primary claim backing.",
    )
    parser.add_argument(
        "--episode",
        type=str,
        default=None,
        help="Explicit episode ID override (e.g., ep_01) when running --verify-script.",
    )
    parser.add_argument(
        "--min-facts",
        dest="min_facts",
        type=int,
        default=85,
        help="Minimum number of verified claims required in the ledger (default: 85).",
    )
    parser.add_argument(
        "--no-anti-ai",
        dest="no_anti_ai",
        action="store_true",
        help="Skip Anti-AI vocabulary, contrast-crutch, and dash checks on prose fields.",
    )
    parser.add_argument(
        "--audit-markdown",
        dest="audit_markdown",
        type=pathlib.Path,
        default=None,
        help="Optional Markdown specification file to scan for Anti-AI prose compliance.",
    )
    parser.add_argument(
        "--json",
        dest="as_json",
        action="store_true",
        help="Emit validation results as formatted JSON.",
    )
    return parser


def scan_markdown_file_anti_ai(md_path: pathlib.Path) -> list[str]:
    if not md_path.is_file():
        return [f"Markdown file not found: {md_path}"]
    raw = md_path.read_text(encoding="utf-8")
    violations: list[str] = []
    in_code_fence = False
    for line_no, line in enumerate(raw.splitlines(), start=1):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code_fence = not in_code_fence
            continue
        if in_code_fence:
            continue
        # Strip inline code spans so quoted regex/CLI flags inside backticks are preserved
        prose_only = re.sub(r"`[^`]*`", " ", line)
        violations.extend(
            scan_prose_anti_ai(prose_only, f"{md_path.name}:L{line_no}", check_enabled=True)
        )
    return violations


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    report = validate_ledger(
        ledger_path=args.ledger.resolve(),
        min_facts=args.min_facts,
        check_anti_ai=not args.no_anti_ai,
        verify_script_path=args.verify_script.resolve() if args.verify_script else None,
        explicit_episode=args.episode,
    )

    if args.audit_markdown is not None:
        md_violations = scan_markdown_file_anti_ai(args.audit_markdown.resolve())
        report["markdown_audit"] = {
            "path": str(args.audit_markdown.resolve()),
            "violations": md_violations,
            "passed": len(md_violations) == 0,
        }
        if md_violations:
            report["errors"].extend(md_violations)
            report["passed"] = False

    if args.as_json:
        print(json.dumps(report, indent=2))
    else:
        print(format_human_report(report))

    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
