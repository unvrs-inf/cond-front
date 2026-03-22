'use client'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className='fixed inset-0 z-60 flex items-center justify-center px-6'
      style={{ background: 'rgba(10,10,20,0.85)' }}
      onClick={onCancel}
    >
      <div
        className='w-full max-w-sm rounded-2xl p-6'
        style={{
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p className='text-white text-base font-medium text-center mb-5'>{message}</p>
        <div className='flex gap-3'>
          <button
            onClick={onConfirm}
            className='flex-1 py-2 rounded-xl text-sm font-medium'
            style={{ background: '#f5c518', color: '#1a1a1a' }}
          >
            Да
          </button>
          <button
            onClick={onCancel}
            className='flex-1 py-2 rounded-xl text-sm font-medium'
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  )
}
