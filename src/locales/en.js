const en = {
  home: {
    a11y: {
      lesson: "lesson",
      level: "level",
      locked: "locked",
      openWorkshop: "Open workshop"
    },
    welcome: "Welcome to Patrick's DJ School! Pick your poison (difficulty) in the top right to start.",
    disclaimer: "The techniques taught here aren't absolute rules — just foundations to help you understand the craft. Creativity has no ceiling: find your own style, break the rules when it makes sense, and above all, have fun.",
    difficultyInfo: {
      EASY: "Perfect for bedroom beginners. Generous tolerance, full visual feedback, and short hold (3s).",
      MEDIUM: "The club challenge. Tighter tolerance, no visual precision indicators. 4s hold required.",
      PRO: "For the heads only. Razor-thin tolerance, absolutely zero visual feedback. 5s hold or bust."
    },
    workshopsTitle: "DJ WORKSHOPS",
    soon: "Dropping soon",
    mysteriesTitle: "PATRICK'S VAULT",
    mysterySections: [
      { title: "DJ Patrick secret tricks", desc: "The forbidden techniques." },
      { title: "DJ Patrick secret weapons", desc: "The tracks that save the dancefloor." },
      { title: "Patrick's DJ Booth", desc: "A guided tour of the holy sanctuary." }
    ],
    popup: {
      level: "LEVEL",
      missingDifficulty: "NO DIFFICULTY SELECTED",
      selectDifficultyText: "You gotta pick a difficulty (Easy, Medium, or Pro) before stepping into the booth.",
      cancel: "CANCEL",
      start: "LET'S GO",
      chooseDifficulty: "PICK DIFFICULTY"
    }
  },
  workshop: {
    audioError: {
      title: "Couldn't load the audio.",
      text: "Check your internet connection, then try again.",
      retry: "Try again"
    },
    menu: "Lobby",
    status: {
      pitchOk: "PITCH LOCKED",
      pitchPlus: "PITCH +",
      pitchMinus: "PITCH -",
      syncOk: "IN POCKET",
      toSync: "SYNC IT",
      startWaiting: "WAITING...",
      startOk: "DROP OK",
      early: "TOO EARLY",
      late: "TOO LATE"
    },
    blindModeWarning: "EARS ONLY...<br/>NO CHEATING!",
    trainA: "Deck A",
    loading: "Warming up the vinyl…",
    running: "Rolling...",
    startTrainA: "Start Train A",
    startTrainB: "Start Train B",
    trainB: "Deck B",
    play: "Drop",
    cue: "CUE",
    slowDown: "Drag",
    speedUp: "Push"
  },
  notFound: {
    title: "Oops, this page doesn't exist",
    text: "This level or lesson can't be found. Head back to the workshop to pick another one.",
    back: "Back"
  },
  coach: {
    open: "Show Patrick's tip",
    close: "Hide the tip"
  },
  cinematic: {
    hints: {
      pitch: "The pitch wasn't matched: listen whether Train B speeds up or slows down against A, and fix it on the fader before chasing the sync.",
      early: "You launched Train B too early: wait for the start of the phrase (the \"1\") before hitting Play.",
      late: "You launched Train B too late: get ready one beat before and drop it right on the \"1\".",
      sync: "The tempo was right but the kicks weren't aligned: tap the nudge buttons until both kick drums hit together.",
      hold: "So close! You were locked in, just hold the sync a little longer without touching anything.",
      generic: "Read Patrick's tip at the top again, and aim for the phrase shown on the timeline."
    },
    win: {
      title: "LEVEL CLEARED!",
      subtitle: "Your mix is absolutely seamless, DJ.",
      nextLevel: "Next Level"
    },
    lose: {
      title: "The train left the station...",
      subtitle: "Don't sweat it, the floor is still yours. Run it back?",
      retry: "Spin Again"
    }
  },
  lesson: {
    lessonLabel: "LESSON",
    lessonsSection: "LESSONS",
    practiceSection: "PRACTICE",
    prev: "Previous",
    next: "Next",
    toQuiz: "Take the Quiz",
    quiz: "QUIZ",
    submit: "Submit Answers",
    retry: "Try Again",
    successTitle: "Nice work!",
    successText: "You nailed every question. Time to hit the decks!",
    recapTitle: "What you'll remember",
    nextLesson: "Next Lesson",
    backToWorkshop: "Back to Workshop",
    fallbackBanner: "{requested} version coming soon — showing {served} content."
  },
  booth: {
    mobileGate: {
      title: "The booth needs room!",
      text: "Two decks and a mixer won't fit on a phone. Grab a tablet or come back on a computer to mix freely.",
      back: "Back to home"
    },
    title: "SECRET BOOTH",
    subtitle: "BY PATRICK",
    monitors: {
      phraseSync: "PHRASE SYNC MONITOR"
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
      download: "DOWNLOAD"
    },
    status: {
      booting: "BOOTING SECRET STUDIO...",
      noTrack: "No Track Loaded",
      noTrackShort: "No Track"
    },
    back: "BACK",
    professor: {
      welcome: "Welcome to the Secret Booth! I'll help you structure your mix.",
      transition: "Perfect time to prep your transition for the next Downbeat (Time 1)!",
      newPhrase: "New phrase! Here we go again.",
      outOfSync: "Careful Patrick, your phrases are not locked together!",
      clean: "Your mix is clean. Watch the structure."
    },
    soundguy: {
      prostitutes: "PATRICK! RED LIGHTS ARE FOR PROSTITUTES, NOT FOR MY MIXER!",
      smoke: "YOU TRYNA FRY THE SOUNDSYSTEM? DROP THAT TRIM!",
      noise: "THERE'S NO DYNAMICS LEFT, IT'S JUST NOISE! STOP HITTING THE RED!",
      hardcore: "YOU THINK THIS IS A HARDCORE RAVE? ALL THIS RED GIVES ME A HEADACHE!",
      motor: "HEY! YOU DON'T OPEN THE HOOD WHILE THE ENGINE IS RUNNING PATRICK! STOP THE DECK BEFORE LOADING A TRACK!"
    }
  }
};

export default en;
