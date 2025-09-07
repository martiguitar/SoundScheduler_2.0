SoundScheduler-App
 
# Überblick
Die SoundScheduler-App ist ein leichtgewichtiges Scheduling- und Soundboard-Tool. Backend ist eine kleine PHP-API, die alle Metadaten in einer JSON-Datei speichert. Das Frontend ist eine React/Vite-App.

# Architektur
- Backend (PHP): `server/api/*`
  - Persistenz: `server/data/manifest.json` (wird nur von der API gelesen/geschrieben; direkter Webzugriff per `.htaccess` gesperrt)
  - Uploads: Audiodateien in `uploads/sounds` (Pfad über `server/.env` → `UPLOAD_DIR`)
  - Versionierung: Das Manifest enthält `version` (ETag). Jede Änderung erhöht die Version.
- Frontend (React/Vite): `src/*`
  - Kommuniziert ausschließlich mit der PHP-API (kein Supabase).

# Wichtige Dateien & Ordner
- `server/.env`: Serverkonfiguration (CORS, BASE_URL, Cookie, Pfade, Admin-Login)
- `server/api/*.php`: REST-ähnliche Endpunkte
- `server/data/manifest.json`: Zentrale Daten (Sounds, Kategorien, Schedules, Version)
- `src/components/`: UI-Komponenten (u. a. `SoundboardView`, `TimelineView`, `SoundList`)
- `src/context/SoundContext.tsx`: State/Actions (Play/Pause/Stop, CRUD via API, Kategorien)
- `src/lib/api.ts`: API-Helper (FormData für POST, um CORS-Preflights zu minimieren)

# Datenmodell (Manifest)
`server/data/manifest.json` enthält:
- `version`: Ganzzahl, erhöht sich bei jeder Änderung
- `sounds`: Liste der Sounds inkl. Feldern wie `id`, `name`, `url`, `file_path`, `size`, `type`, `duration`, `display_order`, `is_favorite`, `category_id`
- `categories`: Liste von Kategorien `{ id, name, display_order }`
- `schedules`: Liste der Zeitpläne `{ id, sound_id, time, active, last_played }`

# API-Endpunkte (Auszug)
- `GET /server/api/manifest.php` → gesamtes Manifest (mit ETag)
- `POST /server/api/sounds.php?action=insert|update|delete|reorder` → Sounds CRUD
- `POST /server/api/schedules.php?action=insert|update|delete` → Schedules CRUD
- `POST /server/api/categories.php?action=insert|update|delete` → Kategorien CRUD
- `POST /server/api/resync.php` → Upload-Ordner scannen und fehlende Dateien ins Manifest ergänzen
- `GET /server/api/cover.php?file=<basename>` → Cover im MP3 (ID3 APIC) extrahieren
- `GET /server/api/me.php` → Auth-Status (Session)

Alle POSTs werden als `multipart/form-data` gesendet (FormData), um CORS-Preflights zu vermeiden. Authentifizierung erfolgt per Server-Session.

# Features
- Soundliste: Umbenennen, Löschen, Größen-/Daueranzeige
- Timeline: Zeitpläne anlegen/anzeigen, Play aus der Timeline
- Soundboard:
  - Play/Pause: Ein Klick startet; erneuter Klick pausiert als Stop (Reset). Nächster Klick beginnt bei 0:00.
  - Cover-Thumbnails (aus eingebettetem MP3-Cover)
  - Favoriten, Drag&Drop-Reihenfolge
  - Kategorien: Anlegen/Umbenennen/Löschen über Zahnrad (Modal), Sounds zuweisen, Filter-Pills über dem Grid
- Resync-Button: Scannt Uploads und ergänzt fehlende Manifest-Einträge
- Globaler Schalter (oben rechts): Bei „an“ rot leuchtend, pulsiert, Tooltip „ON AIR“

# Lokale Entwicklung
1) Abhängigkeiten installieren
```
npm install
```
2) Dev-Server starten
```
npm run dev
```
3) Frontend greift per `VITE_API_BASE` (in Projekt-`.env`) auf die PHP-API zu.

# Server-Konfiguration
Datei: `server/.env`
- `CORS_ALLOWED_ORIGINS` → z. B.:
```
CORS_ALLOWED_ORIGINS=https://tonbandleipzig.de,https://tonbandleipzig.de.w01fc61e.kasserver.com,http://localhost:5173,https://localhost:5173,http://127.0.0.1:5173
```
- `BASE_URL` → öffentliche Basis-URL (z. B. `https://tonbandleipzig.de`)
- `DATA_DIR`, `UPLOAD_DIR` → echte Serverpfade
- `SESSION_NAME`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=None`
- Admin: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`

Zusätzlich kann `server/api/.htaccess` CORS-Header und OPTIONS-204 setzen (falls Apache AllowOverride aktiv ist).

# CORS-Hinweise
- Der Server setzt `Access-Control-Allow-Origin` nur, wenn der Origin exakt in `CORS_ALLOWED_ORIGINS` steht. Für lokale Entwicklung ggf. alle Varianten (`http://localhost:5173`, `https://localhost:5173`, `http://127.0.0.1:5173`) eintragen.
- Das Frontend nutzt FormData für POST, um Preflights (OPTIONS) zu vermeiden.

# Cover-Extraktion
- `server/api/cover.php` liest das APIC-Frame aus ID3v2 (MP3) und liefert das Bild mit korrektem MIME-Type.
- Falls kein Cover vorhanden ist, zeigt die UI ein Fallback-Icon.

# Kategorien
- CRUD über `categories.php` und Zuweisung von `category_id` in Sounds (`sounds.php`).
- UI: Zahnrad im Soundboard → Modal zum Verwalten + Zuweisung. Filter-Pills über dem Grid.

# Sicherheit
- Admin-Session via Cookie (Secure, SameSite=None).
- `server/data/` ist per `.htaccess` vor direktem Zugriff geschützt.

# Troubleshooting
- CORS: Origin exakt in `server/.env` → `CORS_ALLOWED_ORIGINS` aufnehmen. Danach hart neu laden/Cache leeren.
- Preflight (OPTIONS) ohne ACAO: Prüfe, ob `server/api/.htaccess` greift (Apache) oder ob `bootstrap.php` CORS-Header setzt (passender Origin nötig).
- Cover wird nicht angezeigt: Prüfe Network-Status von `cover.php?file=...` (200/404) und `Content-Type`.
- Resync findet Datei nicht: Prüfe `UPLOAD_DIR` in `server/.env` und Dateinamen.

# Lizenz / Hinweise
Interne Projektbasis. Bei Bedarf ergänzen.
