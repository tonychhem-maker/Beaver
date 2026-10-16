# BeaverLaunch — Site one-page immersif

Agence qui crée, lance et héberge des sites web immersifs pour l'événementiel et l'activité.
Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS v4 + GSAP 3.15 + Lenis + Motion.

## Installation

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

Node.js ≥ 20 requis (`winget install OpenJS.NodeJS.LTS` sur Windows).

## Dépendances d'animation

```bash
npm install gsap @gsap/react lenis motion lucide-react
```

Les plugins GSAP `ScrollTrigger`, `DrawSVGPlugin`, `MotionPathPlugin`, `SplitText` sont
enregistrés **une seule fois** dans `lib/gsap.ts` (`registerGsap()`).

## Architecture

```
app/                  layout.tsx (DM Sans, SEO, JSON-LD), page.tsx, globals.css (tokens @theme)
components/layout/    Header, Footer, Preloader, Cursor, ScrollProgress, SmoothScroll
components/sections/  Hero, Services, PathTimeline, Stats, Offers
components/ui/        Button, PolaroidCard, StatCard, MagneticWrapper
hooks/                useLenis, useMagnetic, useCountUp, useReducedMotion
lib/                  gsap.ts (register unique), utils.ts (cx, scrollToTarget)
public/               grille-tarifaire.pdf
```

## Réglages des animations

### Hero (`components/sections/Hero.tsx`)
- Intro : `delay: 1.9` (attend le préchargeur), mots `yPercent: 110 → 0`,
  `stagger: 0.12`, `ease: "expo.out"`, durée `1.2s`.
- Envol au scroll : `ScrollTrigger` avec `pin: true`, `end: "+=150%"`, `scrub: 1`.
  Polaroïds gauche/droite → `x: ∓80vw`, `y: -40/-50vh`, `rotation: ∓45/40°`,
  `scale: 1.3`, `opacity: 0`, `ease: "power2.in"`.
- Flottement idle : `y: ±10px`, `rotation: ±1°`, `yoyo`, `sine.inOut`, 5–6s.
- Parallax souris : `gsap.quickTo`, amplitude ±20px (`nx * 40`), inertie `0.6s`.

### Chemin signature (`components/sections/PathTimeline.tsx`)
- `STEP_TIMES = [0.05, 1.25, 2.45, 3.35]` : seuils d'activation des 4 étapes
  sur une timeline de durée 4 (positions `0%`, `~30%`, `~60%`, `~85%`).
- `CROWN_GLOWS = [6, 12, 18, 24]` : rayon du `drop-shadow` terracotta,
  une pointe de couronne s'allume par étape.
- Remplissage couronne : `clipPath` rect animé `y: -14 → -80`, `height: 6 → 76`
  (révélation bas → haut : 25/50/75/100%).
- Finale (positions `3.7 → 3.9`) : halo `opacity → 0.5`, 16 étincelles dorées
  (angles/distances aléatoires), shake `x: 5, repeat: 3, yoyo`.
  Le « pop » élastique (`elastic.out(1, 0.4)`) est déclenché par `onUpdate`
  quand `progress >= 0.985` (rejoué à chaque arrivée, réinitialisé sous `0.9`).
- Desktop : `pin: true`, `start: "top 65%"`, `end: "+=200%"`, `scrub: 1`.
  Mobile (< 768px) : tracé vertical, sans pin (`"top 75%" → "bottom 55%"`).
- Pour changer le rythme : augmentez la durée `4` du tracé (toutes les positions
  `STEP_TIMES` et la finale sont exprimées dans cette échelle).

### Stats (`Stats.tsx` + `StatCard.tsx`)
- Compteurs : `gsap.to({val: 0})`, `snap: {val: 1}`, `2s`, `power2.out`, `once: true`.
- Éventail : `y: 120`, `rotate: ±8`, `stagger: 0.15`, `back.out(1.4)`.
- Tilt 3D : `perspective(1000px)`, `rotateX/Y ±8°` + reflet radial suivant le curseur.

### Global
- Lenis : `lerp: 0.08`, `smoothWheel: true`, sync via
  `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker` + `lagSmoothing(0)`.
- `prefers-reduced-motion` : pas de pin/parallax, chemin affiché complet,
  couronne allumée, fades simples.
- Seules `transform` et `opacity` sont animées (+ `clip-path` pour les portails),
  `will-change` limité aux phases animées, cleanup via `useGSAP`/`ctx.revert()`.

## Déploiement (Vercel)

```bash
vercel --prod
```

Aucune variable d'environnement requise. Pensez à remplacer les images
Unsplash de démonstration et à brancher le widget Cal.com/Calendly dans `Offers.tsx`.
