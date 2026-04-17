const fr = {
  home: {
    welcome: "Bienvenue à l'école de DJing ! Choisis d'abord ta difficulté en haut à droite.",
    difficultyInfo: {
      EASY: "Parfait pour débuter. Tolérance généreuse, feedback visuel complet et maintien court (3s).",
      MEDIUM: "Le défi intermédiaire. Tolérance réduite, aucun indicateur visuel de précision. Maintien de 4s.",
      PRO: "Réservé aux experts. Tolérance millimétrée, aucun feedback visuel. Maintien de 5s exigé."
    },
    workshopsTitle: "ATELIERS DJ",
    soon: "Bientôt",
    categories: {
      beatmatching: {
        title: "BEATMATCHING",
        desc: "L'art d'aligner les tempos parfaits."
      },
      harmonies: {
        title: "HARMONIES",
        desc: "Le mix harmonique (Camelot wheel)."
      },
      eq: {
        title: "EQ",
        desc: "Maîtrise des fréquences et isolateurs."
      },
      effets: {
        title: "EFFETS",
        desc: "Delay, Reverb et Echo Out."
      },
      digging: {
        title: "DIGGING",
        desc: "Comment trouver les perles rares."
      }
    },
    workshops: {
      1: {
        title: "Lancement Parfait",
        desc: "Les deux trains roulent à la même vitesse. Lance le Train B au bon moment !",
        details: "Focus : Timing du bouton Play. Vitesse : 120 BPM."
      },
      2: {
        title: "Contrôle du Moteur",
        desc: "Le Train B roule à une vitesse différente. Ajuste-la pour qu'elle corresponde au Train A.",
        details: "Focus : Utilisation du Pitch. 120 vs 135 BPM."
      },
      3: {
        title: "Le Rythme Vrai",
        desc: "Fini le kick seul. Découvre comment le rythme s'organise dans un vrai morceau.",
        details: "Focus : Écoute de la Snare sur le 2ème temps."
      },
      4: {
        title: "La Boucle",
        desc: "Aligne les boucles ET les wagons pour que les temps forts se synchronisent.",
        details: "Focus : Calage structurel (8 temps)."
      },
      5: {
        title: "Le Clap Master",
        desc: "Démarre sur le Clap ! Calcule bien : tu dois lancer le Train B pile sur le 42ème temps.",
        details: "Focus : Précision du départ sur un temps spécifique (Beat 42)."
      },
      6: {
        title: "La Transition",
        desc: "Le moment critique. Démarre l'Intro du Train B exactement sur l'Outro du Train A.",
        details: "Focus : Phrasé musical et anticipation."
      },
      7: {
        title: "Blind Chief",
        desc: "L'affichage du BPM a disparu. Aligne les trains visuellement et à l'oreille.",
        details: "Focus : Indépendance vis-à-vis des chiffres."
      },
      8: {
        title: "Le Puriste",
        desc: "Pas de BPM, et surtout PAS DE NUDGE. Aligne tout au Pitch, comme un vrai.",
        details: "Focus : Maîtrise totale du plateau."
      }
    },
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
    menu: "Menu",
    status: {
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
    loading: "Chargement...",
    running: "En route...",
    startTrainA: "Démarrer Train A",
    trainB: "Train B",
    play: "Play",
    cue: "CUE",
    slowDown: "Ralentir",
    speedUp: "Accélérer"
  },
  cinematic: {
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
  coachTips: {
    LEVEL_1: [
      "Yoo nouvelle recrue, on commence la base, juste un bon vieux kick drum ! Je t'ai déjà réglé le bpm, à toi de jouer !",
      "Attends que le wagon A passe sur la ligne rouge pour lâcher le Train B.",
      "Si t'as pas lancé exactement au bon moment, c'est pas grave, tu peux ajuster avec les boutons Accélérer et Ralentir pour te caler au poil"
    ],
    LEVEL_2: [
      "Même chose, lance le train B au bon moment.",
      "Ça ne marche plus ? Et oui le train B ne roule pas à la bonne vitesse, je ne serai pas toujours là pour t'aider.",
      "Utilise le Pitch pour le ralentir ou l'accélérer. Tu peux aussi utiliser le bouton CUE pour revenir au début du morceau.",
      "PRO TIP : te casse pas la tête, règle ton bpm avant de lancer le train B, ça t'évitera de te perdre"
    ],
    LEVEL_3: [
      "Bon c'est bien gentil le kick drum, mais cette fois on passe à un vrai morceau, tu comprends comment le rythme s'organise ?",
      "En gros tu as très souvent un élément distinctif sur le deuxième temps de ta mesure, c'est ton repère !",
      "Quand tu alignes les deux trains tu veux que les deux éléments tombent en même temps pour chaque train",
      "Essaye de lancer les deux morceaux mais \"à l'envers\" pour te rendre compte",
      "Utilise 'Reculer' ou 'Avancer' pour corriger les petits décalages."
    ],
    LEVEL_4: [
      "Bon là on va commencer à s'intéresser à une subdivision du train un peu plus grande, en général pour la musique électronique on compte par 8",
      "Lance bien le train au début d'une boucle, compte jusqu'à 8 et lâche le train B au bon moment"
    ],
    LEVEL_5: [
      "Celle-là elle est fourbe. Ton pote de B2B t'as joué un morceau avec un break interminable",
      "Qu'a cela ne tienne, tu vas le caler quand même, tu place le cue non pas sur le premier temps mais sur le deuxieme pour te laisser le temps de réagir.",
      "Attention de bien laisser passer un temps avant de lancer ton morceau, sinon tu va être inversé cf Lvl3.",
      "Aller à toi de jouer, lance ton morceau au moment du drop du train A"
    ],
    LEVEL_6: [
      "Bon là on s'attaque à encore plus grand, les phrases musicales. Globalement tu peux souvent diviser tes morceaux en plusieurs moments distincts avec une fonction et un but différent",
      "Souvent en musique électronique les morceaux sont pensés par les producteurs pour être mixés, il y a donc des moments propices à la transition",
      "Lancer l'intro du train B au moment où le train A commence son outro est une idée basique de transition, c'est la sécurité ça va rarement sonner faux",
      "Tiens-toi prêt, le train A va bientôt finir son morceau, il faut que tu lances le train B au bon moment"
    ],
    LEVEL_7: [
      "Tu trouvais le temps long au niveau d'avant ?",
      "Et oui car tu avais l'assistance technique, tu avais tout de prêt en attendant l'outro.",
      "Ici pas d'assistance, tu dois te fier uniquement à tes oreilles pour régler la vitesse et tu as justement ce temps mort pour le faire.",
      "Commence à utiliser le CUE plusieurs fois sur le morceau à des bpm différents pour commencer à chercher.",
      "Plus ça se désynchronise rapidement plus tu es loin du bon réglage.",
      "Tu peux également utiliser les boutons accélérer et ralentir, tant que tu as besoin d'utiliser un des deux boutons c'est qu'il faut changer le bpm dans le sens opposé"
    ],
    LEVEL_8: [
      "Ici, c'est du sérieux. Pas de bouton magique, juste toi et le disque.",
      "Sers-toi du pitch uniquement, force un des trains à être plus rapide qu'il ne doit être, pour qu'il rattrape l'autre, ou dans l'autre sens",
      "Tu peux faire des vagues avec le pitch, c'est-à-dire accélérer puis ralentir, pour corriger les petits décalages.",
      "En gros le pitch remplace le bouton accélérer ou ralentir, c'est comme si tu n'avais pas le droit de toucher le vinyle ou ton jog"
    ]
  },
  levelDesc: {
    1: "Les deux trains roulent à la même vitesse. Lance le Train B au bon moment, et utilise les boutons Accélérer et Ralentir pour ajuster sa vitesse si besoin.",
    2: "Le Train B roule à une vitesse fixe différente. Ajuste sa vitesse pour qu'elle corresponde parfaitement au Train A !",
    3: "Fini le kick drum tout seul ! Découvre comment le rythme s'organise dans un <strong>vrai morceau</strong>. Repère la caisse claire (Snare) sur le deuxième temps !",
    4: "Aligne les <strong>boucles</strong> ET les <strong>wagons</strong> ! Attention, tu dois maintenant démarrer sur un début de boucle (temps 1, 9, 17, 25...).",
    5: "Démarre sur le <strong>Clap</strong> ! Calcule bien : tu dois lancer le Train B pile au <strong>162ème temps</strong> (juste après le drop). Attention, ton Train B démarre déjà sur son second temps !",
    6: "Démarre l'<strong>Intro 🌅</strong> du Train B sur l'<strong>Outro 🌙</strong> du Train A !",
    7: "Expertise Ultime. <strong>L'affichage du BPM a disparu.</strong> Aligne les trains visuellement et aux oreilles !",
    8: "Expertise Totale. <strong>Pas de BPM, et surtout PAS DE NUDGE.</strong> Aligne tes trains uniquement avec le Play/CUE et le Pitch !"
  },
  successMessages: {
    LEVEL_1: "Incroyable ! Tu as lancé le train pile au bon moment. Le rythme est dans tes gènes !",
    LEVEL_2: "Maître du pitch ! Tu as réussi à synchroniser deux vitesses différentes. Un vrai pro !",
    LEVEL_3: "L'oreille absolue ! Même sans voir le BPM, tu as trouvé le réglage parfait. Impressionnant !",
    LEVEL_4: "Le roi du kick ! Tes boucles sont parfaitement alignées, la foule est en délire !",
    LEVEL_5: "Le Clap Master ! Tu as géré le décalage de départ comme un chef. Patrick est fier !",
    LEVEL_6: "Quelle fluidité ! Ta transition entre les morceaux était magique. On ne voit plus la couture !",
    LEVEL_7: "À l'aveugle ! Tu maîtrises le mix à l'instinct. C'est ça, la vraie magie du DJing !",
    LEVEL_8: "DJ MASTER ! Le contrôle total, plus rien ne t'arrête. Prêt pour la scène ?"
  }
};

export default fr;
