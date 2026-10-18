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
components/sections/  Hero, PathTimeline (fusion titre + bloc d'étape + tracé), Stats, Offers, Valeurs
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
- `STEP_TIMES = [0.05, 1.1, 2.05, 2.95]` : seuils d'activation des 4 étapes
  (labels `step1…step4` ajoutés pour référence, mais **positions de timeline
  toujours numériques** — piège classique : `"step2" + 0.35` en JS donne
  `"step20.35"`, un label fantôme que GSAP ajoute à la fin de la timeline ;
  les textes entraient alors tous après la couronne et s'empilaient). Le
  dernier échange de texte se termine à ~90% du scrub : le reliquat
  (remplissage de la couronne, halo, étincelles, pop) ne contient plus aucun
  texte en transition, donc **dès que la couronne est atteinte, le pin se
  libère et la section suivante prend le relais sans aucun empilement** (même
  avec le retard de `scrub: 1`).
- **Bloc de contenu par étape** (`.service-state`) au-dessus du tracé : une
  seule section visible (`Création` → `Lancement` → `Hébergement` → `Accès
  admin`). Passage **strictement séquentiel** (`SWAP`) : la précédente sort
  d'abord (`y: -40`, `opacity 0`, `power2.in`, 0.35s) puis la suivante
  entre (`y: 30 → 0`, `back.out(1.4)`, 0.5s, décalée de 0.35s = durée de la
  sortie) — jamais deux textes visibles en même temps, même à faible
  vélocité de scroll. Le bloc a `overflow-hidden` : rien ne peut déborder
  sur le titre, effet de page découpée, tout en `scrub`.
- **Libellés inline dans le SVG** sous chaque point (desktop) ou à droite
  (mobile), en slate-blue, 2 à 3 lignes selon l'espace.
- `CROWN_GLOWS = [6, 12, 18, 24]` : rayon du `drop-shadow` terracotta,
  une pointe de couronne s'allume par étape.
- Remplissage couronne : `clipPath` rect animé `y: -14 → -80`, `height: 6 → 76`
  (révélation bas → haut : 25/50/75/100%).
- Finale (positions `3.7 → 3.9`) : halo `opacity → 0.5`, 16 étincelles dorées
  (angles/distances aléatoires), shake `x: 5, repeat: 3, yoyo`.
  Le « pop » élastique (`elastic.out(1, 0.4)`) est déclenché par `onUpdate`
  quand `progress >= 0.985` (rejoué à chaque arrivée, réinitialisé sous `0.9`).
- Desktop : bloc **entier épinglé** sous le header — `pin: true`,
  `start: "top top+=80"`, `end: "+=260%"`, `scrub: 1`, racine en
  `md:min-h-[calc(100dvh-96px)]` avec lignes auto + `md:content-between`
  (titre + bloc + tracé tiennent dans le viewport, aucun vide au-dessus, et
  l'espace libre devient des respirations — la boîte du tracé garde sa
  hauteur naturelle `viewBox 1300×360`, aspect ~3,6 comme la maquette). Le
  bloc de contenu devient `sticky` en mobile pour rester visible pendant le
  tracé vertical ; en desktop il reste `md:relative` (jamais `md:static`,
  sinon les sections absolues s'échappent sur le titre).
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
