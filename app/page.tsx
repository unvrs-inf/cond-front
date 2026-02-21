import { ServiceList } from "@/components/home/ServiceList";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color)',
        paddingTop: 'var(--tg-content-safe-area-inset-top, 0px)',
        paddingBottom: 'calc(4rem + var(--tg-content-safe-area-inset-bottom, 0px))',
        paddingLeft: 'var(--tg-content-safe-area-inset-left, 0px)',
        paddingRight: 'var(--tg-content-safe-area-inset-right, 0px)',
      }}
    >
      <main className="p-4">
        <h1
          className="text-2xl font-bold mb-6"
          style={{
            color: 'var(--tg-theme-text-color)',
          }}
        >
          Доступные услуги
        </h1>
        <ServiceList />
      </main>
      <BottomNavBar />
    </div>
  );
}
