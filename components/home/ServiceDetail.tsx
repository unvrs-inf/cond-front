'use client'

import type { ServiceType } from '@/types/api'
import Image from 'next/image'
import { useState } from 'react'
import { BookingSlots } from './BookingSlots'

interface ServiceDetailProps {
	service: ServiceType
	onBack: () => void
}

export function ServiceDetail({ service, onBack }: ServiceDetailProps) {
	const [showBooking, setShowBooking] = useState(false)

	const imageSrc = service.imageUrl
		? service.imageUrl.startsWith('http')
			? service.imageUrl
			: `${process.env.NEXT_PUBLIC_API_URL || ''}${service.imageUrl}`
		: null

	if (showBooking) {
		return (
			<BookingSlots
				service={service}
				onBack={() => setShowBooking(false)}
				onGoHome={onBack}
			/>
		)
	}

	return (
		<div className='flex flex-col gap-4 p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]'>
			{/* Enlarged card — no notch, no three-dots */}
			<div
				className='relative w-full overflow-hidden mt-6'
				style={{
					minHeight: '260px',
					borderRadius: '24px',
					background: 'rgba(15,25,65,0.85)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				{/* Service image — top-right */}
				<div className='absolute top-0 right-0 w-56 h-48'>
					{imageSrc ? (
						<Image
							src={imageSrc}
							alt={service.serviceName}
							fill
							className='object-cover'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center bg-slate-700'>
							<span className='text-4xl'>❄️</span>
						</div>
					)}
				</div>

				{/* Service name and price — bottom-left */}
				<div className='absolute bottom-5 left-5 right-48'>
					<p className='text-yellow-400 uppercase text-sm font-medium leading-tight mb-2'>
						{service.serviceName}
					</p>
					<p className='text-white text-lg font-semibold'>
						{service.cost.toLocaleString('ru-RU')} ₽
					</p>
				</div>
			</div>

			{/* Description panel */}
			<div
				className='rounded-3xl p-4 mb-4'
				style={{
					background: 'rgba(15,25,65,0.85)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				<p className='text-white font-medium mb-3'>Подробнее об услуге</p>
				<p className='text-white/90 text-sm leading-relaxed whitespace-pre-wrap'>
					{service.serviceDescription}
				</p>
			</div>

			{/* Bottom action buttons — fixed */}
			<div
				className='fixed bottom-6 left-2 right-2 flex gap-2'
				style={{
					paddingBottom: 'env(safe-area-inset-bottom, 0px)',
					height: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
				}}
			>
				<button
					onClick={onBack}
					className='flex-1 flex items-center justify-center font-semibold text-white uppercase tracking-wider rounded-3xl cursor-pointer transition-opacity duration-150 hover:opacity-80'
					style={{
						background: 'rgba(15,25,65,0.85)',
						backdropFilter: 'blur(12px)',
						WebkitBackdropFilter: 'blur(12px)',
					}}
				>
					Назад
				</button>
				<button
					onClick={() => setShowBooking(true)}
					className='flex-1 flex items-center justify-center gap-2 font-semibold uppercase tracking-wider rounded-3xl cursor-pointer transition-opacity duration-150 hover:opacity-80'
					style={{ background: '#f5c518', color: '#1a1a1a' }}
				>
					<span>→</span>
					<span>Выбрать</span>
				</button>
			</div>
		</div>
	)
}
