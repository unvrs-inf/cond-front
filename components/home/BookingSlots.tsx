'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getAvailableSlots, getSchedules } from '@/lib/api/services'
import type { Schedule, ServiceType } from '@/types/api'
import { useEffect, useState } from 'react'
import { AdditionalServicesSelector } from './AdditionalServicesSelector'
import { BookingForm } from './BookingForm'

interface BookingSlotsProps {
	service: ServiceType
	onBack: () => void
	onGoHome: () => void
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr)
	return date.toLocaleDateString('ru-RU', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
	})
}

function formatSlot(slot: string): string {
	return slot.replace(/:\d{2}$/, '')
}

export function BookingSlots({ service, onBack, onGoHome }: BookingSlotsProps) {
	const { initData, isReady } = useTelegram()
	const [schedules, setSchedules] = useState<Schedule[]>([])
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [slots, setSlots] = useState<string[]>([])
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
	const [loadingSchedules, setLoadingSchedules] = useState(true)
	const [loadingSlots, setLoadingSlots] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showAdditionalServices, setShowAdditionalServices] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [selectedAdditionalServiceIds, setSelectedAdditionalServiceIds] = useState<number[]>([])

	useEffect(() => {
		if (!isReady) return
		async function fetchSchedules() {
			try {
				const data = await getSchedules(initData)
				setSchedules(data.content)
			} catch {
				setError('Не удалось загрузить расписание')
			} finally {
				setLoadingSchedules(false)
			}
		}
		fetchSchedules()
	}, [initData, isReady])

	async function handleDaySelect(date: string) {
		setSelectedDate(date)
		setSlots([])
		setSelectedSlot(null)
		setLoadingSlots(true)
		setError(null)
		try {
			const data = await getAvailableSlots(initData, service.id, date)
			setSlots(data)
		} catch {
			setError('Не удалось загрузить слоты')
		} finally {
			setLoadingSlots(false)
		}
	}

	if (showForm && selectedDate && selectedSlot) {
		return (
			<BookingForm
				service={service}
				selectedDate={selectedDate}
				selectedSlot={selectedSlot}
				additionalServiceIds={selectedAdditionalServiceIds}
				onBack={() => setShowForm(false)}
				onGoHome={onGoHome}
			/>
		)
	}

	if (showAdditionalServices && selectedDate && selectedSlot) {
		return (
			<AdditionalServicesSelector
				onBack={() => setShowAdditionalServices(false)}
				onContinue={ids => {
					setSelectedAdditionalServiceIds(ids)
					setShowForm(true)
				}}
			/>
		)
	}

	return (
		<div className='flex flex-col gap-4 p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]'>
			<p className='text-white/90 text-sm mt-6'>Выберите удобный день</p>

			{loadingSchedules ? (
				<LoadingSpinner />
			) : error && schedules.length === 0 ? (
				<ErrorMessage message={error} />
			) : (
				<div className='flex flex-wrap gap-2'>
					{schedules.map(schedule => {
						const isSelected = selectedDate === schedule.date
						return (
							<button
								key={schedule.id}
								onClick={() => handleDaySelect(schedule.date)}
								className='px-4 py-2 rounded-2xl text-white text-sm font-medium cursor-pointer transition-opacity duration-150 hover:opacity-80'
								style={{
									background: isSelected
										? 'rgba(245,197,24,0.2)'
										: 'rgba(15,25,65,0.85)',
									backdropFilter: 'blur(12px)',
									WebkitBackdropFilter: 'blur(12px)',
									border: isSelected
										? '1.5px solid #f5c518'
										: '1.5px solid transparent',
								}}
							>
								{formatDate(schedule.date)}
							</button>
						)
					})}
				</div>
			)}

			{selectedDate && (
				<>
					<p className='text-white/90 text-sm mt-2'>Доступное время</p>
					{loadingSlots ? (
						<LoadingSpinner />
					) : error ? (
						<ErrorMessage message={error} />
					) : slots.length === 0 ? (
						<p className='text-white/70 text-sm'>Нет доступных слотов</p>
					) : (
						<div className='grid grid-cols-3 gap-2 mb-6'>
							{slots.map(slot => {
								const isSelected = selectedSlot === slot
								return (
									<button
										key={slot}
										onClick={() => setSelectedSlot(slot)}
										className='py-2 rounded-2xl text-white text-sm font-medium cursor-pointer transition-opacity duration-150 hover:opacity-80'
										style={{
											background: isSelected
												? 'rgba(245,197,24,0.2)'
												: 'rgba(15,25,65,0.85)',
											backdropFilter: 'blur(12px)',
											WebkitBackdropFilter: 'blur(12px)',
											border: isSelected
												? '1.5px solid #f5c518'
												: '1.5px solid transparent',
										}}
									>
										{formatSlot(slot)}
									</button>
								)
							})}
						</div>
					)}
				</>
			)}

			{/* Fixed bottom buttons */}
			<div
				className='fixed bottom-6 left-0 right-0 flex gap-2 p-2'
				style={{
					paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
				}}
			>
				<button
					onClick={onBack}
					className='flex-1 py-4 rounded-3xl font-semibold text-white cursor-pointer transition-opacity duration-150 hover:opacity-80'
					style={{
						background: 'rgba(15,25,65,0.85)',
						backdropFilter: 'blur(12px)',
						WebkitBackdropFilter: 'blur(12px)',
					}}
				>
					Назад
				</button>
				{selectedSlot && (
					<button
						onClick={() => setShowAdditionalServices(true)}
						className='flex-[2] py-4 rounded-3xl font-semibold text-black cursor-pointer transition-opacity duration-150 hover:opacity-80'
						style={{ background: '#f5c518' }}
					>
						Продолжить
					</button>
				)}
			</div>
		</div>
	)
}
