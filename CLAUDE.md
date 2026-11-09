# CLAUDE.md

Browser DJ school as a game ("DJ Patrick School"). React 19 + Vite 8, plain JS, no test suite. `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`, https://tpwl21.github.io/djpatrickschool/). Vite `base` is `/djpatrickschool/`, so asset paths stay relative (`"AUDIO/Foo.mp3"`, `"lesson-images/foo.png"`), never prefixed with `/` or the base.

Commands live in `package.json` (`dev`, `build`, `preview`, `lint`). The lint baseline already carries ~50 old errors: compare against it, add none.

## Content is TOML, code is one shell per family

```
src/workshops/<folder>/
  workshop.toml        id (route id, e.g. "eq", "reading_crowd"), order, color, image, kind, [en]/[fr]
  workshop.jsx         the level shell for the whole family (lazy-loaded chunk)
  levels/NN.toml       one practice level: id, order, [en]/[fr] texts, [track.A]/[track.B], [ui] flags
  lessons/NN_easy|medium|pro.toml   one lesson per difficulty variant (pages, quiz, recap)
```

- `src/lib/levels/load.js` globs all of it; `schema.js` validates required keys at load. **Adding a level = adding a TOML file.** Touch `workshop.jsx` only for behaviour shared by the family.
- `[ui]` flags do progressive disclosure per level (`show_eq`, `fx_modules`, `show_pitch`, `show_trim`, `show_fiches`, `view_type`…); the family's `workshop.jsx` reads them (`level.ui` / `ui`) and holds the live list.
- Lessons load lazily: the `lesson-meta` Vite plugin (`vite.config.js`) serves `?meta` (titles only, eager) and the full file comes via `?raw` on open. Keep both globs in `load.js` in sync with that plugin.
- Lesson pages accept optional media: `image` (local path under `public/`, URL or `data:`), `image_caption`, `youtube` (id or any YouTube URL), `youtube_start`, `youtube_caption` — rendered by `src/components/LessonMedia.jsx`, hidden when the image fails.

## Routing, progression, settings

Hash routes parsed in `src/App.jsx` (`parseHash`): `#/`, `#/workshop/<id>`, `#/<id>/lesson/<n>`, `#/<id>/<n>[/EASY|MEDIUM|PRO]`, `#/booth`. A retry remounts the level by bumping `retryKey` in its `key`.

`localStorage` keys: progression `dj_teacher_progression_v3` (App.jsx migrates older ones), language `djPatrickLanguage`. Every access sits in try/catch: the game must run with storage blocked.

Difficulty is a **tier progression**, not a global setting: EASY → MEDIUM → PRO unlock per workshop when every lesson and level of the previous tier is cleared. `src/lib/progression.js` derives it all from the saved completions (check: `node scripts/check-progression.mjs`). The tier lives in the route (`#/<id>/<n>/MEDIUM`, `#/<id>/lesson/<n>/PRO`); App mirrors it into `useDifficulty` (rules + theme) and `TierNavContext` (header tier switcher). What each tier changes outside Beatmatching is decided per workshop in phase 2 (TODO.md).

## Audio, animation, MIDI

- `src/audio/MagicAudioContext.js`: two decks A/B (buffer, playback rate, 3-band EQ, volume, analyser). Tracks come from `public/AUDIO/*.mp3`, or are synthesised when `url` is absent (`complexity` 1–5). A track's `bpm` is its **native** tempo; playback rate = target / native.
- Per-frame work runs in `useAnimationFrame`; scrolling is written straight to `ref.current.style.transform`, and UI state is throttled to ~30 Hz. Keep React state out of the hot path.
- Song structure: 5 fixed 32-beat phrases (Intro/Build/Drop/Break/Outro), helpers in `src/utils/workshopUtils.js`.
- MIDI (`useMidiControl`): CC is hard-capped at 100 Hz per control to protect the browser; levels sample-and-flush (callback stores the latest value in a ref, the frame loop reads and clears it).

## UI rules

- Design system: `DESIGN.md` (felt-pen booth, themes per difficulty, layout modes, end screens, test matrix). Product context: `PRODUCT.md`. Plan: `TODO.md`.
- Themes switch via `document.documentElement.dataset.theme`, tokens in `src/theme.css`. Panels that stay white set their own ink (`color: #2b2b2b`): theme text is light in MEDIUM/PRO.
- No emoji in the UI: use `Glyph` (felt-pen icons) and `PatrickAvatar` (vector Patrick). Text is non-selectable by design.
- Phones are first-class: levels and end screens should fit an iPhone-sized viewport without scrolling. Breakpoints: `useMobileDetection` (width ≤ 768), `useShortViewport(500)` (phone landscape).
- `src/App.css` forces `.btn-crayon` to small sizes with `!important` under 768 px; components that need a bigger button override with `!important` too.
- i18n: `const { t } = useContext(LanguageContext)`, dictionaries `src/locales/{fr,en}.js` (French is primary; comments are mostly French). Every UI string goes through `t()` and lands in both files.

`src/workshops/SecretBooth.jsx` is the standalone free-play sandbox (`#/booth`, tablet/desktop only, phone gate), also reached by the home password that unlocks all levels.
