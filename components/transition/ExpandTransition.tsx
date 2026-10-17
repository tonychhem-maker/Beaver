"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, registerGsap } from "@/lib/gsap";

type Mode = "push" | "back";
type PendingNav = { href: string; mode: Mode } | null;

type TransitionApi = {
  run: (href: string, origin: DOMRect | null, mode: Mode) => void;
};

let api: TransitionApi | null = null;

/**
 * Navigue avec l'effet d'expansion plein écran (calque `--forest`
 * qui part de la forme du bouton et couvre le viewport).
 *
 * @param href   Destination (ancres `/#offres` acceptées).
 * @param origin Élément ou rect du bouton d'origine (forme de départ / cible du retour).
 * @param mode   "push" (par défaut) ou "back" (history.back).
 */
export function expandNavigate(href: string, origin?: Element | DOMRect | null, mode: Mode = "push"): void {
  if (typeof window === "undefined") return;
  const rect =
    origin instanceof DOMRect ? origin : origin instanceof Element ? origin.getBoundingClientRect() : null;
  if (!api) {
    window.location.assign(href);
    return;
  }
  api.run(href, rect, mode);
}

/**
 * Calque de transition monté dans le layout (persistant entre les routes) :
 * expansion → navigation → rétraction vers le bouton d'origine.
 */
export function ExpandTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<PendingNav>(null);
  const originRef = useRef<DOMRect | null>(null);
  const animatingRef = useRef(false);
  const prevPathRef = useRef(pathname);

  // Centre du calque (au cœur du bouton d'origine s'il existe).
  const center = useCallback((): { cx: number; cy: number } => {
    const o = originRef.current;
    const cx = o ? o.left + o.width / 2 : window.innerWidth / 2;
    const cy = o ? o.top + o.height / 2 : window.innerHeight / 2;
    return { cx: Math.min(Math.max(cx, 0), window.innerWidth), cy: Math.min(Math.max(cy, 0), window.innerHeight) };
  }, []);

  // Nettoie les styles inline du shell (sinon le transform résiduel
  // ferait du header fixe un enfant positionné → plus de sticky).
  const resetShell = useCallback((): void => {
    const shell = document.getElementById("site-shell");
    if (shell) gsap.set(shell, { clearProps: "transform,opacity" });
  }, []);

  const retract = useCallback(
    (hash: string): void => {
      const overlay = overlayRef.current;
      if (!overlay) {
        animatingRef.current = false;
        return;
      }
      const { cx, cy } = center();
      const shell = document.getElementById("site-shell");
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none", opacity: 1, clipPath: "circle(0px at 50% 50%)" });
          resetShell();
          animatingRef.current = false;
          if (hash) {
            const target = document.querySelector(hash);
            const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
            if (target) {
              if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
              else target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        },
      });
      tl.to(overlay, { clipPath: `circle(0px at ${cx}px ${cy}px)`, duration: 0.7, ease: "expo.inOut" }, 0);
      if (shell) tl.to(shell, { scale: 1, opacity: 1, duration: 0.7, ease: "expo.inOut" }, 0);
    },
    [center, resetShell],
  );

  const run = useCallback(
    (href: string, origin: DOMRect | null, mode: Mode): void => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const overlay = overlayRef.current;
      if (reduced || !overlay) {
        if (mode === "back") router.back();
        else router.push(href);
        return;
      }
      if (animatingRef.current) return;
      registerGsap();
      animatingRef.current = true;
      if (origin) originRef.current = origin;

      const { cx, cy } = center();
      const radius =
        Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) * 1.05;

      const shell = document.getElementById("site-shell");
      const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
      lenis?.stop();

      gsap.set(overlay, { display: "block", opacity: 1, clipPath: `circle(0px at ${cx}px ${cy}px)` });
      const tl = gsap.timeline();
      tl.to(overlay, { clipPath: `circle(${radius}px at ${cx}px ${cy}px)`, duration: 0.9, ease: "expo.inOut" }, 0);
      if (shell) tl.to(shell, { scale: 0.96, opacity: 0.6, duration: 0.6, ease: "expo.inOut" }, 0);
      tl.call(() => {
        const hash = href.includes("#") ? `#${href.split("#").slice(1).join("#")}` : "";
        pendingRef.current = { href, mode };
        if (mode === "back") router.back();
        else router.push(href);
        lenis?.start();
        // Filet de sécurité : si la navigation échoue, on rétracte quand même.
        window.setTimeout(() => {
          if (pendingRef.current) {
            pendingRef.current = null;
            retract(hash);
          }
        }, 2500);
      });
    },
    [center, retract, router],
  );

  // Enregistre l'API (accessible hors composant via expandNavigate).
  useEffect(() => {
    api = { run };
    return () => {
      api = null;
    };
  }, [run]);

  // Navigation terminée → rétraction vers le bouton d'origine.
  useEffect(() => {
    if (prevPathRef.current !== pathname && pendingRef.current) {
      const { href } = pendingRef.current;
      pendingRef.current = null;
      const hash = href.includes("#") ? `#${href.split("#").slice(1).join("#")}` : "";
      retract(hash);
    }
    prevPathRef.current = pathname;
  }, [pathname, retract]);

  // Sécurité : ne jamais laisser le shell bloqué si le composant est démonté.
  useEffect(() => {
    const overlay = overlayRef.current;
    return () => {
      resetShell();
      if (overlay) gsap.set(overlay, { display: "none" });
    };
  }, [resetShell]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] bg-forest"
      style={{ display: "none", clipPath: "circle(0px at 50% 50%)" }}
    />
  );
}
