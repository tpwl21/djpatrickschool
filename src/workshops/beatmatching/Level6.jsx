import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level6 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_6"
      trackConfig={TRACK_CONFIG.LEVEL_6}
      title="Niveau 6 : La Transition 🎧"
      description="Démarre l'<strong>Intro 🌅</strong> du Train B sur l'<strong>Outro 🌙</strong> du Train A !"
      viewType="phrase"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      compatiblePhrases={null} // Uses default L6 behavior (Outro->Intro)
      coachTips={COACH_TIPS.LEVEL_6}
    />
  );
};

export default Level6;
