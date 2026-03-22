const STATUS_MAP: Record<string, string> = {
  CREATED: 'Создана',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена клиентом',
  CANCELLED_BY_ADMIN: 'Отменена администратором',
  COMPLETED: 'Выполнена',
}

export function translateStatus(status: string): string {
  return STATUS_MAP[status] ?? 'Неизвестный статус'
}
