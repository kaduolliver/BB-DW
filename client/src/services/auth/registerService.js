import { request } from '../api/apiClient';

export const registerUsuario = (dados) => {
    return request('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
};