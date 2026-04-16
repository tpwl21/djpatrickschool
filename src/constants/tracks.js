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
    A: { url: null, bpm: 120, complexity: 1, title: "Train A" },
    B: { url: null, bpm: 120, complexity: 1, title: "Train B" }
  },
  LEVEL_2: {
    A: { url: null, bpm: 120, complexity: 1, title: "Reference" },
    B: { url: null, bpm: 135, complexity: 1, title: "Vitesse à caler" }
  },
  LEVEL_3: {
    A: { url: "/AUDIO/Trip.mp3", bpm: 122, complexity: 3, title: "Base" },
    B: { url: "/AUDIO/Tech.mp3", bpm: 127, complexity: 3, title: "Rythme fou" }
  },
  LEVEL_4: {
    A: { url: "/AUDIO/SuperMarket.mp3", bpm: 130, complexity: 4, title: "Boucle Ref" },
    B: { url: "/AUDIO/SCIFI.mp3", bpm: 128, complexity: 4, title: "Boucle à caler" }
  },
  LEVEL_5: {
    A: { url: "/AUDIO/Ensaios.mp3", bpm: 130, complexity: 5, title: "Intro" },
    B: { url: "/AUDIO/SCIFI.mp3", bpm: 128, complexity: 5, title: "Outro" }
  },
  LEVEL_6: {
    A: { url: "/AUDIO/SuperMarket.mp3", bpm: 130, complexity: 4, title: "Boucle Ref" },
    B: { url: "/AUDIO/SCIFI.mp3", bpm: 128, complexity: 4, title: "Boucle à caler" }
  },
  LEVEL_7: {
    A: { url: "/AUDIO/SuperMarket.mp3", bpm: 130, complexity: 4, title: "Boucle Ref" },
    B: { url: "/AUDIO/SCIFI.mp3", bpm: 128, complexity: 4, title: "Boucle à caler" }
  }
};
