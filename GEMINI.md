# GEMINI.md — Instructions pour la génération d'images (délégué à Gemini)

Ce fichier est destiné au modèle Gemini qui prend en charge la partie **génération d'images** du projet DJ Patrick School. Claude travaille en parallèle sur le code, la pédagogie et l'UI — ne touche pas à ces zones.

## Contexte projet

- Jeu d'apprentissage DJ dans le navigateur ("DJ Patrick School"), React 19 + Vite, déployé sur GitHub Pages.
- Esthétique globale "DJ Patrick" : cartoon stylisé, univers cohérent autour d'un personnage récurrent (Patrick).
- Voir `CLAUDE.md` pour le contexte code complet si besoin.

## Style de référence — à respecter impérativement

Les images existantes sont le **canon visuel** du projet. Tout nouveau visuel doit être stylistiquement indiscernable.

Références dans [src/assets/](src/assets/) :
- `beatmatching_patrick.png`, `eq_patrick.png`, `digging_patrick.png`, `effects_patrick.png`, `harmony_patrick.png`, `reading_crowd` / `coach_patrick.png`
- `professor_patrick.png`, `angry_soundguy_patrick.png`, `secret_agent_patrick.png`
- `easy_patrick.png`, `medium_patrick.png`, `pro_patrick.png`
- `hero.png`, `banner.png`

**Avant toute génération** : charge ces images, extrais la palette, la ligne, le traitement du personnage, la typographie (la font utilisée dans les visuels — probablement une font cartoon/graffiti — doit être identifiée et réutilisée).

## Tâches à accomplir

### Tâche 1 — Graphiques théorie du signal (EQ workshop)

**Contexte** : les lecons du workshop EQ & Faders vont être enrichies avec du contenu théorie du signal (fréquence, transformée de Fourier, phase, battements).

**À produire** : des illustrations pédagogiques dans le style "fond de `eq_patrick.png`" — courbes de fréquence stylisées, zones de coupure low/mid/high, schémas d'onde sinusoïdale, addition de phases, tout dans l'esthétique Patrick.

**Formats** : PNG, fond transparent de préférence, résolution utilisable en web (largeur max 1200px, optimisé).

**Livraison** : dépose dans [public/lesson-images/](public/lesson-images/). Nomme `eq_theory_<concept>.png` (ex : `eq_theory_fourier.png`, `eq_theory_phase_beats.png`).

### Tâche 2 — Images illustratives pour lecons (remplacement/enrichissement)

**Contexte** : les lecons TOML (voir `src/workshops/*/lessons/*.toml`) référencent une image par page via le champ `image`. Actuellement certaines pages n'en ont pas ou utilisent des placeholders.

**À produire** : une image par page de lecon qui illustre le concept principal de la page, *avec du texte intégré dans l'image quand pertinent* (titres, termes clés), toujours dans le style Patrick et avec la font identifiée.

**Workflow** :
1. Lis la page TOML concernée (`title` + contenu markdown).
2. Identifie le concept-clé illustrable.
3. Génère l'image.
4. Ajoute le chemin dans le TOML via le champ `image = "lesson-images/<nom>.png"` (chemin relatif, Vite gère le `base`).

## Contraintes techniques

- **Emplacement final** : toutes les images lecons vont dans [public/lesson-images/](public/lesson-images/). Les images "hero" de workshop restent dans [src/assets/](src/assets/) (importées via `import`).
- **Référencement TOML** : `image = "lesson-images/<fichier>.png"` — **pas** de `/` initial, **pas** de préfixe `/djpatrickschool/` (Vite ajoute le `base` automatiquement).
- **Champ associé** : `image_caption = "..."` pour une légende italique optionnelle.
- **Poids** : optimise les PNG (tinypng ou équivalent) avant commit. Cible < 200 KB par image lecon.
- **Langues** : si du texte est intégré dans l'image, produis les deux versions (FR par défaut, EN pour parité). Les lecons sont bilingues via `[[fr.pages]]` / `[[en.pages]]` — utilise des noms `<concept>_fr.png` / `<concept>_en.png` et branche le bon fichier dans chaque bloc langue.

## Ce que tu ne dois PAS faire

- Ne modifie pas les fichiers `.jsx`, `.js`, `.css` du projet.
- Ne touche pas aux workshops, hooks, ou composants React.
- Ne modifie pas `CLAUDE.md` ni ce fichier.
- Ne commit pas de clés API, de prompts avec données sensibles, ni de fichiers sources (PSD, etc.) — uniquement les PNG finaux.
- Ne change pas les images existantes dans `src/assets/` sans demander confirmation — sauvegarde dans `src/assets/_originals_backup/` si besoin de remplacement.

## Handoff

Quand un batch d'images est prêt :
1. Commit les images + les modifications TOML associées.
2. Message de commit préfixé `images:` (ex: `images: add EQ theory illustrations for lessons 9-11`).
3. Liste dans le corps du commit les fichiers ajoutés et les lecons modifiées pour que Claude puisse prendre le relais sur la mise en forme côté rendu si nécessaire.
