export interface ServiceType {
  id: number;
  cost: number;
  serviceName: string;
  serviceDescription: string;
  durationOfWork: number;
  imageUrl: string;
}

export interface PaginationInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface ServiceTypesResponse {
  content: ServiceType[];
  page: PaginationInfo;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}
