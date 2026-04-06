import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../../context/authContext';
import { QRCodeCanvas } from 'qrcode.react';
import { realizarSaque } from '../../../../services/cliente/contaService';
import { getMeuPerfil } from '../../../../services/auth/profileService';
import { formatarMoeda, desformatarMoeda, formatCPF } from '../../../../utils/formatters'

export default function WithdrawRequest() {
    const { usuario, atualizarUsuario } = useAuth();

    /* --- contas elegíveis --- */
    const contasSaque = useMemo(
        () =>
            (usuario?.contas ?? []).filter(c =>
                ['corrente', 'poupanca'].includes(c.tipo)
            ),
        [usuario]
    );

    /* --- estados --- */
    const [contaSelecionada, setContaSelecionada] = useState(contasSaque[0]?.tipo || '');
    const [formaSaque, setFormaSaque] = useState('manual');
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [mostrarModalCPF, setMostrarModalCPF] = useState(false);
    const [cpfDigitado, setCpfDigitado] = useState('');


    /* --- dados da conta --- */
    const contaObj = contasSaque.find(c => c.tipo === contaSelecionada);
    const saldo = Number(contaObj?.saldo ?? 0);
    const limite =
        contaSelecionada === 'corrente'
            ? Number(contaObj?.dados_especificos?.limite ?? 0)
            : 0;
    const idConta = contaObj?.id_conta;

    const limiteRestante =
        contaSelecionada === 'corrente'
            ? limite + Math.min(saldo, 0)
            : 0;

    const handleValorChange = (e) => {
        const valorDigitado = e.target.value;
        const apenasDigitos = valorDigitado.replace(/\D/g, "");
        setValor(formatarMoeda(apenasDigitos));
    };

    /* --- SUBMIT --- */
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setQrCodeData(null);

        /* valida conta e valor */
        if (!contaSelecionada || !contaObj) {
            setError('Selecione a conta de origem');
            return;
        }
        const valorFloat = desformatarMoeda(valor);

        if (isNaN(valorFloat) || valorFloat < 10) {
            setError('Valor mínimo para saque é R$ 10,00');
            return;
        }
        const saldoDisponivel =
            contaSelecionada === 'corrente' ? saldo + limite : saldo;
        if (valorFloat > saldoDisponivel) {
            setError('Saldo (incluindo limite) para o valor solicitado.');
            return;
        }

        /* ---- QR CODE ---- */
        if (formaSaque === 'qrcode') {
            const payload = {
                id_usuario: usuario.id_usuario,
                id_conta: idConta,
                valor: valorFloat,
                descricao,
                ts: Date.now()
            };

            const qrToken = btoa(JSON.stringify(payload));

            //const qrUrl = `http://192.168.1.3:5000/api/saque_qr?token=${encodeURIComponent(qrToken)}`;
            const baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
            const qrUrl = `${baseUrl}/api/saque_qr?token=${encodeURIComponent(qrToken)}`;



            setQrCodeData(qrUrl);
            setSuccess('QR Code gerado. Aponte a câmera para concluir o saque.');
            return;
        }

        setCpfDigitado('');
        setMostrarModalCPF(true);
    }

    const handleCpfChange = (e) => {
        const digitado = e.target.value;
        setCpfDigitado(formatCPF(digitado));   // grava já formatado
    };

    /* ---- SAQUE MANUAL ---- */
    const executarSaque = async (valorFloat) => {
        try {
            setLoading(true);
            const response = await realizarSaque({
                id_conta: idConta,
                valor: valorFloat,
                descricao,
            });

            setSuccess(response.mensagem);
            setValor('');
            setDescricao('');

            atualizarUsuario({
                contas: usuario.contas.map(c => {
                    if (c.id_conta === idConta) {

                        return {
                            ...c,
                            saldo: response.novo_saldo,
                        };
                    }
                    return c;
                }),
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!qrCodeData) return;

        const intervalo = setInterval(async () => {
            const novoPerfil = await getMeuPerfil();
            const novaConta = novoPerfil.contas.find(c => c.id_conta === idConta);
            if (!novaConta) return;

            const saldoAtual = Number(novaConta.saldo);
            if (saldoAtual !== saldo) {
                atualizarUsuario(novoPerfil);
                setValor('');
                setDescricao('');
                setSuccess('Saque realizado com sucesso.');
                setQrCodeData(null);
                clearInterval(intervalo);
            }
        }, 3000);

        return () => clearInterval(intervalo);
    }, [qrCodeData, saldo, idConta, atualizarUsuario]);

    const saldoColor = saldo >= 0 ? 'text-green-400' : 'text-red-500';

    /* --- JSX --- */
    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white"
            aria-live="polite"
        >
            {/* Saldo + limite */}
            <div className="sm:col-span-2">
                <p className="text-sm text-zinc-400 font-medium mb-2">
                    Saldo disponível:{' '}
                    <span className={`${saldoColor} font-semibold`}>
                        R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>

                    {contaSelecionada === 'corrente' && (
                        <span className="ml-4 text-amber-400">
                            Limite restante:{' '}
                            <span className="font-semibold">
                                R$ {limiteRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </span>
                    )}

                    {contaSelecionada === 'corrente' && (
                        <span className="ml-4 text-white">
                            Limite máximo:{' '}
                            <span className="font-semibold">
                                R$ {limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </span>
                    )}
                </p>
            </div>

            {/* Forma de saque */}
            <FormItem label="Forma de Saque">
                <select
                    value={formaSaque}
                    onChange={e => setFormaSaque(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    disabled={loading}
                >
                    <option value="manual">Manual</option>
                    <option value="qrcode">QR Code</option>
                </select>
            </FormItem>

            {/* Conta */}
            <FormItem label="Conta de Origem">
                <select
                    value={contaSelecionada}
                    onChange={e => setContaSelecionada(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    disabled={loading}
                >
                    {contasSaque
                        .filter(c => c.tipo !== 'investimento')
                        .map(c => (
                            <option key={c.id_conta} value={c.tipo}>
                                {c.tipo === 'corrente'
                                    ? 'Conta Corrente'
                                    : 'Conta Poupança'}{' '}
                                - Agência: {c.agencia} - Conta: {c.numero_conta}
                            </option>
                        ))}
                </select>
            </FormItem>


            {/* Valor */}
            <FormItem label="Valor do Saque">
                <input
                    type="text"
                    value={valor}
                    onChange={handleValorChange}
                    placeholder="R$ 0,00"
                    className={`w-full px-3 py-2 rounded bg-zinc-800 text-white border focus:outline-none focus:ring-2 focus:ring-amber-600 transition
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              [appearance:textfield] ${error ? "border-red-500" : "border-zinc-700"}`}
                    disabled={loading}
                />
            </FormItem>

            {formaSaque !== 'qrcode' && (
                <FormItem label="Descrição (opcional)">
                    <input
                        type="text"
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                        placeholder="Ex: Comprar pão"
                        className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        disabled={loading}
                    />
                </FormItem>
            )}

            {/* erros */}
            {error && (
                <div className="sm:col-span-2">
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* botão */}
            <div className="sm:col-span-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 rounded-lg disabled:opacity-50"
                >
                    {loading ? 'Enviando...' : 'Solicitar Saque'}
                </button>

                {success && (
                    <p className="mt-2 text-green-500 text-sm font-medium">{success}</p>
                )}
            </div>

            {mostrarModalCPF && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-zinc-900 p-6 rounded-xl shadow-xl w-96 text-white">
                        <h2 className="text-lg font-semibold mb-4">Confirme seu CPF</h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            Para sua segurança, por favor, digite seu CPF para confirmar o saque.
                        </p>

                        {/* Input com máscara */}
                        <input
                            type="text"
                            value={cpfDigitado}
                            onChange={handleCpfChange}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className="w-full px-3 py-2 mb-4 rounded bg-zinc-800 border border-zinc-600
                   focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
                                onClick={() => setMostrarModalCPF(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="px-4 py-2 bg-amber-600 rounded hover:bg-amber-500"
                                onClick={() => {
                                    const cpfSemMascara = cpfDigitado.replace(/\D/g, '');
                                    if (cpfSemMascara === usuario.cpf) {
                                        setMostrarModalCPF(false);
                                        executarSaque(desformatarMoeda(valor));
                                    } else {
                                        setError('CPF inválido');
                                        setMostrarModalCPF(false);
                                    }
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* QR Code */}
            {qrCodeData && (
                <div className="sm:col-span-2 mt-6 flex flex-col items-center">
                    <p className="mb-2 text-white font-semibold">
                        Escaneie o QR Code para sacar:
                    </p>
                    <QRCodeCanvas
                        value={qrCodeData}
                        size={220}
                        fgColor="#F59E0B"
                        bgColor="#1E293B"
                    />
                </div>
            )}
        </form>
    );
}

function FormItem({ label, children }) {
    return (
        <div className="space-y-1">
            <div className="text-sm text-zinc-400">{label}</div>
            {children}
        </div>
    );
}
