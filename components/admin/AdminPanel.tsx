'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AdminReservation, AdminReservationsResponse } from '@/types/api'
import { useTelegram } from '@/components/providers/TelegramProvider'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import {
  getActiveReservations,
  getCreatedReservations,
  getCancelledReservations,
  getCompletedReservations,
  completeReservation,
  cancelReservation,
  confirmReservation,
} from '@/lib/api/services'

type Tab = 'active' | 'created' | 'cancelled' | 'completed'

const TABS: { id: Tab; label: string }[] = [
  { id: 'active', label: 'Активные' },
  { id: 'created', label: 'Созданные' },
  { id: 'cancelled', label: 'Отменённые' },
  { id: 'completed', label: 'Выполненные' },
]

function formatDateTime(dt: string): string {
  const date = new Date(dt)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ReservationCardProps {
  reservation: AdminReservation
  tab: Tab
  initData: string
  onUpdate: (updated: AdminReservation) => void
  onRemove: (id: number) => void
}

function ReservationCard({ reservation, tab, initData, onUpdate, onRemove }: ReservationCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedPhone, setCopiedPhone] = useState(false)

  async function handleAction(action: 'complete' | 'cancel' | 'confirm') {
    setLoading(true)
    setError(null)
    try {
      let updated: AdminReservation
      if (action === 'complete') updated = await completeReservation(initData, reservation.id)
      else if (action === 'confirm') updated = await confirmReservation(initData, reservation.id)
      else updated = await cancelReservation(initData, reservation.id)

      if (tab === 'active' && action === 'confirm') {
        onUpdate(updated)
      } else {
        onRemove(updated.id)
      }
    } catch {
      setError('Ошибка при выполнении действия')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className='rounded-2xl p-4 mb-3'
      style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className='flex items-start justify-between mb-2'>
        <span className='text-sm font-medium' style={{ color: '#f5c518' }}>
          #{reservation.id} — {reservation.typeOfService.serviceName}
        </span>
        <span
          className='text-xs px-2 py-0.5 rounded-full'
          style={{ background: 'rgba(245,197,24,0.2)', color: '#f5c518' }}
        >
          {reservation.status}
        </span>
      </div>

      <div className='text-xs space-y-1 mb-3' style={{ color: 'rgba(255,255,255,0.7)' }}>
        <div>Начало: {formatDateTime(reservation.startDateTime)}</div>
        <div>Конец: {formatDateTime(reservation.endDateTime)}</div>
        <div>Клиент: @{reservation.client.username} (ID: {reservation.client.id})</div>
        <div>
          Телефон:{' '}
          <a
            href={`tel:${reservation.clientPhoneNumber}`}
            onClick={(e) => {
              if (window.Telegram?.WebApp) {
                e.preventDefault()
                navigator.clipboard.writeText(reservation.clientPhoneNumber).then(() => {
                  setCopiedPhone(true)
                  setTimeout(() => setCopiedPhone(false), 2000)
                })
              }
            }}
            style={{ color: '#f5c518', textDecoration: 'underline' }}
          >
            {reservation.clientPhoneNumber}
          </a>
          {copiedPhone && (
            <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 6, fontSize: '0.75rem' }}>
              ✓ Скопировано
            </span>
          )}
        </div>
        <div>
          Адрес:{' '}
          <a
            href={`https://yandex.ru/maps/?text=${encodeURIComponent(reservation.clientAddress)}`}
            target='_blank'
            rel='noreferrer'
            style={{ color: '#f5c518', textDecoration: 'underline' }}
          >
            {reservation.clientAddress}
          </a>
        </div>
      </div>

      {error && <p className='text-xs text-red-400 mb-2'>{error}</p>}

      {(tab === 'active' || tab === 'created') && (
        <div className='flex gap-2'>
          {tab === 'active' && (
            <button
              onClick={() => handleAction('complete')}
              disabled={loading}
              className='flex-1 py-1.5 rounded-xl text-sm font-medium disabled:opacity-50'
              style={{ background: '#f5c518', color: '#1a1a1a' }}
            >
              {loading ? '...' : 'Выполнить'}
            </button>
          )}
          {(tab === 'created' || (tab === 'active' && reservation.status === 'CREATED')) && (
            <button
              onClick={() => handleAction('confirm')}
              disabled={loading}
              className='flex-1 py-1.5 rounded-xl text-sm font-medium disabled:opacity-50'
              style={{ background: '#f5c518', color: '#1a1a1a' }}
            >
              {loading ? '...' : 'Подтвердить'}
            </button>
          )}
          <button
            onClick={() => handleAction('cancel')}
            disabled={loading}
            className='flex-1 py-1.5 rounded-xl text-sm font-medium disabled:opacity-50'
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
          >
            {loading ? '...' : 'Отменить'}
          </button>
        </div>
      )}
    </div>
  )
}

interface AdminPanelProps {
  onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { initData, isReady } = useTelegram()
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [reservations, setReservations] = useState<AdminReservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    if (!isReady) return
    setLoading(true)
    setError(null)
    try {
      let response: AdminReservationsResponse
      if (activeTab === 'active') response = await getActiveReservations(initData)
      else if (activeTab === 'created') response = await getCreatedReservations(initData)
      else if (activeTab === 'cancelled') response = await getCancelledReservations(initData)
      else response = await getCompletedReservations(initData)
      setReservations(response.content)
    } catch {
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }, [activeTab, initData, isReady])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  function handleUpdate(updated: AdminReservation) {
    setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)))
  }

  function handleRemove(id: number) {
    setReservations(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div
      className='fixed inset-0 z-50 flex flex-col'
      style={{
        background: 'rgba(10,10,20,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Header */}
      <div
        className='flex items-center justify-between px-4 py-4 shrink-0'
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <h1 className='text-lg font-medium text-white'>Админ панель</h1>
        <button
          onClick={onClose}
          className='w-8 h-8 flex items-center justify-center rounded-full text-white'
          style={{ background: 'rgba(255,255,255,0.12)' }}
          aria-label='Закрыть'
        >
          ✕
        </button>
      </div>

      {/* Tab bar */}
      <div className='flex px-4 pt-3 pb-1 gap-2 shrink-0 overflow-x-auto'>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className='whitespace-nowrap px-3 py-1.5 rounded-xl text-sm font-medium shrink-0 transition-colors'
            style={
              activeTab === tab.id
                ? { background: '#f5c518', color: '#1a1a1a' }
                : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto px-4 py-3'>
        {loading && (
          <div className='flex justify-center py-8'>
            <LoadingSpinner />
          </div>
        )}
        {!loading && error && <ErrorMessage message={error} />}
        {!loading && !error && reservations.length === 0 && (
          <p className='text-center py-8 text-sm' style={{ color: 'rgba(255,255,255,0.5)' }}>
            Нет записей
          </p>
        )}
        {!loading && !error && reservations.map(r => (
          <ReservationCard
            key={r.id}
            reservation={r}
            tab={activeTab}
            initData={initData}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  )
}
