import type { ServiceType, ServiceTypesResponse, SchedulesResponse, Schedule, CreateReservationDto, CreateScheduleDto, TypeOfServiceDto, UserInfoDto, AdminReservation, AdminReservationsResponse, ClientReservation } from '@/types/api';
import { ApiClient } from './client';

/**
 * Fetches service types from the API
 * @param initData - Telegram initData for authentication
 * @param page - Page number (0-indexed)
 * @param size - Number of items per page
 * @returns Service types response with pagination
 */
export async function getServiceTypes(
  initData: string,
  page: number = 0,
  size: number = 20
): Promise<ServiceTypesResponse> {
  const client = new ApiClient(initData);
  
  // Build query string
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  return client.get<ServiceTypesResponse>(`/typeOfServices?${params.toString()}`);
}

export async function getAdminServiceTypes(
  initData: string,
  page: number = 0,
  size: number = 20
): Promise<ServiceTypesResponse> {
  const client = new ApiClient(initData);
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  return client.get<ServiceTypesResponse>(`/rest/admin-ui/typeOfServices?${params.toString()}`);
}

export async function getSchedules(initData: string): Promise<SchedulesResponse> {
  const client = new ApiClient(initData);
  return client.get<SchedulesResponse>('/schedules');
}

export async function getAvailableSlots(
  initData: string,
  serviceId: number,
  date: string
): Promise<string[]> {
  const client = new ApiClient(initData);
  const params = new URLSearchParams({ serviceId: serviceId.toString(), date });
  return client.get<string[]>(`/reservations/slots?${params}`);
}

export async function createReservation(
  initData: string,
  data: CreateReservationDto
): Promise<void> {
  const client = new ApiClient(initData);
  return client.post('/reservations/slot', data);
}

export async function getClientActiveReservations(initData: string): Promise<ClientReservation[]> {
  return new ApiClient(initData).get<ClientReservation[]>('/reservations/active');
}

export async function cancelClientReservation(initData: string, id: number): Promise<ClientReservation> {
  return new ApiClient(initData).patch<ClientReservation>(`/reservations/${id}/cancel`);
}

export async function getUserInfo(initData: string): Promise<UserInfoDto> {
  return new ApiClient(initData).get<UserInfoDto>('/rest/admin-ui/clients/me');
}

export async function getActiveReservations(initData: string): Promise<AdminReservationsResponse> {
  return new ApiClient(initData).get('/rest/admin-ui/reservations/active');
}

export async function getCreatedReservations(initData: string): Promise<AdminReservationsResponse> {
  return new ApiClient(initData).get('/rest/admin-ui/reservations/created');
}

export async function getCancelledReservations(initData: string): Promise<AdminReservationsResponse> {
  return new ApiClient(initData).get('/rest/admin-ui/reservations/cancelled');
}

export async function getCompletedReservations(initData: string): Promise<AdminReservationsResponse> {
  return new ApiClient(initData).get('/rest/admin-ui/reservations/completed');
}

export async function completeReservation(initData: string, id: number): Promise<AdminReservation> {
  return new ApiClient(initData).patch(`/rest/admin-ui/reservations/${id}/complete`);
}

export async function cancelReservation(initData: string, id: number): Promise<AdminReservation> {
  return new ApiClient(initData).patch(`/rest/admin-ui/reservations/${id}/cancel`);
}

export async function confirmReservation(initData: string, id: number): Promise<AdminReservation> {
  return new ApiClient(initData).patch(`/rest/admin-ui/reservations/${id}/confirm`);
}

export async function createSchedule(initData: string, dto: CreateScheduleDto): Promise<Schedule> {
  return new ApiClient(initData).post<Schedule>('/rest/admin-ui/schedules', dto);
}

export async function deleteSchedule(initData: string, id: number): Promise<Schedule> {
  return new ApiClient(initData).delete<Schedule>(`/rest/admin-ui/schedules/${id}`);
}

export async function updateSchedule(initData: string, id: number, dto: CreateScheduleDto): Promise<Schedule> {
  return new ApiClient(initData).patch<Schedule>(`/rest/admin-ui/schedules/${id}`, dto);
}

export async function createServiceType(initData: string, dto: TypeOfServiceDto): Promise<ServiceType> {
  return new ApiClient(initData).post<ServiceType>('/rest/admin-ui/typeOfServices', dto);
}

export async function updateServiceType(initData: string, id: number, dto: TypeOfServiceDto): Promise<ServiceType> {
  return new ApiClient(initData).patch<ServiceType>(`/rest/admin-ui/typeOfServices/${id}`, dto);
}

export async function deleteServiceType(initData: string, id: number): Promise<ServiceType> {
  return new ApiClient(initData).delete<ServiceType>(`/rest/admin-ui/typeOfServices/${id}`);
}

export async function hideServiceType(initData: string, id: number): Promise<ServiceType> {
  return new ApiClient(initData).patch<ServiceType>(`/rest/admin-ui/typeOfServices/${id}/nonActive`);
}

export async function showServiceType(initData: string, id: number): Promise<ServiceType> {
  return new ApiClient(initData).patch<ServiceType>(`/rest/admin-ui/typeOfServices/${id}/active`);
}
