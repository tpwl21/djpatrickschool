const REQUIRED_LEVEL = ['id', 'order'];
const REQUIRED_WORKSHOP = ['id'];

export function validateLevel(level, path) {
  for (const key of REQUIRED_LEVEL) {
    if (level[key] == null) {
      throw new Error(`[level config] missing "${key}" in ${path}`);
    }
  }
  if (!level.en?.title && !level.fr?.title) {
    throw new Error(`[level config] en.title or fr.title required in ${path}`);
  }
}

export function validateWorkshop(workshop, path) {
  for (const key of REQUIRED_WORKSHOP) {
    if (workshop[key] == null) {
      throw new Error(`[workshop config] missing "${key}" in ${path}`);
    }
  }
  if (!workshop.en?.title && !workshop.fr?.title) {
    throw new Error(`[workshop config] en.title or fr.title required in ${path}`);
  }
}

export function t(localized, lang = 'fr') {
  if (localized == null) return '';
  if (typeof localized === 'string') return localized;
  return localized[lang] ?? localized.en ?? localized.fr ?? '';
}
