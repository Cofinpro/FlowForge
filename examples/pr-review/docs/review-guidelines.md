# Review-Richtlinien

Wissensbasis für den Beispielprozess `pr-review.bpmn`. Der Data Store „Review-Richtlinien“ zeigt auf diese Datei.

## Schweregrade

- **hoch**: Logikfehler, Datenverlust, Sicherheitslücke, fehlgeschlagener Test. Blockiert den Merge.
- **mittel**: fehlender Test für neues Verhalten, unklare Fehlerbehandlung, doppelter Code.
- **niedrig**: Benennung, Kommentare, Formatierung, die der Linter nicht fängt.

## Code prüfen

- Eine Änderung erledigt eine Sache. Mischt der Pull Request Refactoring und neues Verhalten, ist das ein Befund.
- Neues Verhalten braucht einen Test, der ohne die Änderung fehlschlägt.
- Fehler werden behandelt oder bewusst weitergereicht, nie verschluckt.
- Namen beschreiben, was etwas ist, nicht wie es gebaut wurde.

## Sicherheit

- Keine Zugangsdaten, Tokens oder Schlüssel im Code oder in Testdaten.
- Eingaben von außen werden geprüft, bevor sie in Abfragen, Pfade oder Shell-Aufrufe gelangen.
- Neue Abhängigkeiten brauchen einen Grund in der Beschreibung des Pull Requests.

## Kritisch

Kritisch ist ein Befund mit Schweregrad hoch. Eine Sicherheitsfrage mit Schweregrad hoch ist immer kritisch.
