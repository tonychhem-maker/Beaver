import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { Cursor } from "@/components/layout/Cursor";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { PathTimeline } from "@/components/sections/PathTimeline";
import { Stats } from "@/components/sections/Stats";
import { Offers } from "@/components/sections/Offers";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Services />
        <section aria-label="Votre parcours vers la couronne" className="bg-sand px-5 pb-20 md:px-10 md:pb-28">
          <PathTimeline />
        </section>
        <Stats />
        <Offers />
      </main>
      <Footer />
    </>
  );
}
