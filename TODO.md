# DJ Patrick School — plan d'action

Ordre de marche : on finit une phase avant d'attaquer la suivante. Chaque phase « à discuter » commence par une séance ensemble (questions, idées), puis on code.

Légende : `[x]` fait · `[ ]` à faire · `[?]` à décider ensemble

---

## Phase 1 — Front-end nickel (finition, pas de refonte)

Objectif : apparence pro, fluide, pratique à jouer, rien qui se superpose, bien dimensionné partout (mobile 360 px → écran 1920 px, Chrome + Firefox), optimisé. Le style actuel est validé, on fait de la finition.

### Déjà fait
- [x] `PRODUCT.md` + `DESIGN.md` (direction « The Felt-Pen Booth », la nuit tombe avec la difficulté)
- [x] Accessibilité : potards/faders au clavier, focus visible, titres, contrastes (EASY / MEDIUM / PRO / Booth)
- [x] Images allégées (12 Mo → ~1 Mo), ateliers chargés à la demande
- [x] Plus d'emojis : pictos maison `Glyph` dans le style feutre
- [x] Illustrations de Patrick en autocollants détourés (`scripts/make-sticker.sh`)
- [x] Logo vectoriel qui suit l'ambiance (`src/assets/logo.svg`)
- [x] Patrick vectoriel animable (`PatrickAvatar`) utilisé comme coach dans les niveaux
- [x] Pas de sélection de texte ni de glisser d'image

### Organisation de la fenêtre (décisions validées)
- [x] **Barre du haut des niveaux en 3 zones** : Menu à gauche · titre au centre · difficulté + son à droite. Sur mobile, titre sur sa propre ligne. Les drapeaux de langue restent sur l'accueil uniquement.
- [x] **Coach en bandeau sous le titre** : petit Patrick + conseil dans le flux de la page, fermable. Plus jamais par-dessus le jeu.
- [x] **Secret Booth réservé tablette/desktop** : sur téléphone, message de Patrick « le booth a besoin d'un plus grand écran ». Corriger aussi le chevauchement du prof sur le deck A sous 1920 px.

### Corrections relevées par l'audit (7 tailles × 10 écrans)
- [x] Accueil mobile : les drapeaux chevauchent le logo
- [x] Leçon : badge « LEÇON 1 » hors écran à 360 px
- [ ] Leçon : un `## titre` s'affiche en brut (rendu Markdown)
- [x] Harmonies mobile : colonnes de la bibliothèque coupées
- [x] EQ : visualiseur écrasé (étiquettes HIGH / MID / BASS empilées), étiquettes de mixer invisibles en EASY
- [x] FX : étiquettes du mixer sur la frise
- [ ] Retirer les 19 vidéos YouTube inexistantes des leçons (voir phase 3)

### Proportions et vides
- [ ] Zone de jeu : largeur max + centrage, moins de vide en haut/bas (Beatmatching)
- [ ] Digging : centre presque vide, à réorganiser (lié au design du niveau → phase 2)
- [x] Mixer EQ / FX : contrôles regroupés (largeur max 820 px)
- [ ] Beatmatching mobile (360×740) : les commandes demandent de défiler, à faire tenir dans l'écran

### Vérification & perf
- [x] Audit automatique Chrome sur 10 écrans × 7 tailles : 377 chevauchements → 0, plus de défilement horizontal
- [ ] Même audit sur Firefox (l'installation du Firefox de test bloque, à relancer)
- [ ] Charger le texte des leçons à la demande (~1 Mo chargé dès l'accueil aujourd'hui)
- [ ] Test sur vrai téléphone (tactile : faders, potards, pads)

---

## Phase 2 — Retravailler les ateliers, famille par famille `[?]`

La jouabilité du Beatmatching est bonne ; les autres ateliers ont de bonnes idées mais sont bâclés. Pour chaque famille : séance d'idées → mécanique de jeu → représentation visuelle → niveaux.

- [ ] **Beatmatching** : petits détails de synchro à corriger (à lister ensemble)
- [ ] **EQ & Faders**
- [ ] **Harmonies**
- [ ] **FX**
- [ ] **Digging**, avec un nouveau type de niveau : **validation par URL Discogs**
  - le joueur fouille Discogs (filtres, labels, années…) et colle l'URL du disque attendu
  - validation sans API : on extrait l'identifiant de l'URL (`/release/123`, `/master/456`), une ou plusieurs bonnes réponses acceptées
  - `[?]` accepter release *et* master ? plusieurs pressages ? afficher la pochette après réussite (demanderait l'API Discogs)
- [ ] **Lecture de foule**

---

## Phase 3 — Reprendre la main sur le contenu `[?]`

Les leçons ont été écrites par un LLM et pas toutes relues. Objectif : du contenu de qualité, ta voix, ta pédagogie.

- [ ] Inventaire des leçons et de leur volume de texte
- [ ] Relecture guidée, étape par étape, à partir de ce que tu as en tête (on avance leçon par leçon)
- [ ] Alléger : moins de texte, plus de démonstrations, de visuels et de pratique
- [ ] **Vidéos YouTube** : l'intégration marche techniquement (pas de blocage sur une page statique), mais **19 des 21 vidéos des leçons n'existent pas** : identifiants inventés par le LLM (vérifié via oEmbed le 2026-11-08). Les 2 vidéos réelles sont dans `harmonies/lessons/01_pro.toml` et `02_pro.toml`, dont une hors sujet.
  - court terme (phase 1) : retirer les champs `youtube` invalides pour ne plus afficher de lecteurs cassés
  - pendant la relecture : choisir ensemble de vraies vidéos, et vérifier chaque lien avant de l'ajouter
  - option technique : passer par `youtube-nocookie.com` (pas de cookies tant qu'on ne lance pas la vidéo) avec un lien « Voir sur YouTube » en secours

---

## Phase 4 — Simplifier le système de difficulté `[?]`

Constat : EASY / MEDIUM / PRO, c'est bien pour le jeu (surtout en Beatmatching), mais ça triple le contenu (3 versions par leçon) et ce n'est pas clair pour le joueur. Pistes à discuter :

- **A. La difficulté ne touche que la pratique** (tolérance, aides visuelles, temps de maintien, comme en Beatmatching). Une seule version des leçons pour tout le monde.
- **B. Leçon unique + encarts « Pour aller plus loin »** dépliables pour les curieux, au lieu de 3 fichiers.
- **C. Difficulté par niveau** : on réussit un niveau, puis on débloque son « mode défi » (étoiles / badges), au lieu de choisir une difficulté globale au départ.

On peut combiner (par exemple A + B). À trancher avant la phase 3, pour ne réécrire le contenu qu'une fois.

---

## Plus tard / idées

- [ ] Vraie DA vectorielle : planche de personnage de Patrick (poses, expressions, accessoires par atelier) → Recraft ou illustrateur (Figma) → animations Rive
- [ ] Ménage : `CLAUDE.md` en partie périmé (ateliers maintenant en TOML), dossier `patricks-school/` (copie du dépôt ?) à trier
