import type { Metadata, Viewport } from "next";
import { themeScript, scrollScript } from "./head-scripts";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";

const TITLE = "Everstock · Supply chain software for physical products";
const DESCRIPTION =
  "Everstock reads your quotes, orders and invoices, finds the right part, and drafts every order for your sign-off. For companies that make, move and sell physical products, with or without an ERP.";
// the hero at 1200×630 (see CLAUDE.md → "v4 port" for how it is regenerated)
const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: TITLE };
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
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
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
  viewportFit: "cover",
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
        "Supply chain software for companies that make, move and sell physical products: it reads quotes, orders and invoices and drafts every order for your sign-off.",
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
      <body>
        {children}
        <FeedbackDialog />
      </body>
    </html>
  );
}
