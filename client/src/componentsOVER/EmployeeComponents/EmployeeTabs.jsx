import { useState } from 'react';
import { ShieldUser, SettingsIcon, HandCoins, SlidersHorizontal, ClipboardList, Building } from 'lucide-react';
import UserTab from '../UserComponents/UserTab';
import EmpPersonalData from '../EmployeeComponents/EmployeeTabs/AdmEmployee/EmpPersonalData';
import FinancialRequests from '../EmployeeComponents/EmployeeTabs/AdmEmployee/FinancialRequests'
import ManagerConfig from '../EmployeeComponents/EmployeeTabs/AdmEmployee/ManagerConfig';
import ReportsConfig from '../EmployeeComponents/EmployeeTabs/AdmEmployee/ReportsConfig';
import AgencyConfig from '../EmployeeComponents/EmployeeTabs/AdmEmployee/AgencyConfig';
import { useAuth } from '../../context/authContext';

export default function EmployeeTabs() {
  const { usuario } = useAuth();
  const [activeTab, setActiveTab] = useState('dados');
  const isAdministrador = usuario?.tipo_usuario === 'funcionario' && (usuario?.cargo === 'Admin');
  const isManager = usuario?.tipo_usuario === 'funcionario' && (usuario?.cargo === 'Admin' || usuario?.cargo === 'Gerente');
  const isInactive = usuario?.tipo_usuario === 'funcionario' && (usuario?.status_funcionario === false)

  const tabs = [
    {
      value: 'dados',
      label: 'Dados Pessoais',
      icon: ShieldUser,
      content: < EmpPersonalData />
    },
    isAdministrador && {
      value: 'manager',
      label: 'Gerenciamento',
      icon: SlidersHorizontal,
      content: < ManagerConfig />
    },
    isManager && isInactive && {
      value: 'agency',
      label: 'Agência',
      icon: Building,
      content: < AgencyConfig />
    },
    isInactive && {
      value: 'requests',
      label: 'Solicitações',
      icon: HandCoins,
      content: < FinancialRequests />
    },
    isInactive && {
      value: 'reports',
      label: 'Relatórios',
      icon: ClipboardList,
      content: < ReportsConfig />
    },
    {
      value: 'config',
      label: 'Configurações',
      icon: SettingsIcon,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Configurações</h2>
          <p className="text-gray-300">Configurações da conta do cliente.</p>
        </div>
      ),
    },
  ].filter(Boolean);

  return <UserTab tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />;
}
