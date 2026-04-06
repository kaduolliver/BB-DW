import { Edit2 } from 'lucide-react';
import { InputMask } from '@react-input/mask';
import StateSelect from '../../../../Common/StateSelect';
import useAgencyAddress from '../hooks/useAgencyAddress';

const PLACEHOLDERS = {
  complemento: 'Apartamento, Casa, etc.',
  logradouro: 'Rua, Avenida, Praça...',
  numero_casa: 'Número da residência ou S/N',
  bairro: 'Nome do bairro',
};

export default function AgencyAddressForm(props) {
  const {
    isAdmin,
    editing,
    startEditing,
    draft,
    status: { loading, saving, error },
    handleChange,
    save,
    cancel,
  } = useAgencyAddress(props);

  if (loading) return <div className="text-zinc-400">Carregando endereço...</div>;

  const fieldClass = `w-full p-2 rounded bg-zinc-800 text-white outline-none ${
    editing ? 'border border-amber-600' : 'opacity-70'
  }`;

  const renderInput = campo => {
    if (campo === 'cep')
      return (
        <InputMask
          mask="_____-___"
          replacement={{ _: /\d/ }}
          name="cep"
          value={draft.cep}
          onChange={handleChange}
          className={fieldClass}
          placeholder="00000-000"
          disabled={!editing}
        />
      );

    if (campo === 'estado')
      return (
        <StateSelect
          name="estado"
          value={draft.estado}
          onChange={handleChange}
          className={fieldClass}
          disabled={!editing}
        />
      );

    return (
      <input
        name={campo}
        value={draft[campo]}
        onChange={handleChange}
        className={fieldClass}
        placeholder={PLACEHOLDERS[campo] || ''}
        disabled={!editing}
      />
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 mt-6">
      <h2 className="text-2xl font-semibold text-white border-b border-zinc-700 pb-2 flex justify-between">
        Endereço da Agência
        {isAdmin && !editing && (
          <button onClick={startEditing} title="Editar Endereço">
            <Edit2 className="text-amber-600 hover:text-amber-200" size={20} />
          </button>
        )}
      </h2>

      {!isAdmin && (
        <p className="text-red-400 text-sm mt-1">
          Você não tem permissão para editar o endereço da agência.
        </p>
      )}

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['cep', 'estado', 'logradouro', 'numero_casa', 'bairro', 'complemento'].map(campo => (
          <div key={campo} className="flex flex-col">
            <label className="text-sm text-zinc-400">
              {campo.replace('_', ' ').toUpperCase()}
            </label>
            {renderInput(campo)}
          </div>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Botões de ação */}
      {editing && (
        <div className="flex gap-3 mt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            onClick={cancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}