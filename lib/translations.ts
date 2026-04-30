// lib/translations.ts

export type Lang = 'de' | 'en'

// Typed interface — avoids the literal-type clash that 'as const' would cause
// between typeof t['de'] and typeof t['en'] in LanguageContext.
export interface Translations {
  nav: {
    home: string
    help: string
    forum: string
    contact: string
    login: string
    register: string
  }
  beta: string
  hero: {
    title1: string
    title2: string
    subtitle: string
    cta: string
    login: string
    badge1: string
    badge2: string
    badge3: string
  }
  features: {
    f1: { tag: string; title: string; body: string }
    f2: { tag: string; title: string; body: string }
    f3: { tag: string; title: string; body: string }
    f4: { tag: string; title: string; body: string }
  }
  pricing: {
    title1: string
    title2: string
    subtitle: string
    free: { title: string; body: string; cta: string }
    support: { title: string; body: string; cta: string }
    soon: {
      title: string
      body: string
      price: string
      suffix: string
      unavailable: string
    }
  }
  cta: { title: string; subtitle: string; button: string }
  footer: { madeBy: string }
  help: { title: string; subtitle: string; back: string }
  install: {
    back: string
    ios: { label: string; steps: { title: string; description: string }[] }
    android: { label: string; steps: { title: string; description: string }[] }
  }
  contact: {
    back: string
    title: string
    subtitle: string
    emailLabel: string
    emailPlaceholder: string
    nameLabel: string
    namePlaceholder: string
    messageLabel: string
    messagePlaceholder: string
    submit: string
    sending: string
    successTitle: string
    successBody: string
    successAgain: string
    errorMsg: string
  }
}

export const t: Record<Lang, Translations> = {
  de: {
    nav: {
      home: 'Home',
      help: 'Help',
      forum: 'Forum',
      contact: 'Kontakt',
      login: 'Login',
      register: 'Registrieren',
    },
    beta: 'Aktuell in der Beta-Phase — kostenlos testen, Feedback willkommen',
    hero: {
      title1: 'Dein Training.',
      title2: 'Dein Fortschritt.',
      subtitle: 'Halte jede Übung, jedes Gewicht und jeden Satz direkt auf dem Handy fest — und sieh mit der Zeit, wie viel stärker du wirst.',
      cta: 'Kostenlos starten →',
      login: 'Login',
      badge1: 'Jetzt gratis',
      badge2: 'Kein App-Download nötig',
      badge3: 'Kein Abo erforderlich',
    },
    features: {
      f1: { tag: 'Trainingsplan', title: 'Dein Plan, immer griffbereit', body: 'Erstelle deine eigenen Trainingspläne mit beliebig vielen Übungen. Ob Brust, Rücken oder Beine — du entscheidest, was wann trainiert wird. Alles ist in Sekunden abrufbar, auch mitten im Gym.' },
      f2: { tag: 'Live Tracking', title: 'Jeder Satz zählt', body: "Während du trainierst, tippst du einfach ein wie viele Wiederholungen du gemacht hast und mit welchem Gewicht. Das war's. Kein Zettel, kein Vergessen — alles wird automatisch gespeichert." },
      f3: { tag: 'Statistiken', title: 'Sieh, wie du stärker wirst', body: 'Nach jedem Training siehst du, ob du mehr geschafft hast als letzte Woche. Neue Bestleistungen werden automatisch erkannt und markiert. Motivation pur — direkt aus deinen eigenen Zahlen.' },
      f4: { tag: 'Kein App Store nötig', title: 'Direkt auf den Homescreen', body: 'Du musst nichts herunterladen oder installieren. Öffne die App einmal im Browser, füge sie deinem Homescreen hinzu — und schon verhält sie sich wie eine normale App. Funktioniert auf iPhone und Android.' },
    },
    pricing: {
      title1: 'Jetzt gratis.',
      title2: 'Immer fair.',
      subtitle: 'Während der Beta-Phase ist YS.Workout vollständig kostenlos. Später wird es ein günstiges Abo geben.',
      free: { title: 'Jetzt: Gratis', body: 'Die App ist aktuell komplett kostenlos nutzbar. Keine Kreditkarte, kein Abo, kein Haken. Einfach registrieren und loslegen.', cta: 'Jetzt kostenlos starten' },
      support: { title: 'Unterstützen', body: 'Die App kostet Geld zu betreiben und weiterzuentwickeln. Wer möchte, kann freiwillig etwas beitragen — jeder Betrag hilft, neue Features zu bauen und eines Tages echte iOS & Android Apps herauszubringen.', cta: 'Spenden (freiwillig) →' },
      soon: { title: 'Bald: Abo', body: 'In Zukunft wird YS.Workout ein kleines monatliches Abo erfordern. Geplant ist unter', price: '1 CHF / 1 Euro pro Monat', suffix: '. Wer früh dabei ist, profitiert von den besten Konditionen.', unavailable: 'Noch nicht verfügbar' },
    },
    cta: { title: 'Bereit, dein Training ernstzunehmen?', subtitle: 'Registriere dich jetzt gratis — keine Kreditkarte, kein Abo, kein Risiko.', button: 'Account erstellen — kostenlos' },
    footer: { madeBy: 'Made by' },
    help: { title: 'Hilfe', subtitle: 'YS.Workout — Anleitungen & Tipps', back: '← Zurück' },
    install: {
      back: '← Zurück zur Hilfe',
      ios: {
        label: '🍎 iPhone (iOS)',
        steps: [
          { title: 'Safari öffnen', description: 'Öffne Safari auf deinem iPhone. Wichtig: Es muss Safari sein — Chrome und andere Browser unterstützen diese Funktion auf iOS nicht.' },
          { title: 'Webseite aufrufen', description: 'Gehe auf workout.yannicksalm.ch.' },
          { title: 'Teilen-Symbol antippen', description: 'Tippe auf das Teilen-Symbol ⬆ in der Mitte der unteren Safari-Leiste — das Symbol sieht aus wie ein Quadrat mit einem Pfeil nach oben.' },
          { title: '„Zum Home-Bildschirm" wählen', description: 'Scrolle im Menü nach unten und tippe auf „Zum Home-Bildschirm". Falls du es nicht siehst, scrolle noch etwas weiter.' },
          { title: 'Bestätigen', description: 'Tippe oben rechts auf „Hinzufügen". Du kannst den Namen davor noch anpassen.' },
          { title: 'Fertig ✅', description: 'Die App erscheint auf deinem Homescreen und verhält sich wie eine normale App — mit eigenem Icon, ohne Browser-Leiste.' },
        ],
      },
      android: {
        label: '🤖 Android',
        steps: [
          { title: 'Chrome öffnen', description: 'Öffne den Chrome Browser auf deinem Android-Gerät.' },
          { title: 'Webseite aufrufen', description: 'Gehe auf workout.yannicksalm.ch.' },
          { title: 'Menü öffnen', description: 'Tippe auf die drei Punkte ⋮ oben rechts in der Chrome-Leiste.' },
          { title: '„Zum Startbildschirm hinzufügen" wählen', description: 'Tippe auf „Zum Startbildschirm hinzufügen". Bei neueren Android-Versionen kann es auch „App installieren" heissen.' },
          { title: 'Bestätigen', description: 'Tippe auf „Hinzufügen" im erscheinenden Dialog.' },
          { title: 'Fertig ✅', description: 'Die App ist auf deinem Startbildschirm und öffnet sich wie eine normale App.' },
        ],
      },
    },
    contact: {
      back: '← Zurück',
      title: 'Kontakt',
      subtitle: 'Fragen, Feedback oder ein Bug gefunden? Schreib mir – ich melde mich so schnell wie möglich.',
      emailLabel: 'Deine E-Mail',
      emailPlaceholder: 'your@email.com',
      nameLabel: 'Name',
      namePlaceholder: 'Dein Name',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Erzähl mir gerne von deinem Anliegen?',
      submit: 'Nachricht senden',
      sending: 'Wird gesendet...',
      successTitle: 'Nachricht gesendet!',
      successBody: 'Danke – ich melde mich bald bei dir.',
      successAgain: 'Weitere Nachricht senden',
      errorMsg: 'Etwas ist schiefgelaufen. Bitte versuch es nochmal.',
    },
  },

  en: {
    nav: {
      home: 'Home',
      help: 'Help',
      forum: 'Forum',
      contact: 'Contact',
      login: 'Login',
      register: 'Sign up',
    },
    beta: 'Currently in beta — free to use, feedback welcome',
    hero: {
      title1: 'Your Workout.',
      title2: 'Your Progress.',
      subtitle: 'Log every exercise, weight, and set right from your phone — and watch yourself get stronger over time.',
      cta: 'Start for free →',
      login: 'Login',
      badge1: 'Free right now',
      badge2: 'No app download needed',
      badge3: 'No subscription required',
    },
    features: {
      f1: { tag: 'Training Plan', title: 'Your plan, always at hand', body: 'Create your own training plans with as many exercises as you like. Whether chest, back, or legs — you decide what gets trained when. Everything is accessible in seconds, even in the middle of the gym.' },
      f2: { tag: 'Live Tracking', title: 'Every set counts', body: "While you train, just tap in how many reps you did and with what weight. That's it. No paper, no forgetting — everything is saved automatically." },
      f3: { tag: 'Statistics', title: 'Watch yourself get stronger', body: 'After each workout you can see if you did more than last week. New personal records are automatically detected and highlighted. Pure motivation — straight from your own numbers.' },
      f4: { tag: 'No App Store needed', title: 'Add it to your home screen', body: "No download or installation needed. Open the app once in your browser, add it to your home screen — and it behaves just like a native app. Works on iPhone and Android." },
    },
    pricing: {
      title1: 'Free now.',
      title2: 'Always fair.',
      subtitle: 'During the beta phase, YS.Workout is completely free. A small subscription will be introduced later.',
      free: { title: 'Now: Free', body: 'The app is completely free to use right now. No credit card, no subscription, no catch. Just sign up and get started.', cta: 'Start for free' },
      support: { title: 'Support', body: 'Running and developing the app costs money. Anyone who wishes can contribute voluntarily — every amount helps build new features and eventually release real iOS & Android apps.', cta: 'Donate (optional) →' },
      soon: { title: 'Coming soon: Subscription', body: 'In the future, YS.Workout will require a small monthly subscription. The plan is under', price: '€1 / CHF 1 per month', suffix: '. Early adopters will get the best conditions.', unavailable: 'Not available yet' },
    },
    cta: { title: 'Ready to take your training seriously?', subtitle: 'Sign up for free — no credit card, no subscription, no risk.', button: 'Create account — free' },
    footer: { madeBy: 'Made by' },
    help: { title: 'Help', subtitle: 'YS.Workout — Guides & Tips', back: '← Back' },
    install: {
      back: '← Back to Help',
      ios: {
        label: '🍎 iPhone (iOS)',
        steps: [
          { title: 'Open Safari', description: "Open Safari on your iPhone. Important: It must be Safari — Chrome and other browsers do not support this feature on iOS." },
          { title: 'Visit the website', description: 'Go to workout.yannicksalm.ch.' },
          { title: 'Tap the Share icon', description: "Tap the Share icon ⬆ in the center of the bottom Safari bar — it looks like a square with an arrow pointing up." },
          { title: 'Select "Add to Home Screen"', description: "Scroll down in the menu and tap \"Add to Home Screen\". If you don't see it, scroll a bit further." },
          { title: 'Confirm', description: 'Tap "Add" in the top right. You can rename the app before confirming.' },
          { title: 'Done ✅', description: 'The app appears on your home screen and behaves like a native app — with its own icon and no browser bar.' },
        ],
      },
      android: {
        label: '🤖 Android',
        steps: [
          { title: 'Open Chrome', description: 'Open the Chrome browser on your Android device.' },
          { title: 'Visit the website', description: 'Go to workout.yannicksalm.ch.' },
          { title: 'Open the menu', description: 'Tap the three dots ⋮ in the top right of the Chrome bar.' },
          { title: 'Select "Add to Home screen"', description: 'Tap "Add to Home screen". On newer Android versions it may also say "Install app".' },
          { title: 'Confirm', description: 'Tap "Add" in the dialog that appears.' },
          { title: 'Done ✅', description: 'The app is on your home screen and opens like a native app.' },
        ],
      },
    },
    contact: {
      back: '← Back',
      title: 'Contact',
      subtitle: "Questions, feedback, or found a bug? Write to me — I'll get back to you as soon as possible.",
      emailLabel: 'Your email',
      emailPlaceholder: 'your@email.com',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell me about your request?',
      submit: 'Send message',
      sending: 'Sending...',
      successTitle: 'Message sent!',
      successBody: "Thanks — I'll get back to you soon.",
      successAgain: 'Send another message',
      errorMsg: 'Something went wrong. Please try again.',
    },
  },
}