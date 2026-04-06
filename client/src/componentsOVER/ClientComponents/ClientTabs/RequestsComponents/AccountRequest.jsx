import { useState, useEffect } from "react";
import { useAuth } from '../../../../context/authContext';
import { solicitarAberturaConta } from '../../../../services/cliente/contaService';

export default function FinancialServices() {
    const { usuario, carregando, atualizarUsuario } = useAuth();
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [tipoConta, setTipoConta] = useState("corrente");
    const [contasExistentes, setContasExistentes] = useState({
        corrente: false,
        poupanca: false,
        investimento: false,
    });

    useEffect(() => {
        if (!carregando && usuario?.contas) {
            const tipos = {
                corrente: false,
                poupanca: false,
                investimento: false,
            };

            usuario.contas.forEach((conta) => {
                if (conta.tipo === "corrente") tipos.corrente = true;
                if (conta.tipo === "poupanca") tipos.poupanca = true;
                if (conta.tipo === "investimento") tipos.investimento = true;
            });

            setContasExistentes(tipos);

            const tiposDisponiveis = Object.entries(tipos)
                .filter(([_, existe]) => !existe)
                .map(([tipo]) => tipo);

            if (tiposDisponiveis.length > 0) {
                setTipoConta(tiposDisponiveis[0]);
            }
        }
    }, [carregando, usuario]);

    const handleSolicitacao = async () => {
        if (contasExistentes[tipoConta]) {
            setErro(`Você já possui uma conta ${tipoConta}.`);
            setMensagem("");
            return;
        }

        try {
            await solicitarAberturaConta(usuario.id_usuario, tipoConta);
            setMensagem(`Solicitação de conta ${tipoConta} enviada com sucesso.`);
            setErro("");
            // Opcional: atualizar localmente a conta existente
            setContasExistentes((prev) => ({ ...prev, [tipoConta]: true }));

            atualizarUsuario({
                solicitacoes_conta: [
                    ...(usuario.solicitacoes_conta || []),
                    {
                        status: 'PENDENTE',
                        tipo: tipoConta,
                        id_solicitacao: Date.now(),
                        data_solicitacao: new Date().toISOString(),
                    },
                ],
            });
        } catch (e) {
            setMensagem("");
            setErro(e.message || "Erro ao enviar solicitação.");
        }
    };

    if (carregando || !usuario?.id_usuario) {
        return <p className="text-center text-gray-600">Carregando sessão...</p>;
    }

    const tiposDisponiveis = Object.entries(contasExistentes)
        .filter(([_, existe]) => !existe)
        .map(([tipo]) => tipo);

    if (usuario.solicitacoes_conta?.some(s => s.status === 'PENDENTE')) {
        return (
            <div className="max-w-xl mx-auto mt-10 p-6 bg-black shadow-lg rounded-2xl text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-200">
                    Solicitação Pendente
                </h2>
                <p className="text-blue-400">
                    Você já possui uma solicitação de conta <strong>pendente</strong>.<br />
                    Aguarde a aprovação por um gerente.
                </p>
                <p className="mt-4 text-center font-medium text-green-500">Solicitação enviada com sucesso.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-black shadow-lg rounded-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-200">
                Serviços Financeiros
            </h2>

            {tiposDisponiveis.length === 0 ? (
                <p className="text-green-500 text-center">
                    Você já possui todos os tipos de conta disponíveis.
                </p>
            ) : (
                <>
                    <p className="text-gray-300 mb-4 text-center">
                        Selecione o tipo de conta que deseja solicitar:
                    </p>

                    <div className="mb-4 text-center">
                        <label className="block text-gray-200 mb-2">Tipo de Conta:</label>
                        <select
                            value={tipoConta}
                            onChange={(e) => setTipoConta(e.target.value)}
                            className="w-64 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600"
                        >
                            {tiposDisponiveis.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    Conta {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleSolicitacao}
                            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white rounded-lg transition"
                        >
                            Solicitar Abertura
                        </button>
                    </div>
                </>
            )}

            {mensagem && (
                <p className="mt-4 text-center font-medium text-green-500">{mensagem}</p>
            )}
            {erro && (
                <p className="mt-4 text-center font-medium text-red-500">{erro}</p>
            )}
        </div>
    );
}
