import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COMPATIBLE_PHRASE_PAIRS } from '../../utils/workshopUtils';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level6 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_6"
      trackConfig={TRACK_CONFIG.LEVEL_6}
      title="Niveau 6 : Blind Chief 🌑"
      description="Expertise Ultime. <strong>L'affichage du BPM a disparu.</strong> Aligne les trains visuellement et aux oreilles !"
      viewType="phrase"
      showBpm={false}
      randomizeBpm={true}
      allowNudge={true}
      compatiblePhrases={COMPATIBLE_PHRASE_PAIRS}
      coachTips={COACH_TIPS.LEVEL_6}
    />
  );
};

export default Level6;
