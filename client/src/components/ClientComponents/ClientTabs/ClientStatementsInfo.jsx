import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/authContext';
import { obterExtratoCliente, gerarPdfExtratoCliente } from '../../../services/cliente/contaService';

export default function ClientStatementInfo() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { usuario } = useAuth();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const loadStatements = async () => {
      if (!usuario || !usuario.id_usuario) {
        setLoading(false);
        setError("ID do cliente não disponível. Certifique-se de estar logado.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await obterExtratoCliente(usuario.id_usuario, startDate, endDate, limit);
        setStatements(data);
      } catch (err) {
        console.error("Erro ao carregar extrato:", err);
        setError(err.message || "Erro ao carregar extrato.");
      } finally {
        setLoading(false);
      }
    };

    loadStatements();
  }, [usuario, usuario?.id_usuario, startDate, endDate, limit]);

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    try {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(dataString).toLocaleString('pt-BR', options);
    } catch (e) {
      console.error("Erro ao formatar data:", dataString, e);
      return dataString;
    }
  };

  const handleDownloadPdf = async () => {
    if (!usuario || !usuario.id_usuario) {
      setError("ID do cliente não disponível para gerar PDF.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pdfBlob = await gerarPdfExtratoCliente(usuario.id_usuario, startDate, endDate, limit);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato_cliente_${usuario.id_usuario}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setError(err.message || "Erro ao gerar PDF do extrato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 shadow-2xl h-full flex flex-col rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-2">Extrato da Conta</h2>
      <div className="border-b border-zinc-700 my-2 mb-5" />

      {/* Seção de Filtros */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-gray-300 text-sm mb-1">Data Início:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-gray-300 text-sm mb-1">Data Fim:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="limit" className="text-gray-300 text-sm mb-1">Limite de Operações:</label>
          <input
            type="number"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 1))} 
            min="1"
            className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              [appearance:textfield]"
          />
        </div>
        <button
          onClick={handleDownloadPdf}
          className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Gerando PDF...' : 'Gerar PDF'}
        </button>
      </div>

      {loading && <div className="text-xl font-semibold mt-6 text-center text-gray-300">Carregando extrato...</div>}
      {error && <div className="text-xl font-semibold mt-6 text-center text-red-500">Erro: {error}</div>}

      {!loading && !error && statements.length === 0 ? (
        <p className="text-gray-400">Nenhuma movimentação encontrada para os filtros aplicados.</p>
      ) : (
        !loading && (
          <div className="overflow-x-auto flex-grow rounded-lg border border-zinc-700">
            <table className="min-w-full bg-zinc-900 rounded-lg">
              <thead>
                <tr className="bg-black text-left text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Tipo</th>
                  <th className="py-3 px-6 text-right">Valor</th>
                  <th className="py-3 px-6 text-left">Data/Hora</th>
                  <th className="py-3 px-6 text-left">Descrição</th>
                  <th className="py-3 px-6 text-left">Conta Origem</th>
                  <th className="py-3 px-6 text-left">Conta Destino</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300 text-sm divide-y divide-zinc-700">
                {statements.map((statement, index) => {
  
                  let valorColorClass = '';
                  
                  if (statement.valor && typeof statement.valor === 'string') {
                    if (statement.valor.startsWith('+')) {
                      valorColorClass = 'text-green-500'; 
                    } else if (statement.valor.startsWith('-')) {
                      valorColorClass = 'text-red-500';
                    } else if (statement.tipo.includes('Empréstimo')) {
                   
                  
                      valorColorClass = 'text-green-500';
                    }
                  }

                  return (
                    <tr key={index} className="hover:bg-zinc-700 transition-colors duration-150">
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {/* Estilização condicional para o tipo de transação */}
                        <span className={`
                          font-bold py-1 px-3 rounded text-xs
                          ${statement.tipo.includes('Depósito') ? 'bg-green-600 text-white' : ''}
                          ${statement.tipo.includes('Saque') ? 'bg-red-600 text-white' : ''}
                          ${statement.tipo.includes('Transferência') ? 'bg-blue-600 text-white' : ''}
                          ${statement.tipo.includes('Empréstimo') ? 'bg-purple-600 text-white' : ''}
                        `}>
                          {statement.tipo}
                        </span>
                      </td>
                      <td className={`py-3 px-6 text-right ${valorColorClass}`}>
                        {statement.valor}
                      </td>
                      <td className="py-3 px-6 text-left">{formatarData(statement.data_hora)}</td>
                      <td className="py-3 px-6 text-left">{statement.descricao}</td>
                      <td className="py-3 px-6 text-left">{statement.conta_origem || 'N/A'}</td>
                      <td className="py-3 px-6 text-left">{statement.conta_destino || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
