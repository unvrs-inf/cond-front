'use client'

interface AdminButtonProps {
  onClick: () => void
}

export function AdminButton({ onClick }: AdminButtonProps) {
  return (
    <button
      onClick={onClick}
      className='fixed z-40 flex items-center justify-center w-12 h-12 rounded-full cursor-pointer'
      style={{
        bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        right: '1rem',
        background: 'rgba(245,197,24,0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
      aria-label='Открыть админ панель'
    >
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#1a1a1a'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <circle cx='12' cy='12' r='3' />
        <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
      </svg>
    </button>
  )
}
