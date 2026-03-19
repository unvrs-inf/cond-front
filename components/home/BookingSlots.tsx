'use client'

import type { ServiceType, Schedule } from '@/types/api'
import { useState, useEffect } from 'react'
import { useTelegram } from '@/components/providers/TelegramProvider'
import { getSchedules, getAvailableSlots } from '@/lib/api/services'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

interface BookingSlotsProps {
	service: ServiceType
	onBack: () => void
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr)
	return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatSlot(slot: string): string {
	// Strip trailing ":00" seconds → "10:00:00" → "10:00"
	return slot.replace(/:\d{2}$/, '')
}

export function BookingSlots({ service, onBack }: BookingSlotsProps) {
	const { initData } = useTelegram()
	const [schedules, setSchedules] = useState<Schedule[]>([])
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [slots, setSlots] = useState<string[]>([])
	const [loadingSchedules, setLoadingSchedules] = useState(true)
	const [loadingSlots, setLoadingSlots] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
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
	}, [initData])

	async function handleDaySelect(date: string) {
		setSelectedDate(date)
		setSlots([])
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

	return (
		<div className='flex flex-col gap-4 p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]'>
			<p className='text-white/70 text-sm mt-6'>Выберите удобный день</p>

			{loadingSchedules ? (
				<LoadingSpinner />
			) : error && schedules.length === 0 ? (
				<ErrorMessage message={error} />
			) : (
				<div className='flex flex-wrap gap-2'>
					{schedules.map((schedule) => {
						const isSelected = selectedDate === schedule.date
						return (
							<button
								key={schedule.id}
								onClick={() => handleDaySelect(schedule.date)}
								className='px-4 py-2 rounded-2xl text-white text-sm font-medium cursor-pointer transition-opacity duration-150 hover:opacity-80'
								style={{
									background: isSelected ? 'rgba(245,197,24,0.2)' : 'rgba(255,255,255,0.13)',
									backdropFilter: 'blur(12px)',
									WebkitBackdropFilter: 'blur(12px)',
									border: isSelected ? '1.5px solid #f5c518' : '1.5px solid transparent',
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
					<p className='text-white/70 text-sm mt-2'>Доступное время</p>
					{loadingSlots ? (
						<LoadingSpinner />
					) : error ? (
						<ErrorMessage message={error} />
					) : slots.length === 0 ? (
						<p className='text-white/50 text-sm'>Нет доступных слотов</p>
					) : (
						<div className='grid grid-cols-3 gap-2'>
							{slots.map((slot) => (
								<button
									key={slot}
									className='py-2 rounded-2xl text-white text-sm font-medium cursor-pointer transition-opacity duration-150 hover:opacity-80'
									style={{
										background: 'rgba(255,255,255,0.13)',
										backdropFilter: 'blur(12px)',
										WebkitBackdropFilter: 'blur(12px)',
									}}
								>
									{formatSlot(slot)}
								</button>
							))}
						</div>
					)}
				</>
			)}

			{/* Fixed back button */}
			<div
				className='fixed bottom-6 left-2 right-2'
				style={{
					paddingBottom: 'env(safe-area-inset-bottom, 0px)',
					height: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
				}}
			>
				<button
					onClick={onBack}
					className='w-full h-full flex items-center justify-center font-semibold text-white uppercase tracking-wider rounded-3xl cursor-pointer transition-opacity duration-150 hover:opacity-80'
					style={{
						background: 'rgba(30,30,46,0.85)',
						backdropFilter: 'blur(12px)',
						WebkitBackdropFilter: 'blur(12px)',
					}}
				>
					Назад
				</button>
			</div>
		</div>
	)
}
