'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getAdditionalServices } from '@/lib/api/services'
import type { AdditionalService } from '@/types/api'
import { useEffect, useState } from 'react'

interface AdditionalServicesSelectorProps {
	onBack: () => void
	onContinue: (selectedIds: number[]) => void
}

function formatPrice(service: AdditionalService): string {
	const base = `${service.cost.toLocaleString('ru-RU')} ₽`
	return !service.pricingFixed && service.unitName ? `${base} за ${service.unitName}` : base
}

export function AdditionalServicesSelector({
	onBack,
	onContinue,
}: AdditionalServicesSelectorProps) {
	const { initData, isReady } = useTelegram()
	const [services, setServices] = useState<AdditionalService[]>([])
	const [selectedIds, setSelectedIds] = useState<number[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!isReady) return
		async function fetchServices() {
			try {
				const first = await getAdditionalServices(initData, 0)
				const all = [...first.content]
				for (let p = 1; p < first.page.totalPages; p++) {
					const page = await getAdditionalServices(initData, p)
					all.push(...page.content)
				}
				setServices(all)
			} catch {
				setError('Не удалось загрузить доп. услуги')
			} finally {
				setLoading(false)
			}
		}
		fetchServices()
	}, [initData, isReady])

	function toggleSelect(id: number) {
		setSelectedIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
		)
	}

	return (
		<div className='flex flex-col gap-4 p-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]'>
			<p className='text-white/90 text-sm mt-6'>
				Дополнительные услуги
			</p>

			{loading ? (
				<LoadingSpinner />
			) : error ? (
				<ErrorMessage message={error} />
			) : services.length === 0 ? (
				<p className='text-white/70 text-sm'>Нет доступных доп. услуг</p>
			) : (
				<div className='flex flex-col gap-3'>
					{services.map(service => {
						const isSelected = selectedIds.includes(service.id)
						return (
							<button
								key={service.id}
								onClick={() => toggleSelect(service.id)}
								className='w-full text-left p-4 rounded-2xl transition-opacity duration-150 hover:opacity-90'
								style={{
									background: isSelected
										? 'rgba(245,197,24,0.15)'
										: 'rgba(15,25,65,0.85)',
									backdropFilter: 'blur(12px)',
									WebkitBackdropFilter: 'blur(12px)',
									border: isSelected
										? '1.5px solid #f5c518'
										: '1.5px solid transparent',
								}}
							>
								<div className='flex items-start justify-between gap-2 mb-1'>
									<span className='text-white font-medium text-sm'>
										{service.serviceName}
									</span>
									<span
										className='text-sm font-semibold shrink-0'
										style={{ color: '#f5c518' }}
									>
										{formatPrice(service)}
									</span>
								</div>
								{service.serviceDescription && (
									<p className='text-xs' style={{ color: 'rgba(255,255,255,0.65)' }}>
										{service.serviceDescription}
									</p>
								)}
							</button>
						)
					})}
				</div>
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
				<button
					onClick={() => onContinue(selectedIds)}
					className='flex-[2] py-4 rounded-3xl font-semibold text-black cursor-pointer transition-opacity duration-150 hover:opacity-80'
					style={{ background: '#f5c518' }}
				>
					{selectedIds.length > 0
						? `Продолжить (${selectedIds.length})`
						: 'Пропустить'}
				</button>
			</div>
		</div>
	)
}
