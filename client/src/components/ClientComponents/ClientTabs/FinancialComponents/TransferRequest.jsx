import { useState, useMemo } from 'react';
import { useAuth } from '../../../../context/authContext';
import { formatarMoeda, desformatarMoeda, formatCPF } from '../../../../utils/formatters';
import { realizarTransferencia } from '../../../../services/cliente/contaService';

export default function TransferRequest() {
  const { usuario, atualizarUsuario } = useAuth();

  const contasTransferencia = useMemo(
    () => (usuario?.contas ?? []).filter(c => c.tipo === 'corrente'),
    [usuario]
  );

  const [contaSelecionada, setContaSelecionada] = useState(contasTransferencia[0]?.tipo || '');
  const [valor, setValor] = useState('');
  const [targetAccount, setTargetAccount] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [mostrarModalCPF, setMostrarModalCPF] = useState(false);
  const [cpfDigitado, setCpfDigitado] = useState('');
  const [cpfError, setCpfError] = useState(''); 

  const contaOrigemObj = contasTransferencia.find(c => c.tipo === contaSelecionada);
  const saldoOrigem = Number(contaOrigemObj?.saldo ?? 0);
  const limiteOrigem =
    contaSelecionada === 'corrente'
      ? Number(contaOrigemObj?.dados_especificos?.limite ?? 0)
      : 0;
  const idContaOrigem = contaOrigemObj?.id_conta;

  const saldoDisponivelOrigem = saldoOrigem + limiteOrigem;

  const handleValorChange = (e) => {
    const valorDigitado = e.target.value;
    const apenasDigitos = valorDigitado.replace(/\D/g, '');
    setValor(formatarMoeda(apenasDigitos));
  };

  const executarTransferencia = async () => {
    setLoading(true);
    try {
      const valorFloat = desformatarMoeda(valor);

      const response = await realizarTransferencia({
        id_conta_origem: idContaOrigem,
        numero_conta_destino: targetAccount,
        valor: valorFloat,
        descricao,
      });

      setSuccess(response.mensagem);
      setValor('');
      setTargetAccount('');
      setDescricao('');

      atualizarUsuario({
        contas: usuario.contas.map(c => {
          if (c.id_conta === idContaOrigem) {
            return {
              ...c,
              saldo: response.novo_saldo_origem,
            };
          }
          return c;
        }),
      });

    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao realizar a transferência.');
    } finally {
      setLoading(false);
      setMostrarModalCPF(false);
      setCpfDigitado(''); 
      setCpfError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setCpfError('');

    if (!contaSelecionada || !contaOrigemObj) {
      setError('Selecione a conta de origem.');
      return;
    }

    if (contaOrigemObj.tipo !== 'corrente') {
      setError('Transferências só são permitidas a partir de contas correntes.');
      return;
    }

    const valorFloat = desformatarMoeda(valor);

    if (isNaN(valorFloat) || valorFloat < 10) {
      setError('Valor mínimo para transferência é R$ 10,00.');
      return;
    }

    if (valorFloat > saldoDisponivelOrigem) {
      setError('Saldo (incluindo limite) insuficiente na conta de origem para o valor solicitado.');
      return;
    }

    if (!targetAccount.startsWith('BR') || !targetAccount.substring(2).match(/^\d+$/)) {
      setError('O número da conta destino deve começar com "BR" seguido apenas por números.');
      return;
    }

    if (targetAccount.substring(2).length < 6) {
      setError('O número da conta destino (após "BR") deve ter no mínimo 6 dígitos.');
      return;
    }

    if (contaOrigemObj?.numero_conta === targetAccount) {
      setError('Não é possível transferir para a própria conta de origem.');
      return;
    }

    setMostrarModalCPF(true);
  };

  const confirmarCPFeExecutarTransferencia = async () => {
    setCpfError('');
    setLoading(true); 

    const cpfLimpoDigitado = cpfDigitado.replace(/\D/g, '');

    const cpfUsuarioCadastrado = usuario?.cpf?.replace(/\D/g, '');

    if (!cpfLimpoDigitado || cpfLimpoDigitado.length !== 11) {
      setCpfError('Por favor, digite um CPF válido com 11 dígitos.');
      setLoading(false);
      return;
    }

    if (cpfLimpoDigitado === cpfUsuarioCadastrado) {
      await executarTransferencia();
    } else {
      setCpfError('CPF incorreto. Tente novamente.');
      setLoading(false);
    }
  };

  const saldoColor = saldoOrigem >= 0 ? 'text-green-400' : 'text-red-500';

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white"
        aria-live="polite"
      >
        {/* Saldo disponível da conta de origem */}
        <div className="sm:col-span-2">
          <p className="text-sm text-zinc-400 font-medium mb-2">
            Saldo disponível na conta de origem:{' '}
            <span className={`${saldoColor} font-semibold`}>
              R$ {formatarMoeda(saldoOrigem.toFixed(2).replace(/\D/g, ''))}
            </span>
            {contaSelecionada === 'corrente' && (
              <span className="ml-4 text-amber-400">
                Limite restante:{' '}
                <span className="font-semibold">
                  R$ {formatarMoeda(limiteOrigem.toFixed(2).replace(/\D/g, ''))}
                </span>
              </span>
            )}
          </p>
        </div>

        {/* Conta de Origem */}
        <FormItem label="Conta de Origem">
          <select
            value={contaSelecionada}
            onChange={e => setContaSelecionada(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
            disabled={loading}
          >
            {contasTransferencia.length > 0 ? (
              contasTransferencia.map(c => (
                <option key={c.id_conta} value={c.tipo}>
                  Conta Corrente - Agência: {c.agencia} - Conta: {c.numero_conta}
                </option>
              ))
            ) : (
              <option value="">Nenhuma conta disponível</option>
            )}
          </select>
        </FormItem>

        {/* Conta Destino */}
        <FormItem label="Conta Destino">
          <input
            id="transfer-account"
            type="text"
            value={targetAccount}
            onChange={e => setTargetAccount(e.target.value)}
            required
            disabled={loading}
            placeholder="Ex: BR123456789"
            aria-invalid={!!error && targetAccount.length > 0 && !/^BR\d+$/.test(targetAccount)}
            className={`w-full px-3 py-2 rounded bg-zinc-800 text-white border focus:outline-none focus:ring-2 focus:ring-amber-600 transition ${!!error && targetAccount.length > 0 && !/^BR\d+$/.test(targetAccount) ? 'border-red-500' : 'border-zinc-700'
              }`}
          />
        </FormItem>

        {/* Valor para Transferência */}
        <FormItem label="Valor para Transferência">
          <input
            id="transfer-amount"
            type="text"
            value={valor}
            onChange={handleValorChange}
            required
            disabled={loading}
            placeholder="R$ 0,00"
            inputMode="numeric"
            aria-invalid={
              !!error &&
              valor.length > 0 &&
              (isNaN(desformatarMoeda(valor)) || desformatarMoeda(valor) < 10)
            }
            className={`w-full px-3 py-2 rounded bg-zinc-800 text-white border focus:outline-none focus:ring-2 focus:ring-amber-600 transition [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield] ${!!error &&
              valor.length > 0 &&
              (isNaN(desformatarMoeda(valor)) || desformatarMoeda(valor) < 10)
              ? 'border-red-500'
              : 'border-zinc-700'
              }`}
          />
        </FormItem>

        {/* Descrição (opcional) */}
        <FormItem label="Descrição (opcional)">
          <input
            type="text"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Ex: Aluguel"
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
            disabled={loading}
          />
        </FormItem>

        {/* Exibição de erros gerais do formulário */}
        {error && (
          <div className="sm:col-span-2">
            <p role="alert" className="text-sm text-red-500 font-semibold mt-1">
              {error}
            </p>
          </div>
        )}

        {/* Botão de envio */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && !mostrarModalCPF ? 'Enviando...' : 'Solicitar Transferência'}
          </button>

          {success && (
            <p role="status" className="mt-2 text-green-500 font-medium text-sm">
              {success}
            </p>
          )}
        </div>
      </form>

      {/* Modal de Confirmação de CPF */}
      {mostrarModalCPF && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-zinc-900 p-6 rounded-xl shadow-xl w-96 text-white">
            <h2 className="text-lg font-semibold mb-4">Confirme seu CPF</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Para sua segurança, por favor, digite seu CPF para confirmar a transferência.
            </p>

            {/* Input com máscara */}
            <input
              type="text"
              value={cpfDigitado}
              onChange={(e) => {
                const val = e.target.value;
                const somenteDigitos = val.replace(/\D/g, '');
                const cpfParaFormatar = somenteDigitos.substring(0, 11);
                setCpfDigitado(formatCPF(cpfParaFormatar));
                setCpfError(''); 
              }}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`w-full px-3 py-2 mb-4 rounded bg-zinc-800 border focus:outline-none focus:ring-2 focus:ring-amber-600 ${cpfError ? 'border-red-500' : 'border-zinc-700'
                }`}
              disabled={loading}
              aria-invalid={!!cpfError}
            />

            {/* Exibição de erros do CPF */}
            {cpfError && (
              <p role="alert" className="text-sm text-red-500 font-semibold mt-1 mb-4">
                {cpfError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setMostrarModalCPF(false);
                  setCpfDigitado('');
                  setCpfError('');
                  setLoading(false);
                }}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="px-4 py-2 bg-amber-600 rounded hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirmarCPFeExecutarTransferencia}
                disabled={loading}
              >
                {loading ? 'Validando CPF...' : 'Confirmar'}
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
