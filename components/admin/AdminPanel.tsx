'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { AdditionalServicesTab } from '@/components/admin/tabs/AdditionalServicesTab'
import { ReservationsTab } from '@/components/admin/tabs/ReservationsTab'
import { ScheduleTab } from '@/components/admin/tabs/ScheduleTab'
import { ServiceTypesTab } from '@/components/admin/tabs/ServiceTypesTab'
import {
	getActiveReservations,
	getAdminAdditionalServices,
	getAdminServiceTypes,
	getCancelledReservations,
	getCompletedReservations,
	getCreatedReservations,
	getSchedules,
} from '@/lib/api/services'
import type {
	AdditionalService,
	AdminReservation,
	AdminReservationsResponse,
	Schedule,
	ServiceType,
} from '@/types/api'
import { useCallback, useEffect, useState } from 'react'

type Tab =
	| 'active'
	| 'created'
	| 'cancelled'
	| 'completed'
	| 'schedules'
	| 'services'
	| 'additionalServices'

const TABS: { id: Tab; label: string }[] = [
	{ id: 'active', label: 'Активные' },
	{ id: 'created', label: 'Созданные' },
	{ id: 'cancelled', label: 'Отменённые' },
	{ id: 'completed', label: 'Выполненные' },
	{ id: 'schedules', label: 'Расписание' },
	{ id: 'services', label: 'Типы услуг' },
	{ id: 'additionalServices', label: 'Доп. услуги' },
]

interface AdminPanelProps {
	onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
	const { initData, isReady } = useTelegram()
	const [activeTab, setActiveTab] = useState<Tab>('active')
	const [reservations, setReservations] = useState<AdminReservation[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [schedules, setSchedules] = useState<Schedule[]>([])
	const [schedulesLoading, setSchedulesLoading] = useState(false)
	const [schedulesError, setSchedulesError] = useState<string | null>(null)
	const [showAddForm, setShowAddForm] = useState(false)

	const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
	const [serviceTypesLoading, setServiceTypesLoading] = useState(false)
	const [serviceTypesError, setServiceTypesError] = useState<string | null>(null)
	const [showAddServiceForm, setShowAddServiceForm] = useState(false)

	const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([])
	const [additionalServicesLoading, setAdditionalServicesLoading] = useState(false)
	const [additionalServicesError, setAdditionalServicesError] = useState<string | null>(null)
	const [showAddAdditionalServiceForm, setShowAddAdditionalServiceForm] = useState(false)

	const fetchReservations = useCallback(async () => {
		if (!isReady || activeTab === 'schedules' || activeTab === 'services' || activeTab === 'additionalServices')
			return
		setLoading(true)
		setError(null)
		setReservations([])
		try {
			let response: AdminReservationsResponse
			if (activeTab === 'active')
				response = await getActiveReservations(initData)
			else if (activeTab === 'created')
				response = await getCreatedReservations(initData)
			else if (activeTab === 'cancelled')
				response = await getCancelledReservations(initData)
			else response = await getCompletedReservations(initData)
			setReservations(response.content)
		} catch {
			setError('Не удалось загрузить данные')
		} finally {
			setLoading(false)
		}
	}, [activeTab, initData, isReady])

	const fetchSchedules = useCallback(async () => {
		if (!isReady || activeTab !== 'schedules') return
		setSchedulesLoading(true)
		setSchedulesError(null)
		try {
			const response = await getSchedules(initData)
			setSchedules(response.content)
		} catch {
			setSchedulesError('Не удалось загрузить расписание')
		} finally {
			setSchedulesLoading(false)
		}
	}, [activeTab, initData, isReady])

	const fetchServiceTypes = useCallback(async () => {
		if (!isReady || activeTab !== 'services') return
		setServiceTypesLoading(true)
		setServiceTypesError(null)
		try {
			const first = await getAdminServiceTypes(initData, 0)
			const all = [...first.content]
			for (let p = 1; p < first.page.totalPages; p++) {
				const page = await getAdminServiceTypes(initData, p)
				all.push(...page.content)
			}
			setServiceTypes(all)
		} catch {
			setServiceTypesError('Не удалось загрузить типы услуг')
		} finally {
			setServiceTypesLoading(false)
		}
	}, [activeTab, initData, isReady])

	const fetchAdditionalServices = useCallback(async () => {
		if (!isReady || activeTab !== 'additionalServices') return
		setAdditionalServicesLoading(true)
		setAdditionalServicesError(null)
		try {
			const first = await getAdminAdditionalServices(initData, 0)
			const all = [...first.content]
			for (let p = 1; p < first.page.totalPages; p++) {
				const page = await getAdminAdditionalServices(initData, p)
				all.push(...page.content)
			}
			setAdditionalServices(all)
		} catch {
			setAdditionalServicesError('Не удалось загрузить доп. услуги')
		} finally {
			setAdditionalServicesLoading(false)
		}
	}, [activeTab, initData, isReady])

	useEffect(() => {
		fetchReservations()
	}, [fetchReservations])

	useEffect(() => {
		fetchSchedules()
	}, [fetchSchedules])

	useEffect(() => {
		fetchServiceTypes()
	}, [fetchServiceTypes])

	useEffect(() => {
		fetchAdditionalServices()
	}, [fetchAdditionalServices])

	function handleUpdate(updated: AdminReservation) {
		setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)))
	}

	function handleRemove(id: number) {
		setReservations(prev => prev.filter(r => r.id !== id))
	}

	function handleScheduleRemove(id: number) {
		setSchedules(prev => prev.filter(s => s.id !== id))
	}

	function handleScheduleAdd(schedule: Schedule) {
		setSchedules(prev => [...prev, schedule])
		setShowAddForm(false)
	}

	function handleScheduleUpdate(updated: Schedule) {
		setSchedules(prev => prev.map(s => (s.id === updated.id ? updated : s)))
	}

	function handleServiceTypeAdd(serviceType: ServiceType) {
		setServiceTypes(prev => [...prev, serviceType])
		setShowAddServiceForm(false)
	}

	function handleServiceTypeUpdate(updated: ServiceType) {
		setServiceTypes(prev => prev.map(s => (s.id === updated.id ? updated : s)))
	}

	function handleAdditionalServiceAdd(service: AdditionalService) {
		setAdditionalServices(prev => [...prev, service])
		setShowAddAdditionalServiceForm(false)
	}

	function handleAdditionalServiceUpdate(updated: AdditionalService) {
		setAdditionalServices(prev => prev.map(s => (s.id === updated.id ? updated : s)))
	}

	return (
		<div
			className='fixed inset-0 z-50 flex flex-col'
			style={{
				background: 'rgba(5,12,40,0.92)',
				backdropFilter: 'blur(16px)',
				WebkitBackdropFilter: 'blur(16px)',
				paddingTop: 'env(safe-area-inset-top, 0px)',
				paddingBottom: 'env(safe-area-inset-bottom, 0px)',
			}}
		>
			{/* Header */}
			<div
				className='flex items-center justify-between px-4 py-4 shrink-0'
				style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
			>
				<h1 className='text-xl font-semibold text-white'>Админ панель</h1>
				<button
					onClick={onClose}
					className='w-8 h-8 flex items-center justify-center rounded-full text-white'
					style={{ background: 'rgba(255,255,255,0.12)' }}
					aria-label='Закрыть'
				>
					✕
				</button>
			</div>

			{/* Tab bar */}
			<div className='flex px-4 pt-3 pb-1 gap-2 shrink-0 overflow-x-auto'>
				{TABS.map(tab => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className='whitespace-nowrap px-4 py-2 rounded-xl text-base font-medium shrink-0 transition-colors'
						style={
							activeTab === tab.id
								? { background: '#f5c518', color: '#1a1a1a' }
								: {
										background: 'rgba(255,255,255,0.1)',
										color: 'rgba(255,255,255,0.90)',
									}
						}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Content */}
			<div className='flex-1 overflow-y-auto px-4 py-3'>
				{activeTab === 'additionalServices' ? (
					<AdditionalServicesTab
						additionalServices={additionalServices}
						loading={additionalServicesLoading}
						error={additionalServicesError}
						showAddForm={showAddAdditionalServiceForm}
						onToggleAddForm={() => setShowAddAdditionalServiceForm(v => !v)}
						initData={initData}
						onAdd={handleAdditionalServiceAdd}
						onCancel={() => setShowAddAdditionalServiceForm(false)}
						onUpdate={handleAdditionalServiceUpdate}
					/>
				) : activeTab === 'services' ? (
					<ServiceTypesTab
						serviceTypes={serviceTypes}
						loading={serviceTypesLoading}
						error={serviceTypesError}
						showAddForm={showAddServiceForm}
						onToggleAddForm={() => setShowAddServiceForm(v => !v)}
						initData={initData}
						onAdd={handleServiceTypeAdd}
						onCancel={() => setShowAddServiceForm(false)}
						onUpdate={handleServiceTypeUpdate}
					/>
				) : activeTab === 'schedules' ? (
					<ScheduleTab
						schedules={schedules}
						loading={schedulesLoading}
						error={schedulesError}
						showAddForm={showAddForm}
						onToggleAddForm={() => setShowAddForm(v => !v)}
						initData={initData}
						onAdd={handleScheduleAdd}
						onCancel={() => setShowAddForm(false)}
						onRemove={handleScheduleRemove}
						onUpdate={handleScheduleUpdate}
					/>
				) : (
					<ReservationsTab
						reservations={reservations}
						loading={loading}
						error={error}
						activeTab={activeTab}
						initData={initData}
						onUpdate={handleUpdate}
						onRemove={handleRemove}
					/>
				)}
			</div>
		</div>
	)
}
