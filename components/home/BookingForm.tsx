'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { createReservation } from '@/lib/api/services'
import type { ServiceType } from '@/types/api'
import { useState } from 'react'

interface BookingFormProps {
	service: ServiceType
	selectedDate: string
	selectedSlot: string
	onBack: () => void
	onGoHome: () => void
}

interface FormFields {
	name: string
	phone: string
	city: string
	street: string
	building: string
	entrance: string
	intercom: string
	apartment: string
	floor: string
	comment: string
}

interface FieldErrors {
	name?: string
	phone?: string
	city?: string
	street?: string
	building?: string
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

const errorStyle: React.CSSProperties = {
	color: '#ff5f5f',
	fontSize: '12px',
	marginTop: '4px',
}

export function BookingForm({
	service,
	selectedDate,
	selectedSlot,
	onBack,
	onGoHome,
}: BookingFormProps) {
	const { initData } = useTelegram()
	const [fields, setFields] = useState<FormFields>({
		name: '',
		phone: '',
		city: '',
		street: '',
		building: '',
		entrance: '',
		intercom: '',
		apartment: '',
		floor: '',
		comment: '',
	})
	const [errors, setErrors] = useState<FieldErrors>({})
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submitSuccess, setSubmitSuccess] = useState(false)

	function setField(key: keyof FormFields, value: string) {
		setFields(prev => ({ ...prev, [key]: value }))
	}

	function validate(): boolean {
		const errs: FieldErrors = {}
		if (!fields.name.trim()) errs.name = 'Обязательное поле'
		if (!fields.phone.trim()) {
			errs.phone = 'Обязательное поле'
		} else if (!/^\+?[78]\d{10}$/.test(fields.phone.replace(/[\s\-()]/g, ''))) {
			errs.phone = 'Введите корректный номер телефона'
		}
		if (!fields.city.trim()) errs.city = 'Обязательное поле'
		if (!fields.street.trim()) errs.street = 'Обязательное поле'
		if (!fields.building.trim()) errs.building = 'Обязательное поле'
		setErrors(errs)
		return Object.keys(errs).length === 0
	}

	async function handleSubmit() {
		if (!validate()) return
		setSubmitting(true)
		setSubmitError(null)
		try {
			const start = `${selectedDate}T${selectedSlot.replace(/:\d{2}$/, ':00')}`
			const clientAddress = [
				fields.city,
				fields.street,
				fields.building && `д. ${fields.building}`,
				fields.entrance && `подъезд ${fields.entrance}`,
				fields.intercom && `домофон ${fields.intercom}`,
				fields.apartment && `кв. ${fields.apartment}`,
				fields.floor && `этаж ${fields.floor}`,
			]
				.filter(Boolean)
				.join(', ')

			await createReservation(initData, {
				start,
				serviceId: service.id,
				clientName: fields.name,
				clientPhoneNumber: fields.phone,
				clientAddress,
			})
			setSubmitSuccess(true)
		} catch (err) {
			const msg =
				(err as { message?: string })?.message ?? 'Ошибка при отправке'
			setSubmitError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	if (submitSuccess) {
		return (
			<div className='flex flex-col items-center justify-center gap-6 p-8 text-center min-h-[60vh]'>
				<div className='text-4xl'>✓</div>
				<p className='text-white text-lg font-semibold'>Заявка отправлена!</p>
				<p className='text-white/85 text-sm'>
					Мы свяжемся с вами для подтверждения
				</p>
				<button
					onClick={onGoHome}
					className='px-8 py-3 rounded-2xl font-semibold text-black cursor-pointer'
					style={{ background: '#f5c518' }}
				>
					На главную
				</button>
			</div>
		)
	}

	return (
		<div className='flex flex-col gap-4 p-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]'>
			<p className='text-white/90 text-sm mt-6'>Контактная информация</p>

			<div>
				<input
					type='text'
					placeholder='Имя *'
					value={fields.name}
					onChange={e => setField('name', e.target.value)}
					style={inputStyle}
				/>
				{errors.name && <p style={errorStyle}>{errors.name}</p>}
			</div>

			<div>
				<input
					type='tel'
					placeholder='Телефон *'
					value={fields.phone}
					onChange={e => setField('phone', e.target.value)}
					style={inputStyle}
				/>
				{errors.phone && <p style={errorStyle}>{errors.phone}</p>}
			</div>

			<p className='text-white/90 text-sm mt-2'>Адрес</p>

			<div>
				<input
					type='text'
					placeholder='Город *'
					value={fields.city}
					onChange={e => setField('city', e.target.value)}
					style={inputStyle}
				/>
				{errors.city && <p style={errorStyle}>{errors.city}</p>}
			</div>

			<div>
				<input
					type='text'
					placeholder='Улица *'
					value={fields.street}
					onChange={e => setField('street', e.target.value)}
					style={inputStyle}
				/>
				{errors.street && <p style={errorStyle}>{errors.street}</p>}
			</div>

			<div>
				<input
					type='text'
					placeholder='Дом *'
					value={fields.building}
					onChange={e => setField('building', e.target.value)}
					style={inputStyle}
				/>
				{errors.building && <p style={errorStyle}>{errors.building}</p>}
			</div>

			<div className='grid grid-cols-2 gap-2'>
				<input
					type='text'
					placeholder='Подъезд'
					value={fields.entrance}
					onChange={e => setField('entrance', e.target.value)}
					style={inputStyle}
				/>
				<input
					type='text'
					placeholder='Домофон'
					value={fields.intercom}
					onChange={e => setField('intercom', e.target.value)}
					style={inputStyle}
				/>
			</div>

			<div className='grid grid-cols-2 gap-2'>
				<input
					type='text'
					placeholder='Кв./Офис'
					value={fields.apartment}
					onChange={e => setField('apartment', e.target.value)}
					style={inputStyle}
				/>
				<input
					type='text'
					placeholder='Этаж'
					value={fields.floor}
					onChange={e => setField('floor', e.target.value)}
					style={inputStyle}
				/>
			</div>

			<textarea
				placeholder='Комментарий'
				value={fields.comment}
				onChange={e => setField('comment', e.target.value)}
				rows={3}
				style={{ ...inputStyle, resize: 'none' }}
			/>

			{submitError && (
				<p style={{ ...errorStyle, fontSize: '14px', textAlign: 'center' }}>
					{submitError}
				</p>
			)}

			{/* Fixed bottom buttons */}
			<div
				className='fixed bottom-6 left-0 right-0 flex gap-2 p-2'
				style={{
					paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
				}}
			>
				<button
					onClick={onBack}
					className='flex-1 py-4 rounded-3xl font-semibold text-white cursor-pointer transition-opacity duration-150 hover:opacity-80'
					style={{
						background: 'rgba(15,25,65,0.85)',
						backdropFilter: 'blur(12px)',
						WebkitBackdropFilter: 'blur(12px)',
					}}
				>
					Назад
				</button>
				<button
					onClick={handleSubmit}
					disabled={submitting}
					className='flex-[2] py-4 rounded-3xl font-semibold text-black cursor-pointer transition-opacity duration-150 hover:opacity-80 disabled:opacity-50'
					style={{ background: '#f5c518' }}
				>
					{submitting ? 'Отправка...' : 'Отправить'}
				</button>
			</div>
		</div>
	)
}
