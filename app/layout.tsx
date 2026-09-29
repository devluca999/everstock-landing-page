import type { Metadata, Viewport } from "next";
import { themeScript, scrollScript } from "./head-scripts";

const TITLE =
  "Everstock: Sourcing, procurement and data management automation for supply-chain distributors";
const DESCRIPTION =
  "Everstock automates sourcing, procurement, and product-data management. It monitors vendor pricing, flags reorders, keeps SKU records clean, and queues every purchase order for your approval. For supply-chain distributors of auto parts, electronics, and industrial supply, on top of your existing ERP.";
const SITE_URL = "https://tryeverstock.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Everstock",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Everstock",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#16171B",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Everstock",
      url: SITE_URL,
      logo: `${SITE_URL}/logo/logo-mark-dark.svg`,
      description:
        "Sourcing, procurement, and data management automation for mid-market distributors of auto parts, electronics, and industrial supply.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Everstock",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: scrollScript }} />
        {/* the design's <helmet> fonts, as links (the page names these families directly) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500;700&family=Space+Grotesk:wght@700&family=Unbounded:wght@700&family=Anton&family=Syne:wght@700&display=swap"
        />
        <link rel="stylesheet" href="/_ds/everstock-design-system-8b23c388-3b6f-45e0-b4a6-57749b70c168/tokens/fonts.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
