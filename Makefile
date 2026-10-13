# make render DECK=mein-vortrag    → mein-vortrag.html
# make pdf    DECK=mein-vortrag    → mein-vortrag.pdf (eine Seite pro Folie, braucht Chrome)
# make test                        → rendert Demo- und Prüfdeck und prüft das Layout

QUARTO ?= quarto
DECK ?= demo

# In this repo the extension sits in _extensions/unibw; `quarto use template`
# and `quarto add` install it as _extensions/<github-user>/unibw.
EXPORT_PDF := $(firstword $(wildcard _extensions/unibw/tools/export-pdf.mjs _extensions/*/unibw/tools/export-pdf.mjs))

.PHONY: render preview pdf test clean

render:
	$(QUARTO) render $(DECK).qmd

preview:
	$(QUARTO) preview $(DECK).qmd

pdf: render
	node $(EXPORT_PDF) $(DECK).html $(DECK).pdf

test:
	$(QUARTO) render demo.qmd
	$(QUARTO) render tests/fixture.qmd
	$(QUARTO) render tests/legacy.qmd
	node tests/check-slides.mjs demo.html --date 01.04.2026
	node tests/check-slides.mjs tests/fixture.html --date 02.06.2026 \
		--expect-fit many-bullets,long-code --expect-overflow hopeless
	node tests/check-slides.mjs tests/legacy.html --date 24.12.2026

clean:
	rm -rf *.html *_files tests/*.html tests/*_files .quarto
