import Link from "next/link";
import { Globe, Mail, MessageCircle } from "lucide-react";

/** Footer : bloc gris pleine largeur, logo, liens, mentions, réseaux. */
export function Footer() {
  return (
    <footer id="contact" className="bg-grey/60 px-5 py-14 md:px-10" aria-labelledby="footer-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p id="footer-title" className="text-2xl font-bold text-terracotta">
              BeaverLaunch
            </p>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-slate-blue">
              Des sites immersifs qui mettent des étoiles dans les yeux de vos futurs clients.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="Site web BeaverLaunch" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-blue/30 text-slate-blue transition-colors hover:bg-slate-blue hover:text-white">
                <Globe size={18} />
              </a>
              <a href="mailto:bonjour@beaverlaunch.fr" aria-label="Email BeaverLaunch" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-blue/30 text-slate-blue transition-colors hover:bg-slate-blue hover:text-white">
                <Mail size={18} />
              </a>
              <a href="#contact" aria-label="Contacter BeaverLaunch" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-blue/30 text-slate-blue transition-colors hover:bg-slate-blue hover:text-white">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          <nav aria-label="Liens de pied de page" className="grid grid-cols-2 gap-10 md:flex md:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-blue">Site</p>
              <ul className="mt-3 space-y-2 text-[15px] text-slate-blue/90">
                <li><Link href="#offres" className="hover:text-terracotta">Nos offres</Link></li>
                <li><Link href="#services" className="hover:text-terracotta">Nos services</Link></li>
                <li><Link href="#hero" className="hover:text-terracotta">Accueil</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-blue">Légal</p>
              <ul className="mt-3 space-y-2 text-[15px] text-slate-blue/90">
                <li><a href="#" className="hover:text-terracotta">Mentions légales</a></li>
                <li><a href="#" className="hover:text-terracotta">Confidentialité</a></li>
                <li><a href="/grille-tarifaire.pdf" download className="hover:text-terracotta">Grille tarifaire</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-blue">Contact</p>
              <ul className="mt-3 space-y-2 text-[15px] text-slate-blue/90">
                <li><a href="mailto:bonjour@beaverlaunch.fr" className="hover:text-terracotta">bonjour@beaverlaunch.fr</a></li>
                <li><span>Paris, France</span></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-slate-blue/20 pt-6 text-sm text-slate-blue/70 md:flex-row md:justify-between">
          <p>© 2026 BeaverLaunch — Tous droits réservés.</p>
          <p>Fait avec soin pour l’événementiel et les activités.</p>
        </div>
      </div>
    </footer>
  );
}
