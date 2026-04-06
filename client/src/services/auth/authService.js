import { get, post } from '../api/apiClient';

export const loginUsuario = (dados) => {
    return post('/login', dados);
};

export const registrarUsuario = (dados) => {
    return post('/register', dados);
};

export const verificarSessao = () => {
    return get('/sessao');
};

export const logoutUsuario = () => {
    return post('/logout', {});
};