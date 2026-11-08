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
- [x] Leçons : titres (`##`, 226 lignes), tableaux (14 fichiers) et *italique* affichés en brut → rendus correctement
- [x] Harmonies mobile : colonnes de la bibliothèque coupées
- [x] EQ : visualiseur écrasé (étiquettes HIGH / MID / BASS empilées), étiquettes de mixer invisibles en EASY
- [x] FX : étiquettes du mixer sur la frise
- [x] Retirer les vidéos YouTube inexistantes des leçons (48 champs, 23 fichiers ; la seule « vraie » vidéo avait une légende qui ne correspondait pas → retirée aussi)
- [x] Images de leçon manquantes (les 10 prévues pour Gemini) : masquées proprement au lieu d'une icône cassée
- [x] Stockage local bloqué (navigation privée) : le site ne plante plus, il ne mémorise juste rien
- [x] Moteur audio qui ne démarre pas : bandeau « Impossible de charger le son » + Réessayer (un morceau manquant est déjà remplacé par un beat synthétique)

### Proportions et vides
- [ ] Zone de jeu : largeur max + centrage, moins de vide en haut/bas (Beatmatching)
- [ ] Digging : centre presque vide, à réorganiser (lié au design du niveau → phase 2)
- [x] Mixer EQ / FX : contrôles regroupés (largeur max 820 px)
- [x] Beatmatching : tient dans l'écran en portrait mobile, en paysage (844×390, 667×375) et sur portable 1280×720
- [x] Mode « écran bas » (téléphone couché) : en-tête compact, bulle du coach repliée, zone de jeu en ligne
- [x] EQ : visualiseur et mixer côte à côte sur écran large → tient de 1280×720 à 1920×1080
- [x] FX : fader à côté des modules (grille) → tient dès 1440×900 (reste ~160 px à défiler en 1280×720)
- [x] Harmonies : la bibliothèque défile dans son cadre → la page tient à toutes les tailles
- [ ] Tablette paysage 1024×768 : EQ et FX demandent encore un peu de défilement

### Vérification & perf
- [x] Audit automatique Chrome sur 10 écrans × 7 tailles : 377 chevauchements → 0, plus de défilement horizontal
- [x] Même audit sur Firefox (Firefox système piloté via Puppeteer) : 0 chevauchement sur 90 pages, rendu identique à Chrome
- [x] Gestes tactiles testés (événements touch simulés) : potards, faders, crossfader répondent sans faire défiler la page
- [ ] Charger le texte des leçons à la demande (~1 Mo chargé dès l'accueil aujourd'hui)
- [ ] Test sur vrai téléphone (le tactile simulé marche, reste la sensation réelle)

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
- [ ] Coquilles repérées : « Apprend à utiliser le fader » → « Apprends » (consigne EQ 1, FR)
- [ ] Produire les 10 illustrations de leçons manquantes (`public/lesson-images/`, voir `GEMINI.md`)
- [ ] **Vidéos YouTube** : l'intégration marche techniquement (pas de blocage sur une page statique), mais **19 des 21 vidéos des leçons n'existent pas** : identifiants inventés par le LLM (vérifié via oEmbed le 2026-11-08). Les 2 vidéos réelles sont dans `harmonies/lessons/01_pro.toml` et `02_pro.toml`, dont une hors sujet.
  - [x] court terme : champs `youtube` invalides retirés
  - pendant la relecture : choisir ensemble de vraies vidéos, et vérifier chaque lien avant de l'ajouter
  - [x] option technique : lecteur via `youtube-nocookie.com`, chargement différé, lien « YouTube ↗ » en secours

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
