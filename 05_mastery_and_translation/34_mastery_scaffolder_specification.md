---
deliverable_id: "RR-OS-DIV05-34"
title: "Automated Mastery Book and Bilingual Study Packet Scaffolder Specification"
tool_path: "05_mastery_and_translation/tools/mastery_scaffolder.mjs"
default_output_dir: "05_mastery_and_translation/packets/"
sample_packet: "05_mastery_and_translation/packets/ep_04_study_packet_en_fa.md"
runtime_requirement: "Node.js >= 20 (zero external npm dependencies)"
stage6_anti_ai_clean: true
---

# Deliverable 34: Automated mastery book and study packet scaffolder specification

`05_mastery_and_translation/tools/mastery_scaffolder.mjs` compiles seven upstream Editorial OS registries into bilingual English and Persian (`EN + فارسی`) pre-shoot study packets under `05_mastery_and_translation/packets/`. Every generated packet prepares the host of The Reading Room before A-roll studio capture by locking primary institutional numbers, `[LIVE_STAT_SLOT:...]` refresh tripwires, EN-FA false-friend boundaries, Stage 2 adversarial camera patches, unspoiled five-act beat maps, and ten specialist interrogation drills.

The CLI runs on Node.js 20 or newer with zero third-party npm packages. It strips formatting spam, em dashes, en dashes, double hyphens, exclamation marks, negative-contrast crutches, and Tier-1 or Tier-2 AI vocabulary so generated study packets clear `04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs --mode prose` at `score = 0` (`HUMAN_ONLY`).

## Upstream data sources and fusion schema

The compiler joins seven canonical files across Divisions 02, 03, 04, and 05 into one typed episode context object (`buildEpisodeContext`) before rendering Markdown.

| Order | Source file | Key join fields extracted | Missing or fallback behavior |
| :--- | :--- | :--- | :--- |
| 1 | `02_research_and_data/slate_30_jan2028.json` | `episode_id`, `working_title`, `core_thesis`, `domain_layers`, `live_stat_slots`, `viewer_protection_lever` | Fatal error exit `1` if missing |
| 2 | `04_scripts_and_dossiers/dossiers/ep_XX.md` | YAML frontmatter plus Sections `## 1.` through `## 8.` (`ep_04..ep_30`) | Falls back to `ep_01..ep_03` Launch Trio master and audit bundles |
| 3 | `02_research_and_data/data/fact_ledger.json` | `FL-*` records (`exact_value`, `institution`, `verification_formula`, `adversarial_caveat`, `refresh_instructions`) | Fatal error exit `1` if missing |
| 4 | `04_scripts_and_dossiers/continuity_graph.json` | Node `ep_id`, `primary_vehicle_id`, `tie_semantic_role`, `active_motifs`, `historical_precedent`, `binge_seam` | Reconciles graph slot IDs against Dossier Section `## 4.` |
| 5 | `03_viral_and_packaging/16_90_pair_title_thumbnail_vault.json` | `primary_variant`, `test_and_compare_hypothesis`, three `EPXX-A/B/C` variants and hex palettes | Fatal error exit `1` if missing |
| 6 | `03_viral_and_packaging/19_first_15s_hook_alignment_matrix.json` | `hook_formula_id`, `frame_one_visual_cue`, verbatim `cold_open_spoken_text`, `first_number_word_index`, `r02_unspoiled_suspense_guard` | Fatal error exit `1` if missing |
| 7 | `05_mastery_and_translation/glossary_en_fa.json` | `terms` array matching `term_id`, `english_term`, `aliases`, `plain_camera_english`, `persian_exact`, `false_friend_or_trap`, `multilang_locks`, `mapped_episodes` | Loads automatically when present; falls back cleanly to embedded `BUILTIN_GLOSSARY_30` |

Notice how Continuity Graph reconciliation works on episodes `ep_04` through `ep_30`. Because `continuity_graph.json` stores fixed studio slot registries (`primary_vehicle_id`, `tie_semantic_role`, `foreground_scale_prop_id`, `historical_precedent`) while individual evergreen dossiers reconcile those slots to the exact episode artifact in Section `## 4.`, the scaffolder always surfaces both: it records the graph lock ID inside YAML frontmatter and Section 5 while pulling the episode-accurate vehicle math, scale prop, historical precedent, and closing bridge directly from Dossier Sections `## 4.` and `## 8.`.

## Study packet anatomy (`ep_XX_study_packet_en_fa.md`)

Each generated Markdown file begins with machine-readable YAML frontmatter (`packet_id`, `episode_id`, `episode_number`, `episode_codename`, `working_title`, `target_publish_date`, `series_playlist`, `strategy_preset_id`, `visual_register_id`, `primary_vehicle_id`, `supporting_callback_vehicle_id`, `tie_semantic_role`, `hook_formula_id`, `primary_package_id`, `fact_ledger_ids`, `live_stat_slot_count`, `glossary_source`, `glossary_term_count`, `interrogation_question_count: 10`, `languages: ["en", "fa"]`, `stage6_anti_ai_clean: true`), followed by six standardized editorial sections.

1. Bilingual core thesis and three-layer causal overview (`EN + فارسی`): pairs `slate_30_jan2028.json` English core thesis, three domain layers, `2027-2036` staleness-immunity proof, and non-advisory safe harbor with native analytical Persian (`EPISODE_FA_BRIEFS` across all `30` episodes).
2. Primary institutional fact-lock worksheet: lists every `FL-*` row with exact numerators, verification formulas, and `STATIC_LOCK` vs `[LIVE_STAT_SLOT:...]` classification, followed by a dedicated shoot-week `72`-hour refresh table extracting `THESIS_BREAK_IF` tripwires without truncating decimal thresholds such as `3.0%` or `58.0%`.
3. Episode EN-FA glossary and false-friend lock table: selects `8` to `12` terms ranked by direct `mapped_episodes` match plus alias and keyword overlap against the episode corpus, rendering plain camera English, exact Persian equivalent, false-friend traps, and multilingual locks (`ar`, `es`, `de`) when present in `glossary_en_fa.json`.
4. Stage 2 adversarial red-team objection and spoken patch: extracts assigned `SEAT_*` reviewers, `RT_*` concession codes, per-fact `adversarial_caveat` bullets, and the verbatim teleprompter camera patch with exact word count and `150 wpm` runtime.
5. Packaging alignment, five-act beat map, and locked 15s cold open: consolidates all three `16_90_pair` packaging variants, desk prop and continuity locks, verbatim cold-open rehearsal block, unspoiled `R02` guard, Act I through Act V beats with `[ON SCREEN: ...]` and `bp_ep*` identifiers, `ep_XX -> ep_YY` binge seam, and vertical Short seeds.
6. Ten tailored pre-shoot specialist interrogation questions (`Q01` through `Q10`): drills primary numerator/denominator derivation, cross-ledger reconciliation, shoot-week live-stat tripwires, red-team concession defense, vehicle epistemic framing, historical precedent boundaries, `R02` unspoiled pacing, EN-FA false-friend precision, non-advisory protection scope, and closing prop handoff.

## Command-line interface reference

Run the tool from the repository root (`reading-room-editorial-os`) or pass absolute output paths.

```text
Usage:
  node 05_mastery_and_translation/tools/mastery_scaffolder.mjs --episode ep_04 [--out <file>] [--dry-run] [--json]
  node 05_mastery_and_translation/tools/mastery_scaffolder.mjs --all [--out-dir <dir>] [--dry-run] [--json]
  node 05_mastery_and_translation/tools/mastery_scaffolder.mjs --self-test [--json]
```

| Flag | Default | Purpose |
| :--- | :--- | :--- |
| `--episode <ep_01..ep_30>` | None | Generate a packet for one or more episodes (accepts `ep_04`, `04`, or `4`) |
| `--all` | Off | Process all `27` evergreen dossiers (`ep_04` through `ep_30`) |
| `--include-launch-trio` | Off | Extend `--all` to include `ep_01`, `ep_02`, and `ep_03` (`30` total) |
| `--out <file>` | `packets/ep_XX_study_packet_en_fa.md` | Write single-episode packet to a specific path (invalid with batch runs) |
| `--out-dir <dir>` | `05_mastery_and_translation/packets/` | Destination directory for generated packets |
| `--glossary <file>` | `05_mastery_and_translation/glossary_en_fa.json` | Override glossary path; automatically falls back to `BUILTIN_GLOSSARY_30` if absent |
| `--dry-run` | Off | Parse all sources, render Markdown, and verify prose cleanliness in memory without disk writes |
| `--self-test` | Off | Execute built-in `7`-case verification suite across fallback glossary, sanitizer, and all `30` episodes |
| `--json` | Off | Emit machine-readable JSON telemetry to stdout |
| `--help`, `-h` | Off | Print usage guide and exit `0` |

## Stage 6 anti-AI sanitization and gate guarantees

All generated prose passes through `sanitizeProseText()` while leaving inline code spans and quoted verbatim citations intact. Three design rules prevent false positives and stylometric penalties inside `anti_ai_script_gate.mjs --mode prose` and the host `avoid-ai-writing` detector:

1. Bold-label restraint: generated packets contain zero `**Bold:**` markers, preventing the `formatting` (`> 3` bold phrases) and `bullet-np-list` penalties.
2. Legal citation protection: court reporter strings such as `475 N.J. Super. 420 (App. Div. 2023)` sit inside inline code spans in drill answers so internal abbreviation periods never split into `<= 6`-word parataxis chains.
3. Lexical and punctuation normalization: `SAFE_REPLACEMENTS` eliminates `—`, `–`, `--`, `!`, negative-contrast crutches (`rather than`, `isn't X, it's Y`, `not X, but Y`), Tier-1 banned AI words, and Tier-2 cluster terms (`emphasize`, `quietly`), alongside `real value` inflation triggers before writing to disk.

## Verified execution summary

Before reporting completion, every required verification run executed after the final edit to `mastery_scaffolder.mjs`:

1. `node 05_mastery_and_translation/tools/mastery_scaffolder.mjs --self-test` exited `0` (`7/7` cases passed: `BUILTIN_GLOSSARY_30` schema validation, absent-glossary fallback, sanitizer preservation of inline code, `27/27` dossier parsing and prose-gate pass, `ep_04` `10`-question output, Launch Trio `ep_01..ep_03` support, and episode-ID parsing).
2. `node 05_mastery_and_translation/tools/mastery_scaffolder.mjs --all --dry-run --json` exited `0` (`27/27` evergreen dossiers parsed cleanly with `all_prose_audits_passed: true`).
3. `node 05_mastery_and_translation/tools/mastery_scaffolder.mjs --episode ep_04` wrote `05_mastery_and_translation/packets/ep_04_study_packet_en_fa.md` (`facts=3`, `slots=2`, `glossary=10`, `Q=10`, `glossary_source=external_json`).
4. `node 04_scripts_and_dossiers/tools/anti_ai_script_gate.mjs --file ... --mode prose` returned `GATE: PASS (score = 0)` (`HUMAN_ONLY`) for both `packets/ep_04_study_packet_en_fa.md` and this specification, and a temporary `30`-episode build with live `glossary_en_fa.json` cleared `anti_ai_script_gate.mjs --mode prose` at `score = 0` (`0` violations across `30` files).
