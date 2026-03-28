'use client'

import { AddServiceTypeForm } from '@/components/admin/AddServiceTypeForm'
import { ServiceTypeCard } from '@/components/admin/ServiceTypeCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { ServiceType } from '@/types/api'

interface ServiceTypesTabProps {
	serviceTypes: ServiceType[]
	loading: boolean
	error: string | null
	showAddForm: boolean
	onToggleAddForm: () => void
	initData: string
	onAdd: (serviceType: ServiceType) => void
	onCancel: () => void
	onUpdate: (updated: ServiceType) => void
}

export function ServiceTypesTab({
	serviceTypes,
	loading,
	error,
	showAddForm,
	onToggleAddForm,
	initData,
	onAdd,
	onCancel,
	onUpdate,
}: ServiceTypesTabProps) {
	return (
		<>
			<button
				onClick={onToggleAddForm}
				className='w-full py-3 rounded-xl text-base font-medium mb-3'
				style={{ background: '#f5c518', color: '#1a1a1a' }}
			>
				Добавить тип услуги
			</button>
			{showAddForm && (
				<AddServiceTypeForm
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
			{!loading && !error && serviceTypes.length === 0 && (
				<p
					className='text-center py-8 text-base'
					style={{ color: 'rgba(255,255,255,0.70)' }}
				>
					Нет типов услуг
				</p>
			)}
			{!loading &&
				!error &&
				serviceTypes.map(s => (
					<ServiceTypeCard
						key={s.id}
						serviceType={s}
						initData={initData}
						onUpdate={onUpdate}
					/>
				))}
		</>
	)
}
