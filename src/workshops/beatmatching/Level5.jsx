import React from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COACH_TIPS } from '../../constants/coachPatrick';

const Level5 = (props) => {
  return (
    <WorkshopLevel
      {...props}
      levelId="LEVEL_5"
      trackConfig={TRACK_CONFIG.LEVEL_5}
      title="Niveau 5 : Le Clap 👏"
      description="Démarre sur le <strong>Clap</strong> ! Calcule bien : tu dois lancer le Train B pile au <strong>162ème temps</strong> (juste après le drop). Attention, ton Train B démarre déjà sur son second temps !"
      viewType="loop"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      allowNudge={true}
      startPositionBBeats={2}
      markersA={[{ beat: 162, label: "DROP CLAP 👏", color: "#f1c40f" }]}
      coachTips={COACH_TIPS.LEVEL_5}
    />
  );
};

export default Level5;
