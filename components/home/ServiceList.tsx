'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getServiceTypes } from '@/lib/api/services'
import type { ServiceType } from '@/types/api'
import { useEffect, useState } from 'react'
import { ServiceCard } from './ServiceCard'

interface ServiceListProps {
	onSelect: (service: ServiceType) => void
}

export function ServiceList({ onSelect }: ServiceListProps) {
	const { initData, isReady } = useTelegram()
	const [services, setServices] = useState<ServiceType[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!isReady) return

		async function fetchServices() {
			try {
				setLoading(true)
				setError(null)

				const response = await getServiceTypes(initData)
				setServices(response.content)
			} catch (err) {
				const errorMessage =
					(err as { message?: string }).message || 'Не удалось загрузить услуги'
				setError(errorMessage)
				console.error('Failed to fetch services:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchServices()
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

	const isFullWidth = services.length < 2

	return (
		<div>
			<div className={`grid ${isFullWidth ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-8`}>
				{services.map(service => (
					<ServiceCard
						key={service.id}
						service={service}
						fullWidth={isFullWidth}
						onClick={() => onSelect(service)}
					/>
				))}
			</div>
		</div>
	)
}
