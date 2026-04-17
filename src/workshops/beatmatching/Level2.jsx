import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level2 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_2"
      trackConfig={TRACK_CONFIG.LEVEL_2}
      title={`${t('home.popup.level')} 2 : ${t('home.workshops')[2].title}`}
      description={t('levelDesc')[2]}
      viewType="simple"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      coachTips={t('coachTips').LEVEL_2}
    />
  );
};

export default Level2;
