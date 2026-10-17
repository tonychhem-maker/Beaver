import { NextResponse } from "next/server";
import { Resend } from "resend";
import { bookingRequestSchema, formatFrenchDate, PROJECT_TYPES } from "@/lib/booking";

const AGENCY_EMAIL = process.env.BOOKING_TO_EMAIL ?? "bonjour@beaverlaunch.fr";
const FROM_EMAIL = process.env.EMAIL_FROM ?? "BeaverLaunch <onboarding@resend.dev>";

function htmlShell(title: string, body: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#EBE7D0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <p style="font-size:22px;font-weight:700;color:#B05F3F;margin:0 0 16px;">BeaverLaunch</p>
    <div style="background:#EEF1F6;border:1px solid #B05F3F;border-radius:24px;padding:24px;">
      <h1 style="font-size:18px;color:#3F5F85;margin:0 0 12px;">${title}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#3F5F85;margin-top:16px;">© 2026 BeaverLaunch — des sites immersifs pour l'événementiel.</p>
  </div></body></html>`;
}

/**
 * POST /api/booking — valide la réservation (Zod) puis envoie les
 * emails de confirmation via Resend. Sans RESEND_API_KEY (dev),
 * la réservation est journalisée et confirmée en local.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const payload: unknown = await req.json();
    const parsed = bookingRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Les données du formulaire sont invalides." },
        { status: 400 },
      );
    }

    const { name, email, phone, projectType, message, date, slot } = parsed.data;
    const typeLabel = PROJECT_TYPES.find((t) => t.value === projectType)?.label ?? projectType;
    const dateLabel = formatFrenchDate(date);

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const rows = [
        `<tr><td style="padding:4px 0;color:#9DB0CB;">Date</td><td style="padding:4px 0;color:#2D4F38;font-weight:700;">${dateLabel}</td></tr>`,
        `<tr><td style="padding:4px 0;color:#9DB0CB;">Heure</td><td style="padding:4px 0;color:#2D4F38;font-weight:700;">${slot}</td></tr>`,
        `<tr><td style="padding:4px 0;color:#9DB0CB;">Projet</td><td style="padding:4px 0;color:#2D4F38;font-weight:700;">${typeLabel}</td></tr>`,
        `<tr><td style="padding:4px 0;color:#9DB0CB;">Client</td><td style="padding:4px 0;color:#2D4F38;font-weight:700;">${name} — ${email}${phone ? ` — ${phone}` : ""}</td></tr>`,
      ].join("");

      const agency = await resend.emails.send({
        from: FROM_EMAIL,
        to: [AGENCY_EMAIL],
        replyTo: email,
        subject: `Nouveau rendez-vous — ${name} — ${dateLabel} ${slot}`,
        html: htmlShell(
          "Nouvelle demande de rendez-vous",
          `<table style="width:100%;font-size:14px;">${rows}</table>
           <p style="font-size:14px;color:#3F5F85;margin-top:16px;">Message : ${message.replace(/</g, "&lt;")}</p>`,
        ),
      });
      if (agency.error) throw new Error(agency.error.message);

      const confirmation = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: `Votre rendez-vous BeaverLaunch est confirmé — ${dateLabel} à ${slot}`,
        html: htmlShell(
          `Bonjour ${name}, votre rendez-vous est confirmé`,
          `<table style="width:100%;font-size:14px;">${rows}</table>
           <p style="font-size:14px;color:#3F5F85;margin-top:16px;">Nous vous répondrons dans les plus brefs délais. À très vite !</p>`,
        ),
      });
      if (confirmation.error) throw new Error(confirmation.error.message);
    } else {
      console.info("[booking] RESEND_API_KEY absente — réservation enregistrée en local :", {
        name,
        email,
        date,
        slot,
        typeLabel,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[booking] Échec de l'envoi :", error);
    return NextResponse.json(
      { ok: false, error: "L'envoi a échoué. Réessayez ou écrivez-nous à bonjour@beaverlaunch.fr." },
      { status: 500 },
    );
  }
}
