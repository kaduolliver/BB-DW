import { get, post, put, del } from '../api/apiClient';

export const getTrilhas = () => {
    return get('/tracks');
};

export const criarTrilha = (dadosTrilha) => {
    return post('/tracks', dadosTrilha);
};

export const atualizarTrilha = (idTrack, dadosTrilha) => {
    return put(`/tracks/${idTrack}`, dadosTrilha);
};

export const deletarTrilha = (idTrack) => {
    return del(`/tracks/${idTrack}`);
};