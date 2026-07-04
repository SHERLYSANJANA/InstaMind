# FocusRead

**A high-tech, minimalistic bionic reader.** Turn any source — pasted text, PDFs, photos, or web URLs — into focused, fixation-anchored text designed to make your eyes read faster and your mind wander less.

---

## Table of Contents

1. [What is Bionic Reading?](#what-is-bionic-reading)
2. [Feature Highlights](#feature-highlights)
3. [Inputs](#inputs-take-anything-give-you-bionic)
4. [Reader Experience](#reader-experience)
5. [Reader Controls](#reader-controls)
6. [Themes](#themes)
7. [Text-to-Speech (Karaoke Mode)](#text-to-speech-karaoke-mode)
8. [Focus & Accessibility](#focus--accessibility)
9. [Sharing & Permalinks](#sharing--permalinks)
10. [Print-to-PDF Broadsheet](#print-to-pdf-broadsheet)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [Session Persistence](#session-persistence)
13. [Privacy & Security](#privacy--security)
14. [Tech Stack](#tech-stack)
15. [Project Structure](#project-structure)
16. [Running Locally](#running-locally)
17. [API Reference](#api-reference)
18. [Roadmap](#roadmap)

---

## What is Bionic Reading?

Bionic Reading bolds the **first few letters** of every word. Your eye lands on those "fixation anchors" and your brain auto-completes the rest through pattern recognition — often letting you read faster with less fatigue and better focus, especially helpful for readers with ADHD, dyslexia, or long-form fatigue.

FocusRead pushes this idea further: **any source you throw at it becomes bionic text**, styled in a clean editorial or newspaper aesthetic, with fine-grained controls.

---

## Feature Highlights

- 🧾 **Four input types** — Paste text, drop a PDF, upload an image (OCR), or paste a URL
- 🎯 **Bionic engine** with 3 fixation strengths (Light / Normal / Strong)
- 🖼️ **Live previews** for every uploaded PDF (page carousel), image (thumbnail), or URL (title + snippet + word count)
- 📰 **Three refined themes**: Paper (cream), Ink (charcoal), and **Newspaper** (blackletter masthead, halftone rules, cream newsprint)
- 🗞️ **Multi-column news layout** — real 2-column broadsheet reading in Newspaper theme
- 🌍 **Multi-language OCR** — 13 Tesseract language packs (English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Arabic, Hindi, Chinese, Japanese, Korean)
- 🔊 **Karaoke-style TTS** — Web Speech API playback with **word-by-word live highlighting** as it reads
- 🎙️ **TTS voice picker** — pick any voice installed on your device
- 📏 **Focus-line ruler** — a subtle band that follows your mouse to keep your eye locked on the current line
- 📊 **Reading progress bar** — thin top strip tracks how far through the article you are
- 🔗 **Shareable read-only permalinks** — one click generates a `/r/{id}` link, complete with a **QR code** for phone hand-off
- 🖨️ **Print-to-PDF broadsheet export** — the current article rendered as a real newspaper (blackletter masthead, 2 justified columns, halftone rules, A4-ready)
- ⌨️ **Keyboard shortcuts** for theme, fixation, and scrolling
- 💾 **Session persistence** — your document and every preference are restored on reload
- 🔒 **No login, no tracking** — pure tool; OCR & PDF parsing happen 100% in your browser

---

## Inputs — Take Anything, Give You Bionic

FocusRead exposes four input surfaces via a tabbed panel:

| Tab | Source | How it works |
|-----|--------|--------------|
| **Text** | Paste / type | Instant conversion. "Insert sample →" fills in a demo passage. |
| **PDF** | Drop file or browse | `pdfjs-dist` extracts text page-by-page in your browser. Preview: **scroll-snapping carousel of up to 20 page thumbnails** (labeled `p. 1`, `p. 2` …) plus file size and total page count. |
| **Image** | Drop file or browse | `tesseract.js` OCR runs locally in a Web Worker. Preview: image thumbnail with filename + file size. Choose from 13 OCR languages before uploading. |
| **URL** | Paste any URL | Backend fetches the page (server-side) and uses `readability-lxml` + `BeautifulSoup` to extract the readable article body. Preview: article title, source link, first-260-char snippet, word count. |

All previews include **Replace** and **Clear** actions.

---

## Reader Experience

Once your source is converted, the reader canvas takes over:

- **Word tokens** — each word is split into a bolded head (`<b>` in near-black) and a dimmed tail. Punctuation, hyphens, apostrophes, and unicode letters (`\p{L}`) are all handled.
- **Live word count & reading time** — shown in the reader header (240 wpm default).
- **Copy** — grab the plain text for pasting elsewhere.
- **Export** — download the extracted text as `focusread-export.txt`.
- **Clear** — reset the reader.

---

## Reader Controls

A sticky sidebar (`Controls`) exposes:

- **Theme** — Paper / Ink / Newspaper (segmented)
- **Fixation strength** — Light / Normal / Strong (segmented)
- **Typeface** — Spectral (serif) / IBM Plex Sans / JetBrains Mono
- **Font size** — 14 → 32 px
- **Line height** — 1.30 → 2.20
- **Reading width** — 40 → 95 characters per line
- **Reset defaults** — one click restores factory settings while keeping your document

All controls are persisted to `localStorage`.

---

## Themes

All three themes are strictly **black & white** — no color accents, ever.

| Theme | Vibe |
|-------|------|
| **Paper** ☀️ | Warm cream background, hard-black type. The default reading-paper look. |
| **Ink** 🌙 | Deep charcoal background, warm off-white type. For night reading. |
| **Newspaper** 📰 | Newsprint-cream page, **blackletter FocusRead masthead**, double-rule dividers, halftone dot bars, italic Old-Standard-TT hero, and a **2-column justified article** with column rule. |

Switching themes updates the entire chrome — the app header even swaps to a full newspaper nameplate ("Vol. I · No. 1 · Bionic Reading Edition · Late Edition") when Newspaper is active.

---

## Text-to-Speech (Karaoke Mode)

Powered by the Web Speech API (no server, no external key):

- **Listen / Pause / Resume / Stop** buttons in the reader header
- **Word-level live highlighting** — the currently-spoken word gets a subtle background + outline as the voice moves through the text. Powered by `SpeechSynthesisUtterance.onboundary`, driven by real per-word character offsets emitted by the bionic tokenizer.
- **Voice picker** — enumerates every voice installed on your device (`speechSynthesis.getVoices()`), sorted by language. "System default" fallback for any browser.

---

## Focus & Accessibility

- **Focus-line ruler** — toggleable overlay band that tracks your mouse's Y position inside the reader; ideal for readers who lose their place.
- **Reading progress bar** — a 3-pixel top strip fills 0 → 100% as you scroll through the article.
- **High-contrast** black & white palette in every theme, with a `::selection` rule that reverses colors for legibility.
- **Full keyboard-driven experience** (see shortcuts below).
- **`data-testid` attributes** on every interactive element for reliable automation & assistive tech.

---

## Sharing & Permalinks

Click **Share** in the reader header to instantly turn your bionic article into a public link:

1. Backend saves the article to MongoDB (`shares` collection) and returns a compact 10-character id.
2. A dialog opens showing:
   - The full URL (`https://your-domain/r/{id}`)
   - A **128 × 128 black-and-white QR code** (SVG, powered by `qrcode.react`) — scan with your phone to open the read on mobile.
   - **Copy link** button (link is also copied automatically).
3. Anyone opening `/r/{id}` sees a **read-only** version of the article with all reader controls intact — but no Share / Clear buttons.

Max 500 KB per share. Ids are unguessable random hex.

---

## Print-to-PDF Broadsheet

Click **Print** in the reader header (works on any theme) and your browser opens the native print sheet. Choose "Save as PDF" and you get a stunning A4 broadsheet:

- Newsprint-cream page (`#f2ede4`)
- Top nameplate: `Vol. I · No. 1 | Bionic Reading Edition | <today's date>`
- Blackletter **FocusRead** masthead
- Second nameplate: `The Reader's Daily | N words · N min read | Late Edition`
- Kicker + italic-serif article title + halftone dot rule
- **2-column, justified bionic body** with a vertical column rule
- Double-rule footer: `— Printed with FocusRead —`

Everything renders via a pure CSS `@media print` block — no libraries, no server round-trip.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **T** | Cycle theme: Paper → Ink → Newspaper |
| **[** | Decrease fixation strength |
| **]** | Increase fixation strength |
| **Space** | Scroll page (browser default) |

Shortcuts are disabled while typing in inputs / textareas. A small keyboard-icon button in the reader header opens a tooltip listing them.

---

## Session Persistence

Everything survives a full page reload — because it's all in `localStorage`:

- The last converted document (up to 250 KB)
- Source label ("PDF · thesis.pdf", "https://…", etc.)
- Theme, fixation strength, font family, font size, line height, reading width
- OCR language choice
- TTS voice choice

No account. No cloud. It's all on your machine.

---

## Privacy & Security

- **PDF parsing** runs entirely in your browser via `pdfjs-dist` (Web Worker).
- **Image OCR** runs entirely in your browser via `tesseract.js` (Web Worker).
- **URL extraction** is the only network call — the backend fetches the page server-side to bypass CORS, extracts readable text with `readability-lxml`, and returns it. Nothing is stored.
- **Shares** are stored in MongoDB only when you explicitly click Share. Ids are random 10-char hex; there is no listing endpoint.
- **No auth, no analytics, no tracking.**

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19, React Router, Tailwind CSS, shadcn/ui |
| PDF parsing | `pdfjs-dist` (client-side) |
| OCR | `tesseract.js` (client-side, 13 languages) |
| TTS | Web Speech API (`speechSynthesis`) |
| QR codes | `qrcode.react` |
| Backend | FastAPI, MongoDB (Motor) |
| URL extraction | `readability-lxml` + `BeautifulSoup` + `requests` |
| Fonts | Outfit (UI), Spectral (serif), IBM Plex Sans, JetBrains Mono, Old Standard TT (news), UnifrakturCook (blackletter masthead) |

---

## Project Structure

```
/app
├── backend/
│   ├── server.py                  # FastAPI app: /api/extract-url, /api/share, /api/share/{id}
│   ├── requirements.txt
│   └── .env                       # MONGO_URL, DB_NAME, CORS_ORIGINS
└── frontend/
    ├── public/index.html          # Google Fonts imports (Outfit, Spectral, UnifrakturCook, …)
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.js                 # Routes: "/" and "/r/:shareId"
        ├── index.css              # Theme tokens + Newspaper textures + print broadsheet CSS
        ├── App.css
        ├── context/
        │   └── ReaderContext.jsx  # State, persistence, keyboard shortcuts
        ├── lib/
        │   ├── bionic.js          # Tokenizer with per-word char offsets
        │   └── inputHandlers.js   # PDF thumbs + text, image OCR, URL fetch
        ├── components/
        │   ├── AppHeader.jsx
        │   ├── InputPanel.jsx     # 4 tabs + all previews + OCR language dropdown
        │   ├── ControlPanel.jsx   # Theme/Fixation/Font/Size/Line/Width/Reset
        │   ├── BionicReader.jsx   # Reader canvas, TTS, ruler, share, print
        │   ├── BionicText.jsx     # Renders paragraphs with active-word highlighting
        │   ├── ReadingProgress.jsx
        │   └── PrintBroadsheet.jsx  # Hidden on screen, revealed for print
        └── pages/
            ├── ReaderPage.jsx        # Main workspace
            └── SharedReaderPage.jsx  # /r/:shareId read-only view
```

---

## Running Locally

Prerequisites: Node 20+, Yarn, Python 3.11+, MongoDB.

```bash
# Backend
cd /app/backend
pip install -r requirements.txt
# .env needs: MONGO_URL, DB_NAME, CORS_ORIGINS
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (separate terminal)
cd /app/frontend
yarn install
yarn start   # runs on :3000, expects REACT_APP_BACKEND_URL in .env
```

In this hosted environment, supervisor manages both processes. Restart with:
```bash
sudo supervisorctl restart backend frontend
```

---

## API Reference

Base path: `/api`

### `GET /`
Health check → `{ "message": "FocusRead API online" }`

### `POST /extract-url`
Fetch and clean an article body.

**Request**
```json
{ "url": "https://en.wikipedia.org/wiki/Reading" }
```

**Response**
```json
{
  "title": "Reading",
  "text": "Reading is the process of taking in ...",
  "source_url": "https://en.wikipedia.org/wiki/Reading",
  "word_count": 4213
}
```

Errors: `400` for empty / unreachable URL, `422` if no text extractable.

### `POST /share`
Create a public read-only share.

**Request**
```json
{ "text": "…", "title": "Optional", "source": "Optional" }
```

**Response**
```json
{ "id": "a42cece3cc" }
```

Errors: `400` if empty, `413` if `text` > 500 KB.

### `GET /share/{share_id}`
Fetch a previously created share.

**Response**
```json
{
  "id": "a42cece3cc",
  "text": "…",
  "title": "…",
  "source": "…",
  "created_at": "2026-02-04T09:12:33.812+00:00",
  "word_count": 5
}
```

Errors: `404` if not found.

---

## Roadmap

Ideas we might add next:

- 🎚️ **TTS rate & pitch sliders** with per-voice memory
- 🗑️ **Owner-delete for shares** (localStorage-scoped owner token → `DELETE /api/share/:id`)
- 📚 **IndexedDB Library** — auto-save every processed document for later re-reading (great retention lever)
- 🖼️ **Social OG preview cards** for `/r/:id` links so Slack / X / WhatsApp / iMessage unfurl into a broadsheet-styled image
- 📸 **PNG snapshot export** — save the current bionic view as a shareable poster with a QR back to FocusRead
- 📈 **Reader stats** — total minutes saved, articles read, favorite fixation strength

---

**Made for readers who want to read more and read better.**  
Built with FastAPI, React, Tailwind, shadcn/ui and love for typography.
