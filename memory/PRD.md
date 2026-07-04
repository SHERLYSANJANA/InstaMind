# InstaRead — Product Requirements Document

## Original Problem Statement
Build a high-tech, minimalistic **bionic reader web app** with support for multiple input types (paste text, PDF upload, image OCR, URL/webpage extraction). Every input must be converted entirely to bionic text. Aesthetic: ultra-minimal monochrome / editorial reading-paper vibe. Provide customization for fixation strength, fonts, reading width, and dark/light toggle. **No user authentication** required.

## User Personas
- **Focused reader** — wants faster reading via bionic fixation
- **Accessibility-first reader** — dyslexia, low-vision, ADHD presets
- **Researcher/student** — pastes long-form web articles, exports to broadsheet PDF
- **Sharer** — creates read-only permalinks to share bionic conversions

## Core Requirements (all DONE ✅)
1. Bionic text converter with adjustable fixation strength
2. Multi-input handling: paste, PDF upload, image OCR (Tesseract), URL extraction
3. Ultra-minimal Paper / Ink / Newspaper themes
4. 10 typefaces including Lexend, OpenDyslexic
5. Accessibility presets (Dyslexia, Low-vision, ADHD)
6. Multi-column reading layout + focus-line ruler
7. Web Speech API TTS with karaoke-style word highlighting
8. Shareable read-only permalinks `/r/{id}` with QR codes
9. Print-to-PDF broadsheet newspaper export
10. Keyboard shortcuts (`t`, `[`, `]`)
11. LocalStorage persistence across reloads
12. No login / no accounts (privacy-first)

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, shadcn/ui, framer-motion, qrcode.react, tesseract.js, pdfjs-dist
- **Backend**: FastAPI, Motor (async MongoDB), readability-lxml, BeautifulSoup4
- **Storage**: MongoDB (shared reads only — text stays client-side by default)

## Key API Endpoints
- `GET /api/` — health check
- `POST /api/extract-url` — clean article extraction from a URL
- `POST /api/share` — create shareable permalink
- `GET /api/share/{id}` — retrieve shared read

## Data Model
```
shared_reads: {
  id: str (10-char hex),
  text: str,
  title: str | null,
  source: str | null,
  created_at: ISO string,
  word_count: int
}
```

## Deployment History
- **Feb 2026**: Emergent deployment health check PASSED — deployed to `*.emergent.host`
- Attempted external hosting on Railway (blocked by ran-out-of-credits), Fly.io (Rupay not accepted); user chose Emergent Deployment as final production host
- Removed unused private packages (`emergentintegrations`, `litellm`) from `backend/requirements.txt` to unblock external hosts (still deployable there via the Dockerfile at repo root)
- Added multi-stage `Dockerfile` + `.dockerignore` for optional external Docker-based hosting (Render, Fly, Railway) — dormant on Emergent
- `server.py` conditionally serves React `static/` build if the folder exists (activated only in Docker container builds)

## What's Implemented (as of Feb 2026)
- Full MVP feature set (all 12 core requirements above)
- Rebranding: FocusRead → InstaRead (globally applied)
- Favicon + OG image (`favicon.svg`, `og-image.svg`)
- README with full feature list
- Design guidelines saved to `/app/design_guidelines.json`

## Backlog / Future Enhancements
- **P1**: Reading streak widget (localStorage-tracked daily sessions)
- **P1**: WPM tracker + reading session history
- **P2**: TTS voice speed/pitch presets
- **P2**: Highlight/annotation export to Markdown
- **P2**: `/api/health` endpoint with MongoDB ping (for auto-restart on external hosts)
- **P3**: Multi-language OCR expansion
- **P3**: Import from Pocket / Instapaper

## Non-Goals
- User accounts / authentication (privacy-first design)
- Server-side text storage (unless user explicitly shares)
- Native mobile apps (responsive web is sufficient)
