import React from 'react';
import WorkshopLevel from './WorkshopLevel';
import { TRACK_CONFIG } from '../constants/tracks';
import { COACH_TIPS } from '../constants/coachPatrick';

const Level5 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      trackConfig={TRACK_CONFIG.LEVEL_5}
      title="Niveau 5 : La Transition 🎧"
      description="Démarre l'<strong>Intro 🌅</strong> du Train B sur l'<strong>Outro 🌙</strong> du Train A !"
      viewType="phrase"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      compatiblePhrases={null} // Uses default L5 behavior (Outro->Intro)
      coachTips={COACH_TIPS.LEVEL_5}
    />
  );
};

export default Level5;
