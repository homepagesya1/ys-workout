// ─────────────────────────────────────────────────────────────
// NEUE ANLEITUNG HINZUFÜGEN:
// 1. Erstelle einen neuen Ordner unter app/help/guides/<name>/
// 2. Füge dort eine _meta.ts und page.tsx hinzu
// 3. Importiere die meta hier und füge sie zum Array hinzu — das war's.
// ─────────────────────────────────────────────────────────────

import { meta as installApp } from './guides/install-app/_meta'
// import { meta as neueAnleitung } from './guides/neue-anleitung/_meta'  ← Beispiel

export const registry = [
  installApp,
  // neueAnleitung,  ← hier eintragen
]