import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level1 = (props) => {
  return (
    <WorkshopLevel
      {...props}
      levelId="LEVEL_1"
      trackConfig={TRACK_CONFIG.LEVEL_1}
      title="Niveau 1 : Le Lancement Parfait"
      description="Les deux trains roulent à la même vitesse. Lance le Train B au bon moment, et utilise les boutons Accélérer et Ralentir pour ajuster sa vitesse si besoin."
      viewType="simple"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      coachTips={COACH_TIPS.LEVEL_1}
    />
  );
};

export default Level1;
