import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export const useMobileDetection = (breakpoint = MOBILE_BREAKPOINT) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
};

// Écran bas (téléphone en paysage) : la hauteur, pas la largeur, est la contrainte
export const useShortViewport = (maxHeight = 500) => {
  const query = `(max-height: ${maxHeight}px)`;
  const [isShort, setIsShort] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsShort(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return isShort;
};
