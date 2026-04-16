import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level3 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_3"
      trackConfig={TRACK_CONFIG.LEVEL_3}
      title="Niveau 3 : Le Rythme Musical"
      description="Fini le kick drum tout seul ! Découvre comment le rythme s'organise dans un <strong>vrai morceau</strong>. Repère la caisse claire (Snare) sur le deuxième temps !"
      viewType="simple"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      forceComplexWagons={true}
      coachTips={COACH_TIPS.LEVEL_3}
    />
  );
};

export default Level3;
