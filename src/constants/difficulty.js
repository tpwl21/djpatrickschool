// Noms affichés des paliers. Les tolérances de jeu ne vivent PAS ici :
// beatmatching → [validation_defaults.*] de src/workshops/beatmatching/workshop.toml.
export const DIFFICULTY_SETTINGS = {
  EASY: { name: 'Easy' },
  MEDIUM: { name: 'Medium' },
  PRO: { name: 'Pro' },
};

// Mort : le palier joué vient de la route (useDifficulty). Gardé car encore importé par SecretBooth.jsx.
export const CURRENT_DIFFICULTY = 'EASY';

// Couleurs de difficulté (pastilles, badges E/M/P). Assez foncées pour porter du texte blanc (≥4.5:1).
export const DIFF_COLORS = { EASY: '#1e8449', MEDIUM: '#b45309', PRO: '#c0392b' };
