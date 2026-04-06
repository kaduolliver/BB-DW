import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../../../context/authContext';
import { formatMoeda, formatPorcentagem, formatarData, capitalizeText, formatNumeroConta, corDoScore } from '../../../../utils/formatters'; 
import CopyButton from '../../../../Common/CopyButton';

const tiposConta = ['poupanca', 'corrente', 'investimento'];

export default function ClientAccountInfo() {
    const { usuario } = useAuth();

    const getPrimeiraContaDisponivel = () => {
        const tipoDisponivel = tiposConta.find(tipo => {
            const conta = usuario?.contas?.find(c => c.tipo === tipo);
            return conta && conta.dados_especificos;
        });
        return tipoDisponivel ?? 'corrente'; 
    };

    const [tipoSelecionado, setTipoSelecionado] = useState(getPrimeiraContaDisponivel);

    if (!usuario) return <div className="text-red-400">Usuário não autenticado.</div>;
    if (!usuario.contas || usuario.contas.length === 0) {
        return (
            <div className="text-xl font-semibold mt-6 text-center text-red-500">
                Nenhuma conta encontrada.
                <p>Reinicie a página (F5)</p>
            </div>
        );
    }

    const contaCorrente = usuario.contas.find(c => c.tipo === 'corrente') || usuario.contas[0];
    const contaSelecionada = usuario.contas.find(c => c.tipo === tipoSelecionado) ?? {};
    const agencia = contaCorrente?.agencia ?? '—';
    const numero = contaCorrente?.numero_conta ?? '—';
    const saldo = contaSelecionada.saldo;
    const status = contaSelecionada.status;
    const dataAbertura = contaSelecionada.data_abertura;
    const score = usuario.score_credito;
    const contas = {
        poupanca: usuario.contas.find(c => c.tipo === 'poupanca')?.dados_especificos ?? null,
        corrente: usuario.contas.find(c => c.tipo === 'corrente')?.dados_especificos ?? null,
        investimento: usuario.contas.find(c => c.tipo === 'investimento')?.dados_especificos ?? null,
    };

    return (
        <div className="flex justify-center mt-6">
            <div className="w-full max-w-3xl space-y-6">
                <Tabs.Root 
                    value={tipoSelecionado}
                    onValueChange={(novoTipo) => {
                        if (contas[novoTipo]) {
                            setTipoSelecionado(novoTipo);
                        }
                    }}
                >
                    {/* Cabeçalho e botões */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">Dados da Conta</h2>
                        <Tabs.List className="flex space-x-2">
                            {tiposConta.map(tipo => {
                                const contaExiste = contas[tipo] !== null;
                                const isAtivo = tipoSelecionado === tipo;

                                return (
                                    <Tabs.Trigger
                                        key={tipo}
                                        value={tipo}
                                        onMouseDown={e => {
                                            if (!contaExiste || isAtivo) e.preventDefault();
                                        }}
                                        className={`px-4 py-1 rounded font-medium ${
                                            isAtivo
                                                ? 'bg-amber-700 text-white cursor-default'
                                                : contaExiste
                                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                        }`}
                                        aria-disabled={!contaExiste || isAtivo}
                                    >
                                        {capitalizeText(tipo)}
                                    </Tabs.Trigger>
                                );
                            })}
                        </Tabs.List>
                    </div>

                    {/* Linha divisória */}
                    <div className="border-b border-zinc-700 my-2" />

                    {/* Agência e número da conta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoItem label="Agência" value={agencia} />
                        <CopyableInfoItem label="Número da Conta" value={formatNumeroConta(numero)} />
                        <InfoItem label="Saldo" value={formatMoeda(saldo)} />
                        <InfoItem label="Status" value={capitalizeText(status) ?? '—'} classNameValue="text-green-500" />
                        <InfoItem label="Data da Abertura" value={formatarData(dataAbertura)} />
                        <InfoItem label="Score" value={score ?? '—'} classNameValue={corDoScore(score)}/>
                    </div>

                    {/* Outra linha divisória */}
                    <div className="border-b border-zinc-700 my-4" />

                    {/* Conteúdo dinâmico das abas */}
                    <div className="relative mt-2">
                        <Tabs.Content value="poupanca" asChild>
                            <motion.div
                                key="poupanca"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                            >
                                <InfoItem label="Taxa de Rendimento" value={formatPorcentagem(contas.poupanca?.taxa_rendimento)} />
                                <InfoItem label="Último Rendimento" value={formatMoeda(contas.poupanca?.ultimo_rendimento)} />
                            </motion.div>
                        </Tabs.Content>

                        <Tabs.Content value="corrente" asChild>
                            <motion.div
                                key="corrente"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                            >
                                <InfoItem label="Limite" value={formatMoeda(contas.corrente?.limite)} />
                                <InfoItem label="Data de Vencimento" value={formatarData(contas.corrente?.data_vencimento)} />
                                <InfoItem label="Taxa de Manutenção" value={formatPorcentagem(contas.corrente?.taxa_manutencao)} />
                            </motion.div>
                        </Tabs.Content>

                        <Tabs.Content value="investimento" asChild>
                            <motion.div
                                key="investimento"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                            >
                                <InfoItem label="Perfil de Risco" value={capitalizeText(contas.investimento?.perfil_risco)} />
                                <InfoItem label="Valor Mínimo" value={formatMoeda(contas.investimento?.valor_minimo)} />
                                <InfoItem label="Taxa Rendimento Base" value={formatPorcentagem(contas.investimento?.taxa_rendimento_base)} />
                            </motion.div>
                        </Tabs.Content>
                    </div>
                </Tabs.Root>
            </div>
        </div>
    );
}

function InfoItem({ label, value, classNameValue }) {
    return (
        <div className="space-y-1">
            <div className="text-sm text-zinc-400">{label}</div>
            <div className={`text-base font-medium ${classNameValue ?? 'text-white'}`}>
                {value ?? '—'}
            </div>
        </div>
    );
}

function CopyableInfoItem({ label, value }) {
    const isCopiable = value && value !== '—';

    return (
        <div className="space-y-1">
            <div className="text-sm text-zinc-400">{label}</div>

            <div className="flex items-center gap-1">
                <span className="text-base font-medium text-white">{value ?? '—'}</span>
                {isCopiable && <CopyButton text={value} />}
            </div>
        </div>
    );
}