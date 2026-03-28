export function formatDateTime(dt: string): string {
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

export function formatScheduleDate(dateStr: string): string {
	const [year, month, day] = dateStr.split('-').map(Number)
	const date = new Date(year, month - 1, day)
	return date.toLocaleDateString('ru-RU', {
		weekday: 'short',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}
