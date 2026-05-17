export type Lang = 'de' | 'en'

export interface PTTranslations {
  back: string
  hero: { title: string; subtitle: string; cta: string }
  sections: {
    clients: { tag: string; title: string; body: string }
    planBuilder: { tag: string; title: string; body: string }
    templates: { tag: string; title: string; body: string }
    logbook: { tag: string; title: string; body: string }
    clientPlans: { tag: string; title: string; body: string }
    clientSession: { tag: string; title: string; body: string }
  }
  cta: { title: string; subtitle: string; button: string }
  contact: { title: string; body: string; button: string }
}

export const translations: Record<Lang, PTTranslations> = {
  de: {
    back: '← Zurück',
    hero: {
      title: 'Trainiere deine Kunden — digital, strukturiert, professionell.',
      subtitle: 'YS.Workout gibt dir als Trainer alles, was du brauchst: Pläne erstellen, teilen und den Fortschritt deiner Kunden live verfolgen.',
      cta: 'Kostenlos starten →',
    },
    sections: {
      clients: {
        tag: 'Meine Klienten',
        title: 'Alle Kunden, ein Dashboard',
        body: 'Füge Kunden per E-Mail hinzu, sieh ihren Status auf einen Blick und greife direkt auf Pläne und Logbuch zu.',
      },
      planBuilder: {
        tag: 'Plan Builder',
        title: 'Pläne erstellen & direkt teilen',
        body: 'Erstelle massgeschneiderte Trainingspläne pro Kunde, organisiere sie in Ordnern und teile sie mit einem einzigen Klick.',
      },
      templates: {
        tag: 'Vorlagen',
        title: 'Einmal erstellen, überall einsetzen',
        body: 'Baue Vorlagenpläne und füge sie mit einem Tipp in den Ordner eines beliebigen Kunden ein — spart enorm viel Zeit.',
      },
      logbook: {
        tag: 'Kunden-Logbuch',
        title: 'Sieh genau, was dein Kunde trainiert',
        body: 'Vollständige Session-Historie pro Kunde — jede Übung, jedes Gewicht, jede Wiederholung auf einen Blick.',
      },
      clientPlans: {
        tag: 'Kunden-Ansicht',
        title: 'Dein Kunde sieht genau seinen Plan',
        body: 'Deine Kunden sehen nur die Pläne, die du mit ihnen geteilt hast — übersichtlich sortiert und sofort startbereit.',
      },
      clientSession: {
        tag: 'Live Session',
        title: 'Dein Plan, ihr Training',
        body: 'Der Kunde trainiert deinen Plan Übung für Übung — mit Timer, Satz-Tracking und allem, was eine gute Session braucht.',
      },
    },
    cta: {
      title: 'Bereit, professionell zu trainieren?',
      subtitle: 'Kostenlos registrieren — kein Abo, keine Kreditkarte.',
      button: 'Jetzt starten →',
    },
    contact: {
      title: 'Du bist Personal Trainer?',
      body: 'Schreib mir — ich helfe dir beim Einrichten der Trainer-Funktion und bei allem, was du brauchst, um deine Kunden direkt über die App zu betreuen.',
      button: 'Kontakt aufnehmen →',
    },
  },
  en: {
    back: '← Back',
    hero: {
      title: 'Coach your clients — digital, structured, professional.',
      subtitle: 'YS.Workout gives you everything you need as a trainer: build plans, share them, and track your clients\' progress in real time.',
      cta: 'Get started for free →',
    },
    sections: {
      clients: {
        tag: 'My Clients',
        title: 'All clients, one dashboard',
        body: 'Add clients by email, see their status at a glance, and access plans and logbook in one tap.',
      },
      planBuilder: {
        tag: 'Plan Builder',
        title: 'Build plans & share instantly',
        body: 'Create tailored training plans per client, organise them in folders, and share with a single click.',
      },
      templates: {
        tag: 'Templates',
        title: 'Create once, use everywhere',
        body: 'Build template plans and insert them into any client\'s folder in one tap — saves enormous time.',
      },
      logbook: {
        tag: 'Client Logbook',
        title: 'See exactly what your client trained',
        body: 'Complete session history per client — every exercise, every weight, every rep at a glance.',
      },
      clientPlans: {
        tag: 'Client View',
        title: 'Your client sees exactly their plan',
        body: 'Clients only see the plans you\'ve shared with them — cleanly organised and ready to start.',
      },
      clientSession: {
        tag: 'Live Session',
        title: 'Your plan, their workout',
        body: 'The client trains through your plan exercise by exercise — with timer, set tracking, and everything a great session needs.',
      },
    },
    cta: {
      title: 'Ready to coach professionally?',
      subtitle: 'Sign up for free — no subscription, no credit card.',
      button: 'Get started →',
    },
    contact: {
      title: 'Are you a personal trainer?',
      body: 'Get in touch — I\'ll help you set up the trainer feature and get you started coaching your clients directly through the app.',
      button: 'Contact me →',
    },
  },
}
