import React, { useContext } from 'react';
import WorkshopLevel from '../WorkshopLevel';
import { TRACK_CONFIG } from '../../constants/tracks';
import { COMPATIBLE_PHRASE_PAIRS } from '../../utils/workshopUtils';
import { LanguageContext } from '../../hooks/LanguageContext';

const Level8 = (props) => {
  const { t } = useContext(LanguageContext);
  return (
    <WorkshopLevel 
      {...props}
      levelId="LEVEL_8"
      trackConfig={TRACK_CONFIG.LEVEL_8}
      title={`${t('home.popup.level')} 8 : ${t('home.workshops')[8].title}`}
      description={t('levelDesc')[8]}
      viewType="phrase"
      showBpm={false}
      randomizeBpm={true}
      allowNudge={false}
      isBlindMode={true}
      compatiblePhrases={COMPATIBLE_PHRASE_PAIRS}
      coachTips={t('coachTips').LEVEL_8}
    />
  );
};

export default Level8;
