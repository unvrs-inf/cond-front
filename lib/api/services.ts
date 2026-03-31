import type { ServiceType, ServiceTypesResponse, SchedulesResponse, Schedule, CreateReservationDto, CreateScheduleDto, TypeOfServiceDto, UserInfoDto, AdminReservation, AdminReservationsResponse, ClientReservation, AdditionalService, AdditionalServiceDto, AdditionalServicesResponse, Admin, AdminDto, AdminsResponse, InstallationDto, InstallationRequestDto, InstallationRequest, InstallationRequestsResponse, InstallationService, InstallationServiceDto } from '@/types/api';
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

// The client-facing endpoint uses Spring HATEOAS PagedModel — content may be in
// _embedded.additionalServiceList. We normalise both formats here.
interface _AdditionalServicesRaw {
  content?: AdditionalService[]
  _embedded?: { additionalServiceList?: AdditionalService[] }
  page: AdditionalServicesResponse['page']
}

export async function getAdditionalServices(
  initData: string,
  page: number = 0,
  size: number = 20
): Promise<AdditionalServicesResponse> {
  const client = new ApiClient(initData);
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  const raw = await client.get<_AdditionalServicesRaw>(`/additionalServices?${params}`);
  const content = raw.content ?? raw._embedded?.additionalServiceList ?? [];
  return { content, page: raw.page };
}

export async function getAdminAdditionalServices(
  initData: string,
  page: number = 0,
  size: number = 20
): Promise<AdditionalServicesResponse> {
  const client = new ApiClient(initData);
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  return client.get<AdditionalServicesResponse>(`/rest/admin-ui/additionalServices?${params}`);
}

export async function createAdditionalService(
  initData: string,
  dto: AdditionalServiceDto
): Promise<AdditionalService> {
  return new ApiClient(initData).post<AdditionalService>('/rest/admin-ui/additionalServices', dto);
}

export async function updateAdditionalService(
  initData: string,
  id: number,
  dto: AdditionalServiceDto
): Promise<AdditionalService> {
  return new ApiClient(initData).patch<AdditionalService>(`/rest/admin-ui/additionalServices/${id}`, dto);
}

export async function hideAdditionalService(initData: string, id: number): Promise<AdditionalService> {
  return new ApiClient(initData).patch<AdditionalService>(`/rest/admin-ui/additionalServices/${id}/nonActive`);
}

export async function showAdditionalService(initData: string, id: number): Promise<AdditionalService> {
  return new ApiClient(initData).patch<AdditionalService>(`/rest/admin-ui/additionalServices/${id}/active`);
}

export async function getAdmins(
  initData: string,
  page: number = 0,
  size: number = 20
): Promise<AdminsResponse> {
  const client = new ApiClient(initData);
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  return client.get<AdminsResponse>(`/rest/admin-ui/admins?${params}`);
}

export async function createAdmin(initData: string, dto: AdminDto): Promise<Admin> {
  return new ApiClient(initData).post<Admin>('/rest/admin-ui/admins', dto);
}

export async function updateAdmin(initData: string, id: number, dto: AdminDto): Promise<Admin> {
  return new ApiClient(initData).patch<Admin>(`/rest/admin-ui/admins/${id}`, dto);
}

export async function deleteAdmin(initData: string, id: number): Promise<void> {
  return new ApiClient(initData).delete<void>(`/rest/admin-ui/admins/${id}`);
}

export async function getInstallation(initData: string): Promise<InstallationDto | null> {
  try {
    const data = await new ApiClient(initData).get<InstallationDto | null>('/installations');
    return data ?? null;
  } catch {
    return null;
  }
}

export async function createInstallationRequest(
  initData: string,
  dto: InstallationRequestDto
): Promise<void> {
  return new ApiClient(initData).post<void>('/installations/request', dto);
}

interface _InstallationRequestsRaw {
  content?: InstallationRequest[]
  _embedded?: { installationRequestList?: InstallationRequest[] }
  page: InstallationRequestsResponse['page']
}

export async function getInstallationRequests(
  initData: string,
  page: number = 0,
  size: number = 20
): Promise<InstallationRequestsResponse> {
  const client = new ApiClient(initData);
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  const raw = await client.get<_InstallationRequestsRaw>(`/rest/admin-ui/installationRequests?${params}`);
  const content = raw.content ?? raw._embedded?.installationRequestList ?? [];
  return { content, page: raw.page };
}

export async function deleteInstallationRequest(initData: string, id: number): Promise<InstallationRequest> {
  return new ApiClient(initData).delete<InstallationRequest>(`/rest/admin-ui/installationRequests/${id}`);
}

export async function getInstallationServices(initData: string): Promise<InstallationService[]> {
  return new ApiClient(initData).get<InstallationService[]>('/rest/admin-ui/installationServices');
}

export async function updateInstallationService(initData: string, id: number, dto: InstallationServiceDto): Promise<InstallationService> {
  return new ApiClient(initData).patch<InstallationService>(`/rest/admin-ui/installationServices/${id}`, dto);
}

export async function hideInstallationService(initData: string, id: number): Promise<InstallationService> {
  return new ApiClient(initData).patch<InstallationService>(`/rest/admin-ui/installationServices/${id}/nonActive`);
}

export async function showInstallationService(initData: string, id: number): Promise<InstallationService> {
  return new ApiClient(initData).patch<InstallationService>(`/rest/admin-ui/installationServices/${id}/active`);
}
