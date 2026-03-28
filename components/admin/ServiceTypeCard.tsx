'use client'

import { hideServiceType, showServiceType, updateServiceType } from '@/lib/api/services'
import type { ServiceType, TypeOfServiceDto } from '@/types/api'
import { useState } from 'react'

interface ServiceTypeCardProps {
	serviceType: ServiceType
	initData: string
	onUpdate: (updated: ServiceType) => void
}

export function ServiceTypeCard({
	serviceType,
	initData,
	onUpdate,
}: ServiceTypeCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState(false)
	const [editName, setEditName] = useState(serviceType.serviceName)
	const [editCost, setEditCost] = useState(String(serviceType.cost))
	const [editDuration, setEditDuration] = useState(
		String(serviceType.durationOfWork),
	)
	const [editDescription, setEditDescription] = useState(
		serviceType.serviceDescription ?? '',
	)
	const [editPriceFixed, setEditPriceFixed] = useState(serviceType.priceFixed)
	const [editUnitName, setEditUnitName] = useState(serviceType.unitName ?? '')

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
			const updated = serviceType.active
				? await hideServiceType(initData, serviceType.id)
				: await showServiceType(initData, serviceType.id)
			onUpdate(updated)
		} catch {
			setError('Ошибка при изменении статуса')
		} finally {
			setLoading(false)
		}
	}

	async function handleSave() {
		if (!editPriceFixed && !editUnitName.trim()) {
			setError('Укажите единицу измерения для нефиксированной цены')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const dto: TypeOfServiceDto = {
				serviceName: editName,
				cost: Number(editCost),
				priceFixed: editPriceFixed,
				durationOfWork: Number(editDuration),
				serviceDescription: editDescription || undefined,
				unitName: editPriceFixed ? undefined : editUnitName.trim(),
			}
			const updated = await updateServiceType(initData, serviceType.id, dto)
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
					{editing ? editName : serviceType.serviceName}
				</span>
				<span className='text-sm' style={{ color: 'rgba(255,255,255,0.80)' }}>
					#{serviceType.id}
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
						<label
							className='block text-sm mb-1'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Длительность (мин)
						</label>
						<input
							type='number'
							value={editDuration}
							onChange={e => setEditDuration(e.target.value)}
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
					<div>
						<label
							className='block text-sm mb-2'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Тип цены
						</label>
						<div className='flex gap-3'>
							<label
								className='flex items-center gap-2 cursor-pointer'
								style={{
									color: 'rgba(255,255,255,0.90)',
									fontSize: '0.875rem',
								}}
							>
								<input
									type='radio'
									checked={editPriceFixed}
									onChange={() => setEditPriceFixed(true)}
								/>
								Фиксированная
							</label>
							<label
								className='flex items-center gap-2 cursor-pointer'
								style={{
									color: 'rgba(255,255,255,0.90)',
									fontSize: '0.875rem',
								}}
							>
								<input
									type='radio'
									checked={!editPriceFixed}
									onChange={() => setEditPriceFixed(false)}
								/>
								За единицу
							</label>
						</div>
					</div>
					{!editPriceFixed && (
						<div>
							<label
								className='block text-sm mb-1'
								style={{ color: 'rgba(255,255,255,0.80)' }}
							>
								Единица измерения *
							</label>
							<input
								type='text'
								value={editUnitName}
								onChange={e => setEditUnitName(e.target.value)}
								placeholder='например: 100 грамм'
								style={inputStyle}
							/>
						</div>
					)}
				</div>
			) : (
				<div
					className='text-sm space-y-1 mb-3'
					style={{ color: 'rgba(255,255,255,0.90)' }}
				>
					<div>Статус: {serviceType.active ? 'Активно' : 'Скрыто'}</div>
					<div>
						Стоимость: {serviceType.cost.toLocaleString('ru-RU')} ₽
						{!serviceType.priceFixed && serviceType.unitName
							? ` за ${serviceType.unitName}`
							: ''}
					</div>
					<div>
						Тип цены: {serviceType.priceFixed ? 'Фиксированная' : 'За единицу'}
					</div>
					<div>Длительность: {serviceType.durationOfWork} мин</div>
					{serviceType.serviceDescription && (
						<div>Описание: {serviceType.serviceDescription}</div>
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
						{loading ? '...' : serviceType.active ? 'Скрыть' : 'Отобразить'}
					</button>
				</div>
			)}
		</div>
	)
}
