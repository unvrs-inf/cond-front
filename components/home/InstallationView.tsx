'use client'

import { createInstallationRequest } from '@/lib/api/services'
import type { InstallationDto } from '@/types/api'
import { useState } from 'react'

interface InstallationViewProps {
	installation: InstallationDto
	initData: string
	onBack: () => void
}

const inputStyle: React.CSSProperties = {
	background: 'rgba(15,25,65,0.85)',
	backdropFilter: 'blur(12px)',
	WebkitBackdropFilter: 'blur(12px)',
	border: '1px solid rgba(150,185,255,0.22)',
	borderRadius: '12px',
	color: '#fff',
	padding: '10px 14px',
	width: '100%',
	outline: 'none',
	fontSize: '14px',
}

export function InstallationView({ installation, initData, onBack }: InstallationViewProps) {
	const [showForm, setShowForm] = useState(false)
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [nameError, setNameError] = useState('')
	const [phoneError, setPhoneError] = useState('')
	const [loading, setLoading] = useState(false)
	const [submitError, setSubmitError] = useState('')
	const [success, setSuccess] = useState(false)

	function validate(): boolean {
		let valid = true
		setNameError('')
		setPhoneError('')

		if (!name.trim()) {
			setNameError('Введите ваше имя')
			valid = false
		}

		const cleanedPhone = phone.replace(/[\s\-()]/g, '')
		if (!cleanedPhone) {
			setPhoneError('Введите номер телефона')
			valid = false
		} else if (!/^\+?[78]\d{10}$/.test(cleanedPhone)) {
			setPhoneError('Введите корректный номер телефона')
			valid = false
		}

		return valid
	}

	async function handleSubmit() {
		if (!validate()) return
		setLoading(true)
		setSubmitError('')
		try {
			await createInstallationRequest(initData, {
				name: name.trim(),
				clientPhoneNumber: phone.replace(/[\s\-()]/g, ''),
			})
			setSuccess(true)
		} catch {
			setSubmitError('Ошибка при отправке заявки. Попробуйте ещё раз.')
		} finally {
			setLoading(false)
		}
	}

	if (success) {
		return (
			<div className='px-4 py-8 flex flex-col items-center text-center'>
				<div
					className='w-full rounded-3xl p-8 flex flex-col items-center'
					style={{
						background: 'rgba(5,15,50,0.55)',
						backdropFilter: 'blur(12px)',
						WebkitBackdropFilter: 'blur(12px)',
					}}
				>
					<p className='text-2xl mb-3' style={{ color: '#f5c518' }}>✓</p>
					<h2 className='text-white text-xl font-semibold mb-2'>Заявка отправлена</h2>
					<p className='text-sm mb-6' style={{ color: 'rgba(255,255,255,0.70)' }}>
						Мы свяжемся с вами в ближайшее время
					</p>
					<button
						onClick={onBack}
						className='w-full py-3 rounded-2xl text-base font-medium'
						style={{ background: '#f5c518', color: '#1a1a1a' }}
					>
						На главную
					</button>
				</div>
			</div>
		)
	}

	if (showForm) {
		return (
			<div className='px-4 py-6'>
				<div
					className='w-full rounded-3xl p-6'
					style={{
						background: 'rgba(5,15,50,0.55)',
						backdropFilter: 'blur(12px)',
						WebkitBackdropFilter: 'blur(12px)',
					}}
				>
					<h2 className='text-white text-xl font-semibold mb-6'>Оставить заявку</h2>

					<div className='mb-4'>
						<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.70)' }}>
							Ваше имя
						</label>
						<input
							type='text'
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder='Иван Иванов'
							style={inputStyle}
						/>
						{nameError && (
							<p className='text-sm mt-1' style={{ color: '#ff5f5f' }}>{nameError}</p>
						)}
					</div>

					<div className='mb-6'>
						<label className='block text-sm mb-1' style={{ color: 'rgba(255,255,255,0.70)' }}>
							Номер телефона
						</label>
						<input
							type='tel'
							value={phone}
							onChange={e => setPhone(e.target.value)}
							placeholder='+7 (900) 000-00-00'
							style={inputStyle}
						/>
						{phoneError && (
							<p className='text-sm mt-1' style={{ color: '#ff5f5f' }}>{phoneError}</p>
						)}
					</div>

					{submitError && (
						<p className='text-sm mb-4' style={{ color: '#ff5f5f' }}>{submitError}</p>
					)}

					<div className='flex gap-3'>
						<button
							onClick={() => setShowForm(false)}
							disabled={loading}
							className='flex-1 py-3 rounded-2xl text-base font-medium disabled:opacity-50'
							style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }}
						>
							Назад
						</button>
						<button
							onClick={handleSubmit}
							disabled={loading}
							className='flex-1 py-3 rounded-2xl text-base font-medium disabled:opacity-50'
							style={{ background: '#f5c518', color: '#1a1a1a' }}
						>
							{loading ? '...' : 'Отправить'}
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='px-4 py-6'>
			<div
				className='w-full rounded-3xl p-6'
				style={{
					background: 'rgba(5,15,50,0.55)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				<h2 className='text-white text-xl font-semibold mb-4'>{installation.name}</h2>
				<p className='text-sm mb-8 leading-relaxed' style={{ color: 'rgba(255,255,255,0.85)' }}>
					{installation.description}
				</p>

				<div className='flex gap-3'>
					<button
						onClick={onBack}
						className='flex-1 py-3 rounded-2xl text-base font-medium'
						style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }}
					>
						Назад
					</button>
					<button
						onClick={() => setShowForm(true)}
						className='flex-1 py-3 rounded-2xl text-base font-medium'
						style={{ background: '#f5c518', color: '#1a1a1a' }}
					>
						Оставить заявку
					</button>
				</div>
			</div>
		</div>
	)
}
