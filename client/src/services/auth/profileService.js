import { request } from '../api/apiClient';

export const getMeuPerfil = () => {
    return request('/usuario/perfil');
};