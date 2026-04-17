import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level6 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_6"
      trackConfig={TRACK_CONFIG.LEVEL_6}
      title={`${t('home.popup.level')} 6 : ${t('home.workshops')[6].title}`}
      description={t('levelDesc')[6]}
      viewType="phrase"
      showBpm={true}
      randomizeBpm={false}
      allowNudge={true}
      compatiblePhrases={null}
      coachTips={t('coachTips').LEVEL_6}
    />
  );
};

export default Level6;
