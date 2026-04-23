'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { blockScheduleSlot, deleteSchedule, getAdminScheduleSlots, updateSchedule } from '@/lib/api/services'
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

	const [slotsOpen, setSlotsOpen] = useState(false)
	const [slots, setSlots] = useState<string[]>([])
	const [slotsLoading, setSlotsLoading] = useState(false)
	const [slotsError, setSlotsError] = useState<string | null>(null)
	const [confirmSlot, setConfirmSlot] = useState<string | null>(null)

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

	async function handleToggleSlots() {
		if (slotsOpen) {
			setSlotsOpen(false)
			return
		}
		setSlotsOpen(true)
		setSlotsLoading(true)
		setSlotsError(null)
		try {
			const data = await getAdminScheduleSlots(initData, schedule.date)
			setSlots(data)
		} catch {
			setSlotsError('Не удалось загрузить слоты')
		} finally {
			setSlotsLoading(false)
		}
	}

	async function handleBlockSlot() {
		if (!confirmSlot) return
		const dateTime = `${schedule.date}T${confirmSlot}`
		setConfirmSlot(null)
		setSlotsLoading(true)
		setSlotsError(null)
		try {
			const updated = await blockScheduleSlot(initData, dateTime)
			setSlots(updated)
		} catch {
			setSlotsError('Ошибка при блокировке слота')
		} finally {
			setSlotsLoading(false)
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
			{slotsOpen && (
				<div className='mb-3'>
					{slotsLoading ? (
						<p className='text-sm text-center py-2' style={{ color: 'rgba(255,255,255,0.70)' }}>
							Загрузка слотов...
						</p>
					) : slotsError ? (
						<p className='text-sm' style={{ color: '#ff5f5f' }}>{slotsError}</p>
					) : slots.length === 0 ? (
						<p className='text-sm' style={{ color: 'rgba(255,255,255,0.70)' }}>
							Нет доступных слотов
						</p>
					) : (
						<div className='grid grid-cols-3 gap-2'>
							{slots.map(slot => (
								<button
									key={slot}
									onClick={() => setConfirmSlot(slot)}
									className='py-2 rounded-2xl text-white text-sm font-medium transition-opacity duration-150 hover:opacity-80'
									style={{
										background: 'rgba(15,25,65,0.85)',
										backdropFilter: 'blur(12px)',
										WebkitBackdropFilter: 'blur(12px)',
										border: '1.5px solid transparent',
									}}
								>
									{slot.replace(/:\d{2}$/, '')}
								</button>
							))}
						</div>
					)}
				</div>
			)}
			{confirmSlot && (
				<ConfirmDialog
					message={`Вы действительно хотите заблокировать слот ${confirmSlot.replace(/:\d{2}$/, '')}?`}
					onConfirm={handleBlockSlot}
					onCancel={() => setConfirmSlot(null)}
				/>
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
						onClick={handleToggleSlots}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{
							background: slotsOpen ? 'rgba(245,197,24,0.25)' : 'rgba(255,255,255,0.12)',
							color: 'rgba(255,255,255,0.95)',
						}}
					>
						{slotsOpen ? 'Скрыть слоты' : 'Слоты'}
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
