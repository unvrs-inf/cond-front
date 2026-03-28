'use client'

import { createAdmin } from '@/lib/api/services'
import type { Admin, AdminDto } from '@/types/api'
import { useState } from 'react'

interface AddAdminFormProps {
	initData: string
	onAdd: (admin: Admin) => void
	onCancel: () => void
}

export function AddAdminForm({ initData, onAdd, onCancel }: AddAdminFormProps) {
	const [telegramId, setTelegramId] = useState('')
	const [name, setName] = useState('')
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
	}

	async function handleSave() {
		if (!telegramId.trim() || isNaN(Number(telegramId))) {
			setError('Укажите корректный Telegram ID')
			return
		}
		if (!name.trim()) {
			setError('Укажите имя')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const dto: AdminDto = { id: Number(telegramId), name: name.trim() }
			const created = await createAdmin(initData, dto)
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
					<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
						Telegram ID
					</label>
					<input
						type='number'
						value={telegramId}
						onChange={e => setTelegramId(e.target.value)}
						placeholder='например: 123456789'
						style={inputStyle}
					/>
				</div>
				<div>
					<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
						Имя
					</label>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
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
					style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }}
				>
					Отмена
				</button>
			</div>
		</div>
	)
}
