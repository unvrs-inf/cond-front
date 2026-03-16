import type { ServiceTypesResponse } from '@/types/api';
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
