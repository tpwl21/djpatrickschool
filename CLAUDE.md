# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based DJ learning game ("DJ Patrick School"). React 19 + Vite 8, no TypeScript, no test suite. Deployed to GitHub Pages from `main` via `.github/workflows/deploy.yml`. The Vite `base` is `/djpatrickschool/`, so all asset URLs must be relative to that prefix.

## Commands

- `npm run dev` — Vite dev server on `http://localhost:5173` (see `vite.config.js`).
- `npm run build` — production build into `dist/`.
- `npm run preview` — serve the built `dist/` locally.
- `npm run lint` — ESLint flat config (`eslint.config.js`). The `no-unused-vars` rule ignores identifiers starting with an uppercase letter or `_`.

There are no unit/e2e tests.

## High-level architecture

### Routing & progression (`src/App.jsx`)

Single-page app with hand-rolled hash routing. Routes: `#/` (home), `#/beatmatching/N[/DIFF]`, `#/eq/N[/DIFF]`, `#/booth`.

Levels are addressed by a single global index 1–14: **beatmatching = 1–8**, **EQ = 9–14** (user-facing EQ number is `level - 8`). `TOTAL_LEVELS` in `src/constants/workshops.js` is the source of truth. Progression is persisted in `localStorage` under `dj_teacher_progression`. Language choice is persisted under `djPatrickLanguage`.

### Workshops registry (`src/constants/workshops.js`)

`WORKSHOPS` declares categories (some marked `forthcoming: true`). `LEVEL_COMPONENTS` maps the global level number → its React component + a `type` discriminator (`'beatmatching'` or `'eq'`). **Adding a level** means: add the component file, register it in `LEVEL_COMPONENTS`, include its index in the matching workshop's `levels` array, and bump `TOTAL_LEVELS`.

### Level shell pattern

Two shared "shell" components do all the heavy lifting:

- `src/workshops/WorkshopLevel.jsx` — beatmatching (pitch fader, nudge, sync/pitch/start validation, train visualization).
- `src/workshops/eq-faders/WorkshopLevelEq.jsx` — EQ & faders (crossfader, 3-band EQ pots, phrase-based target validation).

The files in `src/workshops/beatmatching/LevelN.jsx` and `src/workshops/eq-faders/LevelNEq.jsx` are thin wrappers that pass `levelId`, `trackConfig`, `viewType`, markers, and coach tips into the shell. Modify shells for cross-level behavior; add wrappers for new levels.

`difficulty` (EASY/MEDIUM/PRO, settings in `src/constants/difficulty.js`) applies only to beatmatching — EQ levels ignore it. A level remount (retry) is forced by bumping `retryKey` in `App.jsx`, which is part of the `key` on the level component.

### Audio engine (`src/audio/MagicAudioContext.js`)

Web Audio wrapper for two decks `A`/`B`. Each deck has: buffer, playback rate (pitch), 3-band EQ (low/mid/high BiquadFilters), volume, gain, analyser. Tracks are loaded from `public/AUDIO/*.mp3` or generated synthetically when `url: null` (complexity 1–5 controls how many instruments are mixed in — see `_addKick`, `_addSnare`, etc.). Track definitions live in `src/constants/tracks.js` as `TRACK_CONFIG.LEVEL_N = { A: {url, bpm, complexity, title, key}, B: {...} }`. `bpm` is the **native** tempo of the file; playback rate is set to target BPM / native BPM.

### Animation & performance patterns

- `src/hooks/useAnimationFrame.js` drives the per-frame loop; track scrolling is applied directly to DOM `ref.current.style.transform` rather than via React state to avoid re-renders.
- UI-bound state (BPM display, pitch) is throttled to ~30 Hz inside the RAF callback.
- Song structure is modeled as 5 fixed 32-beat phrases (Intro / Build / Drop / Break / Outro) — constants and helpers in `src/utils/workshopUtils.js`. Track length is hard-coded to 160 s in the level shells.

### Validation hooks

- `src/hooks/useValidation.js` — beatmatching. Validates pitch match, sync (beat-phase diff), and the start position against per-level allowed beats (see the `levelId`-specific branches inside `validateStart`). Difficulty tunes tolerance/win-duration/nudge-amount.
- `src/hooks/useEqValidation.js` — EQ. Validates the state of EQ pots / faders / crossfader against per-phrase targets declared in `src/constants/eqTargets.js` (`EQ_TARGETS[levelId].params[].getTarget(phraseIdx, progress)`).

### MIDI (`src/hooks/useMidiControl.js`)

Web MIDI API. **Important safety shield**: CC messages (status `0xB0`) are hard-capped to 100 Hz per control to prevent browser saturation. Levels consume events with a "sample & flush" pattern — the callback stashes the latest value in a ref, and the animation-frame loop reads and clears it. Tested mapping (DDJ-SR): note `0x0B` = Play, `0x0C` = Cue, CC `0x00` ch2 = pitch deck B, CC `0x22` ch2 = jog deck B.

### i18n (`src/hooks/LanguageContext.jsx`, `src/locales/{fr,en}.js`)

`const { t, language, setLanguage } = useContext(LanguageContext)`. `t('dotted.key')` walks the dictionary. Default is `fr`. Use translation keys instead of hard-coded UI strings; `levelDesc`, `coachTips.LEVEL_*`, and `home.*` are the common roots.

### Secret booth

`src/workshops/SecretBooth.jsx` is a standalone free-play sandbox with its own themed UI, reached via `#/booth` or from the home via a magic password (which also unlocks all levels — see `handleUnlockAll` in `App.jsx`).

### Lesson media (`src/components/LessonMedia.jsx`)

Each `[[lang.pages]]` in a lesson TOML accepts optional media fields, rendered below the page text:
- `image` — local path (e.g. `"lesson-images/foo.png"` → `public/lesson-images/foo.png` via `base`) or external `http(s)://` URL or `data:` URI.
- `image_caption` — italic caption under the image.
- `youtube` — video ID (`"dQw4w9WgXcQ"`) or any YouTube URL (`watch?v=`, `youtu.be/`, `embed/`). Auto-extracted.
- `youtube_start` — integer seconds offset (optional).
- `youtube_caption` — italic caption under the video.

Image + video can coexist on the same page (image first, then video). Omitting all media fields keeps the page text-only — backward-compatible with existing lessons.

## Conventions to preserve

- Audio paths in `TRACK_CONFIG` are relative strings like `"AUDIO/Foo.mp3"` — do not prefix with `/` or the base, Vite handles that via `base`.
- When adding DOM-driven animation, follow the existing ref-based `style.transform` pattern rather than adding React state in the hot path.
- Per-level files should stay as thin wrappers; put shared behavior in the shell.
- French is the primary language in code comments and many string literals; keep both `fr.js` and `en.js` in sync when adding translated text.
