'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
	cancelClientReservation,
	getClientActiveReservations,
} from '@/lib/api/services'
import { translateStatus } from '@/lib/utils/reservationStatus'
import type { ClientReservation } from '@/types/api'
import { useEffect, useState } from 'react'

function formatDateTime(dt: string): string {
	return new Date(dt).toLocaleString('ru-RU', {
		weekday: 'short',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

interface ReservationCardProps {
	reservation: ClientReservation
	initData: string
	onRemove: (id: number) => void
}

function ReservationCard({
	reservation,
	initData,
	onRemove,
}: ReservationCardProps) {
	const [loading, setLoading] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)

	async function handleCancel() {
		setLoading(true)
		try {
			await cancelClientReservation(initData, reservation.id)
			onRemove(reservation.id)
		} catch {
			// silent
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<div
				className='rounded-2xl p-5 mb-4'
				style={{
					background: 'rgba(100,150,255,0.10)',
					backdropFilter: 'blur(8px)',
					WebkitBackdropFilter: 'blur(8px)',
				}}
			>
				<div className='flex items-start justify-between mb-2'>
					<span className='text-base font-semibold' style={{ color: '#f5c518' }}>
						{reservation.typeOfService.serviceName}
					</span>
					<span
						className='text-sm px-2.5 py-0.5 rounded-full'
						style={{ background: 'rgba(245,197,24,0.2)', color: '#f5c518' }}
					>
						{translateStatus(reservation.status)}
					</span>
				</div>

				<div
					className='text-sm space-y-2 mb-4'
					style={{ color: 'rgba(255,255,255,0.90)' }}
				>
					<div>
						<span style={{ color: 'rgba(255,255,255,0.70)' }}>
							Дата и время:{' '}
						</span>
						{formatDateTime(reservation.startDateTime)}
					</div>
					<div>
						<span style={{ color: 'rgba(255,255,255,0.70)' }}>
							Как к Вам обращаться:{' '}
						</span>
						{reservation.client.username}
					</div>
					<div>
						<span style={{ color: 'rgba(255,255,255,0.70)' }}>
							Ваш контактный номер телефона:{' '}
						</span>
						{reservation.clientPhoneNumber}
					</div>
					<div>
						<span style={{ color: 'rgba(255,255,255,0.70)' }}>Адрес: </span>
						{reservation.clientAddress}
					</div>
				</div>

				<button
					onClick={() => setConfirmOpen(true)}
					disabled={loading}
					className='w-full py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
					style={{
						background: 'rgba(15,25,65,0.85)',
						color: 'rgba(255,255,255,0.95)',
					}}
				>
					{loading ? '...' : 'Отменить'}
				</button>
			</div>

			{confirmOpen && (
				<ConfirmDialog
					message='Вы точно хотите отменить заявку?'
					onConfirm={() => {
						setConfirmOpen(false)
						handleCancel()
					}}
					onCancel={() => setConfirmOpen(false)}
				/>
			)}
		</>
	)
}

export function MyReservations() {
	const { initData, isReady } = useTelegram()
	const [reservations, setReservations] = useState<ClientReservation[]>([])
	const [loaded, setLoaded] = useState(false)
	const [expanded, setExpanded] = useState(false)

	useEffect(() => {
		if (!isReady) return
		getClientActiveReservations(initData)
			.then(data => {
				setReservations(data)
				setLoaded(true)
			})
			.catch(() => setLoaded(true))
	}, [isReady, initData])

	if (!loaded || reservations.length === 0) return null

	const visible = expanded ? reservations : reservations.slice(0, 2)

	return (
		<section className='px-4 pt-4'>
			<h2 className='text-lg font-semibold text-white mb-4'>Мои заявки</h2>
			{visible.map(r => (
				<ReservationCard
					key={r.id}
					reservation={r}
					initData={initData}
					onRemove={id =>
						setReservations(prev => prev.filter(x => x.id !== id))
					}
				/>
			))}
			{!expanded && reservations.length > 2 && (
				<button
					onClick={() => setExpanded(true)}
					className='w-full py-2.5 rounded-xl text-base font-medium mb-4'
					style={{
						background: 'rgba(100,150,255,0.10)',
						color: 'rgba(255,255,255,0.90)',
					}}
				>
					Показать все ({reservations.length})
				</button>
			)}
		</section>
	)
}
