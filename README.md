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
app/                  layout.tsx (DM Sans, SEO, JSON-LD, shell #site-shell + ExpandTransition)
  api/booking/        POST : validation Zod + emails Resend (confirmation)
  valeurs/page.tsx    page « Nos valeurs » (metadata + contenu client)
components/layout/    Header, Footer, Preloader, Cursor, ScrollProgress, SmoothScroll
components/sections/  Hero, Services, PathTimeline, Stats, Offers, Valeurs
components/booking/   BookingPanel (calendrier + créneaux + formulaire), SuccessCheck (DrawSVG)
components/transition/ExpandTransition (transition d'expansion plein écran)
components/ui/        Button, PolaroidCard, StatCard, MagneticWrapper
hooks/                useLenis, useMagnetic, useCountUp, useReducedMotion
lib/                  gsap.ts (register unique), utils.ts, booking.ts (schémas Zod)
public/               grille-tarifaire.pdf
```

## Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Rôle | Défaut sans elle |
| --- | --- | --- |
| `RESEND_API_KEY` | Envoi des emails de confirmation via Resend | Réservation journalisée en local (mode dev) |
| `BOOKING_TO_EMAIL` | Destinataire des demandes | `bonjour@beaverlaunch.fr` |
| `EMAIL_FROM` | Expéditeur (domaine vérifié Resend) | `BeaverLaunch <onboarding@resend.dev>` |

Sans `RESEND_API_KEY`, `POST /api/booking` répond quand même `{ ok: true }` après validation.

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
- `STEP_TIMES = [0.05, 1.25, 2.45, 3.35]` : seuils d'activation des 4 étapes,
  ajoutés comme labels de timeline `step1…step4` (`tl.addLabel`).
- **Cartes d'étape** liées à ces labels : entrée `y:40 → 0`, `opacity 0 → 1`,
  `scale 0.92 → 1`, `back.out(1.6)` (0.6s), contenu interne en stagger 0.08s
  (pastille forest, titre terracotta, texte slate-blue, icône lucide).
  La carte précédente passe en `scale 0.95 / opacity 0.5` (desktop) ou fond
  (`opacity 0`) en mobile (une seule carte visible, empilée en `min-h`).
- **Lignes pointillées terracotta** (`stroke-dasharray: 1 8`) reliant chaque
  carte au point de l'étape : points recalculés au pixel via `getBoundingClientRect`
  (ResizeObserver + listener `resize`).
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
- `prefers-reduced-motion` : tout affiché (chemin 100%, couronne allumée,
  cartes visibles, lignes pointillées opaques), sans timeline.
- Pour changer le rythme : augmentez la durée `4` du tracé (les labels
  `STEP_TIMES` et la finale sont exprimés dans cette échelle).

### Stats (`Stats.tsx` + `StatCard.tsx`)
- Compteurs : `gsap.to({val: 0})`, `snap: {val: 1}`, `2s`, `power2.out`, `once: true`.
- Éventail : `y: 120`, `rotate: ±8`, `stagger: 0.15`, `back.out(1.4)`.
- Tilt 3D : `perspective(1000px)`, `rotateX/Y ±8°` + reflet radial suivant le curseur.

### Offres & rendez-vous (`Offers.tsx` + `components/booking/`)
- Calendrier maison : mois précédent/suivant, jours passés + week-ends désactivés,
  jour sélectionné `--forest`, jour du jour entouré `--terracotta`.
- Créneaux `SLOTS` (lib/booking.ts) → formulaire (React Hook Form + Zod,
  messages FR) → `POST /api/booking` (Resend) → succès avec coche DrawSVG.
- Le calendrier est importé en `dynamic(..., { ssr: false })` : obligatoire
  (Cache Components refuse `new Date()` pendant le prerender) et bon pour le LCP.
- Remplacement possible par un embed Cal.com : voir le commentaire en tête d'`Offers.tsx`.
- Formules tarifaires : tableau `FORMULAS` dans `Offers.tsx`.

### Transition vers /valeurs (`ExpandTransition.tsx`)
- `expandNavigate(href, originEl)` depuis un bouton : calque `--forest` en
  `clip-path: circle()` qui part du bouton (0.9s `expo.inOut`), contenu qui
  recule (`scale 0.96 / opacity 0.6`), navigation Next, puis rétraction (0.7s)
  vers le bouton d'origine + nettoyage des styles du shell (sinon le header
  fixe perdrait son ancêtre transformé).
- Le composant vit dans `layout.tsx` (persistant entre les routes) et écoute
  `usePathname` pour déclencher la rétraction ; filet de sécurité à 2,5s.
- `prefers-reduced-motion` : navigation directe, sans calque.

### Global
- Lenis : `lerp: 0.08`, `smoothWheel: true`, sync via
  `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker` + `lagSmoothing(0)`.
- `prefers-reduced-motion` : pas de pin/parallax, chemin affiché complet,
  couronne allumée, fades simples, transition de page neutralisée.
- Seules `transform` et `opacity` sont animées (+ `clip-path` pour les portails),
  `will-change` limité aux phases animées, cleanup via `useGSAP`/`ctx.revert()`.

## Déploiement (Vercel)

```bash
vercel --prod
```

Aucune variable d'environnement requise. Pensez à remplacer les images
Unsplash de démonstration et à brancher le widget Cal.com/Calendly dans `Offers.tsx`.
