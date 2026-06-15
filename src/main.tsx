import { Component, ErrorInfo, ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("RoomRental app crashed:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl border border-rose-500/30 bg-slate-900 p-8 shadow-2xl">
          <div className="text-sm font-black text-rose-300 uppercase tracking-widest">App could not start</div>
          <h1 className="mt-2 text-3xl font-black">Firebase environment variables may be missing</h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Check Vercel or Cloudflare Pages environment variables and add all required VITE_FIREBASE_* keys. Also verify Firebase Auth, Firestore and Storage are enabled.
          </p>
          <pre className="mt-4 overflow-auto rounded-2xl bg-black/40 p-4 text-xs text-rose-200">{this.state.message}</pre>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
