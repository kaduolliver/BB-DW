import { useState, useMemo, useEffect } from "react";
import { useAuth } from '../../../../context/authContext';
import { formatarMoeda, desformatarMoeda, formatCPF } from "../../../../utils/formatters";
import { QRCodeCanvas } from "qrcode.react";
import { realizarDeposito } from '../../../../services/cliente/contaService';
import { getMeuPerfil } from "../../../../services/auth/profileService";

export default function DepositRequest() {
    const { usuario, atualizarUsuario } = useAuth();

    const contasDeposito = useMemo(
        () =>
            (usuario?.contas ?? []).filter(c =>
                ['corrente', 'poupanca', 'investimento'].includes(c.tipo)
            ),
        [usuario]
    );

    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [formaDeposito, setFormaDeposito] = useState('pix');
    const [contaSelecionada, setContaSelecionada] = useState(contasDeposito[0]?.tipo || '');
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeData, setQrCodeData] = useState('');

    // Modal CPF
    const [mostrarModalCPF, setMostrarModalCPF] = useState(false);
    const [cpfDigitado, setCpfDigitado] = useState('');

    const contaObj = contasDeposito.find(c => c.tipo === contaSelecionada);
    const saldo = Number(contaObj?.saldo ?? 0);
    const idConta = contaObj?.id_conta;

    useEffect(() => {
        if (contasDeposito.length > 0 && !contaSelecionada) {
            setContaSelecionada(contasDeposito[0].tipo);
        }
    }, [contasDeposito, contaSelecionada]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const valorFloat = desformatarMoeda(amount);

        if (isNaN(valorFloat) || valorFloat < 10) {
            setError("Valor mínimo para depósito é R$ 10,00");
            return;
        }

        if (!contaSelecionada || !contaObj) {
            setError('Selecione uma conta de destino válida.');
            return;
        }

        if (formaDeposito === 'qrcode') {
            const payload = {
                id_usuario: usuario.id_usuario,
                id_conta: contaObj.id_conta,
                valor: valorFloat,
                descricao: 'Deposito via app',
                ts: Date.now()
            };

            const qrToken = btoa(JSON.stringify(payload));
            //const qrUrl = `http://192.168.1.3:5000/api/deposito_qr?token=${encodeURIComponent(qrToken)}`;
            const baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
            const qrUrl = `${baseUrl}/api/deposito_qr?token=${encodeURIComponent(qrToken)}`;

            setQrCodeData(qrUrl);
            setShowQRCode(true);
            setSuccess('QR Code gerado. Aponte a câmera para concluir o depósito.');
            return;
        }

        
        setMostrarModalCPF(true);
    };

    const confirmarCPFeExecutarDeposito = async () => {
        setError("");
        const cpfSemMascara = cpfDigitado.replace(/\D/g, '');
        if (cpfSemMascara !== usuario.cpf) {
            setError("CPF inválido. Depósito cancelado.");
            setMostrarModalCPF(false);
            setCpfDigitado('');
            return;
        }

        setMostrarModalCPF(false);
        setCpfDigitado('');
        setLoading(true);

        try {
            const valorFloat = desformatarMoeda(amount);
            await realizarDeposito({
                id_conta: contaObj.id_conta,
                valor: valorFloat,
                descricao: 'Depósito via app',
            });

            setSuccess(`Depósito de R$ ${valorFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso na conta ${contaObj.numero_conta}!`);
            setAmount("");
            setShowQRCode(false);
            await atualizarUsuario();
        } catch (err) {
            setError(err.message || "Erro ao realizar depósito.");
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        const valorDigitado = e.target.value;
        const apenasDigitos = valorDigitado.replace(/\D/g, "");
        setAmount(formatarMoeda(apenasDigitos));
    };

    const handleAddAmount = (valueToAdd) => {
        const current = desformatarMoeda(amount) || 0;
        const updated = current + valueToAdd;
        setAmount(formatarMoeda(String(updated * 100).split('.')[0]));
    };

    const quickValues = [50, 100, 200];
    const saldoColor = saldo >= 0 ? 'text-green-400' : 'text-red-500';

    const qrData = JSON.stringify({
        tipo: "deposito",
        valor: desformatarMoeda(amount),
        agencia: contaObj?.agencia,
        numero_conta: contaObj?.numero_conta,
    });

    useEffect(() => {
        if (!qrCodeData || !idConta) return;

        const intervalo = setInterval(async () => {
            try {
                const novoPerfil = await getMeuPerfil();
                const contaAtualizada = novoPerfil.contas.find(c => c.id_conta === idConta);
                if (!contaAtualizada) return;

                const saldoAtual = Number(contaAtualizada.saldo);
                if (saldoAtual !== saldo) {
                    await atualizarUsuario(novoPerfil);
                    setAmount('');
                    setSuccess('Depósito confirmado com sucesso.');
                    setQrCodeData('');
                    setShowQRCode(false);
                    clearInterval(intervalo);
                }
            } catch (err) {
                console.error('Erro ao verificar depósito via QR:', err);
            }
        }, 3000);

        return () => clearInterval(intervalo);
    }, [qrCodeData, idConta, saldo, atualizarUsuario]);

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white"
                aria-live="polite"
            >
                <div className="sm:col-span-2">
                    <p className="text-sm text-zinc-400 font-medium mb-2">
                        Saldo disponível na conta selecionada:{' '}
                        <span className={`${saldoColor} font-semibold`}>
                            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </p>
                </div>

                <FormItem label="Forma de Depósito">
                    <select
                        value={formaDeposito}
                        onChange={e => {
                            setFormaDeposito(e.target.value);
                            setShowQRCode(false);
                        }}
                        className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        disabled={loading}
                    >
                        <option value="manual">Manual</option>
                        <option value="qrcode">QR Code</option>
                    </select>
                </FormItem>

                <FormItem label="Conta de Destino">
                    <select
                        value={contaSelecionada}
                        onChange={e => setContaSelecionada(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        disabled={loading}
                    >
                        {contasDeposito.length === 0 ? (
                            <option value="">Nenhuma conta disponível</option>
                        ) : (
                            contasDeposito.map(c => (
                                <option key={c.id_conta} value={c.tipo}>
                                    {c.tipo === 'corrente'
                                        ? 'Conta Corrente'
                                        : c.tipo === 'poupanca'
                                            ? 'Conta Poupança'
                                            : 'Conta Investimento'
                                    } - Agência: {c.agencia} - Conta: {c.numero_conta}
                                </option>
                            ))
                        )}
                    </select>
                </FormItem>

                <FormItem label="Atalhos de Valor">
                    <div className="flex gap-2 pt-2 flex-wrap">
                        {quickValues.map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => handleAddAmount(v)}
                                className="px-4 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-sm font-medium transition"
                            >
                                + R$ {v}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                setAmount("");
                                setShowQRCode(false);
                            }}
                            className="ml-auto px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-sm font-medium transition"
                        >
                            Limpar
                        </button>
                    </div>
                </FormItem>

                <FormItem label="Valor para Depósito">
                    <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        required
                        disabled={loading}
                        placeholder="R$ 0,00"
                        aria-invalid={!!error}
                        className={`w-full px-3 py-2 rounded bg-zinc-800 text-white border focus:outline-none focus:ring-2 focus:ring-amber-600 transition
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              [appearance:textfield] ${error ? "border-red-500" : "border-zinc-700"}`}
                    />
                    {error && (
                        <p className="mt-1 text-sm text-red-500 font-semibold" role="alert">
                            {error}
                        </p>
                    )}
                </FormItem>

                <div className="col-span-1 sm:col-span-2">
                    <button
                        type="submit"
                        disabled={loading || (formaDeposito === 'qrcode' && showQRCode)}
                        className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? "Enviando..."
                            : formaDeposito === 'qrcode' && !showQRCode
                                ? "Gerar QR Code"
                                : "Solicitar Depósito"}
                    </button>

                    {success && (
                        <p className="mt-2 text-green-500 font-medium text-sm" role="status">
                            {success}
                        </p>
                    )}
                </div>

                {/* Exibe o QR Code */}
                {showQRCode && formaDeposito === 'qrcode' && (
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

            {/* Modal de confirmação de CPF */}
            {mostrarModalCPF && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-zinc-900 p-6 rounded-xl shadow-xl w-96 text-white">
                        <h2 className="text-lg font-semibold mb-4">Confirme seu CPF</h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            Para sua segurança, por favor, digite seu CPF para confirmar o depósito.
                        </p>

                        {/* Input com máscara */}
                        <input
                            type="text"
                            value={cpfDigitado}
                            onChange={(e) => {
                                const val = e.target.value;
                                const somenteDigitos = val.replace(/\D/g, '');
                                let formatted = '';
                                if (somenteDigitos.length <= 11) {
                                    formatted = formatCPF(somenteDigitos);
                                } else {
                                    formatted = val;
                                }
                                setCpfDigitado(formatted);
                            }}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className="w-full px-3 py-2 mb-4 rounded bg-zinc-800 border border-zinc-600
                           focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
                                onClick={() => {
                                    setMostrarModalCPF(false);
                                    setCpfDigitado('');
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                className="px-4 py-2 bg-amber-600 rounded hover:bg-amber-500"
                                onClick={confirmarCPFeExecutarDeposito}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
