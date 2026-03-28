'use client'

import { createAdditionalService } from '@/lib/api/services'
import type { AdditionalService, AdditionalServiceDto } from '@/types/api'
import { useState } from 'react'

interface AddAdditionalServiceFormProps {
	initData: string
	onAdd: (service: AdditionalService) => void
	onCancel: () => void
}

export function AddAdditionalServiceForm({
	initData,
	onAdd,
	onCancel,
}: AddAdditionalServiceFormProps) {
	const [name, setName] = useState('')
	const [cost, setCost] = useState('')
	const [description, setDescription] = useState('')
	const [pricingFixed, setPricingFixed] = useState(false)
	const [unitName, setUnitName] = useState('')
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
		if (!pricingFixed && !unitName.trim()) {
			setError('Укажите единицу измерения')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const dto: AdditionalServiceDto = {
				serviceName: name,
				cost: Number(cost),
				pricingFixed,
				serviceDescription: description || undefined,
				unitName: !pricingFixed ? unitName.trim() : undefined,
			}
			const created = await createAdditionalService(initData, dto)
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
						Название
					</label>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						style={inputStyle}
					/>
				</div>
				<div>
					<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
						Стоимость (₽)
					</label>
					<input
						type='number'
						value={cost}
						onChange={e => setCost(e.target.value)}
						style={inputStyle}
					/>
				</div>
				<div>
					<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
						Описание
					</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
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
								checked={pricingFixed}
								onChange={() => setPricingFixed(true)}
							/>
							Фиксированная
						</label>
						<label
							className='flex items-center gap-2 cursor-pointer'
							style={{ color: 'rgba(255,255,255,0.90)', fontSize: '0.875rem' }}
						>
							<input
								type='radio'
								checked={!pricingFixed}
								onChange={() => setPricingFixed(false)}
							/>
							За единицу
						</label>
					</div>
				</div>
				{!pricingFixed && (
					<div>
						<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.80)' }}>
							Единица измерения *
						</label>
						<input
							type='text'
							value={unitName}
							onChange={e => setUnitName(e.target.value)}
							placeholder='например: кг'
							style={inputStyle}
						/>
					</div>
				)}
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
