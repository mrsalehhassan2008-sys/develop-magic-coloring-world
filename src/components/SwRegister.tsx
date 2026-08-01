"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // register after load so it never blocks first paint / 60fps startup
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is progressive — ignore failures */
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
