import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level3 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_3"
      trackConfig={TRACK_CONFIG.LEVEL_3}
      title={`${t('home.popup.level')} 3 : ${t('home.workshops')[3].title}`}
      description={t('levelDesc')[3]}
      viewType="simple"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      forceComplexWagons={true}
      coachTips={t('coachTips').LEVEL_3}
    />
  );
};

export default Level3;
