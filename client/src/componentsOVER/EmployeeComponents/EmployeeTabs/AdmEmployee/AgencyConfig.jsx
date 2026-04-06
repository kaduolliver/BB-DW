import { useState } from 'react';
import AgencyAddressForm from '../AgencyComponents/AgencyAddress'
import { useAuth } from '../../../../context/authContext';

export default function AgencyConfig() {
    const [enderecoSalvo, setEnderecoSalvo] = useState(null);
    const { usuario } = useAuth();

    function handleEnderecoSalvo(endereco) {
        setEnderecoSalvo(endereco);
        
    }
    if (!usuario) return <div className="text-zinc-400">Carregando usuário...</div>;

    return (
        <div className="flex justify-center relative top-5">
            <div className="w-full max-w-3xl space-y-6">

                {/* Outros componentes da configuração aqui, como dados da agência */}
                <h2 className="text-2xl font-semibold text-white border-b border-zinc-700 pb-2">
                    Dados da Agência
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoItem label="Nome da Agência" value={usuario.nome_agencia || 'Não informado'} />
                    <InfoItem label="Código da Agência" value={usuario.codigo_agencia || 'Não informado'} />
                </div>


                {/* Componente de endereço */}
                {usuario && <AgencyAddressForm onEnderecoSalvo={handleEnderecoSalvo} enderecoExterno={enderecoSalvo} />}

                {/* Exibir algo quando o endereço for salvo */}
                {enderecoSalvo && (
                    <div className="p-4 mt-4 bg-green-900 text-green-300 rounded">
                        Endereço salvo com sucesso.
                    </div>
                )}
            </div>
        </div>
    );
}
function InfoItem({ label, value }) {
    return (
        <div className="space-y-1">
            <div className="text-sm text-zinc-400">{label}</div>
            <div className="text-base text-white font-medium">{value}</div>
        </div>
    );
}
