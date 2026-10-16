"use client";

import { useRef } from "react";
import { ImageIcon } from "lucide-react";
import { gsap, SplitText, useGSAP, registerGsap } from "@/lib/gsap";
import { PolaroidCard } from "@/components/ui/PolaroidCard";
import { scrollToTarget } from "@/lib/utils";

const LEFT_IMG =
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=640&q=80";
const RIGHT_IMG =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=640&q=80";

/**
 * Hero : titre SplitText, polaroïds qui s'envolent au scroll (pin +=150%),
 * carte centrale qui grandit en portail, flottement idle + parallax souris.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = rootRef.current;
      if (!root) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      const title = q(".hero-title")[0] as HTMLElement;
      const subtitle = q(".hero-subtitle")[0];
      const cta = q(".hero-cta")[0];
      const screen = q(".hero-screen")[0];
      const left = q(".hero-polaroid-left")[0];
      const right = q(".hero-polaroid-right")[0];
      const heroText = q(".hero-text")[0];

      // ——— Intro (après préchargeur ~1.5s) ———
      let split: SplitText | null = null;
      if (!reduced && title) {
        split = new SplitText(title, { type: "lines", linesClass: "hero-line" });
        gsap.set(split.lines, { yPercent: 110 });
        gsap.set([subtitle, cta], { opacity: 0, y: 24 });
        gsap.set(cta, { scale: 0.8 });
        gsap.set(screen, { opacity: 0, y: 80 });
        gsap.set(left, { x: "-110vw", rotation: -30, opacity: 0 });
        gsap.set(right, { x: "110vw", rotation: 30, opacity: 0 });

        const intro = gsap.timeline({ delay: 1.9, defaults: { ease: "expo.out" } });
        intro.to(split.lines, { yPercent: 0, duration: 1.2, stagger: 0.12 });
        intro.to(subtitle, { opacity: 1, y: 0, duration: 0.9 }, "-=0.7");
        intro.to(cta, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.7)" }, "-=0.6");
        intro.to(screen, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.7");
        intro.to(left, { x: 0, rotation: -12, opacity: 1, duration: 1.4, ease: "power4.out" }, "-=0.9");
        intro.to(right, { x: 0, rotation: 10, opacity: 1, duration: 1.4, ease: "power4.out" }, "<+=0.12");
      }

      // ——— Flottement idle (désactivé si reduced-motion) ———
      let floats: gsap.core.Tween[] = [];
      if (!reduced) {
        floats = [
          gsap.to(left, { y: -12, rotation: -11, duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3 }),
          gsap.to(right, { y: 10, rotation: 11, duration: 6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3.4 }),
        ];
      }

      // ——— Parallax souris (desktop, quickTo, amplitude 20px) ———
      let cleanupMouse: (() => void) | undefined;
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (!reduced && fine && left && right) {
        const lx = gsap.quickTo(left, "x", { duration: 0.6, ease: "power3.out" });
        const rx = gsap.quickTo(right, "x", { duration: 0.6, ease: "power3.out" });
        const onMouse = (e: MouseEvent): void => {
          const nx = e.clientX / window.innerWidth - 0.5;
          lx(nx * 40);
          rx(nx * -40);
        };
        // Note : le x du scroll-scrub écrase celui-ci ; on limite l'effet avant le pin.
        window.addEventListener("mousemove", onMouse);
        cleanupMouse = () => window.removeEventListener("mousemove", onMouse);
      }

      // ——— Timeline scroll : pin hero, envol + portail + parallaxe texte ———
      if (!reduced) {
        const tl = gsap.timeline({
          defaults: { ease: "power2.in" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=150%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => floats.forEach((f) => f.kill()),
            onLeaveBack: () => floats.forEach((f) => f.play()),
          },
        });
        tl.to(heroText, { yPercent: -30, opacity: 0, ease: "none", duration: 1 }, 0);
        tl.to(left, { x: "-80vw", y: "-40vh", rotation: -45, scale: 1.3, opacity: 0, duration: 1 }, 0);
        tl.to(right, { x: "80vw", y: "-50vh", rotation: 40, scale: 1.3, opacity: 0, duration: 1 }, 0);
        tl.to(screen, { scale: 1.15, duration: 0.6, ease: "power1.inOut" }, 0.15);
        tl.to(
          screen,
          { clipPath: "inset(0% 0% 0% 0% round 0px)", borderRadius: "0px", scale: 1.35, duration: 0.5, ease: "power1.in" },
          0.55,
        );
      }

      return () => {
        cleanupMouse?.();
        split?.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} id="hero" aria-labelledby="hero-title" className="relative overflow-clip bg-sand pt-[72px]">
      {/* Arcs concentriques terracotta haut-droite */}
      <svg className="pointer-events-none absolute -right-24 top-10 h-[420px] w-[420px]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <circle cx="400" cy="60" r="180" stroke="#B05F3F" strokeWidth="1" />
        <circle cx="400" cy="60" r="240" stroke="#B05F3F" strokeWidth="1" />
      </svg>

      <div className="hero-text relative z-10 mx-auto max-w-5xl px-5 pb-10 pt-12 text-center md:pt-16">
        <h1
          id="hero-title"
          className="hero-title split-mask mx-auto text-balance font-bold leading-[1.05] tracking-tight text-terracotta [font-size:clamp(2.5rem,7vw,6rem)]"
        >
          Des sites immersifs qui mettent des étoiles dans les yeux de vos futurs clients
        </h1>
        <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-pretty text-[18px] leading-[1.6] text-neutral-800 md:text-[20px]">
          Votre agence spécialisée dans la création, le lancement et l’hébergement de sites web pour les acteurs de
          l’événementiel et de l’activité.
        </p>
        <div className="hero-cta mt-8">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#contact");
            }}
            className="inline-flex rounded-full bg-forest px-9 py-4 text-base font-medium text-[#F5F1E0] transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Lancer l’aventure
          </a>
        </div>
      </div>

      {/* Scène : écran central + polaroïds */}
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <div className="relative flex justify-center">
          <PolaroidCard
            src={LEFT_IMG}
            alt="Enfants en atelier créatif"
            priority
            className="hero-polaroid-left absolute -left-2 bottom-[-30px] z-0 w-[42vw] max-w-[300px] md:left-2 lg:left-10"
          />
          <div
            className="hero-screen relative z-10 w-full max-w-[800px] overflow-hidden rounded-2xl border border-white/60 bg-paper shadow-[0_40px_90px_-30px_rgba(45,79,56,0.45)]"
            style={{ clipPath: "inset(0% 0% 0% 0% round 16px)", aspectRatio: "2 / 1" }}
          >
            <div className="flex items-center gap-1.5 border-b border-slate-blue/10 bg-white/80 px-4 py-3" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-terracotta/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-forest/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-mist" />
            </div>
            <div className="flex h-full flex-col items-center justify-center gap-3 pb-10 text-mist">
              <ImageIcon size={72} strokeWidth={1.25} aria-hidden="true" />
              <p className="text-sm font-medium">Mockup de votre futur site immersif</p>
            </div>
          </div>
          <PolaroidCard
            src={RIGHT_IMG}
            alt="Enfant peignant pendant un atelier"
            priority
            className="hero-polaroid-right absolute -right-2 bottom-[-30px] z-0 w-[42vw] max-w-[300px] md:right-2 lg:right-10"
          />
        </div>
      </div>
    </section>
  );
}
