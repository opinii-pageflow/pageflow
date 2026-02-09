
import React from 'react';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={clsx("flex overflow-x-auto no-scrollbar border-b border-zinc-800", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
            activeTab === tab.id
              ? "border-white text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
