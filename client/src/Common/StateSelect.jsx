export default function StateSelect({ value, onChange, name = 'estado', className = '', disabled = false }) {
  return (
    <div>
      
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-2 rounded bg-zinc-800 border border-zinc-600 outline-none text-white ${className}`}
      >
        <option value="">Selecione um estado</option>
        <option value="AC">Acre (AC)</option>
        <option value="AL">Alagoas (AL)</option>
        <option value="AP">Amapá (AP)</option>
        <option value="AM">Amazonas (AM)</option>
        <option value="BA">Bahia (BA)</option>
        <option value="CE">Ceará (CE)</option>
        <option value="DF">Distrito Federal (DF)</option>
        <option value="ES">Espírito Santo (ES)</option>
        <option value="GO">Goiás (GO)</option>
        <option value="MA">Maranhão (MA)</option>
        <option value="MT">Mato Grosso (MT)</option>
        <option value="MS">Mato Grosso do Sul (MS)</option>
        <option value="MG">Minas Gerais (MG)</option>
        <option value="PA">Pará (PA)</option>
        <option value="PB">Paraíba (PB)</option>
        <option value="PR">Paraná (PR)</option>
        <option value="PE">Pernambuco (PE)</option>
        <option value="PI">Piauí (PI)</option>
        <option value="RJ">Rio de Janeiro (RJ)</option>
        <option value="RN">Rio Grande do Norte (RN)</option>
        <option value="RS">Rio Grande do Sul (RS)</option>
        <option value="RO">Rondônia (RO)</option>
        <option value="RR">Roraima (RR)</option>
        <option value="SC">Santa Catarina (SC)</option>
        <option value="SP">São Paulo (SP)</option>
        <option value="SE">Sergipe (SE)</option>
        <option value="TO">Tocantins (TO)</option>
      </select>
    </div>
  );
}
