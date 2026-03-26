'use client'

import type { ServiceType } from '@/types/api'
import Image from 'next/image'
import { useLayoutEffect, useRef, useState } from 'react'

interface ServiceCardProps {
	service: ServiceType
	onClick?: () => void
	fullWidth?: boolean
}

const CORNER_R = 24 // rounded-3xl

function buildClipPath(w: number, h: number, nr: number): string {
	const r = CORNER_R
	return `path('M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - nr} A ${nr} ${nr} 0 0 0 ${w - nr} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z')`
}

export function ServiceCard({ service, onClick, fullWidth }: ServiceCardProps) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [clipPath, setClipPath] = useState('')

	const buttonSize = fullWidth ? 72 : 48
	const notchR = buttonSize / 2

	useLayoutEffect(() => {
		const el = wrapperRef.current
		if (!el) return
		const update = () =>
			setClipPath(buildClipPath(el.offsetWidth, el.offsetHeight, notchR))
		update()
		const ro = new ResizeObserver(update)
		ro.observe(el)
		return () => ro.disconnect()
	}, [notchR])

	const imageSrc = service.imageUrl
		? service.imageUrl.startsWith('http')
			? service.imageUrl
			: `${process.env.NEXT_PUBLIC_API_URL || ''}${service.imageUrl}`
		: null

	return (
		<div
			ref={wrapperRef}
			className='relative cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]'
			style={{ minHeight: fullWidth ? '320px' : '260px' }}
			onClick={onClick}
		>
			{/* Frosted glass card body */}
			<div
				className='absolute inset-0'
				style={{
					background: 'rgba(100, 150, 255, 0.13)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
					clipPath: clipPath || undefined,
					borderRadius: clipPath ? undefined : `${CORNER_R}px`,
				}}
			>
				{/* Service image — top-right inside card */}
				<div className={`absolute top-0 right-0 ${fullWidth ? 'w-[238px] h-[220px]' : 'w-[150px] h-[140px]'}`}>
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
				<div className='absolute bottom-5 left-5 right-20'>
					<p className={`text-yellow-400 uppercase font-medium leading-tight mb-1 line-clamp-2 ${fullWidth ? 'text-lg' : 'text-sm'}`}>
						{service.serviceName}
					</p>
					<p className={`text-white font-semibold ${fullWidth ? 'text-xl' : 'text-base'}`}>
						{service.cost.toLocaleString('ru-RU')} ₽
					</p>
				</div>
			</div>

			{/* Three-dots circle — sits in bottom-right notch */}
			<div
				className='absolute rounded-full flex items-center justify-center z-10'
				style={{
					bottom: 0,
					right: 0,
					width: `${buttonSize}px`,
					height: `${buttonSize}px`,
					background: 'linear-gradient(145deg, #0f1941d9 0%, #5a5a7a 100%)',
				}}
			>
				<span className={`text-white leading-none tracking-[0.2em] ${fullWidth ? 'text-xl' : 'text-sm'}`}>
					···
				</span>
			</div>
		</div>
	)
}
