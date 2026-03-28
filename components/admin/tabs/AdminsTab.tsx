'use client'

import { AddAdminForm } from '@/components/admin/AddAdminForm'
import { AdminCard } from '@/components/admin/AdminCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Admin } from '@/types/api'

interface AdminsTabProps {
	admins: Admin[]
	loading: boolean
	error: string | null
	showAddForm: boolean
	onToggleAddForm: () => void
	initData: string
	onAdd: (admin: Admin) => void
	onCancel: () => void
	onUpdate: (updated: Admin) => void
	onRemove: (id: number) => void
}

export function AdminsTab({
	admins,
	loading,
	error,
	showAddForm,
	onToggleAddForm,
	initData,
	onAdd,
	onCancel,
	onUpdate,
	onRemove,
}: AdminsTabProps) {
	return (
		<>
			<button
				onClick={onToggleAddForm}
				className='w-full py-3 rounded-xl text-base font-medium mb-3'
				style={{ background: '#f5c518', color: '#1a1a1a' }}
			>
				Добавить администратора
			</button>
			{showAddForm && (
				<AddAdminForm
					initData={initData}
					onAdd={onAdd}
					onCancel={onCancel}
				/>
			)}
			{loading && (
				<div className='flex justify-center py-8'>
					<LoadingSpinner />
				</div>
			)}
			{!loading && error && <ErrorMessage message={error} />}
			{!loading && !error && admins.length === 0 && (
				<p
					className='text-center py-8 text-base'
					style={{ color: 'rgba(255,255,255,0.70)' }}
				>
					Нет администраторов
				</p>
			)}
			{!loading &&
				!error &&
				admins.map(a => (
					<AdminCard
						key={a.id}
						admin={a}
						initData={initData}
						onUpdate={onUpdate}
						onRemove={onRemove}
					/>
				))}
		</>
	)
}
