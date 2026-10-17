import type { Metadata } from "next";
import { Valeurs } from "@/components/sections/Valeurs";

export const metadata: Metadata = {
  title: "Nos valeurs — BeaverLaunch",
  description:
    "Immersion, simplicité, transparence et accompagnement : les 4 valeurs qui guident BeaverLaunch dans la création de sites immersifs.",
  openGraph: {
    title: "Nos valeurs — BeaverLaunch",
    description:
      "Immersion, simplicité, transparence et accompagnement : les 4 valeurs qui guident BeaverLaunch.",
    url: "https://beaverlaunch.fr/valeurs",
    siteName: "BeaverLaunch",
    locale: "fr_FR",
    type: "website",
  },
};

export default function ValeursPage() {
  return <Valeurs />;
}
