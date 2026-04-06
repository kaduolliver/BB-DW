const BASE_URL = 'http://localhost:5000/api';

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

export async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            credentials: 'include',
            ...options,
        });

        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new ApiError(
                data?.erro || 'Erro na requisição',
                response.status
            );
        }

        return data;
    } catch (error) {
        console.error('[API ERROR]:', error.message);
        throw error;
    }
}