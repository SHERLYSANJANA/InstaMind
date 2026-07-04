import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AppHeader from "@/components/AppHeader";
import ControlPanel from "@/components/ControlPanel";
import BionicReader from "@/components/BionicReader";
import { useReader } from "@/context/ReaderContext";
import { Toaster } from "@/components/ui/sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SharedReaderPage() {
  const { shareId } = useParams();
  const { set } = useReader();
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API}/share/${shareId}`);
        if (cancelled) return;
        const { text, title, source } = res.data;
        set({ text, sourceLabel: title || source || `Shared · ${shareId}` });
        setState({ loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setState({
          loading: false,
          error: e?.response?.data?.detail || "Could not load shared document",
        });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="max-w-[1400px] mx-auto px-6 py-8 md:py-12">
        <section data-testid="shared-hero" className="mb-8 max-w-[70ch]">
          <div className="label-caps mb-3">Shared Article · Read-only</div>
          <p className="text-sm text-muted-foreground">
            Someone shared this bionic-formatted text with you.{" "}
            <Link to="/" className="underline underline-offset-4 hover:text-foreground" data-testid="shared-home-link">
              Open FocusRead ↗
            </Link>
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
          <div>
            {state.loading ? (
              <div
                data-testid="shared-loading"
                className="border border-border p-12 text-center label-caps"
              >
                Loading shared document…
              </div>
            ) : state.error ? (
              <div
                data-testid="shared-error"
                className="border border-border p-12 text-center"
              >
                <div className="label-caps mb-3">Unavailable</div>
                <p className="text-sm text-muted-foreground">{state.error}</p>
              </div>
            ) : (
              <BionicReader hideShare />
            )}
          </div>
          <ControlPanel />
        </div>
      </main>
      <Toaster theme="system" position="bottom-right" toastOptions={{ className: "rounded-none border border-border font-mono text-xs" }} />
    </div>
  );
}
