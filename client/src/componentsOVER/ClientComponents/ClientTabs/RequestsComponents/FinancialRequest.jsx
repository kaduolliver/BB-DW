import { useState, useEffect, useMemo } from "react";
import { useAuth } from '../../../../context/authContext';
import { solicitarEmprestimo } from '../../../../services/cliente/contaService';
import { formatarMoeda, desformatarMoeda } from "../../../../utils/formatters";
import { getMeuPerfil } from '../../../../services/auth/profileService';

export default function FinancialRequest() {
  const { usuario, setUsuario } = useAuth();
  const contas = usuario?.contas || [];
  const emprestimos = usuario?.emprestimos || [];

  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState(12);
  const [loading, setLoading] = useState(false);
  const [finalidade, setFinalidade] = useState("");
  const [contaSelecionada, setContaSelecionada] = useState(contas.length > 0 ? contas[0].id_conta : "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (contas.length > 0 && !contaSelecionada) {
      setContaSelecionada(contas[0].id_conta);
    }
  }, [contas, contaSelecionada]);

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  const statusBloqueio = useMemo(() => {
    if (emprestimos.some(e => e.status === 'PENDENTE')) return 'pendente';
    if (emprestimos.some(e => e.status === 'APROVADO')) return 'aprovada';
    if (emprestimos.some(e => e.status === 'REJEITADO')) return 'rejeitado';
    return null;
  }, [emprestimos]);

  const validarDados = () => {
    const valorNum = desformatarMoeda(valor);
    if (isNaN(valorNum) || valorNum < 1000 || valorNum > 100000) {
      setErro("Valor deve estar entre R$1.000 e R$100.000.");
      return false;
    }
    if (prazo < 6 || prazo > 60) {
      setErro("Prazo deve estar entre 6 e 60 meses.");
      return false;
    }
    if (!finalidade.trim()) {
      setErro("Finalidade é obrigatória.");
      return false;
    }
    if (!contaSelecionada) {
      setErro("Selecione uma conta para depósito.");
      return false;
    }
    setErro("");
    return true;
  };

  const handleChangeValor = (e) => {
    const apenasDigitos = e.target.value.replace(/\D/g, "");
    setValor(formatarMoeda(apenasDigitos));
  };

  const handleSubmit = async () => {
    if (!validarDados()) return;
    const valorNumerico = desformatarMoeda(valor);
    setMensagem("");
    setErro("");

    try {
      await solicitarEmprestimo({
        id_usuario: usuario.id_usuario,
        valor_solicitado: valorNumerico,
        prazo_meses: prazo,
        finalidade: finalidade.trim(),
        id_conta: parseInt(contaSelecionada),
      });

      const perfilAtualizado = await getMeuPerfil();
      setUsuario(perfilAtualizado);

      setMensagem("Solicitação de empréstimo enviada com sucesso!");
      setValor("");
      setPrazo(12);
      setFinalidade("");
    } catch (e) {
      setErro(e.message || "Erro ao solicitar empréstimo.");
    } finally {
      setLoading(true);
    }
  };

  if (statusBloqueio === 'pendente') {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-black shadow-lg rounded-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">
          Solicitação Pendente
        </h2>
        <p className="text-blue-400">
          Você já possui um empréstimo com status <strong>PENDENTE</strong>.<br />
          Aguarde a análise da sua solicitação.
        </p>
        <ListaEmprestimos emprestimos={emprestimos} />
      </div>
    );
  }

  if (statusBloqueio === 'rejeitado') {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-black shadow-lg rounded-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">
          Empréstimo Rejeitado
        </h2>
        <p className="text-red-400">
          Sua última solicitação foi <strong>REJEITADA</strong>.<br />
          Você está bloqueado para novas solicitações por um período determinado.
        </p>
        <ListaEmprestimos emprestimos={emprestimos} />
      </div>
    );
  }

  if (statusBloqueio === 'aprovada') {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-black shadow-lg rounded-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">
          Solicitação Aprovada
        </h2>
        <p className="text-green-400">
          Você já possui um empréstimo <strong>APROVADO</strong>.<br />
          Novas solicitações estarão bloqueadas por um período determinado.
        </p>
        <ListaEmprestimos emprestimos={emprestimos} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow-md font-sans max-w-xl mx-auto">
      <h3 className="text-xl font-semibold mb-6 text-orange-400 text-center">
        Solicitar Empréstimo
      </h3>

      {!usuario || contas.filter(c => c.tipo === 'corrente').length === 0 ? (
        <p className="text-red-400 text-center">
          Nenhuma conta corrente disponível para solicitação de empréstimo.
          Por favor, abra uma conta <strong>corrente</strong> primeiro.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-300" htmlFor="conta-select">Conta para Depósito:</label>
            <select
              id="conta-select"
              value={contaSelecionada}
              onChange={(e) => setContaSelecionada(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            >
              {contas
                .filter(conta => conta.tipo === 'corrente')
                .map((conta) => (
                  <option key={conta.id_conta} value={conta.id_conta}>
                    {conta.numero_conta} ({conta.tipo}) -  Agência: {conta.agencia}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-300" htmlFor="valor-input">Valor Desejado (R$):</label>
            <input
              id="valor-input"
              type="text"
              value={valor}
              onChange={handleChangeValor}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
              placeholder="Ex: R$ 15.000,00"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-300" htmlFor="prazo-input">
              Prazo (em meses):
            </label>
            <input
              id="prazo-input"
              type="number"
              value={prazo}
              onChange={(e) => setPrazo(parseInt(e.target.value))}
              min="6"
              max="60"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-orange-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="Ex: 24"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-sm text-gray-300" htmlFor="finalidade-input">Finalidade:</label>
            <input
              id="finalidade-input"
              type="text"
              value={finalidade}
              onChange={(e) => setFinalidade(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-orange-500"
              placeholder="Ex: Reforma da casa"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-3 ${loading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'} ...`}
            >
              {loading ? 'Enviando...' : 'Solicitar Empréstimo'}
            </button>
          </div>
        </>
      )}

      {mensagem && (
        <p className="mt-4 text-center text-green-500 font-medium">{mensagem}</p>
      )}
      {erro && (
        <p className="mt-4 text-center text-red-500 font-medium">{erro}</p>
      )}
    </div>
  );
}

function ListaEmprestimos({ emprestimos }) {
  if (!emprestimos || emprestimos.length === 0) {
    return (
      <p className="mt-6 text-sm text-gray-400 text-center">
        Nenhum empréstimo encontrado.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {emprestimos.map((emp, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg p-4 shadow flex flex-col sm:flex-row sm:justify-between text-sm sm:text-base text-gray-200"
        >
          <div>
            <p><span className="text-gray-400">Valor Solicitado:</span> R$ {Number(emp.valor_solicitado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><span className="text-gray-400">Valor Total:</span> R$ {Number(emp.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><span className="text-gray-400">Taxa de Juros Mensal:</span> {emp.taxa_juros_mensal}%</p>
            <p><span className="text-gray-400">Prazo:</span> {emp.prazo_meses} meses</p>
            <p><span className="text-gray-400">Finalidade:</span> {emp.finalidade}</p>
          </div>
          <div className="mt-2 sm:mt-0 text-right">
            <p>
              <span className="text-gray-400">Status:</span>{" "}
              <span
                className={`font-semibold ${emp.status === 'APROVADO'
                  ? 'text-green-400'
                  : emp.status === 'REJEITADO'
                    ? 'text-red-400'
                    : 'text-blue-400'
                  }`}
              >
                {emp.status}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Solicitado em:</span>{" "}
              {new Date(emp.data_solicitacao).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
