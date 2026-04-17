/**
 * TRACK_CONFIG defines the audio tracks used in each level.
 * 
 * url: The URL to the audio file (relative to public/ or absolute). 
 *      If null, the engine generates a synthetic beat.
 * bpm: The NATIVE tempo of the audio file.
 * complexity: For synthetic tracks (1-5), determines how many instruments are added.
 */
export const TRACK_CONFIG = {
  LEVEL_1: {
    A: { url: null, bpm: 120, complexity: 1, title: "Train A", key: "8A" },
    B: { url: null, bpm: 120, complexity: 1, title: "Train B", key: "8A" }
  },
  LEVEL_2: {
    A: { url: null, bpm: 120, complexity: 1, title: "Reference", key: "5A" },
    B: { url: null, bpm: 135, complexity: 1, title: "Vitesse à caler", key: "5A" }
  },
  LEVEL_3: {
    A: { url: "/AUDIO/Trip.mp3", bpm: 122, complexity: 3, title: "Base", key: "4A" },
    B: { url: "/AUDIO/What_is_music.mp3", bpm: 126, complexity: 3, title: "Rythme fou", key: "8A" }
  },
  LEVEL_4: {
    A: { url: "/AUDIO/Estupido.mp3", bpm: 125, complexity: 4, title: "Boucle Ref", key: "11A" },
    B: { url: "/AUDIO/SCIFI.mp3", bpm: 128, complexity: 4, title: "Boucle à caler", key: "12A" }
  },
  LEVEL_5: {
    A: { url: "/AUDIO/Funkasteroid.mp3", bpm: 126, complexity: 3, title: "Base Clap", key: "4A" },
    B: { url: "/AUDIO/SuperMarket.mp3", bpm: 130, complexity: 3, title: "Start on 2", key: "8A" }
  },
  LEVEL_6: {
    A: { url: "/AUDIO/Ensaios.mp3", bpm: 130, complexity: 5, title: "Intro", key: "1A" },
    B: { url: "/AUDIO/SuperMarket.mp3", bpm: 130, complexity: 5, title: "Outro", key: "12A" }
  },
  LEVEL_7: {
    A: { url: "/AUDIO/before_palmos.mp3", bpm: 130, complexity: 4, title: "Boucle Ref", key: "11A" },
    B: { url: "/AUDIO/Jazzman_Doucheur.mp3", bpm: 128, complexity: 4, title: "Boucle à caler", key: "12A" }
  },
  LEVEL_8: {
    A: { url: "/AUDIO/Bjork.mp3", bpm: 132, complexity: 4, title: "Boucle Ref", key: "11A" },
    B: { url: "/AUDIO/Sourire.mp3", bpm: 128, complexity: 4, title: "Boucle à caler", key: "11A" }
  }
}; export const HARMONY_POOL = [
  { url: "/AUDIO/Trip.mp3", bpm: 122, title: "Trip", key: "4A" },
  { url: "/AUDIO/Tech.mp3", bpm: 127, title: "Tech", key: "8A" },
  { url: "/AUDIO/SuperMarket.mp3", bpm: 130, title: "Market", key: "11A" },
  { url: "/AUDIO/SCIFI.mp3", bpm: 128, title: "SciFi", key: "12A" },
  { url: "/AUDIO/Ensaios.mp3", bpm: 130, title: "Ensaios", key: "1A" },
];
