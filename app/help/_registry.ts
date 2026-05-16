// ─────────────────────────────────────────────────────────────
// NEUE ANLEITUNG HINZUFÜGEN:
// 1. Erstelle einen neuen Ordner unter app/help/guides/<name>/
// 2. Füge dort eine _meta.ts und page.tsx hinzu
// 3. Importiere die meta hier und füge sie zum Array hinzu — das war's.
// ─────────────────────────────────────────────────────────────

import { meta as installApp } from './guides/install-app/_meta'
import type { Translations } from '@/lib/translations'

// import { meta as neueAnleitung } from './guides/neue-anleitung/_meta'  ← Beispiel

export function getRegistry(tr: Translations) {
  return [
    { ...installApp, title: tr.install.title, description: tr.install.description },
    // { ...neueAnleitung, title: tr.<section>.title, description: tr.<section>.description },
  ]
}
