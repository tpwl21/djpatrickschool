const en = {
  home: {
    welcome: "Welcome to Patrick's DJ School! Pick your poison (difficulty) in the top right to start.",
    difficultyInfo: {
      EASY: "Perfect for bedroom beginners. Generous tolerance, full visual feedback, and short hold (3s).",
      MEDIUM: "The club challenge. Tighter tolerance, no visual precision indicators. 4s hold required.",
      PRO: "For the heads only. Razor-thin tolerance, absolutely zero visual feedback. 5s hold or bust."
    },
    workshopsTitle: "DJ WORKSHOPS",
    soon: "Dropping soon",
    categories: {
      beatmatching: {
        title: "BEATMATCHING",
        desc: "The fine art of locking in perfect tempos, fam."
      },
      harmonies: {
        title: "HARMONIES",
        desc: "Harmonic mixing (Camelot wheel vibes)."
      },
      eq: {
        title: "EQ",
        desc: "Mastering the frequencies and isolators."
      },
      effets: {
        title: "FX & TRICKS",
        desc: "Delay, Reverb, and that classic Echo Out."
      },
      digging: {
        title: "DIGGING",
        desc: "Crate digging secrets to find those hidden gems."
      }
    },
    workshops: {
      1: {
        title: "The Perfect Drop",
        desc: "Both trains are rolling at the exact same speed. Just drop Train B dead on the beat!",
        details: "Focus: Hitting that Play button right on time. Locked at 120 BPM."
      },
      2: {
        title: "Engine Control",
        desc: "Train B is rolling at a different tempo. Pitch it up or down to match Train A.",
        details: "Focus: Riding the pitch fader. 120 vs 135 BPM."
      },
      3: {
        title: "The Real Groove",
        desc: "Enough with the basic kicks. Let's see how a real groove works.",
        details: "Focus: Listen for the snare landing on the 2nd beat."
      },
      4: {
        title: "The Loop",
        desc: "Line up the loops AND the wagons so the downbeats sync perfectly.",
        details: "Focus: Structural phrasing (8-bar loops)."
      },
      5: {
        title: "The Clap Master",
        desc: "Start on the clap! Do the math: drop Train B exactly on the 42nd beat.",
        details: "Focus: Precision cueing on a specific beat (Beat 42)."
      },
      6: {
        title: "The Transition",
        desc: "The critical moment. Drop Train B's intro exactly when Train A's outro hits.",
        details: "Focus: Musical phrasing and anticipation."
      },
      7: {
        title: "Blind Chief",
        desc: "BPM readouts are gone. Sync the trains by sight and sound alone.",
        details: "Focus: Mixing without relying on the digits."
      },
      8: {
        title: "The Purist",
        desc: "No BPM, NO NUDGING allowed. Lock it all in with the pitch fader like a true vinyl head.",
        details: "Focus: Absolute mastery of the deck."
      }
    },
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
    loading: "Loading vibes...",
    running: "Rolling...",
    startTrainA: "Start Deck A",
    trainB: "Deck B",
    play: "Drop",
    cue: "CUE",
    slowDown: "Drag",
    speedUp: "Push"
  },
  cinematic: {
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
  coachTips: {
    LEVEL_1: [
      "Yo rookie, let's start with the basics, just a fat kick drum! I already matched the tempo for you, your turn!",
      "Wait for wagon A to hit the red line before dropping Train B.",
      "If you didn't drop it exactly on time, no stress. Just use the Push and Drag buttons to nudge it into the pocket."
    ],
    LEVEL_2: [
      "Same deal, drop Train B on the one.",
      "Not working? Yeah, Train B is at the wrong tempo, I won't always be here to hold your hand.",
      "Ride the Pitch fader to slow it down or speed it up. Hit CUE if you need to pull it back to the start.",
      "PRO TIP: Save yourself a headache—match your BPM before you drop Train B, so you don't end up trainwrecking."
    ],
    LEVEL_3: [
      "Okay, kicks are cool, but let's step it up to a real track. You see how the groove falls into place?",
      "Basically, you usually have a crispy snare or clap on the 2nd beat, that's your anchor!",
      "When you sync the two trains, make sure those snares hit at the exact same moment on both decks.",
      "Try dropping them totally off-beat on purpose just to hear how bad it sounds.",
      "Use 'Drag' or 'Push' to fix those tiny drifts."
    ],
    LEVEL_4: [
      "Alright, now we're looking at the bigger picture. In dance music, we usually count in phrases of 8 beats.",
      "Drop the track at the start of a loop, count to 8, and drop Train B right in the pocket."
    ],
    LEVEL_5: [
      "This one is sneaky. Your B2B partner just dropped a track with an endlessly long break.",
      "No sweat, we'll mix it anyway. Just set your cue point on the second beat instead of the first, it gives you a split second to react.",
      "Make sure you wait exactly one beat before launching your track, or you'll be horribly out of phase.",
      "Your turn—launch your track precisely when Train A drops."
    ],
    LEVEL_6: [
      "Time to think even bigger: musical phrasing. Most tracks are structured into distinct sections, each with a different vibe and purpose.",
      "Electronic tracks are literally produced to be mixed. They have designated \"mix-in\" and \"mix-out\" zones.",
      "Dropping Train B's intro right when Train A starts its outro is the classic safety transition. Rarely sounds bad.",
      "Get ready, Train A is about to finish. You need to drop Train B right on the money."
    ],
    LEVEL_7: [
      "Thought you had a lot of time on your hands last level?",
      "Yeah, because you had training wheels on! Everything was lined up waiting for the outro.",
      "No training wheels here. You have to trust your ears to set the tempo, and you have to do it during the breakdown.",
      "Start hitting CUE repeatedly while adjusting the pitch to test the waters.",
      "If it drifts apart instantly, your pitch is way off.",
      "You can still use the nudge buttons. If you constantly have to push it forward, it means your pitch is too slow!"
    ],
    LEVEL_8: [
      "This is it. No magic buttons, just you and the turntable.",
      "Use the pitch fader ONLY. If it's lagging, push the pitch way up for a second so it catches up, then pull it back to the right tempo.",
      "You're essentially 'riding the pitch' in waves to fix the phase.",
      "Basically, the pitch fader replaces the nudge buttons. Imagine touching the vinyl or the platter is strictly forbidden."
    ]
  },
  levelDesc: {
    1: "Both trains are rolling at the same speed. Drop Train B on time, and use Push/Drag if you need to adjust.",
    2: "Train B is playing at a different fixed tempo. Ride the pitch to match Train A perfectly!",
    3: "No more naked kick drums! Discover how a <strong>real groove</strong> is structured. Listen for the snare on the second beat!",
    4: "Sync the <strong>loops</strong> AND the <strong>wagons</strong>! Note: you must now launch on the 1st beat of a loop (beat 1, 9, 17, 25...).",
    5: "Start on the <strong>Clap</strong>! Do the math: you need to drop Train B exactly on the <strong>162nd beat</strong> (right after the drop). Note: Train B's CUE is on the 2nd beat!",
    6: "Drop Train B's <strong>Intro 🌅</strong> exactly over Train A's <strong>Outro 🌙</strong>!",
    7: "Ultimate Test. <strong>The BPM display is hidden.</strong> Beatmatch by sight and ear alone!",
    8: "Total Mastery. <strong>No BPM display, NO NUDGING.</strong> Lock the tempos using only Play/CUE and Pitch!"
  },
  successMessages: {
    LEVEL_1: "Incredible drop! You hit it right on the money. The rhythm is in your blood!",
    LEVEL_2: "Pitch master! Two different tempos and you locked them in. True pro vibes!",
    LEVEL_3: "Perfect pitch! Mixing blind and you still nailed it. That's crazy impressive!",
    LEVEL_4: "King of the kick! Those loops are perfectly locked, the floor is going wild!",
    LEVEL_5: "The Clap Master! You handled that offset drop like a boss. Patrick is proud!",
    LEVEL_6: "Butter smooth! That transition was magical, you couldn't even see the seams!",
    LEVEL_7: "Mixing blind! Pure instinct. That's the real magic of DJing!",
    LEVEL_8: "DJ MASTER STATUS! Absolute deck control, nothing can stop you. Ready for the main stage?"
  }
};

export default en;
