import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level4 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel
      {...props}
      levelId="LEVEL_4"
      trackConfig={TRACK_CONFIG.LEVEL_4}
      title={`${t('home.popup.level')} 4 : ${t('home.workshops')[4].title}`}
      description={t('levelDesc')[4]}
      viewType="loop"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      coachTips={t('coachTips').LEVEL_4}
    />
  );
};

export default Level4;
