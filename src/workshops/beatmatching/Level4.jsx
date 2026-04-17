import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level4 = (props) => {
  return (
    <WorkshopLevel
      {...props}
      levelId="LEVEL_4"
      trackConfig={TRACK_CONFIG.LEVEL_4}
      title="Niveau 4 : La Boucle 🔄"
      description="Aligne les <strong>boucles</strong> ET les <strong>wagons</strong> ! Attention, tu dois maintenant démarrer sur un début de boucle (temps 1, 9, 17, 25...)."
      viewType="loop"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      coachTips={COACH_TIPS.LEVEL_4}
    />
  );
};

export default Level4;
