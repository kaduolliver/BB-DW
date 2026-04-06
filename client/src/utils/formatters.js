export function formatCPF(cpf) {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatTelefone(telefone) {
  if (!telefone) return '';
  telefone = telefone.replace(/\D/g, '');
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
}

export function formatData(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeText(texto) {
    if (!texto) return '—';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function validarTelefone(telefone) {
  const regex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
  return regex.test(telefone);
}

export function formatCEP(cep) {
  if (!cep) return '';
  return cep
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}

export function formatarMoeda(valor) {
  const valorApenasNumeros = valor.toString().replace(/[^\d]/g, "");
  if (valorApenasNumeros === "") {
      return ""; 
  }
  const numeroCentavos = parseInt(valorApenasNumeros, 10);
  if (isNaN(numeroCentavos)) return ""; 

  const numeroReais = numeroCentavos / 100;

  return numeroReais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function desformatarMoeda(valorFormatado) {

  if (!valorFormatado) {
    return 0; 
  }
  const apenasNumeros = valorFormatado.replace(/[^\d,]/g, "");
  if (apenasNumeros === "") {
    return 0;
  }
  const valorComPonto = apenasNumeros.replace(/,/g, ".");
  const valorFloat = parseFloat(valorComPonto);
  if (isNaN(valorFloat)) {
    return 0; 
  }
  return valorFloat;
}

export function corDoScore(valor) {
  if (valor == null) return 'text-white';
  if (valor <= 39) return 'text-red-500';
  if (valor <= 79) return 'text-yellow-400';
  return 'text-green-500';
}

export function formatMoeda(valor) {
    if (valor == null) return '—';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPorcentagem(valor) {
    if (valor == null) return '—';
    return `${(valor * 100).toFixed(2)}%`;
}

export function formatarData(data) {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR');
}

export function formatNumeroConta(numero) {
    if (!numero || typeof numero !== 'string' || numero.length < 2) return numero ?? '—';
    return numero.slice(0, -1) + '-' + numero.slice(-1);
}
