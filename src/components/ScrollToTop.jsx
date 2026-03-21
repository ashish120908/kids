import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
      });
    }
  }, [pathname]);

  return null;
}
