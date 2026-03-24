import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogType?: string;
}

const DEFAULT_TITLE = "DOCO Exteriors – Minneapolis Roofing, Siding, Windows & Gutters";
const DEFAULT_DESCRIPTION =
  "DOCO Exteriors provides superior roofing, siding, windows, and gutters across the greater Minneapolis metro. Get a free estimate today.";

function upsertMeta(attr: "name" | "property", value: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  ogType = "website",
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
  }, [title, description, ogType]);

  return null;
}
