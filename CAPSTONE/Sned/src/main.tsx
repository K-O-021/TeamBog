import React, { Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}><h1>Something went wrong.</h1><p>Check the browser console for the full error details.</p></div>;
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("Mounting application...");
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("Critical Error: Root element #root not found in index.html");
}
