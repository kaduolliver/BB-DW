import { request } from '../api/apiClient';

export const loginUsuario = (dados) => {
    return request('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
};

export const verificarSessao = () => {
    return request('/sessao');
};

export const logoutUsuario = () => {
    return request('/logout', {
        method: 'POST',
    });
};