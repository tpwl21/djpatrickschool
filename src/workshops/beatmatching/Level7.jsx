import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COMPATIBLE_PHRASE_PAIRS } from '../../utils/workshopUtils';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level7 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_7"
      trackConfig={TRACK_CONFIG.LEVEL_7}
      title={`${t('home.popup.level')} 7 : ${t('home.workshops')[7].title}`}
      description={t('levelDesc')[7]}
      viewType="phrase"
      showBpm={false}
      randomizeBpm={true}
      allowNudge={true}
      compatiblePhrases={COMPATIBLE_PHRASE_PAIRS}
      coachTips={t('coachTips').LEVEL_7}
    />
  );
};

export default Level7;
