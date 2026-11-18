#!/usr/bin/env python3
"""
Cohort growth and monetization simulator for The Reading Room.

Models 30 flagship documentary uploads on a 12-day cadence from launch through
January 2028 using Python standard library modules only. Simulates five traffic
impression pools (Browse, Suggested, Search, External, Gatekept-Shorts),
surface-specific CTR curves, AVD retention multipliers across YouTube's 4-layer
test cascade, Series Playlist session-continuation bridges (1.2 to 3.2+ views
per viewer start), returning-subscriber velocity lift, power-law outlier tiers,
subscriber conversion (1.4% to 2.1%), YPP monetization gating, and blended
Finance/AI/Cyber AdSense RPM ($18 to $34).
"""

import argparse
import csv
import datetime
import json
import math
import os
import random
import statistics
import sys


SLATE_BLUEPRINT = [
    ("ep_01", "STR-GEN-EXPLAINER", "sovereign_finance", 24.5, True),
    ("ep_02", "STR-FISHER-ARTIFACT", "sovereign_finance", 28.0, True),
    ("ep_03", "STR-BOYLE-CHAPTERED", "ai_economics", 26.5, True),
    ("ep_04", "STR-HMW-PRIMER", "ai_economics", 25.0, False),
    ("ep_05", "STR-GEN-EXPLAINER", "sovereign_finance", 23.5, False),
    ("ep_06", "STR-MAX-ESSAY", "ai_economics", 22.5, False),
    ("ep_07", "STR-AIC-SPECULATIVE", "cyber_geopolitics", 31.0, False),
    ("ep_08", "STR-MAX-ESSAY", "cyber_geopolitics", 21.5, False),
    ("ep_09", "STR-FISHER-ARTIFACT", "cyber_geopolitics", 29.0, False),
    ("ep_10", "STR-BOYLE-CHAPTERED", "sovereign_finance", 27.5, False),
    ("ep_11", "STR-GEN-EXPLAINER", "sovereign_finance", 24.0, False),
    ("ep_12", "STR-HMW-PRIMER", "ai_economics", 26.0, False),
    ("ep_13", "STR-AOTP-LADDER", "ai_economics", 20.5, False),
    ("ep_14", "STR-FISHER-ARTIFACT", "sovereign_finance", 30.0, False),
    ("ep_15", "STR-AIC-CLOCKED", "cyber_geopolitics", 34.0, False),
    ("ep_16", "STR-BOYLE-CHAPTERED", "ai_economics", 28.5, False),
    ("ep_17", "STR-GEN-EXPLAINER", "sovereign_finance", 24.5, False),
    ("ep_18", "STR-MAX-ESSAY", "ai_economics", 22.0, False),
    ("ep_19", "STR-AIC-SPECULATIVE", "cyber_geopolitics", 32.0, False),
    ("ep_20", "STR-HMW-PRIMER", "sovereign_finance", 26.5, False),
    ("ep_21", "STR-FISHER-ARTIFACT", "cyber_geopolitics", 29.5, False),
    ("ep_22", "STR-GEN-EXPLAINER", "ai_economics", 25.0, False),
    ("ep_23", "STR-BOYLE-CHAPTERED", "sovereign_finance", 28.0, False),
    ("ep_24", "STR-AOTP-LADDER", "cyber_geopolitics", 21.0, False),
    ("ep_25", "STR-AIC-SPECULATIVE", "ai_economics", 33.0, False),
    ("ep_26", "STR-GEN-EXPLAINER", "sovereign_finance", 25.5, False),
    ("ep_27", "STR-FISHER-ARTIFACT", "sovereign_finance", 30.5, False),
    ("ep_28", "STR-HMW-PRIMER", "ai_economics", 27.0, False),
    ("ep_29", "STR-BOYLE-CHAPTERED", "cyber_geopolitics", 29.0, False),
    ("ep_30", "STR-AIC-CLOCKED", "sovereign_finance", 35.0, False),
]

DOMAIN_RPM_BANDS = {
    "sovereign_finance": (25.5, 33.2),
    "ai_economics": (22.0, 29.8),
    "cyber_geopolitics": (18.4, 25.8),
}

MONTH_SEASONALITY = {
    1: 0.89,
    2: 0.94,
    3: 0.98,
    4: 0.97,
    5: 1.00,
    6: 1.01,
    7: 0.96,
    8: 0.98,
    9: 1.04,
    10: 1.08,
    11: 1.15,
    12: 1.17,
}


def clamp(val: float, low: float, high: float) -> float:
    return max(low, min(high, val))


def percentile(sorted_vals: list[float], q: float) -> float:
    if not sorted_vals:
        return 0.0
    if len(sorted_vals) == 1:
        return float(sorted_vals[0])
    pos = (len(sorted_vals) - 1) * q
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return float(sorted_vals[lo])
    frac = pos - lo
    return float(sorted_vals[lo] * (1.0 - frac) + sorted_vals[hi] * frac)


def get_episode_spec(idx: int) -> tuple[str, str, str, float, bool]:
    if idx < len(SLATE_BLUEPRINT):
        return SLATE_BLUEPRINT[idx]
    template = SLATE_BLUEPRINT[idx % len(SLATE_BLUEPRINT)]
    return (f"ep_{idx + 1:02d}", template[1], template[2], template[3], False)


def compute_session_multiplier(
    episode_number: int, total_reference_episodes: int, max_session_depth: float
) -> float:
    if episode_number <= 1:
        return 1.20
    denom = max(1, total_reference_episodes - 1)
    progress = min(1.4, (episode_number - 1) / float(denom))
    return 1.20 + (max_session_depth - 1.20) * (progress ** 0.76)


def determine_cascade_layer(
    tier: str, browse_ctr: float, avd_pct: float, avg_view_min: float
) -> int:
    watch_per_imp = browse_ctr * avg_view_min
    if (
        tier == "breakout_outlier"
        and browse_ctr >= 0.060
        and avd_pct >= 0.502
        and watch_per_imp >= 0.74
    ):
        return 4
    if browse_ctr >= 0.053 and avd_pct >= 0.482 and watch_per_imp >= 0.62:
        return 3
    if browse_ctr >= 0.047 and avd_pct >= 0.458:
        return 2
    return 1


def simulate_single_cohort(
    rng: random.Random,
    num_episodes: int,
    cadence_days: int,
    start_date: datetime.date,
    horizon_date: datetime.date,
) -> dict:
    # Channel-level latent execution regime (captures correlated packaging/voice skill)
    channel_skill = clamp(rng.gauss(1.0, 0.095), 0.78, 1.26)
    max_session_depth = clamp(rng.gauss(3.32, 0.11), 3.12, 3.58)

    upload_dates = [
        start_date + datetime.timedelta(days=i * cadence_days)
        for i in range(num_episodes)
    ]
    effective_horizon = max(
        horizon_date, upload_dates[-1] + datetime.timedelta(days=max(12, cadence_days))
    )

    episodes = []
    for i in range(num_episodes):
        slug, strategy_id, domain, duration_min, is_launch_trio = get_episode_spec(i)
        pub_date = upload_dates[i]

        # Power-law tier assignment with slight packaging maturity lift across slate
        maturity_bonus = 0.035 * (i / max(1, num_episodes - 1))
        p_breakout = clamp((0.165 + maturity_bonus) * channel_skill, 0.09, 0.27)
        p_mid = 0.495
        roll = rng.random()
        if roll < p_breakout:
            tier = "breakout_outlier"
        elif roll < p_breakout + p_mid:
            tier = "mid_performer"
        else:
            tier = "horizon_library"

        # CTR and AVD draws per tier, strictly respecting channel bounds
        if tier == "breakout_outlier":
            raw_browse_ctr = rng.gauss(0.0695, 0.0055) * (channel_skill ** 0.25)
            avd_pct = clamp(rng.gauss(0.526, 0.016), 0.495, 0.560)
        elif tier == "mid_performer":
            raw_browse_ctr = rng.gauss(0.0590, 0.0052) * (channel_skill ** 0.20)
            avd_pct = clamp(rng.gauss(0.498, 0.018), 0.462, 0.548)
        else:
            raw_browse_ctr = rng.gauss(0.0510, 0.0045) * (channel_skill ** 0.15)
            avd_pct = clamp(rng.gauss(0.476, 0.016), 0.450, 0.525)

        # 24-hour post-publish CTR rescue protocol (swaps Backup Pair B/C if < 4.9%)
        rescued = False
        if raw_browse_ctr < 0.049:
            raw_browse_ctr += rng.uniform(0.0045, 0.0095)
            rescued = True

        browse_ctr = clamp(raw_browse_ctr, 0.045, 0.085)
        search_ctr = clamp(
            rng.gauss(0.119, 0.009) + (0.004 if tier != "horizon_library" else 0.002),
            0.100,
            0.140,
        )
        suggested_ctr = clamp(browse_ctr * rng.uniform(0.84, 0.96), 0.042, 0.078)
        external_ctr = clamp(rng.gauss(0.108, 0.012), 0.085, 0.135)
        shorts_bridge_ctr = clamp(rng.gauss(0.0265, 0.0038), 0.019, 0.036)

        avg_view_min = duration_min * avd_pct
        cascade_layer = determine_cascade_layer(
            tier, browse_ctr, avd_pct, avg_view_min
        )

        # Domain + seasonality + mid-roll density RPM ($18 to $34)
        rpm_lo, rpm_hi = DOMAIN_RPM_BANDS[domain]
        base_rpm = rng.uniform(rpm_lo, rpm_hi)
        duration_factor = clamp(0.94 + (duration_min - 22.0) * 0.011, 0.90, 1.08)
        season_factor = MONTH_SEASONALITY[pub_date.month]
        episode_rpm = clamp(base_rpm * duration_factor * season_factor, 18.0, 34.0)

        episodes.append(
            {
                "episode_number": i + 1,
                "slug": slug,
                "publish_date": pub_date.isoformat(),
                "strategy_id": strategy_id,
                "domain": domain,
                "duration_min": round(duration_min, 2),
                "is_launch_trio": is_launch_trio,
                "tier": tier,
                "cascade_layer": cascade_layer,
                "ctr_rescued_24h": rescued,
                "browse_ctr": browse_ctr,
                "search_ctr": search_ctr,
                "suggested_ctr": suggested_ctr,
                "external_ctr": external_ctr,
                "shorts_bridge_ctr": shorts_bridge_ctr,
                "avd_pct": avd_pct,
                "avg_view_min": avg_view_min,
                "rpm_usd": episode_rpm,
                "impressions": {
                    "browse": 0.0,
                    "suggested": 0.0,
                    "search": 0.0,
                    "external": 0.0,
                    "gatekept_shorts": 0.0,
                },
                "views_by_pool": {
                    "browse": 0.0,
                    "suggested": 0.0,
                    "search": 0.0,
                    "external": 0.0,
                    "gatekept_shorts": 0.0,
                },
                "returning_sub_views": 0.0,
                "non_sub_views": 0.0,
                "playlist_continuation_views_received": 0.0,
                "sub_conversion_rate": 0.0,
                "net_subscribers_added": 0.0,
                "monetized_views": 0.0,
                "adsense_revenue_usd": 0.0,
                "watch_hours": 0.0,
                "session_views_per_start_at_launch": compute_session_multiplier(
                    i + 1, 30, max_session_depth
                ),
            }
        )

    # Epoch-by-epoch simulation across upload schedule + post-upload tail to horizon
    cumulative_subs = 0.0
    cumulative_watch_hours = 0.0
    ypp_unlocked = False
    ypp_unlock_episode = None
    ypp_unlock_date = None
    subs_100k_episode = None
    subs_100k_date = None

    epoch_snapshots = []

    for k in range(num_episodes):
        ep = episodes[k]
        epoch_start = upload_dates[k]
        epoch_end = (
            upload_dates[k + 1] if k + 1 < num_episodes else effective_horizon
        )
        epoch_days = max(1, (epoch_end - epoch_start).days)

        # 1. Cold-start recommender ramp + returning-subscriber velocity lift
        # A brand-new channel starts with narrow seed exploration on Ep 01..06
        # until YouTube maps watch-history lookalike clusters across adjacent niches.
        cold_start_ramp = 0.16 + 0.84 * (1.0 - math.exp(-k / 5.5))
        active_sub_reach = cumulative_subs * rng.uniform(0.36, 0.48)
        returning_sub_views = active_sub_reach * rng.uniform(0.110, 0.148)
        velocity_lift = 1.0 + 0.36 * math.log1p(cumulative_subs / 15000.0)

        # 2. Layer 1..4 Browse algorithmic pool for Episode k during launch epoch
        if ep["cascade_layer"] == 4:
            # Pareto-tailed breakout wave (Breakout Outliers drive ~50%+ of views)
            pareto_draw = clamp((1.0 / (rng.random() ** 0.46)), 1.0, 4.6)
            base_browse_imp = rng.uniform(2_400_000, 3_850_000) * pareto_draw
            # Breakout Layer-4 waves partially pierce cold-start ceiling
            effective_ramp = max(cold_start_ramp, 0.52)
        elif ep["cascade_layer"] == 3:
            base_browse_imp = rng.uniform(680_000, 1_420_000)
            effective_ramp = cold_start_ramp
        elif ep["cascade_layer"] == 2:
            base_browse_imp = rng.uniform(210_000, 460_000)
            effective_ramp = cold_start_ramp
        else:
            base_browse_imp = rng.uniform(85_000, 195_000)
            effective_ramp = cold_start_ramp

        launch_trio_boost = 1.15 if ep["is_launch_trio"] else 1.0
        browse_imp = (
            base_browse_imp * effective_ramp * velocity_lift * launch_trio_boost * channel_skill
            + active_sub_reach
        )
        browse_views = browse_imp * ep["browse_ctr"]
        returning_sub_views = min(returning_sub_views, browse_views * 0.42)

        # External adjacent Suggested rail on launch
        suggested_imp = browse_imp * rng.uniform(0.34, 0.45)
        suggested_views = suggested_imp * ep["suggested_ctr"]

        # Launch Search + External Receipt Seeding + Gatekept Vertical Bridge
        search_launch_imp = rng.uniform(16_000, 44_000) * (0.55 + 0.45 * cold_start_ramp) * (
            1.35 if ep["tier"] == "breakout_outlier" else 1.0
        )
        search_launch_views = search_launch_imp * ep["search_ctr"]

        ext_mult = 1.85 if ep["is_launch_trio"] else (1.35 if ep["cascade_layer"] == 4 else 1.0)
        external_imp = rng.uniform(18_000, 48_000) * ext_mult * channel_skill
        external_views = external_imp * ep["external_ctr"]

        # 0.5 audience-protected native vertical bridge clip per episode on average
        has_short_bridge = (k % 2 == 0)
        shorts_imp = (
            rng.uniform(55_000, 165_000) * (0.50 + 0.50 * cold_start_ramp) * channel_skill
            if has_short_bridge
            else 0.0
        )
        shorts_views = shorts_imp * ep["shorts_bridge_ctr"]

        ep["impressions"]["browse"] += browse_imp
        ep["impressions"]["suggested"] += suggested_imp
        ep["impressions"]["search"] += search_launch_imp
        ep["impressions"]["external"] += external_imp
        ep["impressions"]["gatekept_shorts"] += shorts_imp

        ep["views_by_pool"]["browse"] += browse_views
        ep["views_by_pool"]["suggested"] += suggested_views
        ep["views_by_pool"]["search"] += search_launch_views
        ep["views_by_pool"]["external"] += external_views
        ep["views_by_pool"]["gatekept_shorts"] += shorts_views
        ep["returning_sub_views"] += returning_sub_views

        launch_total_views = (
            browse_views
            + suggested_views
            + search_launch_views
            + external_views
            + shorts_views
        )
        launch_non_sub_views = max(0.0, launch_total_views - returning_sub_views)
        ep["non_sub_views"] += launch_non_sub_views

        # Subscriber conversion rate strictly inside [1.4%, 2.1%]
        avd_norm = (ep["avd_pct"] - 0.45) / 0.11
        sess_mult = ep["session_views_per_start_at_launch"]
        sess_norm = clamp((sess_mult - 1.20) / 2.20, 0.0, 1.0)
        cold_dilution = 0.0009 if ep["cascade_layer"] == 4 else 0.0
        net_conv_rate = clamp(
            0.0143 + 0.0034 * avd_norm + 0.0031 * sess_norm - cold_dilution,
            0.0140,
            0.0210,
        )
        ep["sub_conversion_rate"] = net_conv_rate

        epoch_new_subs = launch_non_sub_views * net_conv_rate
        ep["net_subscribers_added"] += epoch_new_subs

        epoch_watch_hours = (launch_total_views * ep["avg_view_min"]) / 60.0
        ep["watch_hours"] += epoch_watch_hours

        if ypp_unlocked:
            ep["monetized_views"] += launch_total_views
            ep["adsense_revenue_usd"] += (launch_total_views / 1000.0) * ep["rpm_usd"]

        # 3. Series Playlist Session-Continuation Bridges into back catalog (1..k)
        if k >= 1:
            # Unique new viewer starts generate additional binge clicks across existing library
            unique_starts = launch_non_sub_views / (1.0 + 0.35 * sess_norm)
            extra_binge_views = unique_starts * max(0.0, sess_mult - 1.0) * 0.42
            # Weight toward thematic domain matches, Launch Trio anchors, and recent uploads
            weights = []
            for j in range(k):
                prev = episodes[j]
                recency_w = math.exp(-(k - j) / 7.5)
                domain_w = 1.45 if prev["domain"] == ep["domain"] else 0.85
                trio_w = 1.30 if prev["is_launch_trio"] else 1.0
                weights.append(recency_w * domain_w * trio_w)
            w_sum = sum(weights) or 1.0

            for j in range(k):
                prev = episodes[j]
                alloc_views = extra_binge_views * (weights[j] / w_sum)
                # Playlist/End-screen continuation runs high CTR (~11.5%) inside Suggested pool
                alloc_imp = alloc_views / 0.115
                prev["impressions"]["suggested"] += alloc_imp
                prev["views_by_pool"]["suggested"] += alloc_views
                prev["playlist_continuation_views_received"] += alloc_views

                prev_non_sub = alloc_views * 0.78
                prev_ret_sub = alloc_views * 0.22
                prev["non_sub_views"] += prev_non_sub
                prev["returning_sub_views"] += prev_ret_sub

                add_subs = prev_non_sub * prev["sub_conversion_rate"]
                prev["net_subscribers_added"] += add_subs
                epoch_new_subs += add_subs

                add_wh = (alloc_views * prev["avg_view_min"]) / 60.0
                prev["watch_hours"] += add_wh
                epoch_watch_hours += add_wh

                if ypp_unlocked:
                    prev["monetized_views"] += alloc_views
                    prev["adsense_revenue_usd"] += (alloc_views / 1000.0) * prev["rpm_usd"]

        # 4. Evergreen Search & Ongoing Browse/Suggested Tail for all prior episodes 0..k-1
        day_scale = epoch_days / 12.0
        for j in range(k):
            prev = episodes[j]
            age_epochs = k - j
            # Evergreen Search compounds steadily with minimal decay (staleness-immune topics)
            evergreen_search_imp = (
                rng.uniform(14_000, 34_000)
                * day_scale
                * channel_skill
                * (1.25 if prev["tier"] == "breakout_outlier" else 1.0)
                * (1.0 / (1.0 + 0.025 * age_epochs))
            )
            evergreen_search_views = evergreen_search_imp * prev["search_ctr"]

            # Residual algorithmic Browse + Suggested tail
            tail_decay = math.exp(-age_epochs / 5.2)
            tail_tier_scale = (
                2.4 if prev["tier"] == "breakout_outlier" else (1.25 if prev["tier"] == "mid_performer" else 0.75)
            )
            tail_browse_imp = rng.uniform(18_000, 46_000) * day_scale * tail_decay * tail_tier_scale
            tail_browse_views = tail_browse_imp * prev["browse_ctr"]
            tail_sugg_imp = tail_browse_imp * 0.55
            tail_sugg_views = tail_sugg_imp * prev["suggested_ctr"]

            prev["impressions"]["search"] += evergreen_search_imp
            prev["impressions"]["browse"] += tail_browse_imp
            prev["impressions"]["suggested"] += tail_sugg_imp

            prev["views_by_pool"]["search"] += evergreen_search_views
            prev["views_by_pool"]["browse"] += tail_browse_views
            prev["views_by_pool"]["suggested"] += tail_sugg_views

            tail_total = evergreen_search_views + tail_browse_views + tail_sugg_views
            tail_non_sub = tail_total * 0.86
            tail_ret_sub = tail_total * 0.14
            prev["non_sub_views"] += tail_non_sub
            prev["returning_sub_views"] += tail_ret_sub

            add_subs = tail_non_sub * prev["sub_conversion_rate"]
            prev["net_subscribers_added"] += add_subs
            epoch_new_subs += add_subs

            add_wh = (tail_total * prev["avg_view_min"]) / 60.0
            prev["watch_hours"] += add_wh
            epoch_watch_hours += add_wh

            if ypp_unlocked:
                prev["monetized_views"] += tail_total
                # Adjust tail RPM for current epoch's calendar month seasonality
                tail_rpm = clamp(
                    (prev["rpm_usd"] / MONTH_SEASONALITY[datetime.date.fromisoformat(prev["publish_date"]).month])
                    * MONTH_SEASONALITY[epoch_start.month],
                    18.0,
                    34.0,
                )
                prev["adsense_revenue_usd"] += (tail_total / 1000.0) * tail_rpm

        cumulative_subs += epoch_new_subs
        cumulative_watch_hours += epoch_watch_hours

        if (not ypp_unlocked) and cumulative_subs >= 1000.0 and cumulative_watch_hours >= 4000.0:
            ypp_unlocked = True
            ypp_unlock_episode = k + 1
            ypp_unlock_date = epoch_end.isoformat()

        if subs_100k_episode is None and cumulative_subs >= 100_000.0:
            subs_100k_episode = k + 1
            subs_100k_date = epoch_end.isoformat()

        cum_views_now = sum(sum(e["views_by_pool"].values()) for e in episodes[: k + 1])
        cum_rev_now = sum(e["adsense_revenue_usd"] for e in episodes[: k + 1])
        epoch_snapshots.append(
            {
                "episode_number": k + 1,
                "slug": ep["slug"],
                "publish_date": ep["publish_date"],
                "epoch_end_date": epoch_end.isoformat(),
                "session_views_per_start": round(ep["session_views_per_start_at_launch"], 3),
                "cumulative_subscribers": round(cumulative_subs, 1),
                "cumulative_views": round(cum_views_now, 1),
                "cumulative_watch_hours": round(cumulative_watch_hours, 1),
                "cumulative_adsense_usd": round(cum_rev_now, 2),
            }
        )

    # Finalize episode totals
    pool_totals_imp = {k: 0.0 for k in ("browse", "suggested", "search", "external", "gatekept_shorts")}
    pool_totals_views = {k: 0.0 for k in ("browse", "suggested", "search", "external", "gatekept_shorts")}
    tier_counts = {"breakout_outlier": 0, "mid_performer": 0, "horizon_library": 0}
    tier_views = {"breakout_outlier": 0.0, "mid_performer": 0.0, "horizon_library": 0.0}

    for ep in episodes:
        tot_v = sum(ep["views_by_pool"].values())
        tot_i = sum(ep["impressions"].values())
        ep["total_views"] = tot_v
        ep["total_impressions"] = tot_i
        tier_counts[ep["tier"]] += 1
        tier_views[ep["tier"]] += tot_v
        for p_key in pool_totals_imp:
            pool_totals_imp[p_key] += ep["impressions"][p_key]
            pool_totals_views[p_key] += ep["views_by_pool"][p_key]

    total_views = sum(pool_totals_views.values())
    total_impressions = sum(pool_totals_imp.values())
    total_monetized_views = sum(e["monetized_views"] for e in episodes)
    total_adsense_usd = sum(e["adsense_revenue_usd"] for e in episodes)
    blended_rpm = (
        (total_adsense_usd / (total_monetized_views / 1000.0))
        if total_monetized_views > 0
        else 0.0
    )
    mean_browse_ctr = statistics.mean(e["browse_ctr"] for e in episodes)
    mean_search_ctr = statistics.mean(e["search_ctr"] for e in episodes)
    mean_avd_pct = statistics.mean(e["avd_pct"] for e in episodes)
    mean_sub_conv = statistics.mean(e["sub_conversion_rate"] for e in episodes)

    return {
        "final_subscribers": cumulative_subs,
        "total_views": total_views,
        "total_impressions": total_impressions,
        "total_watch_hours": cumulative_watch_hours,
        "total_monetized_views": total_monetized_views,
        "total_adsense_usd": total_adsense_usd,
        "blended_monetized_rpm_usd": blended_rpm,
        "mean_browse_ctr": mean_browse_ctr,
        "mean_search_ctr": mean_search_ctr,
        "mean_avd_pct": mean_avd_pct,
        "mean_sub_conversion_rate": mean_sub_conv,
        "start_session_views_per_start": episodes[0]["session_views_per_start_at_launch"],
        "end_session_views_per_start": episodes[-1]["session_views_per_start_at_launch"],
        "ypp_unlock_episode": ypp_unlock_episode,
        "ypp_unlock_date": ypp_unlock_date,
        "subs_100k_episode": subs_100k_episode,
        "subs_100k_date": subs_100k_date,
        "tier_counts": tier_counts,
        "tier_views": tier_views,
        "pool_impressions": pool_totals_imp,
        "pool_views": pool_totals_views,
        "epoch_snapshots": epoch_snapshots,
        "episodes": episodes,
        "effective_horizon_date": effective_horizon.isoformat(),
    }


def summarize_distribution(values: list[float], digits: int = 1) -> dict:
    s = sorted(values)
    return {
        "p05": round(percentile(s, 0.05), digits),
        "p10": round(percentile(s, 0.10), digits),
        "p25": round(percentile(s, 0.25), digits),
        "p50_median": round(percentile(s, 0.50), digits),
        "p75": round(percentile(s, 0.75), digits),
        "p90": round(percentile(s, 0.90), digits),
        "p95": round(percentile(s, 0.95), digits),
        "mean": round(statistics.mean(s), digits),
        "stdev": round(statistics.pstdev(s), digits) if len(s) > 1 else 0.0,
    }


def run_monte_carlo(
    num_runs: int,
    num_episodes: int,
    cadence_days: int,
    seed: int,
    start_date_str: str,
    horizon_date_str: str,
) -> dict:
    start_date = datetime.date.fromisoformat(start_date_str)
    horizon_date = datetime.date.fromisoformat(horizon_date_str)
    master_rng = random.Random(seed)

    runs = []
    for _ in range(num_runs):
        run_seed = master_rng.randint(1, 2_147_483_647)
        runs.append(
            simulate_single_cohort(
                random.Random(run_seed),
                num_episodes=num_episodes,
                cadence_days=cadence_days,
                start_date=start_date,
                horizon_date=horizon_date,
            )
        )

    runs_by_subs = sorted(runs, key=lambda r: r["final_subscribers"])
    median_run = runs_by_subs[len(runs_by_subs) // 2]
    p10_run = runs_by_subs[max(0, int(math.floor((len(runs_by_subs) - 1) * 0.10)))]
    p90_run = runs_by_subs[min(len(runs_by_subs) - 1, int(math.ceil((len(runs_by_subs) - 1) * 0.90)))]

    prob_100k = sum(1 for r in runs if r["final_subscribers"] >= 100_000.0) / float(num_runs)
    subs_100k_eps = [
        float(r["subs_100k_episode"]) for r in runs if r["subs_100k_episode"] is not None
    ]
    ypp_eps = [
        float(r["ypp_unlock_episode"]) for r in runs if r["ypp_unlock_episode"] is not None
    ]

    # Build episode-by-episode cohort trajectory table across all Monte Carlo runs
    trajectory_by_episode = []
    for idx in range(num_episodes):
        subs_at_k = sorted(r["epoch_snapshots"][idx]["cumulative_subscribers"] for r in runs)
        views_at_k = sorted(r["epoch_snapshots"][idx]["cumulative_views"] for r in runs)
        wh_at_k = sorted(r["epoch_snapshots"][idx]["cumulative_watch_hours"] for r in runs)
        rev_at_k = sorted(r["epoch_snapshots"][idx]["cumulative_adsense_usd"] for r in runs)
        sess_at_k = sorted(r["epoch_snapshots"][idx]["session_views_per_start"] for r in runs)
        ref_snap = median_run["epoch_snapshots"][idx]
        spec = get_episode_spec(idx)

        trajectory_by_episode.append(
            {
                "episode_number": idx + 1,
                "slug": ref_snap["slug"],
                "strategy_id": spec[1],
                "domain": spec[2],
                "publish_date": ref_snap["publish_date"],
                "epoch_end_date": ref_snap["epoch_end_date"],
                "session_views_per_start_p50": round(percentile(sess_at_k, 0.50), 2),
                "subscribers_p10": round(percentile(subs_at_k, 0.10), 0),
                "subscribers_p50": round(percentile(subs_at_k, 0.50), 0),
                "subscribers_p90": round(percentile(subs_at_k, 0.90), 0),
                "cumulative_views_p10": round(percentile(views_at_k, 0.10), 0),
                "cumulative_views_p50": round(percentile(views_at_k, 0.50), 0),
                "cumulative_views_p90": round(percentile(views_at_k, 0.90), 0),
                "cumulative_watch_hours_p50": round(percentile(wh_at_k, 0.50), 0),
                "cumulative_adsense_usd_p10": round(percentile(rev_at_k, 0.10), 2),
                "cumulative_adsense_usd_p50": round(percentile(rev_at_k, 0.50), 2),
                "cumulative_adsense_usd_p90": round(percentile(rev_at_k, 0.90), 2),
            }
        )

    # Traffic pool shares (mean across runs)
    pool_keys = ("browse", "suggested", "search", "external", "gatekept_shorts")
    pool_summary = {}
    mean_tot_views = statistics.mean(r["total_views"] for r in runs)
    mean_tot_imps = statistics.mean(r["total_impressions"] for r in runs)
    for pk in pool_keys:
        p_imps = [r["pool_impressions"][pk] for r in runs]
        p_views = [r["pool_views"][pk] for r in runs]
        m_imp = statistics.mean(p_imps)
        m_view = statistics.mean(p_views)
        pool_summary[pk] = {
            "impressions_p50": round(percentile(sorted(p_imps), 0.50), 0),
            "views_p50": round(percentile(sorted(p_views), 0.50), 0),
            "impression_share_pct": round((m_imp / mean_tot_imps) * 100.0, 2),
            "view_share_pct": round((m_view / mean_tot_views) * 100.0, 2),
            "effective_ctr_pct": round((m_view / m_imp) * 100.0, 2) if m_imp > 0 else 0.0,
        }

    # Power-law tier breakdown
    tier_keys = ("breakout_outlier", "mid_performer", "horizon_library")
    tier_summary = {}
    for tk in tier_keys:
        counts = [float(r["tier_counts"][tk]) for r in runs]
        t_views = [r["tier_views"][tk] for r in runs]
        m_cnt = statistics.mean(counts)
        m_tv = statistics.mean(t_views)
        tier_summary[tk] = {
            "episode_count_mean": round(m_cnt, 2),
            "episode_share_pct": round((m_cnt / num_episodes) * 100.0, 2),
            "views_p50": round(percentile(sorted(t_views), 0.50), 0),
            "channel_view_share_pct": round((m_tv / mean_tot_views) * 100.0, 2),
            "avg_views_per_episode": round(m_tv / m_cnt, 0) if m_cnt > 0 else 0.0,
        }

    # Compact representative median episode ledger
    median_episode_ledger = []
    for e in median_run["episodes"]:
        median_episode_ledger.append(
            {
                "episode_number": e["episode_number"],
                "slug": e["slug"],
                "publish_date": e["publish_date"],
                "strategy_id": e["strategy_id"],
                "domain": e["domain"],
                "duration_min": e["duration_min"],
                "tier": e["tier"],
                "cascade_layer": e["cascade_layer"],
                "ctr_rescued_24h": e["ctr_rescued_24h"],
                "browse_ctr_pct": round(e["browse_ctr"] * 100.0, 2),
                "search_ctr_pct": round(e["search_ctr"] * 100.0, 2),
                "avd_pct": round(e["avd_pct"] * 100.0, 2),
                "session_views_per_start": round(e["session_views_per_start_at_launch"], 2),
                "total_impressions": round(e["total_impressions"], 0),
                "total_views": round(e["total_views"], 0),
                "playlist_continuation_views": round(
                    e["playlist_continuation_views_received"], 0
                ),
                "sub_conversion_pct": round(e["sub_conversion_rate"] * 100.0, 2),
                "net_subscribers_added": round(e["net_subscribers_added"], 0),
                "rpm_usd": round(e["rpm_usd"], 2),
                "adsense_revenue_usd": round(e["adsense_revenue_usd"], 2),
            }
        )

    return {
        "model_metadata": {
            "model_name": "The Reading Room 0-to-100K Cohort Growth Simulator",
            "version": "1.0.0",
            "monte_carlo_runs": num_runs,
            "episodes": num_episodes,
            "cadence_days": cadence_days,
            "seed": seed,
            "launch_date": start_date.isoformat(),
            "final_upload_date": (
                start_date + datetime.timedelta(days=(num_episodes - 1) * cadence_days)
            ).isoformat(),
            "horizon_date": median_run["effective_horizon_date"],
            "parameter_bounds": {
                "browse_ctr_pct": [4.5, 8.5],
                "search_ctr_pct": [10.0, 14.0],
                "avd_retention_pct": [45.0, 56.0],
                "session_views_per_start": [1.2, 3.58],
                "sub_conversion_pct": [1.4, 2.1],
                "adsense_rpm_usd": [18.0, 34.0],
            },
        },
        "horizon_summary": {
            "subscribers": summarize_distribution([r["final_subscribers"] for r in runs], 0),
            "total_views": summarize_distribution([r["total_views"] for r in runs], 0),
            "total_impressions": summarize_distribution([r["total_impressions"] for r in runs], 0),
            "total_watch_hours": summarize_distribution([r["total_watch_hours"] for r in runs], 0),
            "adsense_revenue_usd": summarize_distribution([r["total_adsense_usd"] for r in runs], 2),
            "blended_rpm_usd": summarize_distribution(
                [r["blended_monetized_rpm_usd"] for r in runs], 2
            ),
            "mean_browse_ctr_pct": summarize_distribution(
                [r["mean_browse_ctr"] * 100.0 for r in runs], 2
            ),
            "mean_search_ctr_pct": summarize_distribution(
                [r["mean_search_ctr"] * 100.0 for r in runs], 2
            ),
            "mean_avd_pct": summarize_distribution(
                [r["mean_avd_pct"] * 100.0 for r in runs], 2
            ),
            "mean_sub_conversion_pct": summarize_distribution(
                [r["mean_sub_conversion_rate"] * 100.0 for r in runs], 2
            ),
            "end_session_views_per_start": summarize_distribution(
                [r["end_session_views_per_start"] for r in runs], 2
            ),
        },
        "milestones": {
            "probability_100k_by_horizon_pct": round(prob_100k * 100.0, 2),
            "ypp_unlock_episode": summarize_distribution(ypp_eps, 1) if ypp_eps else None,
            "subs_100k_crossing_episode_given_hit": (
                summarize_distribution(subs_100k_eps, 1) if subs_100k_eps else None
            ),
            "p10_representative_100k_date": p10_run["subs_100k_date"],
            "p50_representative_100k_date": median_run["subs_100k_date"],
            "p90_representative_100k_date": p90_run["subs_100k_date"],
            "p50_representative_ypp_date": median_run["ypp_unlock_date"],
        },
        "traffic_pool_breakdown": pool_summary,
        "power_law_tier_breakdown": tier_summary,
        "cohort_trajectory_by_episode": trajectory_by_episode,
        "representative_median_run_episodes": median_episode_ledger,
    }


def export_trajectory_csv(csv_path: str, trajectory_rows: list[dict]) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(csv_path)), exist_ok=True)
    if not trajectory_rows:
        return
    fieldnames = list(trajectory_rows[0].keys())
    with open(csv_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(trajectory_rows)


def format_human_report(result: dict) -> str:
    meta = result["model_metadata"]
    summ = result["horizon_summary"]
    miles = result["milestones"]
    pools = result["traffic_pool_breakdown"]
    tiers = result["power_law_tier_breakdown"]

    lines = []
    lines.append("THE READING ROOM: 0-TO-100K SUBSCRIBER COHORT SIMULATION")
    lines.append("=" * 76)
    lines.append(
        f"Runs: {meta['monte_carlo_runs']} | Episodes: {meta['episodes']} | "
        f"Cadence: {meta['cadence_days']}d | Seed: {meta['seed']}"
    )
    lines.append(
        f"Window: {meta['launch_date']} -> {meta['horizon_date']} "
        f"(Final Upload: {meta['final_upload_date']})"
    )
    lines.append("")
    lines.append("1. HORIZON PERCENTILE OUTCOMES (JANUARY 2028)")
    lines.append(
        f"  Subscribers       : P10 = {int(summ['subscribers']['p10']):>9,d} | "
        f"P50 = {int(summ['subscribers']['p50_median']):>9,d} | "
        f"P90 = {int(summ['subscribers']['p90']):>9,d}"
    )
    lines.append(
        f"  Cumulative Views  : P10 = {int(summ['total_views']['p10']):>9,d} | "
        f"P50 = {int(summ['total_views']['p50_median']):>9,d} | "
        f"P90 = {int(summ['total_views']['p90']):>9,d}"
    )
    lines.append(
        f"  Watch Hours       : P10 = {int(summ['total_watch_hours']['p10']):>9,d} | "
        f"P50 = {int(summ['total_watch_hours']['p50_median']):>9,d} | "
        f"P90 = {int(summ['total_watch_hours']['p90']):>9,d}"
    )
    lines.append(
        f"  AdSense Revenue   : P10 = ${summ['adsense_revenue_usd']['p10']:>9,.2f} | "
        f"P50 = ${summ['adsense_revenue_usd']['p50_median']:>9,.2f} | "
        f"P90 = ${summ['adsense_revenue_usd']['p90']:>9,.2f}"
    )
    lines.append(
        f"  Blended RPM       : P10 = ${summ['blended_rpm_usd']['p10']:>6.2f} | "
        f"P50 = ${summ['blended_rpm_usd']['p50_median']:>6.2f} | "
        f"P90 = ${summ['blended_rpm_usd']['p90']:>6.2f}"
    )
    lines.append(
        f"  Session Depth End : 1.20 -> {summ['end_session_views_per_start']['p50_median']:.2f} "
        f"views per viewer start (P90: {summ['end_session_views_per_start']['p90']:.2f})"
    )
    lines.append(
        f"  P(>= 100K Subs)   : {miles['probability_100k_by_horizon_pct']:.1f}% | "
        f"P50 100K Date: {miles['p50_representative_100k_date']} | "
        f"P50 YPP Unlock: {miles['p50_representative_ypp_date']}"
    )
    lines.append("")
    lines.append("2. TRAFFIC POOL CONTRIBUTION (MEAN SHARE & P50 VOLUME)")
    for pk, pv in pools.items():
        lines.append(
            f"  {pk:<16}: {pv['view_share_pct']:>5.1f}% views "
            f"(P50 views={int(pv['views_p50']):>9,d}, eff CTR={pv['effective_ctr_pct']:>5.2f}%)"
        )
    lines.append("")
    lines.append("3. POWER-LAW OUTLIER TIER ECONOMICS")
    for tk, tv in tiers.items():
        lines.append(
            f"  {tk:<16}: {tv['episode_count_mean']:>4.1f} eps ({tv['episode_share_pct']:>4.1f}%) -> "
            f"{tv['channel_view_share_pct']:>5.1f}% of channel views "
            f"(avg {int(tv['avg_views_per_episode']):>7,d} views/ep)"
        )
    lines.append("")
    lines.append("4. MILESTONE CHECKPOINTS (EPISODE COHORT TRAJECTORY)")
    lines.append(
        f"  {'Ep':<4} {'Date':<11} {'Sess':>4} {'Subs P10':>10} {'Subs P50':>10} "
        f"{'Subs P90':>10} {'Views P50':>11} {'AdSense P50':>12}"
    )
    checkpoints = {1, 3, 5, 10, 15, 20, 25, num_ep_index(result)}
    for row in result["cohort_trajectory_by_episode"]:
        if row["episode_number"] in checkpoints:
            lines.append(
                f"  {row['episode_number']:02d}   {row['publish_date']:<11} "
                f"{row['session_views_per_start_p50']:>4.2f} "
                f"{int(row['subscribers_p10']):>10,d} "
                f"{int(row['subscribers_p50']):>10,d} "
                f"{int(row['subscribers_p90']):>10,d} "
                f"{int(row['cumulative_views_p50']):>11,d} "
                f"${row['cumulative_adsense_usd_p50']:>11,.2f}"
            )
    return "\n".join(lines)


def num_ep_index(result: dict) -> int:
    return int(result["model_metadata"]["episodes"])


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="growth_simulation.py",
        description=(
            "Monte Carlo cohort growth and AdSense RPM simulator for The Reading Room "
            "across 30 flagship uploads on a 12-day cadence through January 2028."
        ),
    )
    parser.add_argument(
        "--episodes",
        type=int,
        default=30,
        help="Number of flagship long-form uploads to simulate (default: 30).",
    )
    parser.add_argument(
        "--cadence-days",
        type=int,
        default=12,
        help="Days between flagship uploads (default: 12).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Deterministic pseudo-random seed (default: 42).",
    )
    parser.add_argument(
        "--monte-carlo",
        type=int,
        default=500,
        help="Number of Monte Carlo cohort trajectories to execute (default: 500).",
    )
    parser.add_argument(
        "--start-date",
        type=str,
        default="2027-02-02",
        help="ISO launch date YYYY-MM-DD for Episode 01 (default: 2027-02-02).",
    )
    parser.add_argument(
        "--horizon-date",
        type=str,
        default="2028-01-31",
        help="ISO evaluation horizon date YYYY-MM-DD (default: 2028-01-31).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print structured JSON simulation payload to stdout.",
    )
    parser.add_argument(
        "--export-json",
        type=str,
        default=None,
        help="Write structured JSON simulation payload to the given file path.",
    )
    parser.add_argument(
        "--export-csv",
        type=str,
        default=None,
        help="Optional path to export the episode P10/P50/P90 trajectory table as CSV.",
    )
    args = parser.parse_args(argv)
    if args.episodes < 1:
        parser.error("--episodes must be >= 1")
    if args.cadence_days < 1:
        parser.error("--cadence-days must be >= 1")
    if args.monte_carlo < 1:
        parser.error("--monte-carlo must be >= 1")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    result = run_monte_carlo(
        num_runs=args.monte_carlo,
        num_episodes=args.episodes,
        cadence_days=args.cadence_days,
        seed=args.seed,
        start_date_str=args.start_date,
        horizon_date_str=args.horizon_date,
    )

    if args.export_json:
        out_abs = os.path.abspath(args.export_json)
        os.makedirs(os.path.dirname(out_abs), exist_ok=True)
        with open(out_abs, "w", encoding="utf-8") as fh:
            json.dump(result, fh, indent=2)

    if args.export_csv:
        export_trajectory_csv(args.export_csv, result["cohort_trajectory_by_episode"])

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(format_human_report(result))
        if args.export_json:
            print(f"\nExported JSON projection -> {os.path.abspath(args.export_json)}")
        if args.export_csv:
            print(f"Exported CSV trajectory  -> {os.path.abspath(args.export_csv)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
