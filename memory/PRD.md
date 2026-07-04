# FocusRead — Bionic Reader (PRD)

## Original problem statement
> "https://focusread-alpha.vercel.app/ this is my basic idea, to create a bionic reader app. but now i want it to be more high tech with a minimalistic design and multiple inputs... Any form of picture or the pdf can also be uploaded and it should entirely be converted into a bionic text"

## Architecture
- **Frontend:** React 19 + Tailwind + shadcn/ui. Client-side PDF extraction (`pdfjs-dist`), client-side OCR (`tesseract.js`), custom bionic engine (`/src/lib/bionic.js`).
- **Backend:** FastAPI at `/api`. Endpoint `POST /api/extract-url` uses `requests` + `readability-lxml` + `BeautifulSoup` to pull readable article text from any URL.
- **State:** React Context (`ReaderContext`) with localStorage-persisted reader preferences.
- **Design:** Editorial reading-paper light + monochrome dark, sharp 1px borders, no shadows, single restrained accent (#F95738). Typography: Outfit (UI), Spectral (serif), IBM Plex Sans, JetBrains Mono.

## User personas
- Anyone who wants faster/focused reading of long-form text (students, researchers, ADHD readers, casual readers).
- No authentication — purely a tool.

## Core requirements (static)
1. Four input modes: Text paste, PDF upload, Image upload (OCR), URL fetch.
2. Bionic text conversion with fixation strength control (light / normal / strong).
3. Reader controls: typeface (serif/sans/mono), size, line-height, reading width.
4. Light/Dark theme toggle.
5. Copy / Export TXT / Clear controls.
6. Word count + estimated reading time.

## What's implemented (2026-02)
- [x] All 4 input pipelines wired end-to-end (verified by testing agent).
- [x] Bionic engine with 3 fixation levels — structured tokens, safe React rendering (no dangerouslySetInnerHTML).
- [x] Full control panel (fixation, font, size, line-height, width, theme, reset).
- [x] Reader canvas with paragraph preservation, copy/export/clear, live word/time stats.
- [x] Empty state, dot loaders for async processing, sonner toasts for feedback.
- [x] `POST /api/extract-url` with readability parsing, 400/422 error handling.
- [x] Fonts loaded (Outfit, Spectral, IBM Plex Sans, JetBrains Mono).
- [x] Editorial monochrome theme (light + dark) with paper-grain overlay.
- [x] LocalStorage persists user reader preferences.

## Prioritized backlog
### P0 (nice next iteration)
- Save/restore last document in localStorage (currently only preferences persist).
- Better multi-page PDF handling UX (page-range picker for very long PDFs).

### P1
- Reading progress bar / scroll indicator over the reader canvas.
- Keyboard shortcuts (space to scroll, `t` to toggle theme, `[`/`]` for fixation).
- Multi-language OCR (Tesseract supports many languages — expose a dropdown).
- Import from Kindle-style .epub.

### P2
- Focus-line ruler that follows the cursor.
- TTS playback of loaded text.
- Shareable read-only permalinks (would require backend storage).

## Next tasks
- Await user feedback on the current build before deepening any feature.
