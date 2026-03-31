'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDateTime } from '@/components/admin/formatters'
import { deleteInstallationRequest } from '@/lib/api/services'
import type { InstallationRequest } from '@/types/api'
import { useRef, useState } from 'react'

interface InstallationRequestCardProps {
	request: InstallationRequest
	initData: string
	onRemove: (id: number) => void
}

export function InstallationRequestCard({ request, initData, onRemove }: InstallationRequestCardProps) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [copiedPhone, setCopiedPhone] = useState(false)
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	async function handleDelete() {
		setLoading(true)
		setError(null)
		try {
			await deleteInstallationRequest(initData, request.id)
			onRemove(request.id)
		} catch {
			setError('Ошибка при удалении')
			setLoading(false)
		}
	}

	const clientDisplay = request.client
		? request.client.name
			? request.client.name
			: request.client.username
				? `@${request.client.username} (ID: ${request.client.id})`
				: `ID: ${request.client.id}`
		: null

	return (
		<div
			className='rounded-2xl p-5 mb-4'
			style={{
				background: 'rgba(100,150,255,0.10)',
				backdropFilter: 'blur(8px)',
				WebkitBackdropFilter: 'blur(8px)',
			}}
		>
			<div className='flex items-center justify-between mb-3'>
				<span className='text-base font-semibold' style={{ color: '#f5c518' }}>
					Заявка #{request.id}
				</span>
				<span className='text-sm' style={{ color: 'rgba(255,255,255,0.60)' }}>
					{formatDateTime(request.createdAt)}
				</span>
			</div>

			<div className='text-sm space-y-2 mb-4' style={{ color: 'rgba(255,255,255,0.90)' }}>
				{clientDisplay && (
					<div>Клиент: {clientDisplay}</div>
				)}
				{request.client && (
					<div>
						Telegram:{' '}
						{request.client.tgUsername ? (
							<a
								href={`https://t.me/${request.client.tgUsername}`}
								target='_blank'
								rel='noreferrer'
								style={{ color: '#f5c518', textDecoration: 'underline' }}
							>
								@{request.client.tgUsername}
							</a>
						) : (
							<span style={{ color: 'rgba(255,255,255,0.50)' }}>не указан</span>
						)}
					</div>
				)}
				<div>
					Телефон:{' '}
					<a
						href={`tel:${request.clientPhoneNumber}`}
						onClick={e => {
							if (window.Telegram?.WebApp) {
								e.preventDefault()
								navigator.clipboard.writeText(request.clientPhoneNumber).then(() => {
									setCopiedPhone(true)
									clearTimeout(copiedTimerRef.current)
									copiedTimerRef.current = setTimeout(() => setCopiedPhone(false), 2000)
								})
							}
						}}
						style={{ color: '#f5c518', textDecoration: 'underline' }}
					>
						{request.clientPhoneNumber}
					</a>
					{copiedPhone && (
						<span style={{ color: 'rgba(255,255,255,0.80)', marginLeft: 6, fontSize: '0.75rem' }}>
							✓ Скопировано
						</span>
					)}
				</div>
			</div>

			{confirmOpen && (
				<ConfirmDialog
					message='Вы точно хотите удалить заявку?'
					onConfirm={() => {
						setConfirmOpen(false)
						handleDelete()
					}}
					onCancel={() => setConfirmOpen(false)}
				/>
			)}
			{error && <p className='text-sm text-red-400 mb-2'>{error}</p>}
			<button
				onClick={() => setConfirmOpen(true)}
				disabled={loading}
				className='w-full py-2.5 rounded-xl text-base font-medium disabled:opacity-50'
				style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }}
			>
				{loading ? '...' : 'Удалить'}
			</button>
		</div>
	)
}
