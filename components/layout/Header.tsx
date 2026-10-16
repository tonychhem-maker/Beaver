"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { scrollToTarget, cx } from "@/lib/utils";

const LINKS = [
  { label: "Nos offres", href: "#offres" },
  { label: "Nos services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

/** Header sticky : fond blanc → translucide + ombre après 80px. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(href);
  };

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/70 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md" : "bg-white",
      )}
    >
      <nav aria-label="Navigation principale" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#hero" onClick={go("#hero")} className="text-xl font-bold tracking-tight text-terracotta" aria-label="BeaverLaunch — retour en haut">
          BeaverLaunch
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={go(l.href)} className="text-[15px] font-medium text-slate-blue transition-colors hover:text-terracotta">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          onClick={go("#contact")}
          className="hidden rounded-full bg-forest px-6 py-3 text-sm font-medium text-[#F5F1E0] transition-transform hover:scale-[1.03] active:scale-[0.97] md:inline-flex"
        >
          Parlons de votre projet
        </a>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-blue md:hidden"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </motion.span>
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden border-t border-sand bg-white/95 backdrop-blur-md md:hidden"
          >
            <ul className="space-y-1 px-5 py-4">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <a href={l.href} onClick={go(l.href)} className="block rounded-xl px-3 py-3 text-base font-medium text-slate-blue hover:bg-sand">
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <li className="pt-2">
                <a
                  href="#contact"
                  onClick={go("#contact")}
                  className="block rounded-full bg-forest px-6 py-3 text-center text-sm font-medium text-[#F5F1E0]"
                >
                  Parlons de votre projet
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
