'use client';

export function BottomNavBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-center border-t"
      style={{
        backgroundColor: 'var(--tg-theme-bottom-bar-bg-color)',
        borderColor: 'var(--tg-theme-section-separator-color)',
        paddingBottom: 'var(--tg-safe-area-inset-bottom, 0px)',
      }}
    >
      <button
        className="flex flex-col items-center justify-center px-6 py-2 transition-opacity hover:opacity-80"
        style={{
          color: 'var(--tg-theme-accent-text-color)',
        }}
      >
        <span className="text-2xl mb-1">🏠</span>
        <span className="text-xs">Главная</span>
      </button>
    </nav>
  );
}
