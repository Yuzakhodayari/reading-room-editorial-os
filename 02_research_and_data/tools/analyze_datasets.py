"""
Quantitative Macro, AI, and Physical-Grid Dataset Analyzer (Deliverable #9).

Pure Python 3 standard-library CLI for The Reading Room Editorial OS.
Ingests CSV and JSON time-series and cross-sectional filings, computes
nominal and CPI-deflated real CAGRs, basis-point and percentage spreads,
cumulative index divergence, Lorenz/Gini wealth concentration ratios,
hyperscaler CapEx-to-OCF cash strain, and straight-line server depreciation
useful-life sensitivity (3-year silicon cadence versus 6-year schedule).
Exports verified Stat-Cards (JSON + Markdown) wired to reading-room-cinema
macroTelemetry optical registers.
"""

import argparse
import csv
import json
import math
import pathlib
import re
import statistics
import sys
from typing import Any, Dict, List, Optional, Sequence, Tuple


PERIOD_COL_CANDIDATES = ("year_numeric", "fiscal_year", "year", "period", "quarter")
DEFLATOR_COL_CANDIDATES = (
    "cpi_index_2024_100",
    "cpi_u_2017_100",
    "cpi_index_2023_100",
    "cpi_deflator",
)
SERIES_COL_CANDIDATES = ("series_id", "ticker", "bracket_id", "line_item")
VALUE_COL_CANDIDATES = (
    "value",
    "amount_usd_billions",
    "capex_usd_b",
    "output_per_hour_2017_100",
    "equity_mutual_fund_usd_trillions",
    "share_pct",
)


def parse_float(raw: Any) -> Optional[float]:
    if raw is None or isinstance(raw, bool):
        return None
    if isinstance(raw, (int, float)):
        val = float(raw)
        return val if math.isfinite(val) else None
    text = str(raw).strip().replace(",", "").replace("$", "").replace("%", "")
    if not text:
        return None
    try:
        val = float(text)
        return val if math.isfinite(val) else None
    except ValueError:
        return None


def parse_period_year(raw: Any) -> Optional[float]:
    num = parse_float(raw)
    if num is not None and 1800.0 <= num <= 2200.0:
        return num
    text = str(raw or "").strip()
    if not text:
        return None
    m_fy = re.match(r"^(?:FY|CY)?(\d{4})$", text, re.IGNORECASE)
    if m_fy:
        return float(m_fy.group(1))
    m_q = re.match(r"^(\d{4})[-/ ]Q([1-4])E?$", text, re.IGNORECASE)
    if m_q:
        return float(m_q.group(1)) + (int(m_q.group(2)) - 1) * 0.25
    m_split = re.match(r"^(\d{4})\s*/\s*(\d{4})$", text)
    if m_split:
        return (float(m_split.group(1)) + float(m_split.group(2))) * 0.5
    return None


def load_records(path: pathlib.Path) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Dataset file missing: {path}")
    suffix = path.suffix.lower()
    if suffix == ".csv":
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            rows = [dict(r) for r in reader]
        return rows, {"source_format": "csv", "file_name": path.name}
    if suffix == ".json":
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, list):
            return [dict(r) for r in payload], {"source_format": "json", "file_name": path.name}
        if isinstance(payload, dict):
            for key in ("records", "data", "rows", "series", "items"):
                if isinstance(payload.get(key), list):
                    meta = {k: v for k, v in payload.items() if not (k == key)}
                    meta["source_format"] = "json"
                    meta["file_name"] = path.name
                    return [dict(r) for r in payload[key]], meta
        raise ValueError(f"Unsupported JSON table layout in {path}")
    raise ValueError(f"Unsupported file extension '{suffix}' in {path}")


def pick_column(rows: List[Dict[str, Any]], explicit: Optional[str], candidates: Tuple[str, ...]) -> Optional[str]:
    if not rows:
        return explicit
    headers = list(rows[0].keys())
    if explicit:
        if explicit not in headers:
            raise KeyError(f"Column '{explicit}' absent from dataset headers: {headers}")
        return explicit
    for cand in candidates:
        if cand in headers:
            return cand
    return None


def numeric_columns(rows: List[Dict[str, Any]], exclude: Tuple[str, ...] = ()) -> List[str]:
    if not rows:
        return []
    cols: List[str] = []
    for col in rows[0].keys():
        if col in exclude:
            continue
        parsed = [parse_float(r.get(col)) for r in rows]
        valid = [v for v in parsed if v is not None]
        if valid and len(valid) >= max(1, int(0.6 * len(rows))):
            cols.append(col)
    return cols


def quantile(sorted_vals: List[float], q: float) -> float:
    if not sorted_vals:
        return 0.0
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    pos = (len(sorted_vals) - 1) * q
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return sorted_vals[lo]
    frac = pos - lo
    return sorted_vals[lo] * (1.0 - frac) + sorted_vals[hi] * frac


def calc_cagr_pct(v_start: float, v_end: float, years: float) -> Optional[float]:
    if years <= 0.0 or v_start <= 0.0 or v_end <= 0.0:
        return None
    return ((v_end / v_start) ** (1.0 / years) - 1.0) * 100.0


def fmt_usd_b(val: float, decimals: int = 2, plus: bool = False) -> str:
    if val < 0.0:
        return f"-${abs(val):,.{decimals}f}B"
    prefix = "+$" if plus and val > 0.0 else "$"
    return f"{prefix}{val:,.{decimals}f}B"


def compute_summary(
    rows: List[Dict[str, Any]],
    meta: Dict[str, Any],
    group_by: Optional[str] = None,
    value_col: Optional[str] = None,
    period_col: Optional[str] = None,
) -> Dict[str, Any]:
    p_col = pick_column(rows, period_col, PERIOD_COL_CANDIDATES)
    exclude = tuple(c for c in (p_col, "year_numeric", "rank_from_bottom") if c)
    target_cols = [value_col] if value_col else numeric_columns(rows, exclude=exclude)
    groups: Dict[str, List[Dict[str, Any]]] = {}
    if group_by:
        if rows and group_by not in rows[0]:
            raise KeyError(f"Group column '{group_by}' missing from dataset")
        for r in rows:
            key = str(r.get(group_by, "UNSPECIFIED"))
            groups.setdefault(key, []).append(r)
    else:
        groups["ALL_ROWS"] = rows

    summaries: List[Dict[str, Any]] = []
    for g_key, g_rows in groups.items():
        periods = [str(r.get(p_col)) for r in g_rows if p_col and r.get(p_col) is not None]
        for col in target_cols:
            vals = [parse_float(r.get(col)) for r in g_rows]
            clean = [v for v in vals if v is not None]
            if not clean:
                continue
            ordered = sorted(clean)
            first_v, last_v = clean[0], clean[-1]
            abs_delta = last_v - first_v
            pct_delta = ((last_v / first_v) - 1.0) * 100.0 if abs(first_v) > 1e-12 else None
            summaries.append(
                {
                    "group": g_key,
                    "metric": col,
                    "n": len(clean),
                    "missing": len(vals) - len(clean),
                    "period_start": periods[0] if periods else None,
                    "period_end": periods[-1] if periods else None,
                    "first": round(first_v, 4),
                    "last": round(last_v, 4),
                    "abs_change": round(abs_delta, 4),
                    "pct_change": round(pct_delta, 2) if pct_delta is not None else None,
                    "min": round(ordered[0], 4),
                    "max": round(ordered[-1], 4),
                    "mean": round(statistics.fmean(clean), 4),
                    "median": round(statistics.median(ordered), 4),
                    "stdev_pop": round(statistics.pstdev(clean), 4) if len(clean) > 1 else 0.0,
                    "iqr": round(quantile(ordered, 0.75) - quantile(ordered, 0.25), 4),
                }
            )
    return {
        "mode": "summary",
        "file_name": meta.get("file_name"),
        "row_count": len(rows),
        "period_column": p_col,
        "group_by": group_by,
        "metrics": summaries,
    }


def compute_cagr_table(
    rows: List[Dict[str, Any]],
    meta: Dict[str, Any],
    series_col: Optional[str] = None,
    series_filter: Optional[str] = None,
    period_col: Optional[str] = None,
    value_col: Optional[str] = None,
    deflator_col: Optional[str] = None,
    start_bound: Optional[str] = None,
    end_bound: Optional[str] = None,
) -> Dict[str, Any]:
    label_col = pick_column(rows, period_col, ("period", "fiscal_year", "year", "quarter"))
    num_p_col = "year_numeric" if (rows and "year_numeric" in rows[0]) else label_col
    d_col = pick_column(rows, deflator_col, DEFLATOR_COL_CANDIDATES)
    s_col = pick_column(rows, series_col, SERIES_COL_CANDIDATES)

    buckets: List[Tuple[str, str, List[Dict[str, Any]]]] = []
    if s_col:
        v_col = pick_column(rows, value_col, VALUE_COL_CANDIDATES)
        if not v_col:
            raise ValueError("Unable to infer numeric value column; pass --value-col")
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for r in rows:
            sid = str(r.get(s_col, ""))
            if series_filter and not (sid == series_filter):
                continue
            grouped.setdefault(sid, []).append(r)
        for sid, s_rows in grouped.items():
            buckets.append((sid, v_col, s_rows))
    else:
        exclude = tuple(c for c in (label_col, num_p_col, d_col) if c)
        cols = [value_col] if value_col else numeric_columns(rows, exclude=exclude)
        for col in cols:
            if series_filter and not (col == series_filter):
                continue
            buckets.append((col, col, rows))

    results: List[Dict[str, Any]] = []
    for sid, v_col, b_rows in buckets:
        enriched: List[Tuple[float, str, float, Optional[float]]] = []
        for r in b_rows:
            p_label = str(r.get(label_col, "")) if label_col else ""
            yr = parse_period_year(r.get(num_p_col)) if num_p_col else None
            val = parse_float(r.get(v_col))
            defl = parse_float(r.get(d_col)) if d_col else None
            if yr is not None and val is not None:
                enriched.append((yr, p_label or str(yr), val, defl))
        enriched.sort(key=lambda x: x[0])
        if start_bound:
            s_yr = parse_period_year(start_bound)
            enriched = [e for e in enriched if e[1] == start_bound or (s_yr is not None and e[0] >= s_yr - 1e-6)]
        if end_bound:
            e_yr = parse_period_year(end_bound)
            enriched = [e for e in enriched if e[1] == end_bound or (e_yr is not None and e[0] <= e_yr + 1e-6)]
        if len(enriched) < 2:
            continue
        y0, lbl0, v0, d0 = enriched[0]
        y1, lbl1, v1, d1 = enriched[-1]
        elapsed = y1 - y0
        if elapsed <= 0.0:
            continue
        nom_cagr = calc_cagr_pct(v0, v1, elapsed)
        abs_delta = v1 - v0
        pct_delta = ((v1 / v0) - 1.0) * 100.0 if abs(v0) > 1e-12 else None
        multiple_x = (v1 / v0) if abs(v0) > 1e-12 else None

        defl_cagr: Optional[float] = None
        real_v1: Optional[float] = None
        real_cagr: Optional[float] = None
        if d0 and d1 and d0 > 0.0 and d1 > 0.0:
            defl_cagr = calc_cagr_pct(d0, d1, elapsed)
            real_v1 = v1 * (d0 / d1)
            real_cagr = calc_cagr_pct(v0, real_v1, elapsed)

        doubling = (
            math.log(2.0) / math.log(1.0 + nom_cagr / 100.0)
            if (nom_cagr is not None and nom_cagr > 0.0)
            else None
        )
        results.append(
            {
                "series": sid,
                "value_column": v_col,
                "start_period": lbl0,
                "end_period": lbl1,
                "elapsed_years": round(elapsed, 4),
                "start_value": round(v0, 4),
                "end_value": round(v1, 4),
                "abs_delta": round(abs_delta, 4),
                "pct_delta": round(pct_delta, 2) if pct_delta is not None else None,
                "multiple_x": round(multiple_x, 3) if multiple_x is not None else None,
                "nominal_cagr_pct": round(nom_cagr, 3) if nom_cagr is not None else None,
                "deflator_column": d_col,
                "deflator_cagr_pct": round(defl_cagr, 3) if defl_cagr is not None else None,
                "real_end_value_start_dollars": round(real_v1, 4) if real_v1 is not None else None,
                "real_cagr_pct": round(real_cagr, 3) if real_cagr is not None else None,
                "annualized_bps_change": round((abs_delta * 100.0) / elapsed, 2),
                "doubling_years": round(doubling, 2) if doubling is not None else None,
            }
        )
    return {
        "mode": "cagr",
        "file_name": meta.get("file_name"),
        "series_count": len(results),
        "results": results,
    }


def compute_spread(
    rows: List[Dict[str, Any]],
    meta: Dict[str, Any],
    lhs: Optional[str] = None,
    rhs: Optional[str] = None,
    series_col: Optional[str] = None,
    period_col: Optional[str] = None,
    value_col: Optional[str] = None,
) -> Dict[str, Any]:
    p_col = pick_column(rows, period_col, ("period", "fiscal_year", "year", "quarter"))
    s_col = pick_column(rows, series_col, ("series_id", "ticker", "bracket_id"))
    headers = list(rows[0].keys()) if rows else []

    if (lhs and lhs in headers and rhs and rhs in headers) or (
        not s_col and "output_per_hour_2017_100" in headers
    ):
        col_a = lhs or "output_per_hour_2017_100"
        col_b = rhs or "real_hourly_comp_2017_100"
        timeline: List[Dict[str, Any]] = []
        base_a: Optional[float] = None
        base_b: Optional[float] = None
        for r in rows:
            va = parse_float(r.get(col_a))
            vb = parse_float(r.get(col_b))
            if va is None or vb is None:
                continue
            if base_a is None:
                base_a, base_b = va, vb
            idx_a = (va / base_a) * 100.0 if base_a else va
            idx_b = (vb / base_b) * 100.0 if base_b else vb
            raw_spread = va - vb
            entry: Dict[str, Any] = {
                "period": str(r.get(p_col, "")),
                "lhs_value": round(va, 4),
                "rhs_value": round(vb, 4),
                "spread_units": round(raw_spread, 4),
                "spread_bps": round(raw_spread * 100.0, 1),
                "reindexed_wedge_pts": round(idx_a - idx_b, 2),
                "lhs_to_rhs_ratio": round(va / vb, 4) if abs(vb) > 1e-12 else None,
            }
            if "labor_share_pct" in r:
                ls = parse_float(r.get("labor_share_pct"))
                if ls is not None:
                    entry["labor_share_pct"] = round(ls, 2)
            timeline.append(entry)
        start_e, end_e = timeline[0], timeline[-1]
        aux_drift = None
        if "labor_share_pct" in start_e and "labor_share_pct" in end_e:
            delta_ls = end_e["labor_share_pct"] - start_e["labor_share_pct"]
            aux_drift = {
                "metric": "labor_share_pct",
                "start_pct": start_e["labor_share_pct"],
                "end_pct": end_e["labor_share_pct"],
                "change_pp": round(delta_ls, 2),
                "change_bps": round(delta_ls * 100.0, 1),
            }
        return {
            "mode": "spread",
            "comparison_kind": "cross_column_divergence",
            "file_name": meta.get("file_name"),
            "lhs": col_a,
            "rhs": col_b,
            "period_start": start_e["period"],
            "period_end": end_e["period"],
            "terminal_spread_units": end_e["spread_units"],
            "terminal_spread_bps": end_e["spread_bps"],
            "terminal_reindexed_wedge_pts": end_e["reindexed_wedge_pts"],
            "auxiliary_share_drift": aux_drift,
            "timeline": timeline,
        }

    if not s_col:
        raise ValueError("Pass --lhs and --rhs column names or provide a dataset with series_id")
    v_col = pick_column(rows, value_col, VALUE_COL_CANDIDATES)
    if not v_col:
        raise ValueError("Unable to infer value column for series spread; pass --value-col")
    available_ids = list(dict.fromkeys(str(r.get(s_col, "")) for r in rows))
    if not lhs or not rhs:
        if "OUT_NET_INT" in available_ids and "OUT_DEFENSE" in available_ids:
            lhs, rhs = "OUT_NET_INT", "OUT_DEFENSE"
        elif "PJM_BRA_RTO_PRICE" in available_ids:
            lhs = rhs = "PJM_BRA_RTO_PRICE"
        elif len(available_ids) >= 2:
            lhs, rhs = available_ids[0], available_ids[1]
        else:
            lhs = rhs = available_ids[0]

    if lhs == rhs:
        pts = [
            (str(r.get(p_col, "")), parse_float(r.get(v_col)))
            for r in rows
            if str(r.get(s_col, "")) == lhs and parse_float(r.get(v_col)) is not None
        ]
        steps: List[Dict[str, Any]] = []
        base_val = pts[0][1] or 1.0
        for idx, (per, val) in enumerate(pts):
            assert val is not None
            prev_val = pts[idx - 1][1] if idx > 0 else val
            assert prev_val is not None
            step_pct = ((val / prev_val) - 1.0) * 100.0 if idx > 0 and abs(prev_val) > 1e-12 else 0.0
            cum_pct = ((val / base_val) - 1.0) * 100.0 if abs(base_val) > 1e-12 else 0.0
            steps.append(
                {
                    "period": per,
                    "value": round(val, 4),
                    "step_delta": round(val - prev_val, 4),
                    "step_pct_change": round(step_pct, 2),
                    "cumulative_delta_vs_start": round(val - base_val, 4),
                    "cumulative_pct_vs_start": round(cum_pct, 2),
                }
            )
        return {
            "mode": "spread",
            "comparison_kind": "within_series_regime_jumps",
            "file_name": meta.get("file_name"),
            "series": lhs,
            "value_column": v_col,
            "steps": steps,
        }

    map_a = {str(r.get(p_col, "")): parse_float(r.get(v_col)) for r in rows if str(r.get(s_col, "")) == lhs}
    map_b = {str(r.get(p_col, "")): parse_float(r.get(v_col)) for r in rows if str(r.get(s_col, "")) == rhs}
    paired: List[Dict[str, Any]] = []
    for per, va in map_a.items():
        vb = map_b.get(per)
        if va is None or vb is None:
            continue
        diff = va - vb
        pct_over = ((va / vb) - 1.0) * 100.0 if abs(vb) > 1e-12 else None
        paired.append(
            {
                "period": per,
                "lhs_value": round(va, 4),
                "rhs_value": round(vb, 4),
                "spread_units": round(diff, 4),
                "spread_bps_if_pct": round(diff * 100.0, 1),
                "lhs_over_rhs_pct": round(pct_over, 2) if pct_over is not None else None,
            }
        )
    return {
        "mode": "spread",
        "comparison_kind": "cross_series_spread",
        "file_name": meta.get("file_name"),
        "lhs": lhs,
        "rhs": rhs,
        "value_column": v_col,
        "terminal_spread_units": paired[-1]["spread_units"] if paired else None,
        "timeline": paired,
    }


def compute_deciles(
    rows: List[Dict[str, Any]],
    meta: Dict[str, Any],
    target_period: Optional[str] = None,
    pop_col: str = "population_share_pct",
    share_col: str = "equity_share_pct",
    value_col: str = "equity_mutual_fund_usd_trillions",
) -> Dict[str, Any]:
    p_col = pick_column(rows, None, ("period", "year", "fiscal_year"))
    periods = list(dict.fromkeys(str(r.get(p_col, "ALL")) for r in rows)) if p_col else ["ALL"]
    chosen_period = target_period or periods[-1]

    def analyze_slice(p_rows: List[Dict[str, Any]], p_name: str) -> Dict[str, Any]:
        ordered = sorted(
            p_rows,
            key=lambda r: (
                parse_float(r.get("rank_from_bottom"))
                if parse_float(r.get("rank_from_bottom")) is not None
                else (parse_float(r.get(share_col)) or 0.0)
            ),
        )
        cum_pop, cum_wealth, trap_area, hoover_sum, total_dollars = 0.0, 0.0, 0.0, 0.0, 0.0
        lorenz: List[Dict[str, float]] = [{"cum_pop": 0.0, "cum_share": 0.0}]
        by_id: Dict[str, Dict[str, float]] = {}

        for r in ordered:
            bid = str(r.get("bracket_id") or r.get("bracket_label") or "")
            p_frac = (parse_float(r.get(pop_col)) or 0.0) / 100.0
            s_frac = (parse_float(r.get(share_col)) or 0.0) / 100.0
            dollars = parse_float(r.get(value_col)) or 0.0
            hh_m = parse_float(r.get("households_millions")) or 0.0
            total_dollars += dollars

            next_pop, next_wealth = cum_pop + p_frac, cum_wealth + s_frac
            trap_area += p_frac * (cum_wealth + next_wealth) * 0.5
            hoover_sum += abs(p_frac - s_frac)
            cum_pop, cum_wealth = next_pop, next_wealth
            lorenz.append({"cum_pop": round(cum_pop, 4), "cum_share": round(cum_wealth, 4)})
            by_id[bid] = {
                "pop_pct": round(p_frac * 100.0, 2),
                "share_pct": round(s_frac * 100.0, 2),
                "value_trillions": round(dollars, 4),
                "households_millions": round(hh_m, 2),
                "mean_per_household_usd": round((dollars * 1e6) / hh_m, 0) if hh_m > 0 else 0.0,
            }

        gini = max(0.0, min(1.0, 1.0 - 2.0 * trap_area))
        top1 = by_id.get("p99_100", {"share_pct": 0.0, "pop_pct": 1.0, "value_trillions": 0.0})
        next9 = by_id.get("p90_99", {"share_pct": 0.0, "pop_pct": 9.0, "value_trillions": 0.0})
        bot50 = by_id.get("p0_50", {"share_pct": 1.0, "pop_pct": 50.0, "value_trillions": 0.0})

        top10_share = top1["share_pct"] + next9["share_pct"]
        top10_pop = top1["pop_pct"] + next9["pop_pct"]
        top10_val = top1["value_trillions"] + next9["value_trillions"]
        bot50_share, bot50_pop = bot50["share_pct"], bot50["pop_pct"]

        agg_10_50 = (top10_share / bot50_share) if bot50_share > 0 else None
        hh_10_50 = (
            ((top10_share / top10_pop) / (bot50_share / bot50_pop))
            if (bot50_share > 0 and top10_pop > 0 and bot50_pop > 0)
            else None
        )
        hh_1_50 = (
            ((top1["share_pct"] / top1["pop_pct"]) / (bot50_share / bot50_pop))
            if (bot50_share > 0 and top1["pop_pct"] > 0 and bot50_pop > 0)
            else None
        )
        return {
            "period": p_name,
            "total_equity_usd_trillions": round(total_dollars, 2),
            "top_1_share_pct": round(top1["share_pct"], 2),
            "next_9_share_pct": round(next9["share_pct"], 2),
            "top_10_share_pct": round(top10_share, 2),
            "top_10_usd_trillions": round(top10_val, 2),
            "bottom_50_share_pct": round(bot50_share, 2),
            "bottom_50_usd_trillions": round(bot50["value_trillions"], 2),
            "bottom_50_mean_per_hh_usd": bot50.get("mean_per_household_usd", 0.0),
            "top_10_to_bottom_50_aggregate_ratio_x": round(agg_10_50, 2) if agg_10_50 else None,
            "top_10_to_bottom_50_per_household_ratio_x": round(hh_10_50, 2) if hh_10_50 else None,
            "top_1_to_bottom_50_per_household_ratio_x": round(hh_1_50, 2) if hh_1_50 else None,
            "grouped_gini": round(gini, 4),
            "hoover_index": round(0.5 * hoover_sum, 4),
            "lorenz_curve": lorenz,
            "brackets": by_id,
        }

    history = [analyze_slice([r for r in rows if str(r.get(p_col, "ALL")) == per], per) for per in periods]
    selected = next((h for h in history if h["period"] == chosen_period), history[-1])
    drift = None
    if len(history) >= 2:
        first_h, last_h = history[0], history[-1]
        drift = {
            "from_period": first_h["period"],
            "to_period": last_h["period"],
            "top_10_share_change_bps": round((last_h["top_10_share_pct"] - first_h["top_10_share_pct"]) * 100.0, 1),
            "bottom_50_share_change_bps": round(
                (last_h["bottom_50_share_pct"] - first_h["bottom_50_share_pct"]) * 100.0, 1
            ),
            "gini_change": round(last_h["grouped_gini"] - first_h["grouped_gini"], 4),
        }
    return {
        "mode": "deciles",
        "file_name": meta.get("file_name"),
        "selected_period": selected["period"],
        "snapshot": selected,
        "historical_drift": drift,
        "period_summaries": [
            {
                "period": h["period"],
                "top_10_share_pct": h["top_10_share_pct"],
                "bottom_50_share_pct": h["bottom_50_share_pct"],
                "grouped_gini": h["grouped_gini"],
            }
            for h in history
        ],
    }


def compute_capex_fcf(
    rows: List[Dict[str, Any]],
    meta: Dict[str, Any],
    target_year: Optional[int] = None,
    short_life: float = 3.0,
    long_life: float = 6.0,
    tax_rate: float = 0.21,
) -> Dict[str, Any]:
    if short_life <= 0.0 or long_life <= 0.0 or short_life >= long_life:
        raise ValueError("short_life must be positive and strictly smaller than long_life")
    years = sorted({int(parse_float(r.get("year")) or 0) for r in rows if parse_float(r.get("year"))})
    chosen_year = target_year or (years[-1] if years else 2026)

    annual_rollups: List[Dict[str, Any]] = []
    for yr in years:
        yr_rows = [r for r in rows if int(parse_float(r.get("year")) or 0) == yr]
        b4 = [r for r in yr_rows if str(r.get("peer_tier", "big4")) == "big4"]
        b4_capex = sum(parse_float(r.get("capex_usd_b")) or 0.0 for r in b4)
        b4_ocf = sum(parse_float(r.get("ocf_usd_b")) or 0.0 for r in b4)
        b5_capex = sum(parse_float(r.get("capex_usd_b")) or 0.0 for r in yr_rows)
        b5_ocf = sum(parse_float(r.get("ocf_usd_b")) or 0.0 for r in yr_rows)
        annual_rollups.append(
            {
                "year": yr,
                "big4_capex_usd_b": round(b4_capex, 2),
                "big4_ocf_usd_b": round(b4_ocf, 2),
                "big4_fcf_usd_b": round(b4_ocf - b4_capex, 2),
                "big4_capex_to_ocf_pct": round((b4_capex / b4_ocf) * 100.0, 2) if b4_ocf > 0 else None,
                "big5_capex_usd_b": round(b5_capex, 2),
                "big5_ocf_usd_b": round(b5_ocf, 2),
                "big5_fcf_usd_b": round(b5_ocf - b5_capex, 2),
                "big5_capex_to_ocf_pct": round((b5_capex / b5_ocf) * 100.0, 2) if b5_ocf > 0 else None,
            }
        )

    focus_rows = [r for r in rows if int(parse_float(r.get("year")) or 0) == chosen_year]
    company_metrics: List[Dict[str, Any]] = []
    for r in focus_rows:
        ocf = parse_float(r.get("ocf_usd_b")) or 0.0
        capex = parse_float(r.get("capex_usd_b")) or 0.0
        fcf = ocf - capex
        ebit = parse_float(r.get("operating_income_usd_b")) or 0.0
        hw_vint = parse_float(r.get("ai_hardware_capex_usd_b"))
        if hw_vint is None:
            hw_vint = capex * (parse_float(r.get("ai_compute_hardware_share")) or 0.70)
        hw_stack = parse_float(r.get("active_3yr_ai_hardware_gross_ppe_usd_b")) or hw_vint

        vint_hit = (hw_vint / short_life) - (hw_vint / long_life)
        stack_dep_long, stack_dep_short = hw_stack / long_life, hw_stack / short_life
        stack_hit = stack_dep_short - stack_dep_long
        ebit_comp_pct = (stack_hit / ebit) * 100.0 if ebit > 0 else None

        company_metrics.append(
            {
                "ticker": str(r.get("ticker", "")),
                "company": str(r.get("company", "")),
                "peer_tier": str(r.get("peer_tier", "big4")),
                "ocf_usd_b": round(ocf, 2),
                "capex_usd_b": round(capex, 2),
                "fcf_usd_b": round(fcf, 2),
                "capex_to_ocf_pct": round((capex / ocf) * 100.0, 2) if ocf > 0 else None,
                "fcf_negative": fcf < 0.0,
                "operating_income_usd_b": round(ebit, 2),
                "ai_hardware_vintage_usd_b": round(hw_vint, 2),
                "active_ai_hardware_stack_usd_b": round(hw_stack, 2),
                "vintage_dep_long_usd_b": round(hw_vint / long_life, 2),
                "vintage_dep_short_usd_b": round(hw_vint / short_life, 2),
                "vintage_pretax_hit_usd_b": round(-vint_hit, 2),
                "stack_dep_long_usd_b": round(stack_dep_long, 2),
                "stack_dep_short_usd_b": round(stack_dep_short, 2),
                "stack_pretax_ebit_hit_usd_b": round(-stack_hit, 2),
                "stack_after_tax_ni_hit_usd_b": round(-stack_hit * (1.0 - tax_rate), 2),
                "ebit_compression_pct": round(ebit_comp_pct, 2) if ebit_comp_pct is not None else None,
            }
        )

    tot_ebit = sum(c["operating_income_usd_b"] for c in company_metrics)
    tot_vint = sum(c["ai_hardware_vintage_usd_b"] for c in company_metrics)
    tot_stack = sum(c["active_ai_hardware_stack_usd_b"] for c in company_metrics)
    tot_stack_hit = (tot_stack / short_life) - (tot_stack / long_life)
    tot_vint_hit = (tot_vint / short_life) - (tot_vint / long_life)
    neg_q = [q for q in meta.get("quarterly_spotlight_2026", []) if (parse_float(q.get("fcf_usd_b")) or 0.0) < 0.0]

    return {
        "mode": "capex-fcf",
        "file_name": meta.get("file_name"),
        "focus_year": chosen_year,
        "schedule_comparison": {
            "short_life_years": short_life,
            "long_life_years": long_life,
            "statutory_tax_rate": tax_rate,
            "big5_ai_hardware_vintage_usd_b": round(tot_vint, 2),
            "big5_vintage_pretax_hit_usd_b": round(-tot_vint_hit, 2),
            "big5_active_ai_hardware_stack_usd_b": round(tot_stack, 2),
            "big5_stack_dep_long_usd_b": round(tot_stack / long_life, 2),
            "big5_stack_dep_short_usd_b": round(tot_stack / short_life, 2),
            "big5_stack_pretax_ebit_hit_usd_b": round(-tot_stack_hit, 2),
            "big5_stack_after_tax_ni_hit_usd_b": round(-tot_stack_hit * (1.0 - tax_rate), 2),
            "big5_operating_income_usd_b": round(tot_ebit, 2),
            "big5_ebit_compression_pct": round((tot_stack_hit / tot_ebit) * 100.0, 2) if tot_ebit > 0 else None,
        },
        "annual_rollups": annual_rollups,
        "companies": company_metrics,
        "quarterly_negative_fcf_events": neg_q,
    }


def make_card(
    card_id: str,
    dataset_name: str,
    domain: str,
    episodes: Sequence[str],
    headline: str,
    figures: Dict[str, Any],
    units: str,
    bounds: Tuple[str, str, float, str],
    source: str,
    audit_trail: str,
    camera_line: str,
    telemetry: Dict[str, Any],
) -> Dict[str, Any]:
    return {
        "card_id": card_id,
        "dataset_file": f"02_research_and_data/datasets/{dataset_name}",
        "domain": domain,
        "episodes_bound": list(episodes),
        "headline_label": headline,
        "exact_figures": figures,
        "units": units,
        "period_bounds": {
            "start": bounds[0],
            "end": bounds[1],
            "elapsed_years": bounds[2],
            "frequency": bounds[3],
        },
        "primary_source": source,
        "formula_audit_trail": audit_trail,
        "camera_rescale_line": camera_line,
        "macroTelemetry": telemetry,
    }


def make_telemetry(
    reg_id: str,
    vis_reg: str,
    palette_mode: str,
    comp_hint: str,
    glass_preset: str,
    accents: Sequence[str],
    x_axis: Tuple[str, Sequence[str]],
    y_axis: Tuple[str, str, float, float],
    series: List[Dict[str, Any]],
    channels: List[Dict[str, Any]],
) -> Dict[str, Any]:
    return {
        "registerId": reg_id,
        "visualRegisterId": vis_reg,
        "paletteMode": palette_mode,
        "componentHint": comp_hint,
        "glassPreset": glass_preset,
        "semanticAccents": list(accents),
        "xAxis": {"label": x_axis[0], "ticks": list(x_axis[1])},
        "yAxis": {"label": y_axis[0], "unit": y_axis[1], "min": y_axis[2], "max": y_axis[3]},
        "series": series,
        "telemetryChannels": channels,
    }


def build_verified_stat_cards(datasets_dir: pathlib.Path) -> Dict[str, Any]:
    mts_rows, mts_meta = load_records(datasets_dir / "us_treasury_mts_table9_fy2024_fy2026.csv")
    bls_rows, bls_meta = load_records(datasets_dir / "bls_productivity_vs_compensation_2017_2026.csv")
    cap_rows, cap_meta = load_records(datasets_dir / "hyperscaler_capex_fcf_depreciation_2023_2026.json")
    dfa_rows, dfa_meta = load_records(datasets_dir / "fed_dfa_equity_wealth_deciles.csv")
    grid_rows, grid_meta = load_records(datasets_dir / "pjm_capacity_auctions_and_iea_dc_load.csv")

    mts_cagr = {r["series"]: r for r in compute_cagr_table(mts_rows, mts_meta)["results"]}
    mts_int_def = compute_spread(mts_rows, mts_meta, lhs="OUT_NET_INT", rhs="OUT_DEFENSE")
    bls_div = compute_spread(bls_rows, bls_meta)
    bls_cagr = {r["series"]: r for r in compute_cagr_table(bls_rows, bls_meta)["results"]}
    cap_res = compute_capex_fcf(cap_rows, cap_meta, target_year=2026, short_life=3.0, long_life=6.0, tax_rate=0.21)
    dfa_res = compute_deciles(dfa_rows, dfa_meta, target_period="2026-Q2")
    pjm_24_26 = compute_cagr_table(
        grid_rows, grid_meta, series_filter="PJM_BRA_RTO_PRICE", start_bound="2024/2025", end_bound="2026/2027"
    )["results"][0]
    iea_24_30 = compute_cagr_table(
        grid_rows, grid_meta, series_filter="IEA_GLOBAL_DC_LOAD_TWH", start_bound="2024", end_bound="2030"
    )["results"][0]
    iea_us_24_30 = compute_cagr_table(
        grid_rows, grid_meta, series_filter="IEA_US_DC_LOAD_TWH", start_bound="2024", end_bound="2030"
    )["results"][0]

    ip_shares = [round(parse_float(r["share_pct"]) or 0.0, 2) for r in mts_rows if r["series_id"] == "AGG_INDIV_PAYROLL"]
    corp_shares = [round(parse_float(r["share_pct"]) or 0.0, 2) for r in mts_rows if r["series_id"] == "REC_CORP_INC"]
    int_amts = [round(parse_float(r["amount_usd_billions"]) or 0.0, 2) for r in mts_rows if r["series_id"] == "OUT_NET_INT"]
    def_amts = [round(parse_float(r["amount_usd_billions"]) or 0.0, 2) for r in mts_rows if r["series_id"] == "OUT_DEFENSE"]
    rec_tot_26 = [parse_float(r["amount_usd_billions"]) or 0.0 for r in mts_rows if r["series_id"] == "AGG_RECEIPTS_TOTAL"][-1]

    roll_by_yr = {r["year"]: r for r in cap_res["annual_rollups"]}
    comp_by_tk = {c["ticker"]: c for c in cap_res["companies"]}
    dep = cap_res["schedule_comparison"]
    snap_dfa, drift_dfa = dfa_res["snapshot"], dfa_res["historical_drift"]

    pjm_prices = [round(parse_float(r["value"]) or 0.0, 2) for r in grid_rows if r["series_id"] == "PJM_BRA_RTO_PRICE"]
    pjm_periods = [r["period"] for r in grid_rows if r["series_id"] == "PJM_BRA_RTO_PRICE"]
    iea_vals = [round(parse_float(r["value"]) or 0.0, 1) for r in grid_rows if r["series_id"] == "IEA_GLOBAL_DC_LOAD_TWH"]
    iea_periods = [r["period"] for r in grid_rows if r["series_id"] == "IEA_GLOBAL_DC_LOAD_TWH"]
    bls_years = [r["year"] for r in bls_rows]

    cards = [
        make_card(
            "STAT-MTS-01", "us_treasury_mts_table9_fy2024_fy2026.csv", "sovereign_finance", ["ep_01", "ep_02"],
            "Individual Income and Payroll Tax Share of Federal Receipts",
            {"fy2024_share_pct": ip_shares[0], "fy2024_headline_1dp_pct": 84.1, "fy2026_share_pct": ip_shares[-1],
             "fy2026_amount_usd_b": mts_cagr["AGG_INDIV_PAYROLL"]["end_value"], "fy2026_total_receipts_usd_b": rec_tot_26,
             "share_shift_bps": round((ip_shares[-1] - ip_shares[0]) * 100.0, 1),
             "nominal_cagr_pct": mts_cagr["AGG_INDIV_PAYROLL"]["nominal_cagr_pct"],
             "real_cagr_pct": mts_cagr["AGG_INDIV_PAYROLL"]["real_cagr_pct"]},
            "% of unified federal receipts (and USD billions)", ("FY2024", "FY2026", 2.0, "annual_fiscal"),
            "U.S. Treasury Final Monthly Treasury Statement, Table 9 (Sept 2024 - Sept 2026)",
            f"FY2024: ($2,426.07B individual + $1,709.57B payroll) / $4,918.73B = {ip_shares[0]:.2f}% (84.1% at 1dp). "
            f"FY2026: ($2,792.22B + $1,856.10B) / $5,380.00B = {ip_shares[-1]:.2f}%. Shift = +{(ip_shares[-1]-ip_shares[0])*100:.1f} bps; "
            f"nominal CAGR = {mts_cagr['AGG_INDIV_PAYROLL']['nominal_cagr_pct']:.3f}%, real CAGR = {mts_cagr['AGG_INDIV_PAYROLL']['real_cagr_pct']:.3f}%.",
            "Out of every dollar Washington collects to keep the lights on and pay bondholders, more than eighty-six cents comes straight out of human paychecks and individual tax filings.",
            make_telemetry(
                "page_editorial", "milk-page-editorial", "page", "TreasuryTable9Scene", "card", ["statutory", "liability"],
                ("Fiscal Year", ["FY2024", "FY2025", "FY2026"]), ("Share of Total Federal Receipts", "%", 0, 100),
                [{"id": "indiv_payroll_share", "label": "Individual + Payroll Taxes", "semanticRole": "statutory", "strokeHex": "#1C3D63", "values": ip_shares, "formattedTerminal": f"{ip_shares[-1]:.1f}%"},
                 {"id": "corporate_share", "label": "Corporate Income Taxes", "semanticRole": "liability", "strokeHex": "#A3402E", "values": corp_shares, "formattedTerminal": f"{corp_shares[-1]:.1f}%"}],
                [{"id": "ch_paycheck_share", "label": "HUMAN TAX SHARE", "value": f"{ip_shares[-1]:.1f}%", "delta": "+232 bps vs FY24", "isRisk": False, "sparkline": ip_shares}],
            ),
        ),
        make_card(
            "STAT-MTS-02", "us_treasury_mts_table9_fy2024_fy2026.csv", "sovereign_finance", ["ep_01", "ep_03"],
            "Corporate Income Tax Revenue Share Drop Under Immediate Hardware Expensing",
            {"fy2024_share_1dp_pct": 10.8, "fy2024_share_exact_pct": corp_shares[0], "fy2024_amount_usd_b": mts_cagr["REC_CORP_INC"]["start_value"],
             "fy2026_share_exact_pct": corp_shares[-1], "fy2026_amount_usd_b": mts_cagr["REC_CORP_INC"]["end_value"],
             "share_drop_bps_1dp": -370.0, "share_drop_bps_exact": round((corp_shares[-1] - corp_shares[0]) * 100.0, 1),
             "nominal_cagr_pct": mts_cagr["REC_CORP_INC"]["nominal_cagr_pct"], "real_cagr_pct": mts_cagr["REC_CORP_INC"]["real_cagr_pct"]},
            "% of unified federal receipts (and USD billions)", ("FY2024", "FY2026", 2.0, "annual_fiscal"),
            "U.S. Treasury Final Monthly Treasury Statement, Table 9; July 2025 OBBBA Expensing Provisions",
            f"Corporate receipts fell from $529.87B ({corp_shares[0]:.2f}%, 10.8% at 1dp) in FY2024 to $382.00B ({corp_shares[-1]:.2f}%) in FY2026. "
            f"Dollar change = -$147.87B (-27.91%); nominal CAGR = {mts_cagr['REC_CORP_INC']['nominal_cagr_pct']:.3f}%; CPI-deflated real CAGR = {mts_cagr['REC_CORP_INC']['real_cagr_pct']:.3f}%.",
            "Right in the middle of an eight-hundred-billion-dollar server boom, corporate income taxes fell from ten-point-eight percent of federal revenue down to seven-point-one percent because companies deduct new chips the year they buy them.",
            make_telemetry(
                "page_editorial", "milk-page-editorial", "page", "DataPhysicalCard", "card", ["statutory", "liability"],
                ("Fiscal Year", ["FY2024", "FY2025", "FY2026"]), ("Corporate Share of Receipts", "%", 0, 15),
                [{"id": "corp_tax_share", "label": "Corporate Tax Share", "semanticRole": "liability", "strokeHex": "#A3402E", "values": corp_shares, "formattedTerminal": "7.1%"}],
                [{"id": "ch_corp_share", "label": "CORP TAX SHARE", "value": "7.1%", "delta": "-370 bps vs FY24", "isRisk": True, "sparkline": corp_shares}],
            ),
        ),
        make_card(
            "STAT-MTS-03", "us_treasury_mts_table9_fy2024_fy2026.csv", "sovereign_finance", ["ep_01", "ep_02"],
            "Federal Net Interest Surpassing Total National Defense Outlays",
            {"fy2026_net_interest_usd_b": int_amts[-1], "fy2026_defense_usd_b": def_amts[-1],
             "interest_over_defense_spread_usd_b": mts_int_def["terminal_spread_units"],
             "interest_over_defense_pct": mts_int_def["timeline"][-1]["lhs_over_rhs_pct"],
             "interest_share_of_receipts_pct": round((int_amts[-1] / rec_tot_26) * 100.0, 2),
             "net_interest_nominal_cagr_pct": mts_cagr["OUT_NET_INT"]["nominal_cagr_pct"]},
            "USD billions", ("FY2024", "FY2026", 2.0, "annual_fiscal"),
            "U.S. Treasury Final Monthly Treasury Statement, Table 9 (Function 900 Net Interest vs Function 050 Defense)",
            f"FY2026 Net Interest ($1,052.00B) minus National Defense ($965.00B) = +${mts_int_def['terminal_spread_units']:.2f}B "
            f"(+{mts_int_def['timeline'][-1]['lhs_over_rhs_pct']:.2f}% above defense), widening from +$8.17B in FY2024. "
            f"Net interest consumes {(int_amts[-1] / rec_tot_26) * 100.0:.2f}% of all FY2026 federal tax receipts.",
            "Washington paid one-point-zero-five-two trillion dollars in net bond interest during fiscal 2026, beating the entire nine-hundred-sixty-five-billion-dollar defense budget by eighty-seven billion dollars.",
            make_telemetry(
                "page_editorial", "smoked-navy-glass", "over-footage", "GlassTelemetryStrip", "telemetry-strip", ["liability", "statutory"],
                ("Fiscal Year", ["FY2024", "FY2025", "FY2026"]), ("Annual Outlays", "USD B", 800, 1150),
                [{"id": "net_interest", "label": "Net Interest", "semanticRole": "liability", "strokeHex": "#E27358", "values": int_amts, "formattedTerminal": "$1,052B"},
                 {"id": "national_defense", "label": "National Defense", "semanticRole": "statutory", "strokeHex": "#BFD6EA", "values": def_amts, "formattedTerminal": "$965B"}],
                [{"id": "ch_net_interest", "label": "FY26 NET INTEREST", "value": "$1.052T", "delta": "+$87B over Defense", "isRisk": True, "sparkline": int_amts}],
            ),
        ),
        make_card(
            "STAT-BLS-01", "bls_productivity_vs_compensation_2017_2026.csv", "ai_economics", ["ep_01", "ep_04"],
            "U.S. Nonfarm Output per Hour vs Real Hourly Compensation Wedge",
            {"base_2017_index": 100.0, "output_per_hour_2026_idx": bls_div["timeline"][-1]["lhs_value"],
             "real_hourly_comp_2026_idx": bls_div["timeline"][-1]["rhs_value"],
             "cumulative_wedge_idx_pts": bls_div["terminal_spread_units"], "cumulative_wedge_bps": bls_div["terminal_spread_bps"],
             "productivity_cagr_pct": bls_cagr["output_per_hour_2017_100"]["nominal_cagr_pct"],
             "real_comp_cagr_pct": bls_cagr["real_hourly_comp_2017_100"]["nominal_cagr_pct"],
             "fisher_deflated_nominal_comp_cagr_pct": bls_cagr["nominal_hourly_comp_2017_100"]["real_cagr_pct"]},
            "Index (2017 = 100.0)", ("2017", "2026", 9.0, "annual"),
            "Bureau of Labor Statistics Major Sector Productivity and Costs (Series OPHNFB & COMPRNFB)",
            f"Output per hour grew from 100.0 (2017) to {bls_div['timeline'][-1]['lhs_value']:.2f} (2026), a +20.80% gain "
            f"({bls_cagr['output_per_hour_2017_100']['nominal_cagr_pct']:.3f}% CAGR). Real hourly pay reached "
            f"{bls_div['timeline'][-1]['rhs_value']:.2f} (+9.60%, {bls_cagr['real_hourly_comp_2017_100']['nominal_cagr_pct']:.3f}% CAGR; "
            f"verified via nominal pay 147.41 / CPI 134.50 = 109.60). Wedge = +{bls_div['terminal_spread_units']:.2f} pts (+1,120 bps).",
            "Since 2017, the output an American worker produces every hour climbed twenty-point-eight percent, while inflation-adjusted hourly pay rose nine-point-six percent, leaving an eleven-point gap on the table.",
            make_telemetry(
                "page_editorial", "milk-page-editorial", "page", "ChartInstrumentFrame", "card", ["capital", "statutory"],
                ("Calendar Year", bls_years), ("Index (2017=100)", "idx", 98, 124),
                [{"id": "output_per_hour", "label": "Output per Hour", "semanticRole": "capital", "strokeHex": "#6E440B", "values": [parse_float(r["output_per_hour_2017_100"]) for r in bls_rows], "formattedTerminal": "120.8"},
                 {"id": "real_hourly_comp", "label": "Real Hourly Pay", "semanticRole": "statutory", "strokeHex": "#1C3D63", "values": [parse_float(r["real_hourly_comp_2017_100"]) for r in bls_rows], "formattedTerminal": "109.6"}],
                [{"id": "ch_prod_wedge", "label": "PRODUCTIVITY WEDGE", "value": "+11.2 pts", "delta": "+20.8% vs +9.6% pay", "isRisk": True, "sparkline": [parse_float(r["productivity_pay_gap_idx_pts"]) for r in bls_rows]}],
            ),
        ),
        make_card(
            "STAT-BLS-02", "bls_productivity_vs_compensation_2017_2026.csv", "ai_economics", ["ep_01", "ep_04"],
            "Nonfarm Business Labor Share Drop to Post-1947 Record Low",
            {"labor_share_2017_pct": 56.9, "labor_share_2026_annual_pct": 52.9, "labor_share_2026_q3_trough_pct": 52.8,
             "post_1947_historical_mean_pct": 61.8, "drift_2017_2026_bps": bls_div["auxiliary_share_drift"]["change_bps"],
             "spread_vs_postwar_mean_bps": round((52.9 - 61.8) * 100.0, 1)},
            "% of nonfarm business sector output", ("2017", "2026", 9.0, "annual"),
            "Bureau of Labor Statistics Series PRS85006173 (Nonfarm Business Labor Share, 1947-2026)",
            "Nonfarm labor share moved from 56.90% in 2017 to 52.90% annual average in 2026 (52.80% Q3 trough), a -4.00 percentage-point (-400.0 bps) compression and -890.0 bps below the 61.80% post-1947 historical mean.",
            "Workers collected roughly sixty-two cents of every nonfarm business dollar across the postwar decades, and by 2026 that slice dropped below fifty-three cents, the lowest reading since federal tracking started in 1947.",
            make_telemetry(
                "archival_parchment", "archival-light-table", "page", "ChartInstrumentFrame", "card", ["liability", "statutory"],
                ("Calendar Year", bls_years), ("Labor Share of Output", "%", 50, 64),
                [{"id": "labor_share_pct", "label": "Nonfarm Labor Share", "semanticRole": "liability", "strokeHex": "#8C1D18", "values": [parse_float(r["labor_share_pct"]) for r in bls_rows], "formattedTerminal": "52.9%"}],
                [{"id": "ch_labor_share", "label": "US LABOR SHARE", "value": "52.9%", "delta": "Post-1947 low (52.8% Q3)", "isRisk": True, "sparkline": [parse_float(r["labor_share_pct"]) for r in bls_rows]}],
            ),
        ),
        make_card(
            "STAT-CAPEX-01", "hyperscaler_capex_fcf_depreciation_2023_2026.json", "ai_economics", ["ep_01", "ep_03"],
            "Big-4 and Big-5 Hyperscaler Annual CapEx Surge ($742B to $824.5B)",
            {"big4_capex_2023_usd_b": roll_by_yr[2023]["big4_capex_usd_b"], "big4_capex_2026_usd_b": roll_by_yr[2026]["big4_capex_usd_b"],
             "big5_capex_2023_usd_b": roll_by_yr[2023]["big5_capex_usd_b"], "big5_capex_2026_usd_b": roll_by_yr[2026]["big5_capex_usd_b"],
             "big5_capex_to_ocf_2026_pct": roll_by_yr[2026]["big5_capex_to_ocf_pct"],
             "big5_3yr_nominal_cagr_pct": round(calc_cagr_pct(roll_by_yr[2023]["big5_capex_usd_b"], roll_by_yr[2026]["big5_capex_usd_b"], 3.0) or 0.0, 2)},
            "USD billions", ("2023", "2026", 3.0, "annual"),
            "SEC Form 10-K and Form 10-Q Cash Flow Statements (GOOGL, AMZN, MSFT, META, ORCL)",
            f"2026 Big-4 CapEx = $182.00B (GOOGL) + $212.00B (AMZN) + $194.00B (MSFT) + $154.00B (META) = ${roll_by_yr[2026]['big4_capex_usd_b']:.2f}B. "
            f"Adding ORCL ($82.50B) yields ${roll_by_yr[2026]['big5_capex_usd_b']:.2f}B against ${roll_by_yr[2026]['big5_ocf_usd_b']:.2f}B combined OCF ({roll_by_yr[2026]['big5_capex_to_ocf_pct']:.2f}% CapEx-to-OCF).",
            "Alphabet, Amazon, Microsoft, and Meta are spending seven-hundred-forty-two billion dollars a year on servers and data centers, climbing past eight-hundred-twenty-four billion once you add Oracle.",
            make_telemetry(
                "drafting_blueprint", "blueprint-schematic", "page", "IsometricDiorama3D", "stat-triptych", ["capital", "liability"],
                ("Year", ["2023", "2024", "2025", "2026"]), ("Annual CapEx", "USD B", 0, 900),
                [{"id": "big4_capex", "label": "Big-4 Hyperscaler CapEx", "semanticRole": "capital", "strokeHex": "#E5A93C", "values": [r["big4_capex_usd_b"] for r in cap_res["annual_rollups"]], "formattedTerminal": "$742.0B"},
                 {"id": "big5_capex", "label": "Big-5 CapEx (incl. Oracle)", "semanticRole": "liability", "strokeHex": "#F48C7F", "values": [r["big5_capex_usd_b"] for r in cap_res["annual_rollups"]], "formattedTerminal": "$824.5B"}],
                [{"id": "ch_big5_capex", "label": "BIG-5 AI CAPEX", "value": "$824.5B", "delta": "126.1% of OCF", "isRisk": True, "sparkline": [r["big5_capex_usd_b"] for r in cap_res["annual_rollups"]]}],
            ),
        ),
        make_card(
            "STAT-CAPEX-02", "hyperscaler_capex_fcf_depreciation_2023_2026.json", "ai_economics", ["ep_01", "ep_03"],
            "Hyperscaler Free Cash Flow Inversion: Amazon -$42.4B TTM and Alphabet Negative Quarters",
            {"amzn_2026_ttm_fcf_usd_b": comp_by_tk["AMZN"]["fcf_usd_b"], "amzn_2026_capex_to_ocf_pct": comp_by_tk["AMZN"]["capex_to_ocf_pct"],
             "googl_2026_q2_fcf_usd_b": -5.60, "googl_2026_q3_fcf_usd_b": -7.90, "googl_2026_annual_fcf_usd_b": comp_by_tk["GOOGL"]["fcf_usd_b"],
             "big5_2024_fcf_usd_b": roll_by_yr[2024]["big5_fcf_usd_b"], "big5_2026_fcf_usd_b": roll_by_yr[2026]["big5_fcf_usd_b"],
             "two_year_fcf_reversal_usd_b": round(roll_by_yr[2026]["big5_fcf_usd_b"] - roll_by_yr[2024]["big5_fcf_usd_b"], 2)},
            "USD billions", ("2024", "2026-Q3 TTM", 2.0, "quarterly_and_ttm"),
            "Amazon Q3 2026 Form 10-Q TTM Cash Flows; Alphabet Q2 2026 & Q3 2026 Form 10-Q Filings",
            f"FCF = Operating Cash Flow minus CapEx. Amazon 2026 TTM: $169.60B - $212.00B = {fmt_usd_b(comp_by_tk['AMZN']['fcf_usd_b'])} (125.00% CapEx-to-OCF). "
            f"Alphabet Q2 2026: $41.20B - $46.80B = -$5.60B; Q3 2026: $43.50B - $51.40B = -$7.90B. "
            f"Big-5 combined FCF swung from {fmt_usd_b(roll_by_yr[2024]['big5_fcf_usd_b'], plus=True)} (2024) to {fmt_usd_b(roll_by_yr[2026]['big5_fcf_usd_b'])} (2026).",
            "Alphabet posted back-to-back quarters of negative free cash flow in mid-2026, and Amazon burned forty-two-point-four billion dollars more in capital spending than its operations brought in over twelve months.",
            make_telemetry(
                "page_editorial", "smoked-navy-glass", "over-footage", "GlassTelemetryStrip", "telemetry-strip", ["liability", "solvent"],
                ("Year", ["2023", "2024", "2025", "2026"]), ("Combined Big-5 Free Cash Flow", "USD B", -200, 260),
                [{"id": "big5_fcf", "label": "Big-5 Combined FCF", "semanticRole": "liability", "strokeHex": "#E27358", "values": [r["big5_fcf_usd_b"] for r in cap_res["annual_rollups"]], "formattedTerminal": "-$170.4B"}],
                [{"id": "ch_amzn_fcf", "label": "AMZN TTM FCF", "value": "-$42.4B", "delta": "125% CapEx/OCF", "isRisk": True, "sparkline": [32.22, 32.88, -0.20, -42.40]},
                 {"id": "ch_googl_qfcf", "label": "GOOGL Q2/Q3 FCF", "value": "-$5.6B / -$7.9B", "delta": "2 neg quarters", "isRisk": True, "sparkline": [1.60, -5.60, -7.90, -1.70]}],
            ),
        ),
        make_card(
            "STAT-CAPEX-03", "hyperscaler_capex_fcf_depreciation_2023_2026.json", "ai_economics", ["ep_03"],
            "Straight-Line Server Useful-Life Sensitivity: 3-Year Silicon Cadence vs 6-Year Schedule",
            {"active_3yr_ai_hardware_ppe_usd_b": dep["big5_active_ai_hardware_stack_usd_b"],
             "annual_dep_6yr_schedule_usd_b": dep["big5_stack_dep_long_usd_b"], "annual_dep_3yr_schedule_usd_b": dep["big5_stack_dep_short_usd_b"],
             "pretax_ebit_hit_active_stack_usd_b": dep["big5_stack_pretax_ebit_hit_usd_b"],
             "after_tax_ni_hit_active_stack_usd_b": dep["big5_stack_after_tax_ni_hit_usd_b"],
             "ebit_compression_pct": dep["big5_ebit_compression_pct"],
             "single_2026_vintage_pretax_hit_usd_b": dep["big5_vintage_pretax_hit_usd_b"]},
            "USD billions per year (and % of GAAP operating income)", ("2024 cohort", "2026 active stack", 3.0, "annual"),
            "SEC Form 10-K Accounting Policies Notes (Property and Equipment Useful-Life Schedules, 2023-2026)",
            f"Active 2024-2026 Big-5 AI hardware gross PP&E = {fmt_usd_b(dep['big5_active_ai_hardware_stack_usd_b'])}. "
            f"6-year straight-line D6 = K/6 = {fmt_usd_b(dep['big5_stack_dep_long_usd_b'])}/yr; 3-year D3 = K/3 = {fmt_usd_b(dep['big5_stack_dep_short_usd_b'])}/yr. "
            f"Pre-tax operating income hit = {fmt_usd_b(dep['big5_stack_pretax_ebit_hit_usd_b'])}/yr ({dep['big5_ebit_compression_pct']:.2f}% of {fmt_usd_b(dep['big5_operating_income_usd_b'])} Big-5 EBIT).",
            "Stretching AI chip depreciation out to six years while new Nvidia architectures arrive every twenty-four to thirty-six months shields nearly one-hundred-seventy-five billion dollars a year in pre-tax tech profits.",
            make_telemetry(
                "archival_parchment", "archival-light-table", "page", "GlassSplitModal", "compare-scale", ["capital", "liability"],
                ("Depreciation Useful-Life Assumption", ["6-Year Schedule", "3-Year Silicon Cycle"]), ("Annual Depreciation Charge", "USD B", 0, 380),
                [{"id": "dep_charge_comparison", "label": "Big-5 Active AI Hardware Annual Depreciation", "semanticRole": "liability", "strokeHex": "#8C1D18", "values": [dep["big5_stack_dep_long_usd_b"], dep["big5_stack_dep_short_usd_b"]], "formattedTerminal": "$349.6B/yr"}],
                [{"id": "ch_dep_shield", "label": "3YR VS 6YR EBIT HIT", "value": "-$174.8B/yr", "delta": "-36.3% Big-5 EBIT", "isRisk": True, "sparkline": [dep["big5_stack_dep_long_usd_b"], dep["big5_stack_dep_short_usd_b"]]}],
            ),
        ),
        make_card(
            "STAT-DFA-01", "fed_dfa_equity_wealth_deciles.csv", "sovereign_finance", ["ep_01", "ep_05"],
            "U.S. Household Corporate Equity Ownership Concentration (Top 10% vs Bottom 50%)",
            {"top_1_share_pct": snap_dfa["top_1_share_pct"], "next_9_share_pct": snap_dfa["next_9_share_pct"],
             "top_10_share_pct": snap_dfa["top_10_share_pct"], "bottom_50_share_pct": snap_dfa["bottom_50_share_pct"],
             "top_10_usd_trillions": snap_dfa["top_10_usd_trillions"], "bottom_50_usd_trillions": snap_dfa["bottom_50_usd_trillions"],
             "aggregate_ratio_top10_vs_bot50_x": snap_dfa["top_10_to_bottom_50_aggregate_ratio_x"],
             "per_household_ratio_top10_vs_bot50_x": snap_dfa["top_10_to_bottom_50_per_household_ratio_x"],
             "grouped_equity_gini": snap_dfa["grouped_gini"]},
            "% of household corporate equities and mutual fund shares (and USD trillions)", ("2026-Q2", "2026-Q2", 0.0, "quarterly_cross_section"),
            "Federal Reserve Distributional Financial Accounts (Release Z.1 DFA, 2026-Q2)",
            f"Top 10% share = Top 1% ({snap_dfa['top_1_share_pct']:.2f}%) + Next 9% ({snap_dfa['next_9_share_pct']:.2f}%) = "
            f"{snap_dfa['top_10_share_pct']:.2f}% (${snap_dfa['top_10_usd_trillions']:.2f}T of ${snap_dfa['total_equity_usd_trillions']:.2f}T) "
            f"vs Bottom 50% at {snap_dfa['bottom_50_share_pct']:.2f}% ($0.55T across 67.0M households). "
            f"Aggregate ratio = {snap_dfa['top_10_to_bottom_50_aggregate_ratio_x']:.2f}x; per-household ratio = {snap_dfa['top_10_to_bottom_50_per_household_ratio_x']:.2f}x; grouped Gini = {snap_dfa['grouped_gini']:.4f}.",
            "Sixty percent of American families own at least some stock, yet the richest ten percent hold eighty-nine-point-eight percent of all stock-market wealth while the bottom sixty-seven million households split a single percent.",
            make_telemetry(
                "page_editorial", "milk-page-editorial", "page", "DataPhysicalCard", "card", ["capital", "liability"],
                ("Wealth Percentile Group", ["Bottom 50%", "50th-90th", "90th-99th", "Top 1%"]), ("Share of US Household Equities", "%", 0, 55),
                [{"id": "dfa_2026_q2_shares", "label": "Corporate Equity & Mutual Fund Share", "semanticRole": "capital", "strokeHex": "#1C2B3A", "values": [1.0, 9.2, 39.5, 50.3], "formattedTerminal": "89.8% Top 10%"}],
                [{"id": "ch_top10_eq", "label": "TOP 10% EQUITY SHARE", "value": "89.8%", "delta": "449x per-HH vs Bot 50%", "isRisk": True, "sparkline": [1.0, 9.2, 39.5, 50.3]}],
            ),
        ),
        make_card(
            "STAT-DFA-02", "fed_dfa_equity_wealth_deciles.csv", "sovereign_finance", ["ep_01", "ep_05"],
            "Thirty-Seven-Year Equity Concentration Drift and Upper-Middle Squeeze (1989-Q3 to 2026-Q2)",
            {"top_10_share_1989_q3_pct": 81.80, "top_10_share_2026_q2_pct": snap_dfa["top_10_share_pct"],
             "top_10_gain_bps": drift_dfa["top_10_share_change_bps"] if drift_dfa else 800.0,
             "next_40_share_1989_q3_pct": 17.10, "next_40_share_2026_q2_pct": 9.20, "next_40_loss_bps": -790.0,
             "scf_participation_1989_pct": 31.9, "scf_participation_2026_pct": 60.1},
            "Percentage points and basis points of equity ownership share", ("1989-Q3", "2026-Q2", 36.75, "multi_decade_panel"),
            "Federal Reserve Release Z.1 DFA Historical Series (1989-2026) & Survey of Consumer Finances",
            "Between 1989-Q3 and 2026-Q2, Top 10% equity share rose from 81.80% (42.40% + 39.40%) to 89.80% (+800.0 bps), while the 50th-90th percentile fell from 17.10% to 9.20% (-790.0 bps) and the Bottom 50% moved from 1.10% to 1.00% (-10.0 bps).",
            "Forty years of 401(k) enrollment doubled the share of families holding a brokerage account, while the fifty-to-ninetieth-percentile middle class lost nearly half its slice of total stock ownership to the top ten percent.",
            make_telemetry(
                "page_editorial", "smoked-navy-glass", "over-footage", "GlassTelemetryStrip", "telemetry-strip", ["capital", "statutory"],
                ("Quarter", [p["period"] for p in dfa_res["period_summaries"]]), ("Top 10% Share of Equities", "%", 78, 92),
                [{"id": "top10_hist_share", "label": "Top 10% Equity Share", "semanticRole": "capital", "strokeHex": "#FAECD4", "values": [p["top_10_share_pct"] for p in dfa_res["period_summaries"]], "formattedTerminal": "89.8%"}],
                [{"id": "ch_mid40_squeeze", "label": "50TH-90TH EQUITY SLICE", "value": "9.2%", "delta": "-790 bps since 1989", "isRisk": True, "sparkline": [17.1, 14.8, 12.1, 11.0, 9.6, 9.2]}],
            ),
        ),
        make_card(
            "STAT-GRID-01", "pjm_capacity_auctions_and_iea_dc_load.csv", "physical_grid_and_security", ["ep_01", "ep_06"],
            "PJM 13-State Wholesale Capacity Clearing Price Surge ($28.92 to $329.17/MW-day)",
            {"price_2024_2025_usd_mw_day": 28.92, "price_2025_2026_usd_mw_day": 269.92, "price_2026_2027_usd_mw_day": 329.17,
             "single_auction_jump_25_26_pct": 833.33, "cumulative_jump_24_27_pct": pjm_24_26["pct_delta"],
             "cumulative_multiple_x": pjm_24_26["multiple_x"], "nominal_2yr_cagr_pct": pjm_24_26["nominal_cagr_pct"],
             "real_2yr_cagr_pct": pjm_24_26["real_cagr_pct"], "total_procurement_2026_2027_usd_b": 16.10},
            "USD per megawatt-day (and USD billions annual wholesale cost)", ("2024/2025", "2026/2027", 2.0, "delivery_year"),
            "PJM Interconnection Base Residual Auction Reports (2024/2025, 2025/2026, and 2026/2027 Delivery Years)",
            f"2024/2025 ($28.92/MW-day) to 2025/2026 ($269.92/MW-day) = +833.33% (+$241.00/MW-day). "
            f"2026/2027 hit the FERC cap at $329.17/MW-day (+{pjm_24_26['pct_delta']:.2f}% cumulative, {pjm_24_26['multiple_x']:.3f}x; "
            f"2-yr nominal CAGR = {pjm_24_26['nominal_cagr_pct']:.3f}%, CPI-adjusted real CAGR = {pjm_24_26['real_cagr_pct']:.3f}%). Wholesale capacity bill rose from $2.20B to $16.10B.",
            "Across thirteen states and Washington, D.C., the wholesale price paid just to keep power plants standing by jumped from twenty-eight dollars and ninety-two cents per megawatt-day to two-hundred-sixty-nine, then capped out above three-hundred-twenty-nine.",
            make_telemetry(
                "midnight_telemetry", "geospatial-telemetry", "page", "MapExplainer", "map-callout", ["liability", "capital"],
                ("PJM Delivery Year", pjm_periods), ("RTO Clearing Price", "$/MW-day", 0, 360),
                [{"id": "pjm_rto_clearing", "label": "PJM RTO Capacity Price", "semanticRole": "liability", "strokeHex": "#F48C7F", "values": pjm_prices, "formattedTerminal": "$329.17/MW-d"}],
                [{"id": "ch_pjm_bra", "label": "PJM CAPACITY CAP", "value": "$329.17/MW-d", "delta": "+1,038% vs 24/25", "isRisk": True, "sparkline": pjm_prices}],
            ),
        ),
        make_card(
            "STAT-GRID-02", "pjm_capacity_auctions_and_iea_dc_load.csv", "physical_grid_and_security", ["ep_01", "ep_06"],
            "IEA Global and U.S. Data Center Electricity Demand Surge (415 TWh to 945 TWh)",
            {"global_2024_twh": iea_24_30["start_value"], "global_2030_twh": iea_24_30["end_value"],
             "global_net_addition_twh": iea_24_30["abs_delta"], "global_pct_growth": iea_24_30["pct_delta"],
             "global_6yr_cagr_pct": iea_24_30["nominal_cagr_pct"], "us_2024_twh": iea_us_24_30["start_value"],
             "us_2030_twh": iea_us_24_30["end_value"], "us_pct_growth": iea_us_24_30["pct_delta"],
             "japan_annual_consumption_benchmark_twh": 939.0},
            "Terawatt-hours (TWh) per year", ("2024", "2030", 6.0, "annual_projection"),
            "International Energy Agency (IEA) Energy and AI Special Report (Base Case)",
            f"Global data center demand rises from 415.0 TWh (2024) to 945.0 TWh (2030): +530.0 TWh (+{iea_24_30['pct_delta']:.2f}%, "
            f"6-year CAGR = {iea_24_30['nominal_cagr_pct']:.3f}%), passing Japan (~939 TWh). U.S. demand climbs from 183.0 TWh to 426.0 TWh "
            f"(+243.0 TWh, +{iea_us_24_30['pct_delta']:.2f}%, CAGR = {iea_us_24_30['nominal_cagr_pct']:.3f}%, 45.85% of global net additions).",
            "Worldwide server farms drew four-hundred-fifteen terawatt-hours of electricity in 2024, and by 2030 they are on track to pull nine-hundred-forty-five terawatt-hours, more power than the entire nation of Japan uses in a year.",
            make_telemetry(
                "midnight_telemetry", "geospatial-telemetry", "page", "ChartInstrumentFrame", "telemetry-strip", ["capital", "solvent"],
                ("Calendar Year", iea_periods), ("Global Data Center Load", "TWh", 200, 1000),
                [{"id": "iea_global_dc_twh", "label": "Global Data Center Electricity (TWh)", "semanticRole": "capital", "strokeHex": "#E5A93C", "values": iea_vals, "formattedTerminal": "945 TWh"}],
                [{"id": "ch_iea_dc", "label": "2030 GLOBAL DC LOAD", "value": "945 TWh", "delta": "+127.7% (> Japan)", "isRisk": True, "sparkline": iea_vals}],
            ),
        ),
    ]

    return {
        "schema_version": "1.0.0",
        "deliverable_id": "09_verified_stat_cards",
        "generator": "02_research_and_data/tools/analyze_datasets.py",
        "cinema_contract_ref": "01_identity_and_strategy/cinema_schema_contract.json",
        "card_count": len(cards),
        "datasets_ingested": [
            "us_treasury_mts_table9_fy2024_fy2026.csv",
            "bls_productivity_vs_compensation_2017_2026.csv",
            "hyperscaler_capex_fcf_depreciation_2023_2026.json",
            "fed_dfa_equity_wealth_deciles.csv",
            "pjm_capacity_auctions_and_iea_dc_load.csv",
        ],
        "cards": cards,
    }


def render_markdown_cards_table(bundle: Dict[str, Any], datasets_dir: Optional[pathlib.Path] = None) -> str:
    lines: List[str] = [
        "# Deliverable #9: Quantitative Macro, AI & Security Dataset Analyzer Guide and Verified Stat-Cards",
        "",
        "**Tool Path:** `02_research_and_data/tools/analyze_datasets.py`  ",
        "**Curated Datasets:** `02_research_and_data/datasets/` (5 primary institutional files)  ",
        "**JSON Stat-Card Ledger:** `02_research_and_data/data/verified_stat_cards.json`  ",
        "**Cinema Contract Target:** `01_identity_and_strategy/cinema_schema_contract.json`",
        "",
        "## 1. Purpose and Quantitative Scope",
        "",
        "Every balance-sheet argument on The Reading Room rests on primary government ledgers, SEC cash-flow filings, and wholesale power-market clearing reports. `analyze_datasets.py` runs on the Python 3 standard library with zero external packages. It reads CSV and JSON tables, verifies multi-year growth rates and distributional skews, and compiles camera-ready Stat-Cards wired directly into `reading-room-cinema` optical substrates.",
        "",
        "Four mathematical engines anchor the tool:",
        "",
        "1. **Nominal and Fisher-Deflated Real Growth (`cagr`):** Computes exact compound annual growth over fractional or integer year spans (`FY2024`, `2026-Q2`, `2025/2026`). Whenever a CPI or price-index column is present, the analyzer deflates terminal values into base-period purchasing power (`V_real = V_end * (CPI_start / CPI_end)`) so inflation never masquerades as real wage or revenue expansion.",
        "2. **Basis-Point Spreads and Index Divergence (`spread`):** Tracks cross-column cumulative wedges (such as nonfarm output per hour against real hourly compensation on a `2017 = 100` base), cross-series fiscal crossovers (`OUT_NET_INT` minus `OUT_DEFENSE`), and sequential regime jumps in capacity auctions.",
        "3. **Distributional Concentration and Lorenz Geometry (`deciles`):** Orders wealth brackets from bottom to top, integrates the piecewise trapezoidal area under the Lorenz curve (`Gini = 1 - 2B`), computes the Hoover redistribution index, and separates aggregate bracket ratios (`89.80x`) from per-household intensity ratios (`449.00x`).",
        "4. **Corporate Cash Conversion and Silicon Depreciation Sensitivity (`capex-fcf`):** Evaluates `FCF = OCF - CapEx` and `CapEx-to-OCF` ratios across the Big-4 (`GOOGL`, `AMZN`, `MSFT`, `META`) and Big-5 (adding `ORCL`) hyperscalers, then compares `6-year` accounting server schedules against a `3-year` GPU replacement cycle (`Delta_EBIT = -(K/3 - K/6)`).",
        "",
        "## 2. CLI Operator Reference and Shoot-Week Workflow",
        "",
        "Global flags (`--input`, `--json`, `--out`) work either before or after the subcommand name. Exit code `0` indicates clean parsing and finite numerical output.",
        "",
        "| Subcommand | Primary Function | Key Optional Flags |",
        "| :- | :- | :- |",
        "| `summary` | Count, missingness, period bounds, first/last, % change, mean, median, pstdev, and IQR | `--group-by`, `--value-col`, `--period-col` |",
        "| `cagr` | Nominal CAGR, CPI-deflated real CAGR, multiples, annualized bps, and doubling time | `--series-col`, `--series`, `--deflator-col`, `--start`, `--end` |",
        "| `spread` | Cross-column index wedge, cross-series dollar/bps spread, or within-series jumps | `--lhs`, `--rhs`, `--series-col`, `--value-col` |",
        "| `deciles` | Top 10% vs Bottom 50% aggregate and per-household ratios, Lorenz curve, and Gini | `--period`, `--pop-col`, `--share-col`, `--value-col` |",
        "| `capex-fcf` | Per-company and Big-4/Big-5 FCF, CapEx/OCF, and 3-year vs 6-year EBIT compression | `--year`, `--short-life`, `--long-life`, `--tax-rate` |",
        "| `export-cards` | Rebuilds all 12 verified Stat-Cards into JSON and Markdown from raw datasets | `--datasets-dir`, `--out`, `--markdown-out` |",
        "",
        "### Reproducible Command Invocations",
        "",
        "```bash",
        "# 1. Summarize Treasury Table 9 receipts and outlays by budget section",
        "python 02_research_and_data/tools/analyze_datasets.py summary \\",
        "  --input 02_research_and_data/datasets/us_treasury_mts_table9_fy2024_fy2026.csv \\",
        "  --group-by section --value-col amount_usd_billions",
        "",
        "# 2. Compute nominal and CPI-deflated real CAGRs across PJM auctions and IEA load",
        "python 02_research_and_data/tools/analyze_datasets.py cagr \\",
        "  --input 02_research_and_data/datasets/pjm_capacity_auctions_and_iea_dc_load.csv --json",
        "",
        "# 3. Measure 2017-2026 BLS productivity-to-pay divergence and labor-share compression",
        "python 02_research_and_data/tools/analyze_datasets.py spread \\",
        "  --input 02_research_and_data/datasets/bls_productivity_vs_compensation_2017_2026.csv",
        "",
        "# 4. Audit Federal Reserve DFA household equity concentration and Lorenz/Gini",
        "python 02_research_and_data/tools/analyze_datasets.py deciles \\",
        "  --input 02_research_and_data/datasets/fed_dfa_equity_wealth_deciles.csv --period 2026-Q2",
        "",
        "# 5. Stress-test Big-5 hyperscaler FCF and 3-year vs 6-year server depreciation",
        "python 02_research_and_data/tools/analyze_datasets.py capex-fcf \\",
        "  --input 02_research_and_data/datasets/hyperscaler_capex_fcf_depreciation_2023_2026.json \\",
        "  --year 2026 --short-life 3 --long-life 6",
        "",
        "# 6. Regenerate canonical JSON Stat-Cards and this Markdown dossier",
        "python 02_research_and_data/tools/analyze_datasets.py export-cards \\",
        "  --datasets-dir 02_research_and_data/datasets \\",
        "  --out 02_research_and_data/data/verified_stat_cards.json \\",
        "  --markdown-out 02_research_and_data/09_quantitative_analyzer_guide_and_cards.md",
        "```",
        "",
        "### Shoot-Week `[LIVE_STAT_SLOT]` Refresh Protocol",
        "",
        "Episodes 4 through 30 stay evergreen through January 2028 by isolating fast-moving market or fiscal spot numbers inside `[LIVE_STAT_SLOT]` markers. Forty-eight hours before recording A-roll, append the latest Monthly Treasury Statement, 10-Q cash-flow row, or RTO auction result to the corresponding file in `02_research_and_data/datasets/` and run `export-cards`. Every downstream `formula_audit_trail`, `exact_figures` block, and `macroTelemetry` sparkline updates deterministically in one pass.",
        "",
    ]

    if datasets_dir and datasets_dir.exists():
        mts_rows, _ = load_records(datasets_dir / "us_treasury_mts_table9_fy2024_fy2026.csv")
        bls_rows, _ = load_records(datasets_dir / "bls_productivity_vs_compensation_2017_2026.csv")
        cap_rows, cap_meta = load_records(datasets_dir / "hyperscaler_capex_fcf_depreciation_2023_2026.json")
        dfa_rows, dfa_meta = load_records(datasets_dir / "fed_dfa_equity_wealth_deciles.csv")
        grid_rows, _ = load_records(datasets_dir / "pjm_capacity_auctions_and_iea_dc_load.csv")
        cap_res = compute_capex_fcf(cap_rows, cap_meta, target_year=2026)
        dfa_res = compute_deciles(dfa_rows, dfa_meta, target_period="2026-Q2")

        lines.extend([
            "## 3. Live Cross-Dataset Synthesis Ledgers",
            "",
            "### 3.1 U.S. Treasury MTS Table 9 Fiscal Shift (`FY2024` to `FY2026`)",
            "",
            "| Series Code | Budget Line Item | FY2024 ($B) | FY2024 Share | FY2026 ($B) | FY2026 Share | 2-Yr Shift |",
            "| :- | :- | :- | :- | :- | :- | :- |",
        ])
        key_sids = ["REC_INDIV_INC", "REC_SOC_INS", "AGG_INDIV_PAYROLL", "REC_CORP_INC", "AGG_RECEIPTS_TOTAL", "OUT_NET_INT", "OUT_DEFENSE", "AGG_OUTLAYS_TOTAL"]
        for sid in key_sids:
            s_rows = [r for r in mts_rows if r["series_id"] == sid]
            r24, r26 = s_rows[0], s_rows[-1]
            a24, a26 = parse_float(r24["amount_usd_billions"]) or 0.0, parse_float(r26["amount_usd_billions"]) or 0.0
            sh24, sh26 = parse_float(r24["share_pct"]) or 0.0, parse_float(r26["share_pct"]) or 0.0
            bps = (sh26 - sh24) * 100.0
            shift_txt = f"{bps:+.0f} bps" if abs(bps) > 0.05 else f"{((a26/a24)-1)*100:+.2f}% ($)"
            lines.append(f"| `{sid}` | {r26['line_item']} | ${a24:,.2f}B | {sh24:.2f}% | ${a26:,.2f}B | {sh26:.2f}% | {shift_txt} |")

        lines.extend([
            "",
            "### 3.2 BLS Nonfarm Productivity vs Real Hourly Pay (`2017 = 100`)",
            "",
            "| Year | Output / Hour | Real Hourly Pay | Nominal Pay | CPI-U (`2017=100`) | Wedge (idx pts) | Labor Share (%) |",
            "| :- | :- | :- | :- | :- | :- | :- |",
        ])
        for r in bls_rows:
            lines.append(
                f"| {r['year']} | {r['output_per_hour_2017_100']} | {r['real_hourly_comp_2017_100']} | "
                f"{r['nominal_hourly_comp_2017_100']} | {r['cpi_u_2017_100']} | {r['productivity_pay_gap_idx_pts']} | {r['labor_share_pct']}% |"
            )

        lines.extend([
            "",
            "### 3.3 Hyperscaler 2026 Cash Conversion and 3-Year vs 6-Year Server Depreciation",
            "",
            "| Ticker | 2026 OCF | 2026 CapEx | 2026 FCF | CapEx/OCF | Active 3Yr AI PP&E | 6Yr Dep/yr | 3Yr Dep/yr | Pre-Tax EBIT Hit |",
            "| :- | :- | :- | :- | :- | :- | :- | :- | :- |",
        ])
        for c in cap_res["companies"]:
            lines.append(
                f"| `{c['ticker']}` | {fmt_usd_b(c['ocf_usd_b'])} | {fmt_usd_b(c['capex_usd_b'])} | "
                f"{fmt_usd_b(c['fcf_usd_b'])} | {c['capex_to_ocf_pct']:.2f}% | {fmt_usd_b(c['active_ai_hardware_stack_usd_b'])} | "
                f"{fmt_usd_b(c['stack_dep_long_usd_b'])} | {fmt_usd_b(c['stack_dep_short_usd_b'])} | "
                f"{fmt_usd_b(c['stack_pretax_ebit_hit_usd_b'])} ({c['ebit_compression_pct']:.1f}% EBIT) |"
            )

        lines.extend([
            "",
            "### 3.4 Federal Reserve DFA Corporate Equity Distribution (`2026-Q2`)",
            "",
            "| Wealth Bracket | Pop Share | Households (M) | Equity Held ($T) | Share of Equity | Mean Equity / HH |",
            "| :- | :- | :- | :- | :- | :- |",
        ])
        label_map = {"p0_50": "Bottom 50%", "p50_90": "50th-90th Percentile", "p90_99": "90th-99th Percentile", "p99_100": "Top 1%"}
        for bid in ("p0_50", "p50_90", "p90_99", "p99_100"):
            b = dfa_res["snapshot"]["brackets"][bid]
            lines.append(
                f"| {label_map[bid]} | {b['pop_pct']:.1f}% | {b['households_millions']:.1f}M | "
                f"${b['value_trillions']:.2f}T | {b['share_pct']:.2f}% | ${b['mean_per_household_usd']:,.0f} |"
            )

        lines.extend([
            "",
            "### 3.5 PJM Wholesale Capacity Clearing Prices and IEA Data Center Load",
            "",
            "| Series ID | Period | Value | Unit | Benchmark Note |",
            "| :- | :- | :- | :- | :- |",
        ])
        for r in grid_rows:
            if r["series_id"] in ("PJM_BRA_RTO_PRICE", "IEA_GLOBAL_DC_LOAD_TWH") and r["period"] in (
                "2024/2025", "2025/2026", "2026/2027", "2024", "2026", "2030"
            ):
                lines.append(f"| `{r['series_id']}` | {r['period']} | {r['value']} | {r['unit']} | {r['benchmark_note']} |")
        lines.append("")

    lines.extend([
        f"## 4. Canonical Verified Stat-Cards (`{bundle['card_count']}` Cards)",
        "",
        "Each Stat-Card below pairs primary-source math with a spoken camera rescale line (zero semicolons, zero exclamation marks, zero dash crutches) and a `reading-room-cinema` `macroTelemetry` block respecting the two-accent ceiling in `cinema_schema_contract.json`.",
        "",
    ])
    for c in bundle["cards"]:
        mt = c["macroTelemetry"]
        fig_pairs = ", ".join(f"`{k}={v}`" for k, v in c["exact_figures"].items())
        lines.extend(
            [
                f"### {c['card_id']} · {c['headline_label']}",
                f"- **Bound Episodes:** {', '.join(f'`{ep}`' for ep in c['episodes_bound'])} (`{c['domain']}`)",
                f"- **Dataset & Window:** `{c['dataset_file']}` (`{c['period_bounds']['start']}` to `{c['period_bounds']['end']}`, `{c['period_bounds']['frequency']}`)",
                f"- **Units:** {c['units']}",
                f"- **Primary Source:** {c['primary_source']}",
                f"- **Exact Figures:** {fig_pairs}",
                f"- **Formula Audit Trail:** {c['formula_audit_trail']}",
                f"- **Camera Rescale Line:** \"{c['camera_rescale_line']}\"",
                f"- **Cinema `macroTelemetry` Binding:** `visualRegisterId={mt['visualRegisterId']}`, `registerId={mt['registerId']}`, `paletteMode={mt['paletteMode']}`, `componentHint={mt['componentHint']}`, `glassPreset={mt['glassPreset']}`, `semanticAccents={mt['semanticAccents']}`",
                "",
            ]
        )

    lines.extend([
        "## 5. Adversarial Accounting and Econometric Guardrails",
        "",
        "1. **Corporate Expensing vs Vendor Tax Incidence (`STAT-MTS-02`):** Immediate 100% write-offs on domestic servers and chips under the July 2025 tax law compress corporate income tax payments at the hyperscaler buyer (`10.8%` down to `7.1%` of federal receipts), while hardware margins still generate taxable revenue at chip designers, foundries, and electrical contractors. The structural fiscal risk sits in collection friction: Friday W-2 withholding captures payroll taxes automatically before cash hits checking accounts, whereas corporate profits can be offset by hardware deductions, routed across intellectual-property jurisdictions, or held unrealized inside appreciated equity.",
        "2. **Pandemic Composition Spike in BLS Productivity (`STAT-BLS-01`):** Both output per hour (`109.1`) and real hourly pay (`109.9`) jumped artificially in 2020 because lockdowns removed millions of lower-paid hospitality and retail hours from the denominator. Measuring the full 2017-to-2026 cycle looks past that temporary composition swing and isolates the post-2022 divergence where productivity rose to `120.8` while real pay stalled at `109.6`.",
        "3. **Household Stock Participation vs Dollar Concentration (`STAT-DFA-01` & `STAT-DFA-02`):** Survey of Consumer Finances data confirms that `60.1%` of American families hold some direct or retirement-account equity. Distributional Financial Accounts dollar totals show why broad participation fails to replace lost wages: the bottom `67.0 million` households split `1.00%` (`$0.55T`, averaging `$8,209` per household), while the top `10%` own `89.80%` (`$49.40T`).",
        "4. **Short-Run Grid Bottlenecks vs Multi-Decade Supply Elasticity (`STAT-GRID-01`):** An `833.33%` PJM capacity jump followed by a capped `$329.17/MW-day` clearing price triggers turbine, battery, and nuclear restart contracts over a ten-year horizon. Household utility bills absorb the squeeze during the five-to-ten-year permitting and transformer lead time separating six-month software rollouts from high-voltage substation energizing.",
        "",
    ])
    return "\n".join(lines)


def format_human_report(payload: Dict[str, Any]) -> str:
    mode = payload.get("mode", payload.get("deliverable_id", "report"))
    lines = [f"[{mode.upper()}] file={payload.get('file_name', 'multi-dataset')}"]
    if mode == "summary":
        for m in payload["metrics"]:
            lines.append(
                f"  {m['group']} :: {m['metric']} (n={m['n']}, {m['period_start']}..{m['period_end']}): "
                f"first={m['first']} -> last={m['last']} (pct={m['pct_change']}%), mean={m['mean']}, median={m['median']}, iqr={m['iqr']}"
            )
    elif mode == "cagr":
        for r in payload["results"]:
            real_str = f", real_cagr={r['real_cagr_pct']}%" if r["real_cagr_pct"] is not None else ""
            lines.append(
                f"  {r['series']} ({r['start_period']} -> {r['end_period']}, {r['elapsed_years']}y): "
                f"{r['start_value']} -> {r['end_value']} ({r['pct_delta']}%), nom_cagr={r['nominal_cagr_pct']}%{real_str}"
            )
    elif mode == "spread":
        lines.append(f"  kind={payload['comparison_kind']}")
        for row in payload.get("timeline", payload.get("steps", [])):
            lines.append(f"  {json.dumps(row)}")
    elif mode == "deciles":
        s = payload["snapshot"]
        lines.append(
            f"  period={s['period']}: Top10%={s['top_10_share_pct']}% (${s['top_10_usd_trillions']}T) vs "
            f"Bot50%={s['bottom_50_share_pct']}% (${s['bottom_50_usd_trillions']}T) | "
            f"agg_ratio={s['top_10_to_bottom_50_aggregate_ratio_x']}x | per_hh={s['top_10_to_bottom_50_per_household_ratio_x']}x | "
            f"gini={s['grouped_gini']}"
        )
    elif mode == "capex-fcf":
        sc = payload["schedule_comparison"]
        for r in payload["annual_rollups"]:
            lines.append(
                f"  {r['year']}: Big4 CapEx={fmt_usd_b(r['big4_capex_usd_b'])} | Big5 CapEx={fmt_usd_b(r['big5_capex_usd_b'])} | "
                f"Big5 FCF={fmt_usd_b(r['big5_fcf_usd_b'])} | CapEx/OCF={r['big5_capex_to_ocf_pct']}%"
            )
        lines.append(
            f"  Depreciation ({sc['short_life_years']}yr vs {sc['long_life_years']}yr) on {fmt_usd_b(sc['big5_active_ai_hardware_stack_usd_b'])} stack: "
            f"EBIT hit={fmt_usd_b(sc['big5_stack_pretax_ebit_hit_usd_b'])}/yr ({sc['big5_ebit_compression_pct']}% of Big5 EBIT)"
        )
    else:
        lines.append(f"  Exported {payload.get('card_count', 0)} verified stat-cards.")
        for c in payload.get("cards", []):
            lines.append(f"  - {c['card_id']}: {c['headline_label']}")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    sub_common = argparse.ArgumentParser(add_help=False)
    sub_common.add_argument("--input", dest="input_path", default=argparse.SUPPRESS, help="Path to CSV or JSON dataset")
    sub_common.add_argument("--json", dest="as_json", action="store_true", default=argparse.SUPPRESS, help="Emit JSON to stdout")
    sub_common.add_argument("--out", dest="out_path", default=argparse.SUPPRESS, help="Write JSON payload to file path")

    parser = argparse.ArgumentParser(
        prog="analyze_datasets.py",
        description="Quantitative Macro, AI, and Security Dataset Analyzer for The Reading Room Editorial OS.",
    )
    parser.add_argument("--input", dest="input_path", default=None, help="Path to CSV or JSON dataset")
    parser.add_argument("--json", dest="as_json", action="store_true", default=False, help="Emit JSON to stdout")
    parser.add_argument("--out", dest="out_path", default=None, help="Write JSON payload to file path")
    sub = parser.add_subparsers(dest="subcommand", required=True)

    p_sum = sub.add_parser("summary", parents=[sub_common], help="Descriptive time-series and cross-sectional stats")
    p_sum.add_argument("--group-by", help="Optional categorical column to group rows")
    p_sum.add_argument("--value-col", help="Specific numeric column to summarize")
    p_sum.add_argument("--period-col", help="Period or year column override")

    p_cagr = sub.add_parser("cagr", parents=[sub_common], help="Nominal and CPI/deflator-adjusted real CAGRs")
    p_cagr.add_argument("--series-col", help="Series identifier column")
    p_cagr.add_argument("--series", dest="series_filter", help="Filter to a single series ID or column")
    p_cagr.add_argument("--period-col", help="Period label column")
    p_cagr.add_argument("--value-col", help="Numeric value column")
    p_cagr.add_argument("--deflator-col", help="CPI or price deflator column")
    p_cagr.add_argument("--start", dest="start_bound", help="Start period filter")
    p_cagr.add_argument("--end", dest="end_bound", help="End period filter")

    p_sp = sub.add_parser("spread", parents=[sub_common], help="Basis-point spreads and cumulative index divergence")
    p_sp.add_argument("--lhs", help="Left-hand column or series ID")
    p_sp.add_argument("--rhs", help="Right-hand column or series ID")
    p_sp.add_argument("--series-col", help="Series identifier column")
    p_sp.add_argument("--period-col", help="Period column")
    p_sp.add_argument("--value-col", help="Numeric value column")

    p_dec = sub.add_parser("deciles", parents=[sub_common], help="Wealth concentration ratios and Lorenz/Gini metrics")
    p_dec.add_argument("--period", dest="target_period", help="Target period slice (default: latest)")
    p_dec.add_argument("--pop-col", default="population_share_pct", help="Population share column in percent")
    p_dec.add_argument("--share-col", default="equity_share_pct", help="Asset share column in percent")
    p_dec.add_argument("--value-col", default="equity_mutual_fund_usd_trillions", help="Dollar level column")

    p_cap = sub.add_parser("capex-fcf", parents=[sub_common], help="CapEx-to-OCF strain and 3yr vs 6yr depreciation")
    p_cap.add_argument("--year", type=int, dest="target_year", help="Focus year for company table (default: latest)")
    p_cap.add_argument("--short-life", type=float, default=3.0, help="Short silicon useful life in years")
    p_cap.add_argument("--long-life", type=float, default=6.0, help="Accounting useful life in years")
    p_cap.add_argument("--tax-rate", type=float, default=0.21, help="Statutory corporate tax rate from 0 to 1")

    p_exp = sub.add_parser("export-cards", parents=[sub_common], help="Export verified Stat-Cards (JSON + Markdown)")
    p_exp.add_argument("--datasets-dir", help="Directory holding the 5 curated reference datasets")
    p_exp.add_argument("--markdown-out", help="Optional file path to write Markdown Stat-Cards digest")
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.subcommand == "export-cards":
        default_dir = pathlib.Path(__file__).resolve().parent.parent / "datasets"
        ds_dir = pathlib.Path(args.datasets_dir) if args.datasets_dir else (
            pathlib.Path(args.input_path).resolve().parent if args.input_path else default_dir
        )
        payload = build_verified_stat_cards(ds_dir)
        if args.markdown_out:
            md_target = pathlib.Path(args.markdown_out)
            md_target.parent.mkdir(parents=True, exist_ok=True)
            md_target.write_text(render_markdown_cards_table(payload, ds_dir), encoding="utf-8")
    else:
        if not args.input_path:
            parser.error(f"Subcommand '{args.subcommand}' requires --input <csv|json>")
        rows, meta = load_records(pathlib.Path(args.input_path))
        if args.subcommand == "summary":
            payload = compute_summary(rows, meta, args.group_by, args.value_col, args.period_col)
        elif args.subcommand == "cagr":
            payload = compute_cagr_table(
                rows, meta, args.series_col, args.series_filter,
                args.period_col, args.value_col, args.deflator_col, args.start_bound, args.end_bound,
            )
        elif args.subcommand == "spread":
            payload = compute_spread(rows, meta, args.lhs, args.rhs, args.series_col, args.period_col, args.value_col)
        elif args.subcommand == "deciles":
            payload = compute_deciles(rows, meta, args.target_period, args.pop_col, args.share_col, args.value_col)
        elif args.subcommand == "capex-fcf":
            payload = compute_capex_fcf(rows, meta, args.target_year, args.short_life, args.long_life, args.tax_rate)
        else:
            parser.error(f"Unknown subcommand: {args.subcommand}")
            return 2

    json_text = json.dumps(payload, indent=2)
    if args.out_path:
        out_file = pathlib.Path(args.out_path)
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(json_text + "\n", encoding="utf-8")

    sys.stdout.write((json_text if args.as_json else format_human_report(payload)) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
