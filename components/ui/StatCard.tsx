"use client";

import { useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";

type StatCardProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

/**
 * Carte stat : bordure terracotta 1px, radius 24px.
 * Compteur animé + tilt 3D + reflet au survol (desktop).
 */
export function StatCard({ value, prefix = "", suffix = "", label }: StatCardProps) {
  const numRef = useCountUp(value);
  const cardRef = useRef<HTMLElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent): void => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
    const glare = glareRef.current;
    if (glare) {
      glare.style.opacity = "1";
      glare.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.55), transparent 60%)`;
    }
  };

  const onLeave = (): void => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <article
      ref={cardRef as React.RefObject<HTMLElement>}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="stat-card relative overflow-hidden rounded-[24px] border border-terracotta bg-[#F7F2DF] px-6 py-10 text-center transition-transform duration-200 will-change-transform"
    >
      <div ref={glareRef} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300" aria-hidden="true" />
      <p className="text-5xl font-bold text-slate-blue md:text-6xl">
        {prefix}
        <span ref={numRef}>0</span>
        {suffix}
      </p>
      <p className="mt-4 text-base leading-relaxed text-mist md:text-lg">{label}</p>
    </article>
  );
}
