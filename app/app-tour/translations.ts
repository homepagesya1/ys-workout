export type Lang = 'de' | 'en'

export interface AppTourTranslations {
  pageTitle: string
  back: string
  sections: {
    routines: { tag: string; title: string; body: string }
    liveSession: { tag: string; title: string; body: string }
    records: { tag: string; title: string; body: string }
    logbook: { tag: string; title: string; body: string }
    install: { tag: string; title: string; body: string }
  }
  cta: { title: string; button: string }
}

export const translations: Record<Lang, AppTourTranslations> = {
  de: {
    pageTitle: 'App entdecken',
    back: '← Zurück',
    sections: {
      routines: {
        tag: 'Trainingspläne',
        title: 'Dein Plan, immer griffbereit',
        body: 'Erstelle eigene Trainingspläne mit beliebig vielen Übungen und starte jede Session mit einem Tipp. Alles ist in Sekunden abrufbar — auch mitten im Gym.',
      },
      liveSession: {
        tag: 'Live Tracking',
        title: 'Jeder Satz zählt',
        body: 'Tippe Wiederholungen und Gewicht direkt während des Trainings ein — alles wird automatisch gespeichert. Kein Zettel, kein Vergessen.',
      },
      records: {
        tag: 'Bestleistungen',
        title: 'Neue Records, automatisch erkannt',
        body: 'Nach jeder Session prüft die App, ob du einen neuen Persönlichen Rekord aufgestellt hast — und markiert ihn sofort. Motivation pur aus deinen eigenen Zahlen.',
      },
      logbook: {
        tag: 'Logbuch',
        title: 'Dein Trainingsprotokoll',
        body: 'Alle abgeschlossenen Sessions auf einen Blick. Sieh, wie sich deine Gewichte und Wiederholungen über Wochen entwickeln.',
      },
      install: {
        tag: 'App installieren',
        title: 'Direkt auf den Homescreen',
        body: 'Kein App Store, kein Download. Öffne die App in Safari oder Chrome und füge sie in Sekunden zum Homescreen hinzu — funktioniert auf iPhone und Android.',
      },
    },
    cta: {
      title: 'Bereit loszulegen?',
      button: 'Kostenlos starten →',
    },
  },
  en: {
    pageTitle: 'Discover the App',
    back: '← Back',
    sections: {
      routines: {
        tag: 'Training Plans',
        title: 'Your plan, always at hand',
        body: 'Build custom training plans with as many exercises as you like and start any session in one tap. Everything is accessible in seconds — even mid-workout.',
      },
      liveSession: {
        tag: 'Live Tracking',
        title: 'Every set counts',
        body: 'Log reps and weight as you train — everything saves automatically. No paper, no forgetting.',
      },
      records: {
        tag: 'Personal Records',
        title: 'New records, auto-detected',
        body: 'After every session the app checks whether you hit a new personal record — and highlights it right away. Pure motivation from your own numbers.',
      },
      logbook: {
        tag: 'Log Book',
        title: 'Your workout history',
        body: 'All completed sessions at a glance. See how your weights and reps develop over weeks.',
      },
      install: {
        tag: 'Install App',
        title: 'Add to your home screen',
        body: 'No App Store, no download. Open the app in Safari or Chrome and add it to your home screen in seconds — works on iPhone and Android.',
      },
    },
    cta: {
      title: 'Ready to get started?',
      button: 'Start for free →',
    },
  },
}
