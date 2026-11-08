import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { parse } from 'smol-toml'

// Leçons : `import x from '.../lesson.toml?meta'` ne renvoie que les métadonnées (id, ordre, titres,
// descriptions FR/EN), calculées à la build. Le contenu complet (pages, quiz) est chargé à la demande
// via `?raw` quand on ouvre la leçon → l'accueil n'embarque plus ~1 Mo de texte de leçons.
function lessonMeta() {
  return {
    name: 'lesson-meta',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith('.toml?meta')) return null
      const file = id.slice(0, -'?meta'.length)
      this.addWatchFile(file)
      const data = parse(fs.readFileSync(file, 'utf8'))
      const pick = (l) => l && { title: l.title, short_desc: l.short_desc, description: l.description }
      return `export default ${JSON.stringify({ id: data.id, order: data.order, en: pick(data.en), fr: pick(data.fr) })}`
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/djpatrickschool/',
  plugins: [lessonMeta(), react()],
  server: {
    host: true,
    port: 5173,
  }
})
