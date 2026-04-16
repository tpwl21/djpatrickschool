import React from 'react';
import WorkshopLevel from './WorkshopLevel';
import { TRACK_CONFIG } from '../constants/tracks';
import { COACH_TIPS } from '../constants/coachPatrick';

const Level3 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      trackConfig={TRACK_CONFIG.LEVEL_3}
      title="Niveau 3 : L'Oreille d'Or"
      description="Le Train B roule à une vitesse inconnue. Écoute et observe les wagons pour trouver la bonne vitesse sans aide numérique !"
      viewType="simple"
      showBpm={false}
      randomizeBpm={true}
      allowNudge={true}
      coachTips={COACH_TIPS.LEVEL_3}
    />
  );
};

export default Level3;
