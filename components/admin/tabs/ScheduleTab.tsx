'use client'

import { AddScheduleForm } from '@/components/admin/AddScheduleForm'
import { ScheduleCard } from '@/components/admin/ScheduleCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Schedule } from '@/types/api'

interface ScheduleTabProps {
	schedules: Schedule[]
	loading: boolean
	error: string | null
	showAddForm: boolean
	onToggleAddForm: () => void
	initData: string
	onAdd: (schedule: Schedule) => void
	onCancel: () => void
	onRemove: (id: number) => void
	onUpdate: (updated: Schedule) => void
}

export function ScheduleTab({
	schedules,
	loading,
	error,
	showAddForm,
	onToggleAddForm,
	initData,
	onAdd,
	onCancel,
	onRemove,
	onUpdate,
}: ScheduleTabProps) {
	return (
		<>
			<button
				onClick={onToggleAddForm}
				className='w-full py-3 rounded-xl text-base font-medium mb-3'
				style={{ background: '#f5c518', color: '#1a1a1a' }}
			>
				Добавить расписание
			</button>
			{showAddForm && (
				<AddScheduleForm
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
			{!loading && !error && schedules.length === 0 && (
				<p
					className='text-center py-8 text-base'
					style={{ color: 'rgba(255,255,255,0.70)' }}
				>
					Нет расписаний
				</p>
			)}
			{!loading &&
				!error &&
				schedules.map(s => (
					<ScheduleCard
						key={s.id}
						schedule={s}
						initData={initData}
						onRemove={onRemove}
						onUpdate={onUpdate}
					/>
				))}
		</>
	)
}
