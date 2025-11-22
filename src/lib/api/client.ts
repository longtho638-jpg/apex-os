/**
 * Base API client with authentication and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

interface RequestOptions extends RequestInit {
    token?: string;
    params?: Record<string, string | number>;
}

/**
 * Make authenticated API request with automatic retry
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { token, params, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams(
            Object.entries(params).map(([k, v]) => [k, String(v)])
        );
        url += `?${searchParams}`;
    }

    // Set headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request with retry logic
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new APIError(
                    errorData.detail || `HTTP ${response.status}`,
                    response.status,
                    errorData
                );
            }

            return await response.json();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on 4xx errors (client errors)
            if (error instanceof APIError && error.status >= 400 && error.status < 500) {
                throw error;
            }

            // Exponential backoff
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    throw lastError || new Error('Request failed after retries');
}

/**
 * GET request helper
 */
export function get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export function post<T>(
    endpoint: string,
    data: any,
    options?: RequestOptions
): Promise<T> {
    return apiRequest<T>(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * PUT request helper
 */
export function put<T>(
    endpoint: string,
    data: any,
    options?: RequestOptions
): Promise<T> {
    return apiRequest<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * DELETE request helper
 */
export function del<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}
