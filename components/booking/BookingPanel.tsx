"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Clock, Send } from "lucide-react";
import { bookingSchema, SLOTS, PROJECT_TYPES, formatFrenchDate, toISODate, type BookingInput } from "@/lib/booking";
import { SuccessCheck } from "@/components/booking/SuccessCheck";
import { cx } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"] as const;
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
] as const;

type Status = "idle" | "sending" | "success";

/** Calendrier de prise de rendez-vous : mois → créneau → formulaire → confirmation. */
export function BookingPanel() {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", phone: "", projectType: "creation", message: "" },
  });

  // ——— Grille du mois (semaine commençant le lundi) ———
  const cells = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(year, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const arr: Array<string | null> = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d += 1) arr.push(toISODate(new Date(year, m, d)));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [month]);

  const isDisabled = (iso: string): boolean => {
    const [y, m, d] = iso.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();
    return iso < todayISO || day === 0 || day === 6; // passé + week-ends
  };
  const isCurrentMonth = month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth();

  const goToPrev = (): void => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goToNext = (): void => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const onSelectDate = (iso: string): void => {
    if (isDisabled(iso)) return;
    setDate(iso);
    setSlot(null);
  };

  const onSubmit = async (values: BookingInput): Promise<void> => {
    if (!date || !slot) return;
    setStatus("sending");
    setRequestError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, date, slot }),
      });
      const data: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Une erreur est survenue.");
      setStatus("success");
      reset();
    } catch (error) {
      setStatus("idle");
      setRequestError(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  const fieldClass = (hasError: boolean): string =>
    cx(
      "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-neutral-900 outline-none transition-colors placeholder:text-mist focus:border-forest focus:ring-2 focus:ring-forest/25",
      hasError ? "border-terracotta" : "border-mist/70",
    );

  return (
    <div className="rounded-[24px] border border-terracotta bg-paper p-5 shadow-[0_20px_40px_-20px_rgba(176,95,63,0.35)] md:p-7">
      {status === "success" && date && slot ? (
        <div className="flex flex-col items-center py-6 text-center">
          <SuccessCheck />
          <h4 className="mt-5 text-xl font-bold text-forest">Rendez-vous confirmé</h4>
          <p className="mt-2 text-[17px] text-slate-blue">
            {formatFrenchDate(date)} à <strong className="text-terracotta">{slot}</strong>
          </p>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-mist">
            Un email de confirmation vient de vous être envoyé. Nous vous recontactons très vite !
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setDate(null);
              setSlot(null);
            }}
            className="mt-6 rounded-full border border-slate-blue px-6 py-2.5 text-sm font-medium text-slate-blue transition-colors hover:bg-slate-blue hover:text-white"
          >
            Prendre un autre rendez-vous
          </button>
        </div>
      ) : (
        <>
          {/* — Calendrier — */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrev}
              disabled={isCurrentMonth}
              aria-label="Mois précédent"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-blue transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="text-base font-bold text-terracotta" aria-live="polite">
              {MONTHS[month.getMonth()]} {month.getFullYear()}
            </p>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Mois suivant"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-blue transition-colors hover:bg-sand"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Choisir un jour">
            {WEEKDAYS.map((w, i) => (
              <span key={`${w}-${i}`} className="py-1 text-xs font-bold uppercase text-mist">
                {w}
              </span>
            ))}
            {cells.map((iso, i) => {
              if (!iso) return <span key={`blank-${i}`} aria-hidden="true" />;
              const disabled = isDisabled(iso);
              const isSelected = date === iso;
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectDate(iso)}
                  aria-pressed={isSelected}
                  aria-label={`${Number(iso.slice(8))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`}
                  className={cx(
                    "relative aspect-square rounded-full text-sm transition-all duration-200",
                    disabled && "cursor-not-allowed text-mist/40 line-through",
                    !disabled && !isSelected && "text-slate-blue hover:bg-sand",
                    isSelected && "bg-forest font-bold text-white shadow-[0_6px_14px_-6px_rgba(45,79,56,0.8)]",
                  )}
                >
                  {Number(iso.slice(8))}
                  {isToday && !isSelected && (
                    <span className="pointer-events-none absolute inset-1 rounded-full border-2 border-terracotta" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* — Créneaux — */}
          <AnimatePresence>
            {date && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-5 border-t border-dashed border-terracotta/50 pt-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-blue">
                    <Clock size={15} aria-hidden="true" /> Créneaux disponibles
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SLOTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        aria-pressed={slot === s}
                        className={cx(
                          "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                          slot === s
                            ? "scale-[1.04] bg-forest text-white shadow-[0_8px_18px_-8px_rgba(45,79,56,0.9)]"
                            : "border border-terracotta/70 bg-white text-slate-blue hover:bg-sand",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* — Formulaire — */}
          <AnimatePresence>
            {slot && (
              <motion.form
                key="booking-form"
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: -16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -16, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
                noValidate
              >
                <div className="mt-5 space-y-4 border-t border-dashed border-terracotta/50 pt-5">
                  <p className="text-sm text-mist">
                    <strong className="text-terracotta">{date ? formatFrenchDate(date) : ""}</strong> à{" "}
                    <strong className="text-terracotta">{slot}</strong>
                  </p>

                  <div>
                    <label htmlFor="booking-name" className="mb-1.5 block text-sm font-medium text-slate-blue">
                      Nom *
                    </label>
                    <input id="booking-name" type="text" autoComplete="name" placeholder="Marie Dupont" className={fieldClass(!!errors.name)} {...register("name")} />
                    {errors.name && <p className="mt-1 text-sm text-terracotta">{errors.name.message}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="booking-email" className="mb-1.5 block text-sm font-medium text-slate-blue">
                        Email *
                      </label>
                      <input id="booking-email" type="email" autoComplete="email" placeholder="marie@exemple.fr" className={fieldClass(!!errors.email)} {...register("email")} />
                      {errors.email && <p className="mt-1 text-sm text-terracotta">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="booking-phone" className="mb-1.5 block text-sm font-medium text-slate-blue">
                        Téléphone (optionnel)
                      </label>
                      <input id="booking-phone" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" className={fieldClass(!!errors.phone)} {...register("phone")} />
                      {errors.phone && <p className="mt-1 text-sm text-terracotta">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking-type" className="mb-1.5 block text-sm font-medium text-slate-blue">
                      Type de projet *
                    </label>
                    <select id="booking-type" className={fieldClass(!!errors.projectType)} {...register("projectType")}>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    {errors.projectType && <p className="mt-1 text-sm text-terracotta">{errors.projectType.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="booking-message" className="mb-1.5 block text-sm font-medium text-slate-blue">
                      Votre message *
                    </label>
                    <textarea id="booking-message" rows={4} placeholder="Parlez-nous de votre activité et de vos envies…" className={cx(fieldClass(!!errors.message), "resize-none")} {...register("message")} />
                    {errors.message && <p className="mt-1 text-sm text-terracotta">{errors.message.message}</p>}
                  </div>

                  {requestError && (
                    <p role="alert" className="rounded-xl border border-terracotta bg-white px-4 py-3 text-sm text-terracotta">
                      {requestError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || status === "sending"}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-base font-medium text-[#F5F1E0] transition-all hover:bg-[#23402c] active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
                  >
                    <Send size={18} aria-hidden="true" />
                    {status === "sending" ? "Envoi en cours…" : "Confirmer le rendez-vous"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
