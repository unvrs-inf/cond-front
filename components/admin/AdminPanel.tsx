'use client'

import { useTelegram } from '@/components/providers/TelegramProvider'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
	cancelReservation,
	completeReservation,
	confirmReservation,
	createSchedule,
	createServiceType,
	deleteSchedule,
	getActiveReservations,
	getAdminServiceTypes,
	getCancelledReservations,
	getCompletedReservations,
	getCreatedReservations,
	getSchedules,
	hideServiceType,
	showServiceType,
	updateSchedule,
	updateServiceType,
} from '@/lib/api/services'
import { translateStatus } from '@/lib/utils/reservationStatus'
import type {
	AdminReservation,
	AdminReservationsResponse,
	CreateScheduleDto,
	Schedule,
	ServiceType,
	TypeOfServiceDto,
} from '@/types/api'
import { useCallback, useEffect, useRef, useState } from 'react'

type Tab =
	| 'active'
	| 'created'
	| 'cancelled'
	| 'completed'
	| 'schedules'
	| 'services'

const TABS: { id: Tab; label: string }[] = [
	{ id: 'active', label: 'Активные' },
	{ id: 'created', label: 'Созданные' },
	{ id: 'cancelled', label: 'Отменённые' },
	{ id: 'completed', label: 'Выполненные' },
	{ id: 'schedules', label: 'Расписание' },
	{ id: 'services', label: 'Типы услуг' },
]

function formatDateTime(dt: string): string {
	const date = new Date(dt)
	return date.toLocaleString('ru-RU', {
		weekday: 'short',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

function formatScheduleDate(dateStr: string): string {
	const [year, month, day] = dateStr.split('-').map(Number)
	const date = new Date(year, month - 1, day)
	return date.toLocaleDateString('ru-RU', {
		weekday: 'short',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

interface ReservationCardProps {
	reservation: AdminReservation
	tab: Tab
	initData: string
	onUpdate: (updated: AdminReservation) => void
	onRemove: (id: number) => void
}

function ReservationCard({
	reservation,
	tab,
	initData,
	onUpdate,
	onRemove,
}: ReservationCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [copiedPhone, setCopiedPhone] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	)

	async function handleAction(action: 'complete' | 'cancel' | 'confirm') {
		setLoading(true)
		setError(null)
		try {
			let updated: AdminReservation
			if (action === 'complete')
				updated = await completeReservation(initData, reservation.id)
			else if (action === 'confirm')
				updated = await confirmReservation(initData, reservation.id)
			else updated = await cancelReservation(initData, reservation.id)

			if (tab === 'active' && action === 'confirm') {
				onUpdate(updated)
			} else {
				onRemove(updated.id)
			}
		} catch {
			setError('Ошибка при выполнении действия')
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
			<div className='flex flex-col items-start gap-2 justify-between mb-2'>
				<span
					className='text-base text-nowrap font-semibold'
					style={{ color: '#f5c518' }}
				>
					#{reservation.id} — {reservation.typeOfService.serviceName}
				</span>
				<span
					className='text-xs text-nowrap px-2.5 py-0.5 rounded-full'
					style={{ background: 'rgba(245,197,24,0.2)', color: '#f5c518' }}
				>
					{translateStatus(reservation.status)}
				</span>
			</div>

			<div
				className='text-sm space-y-2 mb-4'
				style={{ color: 'rgba(255,255,255,0.90)' }}
			>
				<div>Начало: {formatDateTime(reservation.startDateTime)}</div>
				<div>Конец: {formatDateTime(reservation.endDateTime)}</div>
				<div>
					Стоимость: {reservation.typeOfService.cost.toLocaleString('ru-RU')} ₽
				</div>
				<div>
					Клиент: @{reservation.client.username} (ID: {reservation.client.id})
				</div>
				<div>
					Telegram:{' '}
					{reservation.client.tgUsername ? (
						<a
							href={`https://t.me/${reservation.client.tgUsername}`}
							target='_blank'
							rel='noreferrer'
							style={{ color: '#f5c518', textDecoration: 'underline' }}
						>
							@{reservation.client.tgUsername}
						</a>
					) : (
						<span style={{ color: 'rgba(255,255,255,0.50)' }}>не указан</span>
					)}
				</div>
				<div>
					Телефон:{' '}
					<a
						href={`tel:${reservation.clientPhoneNumber}`}
						onClick={e => {
							if (window.Telegram?.WebApp) {
								e.preventDefault()
								navigator.clipboard
									.writeText(reservation.clientPhoneNumber)
									.then(() => {
										setCopiedPhone(true)
										clearTimeout(copiedTimerRef.current)
										copiedTimerRef.current = setTimeout(
											() => setCopiedPhone(false),
											2000,
										)
									})
							}
						}}
						style={{ color: '#f5c518', textDecoration: 'underline' }}
					>
						{reservation.clientPhoneNumber}
					</a>
					{copiedPhone && (
						<span
							style={{
								color: 'rgba(255,255,255,0.80)',
								marginLeft: 6,
								fontSize: '0.75rem',
							}}
						>
							✓ Скопировано
						</span>
					)}
				</div>
				<div>
					Адрес:{' '}
					<a
						href={`https://yandex.ru/maps/?text=${encodeURIComponent(reservation.clientAddress)}`}
						target='_blank'
						rel='noreferrer'
						style={{ color: '#f5c518', textDecoration: 'underline' }}
					>
						{reservation.clientAddress}
					</a>
				</div>
			</div>

			{error && <p className='text-sm text-red-400 mb-2'>{error}</p>}

			{(tab === 'active' || tab === 'created') && (
				<div className='flex gap-2'>
					{tab === 'active' && (
						<button
							onClick={() => handleAction('complete')}
							disabled={loading}
							className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
							style={{ background: '#f5c518', color: '#1a1a1a' }}
						>
							{loading ? '...' : 'Выполнить'}
						</button>
					)}
					{(tab === 'created' ||
						(tab === 'active' && reservation.status === 'CREATED')) && (
						<button
							onClick={() => handleAction('confirm')}
							disabled={loading}
							className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
							style={{ background: '#f5c518', color: '#1a1a1a' }}
						>
							{loading ? '...' : 'Подтвердить'}
						</button>
					)}
					<button
						onClick={() => setConfirmOpen(true)}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{
							background: 'rgba(255,255,255,0.12)',
							color: 'rgba(255,255,255,0.95)',
						}}
					>
						{loading ? '...' : 'Отменить'}
					</button>
				</div>
			)}
			{confirmOpen && (
				<ConfirmDialog
					message='Вы точно хотите отменить заявку?'
					onConfirm={() => {
						setConfirmOpen(false)
						handleAction('cancel')
					}}
					onCancel={() => setConfirmOpen(false)}
				/>
			)}
		</div>
	)
}

interface ScheduleCardProps {
	schedule: Schedule
	initData: string
	onRemove: (id: number) => void
	onUpdate: (updated: Schedule) => void
}

function ScheduleCard({
	schedule,
	initData,
	onRemove,
	onUpdate,
}: ScheduleCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [editDate, setEditDate] = useState(schedule.date)
	const [editBeginning, setEditBeginning] = useState(
		schedule.workBeginning.slice(0, 5),
	)
	const [editEnding, setEditEnding] = useState(schedule.workEnding.slice(0, 5))

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

	async function handleDelete() {
		setLoading(true)
		setError(null)
		try {
			await deleteSchedule(initData, schedule.id)
			onRemove(schedule.id)
		} catch {
			setError('Ошибка при удалении')
			setLoading(false)
		}
	}

	async function handleSave() {
		setLoading(true)
		setError(null)
		try {
			const updated = await updateSchedule(initData, schedule.id, {
				date: editDate,
				workBeginning: editBeginning,
				workEnding: editEnding,
			})
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
			<div className='flex items-center justify-between mb-1'>
				<span className='text-base font-semibold' style={{ color: '#f5c518' }}>
					{editing ? editDate : formatScheduleDate(schedule.date)}
				</span>
				<span className='text-sm' style={{ color: 'rgba(255,255,255,0.80)' }}>
					#{schedule.id}
				</span>
			</div>
			{editing ? (
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
							value={editDate}
							onChange={e => setEditDate(e.target.value)}
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
							value={editBeginning}
							onChange={e => setEditBeginning(e.target.value)}
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
							value={editEnding}
							onChange={e => setEditEnding(e.target.value)}
							style={inputStyle}
						/>
					</div>
				</div>
			) : (
				<div
					className='text-sm mb-3'
					style={{ color: 'rgba(255,255,255,0.90)' }}
				>
					{schedule.workBeginning.slice(0, 5)} —{' '}
					{schedule.workEnding.slice(0, 5)}
				</div>
			)}
			{confirmOpen && (
				<ConfirmDialog
					message='Вы точно хотите удалить расписание?'
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
						onClick={() => setConfirmOpen(true)}
						disabled={loading}
						className='flex-1 py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
						style={{
							background: 'rgba(255,255,255,0.12)',
							color: 'rgba(255,255,255,0.95)',
						}}
					>
						{loading ? '...' : 'Удалить'}
					</button>
				</div>
			)}
		</div>
	)
}

interface AddScheduleFormProps {
	initData: string
	onAdd: (schedule: Schedule) => void
	onCancel: () => void
}

function AddScheduleForm({ initData, onAdd, onCancel }: AddScheduleFormProps) {
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

interface ServiceTypeCardProps {
	serviceType: ServiceType
	initData: string
	onUpdate: (updated: ServiceType) => void
}

function ServiceTypeCard({
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

interface AddServiceTypeFormProps {
	initData: string
	onAdd: (serviceType: ServiceType) => void
	onCancel: () => void
}

function AddServiceTypeForm({
	initData,
	onAdd,
	onCancel,
}: AddServiceTypeFormProps) {
	const [name, setName] = useState('')
	const [cost, setCost] = useState('')
	const [duration, setDuration] = useState('')
	const [description, setDescription] = useState('')
	const [priceFixed, setPriceFixed] = useState(true)
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
		if (!priceFixed && !unitName.trim()) {
			setError('Укажите единицу измерения для нефиксированной цены')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const dto: TypeOfServiceDto = {
				serviceName: name,
				cost: Number(cost),
				priceFixed,
				durationOfWork: Number(duration),
				serviceDescription: description || undefined,
				unitName: priceFixed ? undefined : unitName.trim(),
			}
			const created = await createServiceType(initData, dto)
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
					<label
						className='block text-sm mb-1'
						style={{ color: 'rgba(255,255,255,0.80)' }}
					>
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
					<label
						className='block text-sm mb-1'
						style={{ color: 'rgba(255,255,255,0.80)' }}
					>
						Длительность (мин)
					</label>
					<input
						type='number'
						value={duration}
						onChange={e => setDuration(e.target.value)}
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
						value={description}
						onChange={e => setDescription(e.target.value)}
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
							style={{ color: 'rgba(255,255,255,0.90)', fontSize: '0.875rem' }}
						>
							<input
								type='radio'
								checked={priceFixed}
								onChange={() => setPriceFixed(true)}
							/>
							Фиксированная
						</label>
						<label
							className='flex items-center gap-2 cursor-pointer'
							style={{ color: 'rgba(255,255,255,0.90)', fontSize: '0.875rem' }}
						>
							<input
								type='radio'
								checked={!priceFixed}
								onChange={() => setPriceFixed(false)}
							/>
							За единицу
						</label>
					</div>
				</div>
				{!priceFixed && (
					<div>
						<label
							className='block text-sm mb-1'
							style={{ color: 'rgba(255,255,255,0.80)' }}
						>
							Единица измерения *
						</label>
						<input
							type='text'
							value={unitName}
							onChange={e => setUnitName(e.target.value)}
							placeholder='например: 100 грамм'
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

interface AdminPanelProps {
	onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
	const { initData, isReady } = useTelegram()
	const [activeTab, setActiveTab] = useState<Tab>('active')
	const [reservations, setReservations] = useState<AdminReservation[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [schedules, setSchedules] = useState<Schedule[]>([])
	const [schedulesLoading, setSchedulesLoading] = useState(false)
	const [schedulesError, setSchedulesError] = useState<string | null>(null)
	const [showAddForm, setShowAddForm] = useState(false)

	const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
	const [serviceTypesLoading, setServiceTypesLoading] = useState(false)
	const [serviceTypesError, setServiceTypesError] = useState<string | null>(
		null,
	)
	const [showAddServiceForm, setShowAddServiceForm] = useState(false)

	const fetchReservations = useCallback(async () => {
		if (!isReady || activeTab === 'schedules' || activeTab === 'services')
			return
		setLoading(true)
		setError(null)
		setReservations([])
		try {
			let response: AdminReservationsResponse
			if (activeTab === 'active')
				response = await getActiveReservations(initData)
			else if (activeTab === 'created')
				response = await getCreatedReservations(initData)
			else if (activeTab === 'cancelled')
				response = await getCancelledReservations(initData)
			else response = await getCompletedReservations(initData)
			setReservations(response.content)
		} catch {
			setError('Не удалось загрузить данные')
		} finally {
			setLoading(false)
		}
	}, [activeTab, initData, isReady])

	const fetchSchedules = useCallback(async () => {
		if (!isReady || activeTab !== 'schedules') return
		setSchedulesLoading(true)
		setSchedulesError(null)
		try {
			const response = await getSchedules(initData)
			setSchedules(response.content)
		} catch {
			setSchedulesError('Не удалось загрузить расписание')
		} finally {
			setSchedulesLoading(false)
		}
	}, [activeTab, initData, isReady])

	const fetchServiceTypes = useCallback(async () => {
		if (!isReady || activeTab !== 'services') return
		setServiceTypesLoading(true)
		setServiceTypesError(null)
		try {
			const first = await getAdminServiceTypes(initData, 0)
			const all = [...first.content]
			for (let p = 1; p < first.page.totalPages; p++) {
				const page = await getAdminServiceTypes(initData, p)
				all.push(...page.content)
			}
			setServiceTypes(all)
		} catch {
			setServiceTypesError('Не удалось загрузить типы услуг')
		} finally {
			setServiceTypesLoading(false)
		}
	}, [activeTab, initData, isReady])

	useEffect(() => {
		fetchReservations()
	}, [fetchReservations])

	useEffect(() => {
		fetchSchedules()
	}, [fetchSchedules])

	useEffect(() => {
		fetchServiceTypes()
	}, [fetchServiceTypes])

	function handleUpdate(updated: AdminReservation) {
		setReservations(prev => prev.map(r => (r.id === updated.id ? updated : r)))
	}

	function handleRemove(id: number) {
		setReservations(prev => prev.filter(r => r.id !== id))
	}

	function handleScheduleRemove(id: number) {
		setSchedules(prev => prev.filter(s => s.id !== id))
	}

	function handleScheduleAdd(schedule: Schedule) {
		setSchedules(prev => [...prev, schedule])
		setShowAddForm(false)
	}

	function handleScheduleUpdate(updated: Schedule) {
		setSchedules(prev => prev.map(s => (s.id === updated.id ? updated : s)))
	}

	function handleServiceTypeAdd(serviceType: ServiceType) {
		setServiceTypes(prev => [...prev, serviceType])
		setShowAddServiceForm(false)
	}

	function handleServiceTypeUpdate(updated: ServiceType) {
		setServiceTypes(prev => prev.map(s => (s.id === updated.id ? updated : s)))
	}

	return (
		<div
			className='fixed inset-0 z-50 flex flex-col'
			style={{
				background: 'rgba(5,12,40,0.92)',
				backdropFilter: 'blur(16px)',
				WebkitBackdropFilter: 'blur(16px)',
				paddingTop: 'env(safe-area-inset-top, 0px)',
				paddingBottom: 'env(safe-area-inset-bottom, 0px)',
			}}
		>
			{/* Header */}
			<div
				className='flex items-center justify-between px-4 py-4 shrink-0'
				style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
			>
				<h1 className='text-xl font-semibold text-white'>Админ панель</h1>
				<button
					onClick={onClose}
					className='w-8 h-8 flex items-center justify-center rounded-full text-white'
					style={{ background: 'rgba(255,255,255,0.12)' }}
					aria-label='Закрыть'
				>
					✕
				</button>
			</div>

			{/* Tab bar */}
			<div className='flex px-4 pt-3 pb-1 gap-2 shrink-0 overflow-x-auto'>
				{TABS.map(tab => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className='whitespace-nowrap px-4 py-2 rounded-xl text-base font-medium shrink-0 transition-colors'
						style={
							activeTab === tab.id
								? { background: '#f5c518', color: '#1a1a1a' }
								: {
										background: 'rgba(255,255,255,0.1)',
										color: 'rgba(255,255,255,0.90)',
									}
						}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Content */}
			<div className='flex-1 overflow-y-auto px-4 py-3'>
				{activeTab === 'services' ? (
					<>
						<button
							onClick={() => setShowAddServiceForm(v => !v)}
							className='w-full py-3 rounded-xl text-base font-medium mb-3'
							style={{ background: '#f5c518', color: '#1a1a1a' }}
						>
							Добавить тип услуги
						</button>
						{showAddServiceForm && (
							<AddServiceTypeForm
								initData={initData}
								onAdd={handleServiceTypeAdd}
								onCancel={() => setShowAddServiceForm(false)}
							/>
						)}
						{serviceTypesLoading && (
							<div className='flex justify-center py-8'>
								<LoadingSpinner />
							</div>
						)}
						{!serviceTypesLoading && serviceTypesError && (
							<ErrorMessage message={serviceTypesError} />
						)}
						{!serviceTypesLoading &&
							!serviceTypesError &&
							serviceTypes.length === 0 && (
								<p
									className='text-center py-8 text-base'
									style={{ color: 'rgba(255,255,255,0.70)' }}
								>
									Нет типов услуг
								</p>
							)}
						{!serviceTypesLoading &&
							!serviceTypesError &&
							serviceTypes.map(s => (
								<ServiceTypeCard
									key={s.id}
									serviceType={s}
									initData={initData}
									onUpdate={handleServiceTypeUpdate}
								/>
							))}
					</>
				) : activeTab === 'schedules' ? (
					<>
						<button
							onClick={() => setShowAddForm(v => !v)}
							className='w-full py-3 rounded-xl text-base font-medium mb-3'
							style={{ background: '#f5c518', color: '#1a1a1a' }}
						>
							Добавить расписание
						</button>
						{showAddForm && (
							<AddScheduleForm
								initData={initData}
								onAdd={handleScheduleAdd}
								onCancel={() => setShowAddForm(false)}
							/>
						)}
						{schedulesLoading && (
							<div className='flex justify-center py-8'>
								<LoadingSpinner />
							</div>
						)}
						{!schedulesLoading && schedulesError && (
							<ErrorMessage message={schedulesError} />
						)}
						{!schedulesLoading && !schedulesError && schedules.length === 0 && (
							<p
								className='text-center py-8 text-base'
								style={{ color: 'rgba(255,255,255,0.70)' }}
							>
								Нет расписаний
							</p>
						)}
						{!schedulesLoading &&
							!schedulesError &&
							schedules.map(s => (
								<ScheduleCard
									key={s.id}
									schedule={s}
									initData={initData}
									onRemove={handleScheduleRemove}
									onUpdate={handleScheduleUpdate}
								/>
							))}
					</>
				) : (
					<>
						{loading && (
							<div className='flex justify-center py-8'>
								<LoadingSpinner />
							</div>
						)}
						{!loading && error && <ErrorMessage message={error} />}
						{!loading && !error && reservations.length === 0 && (
							<p
								className='text-center py-8 text-base'
								style={{ color: 'rgba(255,255,255,0.70)' }}
							>
								Нет записей
							</p>
						)}
						{!loading &&
							!error &&
							reservations.map(r => (
								<ReservationCard
									key={r.id}
									reservation={r}
									tab={activeTab}
									initData={initData}
									onUpdate={handleUpdate}
									onRemove={handleRemove}
								/>
							))}
					</>
				)}
			</div>
		</div>
	)
}
