import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level5 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel
      {...props}
      levelId="LEVEL_5"
      trackConfig={TRACK_CONFIG.LEVEL_5}
      title={`${t('home.popup.level')} 5 : ${t('home.workshops')[5].title}`}
      description={t('levelDesc')[5]}
      viewType="loop"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      startPositionBBeats={2}
      markersA={[{ beat: 162, label: "DROP CLAP 👏", color: "#f1c40f" }]}
      coachTips={t('coachTips').LEVEL_5}
    />
  );
};

export default Level5;
