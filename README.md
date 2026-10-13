# UniBw Präsentationsvorlage (Quarto Revealjs)

Quarto-Format `unibw-revealjs` im Design der Universität der Bundeswehr München. Ziel: Folien in reinem
Markdown schreiben, rendern, fertig – ohne Nacharbeit am Layout.

## Schnellstart

Voraussetzung: [Quarto](https://quarto.org/docs/get-started/) ≥ 1.4.

```bash
quarto use template nkoeberlein/Praesentation-UniBw   # legt einen neuen Ordner mit der Vorlage an
quarto preview mein-vortrag.qmd                       # Live-Vorschau
quarto render mein-vortrag.qmd                        # → mein-vortrag.html (eine Datei, alles eingebettet)
```

Eine Präsentation braucht nur diesen Kopf:

```yaml
---
title: "Titel des Vortrages"
subtitle: "Untertitel"
date: 2026-04-01          # ISO-Format oder today; angezeigt wird 01.04.2026
course-name: "Name der Lehrveranstaltung"
course-instructor: "Name des Dozenten"
toc: true                 # Agenda aus den Abschnitten
format: unibw-revealjs
---
```

Angaben zur Person (`author`, `author-title`, `position`, `cohort`, `student-id`, `email`, …) stehen einmal
in `_quarto.yml` und gelten für alle Präsentationen im Ordner. Jedes Feld ist optional – was fehlt, wird
weggelassen.

Bestehende Präsentationen auf den neuesten Stand der Vorlage bringen:

```bash
quarto update extension nkoeberlein/Praesentation-UniBw
```

## Was automatisch passiert

| Im Markdown | Ergebnis |
|---|---|
| `# Abschnitt` | Abschnittsfolie in Blau; der Abschnitt erscheint im Header der folgenden Folien |
| `## Folie` | Inhaltsfolie mit Header, Footer und Foliennummer |
| `toc: true` | Agenda-Folie, ab sechs Abschnitten zweispaltig |
| zu viel Inhalt | Schrift der Folie wird stufenweise verkleinert, bis alles passt |
| ein einzelnes Bild | füllt den freien Platz der Folie |
| `## Folie {source="Quelle …"}` | Quellenzeile am Folienfuß (Markdown und Zitate `[@key]` möglich) |
| `bibliography: …` | Quellenfolie am Ende, sofern kein eigenes `::: {#refs}` gesetzt ist |
| Ende des Dokuments | Abschlussfolie mit Steckbrief aus den YAML-Angaben |

Passt eine Folie auch in der kleinsten Stufe nicht, wird sie in `quarto preview` rot markiert und in der
Browser-Konsole gemeldet. Dann die Folie teilen oder kürzen.

## Optionen im YAML

| Schlüssel | Standard | Wirkung |
|---|---|---|
| `ubw-density` | `normal` | `compact`, `dense` oder Zahl (z. B. `0.9`): Schriftgröße aller Inhaltsfolien |
| `ubw-animations` | `true` | `false` schaltet die Einblend-Animationen ab |
| `profile-photo` | – | Bild für die Abschlussfolie |
| `end-slide` / `end-title` | `true` / „Vielen Dank — Fragen?" | Abschlussfolie aus- bzw. umbenennen |
| `logo-left` / `logo-right` | Institutslogo / UniBw-Signet | eigener Bildpfad oder `false` |
| `title-background` | Luftbild | eigener Bildpfad oder `false` |
| `section-color` | `#2A3D7A` | Hintergrund der Abschnittsfolien |
| `short-title` | – | kürzerer Titel für den Footer |
| `lang` | `de` | `en` stellt die Beschriftungen um; einzelne Texte über `ubw-labels` |
| `university`, `faculty`, `institute`, `chair`, `professor` | Professur Karcher | Angaben im Header und Steckbrief |

Pro Folie: `{.smaller}` kleinere Schrift, `{.no-fit}` keine automatische Verkleinerung, `{.center}`
vertikal zentriert. Spalten: `::: {.columns .plain}` ohne Kartenoptik. Bilder: `{.shadow}` / `{.plain}`.

## PDF

```bash
make pdf DECK=mein-vortrag     # → mein-vortrag.pdf, eine Seite pro Folie (braucht Node ≥ 22 und Chrome)
```

Ohne `make`: `node _extensions/nkoeberlein/unibw/tools/export-pdf.mjs mein-vortrag.html` (in diesem Repo
liegt die Extension unter `_extensions/unibw/`).

Von Hand: die HTML-Datei in **Chrome** öffnen, `?print-pdf` an die Adresse anhängen, drucken. Firefox
unterstützt den Druckmodus von Revealjs nicht. `quarto render --to pdf` erzeugt ein LaTeX-Dokument, keine
Folien.

## Aufbau des Repos

```
template.qmd            ← Startdatei für neue Präsentationen
demo.qmd                ← zeigt alle Elemente; dient zugleich als Prüfdeck
_quarto.yml             ← Angaben zur Person
_extensions/unibw/      ← das Format: Theme (scss/), Skripte (includes/), Filter (ubw.lua), Logos (assets/)
assets/, bibliography/  ← Bilder und Literatur der Demo
tests/                  ← Layout-Prüfung in Headless-Chrome (`make test`)
```

## Lizenz & Credits

- **Design:** © 2026 Nikolaus Köberlein ([github.com/nkoeberlein](https://github.com/nkoeberlein)).
- **Code-Lizenz:** Mozilla Public License 2.0 (MPL 2.0).
- **Assets:** Bilder und Logos der Universität der Bundeswehr München unterliegen dem Urheberrecht der Institution.
