import { useId } from "react";

/**
 * Maquette vectorielle d'une landing page moderne, réalisée pour un client
 * du secteur de l'événementiel (« Lumina Events »). Illustration de la
 * section services : fenêtre navigateur + nav + hero + cartes de prestations,
 * dans les couleurs de la marque (papier, bleu-ardoise, terracotta).
 *
 * `preserveAspectRatio="xMidYMid slice"` = comportement « object-cover » :
 * la maquette remplit toujours la boîte quel que soit son format. Le cadrage
 * rogne les bords du viewBox — tout le contenu est donc concentré dans la
 * zone sûre x ∈ [140, 1055], y ∈ [30, 492] (desktop rogne ~28 en haut/bas,
 * mobile ~133 sur les côtés).
 */

/** Étincelle 4 branches (décor confettis). */
function sparkle(cx: number, cy: number, s: number): string {
  const k = s * 0.32;
  return [
    `M ${cx} ${cy - s}`,
    `C ${cx} ${cy - k} ${cx + k} ${cy} ${cx + s} ${cy}`,
    `C ${cx + k} ${cy} ${cx} ${cy + k} ${cx} ${cy + s}`,
    `C ${cx} ${cy + k} ${cx - k} ${cy} ${cx - s} ${cy}`,
    `C ${cx - k} ${cy} ${cx} ${cy - k} ${cx} ${cy - s}`,
    "Z",
  ].join(" ");
}

const MENU = [
  { label: "Prestations", x: 520 },
  { label: "Réalisations", x: 652 },
  { label: "Contact", x: 792 },
];

const CARDS = [
  { x: 150, color: "#B05F3F" },
  { x: 458, color: "#3F5F85" },
  { x: 766, color: "#E3A83B" },
];

export function LandingMockup() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `mock-hero-${uid}`;

  return (
    <svg
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Aperçu d’une landing page moderne réalisée pour un client du secteur de l’événementiel"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F5F85" />
          <stop offset="100%" stopColor="#B05F3F" />
        </linearGradient>
      </defs>

      {/* Page */}
      <rect width="1200" height="520" fill="#FFFDF7" />

      {/* Barre du navigateur */}
      <rect width="1200" height="70" fill="#F1ECDA" />
      <circle cx="160" cy="44" r="7.5" fill="#D98F6E" />
      <circle cx="182" cy="44" r="7.5" fill="#E3A83B" />
      <circle cx="204" cy="44" r="7.5" fill="#7C93B4" />
      <rect x="232" y="27" width="340" height="34" rx="16" fill="#FFFDF7" stroke="#E2DABD" />
      <rect x="249" y="40" width="11" height="8" rx="2" fill="#5F6670" />
      <path d="M251.5 40 v-3 a3 3 0 0 1 6 0 v3" fill="none" stroke="#5F6670" strokeWidth="1.6" />
      <text x="272" y="51" fontSize="15" fill="#5F6670">
        lumina-events.fr
      </text>

      {/* Nav du site */}
      <path d={sparkle(173, 97, 14)} fill="#B05F3F" />
      <text x="198" y="105" fontSize="26" fontWeight="800" fill="#1a1a1a">
        Lumina
      </text>
      <text x="298" y="105" fontSize="26" fontWeight="300" fill="#5F6670">
        events
      </text>
      {MENU.map((m) => (
        <text key={m.label} x={m.x} y="103" fontSize="17" fill="#5F6670">
          {m.label}
        </text>
      ))}
      <rect x="880" y="76" width="170" height="42" rx="21" fill="#B05F3F" />
      <text x="965" y="103" fontSize="17" fontWeight="600" fill="#FFFDF7" textAnchor="middle">
        Devis gratuit
      </text>

      {/* Hero */}
      <rect x="150" y="144" width="322" height="34" rx="17" fill="#F1ECDA" />
      <path d={sparkle(172, 161, 7)} fill="#B05F3F" />
      <text x="188" y="167" fontSize="16" fill="#B05F3F">
        Agence événementielle · Paris
      </text>
      <text x="150" y="244" fontSize="52" fontWeight="800" fill="#1a1a1a">
        Des soirées dont
      </text>
      <text x="150" y="302" fontSize="52" fontWeight="800" fill="#B05F3F">
        on parle encore.
      </text>
      <rect x="150" y="328" width="380" height="11" rx="5" fill="#D9D2BE" />
      <rect x="150" y="350" width="300" height="11" rx="5" fill="#E2DABD" />
      <rect x="150" y="374" width="242" height="44" rx="22" fill="#B05F3F" />
      <text x="271" y="402" fontSize="17" fontWeight="600" fill="#FFFDF7" textAnchor="middle">
        Réserver une date
      </text>
      <rect x="408" y="374" width="252" height="44" rx="22" fill="none" stroke="#1a1a1a" strokeWidth="1.8" />
      <text x="534" y="402" fontSize="17" fontWeight="600" fill="#1a1a1a" textAnchor="middle">
        Voir nos réalisations
      </text>

      {/* Visuel du hero (photo d'événement stylisée) */}
      <rect x="700" y="142" width="350" height="276" rx="26" fill={`url(#${gradId})`} />
      <circle cx="880" cy="240" r="92" fill="#FFFDF7" opacity="0.1" />
      <circle cx="1012" cy="252" r="6" fill="#FFFDF7" opacity="0.6" />
      <circle cx="742" cy="262" r="4" fill="#FFFDF7" opacity="0.5" />
      <circle cx="902" cy="164" r="5" fill="#FFFDF7" opacity="0.45" />
      <path d={sparkle(772, 204, 14)} fill="#F7DFA8" />
      <path d={sparkle(988, 188, 9)} fill="#FFFDF7" opacity="0.9" />
      <path d={sparkle(944, 330, 12)} fill="#F7DFA8" />
      <path d={sparkle(806, 314, 7)} fill="#FFFDF7" opacity="0.8" />
      <rect x="724" y="352" width="170" height="11" rx="5" fill="#FFFDF7" opacity="0.6" />
      <rect x="724" y="372" width="110" height="9" rx="4" fill="#FFFDF7" opacity="0.35" />

      {/* Cartes de prestations */}
      {CARDS.map((c) => (
        <g key={c.x}>
          <rect x={c.x} y="430" width="283" height="62" rx="18" fill="#F7F2DF" stroke="#E2DABD" />
          <circle cx={c.x + 34} cy="461" r="11" fill={c.color} />
          <rect x={c.x + 56} y="450" width="136" height="10" rx="5" fill="#1a1a1a" opacity="0.75" />
          <rect x={c.x + 30} y="474" width="196" height="8" rx="4" fill="#D9D2BE" />
        </g>
      ))}
    </svg>
  );
}
