// Client-side input processors: PDF text extraction, image OCR, URL fetch.
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ----------------------------- PDF ----------------------------- */
let _pdfjs = null;
async function getPdfjs() {
  if (_pdfjs) return _pdfjs;
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  // Use worker via CDN matching installed version to avoid bundler issues
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  _pdfjs = pdfjs;
  return pdfjs;
}

export async function extractTextFromPDF(file, onProgress) {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Reconstruct lines using item positions
    const items = content.items;
    let lastY = null;
    let line = [];
    const lines = [];
    for (const it of items) {
      const y = it.transform ? it.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
        lines.push(line.join(" "));
        line = [];
      }
      line.push(it.str);
      lastY = y;
    }
    if (line.length) lines.push(line.join(" "));
    pageTexts.push(lines.join("\n"));
    if (onProgress) onProgress({ page: i, total: numPages });
  }
  return pageTexts.join("\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

/* ----------------------------- OCR (image) ----------------------------- */
let _tesseract = null;
async function getTesseract() {
  if (_tesseract) return _tesseract;
  const mod = await import("tesseract.js");
  _tesseract = mod;
  return mod;
}

export async function extractTextFromImage(file, onProgress) {
  const { createWorker } = await getTesseract();
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (onProgress && m.status === "recognizing text") {
        onProgress({ progress: m.progress });
      }
    },
  });
  try {
    const { data } = await worker.recognize(file);
    return (data.text || "").trim();
  } finally {
    await worker.terminate();
  }
}

/* ----------------------------- URL ----------------------------- */
export async function extractTextFromURL(url) {
  const res = await axios.post(`${API}/extract-url`, { url }, { timeout: 25000 });
  return res.data;
}
