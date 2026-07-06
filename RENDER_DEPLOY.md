# Render Deployment

## 1. GitHub Repo erstellen

Erstelle ein neues privates GitHub-Repository, z. B.:

```text
seela-connect-push
```

Danach diesen Projektordner pushen.

## 2. Render Blueprint anlegen

In Render:

1. `New` > `Blueprint`
2. GitHub verbinden
3. Repository `seela-connect-push` auswaehlen
4. Blueprint-Datei: `render.yaml`
5. Deploy Blueprint starten

Render nutzt dann den Service `seela-connect-push-backend`.

## 3. Render Secret-Werte eintragen

Render fragt nach diesen Werten:

```env
SEELA_USERNAME=...
SEELA_PASSWORD=...
FIREBASE_SERVICE_ACCOUNT_BASE64=...
```

Den Firebase-Base64-Wert lokal im Backend-Ordner erzeugen:

```powershell
.\scripts\firebase-service-account-base64.ps1
```

## 4. Nach dem Deploy

Render zeigt eine Adresse wie:

```text
https://seela-connect-push-backend.onrender.com
```

Diese Adresse brauchen wir danach in der Android-App als `backend_url`.

## 5. Test

Nach dem Deploy:

```text
https://DEINE-RENDER-URL/health
```

Sollte anzeigen:

```json
{"ok":true}
```
