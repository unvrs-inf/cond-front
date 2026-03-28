'use client'

import { hideAdditionalService, showAdditionalService, updateAdditionalService } from '@/lib/api/services'
import type { AdditionalService, AdditionalServiceDto } from '@/types/api'
import { useState } from 'react'

interface AdditionalServiceCardProps {
	service: AdditionalService
	initData: string
	onUpdate: (updated: AdditionalService) => void
}

export function AdditionalServiceCard({
	service,
	initData,
	onUpdate,
}: AdditionalServiceCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState(false)
	const [editName, setEditName] = useState(service.serviceName)
	const [editCost, setEditCost] = useState(String(service.cost))
	const [editDescription, setEditDescription] = useState(service.serviceDescription ?? '')
	const [editPricingFixed, setEditPricingFixed] = useState(service.pricingFixed)
	const [editUnitName, setEditUnitName] = useState(service.unitName ?? '')

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
				? await hideAdditionalService(initData, service.id)
				: await showAdditionalService(initData, service.id)
			onUpdate(updated)
		} catch {
			setError('Ошибка при изменении статуса')
		} finally {
			setLoading(false)
		}
	}

	async function handleSave() {
		if (!editPricingFixed && !editUnitName.trim()) {
			setError('Укажите единицу измерения')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const dto: AdditionalServiceDto = {
				serviceName: editName,
				cost: Number(editCost),
				pricingFixed: editPricingFixed,
				serviceDescription: editDescription || undefined,
				unitName: !editPricingFixed ? editUnitName.trim() : undefined,
			}
			const updated = await updateAdditionalService(initData, service.id, dto)
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
					{editing ? editName : service.serviceName}
				</span>
				<span className='text-sm' style={{ color: 'rgba(255,255,255,0.80)' }}>
					#{service.id}
				</span>
			</div>
			{editing ? (
				<div className='space-y-3 mb-3'>
					<div>
						<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
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
						<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
							Стоимость (₽)
						</label>
						<input
							type='number'
							value={editCost}
							onChange={e => setEditCost(e.target.value)}
							style={inputStyle}
						/>
					</div>
					<div>
						<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
							Описание
						</label>
						<textarea
							value={editDescription}
							onChange={e => setEditDescription(e.target.value)}
							rows={3}
							style={{ ...inputStyle, resize: 'none' }}
						/>
					</div>
					<div>
						<label className='block text-sm mb-2' style={{ color: 'rgba(255,255,255,0.80)' }}>
							Тип цены
						</label>
						<div className='flex gap-3'>
							<label
								className='flex items-center gap-2 cursor-pointer'
								style={{ color: 'rgba(255,255,255,0.90)', fontSize: '0.875rem' }}
							>
								<input
									type='radio'
									checked={editPricingFixed}
									onChange={() => setEditPricingFixed(true)}
								/>
								Фиксированная
							</label>
							<label
								className='flex items-center gap-2 cursor-pointer'
								style={{ color: 'rgba(255,255,255,0.90)', fontSize: '0.875rem' }}
							>
								<input
									type='radio'
									checked={!editPricingFixed}
									onChange={() => setEditPricingFixed(false)}
								/>
								За единицу
							</label>
						</div>
					</div>
					{!editPricingFixed && (
						<div>
							<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
								Единица измерения *
							</label>
							<input
								type='text'
								value={editUnitName}
								onChange={e => setEditUnitName(e.target.value)}
								placeholder='например: кг'
								style={inputStyle}
							/>
						</div>
					)}
				</div>
			) : (
				<div className='text-sm space-y-1 mb-3' style={{ color: 'rgba(255,255,255,0.90)' }}>
					<div>Статус: {service.active ? 'Активно' : 'Скрыто'}</div>
					<div>
						Стоимость: {service.cost.toLocaleString('ru-RU')} ₽
						{!service.pricingFixed && service.unitName ? ` за ${service.unitName}` : ''}
					</div>
					<div>Тип цены: {service.pricingFixed ? 'Фиксированная' : 'За единицу'}</div>
					{service.serviceDescription && (
						<div>Описание: {service.serviceDescription}</div>
					)}
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
						onClick={handleToggleActive}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }}
					>
						{loading ? '...' : service.active ? 'Скрыть' : 'Отобразить'}
					</button>
				</div>
			)}
		</div>
	)
}
