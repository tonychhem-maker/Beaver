import { z } from "zod";

/** Créneaux horaires proposés pour la prise de rendez-vous. */
export const SLOTS = ["9h00", "10h30", "14h00", "16h00"] as const;
export type Slot = (typeof SLOTS)[number];

/** Types de projet proposés dans le formulaire. */
export const PROJECT_TYPES = [
  { value: "creation", label: "Création + lancement" },
  { value: "hebergement", label: "Hébergement" },
  { value: "les-deux", label: "Les deux" },
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];

/** Schéma du formulaire de rendez-vous (côté client, validé par React Hook Form + Zod). */
export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Veuillez saisir votre nom (2 caractères minimum)."),
  email: z.string().trim().email("Veuillez saisir une adresse email valide."),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ().-]{6,20}$/, "Veuillez saisir un numéro de téléphone valide.")
    .optional()
    .or(z.literal("")),
  projectType: z.enum(["creation", "hebergement", "les-deux"], {
    message: "Veuillez choisir un type de projet.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Votre message doit contenir au moins 10 caractères.")
    .max(2000, "Votre message est trop long (2000 caractères maximum)."),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/** Schéma complet envoyé à l'API (formulaire + jour + créneau). */
export const bookingRequestSchema = bookingSchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  slot: z.enum(SLOTS, { message: "Créneau invalide." }),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/** Formatte un ISO YYYY-MM-DD en français long (ex : « vendredi 23 octobre 2026 »). */
export function formatFrenchDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Convertit une Date en ISO local YYYY-MM-DD. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
