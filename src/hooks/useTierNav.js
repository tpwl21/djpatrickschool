import { createContext, useContext } from 'react';

// Fourni par App pendant une leçon ou un niveau : paliers ouverts pour cet atelier + changement de palier.
// null ailleurs (le sélecteur reçoit alors ses props directement).
export const TierNavContext = createContext(null);
export const useTierNav = () => useContext(TierNavContext);
