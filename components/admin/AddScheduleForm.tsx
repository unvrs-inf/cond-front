'use client'

import { createSchedule } from '@/lib/api/services'
import type { CreateScheduleDto, Schedule } from '@/types/api'
import { useState } from 'react'

interface AddScheduleFormProps {
	initData: string
	onAdd: (schedule: Schedule) => void
	onCancel: () => void
}

export function AddScheduleForm({ initData, onAdd, onCancel }: AddScheduleFormProps) {
	const today = new Date().toISOString().split('T')[0]
	const [date, setDate] = useState(today)
	const [workBeginning, setWorkBeginning] = useState('09:00')
	const [workEnding, setWorkEnding] = useState('18:00')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

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

	async function handleSave() {
		setLoading(true)
		setError(null)
		try {
			const dto: CreateScheduleDto = { date, workBeginning, workEnding }
			const created = await createSchedule(initData, dto)
			onAdd(created)
		} catch {
			setError('Ошибка при сохранении')
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
						value={date}
						min={today}
						onChange={e => setDate(e.target.value)}
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
						value={workBeginning}
						onChange={e => setWorkBeginning(e.target.value)}
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
						value={workEnding}
						onChange={e => setWorkEnding(e.target.value)}
						style={inputStyle}
					/>
				</div>
			</div>
			{error && <p className='text-sm text-red-400 mb-2'>{error}</p>}
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
					onClick={onCancel}
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
		</div>
	)
}
