import { useState, useEffect, useCallback } from 'react';
import {
  buscarEnderecoAgencia,
  cadastrarEnderecoAgencia,
  atualizarEnderecoAgencia,
} from '../../../../services/agency/agencyService';
import { formatCEP } from '../../../../utils/formatters';
import { useAuth } from '../../../../context/authContext';

const ENDERECO_VAZIO = {
  cep: '',
  logradouro: '',
  numero_casa: '',
  bairro: '',
  estado: '',
  complemento: '',
};

export default function useAgencyAddress({ externalAddress, onSave }) {
  const { usuario, atualizarUsuario } = useAuth();
  const agenciaId =
    usuario?.tipo_usuario === 'funcionario' ? usuario.id_agencia : null;
  const isAdmin =
    usuario?.tipo_usuario === 'funcionario' && usuario.cargo === 'Admin';

  const [address, setAddress] = useState(null);
  const [draft, setDraft] = useState(ENDERECO_VAZIO);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState({ loading: true, saving: false, error: null });

  useEffect(() => {
    if (!agenciaId || usuario?.endereco_agencia || externalAddress) return;

    (async () => {
      try {
        const data = await buscarEnderecoAgencia(agenciaId);
        const e = Array.isArray(data) ? data[0] : data;

        if (e?.cep) {
          e.cep = formatCEP(e.cep);
          setAddress(e);
          setDraft(e);
          atualizarUsuario({ endereco_agencia: e });
        }
      } catch {
        setStatus(s => ({ ...s, error: 'Erro ao carregar endereço da agência.' }));
      } finally {
        setStatus(s => ({ ...s, loading: false }));
      }
    })();
  }, [agenciaId, usuario?.endereco_agencia, externalAddress, atualizarUsuario]);

  useEffect(() => {
    if (editing) return;

    const origem = externalAddress || usuario?.endereco_agencia;
    if (origem) {
      const cep = formatCEP(origem.cep);
      setAddress(origem);
      setDraft({ ...origem, cep });
      setStatus(s => ({ ...s, loading: false }));
    }
  }, [externalAddress, usuario?.endereco_agencia, editing]);

  const handleChange = e => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
    setStatus(s => ({ ...s, error: null }));
  };

  const save = useCallback(async () => {
    const { cep, logradouro, numero_casa, bairro, estado } = draft;
    if (!cep || !logradouro || !numero_casa || !bairro || !estado) {
      setStatus(s => ({ ...s, error: 'Preencha todos os campos obrigatórios.' }));
      return;
    }

    setStatus(s => ({ ...s, saving: true }));
    try {
      const clean = { ...draft, cep: draft.cep.replace(/\D/g, '') };
      const saved = address?.id_endereco
        ? await atualizarEnderecoAgencia(agenciaId, clean)
        : await cadastrarEnderecoAgencia(agenciaId, clean);

      const finalData = { ...clean, ...saved };
      atualizarUsuario({ endereco_agencia: finalData });
      setAddress(finalData);
      setDraft({ ...finalData, cep: formatCEP(finalData.cep) });
      setEditing(false);
      setStatus({ loading: false, saving: false, error: null });
      onSave?.(finalData);
    } catch (err) {
      setStatus({ loading: false, saving: false, error: err.message || 'Erro ao salvar endereço.' });
    }
  }, [draft, address, agenciaId, atualizarUsuario, onSave]);

  const cancel = () => {
    setDraft(address || ENDERECO_VAZIO);
    setEditing(false);
    setStatus(s => ({ ...s, error: null }));
  };

  return {
    isAdmin,
    editing,
    startEditing: () => setEditing(true),
    draft,
    status,
    handleChange,
    save,
    cancel,
  };
}
