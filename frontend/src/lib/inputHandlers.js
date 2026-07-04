// Client-side input processors: PDF text extraction, image OCR, URL fetch.
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ----------------------------- PDF ----------------------------- */
let _pdfjs = null;
async function getPdfjs() {
  if (_pdfjs) return _pdfjs;
  const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  _pdfjs = pdfjs;
  return pdfjs;
}

/** Render page 1 of a PDF into a small dataURL preview and return page count too. */
export async function renderPDFPreview(file) {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.55 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return {
    thumbnail: canvas.toDataURL("image/png"),
    pages: pdf.numPages,
    _pdfDoc: pdf, // reuse for full extraction to avoid re-parsing
  };
}

export async function extractTextFromPDF(fileOrDoc, onProgress) {
  const pdfjs = await getPdfjs();
  let pdf;
  if (fileOrDoc && typeof fileOrDoc.getPage === "function") {
    pdf = fileOrDoc;
  } else {
    const arrayBuffer = await fileOrDoc.arrayBuffer();
    pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  }
  const numPages = pdf.numPages;
  const pageTexts = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
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

export function humanBytes(n) {
  if (!n && n !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
