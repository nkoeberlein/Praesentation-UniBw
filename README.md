# UniBw Präsentationsvorlage (Quarto Revealjs)

Dieses Projekt bietet eine professionelle Quarto-Präsentationsvorlage im Design der Universität der Bundeswehr München (UniBw München). Die Vorlage basiert auf Revealjs und ist für wissenschaftliche Vorträge, Abschlussarbeiten oder Projektpräsentationen optimiert.

## Features

- **Corporate Design:** Angepasstes SCSS-Theme (`scss/ubw-theme.scss`) mit den offiziellen Farben und Schriftarten (soweit möglich).
- **Header & Footer:** Automatisierte Einblendung von Name, Titel, Datum und Seitenzahlen über `includes/header-footer.html`.
- **Layout-Optimierung:** Voreingestellt auf 1920×1080 (16:9) für moderne Beamer und Bildschirme.
- **Wissenschaftliche Zitierweise:** Integrierte Unterstützung für BibTeX/CSL über Pandoc.
- **Interaktive Elemente:** Nutzung von Revealjs-Features wie `auto-animate`, `callout-blocks`, Code-Highlighting und Fragmente.
- **End-Slide:** Spezielle Abschlussfolie mit zentriertem Profilbild und Steckbrief, per JS aus den YAML-Metadaten befüllt.
- **Fortlaufende URL-Nummerierung:** Die Folien sind in der Adresszeile sequentiell nummeriert (`#/1`, `#/2`, …), nicht nach der internen Revealjs-2D-Struktur (`/Abschnitt/Folie`).

## Voraussetzungen

Um die Präsentation zu bearbeiten und zu rendern, benötigst du **Quarto**.

1.  Lade Quarto von [quarto.org](https://quarto.org/docs/get-started/) herunter und installiere es.
2.  (Optional) Installiere eine IDE wie VS Code mit der Quarto-Extension für eine bessere Vorschau.

## Verwendung

### Rendern der Präsentation

Um die Präsentation in eine HTML-Datei zu umzuwandeln, führe folgenden Befehl im Projektverzeichnis aus:

```bash
quarto render presentation-UniBw.qmd
```

Die resultierende Datei `presentation-UniBw.html` ist "self-contained" (alle Ressourcen wie Bilder und CSS sind eingebettet), sodass sie problemlos geteilt werden kann.

### Live-Vorschau während der Bearbeitung

```bash
quarto preview presentation-UniBw.qmd
```

### PDF-Export

Du kannst die Präsentation auch als PDF exportieren, indem du entweder in der Browser-Vorschau `?print-pdf` an die URL anhängst und druckst (empfohlen), oder direkt:

```bash
quarto render presentation-UniBw.qmd --to pdf
```

## Projektstruktur

```
presentation-UniBw.qmd   ← Hauptdatei: Inhalte + YAML-Metadaten
_quarto.yml               ← Projektweite Quarto-Konfiguration
scss/
  ubw-theme.scss          ← SCSS-Einstiegspunkt (Variablen + @import)
  _animations.scss        ← Keyframe-Animationen
  _slides.scss            ← Globales Folienlayout, Titelfolie, Abschnittstrenner
  _chrome.scss            ← Header, Footer, Fortschrittsbalken
  _typography.scss        ← Überschriften, Listen, Code
  _elements.scss          ← Spalten, Tabellen, Callouts, Links
  _end-slide.scss         ← Abschlussfolie, Druckstile
includes/
  header-footer.html      ← JS: liest YAML-Meta-Tags, injiziert Header/Footer in DOM
  sequential-hash.html    ← JS: ersetzt Revealjs-Hash durch fortlaufende Nummerierung
assets/                   ← Logos und Bilder (Signet, Athene, IA-Logo, Foto)
bibliography/             ← BibTeX-Quellen (.bib)
```

## Konfiguration

In der `presentation-UniBw.qmd` Datei können im YAML-Header (ganz oben) alle Metadaten angepasst werden:
- Titel und Untertitel
- Autor, Dienstgrad/Titel, Matrikelnummer
- Institut, Fakultät, Lehrstuhl
- Kursname und Dozent

## Lizenz & Credits

Dieses Foliendesign wurde ursprünglich von **Nikolaus Köberlein** entworfen.

- **Design:** © 2026 Nikolaus Köberlein ([github.com/nkoeberlein](https://github.com/nkoeberlein)).
- **Code-Lizenz:** Mozilla Public License 2.0 (MPL 2.0).
- **Assets:** Die enthaltenen Bilder und Logos der Universität der Bundeswehr München unterliegen dem jeweiligen Urheberrecht der Institution.
