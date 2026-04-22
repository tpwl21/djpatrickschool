# Mixer UI — inventaire et état de factorisation

Point sur les éléments d'interface "mixeur" (potards, faders, pads, boutons) utilisés dans les ateliers *practice* et dans le *Secret Booth*, et audit rapide de la réutilisation.

Dernière mise à jour : 2026-04-20.

## 1. Primitives (dépendances de tout le reste)

| Composant | Fichier | LOC | Rôle |
|---|---|---:|---|
| **`Potard`** | `components/Potard.jsx` | 132 | Potard rotatif, drag vertical, valeur `min..max`, `centerValue` optionnel pour snap centre. |
| **`PitchFader`** | `components/PitchFader.jsx` | 176 | Fader linéaire, horizontal ou vertical, `invertVertical`, `resetValue` sur double-clic. |

Tous les autres éléments de mixage s'appuient sur ces deux primitives.

## 2. Compound mixer (`components/MixerControls.jsx`, 116 LOC)

Un seul fichier, 4 exports :

| Export | Composition | Range | Utilisé par |
|---|---|---|---|
| `EqKnobs` | 3× `Potard` (high / mid / low) | −24 dB .. +6 dB, center 0 | eq-faders, effets, SecretBooth |
| `GainKnob` | 1× `Potard` | 0 .. 2 (gain linéaire) | eq-faders, SecretBooth |
| `VolumeFader` | 1× `PitchFader` vertical inversé | 0 .. 1 | eq-faders, effets, SecretBooth |
| `Crossfader` | 1× `PitchFader` horizontal | 0 .. 1, center 0.5 | eq-faders, effets, SecretBooth |

**Bonne factorisation** : un seul endroit où les plages EQ et les orientations par défaut sont définies.

## 3. Composants spécialisés (un rôle, un fichier)

| Composant | Fichier | LOC | Dépend de | Utilisé par |
|---|---|---:|---|---|
| `FilterKnob` | `FilterKnob.jsx` | 35 | `Potard` | effets |
| `DelayPad` | `DelayPad.jsx` | 54 | `Potard` | effets |
| `ReverbPad` | `ReverbPad.jsx` | 31 | `Potard` | effets |
| `LoopRollPads` | `LoopRollPads.jsx` | 54 | — | effets |
| `NudgeButton` | `NudgeButton.jsx` | 58 | — | beatmatching, SecretBooth |
| `PitchBlock` | `PitchBlock.jsx` | 159 | `PitchFader` | beatmatching, SecretBooth |
| `MasterTempoSwitch` | `MasterTempoSwitch.jsx` | 49 | — | ⚠ orphelin (aucun import dans `workshops/`) |
| `KeyDial` | `KeyDial.jsx` | 76 | — | ⚠ orphelin |

## 4. Visualisation / feedback (lecture seule)

| Composant | Fichier | LOC | Utilisé par |
|---|---|---:|---|
| `VuMeter` | `VuMeter.jsx` | 102 | eq-faders |
| `Train` | `Train.jsx` | 117 | beatmatching |
| `CrowdMeter` | `CrowdMeter.jsx` | 106 | reading-crowd |
| `SpectrumVisualizer` | `SpectrumVisualizer.jsx` | — | SecretBooth |
| `AudioVisualizer` | `AudioVisualizer.jsx` | — | Home |

## 5. Matrice d'usage par atelier

Cases ✅ = présent à l'écran dans cet atelier.

| Composant            | beatmatching | eq-faders | effets | digging | harmonies | reading-crowd | SecretBooth |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `PitchBlock`         | ✅ | — | — | — | — | — | ✅ |
| `NudgeButton`        | ✅ | — | — | — | — | — | ✅ |
| `Train`              | ✅ | — | — | — | — | — | — |
| `EqKnobs`            | — | ✅ | ✅ | — | — | — | ✅ |
| `GainKnob`           | — | ✅ | — | — | — | — | ✅ |
| `VolumeFader`        | — | ✅ | ✅ | — | — | — | ✅ |
| `Crossfader`         | — | ✅ | ✅ | — | — | — | ✅ |
| `VuMeter`            | — | ✅ | — | — | — | — | — |
| `FilterKnob`         | — | — | ✅ | — | — | — | — |
| `DelayPad`           | — | — | ✅ | — | — | — | — |
| `ReverbPad`          | — | — | ✅ | — | — | — | — |
| `LoopRollPads`       | — | — | ✅ | — | — | — | — |
| `CrowdMeter`         | — | — | — | — | — | ✅ | — |
| `SpectrumVisualizer` | — | — | — | — | — | — | ✅ |

**Constats** :
- `digging` et `harmonies` n'utilisent aucun élément de mixage (dialogues + sélection).
- Le couple `PitchBlock` / `NudgeButton` n'est partagé qu'entre beatmatching et SecretBooth — la factorisation est déjà correcte.
- SecretBooth est un superset du mixer de `eq-faders` + les transports de `beatmatching`. Aucun élément n'est dupliqué entre ces trois consommateurs.

## 6. État de la factorisation

### Bon

- **Deux primitives, sept façades** : `Potard` et `PitchFader` portent toute la logique d'interaction. Les 7 façades ne font que configurer les plages, labels et styles.
- **Un fichier = un composant** (sauf `MixerControls.jsx` qui regroupe 4 variantes cousines d'un même pattern — justifié).
- **Aucune duplication d'UI de mixeur** entre ateliers : chaque élément visible a un unique implémenteur, consommé par plusieurs écrans.
- **MIDI côté eq-faders** (depuis `993d160`) passe par `matchControl(mapping, …)` et n'a plus de codes en dur.

### À améliorer

1. **SecretBooth a son propre handler MIDI inline** (`workshops/SecretBooth.jsx:568-744`, ~180 lignes) qui duplique la logique de décodage — literal `0x1F`, `0x07`, etc. au lieu de passer par `matchControl`. C'est le chantier logique après la migration de `beatmatching`.
2. **`FilterKnob` + `GainKnob` + row d'`EqKnobs`** ont la même enveloppe visuelle (label au-dessus, potard en-dessous, unités optionnelles). Un `LabeledKnob` partagé économiserait ~40 LOC sans sacrifier la lisibilité, mais ce n'est pas urgent tant que personne n'ajoute de nouvelle variante.
3. **`KeyDial` et `MasterTempoSwitch` sont orphelins** — aucun `import` dans `src/workshops/**`. Soit les brancher (atelier harmonies pour `KeyDial`, beatmatching pour `MasterTempoSwitch`), soit les retirer. À trancher.
4. **`DIFF_COLORS` dupliqué** : défini identiquement dans `components/Home.jsx:56` et `components/WorkshopHome.jsx:13`. Extraire dans `constants/difficulty.js` (qui contient déjà `DIFFICULTY_SETTINGS`).
5. **SecretBooth.jsx : 1162 LOC** — le plus gros fichier du repo. Contient la scène, le handler MIDI, les écouteurs clavier, la gestion de la librairie de morceaux, le recording. Candidat à un split en sous-composants (déjà pas trivial à cause du state partagé).

### Pas la peine

- Extraire un `KnobWithLabel` générique (point 2) : tant qu'il n'y a que 3 variantes et qu'elles sont stables, c'est de la factorisation prématurée.
- Bouger `EqKnobs` dans son propre fichier : le regroupement dans `MixerControls.jsx` exprime une cohérence de domaine (contrôles du mixer), pas un accident historique.

## 7. Chemins de dépendance

```
Potard ◄── FilterKnob
       ◄── DelayPad
       ◄── ReverbPad
       ◄── MixerControls (EqKnobs, GainKnob)

PitchFader ◄── PitchBlock
           ◄── MixerControls (VolumeFader, Crossfader)
```

Deux racines, aucun cycle, profondeur ≤ 2. Graphe sain.
