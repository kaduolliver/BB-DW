import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext';
import { getTiposRelatorio, gerarRelatorioJSON, gerarRelatorioPDF } from '../../../../services/employee/reportService';

export default function EmployeeReportInfo() {
    const [reportTypes, setReportTypes] = useState([]);
    const [selectedReportType, setSelectedReportType] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { usuario } = useAuth();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [limit, setLimit] = useState(10);

    const [customFilters, setCustomFilters] = useState({});

    const reportFiltersMap = {
        'movimentacoes_financeiras': [
            { id: 'id_agencia', label: 'ID Agência', type: 'number' },
            { id: 'id_cliente', label: 'ID Cliente', type: 'number' }
        ],
        'solicitacoes_abertura_conta': [
            { id: 'status', label: 'Status', type: 'select', options: ['PENDENTE', 'APROVADO', 'REJEITADO'] },
            { id: 'id_funcionario_aprovador', label: 'ID Func. Aprovador', type: 'number' }
        ],
        'solicitacoes_emprestimo': [
            { id: 'status', label: 'Status', type: 'select', options: ['PENDENTE', 'APROVADO', 'REJEITADO', 'PAGO'] },
            { id: 'id_funcionario_aprovador', label: 'ID Func. Aprovador', type: 'number' }
        ],
        'status_funcionarios': [
            { id: 'id_agencia', label: 'ID Agência', type: 'number' },
            { id: 'cargo', label: 'Cargo', type: 'text' },
            { id: 'inativo', label: 'Status Inativo', type: 'select', options: [{ value: true, label: 'Sim' }, { value: false, label: 'Não' }] }
        ],
        'auditoria_geral': [
            { id: 'acao', label: 'Ação Contém', type: 'text' },
            { id: 'id_usuario', label: 'ID Usuário', type: 'number' }
        ]
    };

    useEffect(() => {
        const fetchReportTypes = async () => {
            try {
                const types = await getTiposRelatorio();
                setReportTypes(types);
                if (types.length > 0) {
                    setSelectedReportType(types[0].id);
                }
            } catch (err) {
                console.error("Erro ao carregar tipos de relatório:", err);
                setError(err.message || "Erro ao carregar tipos de relatório.");
            }
        };
        fetchReportTypes();
    }, []);

    const handleGenerateReport = useCallback(async () => {
        if (!usuario || !usuario.id_usuario) {
            setError("ID do funcionário não disponível. Certifique-se de estar logado.");
            return;
        }
        if (!selectedReportType) {
            setError("Selecione um tipo de relatório.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const options = {
                tipo_relatorio: selectedReportType,
                start_date: startDate,
                end_date: endDate,
                limit: limit,
                customFilters: customFilters
            };
            const data = await gerarRelatorioJSON(options);
            setReportData(data);
        } catch (err) {
            console.error("Erro ao gerar relatório:", err);
            setError(err.message || "Erro ao gerar relatório.");
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [usuario, selectedReportType, startDate, endDate, limit, customFilters]);

    // Função para gerar o relatório PDF
    const handleDownloadPdf = useCallback(async () => {
        if (!usuario || !usuario.id_usuario) {
            setError("ID do funcionário não disponível para gerar PDF.");
            return;
        }
        if (!selectedReportType) {
            setError("Selecione um tipo de relatório antes de gerar o PDF.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const options = {
                tipo_relatorio: selectedReportType,
                start_date: startDate,
                end_date: endDate,
                limit: limit,
                customFilters: customFilters
            };
            const pdfBlob = await gerarRelatorioPDF(options);
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            const reportTypeName = reportTypes.find(type => type.id === selectedReportType)?.nome || selectedReportType;
            a.download = `${reportTypeName.replace(/\s/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            setError(err.message || "Erro ao gerar PDF do relatório.");
        } finally {
            setLoading(false);
        }
    }, [usuario, selectedReportType, startDate, endDate, limit, customFilters, reportTypes]);

    // useEffect(() => {
    //     if (selectedReportType && usuario?.id_usuario) {
    //         handleGenerateReport();
    //     }
    // }, [selectedReportType, startDate, endDate, limit, customFilters, usuario?.id_usuario, handleGenerateReport]);


    useEffect(() => {
        setCustomFilters({});
    }, [selectedReportType]);

    const handleCustomFilterChange = (filterId, value) => {
        setCustomFilters(prevFilters => ({
            ...prevFilters,
            [filterId]: value
        }));
    };

    const formatarDataTabela = (dataString) => {
        if (!dataString) return 'N/A';
        try {
            if (typeof dataString === 'string' && dataString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
                return dataString;
            }
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            return new Date(dataString).toLocaleString('pt-BR', options);
        } catch (e) {
            console.error("Erro ao formatar data:", dataString, e);
            return dataString;
        }
    };

    return (
        <div className="p-6 shadow-2xl h-full flex flex-col rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-2">Relatórios de Funcionário</h2>
            <div className="border-b border-zinc-700 my-2 mb-5" />

            {/* Seção de Seleção de Relatório e Filtros */}
            <div className="mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col">
                    <label htmlFor="reportType" className="text-gray-300 text-sm mb-1">Tipo de Relatório:</label>
                    <select
                        id="reportType"
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value)}
                        className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                        disabled={loading}
                    >
                        {reportTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Filtros Comuns */}
                <div className="flex flex-col">
                    <label htmlFor="startDate" className="text-gray-300 text-sm mb-1">Data Início:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                        disabled={loading}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="endDate" className="text-gray-300 text-sm mb-1">Data Fim:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                        disabled={loading}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="limit" className="text-gray-300 text-sm mb-1">Limite:</label>
                    <input
                        type="number"
                        id="limit"
                        value={limit}
                        onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-600 w-24 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                        disabled={loading}
                    />
                </div>

                {/* Filtros Dinâmicos */}
                {selectedReportType && reportFiltersMap[selectedReportType] &&
                    reportFiltersMap[selectedReportType].map(filter => (
                        <div className="flex flex-col" key={filter.id}>
                            <label htmlFor={filter.id} className="text-gray-300 text-sm mb-1">{filter.label}:</label>
                            {filter.type === 'select' ? (
                                <select
                                    id={filter.id}
                                    value={customFilters[filter.id] || ''}
                                    onChange={(e) => handleCustomFilterChange(filter.id, e.target.value)}
                                    className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                                    disabled={loading}
                                >
                                    <option value="">Todos</option>
                                    {filter.options.map(option => (
                                        <option key={option.value !== undefined ? option.value : option} value={option.value !== undefined ? option.value : option}>
                                            {option.label !== undefined ? option.label : option}
                                        </option>
                                    ))}
                                </select>
                            ) : filter.type === 'number' ? (
                                <input
                                    type="number"
                                    id={filter.id}
                                    value={customFilters[filter.id] || ''}
                                    onChange={(e) => handleCustomFilterChange(filter.id, parseInt(e.target.value) || '')}
                                    className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-600 w-28 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                                    disabled={loading}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id={filter.id}
                                    value={customFilters[filter.id] || ''}
                                    onChange={(e) => handleCustomFilterChange(filter.id, e.target.value)}
                                    className="p-2 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                                    disabled={loading}
                                />
                            )}
                        </div>
                    ))
                }

                {/* Botões de Ação */}
                <button
                    onClick={handleGenerateReport} 
                    className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 rounded-lg text-white font-semibold disabled:opacity-50"
                    disabled={loading || !selectedReportType}
                >
                    {loading ? 'Gerando Relatório...' : 'Gerar Relatório'}
                </button>
                <button
                    onClick={handleDownloadPdf}
                    className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 rounded-lg text-white font-semibold disabled:opacity-50"
                    disabled={loading || !selectedReportType}
                >
                    {loading ? 'Gerando PDF...' : 'Gerar PDF'}
                </button>
            </div>

            {/* Mensagens de Carregamento/Erro/Nenhum dado */}
            {loading && <div className="text-xl font-semibold mt-6 text-center text-gray-300">Carregando relatório...</div>}
            {error && <div className="text-xl font-semibold mt-6 text-center text-red-500">Erro: {error}</div>}

            {!loading && !error && reportData?.data?.length === 0 && (
                <p className="text-gray-400">Nenhum dado encontrado para o relatório com os filtros aplicados.</p>
            )}

            {/* Exibição dos Dados do Relatório em Tabela */}
            {!loading && !error && reportData?.data?.length > 0 && (
                <div className="overflow-x-auto flex-grow rounded-lg border border-zinc-700">
                    <table className="min-w-full bg-zinc-900 rounded-lg">
                        <thead>
                            <tr className="bg-black text-left text-gray-200 uppercase text-sm leading-normal">
                                {reportData.data.length > 0 && Object.keys(reportData.data[0]).map((key) => (
                                    <th key={key} className="py-3 px-6 text-left">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-zinc-300 text-sm divide-y divide-zinc-700">
                            {reportData.data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-zinc-700 transition-colors duration-150">
                                    {Object.entries(row).map(([key, value], colIndex) => (
                                        <td key={colIndex} className="py-3 px-6 text-left whitespace-nowrap">
                                            {/* Exemplo de estilização para valores numéricos ou datas */}
                                            {key.includes('valor') || key.includes('taxa') || key.includes('score') ? (
                                                <span className="text-right block">
                                                    {value}
                                                </span>
                                            ) : key.includes('data_') ? (
                                                formatarDataTabela(value)
                                            ) : (
                                                String(value)
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
