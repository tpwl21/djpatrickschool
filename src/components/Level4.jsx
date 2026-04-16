import React from 'react';
import WorkshopLevel from './WorkshopLevel';
import { TRACK_CONFIG } from '../constants/tracks';
import { COACH_TIPS } from '../constants/coachPatrick';

const Level4 = (props) => {
  return (
    <WorkshopLevel 
      {...props}
      trackConfig={TRACK_CONFIG.LEVEL_4}
      title="Niveau 4 : La Boucle 🔄"
      description="Aligne les <strong>boucles</strong> ET les <strong>wagons</strong> pour que les Kicks 🔥 de chaque section tombent ensemble !"
      viewType="loop"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      coachTips={COACH_TIPS.LEVEL_4}
    />
  );
};

export default Level4;
