# Spectrum - School Leaving Certificate Generator

A small, fully client-side Next.js app that fills in Spectrum The Schooling Zone's
School Leaving Certificate template and lets you save it as a PDF — no server,
no database, nothing stored.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, fill in the form, and click **Generate & Save Certificate**.

- In Chrome/Edge, click **Choose Save Folder…** first to pick where certificates get
  written directly (uses the File System Access API).
- In other browsers, or if you skip picking a folder, the certificate downloads
  normally through the browser.

## Build

```bash
npm run build
```

This produces a static export in `out/` (no Node server needed to run it).

## Run with Docker

```bash
docker compose up --build
```

Then open http://localhost:3000. The container just serves the static build via nginx.

Or without compose:

```bash
docker build -t spectrum-leaving-certificate .
docker run -p 3000:80 spectrum-leaving-certificate
```

## Notes

- The certificate is drawn on an HTML canvas over `public/certificate-base.png`
  (the original template) and exported to a PDF sized for A4.
- Field positions live in `lib/fieldPositions.ts` — tweak the fractional
  coordinates there if any value needs to be nudged to sit better on its line.
