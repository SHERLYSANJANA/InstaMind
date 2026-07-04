import { useCallback, useEffect, useRef, useState } from "react";
import { useReader } from "@/context/ReaderContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Link2, Type, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  extractTextFromImage,
  extractTextFromPDF,
  extractTextFromURL,
  renderPDFPreview,
  humanBytes,
} from "@/lib/inputHandlers";

const SAMPLE = `The quick brown fox jumps over the lazy dog. Bionic reading works by drawing your eye to fixation points on each word, helping your brain complete the rest through pattern recognition.

This technique is especially useful for people with attention difficulties, but it can accelerate reading for anyone. Try pasting an article, uploading a PDF, or dropping a scanned image — everything you feed in becomes focused, readable text.`;

function DotLoader({ label }) {
  return (
    <div className="dot-loader flex items-center gap-1 text-xs font-mono text-muted-foreground">
      <span>{label}</span><span>.</span><span>.</span><span>.</span>
    </div>
  );
}

export default function InputPanel() {
  const { set, text: currentText } = useReader();
  const [tab, setTab] = useState("text");
  const [pasted, setPasted] = useState("");
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(null);
  const [progress, setProgress] = useState(null);

  // Previews per input kind
  const [imagePreview, setImagePreview] = useState(null); // { name, size, url }
  const [pdfPreview, setPdfPreview] = useState(null);      // { name, size, pages, thumbnail }
  const [urlPreview, setUrlPreview] = useState(null);      // { title, source_url, snippet, word_count }

  const pdfInputRef = useRef(null);
  const imgInputRef = useRef(null);

  // Revoke object URL when image preview replaced/unmounted
  useEffect(() => {
    return () => {
      if (imagePreview?.url) URL.revokeObjectURL(imagePreview.url);
    };
  }, [imagePreview]);

  const applyText = useCallback(
    (t, label) => {
      const clean = (t || "").trim();
      if (!clean) { toast.error("No text was extracted"); return; }
      set({ text: clean, sourceLabel: label || "" });
      toast.success(`Loaded ${clean.split(/\s+/).length} words`);
    },
    [set]
  );

  const handlePDF = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF file"); return;
    }
    setPdfPreview({ name: file.name, size: file.size, pages: null, thumbnail: null });
    setProcessing("Rendering preview");
    try {
      const { thumbnail, pages, _pdfDoc } = await renderPDFPreview(file);
      setPdfPreview({ name: file.name, size: file.size, pages, thumbnail });
      setProcessing("Extracting PDF");
      setProgress(null);
      const t = await extractTextFromPDF(_pdfDoc, (p) => setProgress(`page ${p.page}/${p.total}`));
      applyText(t, `PDF · ${file.name}`);
    } catch (e) {
      console.error(e);
      toast.error("PDF extraction failed");
    } finally {
      setProcessing(null);
      setProgress(null);
    }
  };

  const handleImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload a valid image"); return; }
    if (imagePreview?.url) URL.revokeObjectURL(imagePreview.url);
    setImagePreview({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
    setProcessing("Running OCR");
    setProgress(null);
    try {
      const t = await extractTextFromImage(file, (p) => setProgress(`${Math.round(p.progress * 100)}%`));
      applyText(t, `Image · ${file.name}`);
    } catch (e) {
      console.error(e);
      toast.error("OCR failed");
    } finally {
      setProcessing(null);
      setProgress(null);
    }
  };

  const handleURL = async () => {
    if (!url.trim()) { toast.error("Enter a URL first"); return; }
    setProcessing("Fetching URL");
    try {
      const data = await extractTextFromURL(url.trim());
      setUrlPreview({
        title: data.title || data.source_url,
        source_url: data.source_url,
        snippet: (data.text || "").slice(0, 260),
        word_count: data.word_count,
      });
      applyText(data.text, data.title ? data.title : data.source_url);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Could not fetch that URL");
    } finally {
      setProcessing(null);
    }
  };

  const handlePasteApply = () => {
    applyText(pasted || SAMPLE, pasted ? "Pasted text" : "Sample text");
  };

  const onDrop = (e, kind) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (kind === "pdf") handlePDF(file);
    else if (kind === "image") handleImage(file);
  };

  return (
    <section data-testid="input-panel" className="bg-[hsl(var(--surface))] border border-border">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="label-caps">Input</span>
          {processing ? (
            <DotLoader label={progress ? `${processing} ${progress}` : processing} />
          ) : (
            <span className="text-xs text-muted-foreground font-mono">
              {currentText ? "Loaded · replace below" : "Choose a source"}
            </span>
          )}
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full rounded-none border-b border-border h-11 bg-transparent p-0 grid grid-cols-4">
          {[
            { v: "text", i: Type, l: "Text" },
            { v: "pdf", i: FileText, l: "PDF" },
            { v: "image", i: ImageIcon, l: "Image" },
            { v: "url", i: Link2, l: "URL" },
          ].map(({ v, i: Icon, l }) => (
            <TabsTrigger
              key={v}
              value={v}
              data-testid={`input-tab-${v}`}
              className="rounded-none h-full text-xs tracking-[0.14em] uppercase font-medium data-[state=active]:bg-[hsl(var(--surface-secondary))] data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground border-b-2 border-transparent transition-colors"
            >
              <Icon className="h-3.5 w-3.5 mr-2" />
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TEXT */}
        <TabsContent value="text" className="p-5 m-0">
          <Textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            data-testid="input-text-area"
            placeholder="Paste an article, chapter, email, brief… anything with words."
            className="min-h-[220px] rounded-none border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground text-sm resize-y"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPasted(SAMPLE)}
              data-testid="input-text-sample-btn"
              className="label-caps hover:text-foreground transition-colors"
            >
              Insert sample →
            </button>
            <Button
              onClick={handlePasteApply}
              disabled={!!processing}
              data-testid="input-text-apply-btn"
              className="rounded-none bg-foreground text-background hover:opacity-80 transition-opacity h-9 px-6"
            >
              Convert to Bionic
            </Button>
          </div>
        </TabsContent>

        {/* PDF */}
        <TabsContent value="pdf" className="p-5 m-0">
          {pdfPreview ? (
            <PDFPreviewCard
              preview={pdfPreview}
              onClear={() => setPdfPreview(null)}
              onReplace={() => pdfInputRef.current?.click()}
              processing={processing}
              progress={progress}
            />
          ) : (
            <Dropzone
              testId="input-pdf-dropzone"
              onDrop={(e) => onDrop(e, "pdf")}
              onClick={() => pdfInputRef.current?.click()}
              icon={<FileText className="h-6 w-6" />}
              title="Drop a PDF or click to browse"
              hint="Text will be extracted page-by-page, entirely in your browser."
              disabled={!!processing}
            />
          )}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            data-testid="input-pdf-file"
            onChange={(e) => handlePDF(e.target.files?.[0])}
          />
        </TabsContent>

        {/* IMAGE */}
        <TabsContent value="image" className="p-5 m-0">
          {imagePreview ? (
            <ImagePreviewCard
              preview={imagePreview}
              onClear={() => setImagePreview(null)}
              onReplace={() => imgInputRef.current?.click()}
              processing={processing}
              progress={progress}
            />
          ) : (
            <Dropzone
              testId="input-image-dropzone"
              onDrop={(e) => onDrop(e, "image")}
              onClick={() => imgInputRef.current?.click()}
              icon={<ImageIcon className="h-6 w-6" />}
              title="Drop a photo, screenshot or scan"
              hint="OCR runs locally with Tesseract. Larger images may take a moment."
              disabled={!!processing}
            />
          )}
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            data-testid="input-image-file"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
        </TabsContent>

        {/* URL */}
        <TabsContent value="url" className="p-5 m-0">
          <div className="flex flex-col gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              data-testid="input-url-field"
              className="rounded-none border-border h-11 focus-visible:ring-0 focus-visible:border-foreground text-sm"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground max-w-[36ch]">
                We fetch the page server-side and extract the readable article body.
              </p>
              <Button
                onClick={handleURL}
                disabled={!!processing || !url}
                data-testid="input-url-fetch-btn"
                className="rounded-none bg-foreground text-background hover:opacity-80 transition-opacity h-9 px-6"
              >
                <Upload className="h-3.5 w-3.5 mr-2" />
                Fetch & convert
              </Button>
            </div>
            {urlPreview && (
              <URLPreviewCard preview={urlPreview} onClear={() => setUrlPreview(null)} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

/* ------------------ Sub-components ------------------ */

function Dropzone({ testId, onDrop, onClick, icon, title, hint, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onDrop={(e) => { setHover(false); onDrop(e); }}
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      data-testid={testId}
      role="button"
      tabIndex={0}
      className={`cursor-pointer select-none border border-dashed p-10 md:p-14 flex flex-col items-center justify-center gap-3 transition-colors ${
        hover ? "border-foreground bg-[hsl(var(--surface-secondary))]" : "border-border"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="text-foreground">{icon}</div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground max-w-[36ch] text-center">{hint}</div>
    </div>
  );
}

function PreviewShell({ children, onClear, onReplace, testId, processing, progress }) {
  return (
    <div className="border border-border bg-[hsl(var(--surface))]" data-testid={testId}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="label-caps">Preview</span>
        <div className="flex items-center gap-3">
          {processing && (
            <DotLoader label={progress ? `${processing} ${progress}` : processing} />
          )}
          {onReplace && (
            <button
              onClick={onReplace}
              disabled={!!processing}
              className="label-caps hover:text-foreground transition-colors disabled:opacity-40"
              data-testid={`${testId}-replace`}
            >
              Replace
            </button>
          )}
          <button
            onClick={onClear}
            disabled={!!processing}
            aria-label="Clear preview"
            className="text-foreground hover:opacity-70 transition-opacity disabled:opacity-40"
            data-testid={`${testId}-clear`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ImagePreviewCard({ preview, onClear, onReplace, processing, progress }) {
  return (
    <PreviewShell testId="image-preview" onClear={onClear} onReplace={onReplace} processing={processing} progress={progress}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="border border-border bg-[hsl(var(--surface-secondary))] w-full md:w-56 h-48 md:h-40 flex items-center justify-center overflow-hidden">
          <img
            src={preview.url}
            alt={preview.name}
            data-testid="image-preview-thumb"
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-sm font-medium break-all" data-testid="image-preview-name">{preview.name}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              {humanBytes(preview.size)}
            </div>
          </div>
          <div className="label-caps mt-4">
            {processing ? "OCR in progress" : "OCR complete — text loaded below"}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function PDFPreviewCard({ preview, onClear, onReplace, processing, progress }) {
  return (
    <PreviewShell testId="pdf-preview" onClear={onClear} onReplace={onReplace} processing={processing} progress={progress}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="border border-border bg-[hsl(var(--surface-secondary))] w-full md:w-56 h-56 md:h-64 flex items-center justify-center overflow-hidden">
          {preview.thumbnail ? (
            <img
              src={preview.thumbnail}
              alt="PDF first page"
              data-testid="pdf-preview-thumb"
              className="max-w-full max-h-full object-contain shadow-none"
            />
          ) : (
            <FileText className="h-10 w-10 opacity-40" />
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-sm font-medium break-all" data-testid="pdf-preview-name">{preview.name}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              {humanBytes(preview.size)}{preview.pages ? ` · ${preview.pages} page${preview.pages > 1 ? "s" : ""}` : ""}
            </div>
          </div>
          <div className="label-caps mt-4">
            {processing ? processing : "Extraction complete — text loaded below"}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function URLPreviewCard({ preview, onClear }) {
  return (
    <PreviewShell testId="url-preview" onClear={onClear}>
      <div>
        <div className="text-sm font-medium leading-snug" data-testid="url-preview-title">{preview.title}</div>
        <a
          href={preview.source_url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="url-preview-link"
          className="text-xs font-mono text-muted-foreground hover:text-foreground break-all"
        >
          {preview.source_url}
        </a>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3" data-testid="url-preview-snippet">
          {preview.snippet}{preview.snippet && "…"}
        </p>
        <div className="label-caps mt-3">
          {preview.word_count} words · loaded in reader
        </div>
      </div>
    </PreviewShell>
  );
}
