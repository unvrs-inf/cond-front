'use client';

import Image from 'next/image';

export function BottomNavBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-center border-t"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <button className="flex flex-col items-center justify-center px-6 py-2 transition-opacity duration-150 hover:opacity-80 cursor-pointer">
        <Image src="/home.svg" width={28} height={28} alt="Главная" className="mb-1"
          style={{ filter: 'brightness(0) invert(1)' }} />
      </button>
    </nav>
  );
}
