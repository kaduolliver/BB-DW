import { request } from '../api/apiClient';

export const getTrilhas = () => {
    return request('/tracks');
};

export const criarTrilha = (dados) => {
    return request('/tracks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
};