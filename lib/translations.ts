// lib/translations.ts

export type Lang = 'de' | 'en'

// Typed interface — avoids the literal-type clash that 'as const' would cause
// between typeof t['de'] and typeof t['en'] in LanguageContext.
export interface Translations {
  nav: {
    home: string
    appTour: string
    personalTrainer: string
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
    f5: { tag: string; title: string; body: string }
    f6: { tag: string; title: string; body: string }
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
  footer: {
    madeBy: string
    impressum: string
    privacy: string
  }
  help: { title: string; subtitle: string; back: string }
  install: {
    title: string
    description: string
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
  cookies: {
    title: string
    body: string
    accept: string
    decline: string
    learnMore: string
  }
  impressum: {
    back: string
    title: string
    legalNote: string
    name: string
    country: string
    email: string
    emailLabel: string
    responsible: string
    responsibleName: string
  }
  privacy: {
    back: string
    title: string
    lastUpdated: string
    sections: {
      general: { title: string; body: string }
      hosting: { title: string; body: string }
      account: { title: string; body: string }
      localCache: { title: string; body: string }
      cookies: { title: string; body: string }
      analytics: { title: string; body: string }
      contact: { title: string; body: string }
      rights: { title: string; body: string }
    }
  }
  auth: {
    register: {
      title: string
      subtitle: string
      googleBtn: string
      orSeparator: string
      emailLabel: string
      passwordLabel: string
      passwordPlaceholder: string
      confirmLabel: string
      confirmPlaceholder: string
      submitBtn: string
      loading: string
      errorMismatch: string
      errorTooShort: string
      hasAccount: string
      loginLink: string
      emailSuccessTitle: string
      emailSuccessBody: string
      emailSuccessBtn: string
    }
    login: {
      subtitle: string
      googleBtn: string
      orSeparator: string
      emailLabel: string
      passwordLabel: string
      submitBtn: string
      loading: string
      errorMsg: string
      notApproved: string
      noAccount: string
      registerLink: string
    }
    welcome: {
      step1Title: string
      step1Body: string
      step2Title: string
      step2Body: string
      step3Title: string
      step3Body: string
      next: string
      skip: string
      toLogin: string
    }
  }
}

export const t: Record<Lang, Translations> = {
  de: {
    nav: {
      home: 'Home',
      appTour: 'App entdecken',
      personalTrainer: 'Personal Trainer',
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
      f5: { tag: 'Personal Trainer', title: 'Professionell trainieren lassen', body: 'Als Trainer erstellst du massgeschneiderte Pläne, organisierst sie in Ordnern und teilst sie per Knopfdruck direkt mit deinen Kunden. Deine Kunden trainieren exakt nach deinen Vorgaben — Satz für Satz, Übung für Übung.' },
      f6: { tag: 'Trainer Dashboard', title: 'Deine Kunden. Immer im Blick.', body: 'Sieh in Echtzeit, welche Gewichte und Wiederholungen deine Kunden absolvieren. Kein Nachfragen, keine WhatsApp — du siehst den Fortschritt direkt im Dashboard und kannst gezielt eingreifen.' },
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
    footer: {
      madeBy: 'Made by',
      impressum: 'Impressum',
      privacy: 'Datenschutz',
    },
    help: { title: 'Hilfe', subtitle: 'YS.Workout — Anleitungen & Tipps', back: '← Zurück' },
    install: {
      title: 'App installieren',
      description: 'Füge YS.Workout direkt zu deinem Homescreen hinzu — auf iPhone und Android, ohne App Store.',
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
    cookies: {
      title: 'Cookies & Datenschutz',
      body: 'YS.Workout speichert deine Trainingsdaten lokal auf deinem Gerät für den Offline-Zugriff und nutzt Google Analytics zur anonymen Nutzungsanalyse. Für den Login wird ein Session-Cookie gesetzt.',
      accept: 'Alles akzeptieren',
      decline: 'Nur notwendige',
      learnMore: 'Mehr erfahren',
    },
    impressum: {
      back: '← Zurück',
      title: 'Impressum',
      legalNote: 'Angaben gemäss Art. 3 Abs. 1 lit. s UWG',
      name: 'Yannick Salm',
      country: 'Schweiz',
      emailLabel: 'E-Mail',
      email: 'yannicksalm07@gmail.com',
      responsible: 'Verantwortlich für den Inhalt',
      responsibleName: 'Yannick Salm',
    },
    privacy: {
      back: '← Zurück',
      title: 'Datenschutzerklärung',
      lastUpdated: 'Zuletzt aktualisiert: Mai 2025',
      sections: {
        general: {
          title: 'Allgemeines',
          body: 'Der Schutz deiner persönlichen Daten ist mir ein wichtiges Anliegen. Diese Datenschutzerklärung informiert darüber, welche Daten beim Besuch dieser Website und bei der Nutzung von YS.Workout erhoben und verarbeitet werden. YS.Workout ist eine Trainings-Tracking-App, in der du Trainingspläne, Übungen, Sätze und Gewichte erfasst und langfristig verfolgst.',
        },
        hosting: {
          title: 'Hosting',
          body: 'Die Landing Page und die App werden über Cloudflare Pages und Cloudflare Workers gehostet. Beim Aufruf der Website verarbeitet Cloudflare technische Zugriffsdaten wie IP-Adresse, Browsertyp, Betriebssystem sowie Datum und Uhrzeit des Zugriffs. Diese Daten werden von Cloudflare zur Auslieferung der Seite und zum Schutz vor Missbrauch verarbeitet. Cloudflare Inc. ist nach dem EU-U.S. Data Privacy Framework zertifiziert.',
        },
        account: {
          title: 'Account & Nutzerdaten',
          body: 'Wenn du einen Account erstellst, werden deine E-Mail-Adresse und ein gehashtes Passwort gespeichert. Alle Trainingsdaten, die du erfasst — Pläne, Übungen, Sätze, Gewichte und Bestleistungen — werden auf einem gesicherten Server gespeichert und sind ausschliesslich mit deinem Account verknüpft. Diese Daten werden nicht an Dritte weitergegeben und ausschliesslich zur Bereitstellung der App-Funktionen verwendet. Du kannst die Löschung deines Accounts und aller zugehörigen Daten jederzeit per E-Mail an yannicksalm07@gmail.com anfragen.',
        },
        localCache: {
          title: 'Lokaler Speicher & Offline-Cache',
          body: 'YS.Workout nutzt den lokalen Speicher deines Geräts (localStorage und IndexedDB), um deine Trainingsdaten für den Offline-Zugriff zwischenzuspeichern. Dadurch funktioniert die App auch ohne aktive Internetverbindung, zum Beispiel im Gym. Diese Daten bleiben ausschliesslich auf deinem Gerät und werden nicht ohne deine Aktion an Server übertragen. Du kannst den lokalen Speicher jederzeit über die Einstellungen deines Browsers löschen.',
        },
        cookies: {
          title: 'Cookies',
          body: 'YS.Workout verwendet zwei Arten von Cookies: Notwendige Cookies, die für den Login und die sichere Session erforderlich sind — diese können nicht deaktiviert werden, da die App ohne sie nicht funktioniert. Sowie Analyse-Cookies von Google Analytics, die nur gesetzt werden, wenn du dem zugestimmt hast. Deine Cookie-Einwilligung wird ebenfalls im lokalen Speicher gespeichert, damit du nicht bei jedem Besuch erneut gefragt wirst.',
        },
        analytics: {
          title: 'Google Analytics',
          body: 'Diese Website nutzt Google Analytics, einen Webanalysedienst der Google Ireland Limited. Google Analytics verwendet Cookies, die eine anonymisierte Analyse der Websitenutzung ermöglichen. Deine IP-Adresse wird dabei vor der Speicherung gekürzt (IP-Anonymisierung). Die erhobenen Daten werden auf Servern von Google in den USA gespeichert. Google ist nach dem EU-U.S. Data Privacy Framework zertifiziert. Du kannst der Nutzung von Google Analytics widersprechen, indem du beim Cookie-Banner nur „Nur notwendige" auswählst. Eine nachträgliche Ablehnung ist über die Browsereinstellungen oder das Google Analytics Opt-out Add-on möglich.',
        },
        contact: {
          title: 'Kontaktformular',
          body: 'Wenn du das Kontaktformular verwendest, werden die von dir angegebenen Daten — Name, E-Mail-Adresse und Nachricht — ausschliesslich zur Bearbeitung deiner Anfrage verwendet. Die Daten werden nicht gespeichert oder an Dritte weitergegeben.',
        },
        rights: {
          title: 'Deine Rechte',
          body: 'Du hast das Recht auf Auskunft über deine gespeicherten personenbezogenen Daten, auf Berichtigung unrichtiger Daten sowie auf Löschung deiner Daten. Für alle Anfragen wende dich per E-Mail an yannicksalm07@gmail.com — ich bearbeite dein Anliegen so schnell wie möglich.',
        },
      },
    },
    auth: {
      register: {
        title: 'YS.Workout',
        subtitle: 'Account erstellen',
        googleBtn: 'Mit Google registrieren',
        orSeparator: 'oder',
        emailLabel: 'E-Mail',
        passwordLabel: 'Passwort',
        passwordPlaceholder: 'min. 8 Zeichen',
        confirmLabel: 'Passwort bestätigen',
        confirmPlaceholder: '••••••••',
        submitBtn: 'Registrieren',
        loading: 'Registrieren...',
        errorMismatch: 'Passwörter stimmen nicht überein',
        errorTooShort: 'Passwort muss mindestens 8 Zeichen haben',
        hasAccount: 'Bereits ein Account?',
        loginLink: 'Login',
        emailSuccessTitle: 'Account erstellt!',
        emailSuccessBody: 'Bestätige zuerst deine E-Mail — dann kannst du dich einloggen.',
        emailSuccessBtn: 'Zum Login',
      },
      login: {
        subtitle: 'Melde dich an',
        googleBtn: 'Mit Google anmelden',
        orSeparator: 'oder',
        emailLabel: 'E-Mail',
        passwordLabel: 'Passwort',
        submitBtn: 'Login',
        loading: 'Einloggen...',
        errorMsg: 'Ungültige E-Mail oder Passwort',
        notApproved: 'Dein Account ist noch nicht freigeschaltet.',
        noAccount: 'Noch kein Account?',
        registerLink: 'Registrieren',
      },
      welcome: {
        step1Title: 'Willkommen!',
        step1Body: 'Schön, dass du dabei bist. Dein Account ist bereit — jetzt kannst du loslegen.',
        step2Title: 'App installieren',
        step2Body: 'Die Anleitung zum Hinzufügen der App auf deinen Homescreen findest du unter /help.',
        step3Title: 'Bereit!',
        step3Body: 'Erstelle deinen ersten Trainingsplan und fang an zu tracken.',
        next: 'Weiter',
        skip: 'Überspringen',
        toLogin: 'Starten!',
      },
    },
  },

  en: {
    nav: {
      home: 'Home',
      appTour: 'Explore App',
      personalTrainer: 'Personal Trainer',
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
      f5: { tag: 'Personal Trainer', title: 'Train with a personal coach', body: 'Trainers build tailored plans, organise them in folders, and share them with clients in one tap. Clients follow the exact programme — set by set, exercise by exercise — right inside the app.' },
      f6: { tag: 'Trainer Dashboard', title: 'Your clients. Always in view.', body: 'See exactly which weights and reps your clients are hitting in real time. No follow-up messages needed — progress is visible straight in your dashboard so you can coach with precision.' },
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
    footer: {
      madeBy: 'Made by',
      impressum: 'Legal Notice',
      privacy: 'Privacy Policy',
    },
    help: { title: 'Help', subtitle: 'YS.Workout — Guides & Tips', back: '← Back' },
    install: {
      title: 'Install the App',
      description: 'Add YS.Workout to your home screen — on iPhone and Android, no App Store needed.',
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
    cookies: {
      title: 'Cookies & Privacy',
      body: 'YS.Workout stores your workout data locally on your device for offline access and uses Google Analytics for anonymous usage analysis. A session cookie is set when you log in.',
      accept: 'Accept all',
      decline: 'Necessary only',
      learnMore: 'Learn more',
    },
    impressum: {
      back: '← Back',
      title: 'Legal Notice',
      legalNote: 'Information according to Art. 3 Para. 1 lit. s UWG',
      name: 'Yannick Salm',
      country: 'Switzerland',
      emailLabel: 'Email',
      email: 'yannicksalm07@gmail.com',
      responsible: 'Responsible for content',
      responsibleName: 'Yannick Salm',
    },
    privacy: {
      back: '← Back',
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: May 2025',
      sections: {
        general: {
          title: 'General',
          body: 'Protecting your personal data is important to me. This privacy policy explains what data is collected and processed when you visit this website and use YS.Workout. YS.Workout is a workout tracking app where you log training plans, exercises, sets, and weights and track your progress over time.',
        },
        hosting: {
          title: 'Hosting',
          body: 'The landing page and app are hosted via Cloudflare Pages and Cloudflare Workers. When you access the website, Cloudflare processes technical access data such as IP address, browser type, operating system, and date and time of access. This data is processed by Cloudflare to deliver the page and protect against abuse. Cloudflare Inc. is certified under the EU-U.S. Data Privacy Framework.',
        },
        account: {
          title: 'Account & User Data',
          body: 'When you create an account, your email address and a hashed password are stored. All workout data you record — plans, exercises, sets, weights, and personal records — is stored on a secured server and linked exclusively to your account. This data is not shared with third parties and is used solely to provide the app\'s functionality. You can request deletion of your account and all associated data at any time by emailing yannicksalm07@gmail.com.',
        },
        localCache: {
          title: 'Local Storage & Offline Cache',
          body: 'YS.Workout uses your device\'s local storage (localStorage and IndexedDB) to cache your workout data for offline access. This allows the app to work without an active internet connection — for example, at the gym. This data remains exclusively on your device and is not transmitted to servers without your action. You can clear the local storage at any time through your browser settings.',
        },
        cookies: {
          title: 'Cookies',
          body: 'YS.Workout uses two types of cookies: necessary cookies required for login and secure session management — these cannot be disabled as the app requires them to function. And analytics cookies from Google Analytics, which are only set if you have consented. Your cookie preference is also stored in local storage so you are not asked again on every visit.',
        },
        analytics: {
          title: 'Google Analytics',
          body: 'This website uses Google Analytics, a web analytics service provided by Google Ireland Limited. Google Analytics uses cookies that enable anonymized analysis of website usage. Your IP address is shortened before storage (IP anonymization). The collected data is stored on Google servers in the USA. Google is certified under the EU-U.S. Data Privacy Framework. You can opt out of Google Analytics by selecting "Necessary only" in the cookie banner. You can also opt out later via your browser settings or the Google Analytics opt-out add-on.',
        },
        contact: {
          title: 'Contact Form',
          body: 'When you use the contact form, the data you provide — name, email address, and message — is used exclusively to process your inquiry. The data is not stored beyond this purpose or shared with third parties.',
        },
        rights: {
          title: 'Your Rights',
          body: 'You have the right to access your stored personal data, to correct inaccurate data, and to request deletion of your data. For all requests, contact me by email at yannicksalm07@gmail.com — I will handle your request as quickly as possible.',
        },
      },
    },
    auth: {
      register: {
        title: 'YS.Workout',
        subtitle: 'Create your account',
        googleBtn: 'Register with Google',
        orSeparator: 'or',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        passwordPlaceholder: 'min. 8 characters',
        confirmLabel: 'Confirm password',
        confirmPlaceholder: '••••••••',
        submitBtn: 'Sign up',
        loading: 'Signing up...',
        errorMismatch: 'Passwords do not match',
        errorTooShort: 'Password must be at least 8 characters',
        hasAccount: 'Already have an account?',
        loginLink: 'Log in',
        emailSuccessTitle: 'Account created!',
        emailSuccessBody: 'Please confirm your email first — then you can log in.',
        emailSuccessBtn: 'Go to Login',
      },
      login: {
        subtitle: 'Log in to your account',
        googleBtn: 'Sign in with Google',
        orSeparator: 'or',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        submitBtn: 'Log in',
        loading: 'Logging in...',
        errorMsg: 'Invalid email or password',
        notApproved: 'Your account has not been approved yet.',
        noAccount: 'No account yet?',
        registerLink: 'Sign up',
      },
      welcome: {
        step1Title: 'Welcome!',
        step1Body: "Great to have you here. Your account is ready — let's get started.",
        step2Title: 'Install the App',
        step2Body: 'You can find the guide to add the app to your home screen at /help.',
        step3Title: 'Ready!',
        step3Body: 'Create your first training plan and start tracking.',
        next: 'Next',
        skip: 'Skip',
        toLogin: 'Start!',
      },
    },
  },
}