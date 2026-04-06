import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AnimatedTabs({ tabs, containerClassName  = "" }) {
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const active = tabs.find((tab) => tab.value === activeTab);

  return (
    <div
      className={`max-w-3xl mx-auto mt-10 p-4 bg-black rounded-2xl shadow-lg text-white ${containerClassName}`}
    >
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex justify-center mb-6 border-b border-gray-700">
          {tabs.map(({ value, label }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className={`relative px-6 py-2 text-sm font-medium transition ${
                activeTab === value ? "text-white" : "text-gray-400"
              }`}
            >
              {label}
              {activeTab === value && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t"
                />
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            {active && (
              <Tabs.Content key={active.value} value={active.value} forceMount asChild>
                <motion.div
                  key={active.value}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full"
                >
                  {active.content}
                </motion.div>
              </Tabs.Content>
            )}
          </AnimatePresence>
        </div>
      </Tabs.Root>
    </div>
  );
}
