import { useEffect, useState } from "react";

// 768px 以下视为移动端
export function useResponsive(): { isMobile: boolean } {
  const query = "(max-width: 767px)";
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return { isMobile };
}
