'use client'

import { AddServiceTypeForm } from '@/components/admin/AddServiceTypeForm'
import { InstallationServiceCard } from '@/components/admin/InstallationServiceCard'
import { ServiceTypeCard } from '@/components/admin/ServiceTypeCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { InstallationService, ServiceType } from '@/types/api'

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
	installationServices: InstallationService[]
	installationServicesLoading: boolean
	installationServicesError: string | null
	onInstallationServiceUpdate: (updated: InstallationService) => void
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
	installationServices,
	installationServicesLoading,
	installationServicesError,
	onInstallationServiceUpdate,
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

			<p
				className='text-base font-semibold mt-6 mb-3'
				style={{ color: 'rgba(255,255,255,0.90)' }}
			>
				Установка кондиционера
			</p>
			{installationServicesLoading && (
				<div className='flex justify-center py-8'>
					<LoadingSpinner />
				</div>
			)}
			{!installationServicesLoading && installationServicesError && (
				<ErrorMessage message={installationServicesError} />
			)}
			{!installationServicesLoading && !installationServicesError && installationServices.length === 0 && (
				<p
					className='text-center py-8 text-base'
					style={{ color: 'rgba(255,255,255,0.70)' }}
				>
					Нет услуг по установке
				</p>
			)}
			{!installationServicesLoading &&
				!installationServicesError &&
				installationServices.map(s => (
					<InstallationServiceCard
						key={s.id}
						service={s}
						initData={initData}
						onUpdate={onInstallationServiceUpdate}
					/>
				))}
		</>
	)
}
