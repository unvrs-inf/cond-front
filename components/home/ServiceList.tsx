'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getServiceTypes } from '@/lib/api/services'
import type { ServiceType, InstallationDto } from '@/types/api'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ServiceCard } from './ServiceCard'

interface ServiceListProps {
	onSelect: (service: ServiceType) => void
	installation?: InstallationDto | null
	onInstallationClick?: () => void
}

export function ServiceList({ onSelect, installation, onInstallationClick }: ServiceListProps) {
	const { initData, isReady } = useTelegram()
	const [services, setServices] = useState<ServiceType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!isReady || !initData) return
		let cancelled = false

		async function fetchServices() {
			try {
				setLoading(true)
				setError(null)

				const firstPage = await getServiceTypes(initData, 0, 50)
				let all = [...firstPage.content]
				const totalPages = firstPage.page.totalPages
				for (let page = 1; page < totalPages; page++) {
					const next = await getServiceTypes(initData, page, 50)
					all = [...all, ...next.content]
				}
				const sorted = [...all].sort((a, b) => {
						if (a.serviceName === 'Чистка кондиционера') return -1
						if (b.serviceName === 'Чистка кондиционера') return 1
						return 0
					})
					if (!cancelled) setServices(sorted)
			} catch (err) {
				if (!cancelled) {
					const errorMessage =
						(err as { message?: string }).message || 'Не удалось загрузить услуги'
					setError(errorMessage)
					console.error('Failed to fetch services:', err)
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		fetchServices()
		return () => { cancelled = true }
	}, [isReady, initData])

	if (loading) {
		return <LoadingSpinner />
	}

	if (error) {
		return <ErrorMessage message={error} />
	}

	if (services.length === 0) {
		return (
			<div className='text-center py-8'>
				<p className='text-white/70'>Услуги не найдены</p>
			</div>
		)
	}

	const installationImageSrc = installation?.imageUrl
		? installation.imageUrl.startsWith('http')
			? installation.imageUrl
			: `${process.env.NEXT_PUBLIC_API_URL || ''}${installation.imageUrl}`
		: null

	return (
		<div>
			<div className='grid grid-cols-1 gap-4 mb-8'>
				{services.map(service => (
					<ServiceCard
						key={service.id}
						service={service}
						fullWidth
						onClick={() => onSelect(service)}
					/>
				))}
				{installation && onInstallationClick && (
					<div
						className='relative cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]'
						style={{ minHeight: '320px' }}
						onClick={onInstallationClick}
					>
						<div
							className='absolute inset-0 rounded-3xl overflow-hidden'
							style={{
								background: 'rgba(100, 150, 255, 0.13)',
								backdropFilter: 'blur(12px)',
								WebkitBackdropFilter: 'blur(12px)',
							}}
						>
							<div className='absolute top-0 right-0 w-[238px] h-[220px]'>
								{installationImageSrc ? (
									<Image
										src={installationImageSrc}
										alt={installation.name}
										fill
										className='object-cover'
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center bg-slate-700'>
										<span className='text-3xl'>❄️</span>
									</div>
								)}
							</div>
							<div className='absolute bottom-5 left-5 right-5'>
								<p className='text-yellow-400 uppercase font-medium leading-tight mb-1 line-clamp-2 text-lg'>
									{installation.name}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
