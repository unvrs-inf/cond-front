import { Header } from "@/components/layout/Header";
import { HomeView } from "@/components/home/HomeView";

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
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <HomeView />
      </main>
    </div>
  );
}
