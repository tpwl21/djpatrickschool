<p align="center">
  <img src="src/assets/coach_patrick.webp" alt="Coach Patrick" width="220">
</p>

<h1 align="center">DJ Patrick School</h1>

<p align="center"><strong>Apprends à mixer comme un DJ, directement dans ton navigateur.</strong></p>

<p align="center"><a href="https://tpwl21.github.io/djpatrickschool/"><strong>Jouer maintenant →</strong></a></p>

---

## C'est quoi ?

Une école de DJ en forme de jeu. Patrick, ton coach, t'explique chaque geste avec une courte leçon, puis tu t'entraînes **sur du vrai son**. Le jeu vérifie ce que tu fais vraiment : le tempo, le moment où tu lances le morceau, tes réglages.

Gratuit, sans compte, sans installation.

## Les ateliers

| Atelier | Tu apprends à… |
|---|---|
| **Beatmatching** | caler deux morceaux pour qu'ils sonnent comme un seul |
| **EQ & Faders** | passer d'un morceau à l'autre proprement (crossfader, basses, volumes) |
| **Harmonies** | choisir des morceaux qui vont bien ensemble (tonalités, roue Camelot) |
| **Effets** | colorer tes transitions (filtre, écho, reverb, loop roll) |
| **Digging** | trouver le bon morceau au bon moment |
| **Lecture de foule** | sentir l'énergie de la piste et adapter ton mix |

Et pour les plus curieux, un **Secret Booth** pour mixer librement… si tu trouves le code.

## Trois niveaux de difficulté

- **Easy** : plein d'aides visuelles pour comprendre.
- **Medium** : moins d'aides, tu commences à écouter.
- **Pro** : à l'oreille, comme en club.

Plus c'est dur, plus la nuit tombe sur le club.

## Sur quoi jouer ?

- Ordinateur, tablette ou téléphone (le Secret Booth demande un écran de tablette ou d'ordinateur).
- **Mets un casque ou monte le son** : tout se joue à l'oreille.
- Tu as une platine DJ USB (par exemple Pioneer DDJ-SR) ? Branche-la : elle fonctionne aussi.

Ta progression est enregistrée dans ton navigateur.

---

<details>
<summary><strong>Pour les développeurs</strong></summary>

Site React + Vite, déployé automatiquement sur GitHub Pages à chaque mise à jour de `main`.

```bash
npm install
npm run dev      # http://localhost:5173/djpatrickschool/
npm run build    # version de production dans dist/
```

- Les ateliers, niveaux et leçons sont décrits en fichiers TOML dans `src/workshops/`.
- Les textes de l'interface sont dans `src/locales/` (français et anglais).
- La direction artistique est décrite dans `DESIGN.md`, le produit dans `PRODUCT.md`, et le plan d'action dans `TODO.md`.

</details>
