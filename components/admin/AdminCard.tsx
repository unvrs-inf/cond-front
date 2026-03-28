'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteAdmin, updateAdmin } from '@/lib/api/services'
import type { Admin, AdminDto } from '@/types/api'
import { useState } from 'react'

interface AdminCardProps {
	admin: Admin
	initData: string
	onUpdate: (updated: Admin) => void
	onRemove: (id: number) => void
}

export function AdminCard({ admin, initData, onUpdate, onRemove }: AdminCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [editName, setEditName] = useState(admin.name)

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
		if (!editName.trim()) {
			setError('Укажите имя')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const dto: AdminDto = { id: admin.id, name: editName.trim() }
			const updated = await updateAdmin(initData, admin.id, dto)
			onUpdate(updated)
			setEditing(false)
		} catch {
			setError('Ошибка при сохранении')
		} finally {
			setLoading(false)
		}
	}

	async function handleDelete() {
		setLoading(true)
		setError(null)
		try {
			await deleteAdmin(initData, admin.id)
			onRemove(admin.id)
		} catch {
			setError('Ошибка при удалении')
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
			<div className='flex items-center justify-between mb-2'>
				<span className='text-base font-semibold' style={{ color: '#f5c518' }}>
					{editing ? editName : admin.name}
				</span>
				<span className='text-sm' style={{ color: 'rgba(255,255,255,0.80)' }}>
					#{admin.id}
				</span>
			</div>
			{editing ? (
				<div className='mb-3'>
					<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
						Имя
					</label>
					<input
						type='text'
						value={editName}
						onChange={e => setEditName(e.target.value)}
						style={inputStyle}
					/>
				</div>
			) : (
				<div className='text-sm mb-3' style={{ color: 'rgba(255,255,255,0.90)' }}>
					Telegram ID: {admin.id}
				</div>
			)}
			{confirmOpen && (
				<ConfirmDialog
					message='Вы точно хотите удалить администратора?'
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
						onClick={() => { setEditing(false); setError(null) }}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }}
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
						style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }}
					>
						{loading ? '...' : 'Удалить'}
					</button>
				</div>
			)}
		</div>
	)
}
