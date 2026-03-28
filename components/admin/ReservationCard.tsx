'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
	cancelReservation,
	completeReservation,
	confirmReservation,
} from '@/lib/api/services'
import { translateStatus } from '@/lib/utils/reservationStatus'
import type { AdminReservation } from '@/types/api'
import { useRef, useState } from 'react'
import { formatDateTime } from './formatters'

type Tab = 'active' | 'created' | 'cancelled' | 'completed' | 'schedules' | 'services' | 'additionalServices'

interface ReservationCardProps {
	reservation: AdminReservation
	tab: Tab
	initData: string
	onUpdate: (updated: AdminReservation) => void
	onRemove: (id: number) => void
}

export function ReservationCard({
	reservation,
	tab,
	initData,
	onUpdate,
	onRemove,
}: ReservationCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [copiedPhone, setCopiedPhone] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	)

	async function handleAction(action: 'complete' | 'cancel' | 'confirm') {
		setLoading(true)
		setError(null)
		try {
			let updated: AdminReservation
			if (action === 'complete')
				updated = await completeReservation(initData, reservation.id)
			else if (action === 'confirm')
				updated = await confirmReservation(initData, reservation.id)
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
			className='rounded-2xl p-5 mb-4'
			style={{
				background: 'rgba(100,150,255,0.10)',
				backdropFilter: 'blur(8px)',
				WebkitBackdropFilter: 'blur(8px)',
			}}
		>
			<div className='flex flex-col items-start gap-2 justify-between mb-2'>
				<span
					className='text-base text-nowrap font-semibold'
					style={{ color: '#f5c518' }}
				>
					#{reservation.id} — {reservation.typeOfService.serviceName}
				</span>
				<span
					className='text-xs text-nowrap px-2.5 py-0.5 rounded-full'
					style={{ background: 'rgba(245,197,24,0.2)', color: '#f5c518' }}
				>
					{translateStatus(reservation.status)}
				</span>
			</div>

			<div
				className='text-sm space-y-2 mb-4'
				style={{ color: 'rgba(255,255,255,0.90)' }}
			>
				<div>Начало: {formatDateTime(reservation.startDateTime)}</div>
				<div>Конец: {formatDateTime(reservation.endDateTime)}</div>
				<div>
					Стоимость: {reservation.typeOfService.cost.toLocaleString('ru-RU')} ₽
				</div>
				<div>
					Клиент: @{reservation.client.username} (ID: {reservation.client.id})
				</div>
				<div>
					Telegram:{' '}
					{reservation.client.tgUsername ? (
						<a
							href={`https://t.me/${reservation.client.tgUsername}`}
							target='_blank'
							rel='noreferrer'
							style={{ color: '#f5c518', textDecoration: 'underline' }}
						>
							@{reservation.client.tgUsername}
						</a>
					) : (
						<span style={{ color: 'rgba(255,255,255,0.50)' }}>не указан</span>
					)}
				</div>
				<div>
					Телефон:{' '}
					<a
						href={`tel:${reservation.clientPhoneNumber}`}
						onClick={e => {
							if (window.Telegram?.WebApp) {
								e.preventDefault()
								navigator.clipboard
									.writeText(reservation.clientPhoneNumber)
									.then(() => {
										setCopiedPhone(true)
										clearTimeout(copiedTimerRef.current)
										copiedTimerRef.current = setTimeout(
											() => setCopiedPhone(false),
											2000,
										)
									})
							}
						}}
						style={{ color: '#f5c518', textDecoration: 'underline' }}
					>
						{reservation.clientPhoneNumber}
					</a>
					{copiedPhone && (
						<span
							style={{
								color: 'rgba(255,255,255,0.80)',
								marginLeft: 6,
								fontSize: '0.75rem',
							}}
						>
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
				{reservation.additionalServices && reservation.additionalServices.length > 0 && (
					<div>
						<span style={{ color: 'rgba(255,255,255,0.70)' }}>Доп. услуги:</span>
						<ul className='mt-1 space-y-0.5'>
							{reservation.additionalServices.map(s => (
								<li key={s.id}>
									{s.serviceName} —{' '}
									{s.cost.toLocaleString('ru-RU')} ₽
									{!s.pricingFixed && s.unitName ? ` за ${s.unitName}` : ''}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{error && <p className='text-sm text-red-400 mb-2'>{error}</p>}

			{(tab === 'active' || tab === 'created') && (
				<div className='flex gap-2'>
					{tab === 'active' && (
						<button
							onClick={() => handleAction('complete')}
							disabled={loading}
							className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
							style={{ background: '#f5c518', color: '#1a1a1a' }}
						>
							{loading ? '...' : 'Выполнить'}
						</button>
					)}
					{(tab === 'created' ||
						(tab === 'active' && reservation.status === 'CREATED')) && (
						<button
							onClick={() => handleAction('confirm')}
							disabled={loading}
							className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
							style={{ background: '#f5c518', color: '#1a1a1a' }}
						>
							{loading ? '...' : 'Подтвердить'}
						</button>
					)}
					<button
						onClick={() => setConfirmOpen(true)}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{
							background: 'rgba(255,255,255,0.12)',
							color: 'rgba(255,255,255,0.95)',
						}}
					>
						{loading ? '...' : 'Отменить'}
					</button>
				</div>
			)}
			{confirmOpen && (
				<ConfirmDialog
					message='Вы точно хотите отменить заявку?'
					onConfirm={() => {
						setConfirmOpen(false)
						handleAction('cancel')
					}}
					onCancel={() => setConfirmOpen(false)}
				/>
			)}
		</div>
	)
}
