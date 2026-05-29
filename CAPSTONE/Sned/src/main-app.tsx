import React, { Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Specialized Error Boundary for the Desktop Terminal.
 * Provides a "Restart" option typical of standalone software.
 */
class DesktopErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Terminal Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-10 text-center selection:bg-primary/30">
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mb-6 border border-destructive/50">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter mb-2">TERMINAL CRASH</h1>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-8">
            The SNED-LINK+ Admin Terminal encountered an unrecoverable internal error. System logs have been captured.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            Restart Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("%c[SNED]%c Initializing Desktop Terminal Mode...", "color: #2F4A8A; font-weight: bold", "color: gray");
  createRoot(rootElement).render(
    <React.StrictMode>
      <DesktopErrorBoundary>
        <App />
      </DesktopErrorBoundary>
    </React.StrictMode>
  );
}