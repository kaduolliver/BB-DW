const BASE_URL = 'http://localhost:5000/api';

export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

async function parseResponse(response) {
    const contentType = response.headers.get('content-type');

    if (response.status === 204) {
        return null;
    }

    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }

    return null;
}

export async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            credentials: 'include',
            ...options,
        });

        const data = await parseResponse(response);

        if (!response.ok) {
            throw new ApiError(
                data?.erro || data?.mensagem || 'Erro na requisição',
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            console.error(`[API ERROR ${error.status}]:`, error.message);
            throw error;
        }

        console.error('[NETWORK ERROR]:', error.message);
        throw new ApiError(
            'Não foi possível conectar ao servidor',
            0
        );
    }
}

export function get(endpoint) {
    return request(endpoint);
}

export function post(endpoint, body) {
    return request(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}

export function put(endpoint, body) {
    return request(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}

export function del(endpoint) {
    return request(endpoint, {
        method: 'DELETE',
    });
}