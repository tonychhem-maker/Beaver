/** Concatène des classes en ignorant les valeurs falsy. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Défile vers une ancre via Lenis (fallback natif). */
export function scrollToTarget(selector: string): void {
  if (typeof window === "undefined") return;
  const el = document.querySelector(selector);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: -80, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
