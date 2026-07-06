# Seela Connect Push Starter

Dieses Starterpaket besteht aus zwei Teilen:

1. `backend`: meldet sich bei Seela Connect an, prueft wichtige Seiten und sendet bei Aenderungen Push-Mitteilungen ueber Firebase Cloud Messaging.
2. `android-app`: einfache Android-App mit Seela-WebView und Firebase-Push-Registrierung.

## Aktueller Stand

Der Backend-Probelauf gegen Seela Connect war erfolgreich. Ueberwacht werden:

- Kanal1 Nachrichten
- Kurs-Stundenplan
- Kurstermine
- Fehlstunden

Die Android-Datei `google-services.json` und die Backend-Datei `firebase-service-account.json` sind in der lokalen Arbeitskopie eingebunden.

Beim ersten Lauf wird nur ein Basisstand gespeichert. Push wird erst ausgeloest, wenn sich danach eine Seite aendert.

## Backend Start

Im Ordner `backend`:

```powershell
copy .env.example .env
npm.cmd install
npm.cmd run check
npm.cmd start
```

In `.env` muessen die Seela-Zugangsdaten und `FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json` stehen.

Sobald ein Handy registriert ist, kann eine Test-Push-Mitteilung so ausgeloest werden:

```powershell
Invoke-RestMethod -Method Post http://localhost:8787/push-test
```

## Firebase Push

Die Android-Firebase-Datei `google-services.json` ist bereits eingebunden und passt zum Package Name `de.seela.connectpush`.

Die Server-Datei fuer den Push-Versand ist lokal als `backend/firebase-service-account.json` eingebunden.

Auf einem gehosteten Server ist es sicherer, den Inhalt dieser JSON-Datei als geheime Umgebungsvariable `FIREBASE_SERVICE_ACCOUNT_JSON` zu speichern. Dann muss die Datei nicht hochgeladen werden.

## Deployment

Das Backend ist Docker-bereit. Im Ordner `backend` liegen:

- `Dockerfile`
- `.dockerignore`
- `render.yaml`

Wichtige Server-Variablen:

```env
SEELA_USERNAME=...
SEELA_PASSWORD=...
FIREBASE_SERVICE_ACCOUNT_BASE64=...
CHECK_CRON=*/5 * * * *
```

Den Base64-Wert fuer Firebase erzeugst du lokal im Backend-Ordner so:

```powershell
.\scripts\firebase-service-account-base64.ps1
```

Diesen langen Wert dann als geheime Server-Variable `FIREBASE_SERVICE_ACCOUNT_BASE64` eintragen.

## Android App

In `android-app/app/src/main/res/values/strings.xml` muss `backend_url` auf die oeffentliche Backend-Adresse gesetzt werden, z. B.:

```xml
<string name="backend_url">https://dein-server.example.com</string>
```

Wichtig: Fuer echte Push-Mitteilungen braucht das Handy eine erreichbare HTTPS-Adresse zum Backend. Lokal auf dem PC funktioniert die Token-Anmeldung nur mit Tunnel oder Deployment.

## Empfohlener Betrieb

Das Backend sollte dauerhaft auf einem kleinen Server laufen. Gute Optionen:

- kleiner VPS
- Render/Fly.io/Railway
- eigener Homeserver mit HTTPS-Tunnel

Der Standard-Check laeuft alle 5 Minuten. Das kann in `.env` ueber `CHECK_CRON` angepasst werden.
