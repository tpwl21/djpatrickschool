import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COMPATIBLE_PHRASE_PAIRS } from '../../utils/workshopUtils';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level7 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_7"
      trackConfig={TRACK_CONFIG.LEVEL_7}
      title="Niveau 7 : Le Puriste"
      description="Expertise Totale. <strong>Pas de BPM, et surtout PAS DE NUDGE.</strong> Aligne tes trains uniquement avec le Play/CUE et le Pitch !"
      viewType="phrase"
      showBpm={false}
      randomizeBpm={true}
      allowNudge={false}
      isBlindMode={true}
      compatiblePhrases={COMPATIBLE_PHRASE_PAIRS}
      coachTips={COACH_TIPS.LEVEL_7}
    />
  );
};

export default Level7;
