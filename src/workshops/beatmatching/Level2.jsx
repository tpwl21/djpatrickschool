import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level2 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_2"
      trackConfig={TRACK_CONFIG.LEVEL_2}
      title="Niveau 2 : Le Défi du Tempo"
      description="Le Train B roule à une vitesse fixe différente. Ajuste sa vitesse pour qu'elle corresponde parfaitement au Train A !"
      viewType="simple"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      coachTips={COACH_TIPS.LEVEL_2}
    />
  );
};

export default Level2;
