<div align="center">

<br/>

```
██╗   ██╗███████╗    ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗ ██████╗ ██╗   ██╗████████╗
╚██╗ ██╔╝██╔════╝    ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔═══██╗██║   ██║╚══██╔══╝
 ╚████╔╝ ███████╗    ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ██║   ██║██║   ██║   ██║   
  ╚██╔╝  ╚════██║    ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██║   ██║██║   ██║   ██║   
   ██║   ███████║    ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗╚██████╔╝╚██████╔╝   ██║   
   ╚═╝   ╚══════╝     ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝   
```

**Built for people who take their training seriously.**

[![Status](https://img.shields.io/badge/status-early%20access-blueviolet?style=flat-square)](mailto:yannick.salm@outlook.de)
[![Stack](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Feedback](https://img.shields.io/badge/feedback-very%20welcome-brightgreen?style=flat-square)](mailto:yannick.salm@outlook.de)

<br/>

</div>

---

## Was ist YS Workout?

YS Workout ist eine Workout-Tracking-App mit einem klaren Ziel: **aus dem Weg gehen und trainieren lassen.** Kein Bloat, keine Subscriptions, keine Dark Patterns — nur eine schnelle, saubere Oberfläche zum Loggen von Workouts, Tracken von Fortschritt und Dranbleiben.

Gebaut mit einem starken Fokus auf **Design** und **Geschwindigkeit** — fünf handgefertigte Dark-Themes, eine Oberfläche die sich auf Mobile nativ anfühlt, und eine Infrastruktur die global auf Cloudflare's Edge läuft.

---

## ✨ Features

### 🏋️ Workout Logging
- **Aktive Sessions** — Timer, Volumen und Sets in Echtzeit
- **Swipe-to-delete** auf einzelne Sätze (nur Links-Wisch)
- **Long-Press Drag** um Übungen in der Reihenfolge zu verschieben
- **«Zuvor»-Spalte** — Gewicht und Wdh. aus dem letzten Workout direkt in der Set-Zeile
- **Inline Titel-Editing** — Session-Name direkt im Header bearbeitbar

### 🔁 Superset-Logik
- Zwei Übungen zu einem Superset pairen über das `···` Menü
- **Auto-Advance** — nach Abhaken von Satz N bei Übung A springt die App automatisch zu Satz N bei Übung B
- Visuelle Klammer mit SUPERSET-Badge verbindet die Übungen
- Supersets funktionieren sowohl im aktiven Workout als auch beim Routine-Planen

### 📚 Exercise Library
- Tausende Übungen mit Bild, Muskelgruppen und Equipment
- **Preview-Sheet** — Übung antippen öffnet Detailansicht mit beiden Bewegungsbildern, direkt aus der Suche heraus
- Suchfunktion mit Body-Part und Equipment-Filter
- **Custom Exercises** — eigene Übungen erstellen mit Muskelgruppe, Equipment und Übungstyp (user-basiert, nur selbst sichtbar)

### 📈 Personal Records & Stats
- Automatische PR-Erkennung beim Loggen (Max Weight, Max Reps, 1RM, Duration, Distance)
- Detailseite pro Übung mit konfigurierbarem Statistik-Chart (1M / 3M / 6M / All)
- Sechs Stat-Views: Max Weight, Volume, 1RM Estimate, Best Reps, Duration, Distance

### 📓 Logbook
- Alle abgeschlossenen Workouts chronologisch
- Workout **umbenennen**, **als Routine speichern** oder direkt **wiederstarten** — alles über das `⋯` Menü
- Sets (Gewicht & Wdh.) werden beim Wiederstarten übernommen

### 🗂️ Routinen
- Routinen planen mit vordefinierten Sets, Gewichten und Wdh.
- Superset-Pairing direkt beim Planen
- Routine starten kopiert alle Übungen und Sets in eine neue aktive Session

### 🎨 Themes
Fünf handgefertigte Dark-Themes: **Vulkan**, **Polar**, **Malachit**, **Obsidian**, **Stahl** — alle als CSS Custom Properties implementiert, sofort umschaltbar.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | CSS Custom Properties — vollständiges Theme-System |
| Backend / Edge | Cloudflare Workers via OpenNext |
| Datenbank | Supabase (PostgreSQL + RLS) |
| Offline | IndexedDB für aktive Workouts |
| Exercise Data | External ExerciseDB (eigene Supabase-Instanz) |
| Deployment | Cloudflare Pages / Workers |

---

## 🚀 Was kommt

### 📱 Native Apps
> **iOS & Android Apps** werden gebaut — über Capacitor wird die Web-App in eine native Shell gepackt. Zugriff auf **Apple Health**, **Push Notifications** und **Haptic Feedback**. App Store & Play Store Release geplant.

### ⏱️ Rest Timer
Konfigurierbarer Timer nach jedem Satz (60s / 90s / 120s), direkt in die Set-Zeile integriert.

### 📊 Volumen pro Muskelgruppe
Wöchentliches Trainingsvolumen nach Muskelgruppe aufgeteilt — als Balkendiagramm im Stats-Screen.

### 🏷️ Warmup-Sätze
Sätze als Warmup markieren — werden aus PR- und Volumen-Berechnung ausgeschlossen.

### ⚖️ Körpergewicht tracken
Tägliches Körpergewicht eintragen und als Linienchart über Zeit visualisieren.

### 🧮 Plate Calculator
Zielgewicht eingeben → App zeigt welche Plates auf jede Seite der Stange kommen.

### 📅 Aktivitäts-Kalender
Kalenderansicht im Logbook die zeigt an welchen Tagen trainiert wurde — Streak-Tracking inklusive.

### 📤 Workout teilen
Abgeschlossenes Workout als Share-Card exportieren für Social Media.

---

## 🔐 Zugang

Das Projekt ist aktuell in **Early Access** — die App ist live, der Zugang ist aber noch invite-only während aktiv entwickelt wird.

**Möchtest du reinschauen?**

> 📬 **[yannick.salm@outlook.de](mailto:yannick.salm@outlook.de)**

Kurze Vorstellung reicht — ich melde mich schnellstmöglich.

---

## 💬 Feedback

Feedback ist **sehr willkommen** — und wird ernst genommen. Bug, UI-Quirk, fehlende Funktion oder genereller Eindruck: alles hilft.

> 📬 **[yannick.salm@outlook.de](mailto:yannick.salm@outlook.de)**

Kein Feedback ist zu klein.

---

## 🗺️ Roadmap

| Status | Feature |
|---|---|
| ✅ | Exercise Library mit Filtern & Preview |
| ✅ | Workout Logging mit Swipe, Drag & Superset |
| ✅ | Personal Records — automatische Erkennung |
| ✅ | Logbook mit Workout-Detail |
| ✅ | Routinen mit Superset-Planung |
| ✅ | Custom Exercises |
| ✅ | Fünf Dark-Themes |
| ✅ | «Zuvor»-Werte in aktiver Session |
| ✅ | Workout als Routine speichern & wiederstarten |
| ✅ | Cloudflare Edge Deployment |
| 🔄 | iOS & Android Apps (Capacitor) |
| 🔄 | Apple Health Integration |
| 🔄 | Rest Timer |
| 🔄 | Volumen-Charts pro Muskelgruppe |
| 🔄 | Körpergewicht Tracking |
| 🔄 | Plate Calculator |
| 🔄 | Aktivitäts-Kalender & Streaks |
| 🔄 | Workout teilen |

---

<div align="center">

Made with 🖤 by Yannick Salm

</div>

Bug: custom exercises werden nicht in filter mit einbezogen!