'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { createReservation } from '@/lib/api/services'
import type { ServiceType } from '@/types/api'
import {
	Map,
	Placemark,
	Polygon,
	useYMaps,
	YMaps,
} from '@pbe/react-yandex-maps'
import { useCallback, useRef, useState } from 'react'

// Zone polygon coordinates [lat, lon] — Yandex Maps format
const ZONE_COORDS: [number, number][] = [
	[55.83996141709363, 48.45761835360668],
	[55.82531552542909, 48.67518189764968],
	[55.73748498042476, 48.73622476839914],
	[55.75428470154227, 48.805575964688344],
	[55.72770197030144, 48.982644675015685],
	[55.59057834084206, 49.02727663302386],
	[55.59417513329668, 49.31026041293116],
	[55.70531771030859, 49.38390314364466],
	[55.94226366222796, 49.329572317839165],
	[55.94351604099767, 49.13559496188243],
	[55.89527009773298, 48.546753523589345],
	[55.83996141709363, 48.45761835360668],
]

// Bounding box: SW [lat, lon], NE [lat, lon]
const ZONE_BOUNDS: [[number, number], [number, number]] = [
	[55.59, 48.45],
	[55.95, 49.39],
]

interface BookingFormProps {
	service: ServiceType
	selectedDate: string
	selectedSlot: string
	onBack: () => void
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
	address?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ymaps = any

function pointInPolygon(
	point: [number, number],
	polygon: [number, number][],
): boolean {
	const [px, py] = point
	let inside = false
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [xi, yi] = polygon[i]
		const [xj, yj] = polygon[j]
		const intersect =
			yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
		if (intersect) inside = !inside
	}
	return inside
}

const inputStyle: React.CSSProperties = {
	background: 'rgba(255,255,255,0.10)',
	backdropFilter: 'blur(12px)',
	WebkitBackdropFilter: 'blur(12px)',
	border: '1px solid rgba(255,255,255,0.18)',
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

// Inner component that runs inside <YMaps> context and has access to useYMaps
interface MapSectionProps {
	fields: FormFields
	placemark: [number, number] | null
	errors: FieldErrors
	onAddressResolved: (
		city: string,
		street: string,
		building: string,
		coords: [number, number],
	) => void
	onAddressError: (msg: string) => void
	onFieldChange: (key: 'city' | 'street', value: string) => void
}

function MapSection({
	fields,
	placemark,
	errors,
	onAddressResolved,
	onAddressError,
	onFieldChange,
}: MapSectionProps) {
	const ymaps: Ymaps = useYMaps(['geocode'])
	const [searchValue, setSearchValue] = useState('')
	const [searchResults, setSearchResults] = useState<
		{ display: string; coords: [number, number]; geoObj: any }[]
	>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
	const [showResults, setShowResults] = useState(false)
	const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const resolveAddress = useCallback(
		async (coords: [number, number]) => {
			if (!ymaps) return
			try {
				const res = await ymaps.geocode(coords, { results: 1 })
				const geoObj = res.geoObjects.get(0)
				if (!geoObj) {
					onAddressError('Адрес не найден')
					return
				}
				if (!pointInPolygon(coords, ZONE_COORDS)) {
					onAddressError('Адрес вне зоны доставки')
					return
				}
				const city =
					geoObj.getLocalities()?.[0] ??
					geoObj.getAdministrativeAreas()?.[0] ??
					''
				const street = geoObj.getThoroughfare() ?? ''
				const building = geoObj.getPremiseNumber() ?? ''
				onAddressResolved(city, street, building, coords)
			} catch {
				onAddressError('Ошибка геокодирования')
			}
		},
		[ymaps, onAddressResolved, onAddressError],
	)

	function handleSearchChange(value: string) {
		setSearchValue(value)
		if (searchTimeout.current) clearTimeout(searchTimeout.current)
		if (!value.trim() || !ymaps) {
			setSearchResults([])
			setShowResults(false)
			return
		}
		searchTimeout.current = setTimeout(async () => {
			try {
				const res = await ymaps.geocode(value, {
					results: 5,
					boundedBy: ZONE_BOUNDS,
				})
				const count = res.geoObjects.getLength()
				const items: {
					display: string
					coords: [number, number]
					geoObj: any
				}[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
				for (let i = 0; i < count; i++) {
					const obj = res.geoObjects.get(i)
					const coords: [number, number] | null =
						obj.geometry?.getCoordinates?.() ?? null
					if (!coords) continue
					items.push({ display: obj.getAddressLine(), coords, geoObj: obj })
				}
				setSearchResults(items)
				setShowResults(true)
			} catch {
				setSearchResults([])
			}
		}, 300)
	}

	function handleResultSelect(item: {
		display: string
		coords: [number, number]
		geoObj: any
	}) {
		// eslint-disable-line @typescript-eslint/no-explicit-any
		setSearchValue(item.display)
		setShowResults(false)
		setSearchResults([])
		if (!pointInPolygon(item.coords, ZONE_COORDS)) {
			onAddressError('Адрес вне зоны обслуживания')
			return
		}
		const city =
			item.geoObj.getLocalities()?.[0] ??
			item.geoObj.getAdministrativeAreas()?.[0] ??
			''
		const street = item.geoObj.getThoroughfare() ?? ''
		const building = item.geoObj.getPremiseNumber() ?? ''
		onAddressResolved(city, street, building, item.coords)
	}

	function handleMapClick(e: Ymaps) {
		const coords: [number, number] = e.get('coords')
		resolveAddress(coords)
	}

	return (
		<div>
			<div style={{ position: 'relative', zIndex: 10, marginBottom: '8px' }}>
				<input
					type='text'
					placeholder='Поиск адреса...'
					value={searchValue}
					onChange={e => handleSearchChange(e.target.value)}
					onBlur={() => setShowResults(false)}
					style={inputStyle}
					autoComplete='off'
				/>
				{errors.address && <p style={errorStyle}>{errors.address}</p>}
				{showResults && searchResults.length > 0 && (
					<div
						onMouseDown={e => e.preventDefault()}
						style={{
							position: 'absolute',
							top: '100%',
							left: 0,
							right: 0,
							background: 'rgba(20,20,35,0.97)',
							backdropFilter: 'blur(12px)',
							WebkitBackdropFilter: 'blur(12px)',
							border: '1px solid rgba(255,255,255,0.15)',
							borderRadius: '12px',
							marginTop: '4px',
							overflow: 'hidden',
							zIndex: 20,
						}}
					>
						{searchResults.map((item, i) => (
							<div
								key={i}
								onMouseDown={() => handleResultSelect(item)}
								style={{
									padding: '10px 14px',
									color: '#fff',
									fontSize: '14px',
									cursor: 'pointer',
									borderBottom:
										i < searchResults.length - 1
											? '1px solid rgba(255,255,255,0.08)'
											: 'none',
								}}
								onMouseEnter={e =>
									(e.currentTarget.style.background = 'rgba(255,255,255,0.08)')
								}
								onMouseLeave={e =>
									(e.currentTarget.style.background = 'transparent')
								}
							>
								{item.display}
							</div>
						))}
					</div>
				)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-2'>
				<input
					type='text'
					placeholder='Город'
					value={fields.city}
					onChange={e => onFieldChange('city', e.target.value)}
					style={inputStyle}
				/>
				<input
					type='text'
					placeholder='Улица'
					value={fields.street}
					onChange={e => onFieldChange('street', e.target.value)}
					style={inputStyle}
				/>
			</div>

			<Map
				defaultState={{ center: [55.796127, 49.106414], zoom: 10 }}
				style={{
					width: '100%',
					height: '260px',
					borderRadius: '16px',
					overflow: 'hidden',
				}}
				onClick={handleMapClick}
			>
				<Polygon geometry={[ZONE_COORDS]} options={{ visible: false }} />
				{placemark && <Placemark geometry={placemark} />}
			</Map>
		</div>
	)
}

export function BookingForm({
	service,
	selectedDate,
	selectedSlot,
	onBack,
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
	const [placemark, setPlacemark] = useState<[number, number] | null>(null)
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submitSuccess, setSubmitSuccess] = useState(false)

	function setField(key: keyof FormFields, value: string) {
		setFields(prev => ({ ...prev, [key]: value }))
	}

	const handleAddressResolved = useCallback(
		(
			city: string,
			street: string,
			building: string,
			coords: [number, number],
		) => {
			setFields(prev => ({ ...prev, city, street, building }))
			setPlacemark(coords)
			setErrors(prev => ({
				...prev,
				address: undefined,
				city: undefined,
				street: undefined,
			}))
		},
		[],
	)

	const handleAddressError = useCallback((msg: string) => {
		setErrors(prev => ({ ...prev, address: msg }))
		setFields(prev => ({ ...prev, city: '', street: '', building: '' }))
		setPlacemark(null)
	}, [])

	function validate(): boolean {
		const errs: FieldErrors = {}
		if (!fields.name.trim()) errs.name = 'Обязательное поле'
		if (!fields.phone.trim()) errs.phone = 'Обязательное поле'
		if (!fields.city.trim()) errs.city = 'Выберите адрес на карте'
		if (!fields.street.trim()) errs.street = 'Выберите адрес на карте'
		if (!fields.building.trim()) errs.building = 'Укажите номер дома'
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
				<p className='text-white/60 text-sm'>
					Мы свяжемся с вами для подтверждения
				</p>
				<button
					onClick={onBack}
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
			<p className='text-white/70 text-sm mt-6'>Контактная информация</p>

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

			<p className='text-white/70 text-sm mt-2'>Адрес</p>

			<YMaps
				query={{
					apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
					load: 'package.full',
				}}
			>
				<MapSection
					fields={fields}
					placemark={placemark}
					errors={errors}
					onAddressResolved={handleAddressResolved}
					onAddressError={handleAddressError}
					onFieldChange={(key, value) => setField(key, value)}
				/>
			</YMaps>

			{/* Building number (may need manual edit) */}
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
			{errors.city && !errors.building && (
				<p style={errorStyle}>{errors.city}</p>
			)}
			{errors.street && !errors.building && (
				<p style={errorStyle}>{errors.street}</p>
			)}

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
					// background: 'rgba(15,15,25,0.7)',
					// backdropFilter: 'blur(16px)',
					// WebkitBackdropFilter: 'blur(16px)',
				}}
			>
				<button
					onClick={onBack}
					className='flex-1 py-4 rounded-3xl font-semibold text-white cursor-pointer transition-opacity duration-150 hover:opacity-80'
					style={{
						background: 'rgba(30,30,46,0.85)',
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
