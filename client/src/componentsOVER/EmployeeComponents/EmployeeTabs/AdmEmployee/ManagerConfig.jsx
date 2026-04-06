import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/authContext';
import { buscarFuncionarios, atualizarFuncionariosStatus } from '../../../../services/employee/admService';

export default function ManagerConfig() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { usuario } = useAuth();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await buscarFuncionarios();
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const toggleStatus = async (id) => {
    const employeeToUpdate = employees.find(emp => emp.id === id);
    if (!employeeToUpdate) return;

    const newStatus = !employeeToUpdate.inativo;

    setEmployees(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, inativo: newStatus } : emp))
    );

    try {
      await atualizarFuncionariosStatus(id, newStatus);
    } catch (err) {
      setEmployees(prev =>
        prev.map(emp => (emp.id === id ? { ...emp, inativo: !newStatus } : emp))
      );
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-xl font-semibold mt-6 text-center text-gray-300">Carregando funcionários...</div>;
  }

  if (error) {
    return <div className="text-xl font-semibold mt-6 text-center text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="p-6 shadow-2xl h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-6">Gerenciamento de Funcionários</h2>

      {employees.length === 0 ? (
        <p className="text-gray-400">Nenhum funcionário encontrado.</p>
      ) : (
        <div className="overflow-y-auto flex-grow rounded-lg">
          <table className="min-w-full bg-zinc-900 rounded-lg">
            <thead>
              <tr className="bg-black text-left text-gray-200 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Nome</th>
                <th className="py-3 px-6 text-left">Cargo</th>
                <th className="py-3 px-6 text-left">Código</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300 text-sm">
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-zinc-600 hover:bg-zinc-600">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{employee.nome}</td>
                  <td className="py-3 px-6 text-left">{employee.cargo}</td>
                  <td className="py-3 px-6 text-left">{employee.codigo_funcionario}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => toggleStatus(employee.id)}
                      className={`font-bold py-1 rounded text-xs transition-colors duration-200
                        ${employee.inativo
                          ? 'bg-red-600 hover:bg-red-700 px-3 text-white'
                          : 'bg-green-600 hover:bg-green-700 px-5 text-white'
                        }
                      `}
                    >
                      {employee.inativo ? 'Inativo' : 'Ativo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
