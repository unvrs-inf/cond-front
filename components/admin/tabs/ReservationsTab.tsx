'use client'

import { ReservationCard } from '@/components/admin/ReservationCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { AdminReservation } from '@/types/api'

type Tab = 'active' | 'created' | 'cancelled' | 'completed' | 'schedules' | 'services' | 'additionalServices'

interface ReservationsTabProps {
	reservations: AdminReservation[]
	loading: boolean
	error: string | null
	activeTab: Tab
	initData: string
	onUpdate: (updated: AdminReservation) => void
	onRemove: (id: number) => void
}

export function ReservationsTab({
	reservations,
	loading,
	error,
	activeTab,
	initData,
	onUpdate,
	onRemove,
}: ReservationsTabProps) {
	return (
		<>
			{loading && (
				<div className='flex justify-center py-8'>
					<LoadingSpinner />
				</div>
			)}
			{!loading && error && <ErrorMessage message={error} />}
			{!loading && !error && reservations.length === 0 && (
				<p
					className='text-center py-8 text-base'
					style={{ color: 'rgba(255,255,255,0.70)' }}
				>
					Нет записей
				</p>
			)}
			{!loading &&
				!error &&
				reservations.map(r => (
					<ReservationCard
						key={r.id}
						reservation={r}
						tab={activeTab}
						initData={initData}
						onUpdate={onUpdate}
						onRemove={onRemove}
					/>
				))}
		</>
	)
}
