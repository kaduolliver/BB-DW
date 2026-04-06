import { useState, useEffect } from 'react';
import { enviarEndereco, buscarEndereco } from '../../../../services/user/userService';
import StateSelect from '../../../../Common/StateSelect';
import { formatCEP } from '../../../../utils/formatters';

export default function ClientAddressForm({ onEnderecoSalvo }) {
    const [endereco, setEndereco] = useState({
        cep: '',
        logradouro: '',
        numero_casa: '',
        bairro: '',
        estado: '',
        complemento: '',
    });

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const [enderecoCadastrado, setEnderecoCadastrado] = useState(null);

    useEffect(() => {
        async function fetchEndereco() {
            try {
                const data = await buscarEndereco();
                if (data && data.cep) {
                    setEndereco(data);
                    setEnderecoCadastrado(true);
                    if (onEnderecoSalvo) onEnderecoSalvo(data);
                } else {
                    setEnderecoCadastrado(false);
                }
            } catch (e) {
                setEnderecoCadastrado(false);
            }
        }
        fetchEndereco();
    }, [onEnderecoSalvo]);

    if (enderecoCadastrado) {
        return (
            <div className="p-4 text-green-400">
                Endereço já cadastrado.
            </div>
        );
    }

    function onChange(e) {
        const { name, value } = e.target;
        setEndereco(prev => ({ ...prev, [name]: value }));
    }

    async function salvarEndereco() {
        setErro(null);

        const { cep, logradouro, numero_casa, bairro, estado } = endereco;
        if (!cep || !logradouro || !numero_casa || !bairro || !estado) {
            setErro('Preencha todos os campos obrigatórios.');
            return;
        }
        setLoading(true);

        const enderecoLimpo = {
            ...endereco,
            cep: endereco.cep.replace(/\D/g, ''),
        };

        try {
            await enviarEndereco(enderecoLimpo);
            setEnderecoCadastrado(true);
            if (onEnderecoSalvo) onEnderecoSalvo(enderecoLimpo);
        } catch (e) {
            setErro(e.message || 'Erro ao salvar endereço');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4">
            <h2 className="text-2xl font-semibold text-white border-b border-zinc-700 pb-2">Cadastrar Endereço</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
                <div>
                    <label className="block text-sm mb-1">CEP *</label>
                    <input
                        name="cep"
                        value={endereco.cep}
                        onChange={(e) => {
                            const formatted = formatCEP(e.target.value);
                            setEndereco(prev => ({ ...prev, cep: formatted }));
                        }}
                        placeholder="00000-000"
                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 outline-none text-white"
                    />
                </div>


                <div>
                    <label className="block text-sm mb-1">Estado *</label>
                    <StateSelect
                        name="estado"
                        value={endereco.estado}
                        onChange={onChange}
                        className="text-white"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Logradouro *</label>
                    <input
                        name="logradouro"
                        value={endereco.logradouro}
                        onChange={onChange}
                        placeholder="Rua, Avenida..."
                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 outline-none text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Número *</label>
                    <input
                        name="numero_casa"
                        value={endereco.numero_casa}
                        onChange={onChange}
                        placeholder="Número"
                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 outline-none text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Bairro *</label>
                    <input
                        name="bairro"
                        value={endereco.bairro}
                        onChange={onChange}
                        placeholder="Bairro"
                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 outline-none text-white"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Complemento</label>
                    <input
                        name="complemento"
                        value={endereco.complemento}
                        onChange={onChange}
                        placeholder="Apartamento, casa, etc."
                        className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 outline-none text-white"
                    />
                </div>
            </div>

            {erro && <div className="text-red-500">{erro}</div>}

            <div className="flex space-x-2">
                <button
                    onClick={salvarEndereco}
                    disabled={loading}
                    className="px-4 py-2 bg-amber-700 rounded hover:bg-amber-600 text-white"
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    );
}
