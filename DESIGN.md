---
name: DJ Patrick School
description: A real DJ booth redrawn in felt pen; toy-like controls, ink outlines, and night falling as difficulty rises.
colors:
  ink: "#333333"
  ink-text: "#2b2b2b"
  paper: "#f1ece3"
  paper-raised: "#ffffff"
  paper-muted-text: "#6b6b6b"
  dusk: "#5f4d40"
  dusk-raised: "#6e5a4a"
  dusk-text: "#f3ece1"
  dusk-muted-text: "#e3d7c9"
  night: "#1f232b"
  night-raised: "#2b3038"
  night-text: "#e6e6ea"
  brick-accent: "#c45a3a"
  ember-accent: "#d89464"
  moon-accent: "#7aa7d9"
  booth-orange: "#ff9f43"
  crayon-teal: "#4ecdc4"
  crayon-mint: "#96ceb4"
  crayon-yellow: "#ffeead"
  signal-coral: "#ff6b6b"
  workshop-beatmatching: "#5dade2"
  workshop-eq: "#e67e22"
  workshop-harmonies: "#8e44ad"
  workshop-fx: "#27ae60"
  workshop-digging: "#e74c3c"
  workshop-crowd: "#d4a017"
  difficulty-easy: "#1e8449"
  difficulty-medium: "#b45309"
  difficulty-pro: "#c0392b"
  status-ok: "#1e8449"
  status-error: "#c0392b"
  status-info: "#2471a3"
typography:
  display:
    fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive"
    fontSize: "clamp(1.5rem, 6vw, 2.8rem)"
    fontWeight: 900
    lineHeight: 1.2
  title:
    fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive"
    fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)"
    fontWeight: 700
  body:
    fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive"
    fontSize: "clamp(0.9rem, 3vw, 1.1rem)"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive"
    fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)"
    fontWeight: 900
  label:
    fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive"
    fontSize: "0.7rem"
    fontWeight: 700
  code:
    fontFamily: "ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.88em"
    fontWeight: 700
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "30px"
  round: "50%"
spacing:
  xs: "5px"
  sm: "10px"
  md: "15px"
  lg: "20px"
components:
  button-crayon:
    backgroundColor: "{colors.crayon-teal}"
    textColor: "{colors.ink-text}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "clamp(10px, 2.5vw, 16px) clamp(15px, 4vw, 25px)"
  button-crayon-play:
    backgroundColor: "{colors.crayon-mint}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.lg}"
  button-crayon-nudge:
    backgroundColor: "{colors.crayon-yellow}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.lg}"
  status-chip:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
  status-chip-ok:
    backgroundColor: "{colors.status-ok}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.md}"
  panel:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.lg}"
    padding: "15px"
  speech-bubble:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-text}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
---

# Design System: DJ Patrick School

## Overview

**Creative North Star: "The Felt-Pen Booth"**

A real DJ booth redrawn in felt pen. Every control the learner touches (pitch fader, nudge, EQ pots, crossfader, CUE / Play) exists on real hardware, and the interface keeps that function intact while drawing it like a toy console: thick ink outlines, chunky rounded shapes, flat crayon fills, and a hard offset shadow that makes each control look like a plastic part you could slap. The cartoon Patrick illustrations (`src/assets/*_patrick.png`) set the line quality; the UI is drawn in the same hand.

The world changes with the hour of the set. **Night falls on the club as difficulty rises**: EASY is daytime practice on cream paper, MEDIUM is dusk in warm taupe, PRO is night in deep slate. The ink, crayon fills and workshop colors stay constant; only the room around them dims. The Secret Booth is the one place already inside the club at full dark, with a warm orange glow.

Density is game-like rather than app-like: few controls per screen, each large enough to hit with a thumb, with the gameplay area (trains, track lanes, mixer) given most of the viewport.

**Key Characteristics:**
- One handwritten face (Patrick Hand) everywhere, set heavy for anything you press.
- Ink-gray outlines (#333) of 2–4px on every interactive part.
- Hard, unblurred offset shadows instead of soft elevation.
- One color per workshop, used as its thread from home to practice.
- Ambient theme switches by difficulty via `data-theme` on the root; components only read tokens.

## Colors

Cream paper and ink at rest, crayon fills on the controls, one saturated color per workshop, and a room color that darkens with difficulty.

### Primary
- **Felt Ink** (`ink`): outlines, hard shadows, and text on light fills. The single most consistent value in the system; every pressable thing is drawn with it.
- **Crayon Teal** (`crayon-teal`): default fill of the chunky action button.
- **Crayon Mint** (`crayon-mint`): transport "go" actions (Play, Start Train).
- **Crayon Butter** (`crayon-yellow`): secondary hardware actions (CUE, nudge Slower / Faster, Menu).

### Secondary
- **Workshop threads** (`workshop-*`): Beatmatching sky blue, EQ & Faders orange, Harmonies purple, FX green, Digging red, Reading the Crowd mustard. Source of truth is each `src/workshops/*/workshop.toml` `color`. Used for the workshop rule line on the home, its icons, and accents inside that workshop.
- **Difficulty colors** (`difficulty-easy / -medium / -pro`): deep green / burnt orange / brick red, shared from `src/constants/difficulty.js` (`DIFF_COLORS`). Deep enough to carry white E/M/P letters.

### Tertiary
- **Signal Coral** (`signal-coral`): live/alert states: sound-on pill, the target line on the railway, the locomotive.
- **Booth Orange** (`booth-orange`): Secret Booth accent and glow only.

### Neutral (the room, per theme)
- **Daytime Paper** (`paper`, `paper-raised`, `ink-text`, `paper-muted-text`): EASY room. Raised panels are pure white on cream.
- **Dusk Taupe** (`dusk`, `dusk-raised`, `dusk-text`, `dusk-muted-text`): MEDIUM room, warm and dim, light text; tuned so both text tokens pass 4.5:1 on both surfaces.
- **Club Night** (`night`, `night-raised`, `night-text`): PRO room, deep slate, light text.
- **Room accents** (`brick-accent` / `ember-accent` / `moon-accent`): the `--accent-env` of each theme, for ambient highlights that should follow the hour.

- **Status fills** (`status-ok` / `status-error` / `status-info`): deeper green, red and blue behind white chip text (PITCH OK, TÔT / TARD, PITCH +). The brighter difficulty colors are for dots and lines only; they fail contrast under white text.

### Named Rules
**The Tinted-Active Rule.** An active state colored by the workshop (difficulty switcher) uses a 55% tint of the workshop color (`color-mix(in srgb, var(--primary) 55%, #fff)`) with ink text, so purple and red workshops stay readable. Solid workshop-colored fills that carry text get their text color from `inkOn()` (`src/utils/color.js`).

**The White-Card Ink Rule.** Any panel that is always white or cream (end cards, crowd meter, deck cards, bubbles, phrase pills) sets its own ink text color (#2b2b2b). Never let it inherit the room text color, which is light at dusk and night.

**The Workshop-Ink Rule.** When a workshop color must read as text (lesson bold terms, titles), use `--lesson-ink` = 20% workshop color mixed into the theme text color; bright workshop colors stay for lines, dots and fills.

**The Ink-on-Crayon Rule.** Text on a crayon, coral, sky or bright-green fill is ink (#2b2b2b), never white. White text only sits on the status fills or on ink.

**The Hour-of-the-Set Rule.** Difficulty never changes components, only the room. Anything that sits on the background must read from `--surface`, `--surface-elevated`, `--text`, `--text-muted`, `--border`, `--border-strong`, `--accent-env` (`src/theme.css`), never a hard-coded room color, so it survives the switch to dusk and night.

**The Constant Crayon Rule.** The crayon fills, the ink, and the workshop colors are Patrick's identity and do not shift with the theme.

## Typography

**Display, body and label font:** Patrick Hand (Google Fonts), falling back to Comic Sans MS, cursive.

**Character:** a single friendly handwritten face, the same hand as the illustrations. Hierarchy comes from size and weight, never from a second family.

### Hierarchy
- **Display** (900, `clamp(1.5rem, 6vw, 2.8rem)`, 1.2): level titles ("Lancement Parfait"). Drops to 1.2rem under 768px.
- **Title** (700, `clamp(0.85rem, 2.5vw, 1.1rem)`): control group labels ("Train A"), workshop names on the home.
- **Body** (400–700, `clamp(0.9rem, 3vw, 1.1rem)`, 1.5): level descriptions, coach bubbles, lesson text. Level descriptions cap at 800px wide and are hidden on mobile.
- **Button** (900, `clamp(0.9rem, 2.5vw, 1.2rem)`): every chunky action.
- **Label** (700, 0.7rem, often uppercase): status chips (PITCH OK, À CALER), BPM readouts, small tags. The most frequent inline size in the code.

### Named Rules
- **Code** (700, 0.88em, system monospace): inline code, formulas in lessons, MIDI message specs. Only for actual code or data.

**The One Hand Rule.** Patrick Hand everywhere. Monospace exists only for code, formulas and MIDI data; it is never a display or body voice.

**The 11px Floor Rule.** Nothing functional below 0.7rem (11.2px), including chips, BPM mode toggles and knob labels.

## Layout

Full-height game frame (`100dvh`). Everything sits in normal flow: nothing in a level is `position: fixed` or absolutely placed over the game. Order: level bar → instruction → coach strip + level status chips → playfield → controls. The playfield grows to fill the screen (`flex: 1 0 auto`) but never shrinks below its content: when space runs out the page scrolls instead of overlapping.

- **Level bar**: 3-zone grid, Menu left · title center · difficulty E/M/P + sound pill right. Under 760px the title drops to its own row. Language is chosen on the home only.
- **Short viewport (max-height 500px, phone in landscape)**: single-row bar, instruction hidden, coach bubble collapsed by default, gameplay stays in a row (rails | pitch fader), slimmer buttons.
- **Compact desktop (max-height 820px)**: shorter faders and smaller pots in EQ/FX.
- **Wide (≥1100px)**: EQ visualizer and mixer side by side; mixers capped at 820–980px and centered.
- **Phones**: the Secret Booth shows a gate ("needs a bigger screen"); tablets get decks side by side with the mixer below.
- **Progressive disclosure**: a level shows only what it teaches, via optional `[ui]` flags in its TOML (`show_eq`, `fx_modules`, `show_pitch`); default is everything visible.

The home is a three-column composition on desktop: coach Patrick, his speech bubble and the **Start / Continue** sticker (next unfinished lesson or level) on the left, the workshop list in the middle, the "Mysteries of Patrick" vault on the right. On mobile the order is bubble → Patrick → sticker → workshops.

Spacing is loose and fluid rather than strictly gridded: steps of 5 / 10 / 15 / 20px, with `clamp()` on gaps and paddings so touch targets grow with the viewport.

## Elevation & Depth

Depth is drawn, not lit. Controls and panels sit on hard, unblurred offset shadows in ink (`5px 5px 0 #333` on chunky buttons, `3px 3px 0 #333` on smaller ones) or a faint ink wash (`3px 3px 0 rgba(0,0,0,0.1)`) on large surfaces. Pressing a control moves it toward its shadow (`translate(2px, 2px)`, shadow shrinks to 1px), like a toy key going down. Soft blurred shadows exist only in the theme tokens (`--shadow`) for ambient panels, and in the Secret Booth.

### Shadow Vocabulary
- **Toy key** (`box-shadow: 5px 5px 0 #333`): chunky action buttons at rest.
- **Small key** (`box-shadow: 3px 3px 0 #333` / `2px 2px 0 #333`): chips, small buttons, level tiles.
- **Pressed** (`box-shadow: 1px 1px 0 var(--crayon-dark-teal)` + `translate(2px, 2px)`): active / disabled state.
- **Sketch wash** (`box-shadow: 3px 3px 0 rgba(0,0,0,0.1)`): large panels and cards.

### Named Rules
**The Drawn Shadow Rule.** A shadow is an offset, not a blur. If it needs a blur radius, it doesn't belong outside the Secret Booth.

## Shapes

Chunky and rounded, like moulded plastic outlined in felt pen. Buttons and panels use generous corners (20px), chips and tiles 10–12px, large cards up to 30px, knobs and transport dots are full circles. Every interactive shape carries an ink border: 4px on primary buttons and panels, 3px on mid-size controls, 2px on chips. Empty or locked slots switch to a dashed light border with a "?" inside.

## Components

### Buttons (chunky crayon keys)
- **Shape:** big rounded key (20px) with a 4px ink border.
- **Fills:** teal by default, mint for Play / Start, butter yellow for CUE, nudge and Menu, coral for the sound-on pill.
- **Type:** Patrick Hand 900, fluid size.
- **Press:** shifts 2px down-right as its shadow shrinks; disabled stays in the pressed position.

### Chips (status pills)
- **Style:** small rounded pill (≈12px), 2px ink border, white fill, uppercase label text.
- **State:** the OK state flips to a green fill with white text (PITCH OK, SYNC OK, DÉPART OK); pending states stay white.

### Cards / Containers
- **Corner Style:** 20px on panels, 30px on large cards.
- **Background:** `--surface-elevated` on the themed room.
- **Shadow Strategy:** sketch wash or small key (see Elevation).
- **Border:** 3–4px ink, or `--border` for the quiet playfield frame.

### Navigation
- Hash routes, no nav bar. The home's workshop list *is* the navigation: per workshop a colored rule, a lesson row (book icon + tiles L1…) and a practice row (workshop icon + tiles 1…). Tiles are real buttons with a full accessible name ("Beatmatching, level 3: …"); locked ones are disabled dashed "?" slots. Focus shows the same description in Patrick's bubble as hover. Inside a level, a yellow "Menu" key top-left returns to the workshop. Every route sets the tab title "<page> · DJ Patrick School".

### Coach Patrick (signature)
In levels, an inline **tip strip** under the instruction: the vector `PatrickAvatar` (head crop, 64px, 44px on small screens) and a white bubble with an ink border whose tail points at him. The "×" (44px target) folds the bubble; tapping Patrick reopens it; tip rotation never reopens a closed bubble. On small screens the bubble is clamped to 2 lines and a tap expands it. Patrick bobs his head to the BPM while music plays and his expression follows the game (only where the game already shows that information: Beatmatching in EASY only).

On the home and in narrative moments, Patrick appears as **die-cut stickers** (cut-out illustration, paper rim, ink outline, `--sticker-shadow`), produced from the originals by `scripts/make-sticker.sh`.

### End screens
White card with fixed ink text (never inherits the room color). Win: vector Patrick in victory pose dancing on the level tempo, the grade landing as a red ink stamp, a one-shot glyph burst. Lose: surprised Patrick plus one precise tip about what went wrong (pitch / too early / too late / sync / hold), never a generic "retry".

### Loading
Buttons waiting for audio show a spinning vinyl glyph and "Le vinyle chauffe…". If the audio engine fails to start, the level bar shows a red-bordered card with a retry button (a missing track is already replaced by a synthetic beat).

### Mixer hardware (signature)
Pitch fader, EQ pots, volume faders and crossfader (`Potard`, `PitchFader`, `MixerControls`) drawn as toy versions of real gear: ink-outlined track, chunky colored cap (purple on the pitch fader), labels above in Label type. Every interactive one is a keyboard slider (`role="slider"`, arrows = 2% steps, Shift = 10%, Home/End) with an `ariaLabel` naming the control; purely decorative knobs (no `onChange`) are hidden from assistive tech.

### Glyphs (signature)
`src/components/Glyph.jsx`: the house pictogram set, drawn in the same felt-pen language as the hand-built icons (`BookIcon`, `CrateIcon`, `Locomotive`). 24×24 grid, ink stroke 2 (round caps and joins), flat crayon fill, no blur. Inline at `1.15em` by default; `shadow` adds a hard 2px ink offset and is reserved for large, standalone uses (success star, digging verdict, booth vinyl). Set: phrases (`intro` sunrise, `build` hill, `drop` flame, `break` wave, `outro` moon), train wagons (`kick`, `clap`, `hat`, `note`, white fill on the wagon color), feedback (`bolt` energy, `lock`, `target`, `burst`, `warning`, `pencil`, `star`, `vinyl`). Decorative by default (`aria-hidden`); pass `label` when the glyph carries meaning on its own (lock, clip).

### Focus
A 3px dashed outline in `--border-strong`, offset 3px: a felt-pen dashed ring that follows the room color.

## Do's and Don'ts

### Do:
- **Do** outline every pressable thing in ink (#333) and give it a hard offset shadow.
- **Do** read room colors from the theme variables so EASY / MEDIUM / PRO all work.
- **Do** keep a workshop's own color as its thread (rule line, icons, accents).
- **Do** keep touch targets chunky; the same screen must play on a phone.
- **Do** match the line and palette of the existing Patrick illustrations for any new visual.
- **Do** ship illustrations as WebP at about 2× their displayed size (originals live in `src/assets/_originals_backup/`).
- **Do** let `MotionConfig reducedMotion="user"` handle framer motion; never remove the trains' scrolling, it is the game information.
- **Do** verify every UI change at 360, 390, 667×375, 844×390, 768, 1024, 1280×720, 1440 and 1920 wide, in Chrome and Firefox, with zero overlaps.
- **Do** tell Train A (coral locomotive) and Train B (blue locomotive) apart by color, not only by lane.

### Don't:
- **Don't** position anything over the playfield (`position: fixed/absolute` coach, chips or pills); put it in the level bar or the coach strip.
- **Don't** use emoji or Unicode pictographs as icons. Draw it in `Glyph` (or a dedicated icon component) in the felt-pen style. Musical and typographic signs (♭ ♯ ↔ → ← ✓ inside sentences) are text, not icons, and stay.
- **Don't** use blurred drop shadows, glassmorphism or gradients on game UI (the Secret Booth's night-club look is the only exception).
- **Don't** add a second typeface for headings or body.
- **Don't** hard-code cream or white backgrounds on components that sit on the room: they break at dusk and night.
- **Don't** change crayon or workshop colors per difficulty.
- **Don't** redraw or restyle Patrick himself; the illustration set is canon.
