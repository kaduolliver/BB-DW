import { get, put } from '../api/apiClient';

export const getMeuPerfil = () => {
    return get('/usuario/perfil');
};

export const atualizarPerfilBasico = (dados) => {
    return put('/usuario/perfil', dados);
};

export const atualizarPerfilSpeaker = (dadosSpeaker) => {
    return put('/usuario/speaker', dadosSpeaker);
};