import { useEffect } from 'react';

const SITE = 'DJ Patrick School';

// Titre d'onglet par page : « Nom de la page · DJ Patrick School » (accueil : nom du site seul)
export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title]);
};
