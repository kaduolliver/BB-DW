import { get, post, put, del } from '../api/apiClient';

export const getPalcos = () => {
    return get('/stages');
};

export const criarPalco = (dadosPalco) => {
    return post('/stages', dadosPalco);
};

export const atualizarPalco = (idStage, dadosPalco) => {
    return put(`/stages/${idStage}`, dadosPalco);
};

export const deletarPalco = (idStage) => {
    return del(`/stages/${idStage}`);
};