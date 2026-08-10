import { useEffect } from "react";

export function useViewportHeightSync() {
  useEffect(() => {
    const viewport = window.visualViewport;

    const syncHeight = () => {
      const height = viewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    };

    syncHeight();
    viewport?.addEventListener("resize", syncHeight);
    window.addEventListener("resize", syncHeight);

    return () => {
      viewport?.removeEventListener("resize", syncHeight);
      window.removeEventListener("resize", syncHeight);
    };
  }, []);
}
