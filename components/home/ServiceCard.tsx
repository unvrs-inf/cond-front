'use client'

import type { ServiceType } from '@/types/api'
import Image from 'next/image'

interface ServiceCardProps {
	service: ServiceType
	onClick?: () => void
	fullWidth?: boolean
}

export function ServiceCard({ service, onClick, fullWidth }: ServiceCardProps) {
	const imageSrc = service.imageUrl
		? service.imageUrl.startsWith('http')
			? service.imageUrl
			: `${process.env.NEXT_PUBLIC_API_URL || ''}${service.imageUrl}`
		: null

	return (
		<div
			className='relative cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]'
			style={{ minHeight: fullWidth ? '320px' : '260px' }}
			onClick={onClick}
		>
			{/* Frosted glass card body */}
			<div
				className='absolute inset-0 rounded-3xl overflow-hidden'
				style={{
					background: 'rgba(100, 150, 255, 0.13)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				{/* Service image — top-right inside card */}
				<div
					className={`absolute top-0 right-0 ${fullWidth ? 'w-[238px] h-[220px]' : 'w-[150px] h-[140px]'}`}
				>
					{imageSrc ? (
						<Image
							src={imageSrc}
							alt={service.serviceName}
							fill
							className='object-cover'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center bg-slate-700'>
							<span className='text-3xl'>❄️</span>
						</div>
					)}
				</div>

				{/* Service name and price — bottom-left */}
				<div className='absolute bottom-5 left-5 right-5'>
					<p
						className={`text-yellow-400 uppercase font-medium leading-tight mb-1 line-clamp-2 ${fullWidth ? 'text-lg' : 'text-sm'}`}
					>
						{service.serviceName}
					</p>
					<p
						className={`text-white font-semibold ${fullWidth ? 'text-xl' : 'text-sm'}`}
					>
						{service.cost.toLocaleString('ru-RU')} ₽
						{!service.priceFixed && service.unitName
							? ` за ${service.unitName}`
							: ''}
					</p>
				</div>
			</div>
		</div>
	)
}
