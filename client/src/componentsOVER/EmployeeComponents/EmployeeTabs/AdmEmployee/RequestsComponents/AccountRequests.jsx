import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSolicitacoesPendentes, aprovarSolicitacaoConta, rejeitarSolicitacaoConta } from '../../../../../services/employee/requestsService';
import { useAuth } from '../../../../../context/authContext';

export default function AccountRequests() {
    const { usuario, carregando: carregandoAuth } = useAuth();

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [erro, setErro] = useState(null);

    const isManager =
        usuario?.tipo_usuario === 'funcionario' &&
        (usuario?.cargo === 'Admin' || usuario?.cargo === 'Gerente');

    useEffect(() => {
        if (
            !carregandoAuth &&
            (usuario?.cargo === 'Admin' ||
                usuario?.cargo === 'Gerente' ||
                usuario?.cargo === 'Estagiário')
        ) {
            fetchSolicitacoes();
        }

    }, [carregandoAuth, usuario]);

    const fetchSolicitacoes = async () => {
        try {
            setLoading(true);
            const data = await getSolicitacoesPendentes();
            setSolicitacoes(data);
        } catch (err) {
            console.error(err);
            setErro('Erro ao carregar solicitações.');
        } finally {
            setLoading(false);
        }
    };

    const processSolicitacao = async (id, actionFn) => {
        try {
            setProcessing(id);
            await actionFn(id);
            
            setSolicitacoes((prev) => prev.filter((s) => s.id_solicitacao !== id));
        } catch (err) {
            console.error(err);
            setErro('Ocorreu um erro. Tente novamente.');
        } finally {
            setProcessing(null);
        }
    };

    const LoadingOrEmpty = ({ children, className = '' }) => (
        <div className={`max-w-3xl mx-auto mt-10 p-6 bg-black rounded-2xl shadow-lg text-center text-gray-400 ${className}`}>
            {children}
        </div>
    );

    if (carregandoAuth) return <LoadingOrEmpty>Verificando autenticação…</LoadingOrEmpty>;

    if (!usuario || (!isManager && usuario.cargo !== 'Estagiário'))
        return (
            <LoadingOrEmpty className="text-red-400">Acesso negado. Permissão insuficiente.</LoadingOrEmpty>
        );

    if (loading) return <LoadingOrEmpty>Carregando solicitações…</LoadingOrEmpty>;

    if (solicitacoes.length === 0)
        return <LoadingOrEmpty>Nenhuma solicitação pendente.</LoadingOrEmpty>;

    return (
        <div className="max-w-5xl mx-auto p-4 bg-black rounded-2xl shadow-lg text-white">
            <h2 className="text-center text-xl font-semibold mb-6">Solicitações Pendentes</h2>

            {erro && (
                <div className="mb-4 bg-rose-600/20 border border-rose-600 text-rose-300 px-4 py-2 rounded-lg">
                    {erro}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence initial={false}>
                    {solicitacoes.map((s) => (
                        <motion.div
                            key={s.id_solicitacao}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 shadow-md"
                        >
                            <div className="space-y-1 text-xs sm:text-sm">
                                <p>
                                    <span className="font-medium text-gray-400">Cliente:</span>{' '}
                                    <span className="font-semibold">{s.nome_cliente}</span>
                                </p>
                                <p>
                                    <span className="font-medium text-gray-400">Tipo:</span>{' '}
                                    <span className="">
                                        {s.tipo_conta.charAt(0).toUpperCase() + s.tipo_conta.slice(1).toLowerCase()}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-medium text-gray-400">Valor:</span>{' '}
                                    <span className="">R$ {Number(s.valor_inicial || 0).toFixed(2)}</span>
                                </p>
                                <p>
                                    <span className="font-medium text-gray-400">Data:</span>{' '}
                                    <span className="">
                                        {new Date(s.data_solicitacao).toLocaleDateString()} {new Date(s.data_solicitacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </p>
                            </div>

                            {isManager && (
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => processSolicitacao(s.id_solicitacao, aprovarSolicitacaoConta)}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={processing === s.id_solicitacao}
                                    >
                                        {processing === s.id_solicitacao ? 'Aprovando…' : 'Aprovar'}
                                    </button>
                                    <button
                                        onClick={() => processSolicitacao(s.id_solicitacao, rejeitarSolicitacaoConta)}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={processing === s.id_solicitacao}
                                    >
                                        {processing === s.id_solicitacao ? 'Rejeitando…' : 'Rejeitar'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
