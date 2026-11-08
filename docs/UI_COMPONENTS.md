# UI Components — Guidelines

How shared UI components are structured, when to extract one, and a reference of what already exists. Read this before adding a new component under `src/components/`.

## When to extract a shared component

Extract a component when **any of** these apply:

1. **Same UI block used in ≥ 2 consumers** (e.g. same playlist in Secret Booth and in a workshop).
2. **Changes must propagate** — if updating the block in one place but not the other would be a bug.
3. **The block has its own clear name** and could stand alone in a component library.

Do **not** extract prematurely. Inline UI that's used in exactly one place should stay inline until a second consumer shows up.

When a consumer needs a variation of an existing component, prefer **adding a prop** (opt-in feature) over forking the component.

## File layout

```
src/
  components/
    PitchBlock.jsx           ← shared, generic, no workshop-specific logic
    TrackBrowser.jsx
    MasterTempoSwitch.jsx
    CamelotMappingTable.jsx
    ...
  workshops/
    harmonies/
      workshop.jsx           ← consumer, composes shared components
    beatmatching/
      workshop.jsx
```

Shared components live in `src/components/`. Workshop-specific composition lives in `src/workshops/<id>/workshop.jsx` and must not hide reusable UI.

## Conventions

### Controlled, not self-managing
Components take `value` + `onChange` from the parent. They should not own state that the consumer might care about (e.g. the selected track, the current rate, whether key-lock is on). State lives in the consumer.

### Props, not context
Pass data via props. The only exception is `LanguageContext` for i18n strings rendered inside the component (labels, badges). Never read workshop-specific state from a context.

### Optional features via presence of callback
Instead of boolean flags that gate a feature, use the presence of a callback. Example in `PitchBlock`:

```jsx
// Master tempo is shown only when both keyLock and onKeyLockChange are provided.
const showMasterTempo = typeof keyLock === 'boolean' && typeof onKeyLockChange === 'function';
```

This makes it impossible to enable a feature without wiring its handler.

### Theming
If a component renders inside a theme-able context (Secret Booth supports dark mode), accept a `theme` object or an explicit `color` prop. Do not read themes from context inside the component.

### No workshop-level knowledge
Shared components don't know about `levelId`, `workshopId`, `difficulty`, `keyFormat`, game modes, validation rules, etc. Those belong in the consumer. A shared component should be reusable in a completely unrelated workshop.

### i18n
Use `useContext(LanguageContext)` for labels rendered by the component itself. Text passed in via props (e.g. `title`) is rendered as-is and pre-translated by the consumer.

## Adding a new component — checklist

1. **Name it after what it shows**, not where it's used. `PitchBlock` > `HarmoniesPitch`.
2. **Write the props interface first** — minimum required props at the top, optional opt-ins below.
3. **Leave a comment** at the top of the file explaining the contract (min usage + opt-ins). Consumers will read it.
4. **Use it from ≥ 2 consumers**. If the second consumer needs a fork, reconsider whether the boundary is right.
5. **Update this file** with a one-line entry in the reference below.

## Existing shared components — reference

### `PitchBlock`
Pitch fader with optional target-BPM badge, optional master-tempo (key-lock) switch on top, and a configurable readout (`BPM`, `%`, `semitones`). The single source of truth for pitch UI — used by Harmonies, Secret Booth, and Beatmatching.

```jsx
<PitchBlock
  nativeBpm={120}
  rate={rate}
  onRateChange={setRate}
  targetBpm={bpmA}              // optional — shows "Cible: X" badge, BPM readout turns green when matched
  keyLock={keyLock}             // optional — shows MasterTempoSwitch on top
  onKeyLockChange={setKeyLock}
  keyLockHighlight={pulseOnSync}
  showBpm                       // readout BPM visible (default true)
  showPercent                   // readout % visible (default true)
  showSemitones                 // show "+1.36 st" line in readout
  percentBaseline={1.0}         // anchor for the % display (beatmatching uses a randomized initial rate)
  bpmColor={'#27ae60'}          // string OR (effBpm) => color. Overrides default green-when-synced.
  percentColor={(rate) => ...}  // string OR (rate) => color.
  boxed                         // wrap in a card (matches DeckCard visual language)
  disabled={!loadedTrack}       // greys out + blocks pointer events
/>
```

**Variants in use**
- **Harmonies L2** — `targetBpm`, `keyLock`, `showSemitones`, `boxed`.
- **Secret Booth** — per-deck `keyLock` only; no target; compact `trackLength=140`.
- **Beatmatching EASY** — `targetBpm`, `showPercent=false`, custom `bpmColor` (perfect-pitch green or red).
- **Beatmatching non-EASY** — no badge, `showBpm=false`, `percentBaseline` = randomized initial rate, custom `percentColor` (red above baseline, teal below).

### `PitchFader`
Low-level fader primitive. Vertical or horizontal, controlled, double-click to reset. Used directly by beatmatching and by `PitchBlock`. Prefer `PitchBlock` in new code unless you genuinely need just the fader.

### `MasterTempoSwitch`
On/off toggle for key-lock (master tempo / pitch-preservation). Re-exported implicitly via `PitchBlock`; direct use is fine if you need the switch alone.

### `TrackBrowser`
Generic playlist / record box with sortable columns (`title`, `bpm`, `key`, `camelot`, `genre`, `energy`). Caller passes `tracks` and `columns`. Used by Secret Booth and by all three Harmonies practices.

### `CamelotWheel`
The 12-position Camelot wheel with optional highlight of `keyA`, `keyB`, compatibility set, and drag-to-drop behaviour.

### `CamelotMappingTable`
Static 12-row table mapping Camelot codes to solfège notation. Opt-in per lesson page via `camelot_table = true` in the TOML.

### `Crate`
Grid of track cards with cover-art placeholder, preview button, and fiche (BPM/Key/Genre/Energy). Used by the Digging workshop. Different UI vocabulary than `TrackBrowser` (visual cards vs. table rows), kept as a separate component.

### `MixerControls`
Re-exports `EqKnobs`, `GainKnob`, `VolumeFader`, `Crossfader`. Used by EQ workshop and Secret Booth.

### Other primitives
`NudgeButton`, `Potard`, `TrackPreviewPlayer`, `SpectrumVisualizer`, `AudioVisualizer`, `Cinematic`, `CoachPatrick`, `LessonMedia`, `PhraseIndicator`, `SimplifiedTimeline`, `Glyph` (house pictograms — use it instead of emoji). Check the file for its prop contract.

## Anti-patterns

- **Inline a complex block in a workshop, then copy-paste to a second workshop.** If the block is non-trivial and appears twice, extract.
- **Add a `workshopId` prop to a shared component** to branch its behaviour. Pass the specific data/callback the component needs; don't give it knowledge of its caller.
- **Fork a component because one consumer needs a tweak.** Add a prop instead.
- **Hard-code French strings inside a shared component.** Use `LanguageContext`.
