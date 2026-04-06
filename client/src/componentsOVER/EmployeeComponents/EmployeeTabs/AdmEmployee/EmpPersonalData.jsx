import { formatCPF, formatData, formatTelefone, capitalize } from '../../../../utils/formatters';
import { Edit2 } from 'lucide-react';
import { InputMask } from '@react-input/mask';
import StateSelect from '../../../../Common/StateSelect';
import { useAdmData } from '../hooks/useAdmData';

function getPlaceholder(campo) {
    const placeholders = {
        logradouro: 'Rua, Avenida...',
        numero_casa: 'Número',
        bairro: 'Bairro',
        complemento: 'Apartamento, Casa, etc.',
    };
    return placeholders[campo] || '';
}

export default function EmpPersonalData() {
    const {
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
    } = useAdmData();

    if (carregando) return <div className="text-zinc-400">Carregando...</div>;
    if (!usuario) return <div className="text-red-400">Usuário não autenticado.</div>;

    return (
        <div className="flex justify-center relative top-5">
            <div className="w-full max-w-3xl space-y-6">
                <h2 className="text-2xl font-semibold text-white border-b border-zinc-700 pb-2">Dados Pessoais</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoItem label="Nome" value={usuario.nome} />
                    <InfoItem label="CPF" value={formatCPF(usuario.cpf)} />
                    <div>
                        <div className="text-sm text-zinc-400">Telefone</div>
                        {editandoTelefone ? (
                            <>
                                <InputMask
                                    mask="(__) _____-____"
                                    replacement={{ _: /\d/ }}
                                    value={telefone}
                                    onChange={e => setTelefone(e.target.value)}
                                    className="w-full p-2 rounded bg-zinc-800 text-white border border-amber-600 outline-none"
                                    placeholder='(XX) XXXXX-XXXX'
                                />
                                <button
                                    disabled={loadingTelefone}
                                    onClick={salvarTelefone}
                                    className="mt-2 px-4 py-1 bg-amber-700 rounded text-white hover:bg-amber-600"
                                >
                                    {loadingTelefone ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button
                                    disabled={loadingTelefone}
                                    onClick={() => {
                                        const telefoneLimpo = usuario.telefone?.replace(/\D/g, '') || '';
                                        setTelefone(telefoneLimpo);
                                        setEditandoTelefone(false);
                                        setErro(null);
                                    }}
                                    className="ml-2 mt-2 px-4 py-1 bg-gray-600 rounded text-white hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                                {erro && <div className="text-red-500 mt-1">{erro}</div>}
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <div className="text-base text-white font-medium">{formatTelefone(telefone)}</div>
                                <button
                                    onClick={() => {
                                        setTelefone('');
                                        setEditandoTelefone(true);
                                        setErro(null);
                                    }}
                                    aria-label="Editar telefone"
                                    title='Editar'
                                >
                                    <Edit2 className="text-amber-600 hover:text-amber-200 cursor-pointer" size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    <InfoItem label="Tipo de Usuário" value={capitalize(usuario.tipo_usuario)} />
                    <InfoItem label="Data de Nascimento" value={formatData(usuario.data_nascimento)} />
                    <InfoItem
                        label="Cargo / Status"
                        value={
                            <>
                                {usuario.cargo} /{" "}
                                <span className={usuario.status_funcionario ? "text-red-500" : "text-green-500"}>
                                    {usuario.status_funcionario ? "Inativo" : "Ativo"}
                                </span>
                            </>
                        }
                    />
                </div>

                <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-semibold text-white border-b border-zinc-700 pb-1 flex justify-between">
                        Endereço
                        {!editandoEndereco && (
                            <button
                                onClick={() => {
                                    setNovoEndereco(endereco || {
                                        cep: '',
                                        estado: '',
                                        logradouro: '',
                                        numero_casa: '',
                                        bairro: '',
                                        complemento: '',
                                    });
                                    setEditandoEndereco(true);
                                    setErro(null);
                                }}
                                title={endereco ? "Editar Endereço" : "Adicionar Endereço"}
                            >
                                <Edit2 className="text-amber-600 hover:text-amber-200" size={20} />
                            </button>
                        )}

                    </h3>

                    {carregandoEndereco ? (
                        <div className="text-zinc-400">Carregando endereço...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['cep', 'estado', 'logradouro', 'numero_casa', 'bairro', 'complemento'].map(campo => (
                                <div key={campo}>
                                    <label className="text-sm text-zinc-400">{campo.replace('_', ' ').toUpperCase()}</label>
                                    {campo === 'cep' ? (
                                        <InputMask
                                            mask="_____-___"
                                            replacement={{ _: /\d/ }}
                                            value={novoEndereco[campo] || ''}
                                            onChange={e => setNovoEndereco({ ...novoEndereco, [campo]: e.target.value })}
                                            className={`w-full p-2 rounded bg-zinc-800 text-white outline-none ${editandoEndereco ? 'border border-amber-600' : 'opacity-70'}`}
                                            placeholder="00000-000"
                                            disabled={!editandoEndereco}
                                        />
                                    ) : campo === 'estado' ? (
                                        <StateSelect
                                            value={novoEndereco.estado || ''}
                                            onChange={e => setNovoEndereco({ ...novoEndereco, estado: e.target.value })}
                                            className={`w-full p-2 rounded bg-zinc-800 text-white outline-none ${editandoEndereco ? 'border border-amber-600' : 'opacity-70'}`}
                                            disabled={!editandoEndereco}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className={`w-full p-2 rounded bg-zinc-800 text-white outline-none ${editandoEndereco ? 'border border-amber-600' : 'opacity-70'}`}
                                            value={novoEndereco[campo] || ''}
                                            onChange={e => setNovoEndereco({ ...novoEndereco, [campo]: e.target.value })}
                                            disabled={!editandoEndereco}
                                            placeholder={getPlaceholder(campo)}
                                        />
                                    )}
                                </div>
                            ))}
                            {editandoEndereco && (
                                <div className="col-span-full flex space-x-2 mt-2">
                                    <button
                                        onClick={salvarEndereco}
                                        disabled={loadingTelefone}
                                        className="px-4 py-1 bg-amber-700 rounded text-white hover:bg-amber-600"
                                    >
                                        {loadingTelefone ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNovoEndereco(endereco || {
                                                cep: '',
                                                estado: '',
                                                logradouro: '',
                                                numero_casa: '',
                                                bairro: '',
                                                complemento: '',
                                            });
                                            setEditandoEndereco(false);
                                            setErro(null);
                                        }}
                                        className="px-4 py-1 bg-gray-600 rounded text-white hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>

                                </div>
                            )}
                            {erro && <div className="text-red-500 mt-1 col-span-full">{erro}</div>}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="space-y-1">
            <div className="text-sm text-zinc-400">{label}</div>
            <div className="text-base text-white font-medium">{value}</div>
        </div>
    );
}
