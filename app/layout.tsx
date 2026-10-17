import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ExpandTransition } from "@/components/transition/ExpandTransition";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BeaverLaunch — Des sites immersifs qui mettent des étoiles dans les yeux de vos futurs clients",
  description:
    "BeaverLaunch crée, lance et héberge des sites web immersifs pour les acteurs de l'événementiel et de l'activité. Réservations pleines, conversion boostée.",
  metadataBase: new URL("https://beaverlaunch.fr"),
  openGraph: {
    title: "BeaverLaunch — Sites immersifs pour l'événementiel",
    description:
      "Création, lancement et hébergement de sites web immersifs pour les acteurs de l'événementiel et de l'activité.",
    url: "https://beaverlaunch.fr",
    siteName: "BeaverLaunch",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "BeaverLaunch", description: "Sites immersifs pour l'événementiel." },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BeaverLaunch",
  url: "https://beaverlaunch.fr",
  description: "Agence de création, lancement et hébergement de sites web immersifs.",
  email: "bonjour@beaverlaunch.fr",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${dmSans.variable} h-full scroll-smooth antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ExpandTransition />
        <div id="site-shell" className="flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
