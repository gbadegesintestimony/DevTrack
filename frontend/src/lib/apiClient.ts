import { ApiResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api/v1';

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public setCsrfToken(token: string | null) {
    this.csrfToken = token;
  }

  public getCsrfToken(): string | null {
    return this.csrfToken;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    let csrf = this.csrfToken;
    if (!csrf && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)devtrack_csrf=([^;]+)/);
      if (match) {
        csrf = decodeURIComponent(match[1]);
        this.csrfToken = csrf;
      }
    }

    if (csrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase() || 'GET')) {
      headers['x-csrf-token'] = csrf;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Transmits HttpOnly session cookies across origins
      });

      // Extract new CSRF token if returned in header
      const newCsrf = response.headers.get('x-csrf-token');
      if (newCsrf) {
        this.csrfToken = newCsrf;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data: ApiResponse<T> = await response.json();
        return data;
      }

      // Handle non-JSON or empty response
      const rawText = await response.text();
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: rawText || `Request failed with status ${response.status}`,
          },
        };
      }

      return {
        success: true,
        data: (rawText ? JSON.parse(rawText) : null) as T,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  public get<T>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
