'use client'

import { hideInstallationService, showInstallationService, updateInstallationService } from '@/lib/api/services'
import type { InstallationService, InstallationServiceDto } from '@/types/api'
import { useState } from 'react'

interface InstallationServiceCardProps {
	service: InstallationService
	initData: string
	onUpdate: (updated: InstallationService) => void
}

export function InstallationServiceCard({
	service,
	initData,
	onUpdate,
}: InstallationServiceCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState(false)
	const [editName, setEditName] = useState(service.name)
	const [editDescription, setEditDescription] = useState(service.description ?? '')

	const inputStyle = {
		background: 'rgba(255,255,255,0.1)',
		color: 'white',
		borderRadius: 12,
		border: '1px solid rgba(255,255,255,0.15)',
		padding: '8px 12px',
		width: '100%',
		fontSize: '0.875rem',
	}

	async function handleToggleActive() {
		setLoading(true)
		setError(null)
		try {
			const updated = service.active
				? await hideInstallationService(initData, service.id)
				: await showInstallationService(initData, service.id)
			onUpdate(updated)
		} catch {
			setError('Ошибка при изменении статуса')
		} finally {
			setLoading(false)
		}
	}

	async function handleSave() {
		setLoading(true)
		setError(null)
		try {
			const dto: InstallationServiceDto = {
				name: editName,
				description: editDescription,
			}
			const updated = await updateInstallationService(initData, service.id, dto)
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
			<div className='flex items-center justify-between mb-2'>
				<span className='text-base font-semibold' style={{ color: '#f5c518' }}>
					{editing ? editName : service.name}
				</span>
				<span className='text-sm' style={{ color: 'rgba(255,255,255,0.80)' }}>
					#{service.id}
				</span>
			</div>
			{editing ? (
				<div className='space-y-3 mb-3'>
					<div>
						<label
							className='block text-sm mb-1'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Название
						</label>
						<input
							type='text'
							value={editName}
							onChange={e => setEditName(e.target.value)}
							style={inputStyle}
						/>
					</div>
					<div>
						<label
							className='block text-sm mb-1'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Описание
						</label>
						<textarea
							value={editDescription}
							onChange={e => setEditDescription(e.target.value)}
							rows={3}
							style={{ ...inputStyle, resize: 'none' }}
						/>
					</div>
				</div>
			) : (
				<div
					className='text-sm space-y-1 mb-3'
					style={{ color: 'rgba(255,255,255,0.90)' }}
				>
					<div>Статус: {service.active ? 'Активно' : 'Скрыто'}</div>
					{service.description && <div>Описание: {service.description}</div>}
				</div>
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
						onClick={handleToggleActive}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{
							background: 'rgba(255,255,255,0.12)',
							color: 'rgba(255,255,255,0.95)',
						}}
					>
						{loading ? '...' : service.active ? 'Скрыть' : 'Отобразить'}
					</button>
				</div>
			)}
		</div>
	)
}
