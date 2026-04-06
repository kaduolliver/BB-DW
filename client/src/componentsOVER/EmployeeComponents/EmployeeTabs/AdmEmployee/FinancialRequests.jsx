import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { useState } from "react";
import AccountRequests from './RequestsComponents/AccountRequests';
import LoanRequests from './RequestsComponents/LoanRequests';

export default function FinancialRequests() {
  const [tab, setTab] = useState("account");

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-black rounded-2xl shadow-lg text-white">
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="flex justify-center mb-6 border-b border-gray-700">
          <Tabs.Trigger
            value="account"
            className={`relative px-6 py-2 text-sm font-medium transition ${
              tab === "account" ? "text-white" : "text-gray-400"
            }`}
          >
            Solicitações de Conta
            {tab === "account" && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t"
              />
            )}
          </Tabs.Trigger>

          <Tabs.Trigger
            value="financial"
            className={`relative px-6 py-2 text-sm font-medium transition ${
              tab === "financial" ? "text-white" : "text-gray-400"
            }`}
          >
            Solicitações Empréstimo
            {tab === "financial" && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t"
              />
            )}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="account">
          <motion.div
            key="account"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            <AccountRequests />
          </motion.div>
        </Tabs.Content>

        <Tabs.Content value="financial">
          <motion.div
            key="financial"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            <LoanRequests /> 
          </motion.div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
