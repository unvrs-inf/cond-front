'use client'

import { InstallationRequestCard } from '@/components/admin/InstallationRequestCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { InstallationRequest } from '@/types/api'

interface InstallationRequestsTabProps {
	requests: InstallationRequest[]
	loading: boolean
	error: string | null
	initData: string
	onRemove: (id: number) => void
}

export function InstallationRequestsTab({
	requests,
	loading,
	error,
	initData,
	onRemove,
}: InstallationRequestsTabProps) {
	return (
		<>
			{loading && (
				<div className='flex justify-center py-8'>
					<LoadingSpinner />
				</div>
			)}
			{!loading && error && <ErrorMessage message={error} />}
			{!loading && !error && requests.length === 0 && (
				<p
					className='text-center py-8 text-base'
					style={{ color: 'rgba(255,255,255,0.70)' }}
				>
					Нет заявок на монтаж
				</p>
			)}
			{!loading &&
				!error &&
				requests.map(r => (
					<InstallationRequestCard
						key={r.id}
						request={r}
						initData={initData}
						onRemove={onRemove}
					/>
				))}
		</>
	)
}
