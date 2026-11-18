# 05. Channel Visual and Audio Signature Lock (`reading-room-cinema` Contract)

**Deliverable ID:** Division 1, Gate #05  
**Companion Machine Schema:** [`cinema_schema_contract.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/01_identity_and_strategy/cinema_schema_contract.json)  
**Read-Only Sibling Bindings:** `reading-room-cinema/studio/src/design/tokens.ts`, `studio/src/novelty/strategyPresets.ts`, `studio/src/director/schema.ts`, `studio/scripts/prep-aroll.mjs`, `studio/episodes-vault.json`

## 1. Room Premise and Visual Authority

*The Reading Room* rejects neon LED backdrops, gaming chairs, and handheld jump-cut agitation. Viewers click into thirty-minute investigations on sovereign debt, hyperscaler capital expenditure, depreciation accounting, power-grid queues, and cyber chokepoints because the room looks and sounds like a private research study after market close.

An eighteen-year-old host who turns twenty-eight in 2036 carries an immediate generational stake in those balance sheets. Dressing and lighting that host with institutional restraint turns youth into analytical tension: the person auditing a forty-trillion-dollar debt schedule is the exact person expected to service it over the next three decades. Every physical choice on set (shirt weave, tie matte finish, `35mm` eye-level lens geometry, warm desk-lamp pool, cotton filings, `-14.0 LUFS` voice master, and `editorial-warm.cube` color roll-off) locks directly into the Remotion Dual-Palette graphics engine inside `reading-room-cinema`.

## 2. On-Set Wardrobe Lock: Contrast, Weave Pitch, and Anti-Moire Rules

Camera sensors downsample `3840x2160` source plates into `1920x1080` timeline masters and `720p` mobile streams. High-frequency textile weaves alias against the Bayer filter array, producing rainbow moire shimmer that ruins documentary authority and breaks MediaPipe alpha edge segmentation (`selfie_segmenter.tflite`). Wardrobe follows strict optical and luminance rules on every shoot day.

### 2.1 Shirt Specification
* **Cloth and Weight:** Heavy Oxford cloth button-down (`OCBD`) or matte brushed cotton poplin between `140 gsm` and `170 gsm`. Heavyweight cotton holds a crisp collar roll over a twenty-five-minute seated take without collapsing at the placket.
* **Approved Tone Band:** Warm unbleached bone, ecru, or parchment (`#F2ECE1` to `#E6DFD1`), plus muted slate-chambray (`#D6E0EA`) for engineering and infrastructure episodes. These tones sit inside `56 IRE` to `66 IRE` under key light and harmonize with `PAGE_PALETTE.paperLight` (`#FAF8F3`).
* **Ban on Optical-Brightener Stark White:** Retail dress shirts treated with ultraviolet optical brighteners (`#FFFFFF`) spike past `88 IRE` at the collarbone, clip blue-channel sensor headroom, and fight the upper-luminance shoulder of `editorial-warm.cube`.
* **Spatial Pitch Floor (`>= 2.0 mm`):** Solid matte weaves only. Micro-gingham, fine houndstooth, narrow pinstripes, and tight herringbone under `2.0 mm` thread pitch are banned from set.

### 2.2 Necktie Specification and Semantic Binding
* **Fabric and Blade Geometry:** Matte grenadine silk (`garza grossa`), brushed wool challis, or raw slub shantung silk with a `7.5 cm` to `8.0 cm` blade width. Tie a four-in-hand knot with a single natural dimple and keep the top collar button fastened throughout A-roll. Forearms may show a clean buttoned barrel cuff in Act I and a neat two-turn sleeve roll below the elbow during deep ledger breakdowns.
* **Ban on Glossy Finishes:** High-gloss satin silk, metallic jacquard, and novelty patterns reflect specular hotspots from the key octabox and cheapen the frame.
* **Luminance Separation Ratios:** Maintain at least `3.5:1` relative luminance contrast between the tie body and shirt front so the vertical torso anchor reads at mobile thumbnail scale, alongside at least `2.5:1` separation between tie/shoulder edges and the shadowed walnut background (`18` to `24 IRE`).
* **Episode Color Mapping:** Select tie color from the active episode's primary `SemanticRole` in `reading-room-cinema`:
  * **Default Statutory / Geopolitics (`#1C2B3A`):** Deep Prussian navy grenadine.
  * **Sovereign Debt / Fiscal Deficit (`#8C1D18` or `#A3402E`):** Muted oxblood crimson or brick-red wool challis.
  * **Solvent Cash Flow / Labor Economics (`#1B4D3E`):** Dark forest grenadine.
  * **Grid Engineering / Cyber Architecture (`#234161`):** Prussian slate wool.

## 3. Camera Optics, Eye-Level Framing, and Clean-Plate Discipline

| Parameter | Locked Value | Operational Reason |
| :- | :- | :- |
| **Focal Length** | `35mm` Full-Frame equiv. (`23mm` to `24mm` APS-C) | Preserves natural facial proportions while keeping the walnut bookshelf, desk lamp, and foreground filings legible in periphery. |
| **Aperture** | `f/2.8` to `f/4.0` | Softens rear book spine titles enough to prevent background reading distraction while keeping both eyes, nose bridge, and hand gestures sharp. |
| **Optical Axis Height** | `118 cm` to `122 cm` seated eye level (`0 deg` pitch) | Places viewer as an equal across the desk; eliminates downward security-camera tilt and upward podium posture. |
| **Frame Rate & Shutter** | `30.00 fps` CFR, `1/60s` shutter (`180 deg`) | Matches Remotion `fps: 30` master compositions (`DirectorPlan`) with natural motion blur on hand gestures and zero VFR drift. |
| **Base Exposure** | Native ISO (`400` or `800`), 10-bit 4:2:2 flat/log | Maximizes dynamic range before `prep-aroll.mjs` applies `editorial-warm.cube` and `yuv420p` delivery encoding. |
| **Clean Plate Lead-In** | `5.0 seconds` empty locked-tripod roll | Feeds `tools/room_object_swap.py extract-plate` for Laplacian-sharp background plates and temporally smoothed (`EMA 0.65`) presenter alpha mattes. |

### 3.1 Master `1920x1080` Coordinate Alignment (`tokens.ts` Layout Grid)
All Remotion scenes author against a `1920x1080` coordinate grid scalable via `unit = width / 1920` to `3840x2160` 4K masters. Camera framing obeys the exact pixel zones defined in `studio/src/design/tokens.ts`:
1. **`talking-head-full`:** Presenter centered at `x = 960px`, eyes on the upper third (`y = 350px` to `375px`), head crown clearing `y = 120px` so the masthead folio (`y = 44px`) and hairline rule (`y = 76px`) never touch hair.
2. **`talking-head-with-glass`:** Presenter framed slightly left-of-center (`x = 680px` to `740px`), leaving `LAYOUT.overFootageSafeZones.rightThird` (`left: 1180px, top: 96px, width: 644px, height: 860px`) open for smoked-navy `OVER_FOOTAGE_PALETTE` Liquid Glass cards without covering chin, tie knot, or active hand gestures. `bottomDock` (`left: 120px, bottom: 56px, width: 1680px, height: 156px`) and `topBar` (`left: 96px, top: 44px, width: 1728px, height: 84px`) remain clear of primary facial features.
3. **`talking-head-punch-in` & Tension Creeps:** Driven deterministically by `<adjust-transform>` keyframes inside `studio/scripts/export-fcpxml.mjs` (`100% -> 112%` instant punch-in on numeric rebuttals; `100% -> 104%` slow creep across high-stakes ledger proofs).
4. **Pillar #10 Four-Lane Depth Sandwich:** When `export-person-matte` outputs `aroll_person_alpha.mov` (`ProRes 4444`) or `.webm` (`VP9`), DaVinci Resolve stacks `V1` (clean A-roll room) under `V2` (giant behind-presenter kinetic typography or 3D isometric diorama), `V3` (foreground alpha-masked presenter), and `V4` (foreground smoked-navy Liquid Glass).

## 4. Warm Desk-Lamp Key, Fill, Practical, and Rim Lighting Ratios

Lighting establishes dimensional contrast (`4:1` key-to-fill) anchored by a physical warm lamp inside the frame. Overhead room ceiling fixtures stay switched off at all times to eliminate raccoon eye sockets, nose-tip glare, and flat wall wash.

| Light Source | Placement & Modifier | Color Temp & CRI | Target IRE (`yuv420p` Post-LUT) |
| :- | :- | :- | :- |
| **1. Key Light** | `45 deg` camera-left, `30 deg` elevation; `90` to `120 cm` double-diffused octabox + `40 deg` fabric eggcrate grid | `4600K`, `CRI >= 96`, `TLCI >= 97` | Lit cheekbone and forehead at `58` to `62 IRE`; eggcrate keeps spill off rear walnut shelves. |
| **2. Fill & Negative Control** | Camera-right `120x180 cm` black Duvetyne flag paired with soft `4600K` bounce fill at `-2.0 stops` (`4:1` ratio) | `4600K` | Shadow-side cheek holds detail at `32` to `36 IRE` without crushing into noisy black. |
| **3. Practical Desk Lamp** | Brass banker or articulated study lamp on rear-left shelf or far desk corner outside `rightThird` card zone | `2700K` to `3000K` warm tungsten LED on inline dimmer | Lamp shade capped strictly below `78 IRE` (zero `100 IRE` white blowout); casts warm amber pool across paper filings. |
| **4. Hair & Shoulder Rim** | High rear-left snooted tube (`-1.5 stops` below key) | `5000K` crisp neutral | Carves `1px` to `3px` shoulder and hair edge against `18` to `24 IRE` walnut shelving. |

## 5. Physical Desk Prop Symbolism and Stateful Continuity

Every object resting on the desk carries forensic meaning and echoes the digital props inside `studio/src/novelty/continuityEngine.ts` and `studio/src/registry/props/heroContraptions.tsx`:
* **Matte Dark Leather Desk Blotter:** Covers the center walnut work zone (`60x90 cm`), eliminating specular bounce into the chin and damping early acoustic desk reflections (`220` to `280 Hz` comb filtering) before they reach the overhead boom mic.
* **Uncoated Cream Cotton Primary Filings (`100` to `120 gsm`, `#F4EFE6`):** Every studio shoot places physical printed pages of the episode's actual statutory or financial exhibits on the blotter (Monthly Treasury Statement Table 9, CBO Long-Term Budget Outlook tables, SEC Form 10-K footnotes, PJM auction summaries, *Wielechowski v. State* slip opinions). Standard glossy `80 gsm` white copy paper is prohibited because it glares cyan under key light.
* **Hand-Drawn Amber and Brick-Red Margin Marks:** Before rolling camera, mark key statutory lines on the physical sheets with a chisel-tip warm amber felt marker (physical twin to `PAGE_PALETTE.highlightSweep` `rgba(255, 213, 79, 0.38)`) and draw margin brackets or deficit circles in brick-red ink (`#A3402E`).
* **Uncapped Heavy Fountain Pen:** A matte black ebonite or brushed brass fountain pen rests diagonally beside the primary filing. In Episode 01, that physical pen mirrors Governor Walker's `veto-slash` trajectory and the concluding `PAYCHECK -> ALLOWANCE` strike tracked by `ENT_PAYCHECK_TO_ALLOWANCE`.
* **Rotating Episode Scale Artifact:** One tangible physical object sits in the shallow-focus foreground corner to anchor abstract trillions in everyday matter (a running shoe or brass company-scrip token in Episode 01; a copper busbar, T-bill certificate, or armored subsea fiber sample in subsequent episodes, audited via `room_object_swap.py suggest-props`).

## 6. Broadcast `-14 LUFS` Audio Master and `editorial-warm` LUT Pipeline

### 6.1 Acoustic Capture and Two-Pass EBU R128 Normalization
1. **Microphone Geometry:** Supercardioid small-diaphragm condenser (`Sennheiser MKH 50` or `Oktava MK-012` class) boomed `28` to `35 cm` above forehead, angled `45 deg` toward the sternum so plosives pass underneath the capsule. Record `48,000 Hz / 24-bit` WAV with untreated room noise at or below `-58 dBFS` and acoustic decay `RT60` between `0.22s` and `0.32s`.
2. **Vocal EQ and Compression Chain:** Apply an `18 dB/oct` high-pass filter at `75 Hz`, cut `-2.5 dB` (`Q = 2.2`) around `240 Hz` to clear desk resonance, tame sibilance at `6.5 kHz`, and hold `2` to `3 dB` of gentle `3:1` optical gain reduction.
3. **Deterministic Loudness Lock (`prep-aroll.mjs` & `master-audio.mjs`):** Two-pass linear ITU-R BS.1770-4 / EBU R128 FFmpeg `loudnorm` locks integrated program loudness to **`-14.0 LUFS` (`+/- 0.3 LU`)** and True Peak ceiling to **`-1.0 dBTP`** (`LRA = 11.0 LU` on A-roll prep; `LRA = 7.0 LU` on final `320 kbps` `48 kHz` AAC mix). YouTube's playback normalizer leaves `-14.0 LUFS` uploads untouched at `0.0 dB` gain penalty while preventing mobile speaker distortion.
4. **Natural Breath-Padded Silence Trimming:** When `--cut-silence` runs in `prep-aroll.mjs`, silences longer than `0.65s` below `-34.0 dB` are excised while preserving `120 ms` (`padMs: 120`) on both sides of every spoken phrase so consonants and human inhales survive intact.
5. **Three-Stem DaVinci Resolve FCPXML Audio Bus (`export-fcpxml.mjs`):**
   * **`A1` (`lane="0"`):** `-14.0 LUFS` presenter dialogue master.
   * **`A2` (`lane="-1"`):** Sample-accurate `48 kHz` 16-bit procedural foley WAVs (`public/sfx/`: `glass-enter`, `glass-dock`, `paper-slide`, `marker-sweep`, `telestrator-draw`, `data-tick`, `warning-thud`, `flash-cut`, `chapter-chime`, `type-click`), tucked between `-24.0` and `-20.0 LUFS` outside `1` to `4 kHz` vocal formants.
   * **`A3` (`lane="-2"`):** Procedural `48 kHz` stereo royalty-free score beds (`reading-room-chamber`, `sovereign-pulse-synth`, `forensic-clockwork` across `calm`, `pulse`, `tense`, and `drop-silence` `MusicEnergy` states), sidechain-ducked to `-32.0` to `-28.0 LUFS` under narration and muted completely (`drop-silence`) on primary thesis verdicts.

### 6.2 `editorial-warm` 3D LUT and Render Encoding Lock
`studio/scripts/prep-aroll.mjs` grades raw A-roll through `studio/luts/editorial-warm.cube` (`TITLE "Editorial Warm"`, `LUT_3D_SIZE 17`, `DOMAIN [0.0, 1.0]`), warming skin midtones, enriching walnut shadows with deep Prussian-slate toe (`0.000, 0.000, 0.008`), and rolling bright peaks smoothly off ceiling clip. Immediately after LUT evaluation, `unsharp=5:5:0.35:5:5:0.0` applies mild `0.35` luma crispness with `0.0` chroma sharpening so skin texture stays clean at `yuv420p` (`-crf 18` A-roll prep; `-crf 14` full-screen Remotion cutaways; `yuva444p10le` Apple ProRes 4444 `.mov` and `yuva420p` VP9 `.webm` for transparent glass overlays).

## 7. Exact Dual-Palette Lock and Five-Substrate Contrast Architecture

Every visual beat in `reading-room-cinema` enforces hard scene separation between full-screen documentary cutaways (`paletteMode: "page"`) and translucent camera overlays (`paletteMode: "over-footage"`). Dark `#1C2B3A` ink never appears on camera glass, and frosted glass blur cards never appear on full-screen paper sheets.

### 7.1 `PAGE_PALETTE` (`fullscreen-cutaway`, `ArchiveLightTable`, `StainedGlassFrame`)
| Token Key | Exact Value | Editorial Role in Cutaways |
| :- | :- | :- |
| `paperLight` | `#FAF8F3` | Primary milk-canvas sheet for full-screen tables, charts, and evidence boards |
| `paper` | `#F2F0EA` | Secondary inset card and ledger header ground |
| `paperBorder` | `#E1DED5` | `1px` crisp warm hairline borders and row dividers |
| `navy` / `ink` | `#1C2B3A` | Classic dark navy primary headlines, body ink, hero bars, and shaded map regions |
| `navyDeep` | `#0F1923` | Deepest ink strokes, vignettes, and solid dark chapter cover cards (`SpyTitleSequence`) |
| `muted` | `#6B7783` | Source citations, axis units, and margin folio metadata |
| `gold` / `goldWarm` | `#3E6A94` / `#A9C4DE` | Faint slate hairline border glint (`gold` never used as a hero fill) and dark-cover soft blue accent |
| `highlightSweep` | `rgba(255, 213, 79, 0.38)` | Animated chisel yellow marker sweep behind `#1C2B3A` statutory text |
| `chartSecondary` | `#2F8F8B` | Secondary teal comparison series, solvent flow lines, and map routes |
| `brickRed` | `#A3402E` | Deficit figures, warning eyebrows, risk pointers, and negative deltas |
| `riskFill` / `riskBorder` | `#F8ECE8` / `#E6C3B9` | Blush callout box fill and border reserved strictly for structural risk cards |

### 7.2 `OVER_FOOTAGE_PALETTE` (`talking-head-with-glass`, `talking-head-punch-in`, `split-screen`)
| Token Key | Exact Value | Optical & Legibility Role Over Live Camera Video |
| :- | :- | :- |
| `glassPrimary` | `linear-gradient(135deg, rgba(28, 43, 58, 0.64) 0%, rgba(15, 25, 35, 0.60) 55%, rgba(28, 43, 58, 0.66) 100%)` | Smoked-navy Liquid Glass body paired with GPU `blur(12px) saturate(165%) brightness(0.66)` and distortion-free clear center |
| `glassDarkWell` | `rgba(15, 25, 35, 0.50)` | Inner recessed well behind primary numeric readouts (`>= 4.5:1` contrast even over sunlit walls) |
| `glassBorder` / `glassInnerHairline` | `rgba(255, 255, 255, 0.58)` / `rgba(255, 255, 255, 0.16)` | Specular caustic outer rim and `1px` inner bevel hairline |
| `textHeadline` / `textBody` / `textMuted` | `#FFF6E5` / `#FAECD4` / `#F7E8CE` | Luminous warmer cream headlines, body copy, and source eyebrows |
| `accentPrimary` / `chartSecondary` | `#BFD6EA` / `#4FB3AE` | Ice-blue line accents and lifted teal positive deltas on smoked glass |
| `brickRedText` / `brickRedFill` | `#E27358` / `#A3402E` | Lifted coral-red risk figures on glass and solid `#A3402E` chips carrying `#FFF6E5` text |
| `riskFill` / `riskBorder` | `rgba(163, 64, 46, 0.38)` / `rgba(255, 200, 185, 0.44)` | Translucent crimson risk wash and coral rim |
| `textShadow` | `0 1px 2px rgba(8, 14, 22, 0.85)` | Tight `2px` optical drop shadow eliminating muddy halo smear |

### 7.3 Typography, Motion Physics, and Enterprise Optical Substrates
* **Tri-Font Lock (`fonts.ts`):** `Newsreader` renders statutory document titles, chapter cards, and editorial headlines; `Inter` handles UI labels and callout prose; `IBM Plex Mono` locks tabular ledger numbers, basis points, docket IDs, and dates.
* **Motion Damping (`STYLE_LOCKED.md`):** Visual entries settle within `12 frames` (`0.40s @ 30fps`) under friction-damped springs (`damping: 20` to `30`, `mass: 0.8` to `1.2`). Concluding summary cards hold for at least `1.0s` (`30 frames`) with sub-`1.5px` sinusoidal breathing. Hard white strobe flashes remain disabled across all 24 styles.
* **Five WCAG AAA Substrates (`REGISTER_IDS` & `RegisterBridge`):** Full-screen generative set pieces bind to `page_editorial` (`#FAF8F3`), `archival_parchment` (`#F4EFE6`, `15.75:1` primary ink contrast), `midnight_telemetry` (`#111315`, `15.84:1` bone ink `#F2ECE1`), `drafting_blueprint` (`#0F2236`, `14.29:1` `#F4F1EA`), and `vintage_newsreel` (`#0D0C0B`), cross-dissolving in cylindrical OKLCH across `18 frames` (`0.60s`) with at most two simultaneous `SemanticRole` accents (`liability`, `capital`, `solvent`, `statutory`).

## 8. Schema Compatibility: `STR-*` Presets, `VISUAL_REGISTER_IDS`, and `episodes-vault.json` Handoff

Every script dossier in `reading-room-editorial-os` compiles a `StrategyPacketAuditInput` validated against `studio/src/novelty/strategyPresets.ts` (`validateStrategyPacket`) before exporting to `reading-room-cinema`.

### 8.1 Canonical Nine `STR-*` Strategy Preset Matrix
| Preset ID | Engine & Lean (Weight) | Words / Spoken Min | Sponsor Window | A-Roll Band | CTA Archetype (`0.98` to `1.00`) | Default Forbidden Engines & Guardrails |
| :- | :- | :- | :- | :- | :- | :- |
| `STR-GEN-EXPLAINER` | `explainer` / `Gen` (`5.0x`) | `3,300` to `4,500w` (`20` to `27m`) | `0.25` to `0.35` (opt.) | `20%` to `36%` (`28%` target) | `agency-lever-plus-next-video` | Bans `clocked, street, field, ladder` (`R43, R44, R45, R46`) |
| `STR-AIC-CLOCKED` | `clocked` / `AIC` (`7.0x`) | `5,200` to `7,000w` (`32` to `43m`) | Forbidden (ad-free) | `18%` to `32%` (`24%` target) | `civic-or-share-ask` | Bans `street, field, ladder, primer` (`R43, R45, R46`) |
| `STR-AIC-SPECULATIVE` | `speculative` / `AIC` (`7.0x`) | `4,500` to `6,500w` (`28` to `39m`) | Forbidden (ad-free) | `18%` to `32%` (`25%` target) | `civic-or-share-ask` | Bans `clocked, street, field, ladder` (`R43, R44, R45, R46`) |
| `STR-FISHER-ARTIFACT` | `artifact` / `Fisher` (`6.0x`) | `4,400` to `6,200w` (`26` to `37m`) | `0.28` to `0.38` | `18%` to `34%` (`26%` target) | `restated-claim-uncertainty` | Bans `clocked, street, field, ladder` (`R43` to `R47`) |
| `STR-MAX-ESSAY` | `essay` / `Maxinomics` (`4.5x`) | `3,000` to `4,200w` (`19` to `26m`) | `0.06` to `0.14` | `16%` to `30%` (`22%` target) | `footnotes-coda` | Bans `clocked, street, field` (`R43, R44, R46`) |
| `STR-AOTP-LADDER` | `ladder` / `AotP` (`4.0x`) | `2,400` to `3,600w` (`16` to `23m`) | `0.15` to `0.23` | `12%` to `25%` (`18%` target) | `philosophical-echo-list` | Bans `clocked, street, field, explainer` (`R43, R44, R46`) |
| `STR-BOYLE-CHAPTERED` | `chaptered` / `Boyle` (`2.5x`) | `3,800` to `5,800w` (`23` to `35m`) | `0.12` to `0.22` | `22%` to `38%` (`30%` target) | `dry-verdict-chapter-close` | Bans `clocked, street, field` (`R43, R44, R46, R47`) |
| `STR-HMW-PRIMER` | `primer` / `HMW` (`2.5x`) | `3,600` to `5,100w` (`22` to `31m`) | `0.44` to `0.54` (`0.49` pivot) | `20%` to `35%` (`27%` target) | `dry-verdict-chapter-close` | Bans `clocked, street, field, ladder` (`R43, R44, R45, R46`) |
| `STR-GEN-FIELD` | `field` / `Gen` (`5.0x`) | `3,400` to `5,000w` (`21` to `31m`) | `0.18` to `0.26` | `34%` to `52%` (`42%` target) | `agency-lever-plus-next-video` | Bans `clocked, ladder, street` (`R43, R44, R45`) |

All nine presets enforce universal retention invariants: first viewer stake within `50` to `60` words (`R01`), core thesis question before `0.05` to `0.09` (`R02`), at least one active re-hook across all `10` deciles `D01` through `D10` with max `0.18` turn gap (`R13`), fair counterparty steelman/concession inside `0.60` to `0.85` (`R19`/`R40`), zero new factual evidence after `0.90` (`R38`), zero mid-video subscribe nags (`R22`), and hard guardrail rejection (`R44` blocks `doc-live-countdown-split` fake crisis clocks; `R47` blocks `doc-archive-light-table` without a verified primary document).

### 8.2 Eight `VISUAL_REGISTER_IDS` to Cinema Substrate Mapping
| `VisualRegisterId` (`strategyPresets.ts`) | `PaletteMode` | `RegisterId` Substrate (`tokens.ts`) | Primary Cinema Style Family & Component Anchor |
| :- | :- | :- | :- |
| `milk-page-editorial` | `page` | `page_editorial` (`#FAF8F3`) | `doc-broadcast` (`CaptionNewsCard`, `TreasuryTable9Scene`) |
| `smoked-navy-glass` | `over-footage` | `page_editorial` + `LiquidGlassObject` | `liquid-glass` (`card`, `dock`, `toast`, `pill`, `split-modal`) |
| `archival-light-table` | `page` | `archival_parchment` (`#F4EFE6`) | `doc-broadcast` (`ArchiveLightTable`, court & 10-K dockets) |
| `investigation-switchboard` | `page` | `page_editorial` (`#FAF8F3` + `#A3402E`) | `doc-broadcast` (`VisualInvestigationBoard`, numbered bays) |
| `blueprint-schematic` | `page` | `drafting_blueprint` (`#0F2236`) | `diagram-metaphor` (`IsometricDiorama3D`, `SceneBlueprintRenderer`) |
| `silver-gelatin-chronicle` | `page` | `vintage_newsreel` (`#0D0C0B`) | `vintage-editorial` (`Newsreel1920s`, `SilentFilmCard`, `SpyTitleSequence`) |
| `geospatial-telemetry` | `page` | `midnight_telemetry` (`#111315`) | `data-maps-3d` (PJM grid, subsea cables, sovereign yield maps) |
| `restraint-vellum` | `page` | `archival_parchment` (`#FAF7F1`) | `doc-broadcast` (AIC restraint dated chapter cards & verbatim testimony) |

### 8.3 `episodes-vault.json` Anti-Repetition Handoff Lifecycle
Across thirty uploads through January 2028, `tools/export_cinema_bundle.mjs` (validated against [`cinema_schema_contract.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/01_identity_and_strategy/cinema_schema_contract.json)) writes an immutable episode bundle consumed by `reading-room-cinema/studio/episodes-vault.json` and `tools/run_pipeline.mjs`:
1. **Cross-Episode Exponential Cooldown:** `episodeVault.ts` tracks `styleCounts`, `motionCombos`, `propIds`, `glassPresets`, `typographyModes`, `lutId`, `musicStems`, and `showstopperBlueprints` across prior uploads, applying cooldown weight `w = exp(-delta_ep / 2.5)` over a five-episode rolling lookback so adjacent episodes never recycle identical showstopper mechanics or score suites.
2. **Mandatory Showstopper Quota (`3` to `5` Set Pieces):** Each exported bundle declares three to five bespoke `SceneBlueprint` set pieces (such as hydraulic bond spillways, torque cost-exchange scales, or circular SPV carousels) alongside persistent `ENT_*` stateful continuity entities (`ENT_CLAIRE_AUSTIN`, `ENT_ESCAPE_HATCH_BOARD`) whose geometry and red stamps persist across acts without resetting.
3. **Zero-Touch Execution Bridge:** Once `export_cinema_bundle.mjs` stages the verified script, citation ledger, and vault entry, the studio executes `node tools/run_pipeline.mjs raw_aroll.mp4 --name ep_01 --script staged_script.md --lut editorial-warm --cut-silence --render` inside `reading-room-cinema` to emit frame-locked `ProRes 4444` overlays, `-14.0 LUFS` stems, and `timeline.fcpxml` for DaVinci Resolve.

### 8.4 Complete 24-Style Catalog and Dual-Palette Scene Binding (`STYLE_CATALOG`)
`studio/scripts/plan-edit.mjs` and `studio/src/director/planner.ts` schedule beats across five `StyleEngineFamily` engines and twenty-four registered `StyleRecipe` entries. Every recipe binds deterministically to a single `PaletteMode` and default procedural foley cue:

| Style Recipe ID | Engine Family | Component Hint | Framing | Palette Mode | Default SFX & Pace |
| :- | :- | :- | :- | :- | :- |
| `liquid-glass-card` | `liquid-glass` | `LiquidGlassObject:card` | `talking-head-with-glass` | `over-footage` | `glass-enter` (`balanced`) |
| `liquid-glass-dock` | `liquid-glass` | `LiquidGlassObject:dock` | `talking-head-with-glass` | `over-footage` | `glass-dock` (`balanced`) |
| `liquid-glass-toast` | `liquid-glass` | `LiquidGlassObject:toast` | `talking-head-punch-in` | `over-footage` | `glass-enter` (`snappy`) |
| `doc-news-package` | `doc-broadcast` | `NewsPackageLowerThird` | `talking-head-with-glass` | `over-footage` | `glass-enter` (`balanced`) |
| `doc-caption-news` | `doc-broadcast` | `CaptionNewsCard` | `fullscreen-cutaway` | `page` | `paper-slide` (`calm-hold`) |
| `doc-visual-investigation` | `doc-broadcast` | `VisualInvestigationBoard` | `fullscreen-cutaway` | `page` | `flash-cut` (`calm-hold`, peak) |
| `doc-archive-light-table` | `doc-broadcast` | `ArchiveLightTable` | `fullscreen-cutaway` | `page` | `paper-slide` (`calm-hold`, `R47`) |
| `doc-live-countdown-split` | `doc-broadcast` | `LiveCountdownSplit` | `split-screen` | `over-footage` | `data-tick` (`balanced`, `R44`) |
| `doc-telestrator` | `doc-broadcast` | `TelestratorOverlay` | `split-screen` | `over-footage` | `telestrator-draw` (`balanced`) |
| `doc-kino-montage` | `doc-broadcast` | `KinoMontageStrip` | `fullscreen-cutaway` | `page` | `flash-cut` (`snappy`) |
| `doc-city-symphony` | `doc-broadcast` | `CitySymphonyFrame` | `fullscreen-cutaway` | `page` | `camera-shutter` (`calm-hold`) |
| `vintage-newsreel` | `vintage-editorial` | `Newsreel1920s` | `fullscreen-cutaway` | `page` (sepia) | `newsreel-click` (`calm-hold`) |
| `vintage-silent-film` | `vintage-editorial` | `SilentFilmCard` | `fullscreen-cutaway` | `page` (noir) | `chapter-chime` (`balanced`) |
| `vintage-collage` | `vintage-editorial` | `CollageCutout` | `fullscreen-cutaway` | `page` | `paper-flip-fast` (`snappy`) |
| `vintage-spy-titles` | `vintage-editorial` | `SpyTitleSequence` | `fullscreen-cutaway` | `page` (`#0F1923`) | `flash-cut` (`balanced`) |
| `vintage-stained-glass` | `vintage-editorial` | `StainedGlassFrame` | `split-screen` | `page` | `chapter-chime` (`calm-hold`) |
| `diagram-sticker` | `diagram-metaphor` | `StickerCutout` | `talking-head-punch-in` | `over-footage` | `sticker-pop` (`snappy`) |
| `diagram-stick-figure` | `diagram-metaphor` | `StickFigureStage` | `fullscreen-cutaway` | `page` | `sticker-pop` (`balanced`) |
| `diagram-instruction-manual` | `diagram-metaphor` | `InstructionManualCard` | `fullscreen-cutaway` | `page` | `paper-slide` (`balanced`) |
| `diagram-isometric` | `diagram-metaphor` | `IsometricScene` | `fullscreen-cutaway` | `page` | `data-tick` (`calm-hold`) |
| `data-map-explainer` | `data-maps-3d` | `MapExplainer` | `fullscreen-cutaway` | `page` | `map-whoosh` (`calm-hold`) |
| `data-physical-card` | `data-maps-3d` | `DataPhysicalCard` | `fullscreen-cutaway` | `page` | `data-tick` (`calm-hold`) |
| `data-white-model-3d` | `data-maps-3d` | `WhiteModel3D` / `IsometricDiorama3D` | `fullscreen-cutaway` | `page` | `riser-subtle` (`calm-hold`) |
| `data-blob-simulation` | `data-maps-3d` | `BlobSimulation` | `fullscreen-cutaway` | `page` | `ambient-tension-drone` (`calm-hold`) |

### 8.5 Spectral Coordination of Procedural Foley and Score Stems
`studio/scripts/generate-sfx.mjs` synthesizes deterministic `48,000 Hz` 16-bit PCM WAV cues with seeded noise generators and biquad bandpass filters so zero third-party sample packs introduce Content ID claims. Foley spectral peaks stay clear of the `1.2 kHz` to `3.8 kHz` human consonant intelligibility band:
* **Low-Frequency Mechanical Weight (`80 Hz` to `320 Hz`):** `warning-thud`, `glass-dock`, and `ambient-tension-drone` supply physical chest weight under debt walls and court rulings while rolling off above `450 Hz`.
* **Mid-Band Paper and Ink Transients (`450 Hz` to `1.1 kHz` and `4.5 kHz+`):** `paper-slide`, `paper-flip-fast`, `marker-sweep`, and `telestrator-draw` replicate cotton rag friction and felt-nib strokes synced to frame `2` through frame `10` of entry animations.
* **High-Register Precision Ticks (`4.2 kHz` to `9.5 kHz`):** `data-tick`, `type-click`, `newsreel-click`, `camera-shutter`, and `glass-enter` fire at `-22.0 LUFS` on tabular counter steps (`IBM Plex Mono`) without masking chest resonance in the presenter's voice.
* **Score Energy State Transitions (`MusicEnergy`):**
  * `calm`: Sparse felt-piano and warm marimba intervals (`-31.0 LUFS` under voice) for Primer setup and historical context.
  * `pulse`: Steady brushed clockwork eighth-notes (`-29.0 LUFS`) driving numbered investigation bays (`0.34` to `0.60`).
  * `tense`: Sub-bass pedal plus muted string tension (`-28.5 LUFS`) across physical bottleneck and counterparty stress tests (`0.60` to `0.85`).
  * `drop-silence`: Hard `0.0` gain automation cut `8 frames` (`0.27s`) before primary verdict lines and veto slashes so bare `-14.0 LUFS` room voice carries the punchline alone.

### 8.6 Reference `episodes-vault.json` Record (`ep_01_the_allowance`)
Every episode exported by `tools/export_cinema_bundle.mjs` appends a validated record matching `episodesVaultHandoffContract.episodeRecordSchema` in [`cinema_schema_contract.json`](file:///d:/Youtube%20channel/reading-room-editorial-os/01_identity_and_strategy/cinema_schema_contract.json):

```json
{
  "episodeNumber": 1,
  "episodeSlug": "ep_01_the_allowance",
  "title": "The Allowance: AI vs $40.5T Debt",
  "publishedIsoDate": "2027-02-02",
  "strategyId": "STR-GEN-EXPLAINER",
  "visualSignature": {
    "primaryRegister": "milk-page-editorial",
    "secondaryRegister": "archival-light-table",
    "mechanicalMotif": "hydraulic-bond-priority-spillway-and-veto-pen",
    "scoreSuite": "reading-room-chamber"
  },
  "styleCounts": {
    "doc-archive-light-table": 8,
    "liquid-glass-card": 9,
    "doc-visual-investigation": 4,
    "diagram-isometric": 5,
    "data-map-explainer": 3,
    "vintage-newsreel": 2
  },
  "motionCombos": [
    "paper-unfold->highlight-sweep",
    "slide-left->glow-rim",
    "blur-snap->circle-telestrator"
  ],
  "propIds": [
    "hero-treasury-bond-wall",
    "prop-running-shoe-bom",
    "prop-alaska-veto-pen",
    "prop-coal-scrip-token",
    "prop-pjm-substation-transformer"
  ],
  "glassPresets": ["card", "dock", "toast"],
  "typographyModes": ["marker-sweep", "split-lines", "typewriter", "stamp-slam"],
  "lutId": "editorial-warm",
  "musicStems": [
    "reading-room-chamber:calm",
    "reading-room-chamber:pulse",
    "reading-room-chamber:tense",
    "reading-room-chamber:drop-silence"
  ],
  "showstopperBlueprints": [
    "bp_ep01_running_shoe_labor_vaporizer",
    "bp_ep01_claire_austin_longitudinal_ledger",
    "bp_ep01_w2_withholding_guillotine",
    "bp_ep01_alaska_walker_veto_slash",
    "bp_ep01_ten_watt_to_five_gw_ladder"
  ],
  "continuityEntities": [
    {
      "entityId": "ENT_CLAIRE_AUSTIN",
      "label": "Claire (32yo Austin Senior SWE Household Balance Sheet)",
      "actStates": [
        "2025_lock_3400_mortgage",
        "2030_minus_70pct_pay_refi_denied",
        "2030_locked_45k_401k",
        "2036_inflation_saves_house_ac_shock"
      ]
    },
    {
      "entityId": "ENT_ESCAPE_HATCH_BOARD",
      "label": "Three Federal Escape Hatches Master Board",
      "actStates": [
        "all_three_open",
        "hatch_01_check_veto_stamped",
        "hatch_02_compute_scrip_stamped",
        "hatch_03_print_grid_ration_stamped"
      ]
    },
    {
      "entityId": "ENT_PAYCHECK_TO_ALLOWANCE",
      "label": "200-Year Friday Paycheck Truce -> Allowance Strike",
      "actStates": ["friday_paycheck_truce", "walker_veto_slash_applied"]
    }
  ],
  "strategyAudit": {
    "strategyId": "STR-GEN-EXPLAINER",
    "forbiddenEngines": ["clocked", "street", "field", "ladder"],
    "stakes": "wallet",
    "hasDatedHourTimeline": false,
    "hasShowablePrimaryArtifact": true,
    "hasFieldOrStreetFootage": false,
    "hookWordsToFirstStake": 42,
    "thesisQuestionFrac": 0.032,
    "sponsorFrac": null,
    "sponsorIsBridged": true,
    "coveredRehookDeciles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "adversaryConcessionFracs": [0.16, 0.36, 0.78],
    "verdictFrac": 0.94,
    "ctaFrac": 0.99,
    "ctaCount": 1,
    "midVideoSubscribeAskCount": 0,
    "latestNewFactFrac": 0.87,
    "presenterARollShare": 0.28
  }
}
```

## 9. Shoot-Day Pre-Flight and Post-Render Quality Gate

Before recording Episode A-roll and before exporting `timeline.fcpxml`, verify all eight physical and digital locks:
1. **Wardrobe Moire Sweep:** Roll a `10-second` `3840x2160` test clip, downsample to `1920x1080` and `1280x720`, and inspect shirt placket and tie knot at `200%` zoom for zero rainbow aliasing.
2. **Waveform Exposure Check:** Confirm lit cheekbone sits inside `58` to `62 IRE`, shadow cheek sits inside `32` to `36 IRE`, practical lamp shade stays below `78 IRE`, and walnut shelves hold `18` to `24 IRE`.
3. **Clean-Plate Capture:** Record `5.0 seconds` of empty room plate at locked focus (`f/2.8` to `f/4.0`, `4600K` white balance) prior to sitting at the desk.
4. **Physical Filing Audit:** Verify uncoated `#F4EFE6` cotton primary filings, hand-drawn amber/brick annotations, and uncapped fountain pen sit clear of `rightThird` (`x >= 1180px`) camera-overlay coordinates.
5. **Acoustic Floor Check:** Measure `5.0 seconds` of silent room tone; verify peak noise stays at or below `-58.0 dBFS` with zero HVAC hum above `-64 dBFS` at `60 Hz` / `120 Hz`.
6. **Two-Pass Loudness Verification:** Confirm `prep-aroll.mjs` reports post-pass integrated loudness inside `-14.0 +/- 0.3 LUFS` and True Peak at or below `-1.0 dBTP`.
7. **Dual-Palette Contrast Gate:** Confirm zero `#1C2B3A` dark ink tokens render inside `over-footage` beats and all `REGISTER_IDS` maintain `WCAG AAA >= 7.0:1` text contrast.
8. **Strategy Guardrail Audit:** Confirm `validateStrategyPacket` returns `valid: true` (`0` `P0` flags) and `episodes-vault.json` records `3` to `5` fresh showstopper blueprints under the `exp(-delta / 2.5)` novelty decay rule.

