import { SERVICE_AREA } from "./cities";

export function injectStructuredData() {
  const id = "doco-structured-data";
  if (document.getElementById(id)) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://docoexteriors.com",
    name: "DOCO Exteriors",
    description:
      "DOCO Exteriors provides superior roofing, siding, windows, and gutters across the greater Minneapolis metro. Get a free estimate today.",
    url: "https://docoexteriors.com",
    telephone: "",
    address: {
      "@type": "PostalAddress",
      addressRegion: "MN",
      addressCountry: "US",
    },
    areaServed: SERVICE_AREA.map((city) => ({
      "@type": "City",
      name: city,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Exterior Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Roofing" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Siding" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Windows" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Gutters" } },
      ],
    },
  };

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
