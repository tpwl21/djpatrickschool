import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level1 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel
      {...props}
      levelId="LEVEL_1"
      trackConfig={TRACK_CONFIG.LEVEL_1}
      title={`${t('home.popup.level')} 1 : ${t('home.workshops')[1].title}`}
      description={t('levelDesc')[1]}
      viewType="simple"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      coachTips={t('coachTips').LEVEL_1}
    />
  );
};

export default Level1;
