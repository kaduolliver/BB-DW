import { request } from '../api/apiClient';

export const atualizarPerfilBasico = (dados) => {
    
    return request('/usuario/perfil', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
};

export const atualizarPerfilSpeaker = (dadosSpeaker) => {
    
    return request('/usuario/speaker', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosSpeaker),
    });
};