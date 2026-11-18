# Deliverable 07: Channel homepage, banner, bio, and subscriber-conversion architecture

Views happen on the YouTube watch page, while subscriptions happen on the channel homepage. When a first-time viewer finishes Episode 01 (*The Allowance*) or taps the channel avatar midway through Act II, they give *The Reading Room* roughly ten seconds to answer one silent question: was this video a one-off accident, or does this creator run a repeatable desk built for me?

Most channels treat their homepage as an uncurated storage closet where auto-generated playlists, stray vertical clips, and vague slogans compete for attention. Grounded in `yt-funnel` and `yt-series`, this manual locks every pixel, line of copy, shelf position, and monthly analytics check required to maximize Subscribers-per-View (`Sub/View %`) and Returning-Viewer Retention across our thirty-video run through January 2028.

## 1. The ten-second channel-page conversion architecture

A non-subscriber landing on `youtube.com/@TheReadingRoomBrief` scans four surfaces in a predictable top-down sequence. Every surface has one job, one time budget, and one measurable failure signal.

| Conversion surface | Stranger eye-track window | Primary conversion job | Failure symptom in YouTube Studio | Governing metric |
|---|---|---|---|---|
| 1. Above-the-fold header (Banner, Avatar, Handle, 1-line bio, Link 1) | `0.0s to 3.5s` | State who the channel serves, what primary sources we check, and the 12-day publishing cadence | High watch-page avatar clicks paired with immediate channel-page exits | Channel-page-to-subscribe conversion rate |
| 2. Non-subscriber Channel Trailer (`45s` direct-to-camera briefing) | `3.5s to 48.5s` | Hook cold visitors in 5 seconds, establish the 18-turning-28 stake, and point directly to Row 1 | Trailer retention cliff below `68%` at `0:10` or below `48%` at `0:45` | Trailer `0:10` hold % + subs gained on trailer |
| 3. Row 1 Front-Door Conversion Video (Featured standalone flagship) | `4.0s to 10.0s` | Offer the single highest `Sub/View %` episode on the channel as an unmistakable starting click | Visitors scroll past Row 1 into random uploads with lower retention | Per-video `Sub/View %` (`Subscribers gained / Views`) |
| 4. Row 2 Official Series Playlists + Row 3 Cadence + Row 4 Shorts | `6.0s to 10.0s+` | Prove library depth across all four series spines while keeping vertical clips below the fold | Single-video exits (`< 1.2` videos per viewer) or Shorts swipe dilution | Views per playlist start + Returning viewers % |

## 2. Above-the-fold identity: handle, avatar, banner, bio, and external links

A stranger reads the channel name, handle, banner, and truncated one-line description before a single frame of video buffers. Every element matches the locked editorial visual system in `reading-room-cinema` (`Page` milk canvas `#FAF8F3` paired with `Over Footage` smoked-navy `#0F1923` and `#1C2B3A` ink).

### Ranked handle options and naming lock

The public display name is locked as `The Reading Room`. Because bare `@TheReadingRoom` handles on YouTube frequently collide with inactive book-review or ASMR accounts, claim the highest-ranked available handle below using strict PascalCase capitalization inside YouTube Studio (`Customization -> Basic info -> Handle`) so mobile comment pills and screen readers parse word boundaries cleanly.

| Priority rank | Exact PascalCase handle | Character count | Spoken radio test and positioning rationale |
|---|---|---|---|
| Option 1 (Primary lock) | `@TheReadingRoomBrief` | `20` chars | Pairs the room name with our investigative briefing format; zero punctuation marks, hyphens, or numbers |
| Option 2 (Backup A) | `@ReadingRoomLedger` | `18` chars | Signals primary-filing balance-sheet math immediately; fits cleanly inside Shorts attribution bars |
| Option 3 (Backup B) | `@InsideTheReadingRoom` | `21` chars | Natural conversational phrasing when cited aloud on podcasts and creator collaborations |
| Option 4 (Backup C) | `@ReadingRoomDesk` | `16` chars | Shortest institutional fallback; crisp legibility on `360 px` mobile viewports |

Register the top two available handles across X, TikTok, Instagram, and Substack on the same afternoon to block impersonation bots before Episode 01 ships.

### Channel avatar specification

Upload an `800 x 800 px` lossless PNG (`sRGB`) engineered to stay recognizable when shrunk to a `36 x 36 px` circular badge beside mobile comments and watch-page titles:

- Framing and wardrobe: tight chest-and-collar portrait of the eighteen-year-old host wearing a crisp white oxford shirt and solid `#1C2B3A` dark navy tie, angled ten degrees toward camera with direct eye contact.
- Lighting and backdrop: warm `5200K` key light at forty-five degrees with subtle rim separation against a `#0F1923` smoked-navy archive shadow background.
- Zero-text rule: never place initials, seals, or micro-typography inside the avatar circle. The banner directly above the avatar already carries the typography, and repeating tiny letters inside a `36 px` circle looks like a blurry corporate watermark.

### Banner layout, safe zones, and typography lock

YouTube crops a single `2560 x 1440 px` banner upload into four wildly different aspect ratios across Smart TVs, ultrawide monitors, tablets, and phones. Build the master PNG strictly to the pixel coordinates below so zero letters clip on mobile and zero text collides with desktop link overlays.

| Viewport surface | Rendered pixel crop (`W x H`) | Coordinate bounds inside `2560 x 1440` master | Design allocation inside `STYLE_LOCKED.md` palette |
|---|---|---|---|
| Smart TV full canvas | `2560 x 1440 px` | `X: 0 to 2560`, `Y: 0 to 1440` | Deep `#0F1923` (`navyDeep`) quiet study border above (`Y: 0 to 508`) and below (`Y: 932 to 1440`) with faint `#1C2B3A` architectural ledger grid at `6%` opacity |
| Desktop max strip | `2560 x 423 px` | `X: 0 to 2560`, `Y: 509 to 931` | Warm `#FAF8F3` (`paperLight`) milk briefing band bounded top and bottom by `2 px` `#E1DED5` (`paperBorder`) rules |
| Tablet strip | `1855 x 423 px` | `X: 352 to 2207`, `Y: 509 to 931` | Subtle archive document crop (Treasury Table 9 faded to `8%` `#6B7783` slate) on outer wings only |
| Universal mobile safe zone | `1546 x 423 px` | `X: 507 to 2053`, `Y: 509 to 931` | Clean `#FAF8F3` paper ground; zero critical copy outside `X: 560 to 1980` |
| Strict text-safe core | `1235 x 338 px` | `X: 662 to 1897`, `Y: 551 to 889` | Houses the two-line editorial lockup left-aligned at `X: 690` for instant left-to-right scanning |
| Desktop UI exclusion corner | `320 x 90 px` (bottom right) | `X: 2240 to 2560`, `Y: 841 to 931` | Leave empty `#FAF8F3` paper so legacy browser overlays never touch letterforms |

Lock the banner typography inside the `1235 x 338 px` core to two lines and eleven total words using the studio font stack (`Newsreader` + `IBM Plex Mono`):

```text
EYEBROW (IBM Plex Mono Regular, 20px, +0.08em tracking, #A3402E brick red | #6B7783 muted slate):
PRIMARY FILINGS ONLY  |  NEW BRIEFING EVERY 12 DAYS

HEADLINE (Newsreader Medium, 54px, -0.02em tracking, 1.14 line-height, #1C2B3A classic navy ink):
Where AI Meets Debt, Power, and Your Paycheck.
[Apply rgba(255, 213, 79, 0.38) translucent yellow marker sweep behind "Your Paycheck." only]
```

Never add pointing arrows, bell icons, social logos, or host cutouts to the banner. Clean `#FAF8F3` paper and `#1C2B3A` serif ink signal institutional authority inside half a second.

### One-line visible bio and full searchable About description

YouTube truncates the channel description right below the handle at roughly `75` to `82` characters before displaying `...more`. Line 1 of the channel description must stand as a complete sentence inside that `80`-character window.

- Locked Line 1 (`75` characters): `Primary-source math on AI, national debt, and your household balance sheet.`
- Tested Backup A (`73` characters): `Checking the primary ledgers where AI collides with debt and your budget.`
- Tested Backup B (`76` characters): `Where frontier AI hits federal debt, corporate math, and your monthly bills.`

Paste the full searchable channel bio below into `YouTube Studio -> Customization -> Basic info -> Description` (Line 1 sits at the top, separated by one blank line from the drawer text so mobile truncation cuts cleanly after the first period):

```text
Primary-source math on AI, national debt, and your household balance sheet.

Silicon Valley forecasts promise effortless abundance by the 2030s, while thirty-year mortgages, utility bills, and $40 trillion in US sovereign debt still expect Friday paychecks to clear. Hosted from an eighteen-year-old generational perspective with real skin in the next decade, The Reading Room opens the primary institutional documents behind the headlines to check whether the numbers add up.

Every twelve days, we audit Monthly Treasury Statements, Congressional Budget Office debt baselines, SEC Form 10-K balance sheets, Federal Reserve wealth tables, wholesale power grid auctions, cybersecurity advisories, and appellate court dockets. Each episode connects frontier AI shifts between 2027 and 2036 to sovereign and corporate accounting, then maps practical ways to protect your paycheck, savings, career, digital security, and personal autonomy.

New flagship briefing every 12 days.

Primary sources, corrections, and press inquiries: desk@readingroombrief.com
```

### External links architecture

Configure `YouTube Studio -> Customization -> Basic info -> Links` with four ordered destinations. YouTube displays Slot 1 directly on the above-the-fold channel header (`readingroombrief.com/dossiers and 3 more links`), making Slot 1 our primary email and reader-capture bridge.

| Link slot | Public link title (`<= 28 chars`) | Target destination & UTM structure | Strategic role |
|---|---|---|---|
| Slot 1 (Visible above fold) | `Free Episode Dossiers` | `https://readingroombrief.com/dossiers?utm_source=youtube&utm_medium=channel_header&utm_campaign=dossier_vault` | Captures high-intent viewers into the owned Reading Room Dossier newsletter with downloadable source tables |
| Slot 2 (`...more` drawer) | `Bilingual Mastery Books` | `https://readingroombrief.com/books?utm_source=youtube&utm_medium=about_links&utm_campaign=en_fa_books` | Routes bilingual learners to the 30-to-50 page English-Persian Mastery Books (`Division 5`) |
| Slot 3 (`...more` drawer) | `Primary Receipt Threads (X)` | `https://x.com/TheReadingRoomBrief` | Connects finance, policy, and tech researchers to chart-and-filing threads (`Deliverable 44`) |
| Slot 4 (`...more` drawer) | `Fact Ledger & Citations` | `https://readingroombrief.com/ledger?utm_source=youtube&utm_medium=about_links&utm_campaign=fact_ledger` | Publishes verified primary table links per episode, cementing institutional credibility |

## 3. Word-for-word 45-second channel trailer for non-subscribers

Clip-montage trailers cut to loud background music tank non-subscriber conversion because cold visitors lack context for rapid-fire charts. Following `yt-funnel`, our Channel Trailer is a dedicated `45`-second single-camera briefing (`120` spoken words at `160 WPM`) recorded in the exact shirt-and-tie studio setup as Episode 01. Upload this video as `Unlisted` or `Public` with comments enabled, then assign it exclusively to `Channel trailer for people who haven't subscribed` inside `YouTube Studio -> Customization -> Home tab`.

### Spoken script (locked 18-year-old shirt-and-tie voice, 120 words, 0:45 runtime)

Every few weeks, somebody in Silicon Valley goes on a podcast and promises AI will make money pointless within ten years. Try telling that to your landlord on the first of the month while Washington owes forty trillion dollars backed mostly by taxes on human paychecks. Somebody's math breaks first.

I'm eighteen, which means my generation gets handed that tab right as we hit our late twenties.

Every twelve days in The Reading Room, we open the primary ledgers behind those forecasts. Monthly Treasury statements, corporate 10-Ks, wholesale grid auctions, and court dockets. We check what hits a regular household budget and how you defend your savings and career.

Click Episode One right below, and subscribe for the next briefing.

### Beat-by-beat visual and audio cue sheet (`reading-room-cinema` integration)

| Timecode | Spoken cue anchor | Visual mode (`STYLE_LOCKED.md`) | Motion and audio direction |
|---|---|---|---|
| `0:00 to 0:13` | `"Every few weeks..."` through `"Somebody's math breaks first."` | `talking-head-with-glass` (`Over Footage` `navy-glass` right-third card showing `$40.5T US Debt` vs `86% Individual Tax Share` in `#FFF6E5` cream and `#E27358` coral-red) | Crisp `0.4s` damped spring card entry at `0:06`; subtle room tone only, zero music swell on sentence 1, clean punch-in `1.06x` on `"Somebody's math breaks first."` |
| `0:13 to 0:20` | `"I'm eighteen..."` through `"...hit our late twenties."` | Clean A-roll medium close-up (white oxford shirt, `#1C2B3A` navy tie, warm desk lamp) | Direct lens lock; zero overlay distraction so the viewer registers the host's real age and composure |
| `0:20 to 0:39` | `"Every twelve days..."` through `"...defend your savings and career."` | `fullscreen-cutaway` (`Page` `#FAF8F3` milk canvas `ArchiveLightTable` fanning four real artifacts: MTS Table 9, Alphabet 10-K cash flow, PJM `$269.92` auction table, and *Wielechowski* court header) | Soft `4`-frame cross-dissolve per document (`rgba(28, 43, 58, 0.14)`); faint mechanical paper settle at `-24 LUFS`, returning to A-roll at `0:33` |
| `0:39 to 0:45` | `"Click Episode One right below..."` through `"...next briefing."` | `talking-head-with-glass` featuring Episode 01 thumbnail preview + downward `#4FB3AE` teal directional indicator toward Row 1 | `1.0s` final hold with subtle sinusoidal breathing (`< 1.5px`); clean hard cut at `0:45` with zero dead-air tail |

### Studio shoot, loudness, and static-thumbnail rules for the 45-second trailer

Because YouTube autoplays channel trailers muted on some desktop browsers while showing a static thumbnail with a play button on mobile browsers and battery-saver connections, execute four technical locks before publishing the trailer:

1. Camera and framing lock: shoot at `24` or `30 fps` (`4K` downsampled to `1080p` / `4K` master) with a `35mm` or `50mm` full-frame equivalent focal length at eye level, leaving the right third (`X: 1240 to 1848`) unobstructed for `navy-glass` overlays (`right: 72px`).
2. Broadcast loudness and caption lock: normalize dialogue to `-14.0 LUFS` integrated (`-1.0 dBTP` true peak) with zero background music during the opening thirteen seconds. Upload verified English (`en`) and Persian (`fa`) `.srt` subtitle files directly in YouTube Studio (`33_subtitle_translator_prep.mjs`) so muted desktop autoplay renders crisp native captions immediately at `0:00`.
3. Static trailer thumbnail lock: design a dedicated `1280 x 720 px` thumbnail on `#FAF8F3` milk paper showing the host on the left and a three-word `#1C2B3A` `Newsreader` stamp on the right (`CHECK THE LEDGER`) above a cropped Monthly Treasury Statement line item. Never repeat the channel banner sentence on the trailer thumbnail (`yt-package` anti-duplication rule).
4. End-screen restraint lock: attach at most one end-screen video element (`Episode 01` or current Row 1 Front-Door video) appearing solely during `0:40 to 0:45` in the upper-right glass zone so YouTube's hover cards never cover the host's eyes or mouth.

## 4. Row-by-row homepage shelf ordering and entry-door architecture

Inside `YouTube Studio -> Customization -> Home tab`, disable YouTube's generic `For you` shelf until the channel passes `10` long-form uploads (at small catalog sizes, `For you` surfaces Shorts alongside long-form videos and breaks intentional routing). Lock the homepage to one returning-viewer top slot and four strictly ordered horizontal rows.

### Top featured slot for returning subscribers

Assign `Featured video for returning subscribers` to the highest-converting flagship episode from the past sixty days, updating it every twelve days on upload afternoon to the newest flagship briefing. Returning subscribers who missed a push notification see the latest investigation immediately upon visiting the channel page.

### Active four-row shelf stack

| Shelf order | YouTube Studio section type | Public shelf title & configuration | Strategic conversion mechanics (`yt-funnel` + `yt-series`) |
|---|---|---|---|
| Row 1 (Above first scroll) | `Single playlist` or `Featured section` | `Start Here: Most-Watched Briefings` (Initialized with Episode 01 *The Allowance* in Slot #1, followed by Episodes 02 and 03) | Places our #1 `Sub/View %` conversion engine directly beneath the 45-second trailer so `"Click Episode One right below"` resolves with zero visual search |
| Row 2 (Binge architecture) | `Multiple playlists` (Official Series) | `Core Investigations (4 Official Series)` | Displays all four Official Series Playlists side-by-side (`AI Economy, National Debt & Your Money`, `AI Bubble, Corporate Accounting & Wall Street Math`, `AI Power Grid Crisis, Chip Wars & Geopolitics`, `AI Cybersecurity, Scams, Privacy & Tech Policy`), each led at Position #1 by its strongest standalone conversion episode |
| Row 3 (Cadence proof) | `Videos` | Standard chronological `Videos` shelf | Shows upload dates spaced twelve days apart, reassuring prospective subscribers and sponsor media buyers that the desk ships on schedule |
| Row 4 (Bottom containment) | `Shorts` | Standard `Shorts` shelf | Pushes vertical clips below three full rows of widescreen flagship investigations so desktop and mobile homepage visitors never mistake the channel for a vertical-clip aggregator |

### Entry-door ordering rule inside Row 2 Official Series Playlists

New creators almost always sort playlists strictly by upload date (`Part 1 -> Part 2 -> Part 3`). As `yt-series` warns, strangers rarely enter a series through chronological Part 1 once Episode 14 or Episode 19 outperforms it. Inside each of our four Official Series Playlists:

1. Place the episode with the highest verified `Sub/View %` (minimum `5,000` views) at `Playlist Position #1` as the Series Entry Door.
2. Place the episode whose opening question directly answers Position #1's closing binge seam at `Playlist Position #2`.
3. Enable `Set as official series for this playlist` under `Playlist settings -> More` in YouTube Studio so YouTube's watch-next up-next slot locks onto `Position #2` when a viewer finishes `Position #1`.
4. Ensure every Short visible in Row 4 carries a linked `Related video` pill in YouTube Studio pointing to the Entry-Door flagship episode of its parent series (`42_short_to_long_bridge_rules.md`).

Permanently delete or keep disabled: `Popular videos` (until `12+` flagship videos are live, preventing an accidental low-conversion viral outlier from displacing our highest `Sub/View %` front door), `Past live streams`, `Subscriptions`, and uncurated `Created playlists`.

### Phase-gated homepage evolution from Upload 01 to Upload 30 (January 2028)

Displaying four Official Series Playlists on Day 1 when the channel only has three videos creates empty or single-video shelves that signal an unfinished project (`yt-series` capacity rule). Roll out the homepage shelves across three catalog milestones as the thirty-video library matures:

| Catalog milestone | Active uploads live | Active homepage shelf stack | Transition trigger to next stage |
|---|---|---|---|
| Stage 1: Launch Trio window | Uploads `01 to 04` (Month 1) | Trailer + Row 1 (`Start Here: Launch Briefings` single playlist holding Ep 01, Ep 02, Ep 03) + Row 2 (`Videos`) + Row 3 (`Shorts` at bottom) | Keep Row 2 `Multiple playlists` hidden until at least two Official Series hold `2+` published episodes each |
| Stage 2: Series spine activation | Uploads `05 to 11` (Months 2 to 5) | Trailer + Row 1 (`Start Here` highest `Sub/View %` spotlight) + Row 2 (`Core Investigations` displaying active 2-to-4 Official Series with `2+` videos each) + Row 3 (`Videos`) + Row 4 (`Shorts`) | Keep YouTube's `For you` shelf disabled; unlock fourth series on Row 2 the afternoon its second episode publishes |
| Stage 3: Full library compounding | Uploads `12 to 30` (Month 6 through Jan 2028) | Full four-row stack live (`7 to 8` episodes per Official Series), monthly `10,000`-view sample floor for Row 1 challenger promotions, optional `Popular videos` test below Row 3 | Re-record the 45-second non-subscriber trailer only if channel `Sub/View %` changes regime past `25,000` or `75,000` subscribers |

### Cross-surface consistency check on launch day

Before setting Episode 01 to `Public`, verify five alignment points across the watch page and homepage in an incognito browser window on both a `390 px` mobile viewport and a `1440 px` desktop monitor:

1. Tapping `@TheReadingRoomBrief` beneath Episode 01 lands on a header where Line 1 of the bio terminates cleanly on a period before `...more`.
2. Slot 1 header link (`Free Episode Dossiers`) resolves over HTTPS in under one second with UTM query parameters intact in analytics.
3. The 45-second trailer starts speaking on frame `1` with English and Persian caption tracks selectable and points straight down to Episode 01 in Row 1 Slot #1.
4. Episode 01's pinned comment links both the Episode 01 primary source dossier and Episode 02 (*Who Buys the Debt*) so watch-page readers have the same front-door routing as homepage visitors.
5. Zero Shorts appear above the fold on mobile (`iOS` / `Android` YouTube app `Home` tab check).

## 5. Monthly subscriber-conversion audit SOP

Run this thirty-minute conversion audit on the first business day of every calendar month (`Month 1` through `January 2028`). Never redesign all four surfaces simultaneously; execute one ranked change per month (`yt-funnel` single-variable rule) so the next twenty-eight-day window isolates whether the edit lifted `Sub/View %`.

### Step-by-step YouTube Studio audit procedure

1. Rank every long-form upload by `Sub/View %`. Open `YouTube Studio -> Analytics -> Content -> Videos -> See More (Advanced Mode)`. Set the date range to `Last 28 days` (plus a secondary check on `Last 90 days`), add the custom columns `Subscribers gained`, `Views`, and `Average percentage viewed`, and export CSV or calculate `Sub_Conversion_Rate = (Subscribers_Gained / Views) * 100` for every video above the sample floor (`2,500` views during Uploads 1 to 10; `10,000` views from Upload 11 onward).
   - Benchmark bands for deep financial/AI essays: `< 0.80%` = weak conversion (audit CTA and Act IV payoff); `0.80% to 1.50%` = healthy baseline; `> 1.80%` = front-door conversion outlier.
   - Promotion trigger: whenever a challenger episode beats the current Row 1 Front-Door video's `Sub/View %` by `>= 0.25` percentage points across `28` days while holding `>= 45%` average percentage viewed, promote that challenger to Row 1 Slot #1 and Position #1 of its Official Series Playlist.
2. Inspect Non-Subscriber Trailer retention. Open `YouTube Studio -> Content -> Channel Trailer -> Analytics -> Engagement`. Check two exact checkpoints:
   - `0:10` hook checkpoint: must hold `>= 68%` of viewers. If it slips below `68%`, reshoot the opening thirteen seconds with a sharper primary-ledger number while keeping `0:13 to 0:45` intact.
   - `0:45` completion checkpoint: must hold `>= 48%` of viewers. If viewers drop between `0:25` and `0:40`, trim visual cutaway lag so document reveals snap in `0.4s`.
3. Audit Row 2 Official Series binge continuation. Open `YouTube Studio -> Analytics -> Content -> Playlists`. Record `Views per playlist start` and `Average time in playlist` across all four Official Series. Target `>= 1.45` videos watched per playlist start. Whenever any series drops below `1.25` views per start, inspect the end-screen card click-through rate (`Studio -> Video -> Engagement -> End screen element clicks`) on Position #1 and swap Position #2 to the stronger thematic follow-up.
4. Check Returning-vs-New Viewer balance and Shorts bleed. Open `YouTube Studio -> Analytics -> Audience`. Inspect two panels:
   - `Returning viewers` vs. `New viewers` (`Videos` tab filtered separately from `Shorts` tab): healthy compound growth toward `100,000` subscribers requires returning long-form viewers climbing steadily every three-upload cycle without flattening.
   - `Formats that your viewers watch on YouTube`: if `Shorts-only` viewers exceed `35%` of channel audience while `Related video` click-through on any Short sits below `0.50%`, set that non-converting Short to `Unlisted` so swipe-only cohorts stop polluting long-form Browse seed tests.
5. Select and log the single highest-impact monthly change. Pick the one surface furthest below target, ship the single adjustment, and append an entry to `08_ops_monetization_and_qa` monthly logs using the schema below.

### Worked monthly challenger promotion calculation

Suppose on `2027-06-01` (with `11` flagship briefings live) the `Last 28 days` YouTube Studio `Advanced Mode` export shows these numbers across the top four candidates above the `10,000`-view floor:

| Video ID and title | 28-day views | 28-day subs gained | Computed `Sub/View %` | 28-day AVD % | Promotion eligibility verdict |
|---|---|---|---|---|---|
| `ep_01` (*The Allowance*, current Row 1 anchor) | `64,200` | `963` | `1.50%` | `49.2%` | Baseline incumbent (`>= 45%` AVD) |
| `ep_03` (*The Depreciation Trick*) | `41,800` | `585` | `1.40%` | `47.8%` | Remains Series 02 Position #1; trails `ep_01` |
| `ep_07` (Series 03 PJM grid capacity audit) | `88,500` | `1,150` | `1.30%` | `46.1%` | High reach, lower conversion; keep in Series 03 |
| `ep_09` (Series 04 Regulation E autonomous wire fraud) | `52,000` | `988` | `1.90%` | `51.4%` | Beats `ep_01` by `+0.40` percentage points (`>= +0.25` threshold) with `51.4%` AVD -> Promote to Row 1 Slot #1 and Series 04 Position #1 |

Notice how `ep_07` earned the most raw views (`88,500`) yet failed promotion because its `1.30% Sub/View` rate converted worse than `ep_01` (`1.50%`), whereas `ep_09` (`52,000` views, `1.90% Sub/View`, `51.4%` AVD) beat the incumbent by `+0.40` percentage points and cleared the retention bar. Sorting Row 1 by raw view count would have installed the weaker converter; sorting by `Sub/View %` compounds subscriber velocity on every future channel-page visit.

### Video branding watermark and Community tab funnel sync

Inside `YouTube Studio -> Customization -> Branding -> Video watermark`, upload a `150 x 150 px` PNG (`< 1 MB`) set to display during `Custom start time: 01:45` (right as the cold open closes and the viewer commits to Act I, avoiding clutter during the `0:00 to 0:15` hook). Design the badge as a clean `#1C2B3A` navy square with `12 px` rounded corners and crisp `#FFF6E5` `IBM Plex Mono` initials `RR` bordered by a `1 px` `rgba(255, 255, 255, 0.58)` glass rim so desktop viewers can hover-subscribe without leaving full-screen playback.

Pair the homepage funnel with one pinned Welcome Post at the top of the `Posts` (Community) tab (`43_52week_community_vault_60_posts.md`): state the three-layer channel promise in three plain sentences, attach the four Official Series Playlist links, and point new readers to the Slot 1 Reading Room Dossier archive. Visitors who tap the `Posts` tab during their ten-second audit encounter the exact same editorial voice and front-door routing as the `Home` tab.

### Diagnostic symptom-to-action matrix

| Observed YouTube Studio symptom | Root surface bottleneck | Single ranked fix to ship this month |
|---|---|---|
| High watch-page AVD (`> 50%`), low `Sub/View %` (`< 0.80%`), low channel-page visits | Weak verbal close or buried Row 1 proof | Update pinned comment on top 3 traffic videos to link Row 1 Front-Door episode + sharpen Act IV generational stake |
| High channel-page visits, low non-subscriber conversion, trailer `0:10` hold `< 68%` | Above-the-fold mismatch or slow trailer opening | Replace trailer `0:00 to 0:13` cold open or swap Line 1 visible bio to Tested Backup A |
| One newer episode hits `2.2% Sub/View` while Episode 01 sits at `1.4% Sub/View` | Outdated Row 1 Front-Door anchor | Promote the `2.2%` episode to Row 1 Slot #1, Series Position #1, and update trailer verbal pointer if general |
| Series playlist `Views per start < 1.25` despite strong Position #1 retention | Broken binge seam between Position #1 and Position #2 | Reorder Position #2 to match Position #1's closing question and move end-screen element entrance earlier by `4` seconds |
| Long-form Browse CTR drops right after a 200K-view Short spike | Shorts-to-Long cohort pollution | Unlist any Short with `< 0.50%` Related-Video click-through and pause vertical uploads for one 12-day flagship cycle |

### Monthly conversion audit log template

```yaml
audit_month: "2027-MM"
flagship_uploads_live: 0
channel_28d_metrics:
  longform_views: 0
  subscribers_gained_from_longform: 0
  blended_sub_per_view_pct: 0.00
  returning_longform_viewers_pct: 0.0
surface_checkpoints:
  row_1_front_door_video_id: "ep_01_the_allowance"
  row_1_sub_per_view_pct: 0.00
  top_challenger_video_id: "ep_XX"
  top_challenger_sub_per_view_pct: 0.00
  trailer_hold_at_10s_pct: 0.0
  trailer_hold_at_45s_pct: 0.0
  series_views_per_start:
    series_01_economy_debt: 0.00
    series_02_accounting_wall_street: 0.00
    series_03_grids_geopolitics: 0.00
    series_04_cyber_policy: 0.00
  shorts_related_video_ctr_pct: 0.00
single_change_shipped:
  target_surface: "Trailer | Above-the-Fold | Row 1 Front Door | Series Entry Order"
  exact_edit: "One-line description of the single change deployed"
  review_due_date: "YYYY-MM-01"
```

### Monthly ten-minute homepage QA checklist

Close every monthly audit by verifying these eight production states inside YouTube Studio and an incognito mobile browser:

1. Channel handle remains PascalCase (`@TheReadingRoomBrief`) with zero impersonation accounts ranking in top YouTube search results for `The Reading Room`.
2. Banner `1235 x 338 px` text core renders cleanly on Smart TV, desktop, tablet, and `390 px` mobile viewports with zero link-pill overlap.
3. Line 1 of the channel bio (`75` characters) displays its closing period before YouTube's `...more` truncation link.
4. Header Slot 1 (`Free Episode Dossiers`) resolves with active HTTPS and records UTM referral events cleanly.
5. Non-subscriber 45-second Channel Trailer holds `>= 68%` at `0:10` and `>= 48%` at `0:45` with English and Persian captions active.
6. Row 1 Slot #1 holds the highest verified `Sub/View %` flagship episode (`>= +0.25` percentage points ahead of prior incumbent over `28` days).
7. All active Row 2 playlists have `Set as official series` checked and carry their strongest conversion video at Position #1.
8. Row 4 `Shorts` sits below all widescreen rows, and every public Short carries an active `Related video` bridge pill above `0.50%` CTR.
