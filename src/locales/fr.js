const fr = {
  home: {
    a11y: {
      lesson: "leçon",
      level: "niveau",
      locked: "verrouillé",
      openWorkshop: "Ouvrir l'atelier"
    },
    welcome: "Bienvenue à l'école de DJing ! Choisis d'abord ta difficulté en haut à droite.",
    disclaimer: "Les techniques présentées ici ne sont pas des règles absolues — juste des bases pour t'aider à comprendre le métier. Pas de limite à la créativité : trouve ton propre style, casse les codes quand ça a du sens, et surtout, amuse-toi.",
    difficultyInfo: {
      EASY: "Parfait pour débuter. Tolérance généreuse, feedback visuel complet et maintien court (3s).",
      MEDIUM: "Le défi intermédiaire. Tolérance réduite, aucun indicateur visuel de précision. Maintien de 4s.",
      PRO: "Réservé aux experts. Tolérance millimétrée, aucun feedback visuel. Maintien de 5s exigé."
    },
    workshopsTitle: "ATELIERS DJ",
    soon: "Bientôt",
    mysteriesTitle: "LES MYSTÈRES DE PATRICK",
    mysterySections: [
      { title: "DJ Patrick secret tricks", desc: "Les techniques interdites." },
      { title: "DJ Patrick secret weapons", desc: "Ses morceaux qui sauvent une soirée." },
      { title: "Le Booth de DJ Patrick", desc: "Visite guidée de son sanctuaire." }
    ],
    popup: {
      level: "NIVEAU",
      missingDifficulty: "DIFFICULTÉ MANQUANTE",
      selectDifficultyText: "Tu dois choisir une difficulté (Easy, Medium ou Pro) avant de pouvoir démarrer l'entraînement.",
      cancel: "ANNULER",
      start: "DÉMARRER",
      chooseDifficulty: "CHOISIR DIFFICULTÉ"
    }
  },
  workshop: {
    audioError: {
      title: "Impossible de charger le son.",
      text: "Vérifie ta connexion internet, puis réessaie.",
      retry: "Réessayer"
    },
    menu: "Menu",
    status: {
      eqOk: "Courbe EQ OK",
      eqAdjust: "Ajuste les EQ / faders !",
      fxOk: "FX OK",
      fxAdjust: "Ajuste les FX !",
      score: "Score",
      pitchOk: "PITCH OK",
      pitchPlus: "PITCH +",
      pitchMinus: "PITCH -",
      syncOk: "SYNC OK",
      toSync: "À CALER",
      startWaiting: "DÉPART...",
      startOk: "DÉPART OK",
      early: "TÔT",
      late: "TARD"
    },
    blindModeWarning: "ÉCOUTE UNIQUEMENT...<br/>PAS DE TRICHE !",
    trainA: "Train A",
    loading: "Le vinyle chauffe…",
    running: "En route...",
    startTrainA: "Démarrer Train A",
    startTrainB: "Démarrer Train B",
    trainB: "Train B",
    play: "Play",
    cue: "CUE",
    slowDown: "Ralentir",
    speedUp: "Accélérer"
  },
  notFound: {
    title: "Oups, cette page n'existe pas",
    text: "Ce niveau ou cette leçon est introuvable. Retourne à l'atelier pour en choisir un autre.",
    back: "Retour"
  },
  coach: {
    open: "Afficher le conseil de Patrick",
    close: "Masquer le conseil"
  },
  timeline: {
    intro: "INTRO (A SEUL)",
    mix: "LE MIX",
    outro: "OUTRO (B SEUL)",
    progress: "PROGRESSION",
    volumeFdr: "FADER DE VOLUME",
    bassEq: "EQ BASSES",
    hybrid: "SWAP HYBRIDE : FADER + BASSES",
    morphBass: "MORPHING DES BASSES…",
    morphColors: "MORPHING DES COULEURS…"
  },
  visualizer: {
    source: "SOURCE",
    target: "CIBLE",
    high: "AIGUS",
    mid: "MÉDIUMS",
    bass: "BASSES",
    mix: "MIX"
  },
  cinematic: {
    hints: {
      pitch: "Le pitch n'était pas calé : écoute si le Train B accélère ou ralentit par rapport au A, et corrige au fader avant de chercher la synchro.",
      early: "Tu as lancé le Train B trop tôt : attends le début de la phrase (le « 1 ») avant d'appuyer sur Play.",
      late: "Tu as lancé le Train B trop tard : prépare-toi un temps avant et lance pile sur le « 1 ».",
      sync: "Le tempo était bon mais les kicks n'étaient pas alignés : donne de petits coups de nudge jusqu'à ce que les deux grosses caisses tapent ensemble.",
      hold: "Presque ! Tu étais calé, mais il faut tenir la synchro un peu plus longtemps sans y toucher.",
      generic: "Relis le conseil de Patrick en haut, et vise la phrase indiquée sur la frise."
    },
    win: {
      title: "NIVEAU RÉUSSI !",
      subtitle: "Ta maîtrise du mix est impressionnante.",
      nextLevel: "Niveau Suivant"
    },
    lose: {
      title: "Le train est parti...",
      subtitle: "Ne baisse pas les bras, DJ ! On réessaye ?",
      retry: "Réessayer"
    }
  },
  lesson: {
    lessonLabel: "LEÇON",
    lessonsSection: "LEÇONS",
    practiceSection: "PRATIQUE",
    prev: "Précédent",
    next: "Suivant",
    toQuiz: "Quiz",
    quiz: "QUIZ",
    submit: "Valider",
    retry: "Réessayer",
    successTitle: "Bravo !",
    successText: "Tu as répondu correctement à toutes les questions. Tu es prêt pour la pratique !",
    recapTitle: "Ce que tu retiens",
    nextLesson: "Leçon Suivante",
    backToWorkshop: "Retour à l'atelier",
    fallbackBanner: "Version {requested} en préparation — contenu {served} affiché."
  },
  booth: {
    mobileGate: {
      title: "Le booth a besoin de place !",
      text: "Deux platines et une table de mixage, ça ne tient pas sur un téléphone. Tourne ta tablette ou reviens sur un ordi pour mixer librement.",
      back: "Retour à l'accueil"
    },
    title: "SECRET BOOTH",
    subtitle: "DE PATRICK",
    monitors: {
      phraseSync: "MONITEUR DE PHASE"
    },
    mixer: "MIXER",
    controls: {
      play: "PLAY",
      pause: "PAUSE",
      cue: "CUE",
      sync: "SYNC",
      load: "LOAD",
      slow: "- SLOW",
      fast: "+ FAST",
      vol: "VOL",
      pitch: "PITCH",
      gain: "GAIN",
      low: "LOW",
      mid: "MID",
      high: "HIGH"
    },
    recording: {
      start: "START REC",
      stop: "STOP REC",
      on: "REC ON",
      download: "TÉLÉCHARGER"
    },
    status: {
      booting: "LANCEMENT DU STUDIO SECRET...",
      noTrack: "Aucun morceau chargé",
      noTrackShort: "Pas de track"
    },
    back: "RETOUR",
    professor: {
      welcome: "Bienvenue au Secret Booth! Je vais t'aider à structurer ton mix.",
      transition: "C'est le moment idéal pour préparer ta transition sur le prochain temps 1!",
      newPhrase: "Nouvelle phrase! C'est reparti pour un tour.",
      outOfSync: "Attention Patrick, tes phrases ne sont pas calées ensemble!",
      clean: "Ton mix est propre. Surveille la structure."
    },
    soundguy: {
      prostitutes: "PATRICK! LES LUMIÈRES ROUGES C'EST POUR LES PROSTITUÉES, PAS POUR MON MIXEUR!",
      smoke: "TU VEUX FAIRE FUMER LA SONO OU QUOI ? BAISSE CE TRIM !",
      noise: "Y'A PLUS DE DYNAMIQUE LÀ, C'EST JUSTE DU BRUIT ! ARRÊTE DE TAPER DANS LE ROUGE !",
      hardcore: "TU CROIS QUE C'EST UN CONCERT DE HARDCORE ? TOUT CE ROUGE ME DONNE MAL À LA TÊTE !",
      motor: "OH ! ON N'OUVRE PAS LE CAPOT QUAND LE MOTEUR TOURNE PATRICK ! STOP LA PLATINE AVANT DE CHARGER UN MORCEAU!"
    }
  }
};

export default fr;
