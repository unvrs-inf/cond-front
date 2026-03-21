import type { ApiError } from '@/types/api';

export class ApiClient {
  private baseUrl: string;
  private initData: string;

  constructor(initData: string = '') {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.initData = initData;
  }

  /**
   * Makes a typed fetch request to the API
   * @param endpoint - API endpoint (without base URL)
   * @param options - Fetch options
   * @returns Typed response
   */
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers from options if present
    if (options.headers) {
      const existingHeaders = new Headers(options.headers);
      existingHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    }

    // Add Telegram initData to headers for authentication
    if (this.initData) {
      headers['X-Telegram-Init-Data'] = this.initData;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP error ${response.status}`,
          status: response.status,
          details: errorData,
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        // Already formatted API error
        throw error;
      }

      // Network or other error
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      };
      throw apiError;
    }
  }

  /**
   * Makes a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  /**
   * Makes a POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Makes a PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Makes a PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Makes a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}
