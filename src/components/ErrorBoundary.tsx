"use client";

import { Component, type ReactNode } from "react";

interface State {
  hasError: boolean;
}

/** Safety net: never show a frozen/white screen — offer a friendly reload. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // silent: no third-party reporting; kids don't need stack traces
    console.warn("Magic Coloring World recovered from:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-[100dvh] place-items-center bg-[#FFF8FC] p-6 text-center">
          <div>
            <div className="text-7xl">🧸</div>
            <h1 className="mt-3 text-2xl font-black text-[#3B2E5A]">Oops! A little tumble happened</h1>
            <p className="mt-2 font-bold text-[#6B5B8A]">لا تقلق! كل رسوماتك محفوظة بأمان. دوس الزرار ونكمّل.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/play";
              }}
              className="mt-5 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] px-8 py-4 text-lg font-black text-white shadow-lg active:scale-95"
            >
              ▶ Keep playing
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
