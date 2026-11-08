# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mixed audience; the browser alone is the floor, a MIDI controller is the bonus.

- **Total beginners, solo**: curious people with no gear discovering DJing in the browser at home.
- **Beginners with a controller**: owners of an entry-level controller (tested: Pioneer DDJ-SR) who want to drill the real gestures with it plugged in.
- **Students and teachers**: support material between or during DJ lessons.

Includes a young audience (teenagers, possibly kids): tone and content must stay suitable for them.

## Product Purpose

A browser DJ school that teaches the core craft through hands-on practice on real audio: you hear the result of every gesture. Each workshop pairs short lessons + a quiz with practice levels whose validation checks the gesture itself (tempo, phase, EQ state per phrase, key, track choice). Success = the learner can do the gesture by ear, not only explain it.

Workshops: Beatmatching, EQ & Faders, Harmonies, FX, Digging, Reading the Crowd. Plus a free-play sandbox (Secret Booth).

## Positioning

Not a DJ software and not a video course: a guided game where a recurring coach character (Patrick) walks you through progressive drills, three difficulty levels (EASY / MEDIUM / PRO, PRO meaning mixing by ear with no visual feedback), and validation on live audio. Free, no account, works with a real controller.

## Operating Context

- Played in a desktop or mobile browser, often with headphones; optionally with a USB MIDI controller (Web MIDI).
- Sessions = lesson → quiz → practice → recap, within a workshop.
- Progression, language and difficulty live in the browser (`localStorage`); no server.
- Deployed to GitHub Pages.

## Capabilities and Constraints

- French is the primary language, English kept in sync (`src/locales/`, lesson TOML `[fr]`/`[en]`).
- **Must work on mobile**, not just desktop.
- **Free, no account, no paywall**: never add login or server-side progression without an explicit decision.
- Lessons are TOML content (`src/workshops/*/lessons/`), with optional image/YouTube media per page.
- MIDI CC input is capped at 100 Hz per control (protects the browser); keep it.
- Terminology: workshop (atelier), lesson (leçon), practice, level (niveau), difficulty (EASY / MEDIUM / PRO), Camelot, phrase (32 beats), loop (8 beats).

## Brand Commitments

- **DJ Patrick is a fictional mascot**: his personality and gags can evolve, but he stays the recurring coach and guide.
- **The existing cartoon Patrick illustrations are canon** (`src/assets/*_patrick.png`, `hero.png`, `banner.png`): new visuals must match them, not replace them (see `GEMINI.md`).
- Voice: friendly, a bit cheeky, informal ("tu" in French), encouraging; DJ slang allowed, never crude.
- Stated philosophy (home disclaimer): the techniques are bases, not absolute rules; creativity and fun come first.

## Evidence on Hand

- 16 real tracks in `public/AUDIO/` plus synthesized tracks.
- Patrick illustration set in `src/assets/`.
- Lesson content in TOML, three difficulty variants per lesson.
- No testimonials, user numbers, partner logos or press: do not invent any.

## Product Principles

1. **Ears first**: every lesson ends with a gesture you hear and validate; the visuals are training wheels you lose at PRO.
2. **Progression by removal**: difficulty removes help (tolerance, visual feedback) rather than adding complexity.
3. **Zero barrier**: free, no account, browser only, phone included; the controller is a bonus, never a requirement.
4. **Patrick carries the tone**: learning stays playful and encouraging, and suitable for young learners.
5. **Bilingual by construction**: no UI text without both FR and EN.

## Accessibility & Inclusion

- Young audience: plain language, no crude content.
- Mobile touch must be a first-class input next to mouse and MIDI.
- No formal standard committed to yet (open decision).
