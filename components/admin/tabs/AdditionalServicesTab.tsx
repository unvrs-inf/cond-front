'use client'

import { AddAdditionalServiceForm } from '@/components/admin/AddAdditionalServiceForm'
import { AdditionalServiceCard } from '@/components/admin/AdditionalServiceCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { AdditionalService } from '@/types/api'

interface AdditionalServicesTabProps {
	additionalServices: AdditionalService[]
	loading: boolean
	error: string | null
	showAddForm: boolean
	onToggleAddForm: () => void
	initData: string
	onAdd: (service: AdditionalService) => void
	onCancel: () => void
	onUpdate: (updated: AdditionalService) => void
}

export function AdditionalServicesTab({
	additionalServices,
	loading,
	error,
	showAddForm,
	onToggleAddForm,
	initData,
	onAdd,
	onCancel,
	onUpdate,
}: AdditionalServicesTabProps) {
	return (
		<>
			<button
				onClick={onToggleAddForm}
				className='w-full py-3 rounded-xl text-base font-medium mb-3'
				style={{ background: '#f5c518', color: '#1a1a1a' }}
			>
				Добавить доп. услугу
			</button>
			{showAddForm && (
				<AddAdditionalServiceForm
					initData={initData}
					onAdd={onAdd}
					onCancel={onCancel}
				/>
			)}
			{loading && (
				<div className='flex justify-center py-8'>
					<LoadingSpinner />
				</div>
			)}
			{!loading && error && <ErrorMessage message={error} />}
			{!loading && !error && additionalServices.length === 0 && (
				<p
					className='text-center py-8 text-base'
					style={{ color: 'rgba(255,255,255,0.70)' }}
				>
					Нет доп. услуг
				</p>
			)}
			{!loading &&
				!error &&
				additionalServices.map(s => (
					<AdditionalServiceCard
						key={s.id}
						service={s}
						initData={initData}
						onUpdate={onUpdate}
					/>
				))}
		</>
	)
}
