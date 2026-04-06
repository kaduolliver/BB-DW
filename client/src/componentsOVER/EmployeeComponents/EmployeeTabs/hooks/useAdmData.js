import { useAuth } from '../../../../context/authContext';
import { useState, useEffect } from 'react';
import { validarTelefone, formatCEP } from '../../../../utils/formatters';
import { atualizarTelefone } from '../../../../services/user/userService';
import { buscarEndereco, enviarEndereco } from '../../../../services/user/userService';

export function useAdmData() {
    const { usuario, carregando, atualizarUsuario } = useAuth();
    const [telefone, setTelefone] = useState(usuario?.telefone?.replace(/\D/g, '') || '');
    const [editandoTelefone, setEditandoTelefone] = useState(false);
    const [loadingTelefone, setLoadingTelefone] = useState(false);
    const [endereco, setEndereco] = useState(null);
    const [carregandoEndereco, setCarregandoEndereco] = useState(true);
    const [editandoEndereco, setEditandoEndereco] = useState(false);
    const [novoEndereco, setNovoEndereco] = useState({});
    const [erro, setErro] = useState(null);

    useEffect(() => {
        const telefoneLimpo = usuario?.telefone?.replace(/\D/g, '') || '';
        setTelefone(telefoneLimpo);
    }, [usuario?.telefone]);

    
    useEffect(() => {
        async function fetchEndereco() {
            try {
                const data = await buscarEndereco();
                if (data) {
                    
                    const enderecoFormatado = {
                        ...data,
                        cep: formatCEP(data.cep || ''),
                    };
                    setEndereco(enderecoFormatado);
                    setNovoEndereco(enderecoFormatado);
                }
            } catch (e) {
                console.error("Erro ao buscar endereço:", e);
            } finally {
                setCarregandoEndereco(false);
            }
        }
        fetchEndereco();
    }, []);

    async function salvarTelefone() {
        setErro(null);
        const telefoneLimpo = telefone.replace(/\D/g, '');

        if (!validarTelefone(telefone)) {
            setErro('Telefone inválido. Formato esperado: (XX) XXXXX-XXXX');
            return;
        }

        setLoadingTelefone(true);
        try {
            await atualizarTelefone(telefoneLimpo);
            atualizarUsuario({ telefone: telefoneLimpo });
            setEditandoTelefone(false);
        } catch (e) {
            setErro(e.message);
        } finally {
            setLoadingTelefone(false);
        }
    }

    async function salvarEndereco() {
        setErro(null);
        setLoadingTelefone(true);

        const enderecoLimpo = {
            ...novoEndereco,
            cep: novoEndereco.cep.replace(/\D/g, ''),
        };

        try {
            await enviarEndereco(enderecoLimpo);
            setEndereco({ ...enderecoLimpo, cep: formatCEP(enderecoLimpo.cep) });
            setEditandoEndereco(false);
        } catch (e) {
            setErro("Erro ao atualizar endereço.");
            console.error(e);
        } finally {
            setLoadingTelefone(false);
        }
    }

    return {
        usuario,
        carregando,
        telefone,
        setTelefone,
        editandoTelefone,
        setEditandoTelefone,
        loadingTelefone,
        erro,
        salvarTelefone,
        endereco,
        carregandoEndereco,
        editandoEndereco,
        setEditandoEndereco,
        novoEndereco,
        setNovoEndereco,
        salvarEndereco,
        setErro,
    };
}
