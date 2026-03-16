import { Header } from "@/components/layout/Header";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ServiceList } from "@/components/home/ServiceList";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/main-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px) brightness(0.55)',
          transform: 'scale(1.05)',
        }}
      />
      <Header />
      <main
        style={{
          paddingTop: '56px',
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <HeroBanner />
        <section className="p-4">
          <ServiceList />
        </section>
      </main>
      <BottomNavBar />
    </div>
  );
}
