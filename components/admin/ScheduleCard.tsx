'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteSchedule, updateSchedule } from '@/lib/api/services'
import type { Schedule } from '@/types/api'
import { useState } from 'react'
import { formatScheduleDate } from './formatters'

interface ScheduleCardProps {
	schedule: Schedule
	initData: string
	onRemove: (id: number) => void
	onUpdate: (updated: Schedule) => void
}

export function ScheduleCard({
	schedule,
	initData,
	onRemove,
	onUpdate,
}: ScheduleCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [editDate, setEditDate] = useState(schedule.date)
	const [editBeginning, setEditBeginning] = useState(
		schedule.workBeginning.slice(0, 5),
	)
	const [editEnding, setEditEnding] = useState(schedule.workEnding.slice(0, 5))

	const inputStyle = {
		background: 'rgba(255,255,255,0.1)',
		color: 'white',
		borderRadius: 12,
		border: '1px solid rgba(255,255,255,0.15)',
		padding: '8px 12px',
		width: '100%',
		fontSize: '0.875rem',
		colorScheme: 'dark' as const,
	}

	async function handleDelete() {
		setLoading(true)
		setError(null)
		try {
			await deleteSchedule(initData, schedule.id)
			onRemove(schedule.id)
		} catch {
			setError('Ошибка при удалении')
			setLoading(false)
		}
	}

	async function handleSave() {
		setLoading(true)
		setError(null)
		try {
			const updated = await updateSchedule(initData, schedule.id, {
				date: editDate,
				workBeginning: editBeginning,
				workEnding: editEnding,
			})
			onUpdate(updated)
			setEditing(false)
		} catch {
			setError('Ошибка при сохранении')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			className='rounded-2xl p-5 mb-4'
			style={{
				background: 'rgba(100,150,255,0.10)',
				backdropFilter: 'blur(8px)',
				WebkitBackdropFilter: 'blur(8px)',
			}}
		>
			<div className='flex items-center justify-between mb-1'>
				<span className='text-base font-semibold' style={{ color: '#f5c518' }}>
					{editing ? editDate : formatScheduleDate(schedule.date)}
				</span>
				<span className='text-sm' style={{ color: 'rgba(255,255,255,0.80)' }}>
					#{schedule.id}
				</span>
			</div>
			{editing ? (
				<div className='space-y-3 mb-3'>
					<div>
						<label
							className='block text-sm mb-1'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Дата
						</label>
						<input
							type='date'
							value={editDate}
							onChange={e => setEditDate(e.target.value)}
							style={inputStyle}
						/>
					</div>
					<div>
						<label
							className='block text-sm mb-1'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Начало работы
						</label>
						<input
							type='time'
							value={editBeginning}
							onChange={e => setEditBeginning(e.target.value)}
							style={inputStyle}
						/>
					</div>
					<div>
						<label
							className='block text-sm mb-1'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Конец работы
						</label>
						<input
							type='time'
							value={editEnding}
							onChange={e => setEditEnding(e.target.value)}
							style={inputStyle}
						/>
					</div>
				</div>
			) : (
				<div
					className='text-sm mb-3'
					style={{ color: 'rgba(255,255,255,0.90)' }}
				>
					{schedule.workBeginning.slice(0, 5)} —{' '}
					{schedule.workEnding.slice(0, 5)}
				</div>
			)}
			{confirmOpen && (
				<ConfirmDialog
					message='Вы точно хотите удалить расписание?'
					onConfirm={() => {
						setConfirmOpen(false)
						handleDelete()
					}}
					onCancel={() => setConfirmOpen(false)}
				/>
			)}
			{error && <p className='text-sm text-red-400 mb-2'>{error}</p>}
			{editing ? (
				<div className='flex gap-2'>
					<button
						onClick={handleSave}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{ background: '#f5c518', color: '#1a1a1a' }}
					>
						{loading ? '...' : 'Сохранить'}
					</button>
					<button
						onClick={() => {
							setEditing(false)
							setError(null)
						}}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{
							background: 'rgba(255,255,255,0.12)',
							color: 'rgba(255,255,255,0.95)',
						}}
					>
						Отмена
					</button>
				</div>
			) : (
				<div className='flex gap-2'>
					<button
						onClick={() => setEditing(true)}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{ background: '#f5c518', color: '#1a1a1a' }}
					>
						Изменить
					</button>
					<button
						onClick={() => setConfirmOpen(true)}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{
							background: 'rgba(255,255,255,0.12)',
							color: 'rgba(255,255,255,0.95)',
						}}
					>
						{loading ? '...' : 'Удалить'}
					</button>
				</div>
			)}
		</div>
	)
}
