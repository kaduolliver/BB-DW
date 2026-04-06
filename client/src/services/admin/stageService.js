import { request } from '../api/apiClient';

export const getPalcos = () => {
    return request('/stages');
};

export const criarPalco = (dadosPalco) => {
    return request('/stages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPalco),
    });
};

export const atualizarPalco = (idStage, dadosPalco) => {
    return request(`/stages/${idStage}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPalco),
    });
};