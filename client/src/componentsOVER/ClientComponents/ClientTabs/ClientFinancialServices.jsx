import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { useState } from 'react';
import WithdrawRequest from './FinancialComponents/WithdrawRequest';
import DepositRequest from './FinancialComponents/DepositRequest';
import TransferRequest from './FinancialComponents/TransferRequest';

const operacoes = ['withdraw', 'deposit', 'transfer'];

export default function ClientFinancialServices() {
  const [tabSelecionada, setTabSelecionada] = useState('withdraw');

  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-3xl space-y-6">
        <Tabs.Root value={tabSelecionada} onValueChange={setTabSelecionada}>
          {/* Cabeçalho e botões */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Serviços Financeiros</h2>
            <Tabs.List className="flex space-x-2">
              {operacoes.map(tipo => {
                const isAtivo = tabSelecionada === tipo;
                return (
                  <Tabs.Trigger
                    key={tipo}
                    value={tipo}
                    onMouseDown={e => {
                      if (isAtivo) e.preventDefault();
                    }}
                    className={`px-4 py-1 rounded font-medium ${
                      isAtivo
                        ? 'bg-amber-700 text-white cursor-default'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {traduzirOperacao(tipo)}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </div>

          {/* Linha divisória */}
          <div className="border-b border-zinc-700 my-2" />

          {/* Conteúdo dinâmico das abas */}
          <div className="relative mt-2">
            <Tabs.Content value="withdraw" asChild>
              <motion.div
                key="withdraw"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <WithdrawRequest />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="deposit" asChild>
              <motion.div
                key="deposit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <DepositRequest />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="transfer" asChild>
              <motion.div
                key="transfer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <TransferRequest />
              </motion.div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}

function traduzirOperacao(tipo) {
  switch (tipo) {
    case 'withdraw':
      return 'Saque';
    case 'deposit':
      return 'Depósito';
    case 'transfer':
      return 'Transferência';
    default:
      return tipo;
  }
}
