import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { Cursor } from "@/components/layout/Cursor";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Hero } from "@/components/sections/Hero";
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
        <section id="services" aria-labelledby="services-title" className="bg-sand px-5 py-16 md:px-10 md:py-24">
          <PathTimeline />
        </section>
        <Stats />
        <Offers />
      </main>
      <Footer />
    </>
  );
}
