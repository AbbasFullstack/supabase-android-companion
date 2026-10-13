import React from 'react';
import { ActiveTab } from '../types';
import { Database, Terminal, Users, HardDrive, Activity } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tables', label: 'Tables', icon: Database },
    { id: 'sql', label: 'SQL', icon: Terminal },
    { id: 'auth', label: 'Auth', icon: Users },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'metrics', label: 'Health', icon: Activity },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-carbon-950/90 backdrop-blur-xl border-t border-carbon-800/80 px-2 py-1.5 max-w-lg mx-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl sm:bottom-4 sm:rounded-2xl sm:border sm:border-carbon-800/90 sm:shadow-carbon transition-all">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'text-supa-green' : 'text-carbon-400 hover:text-carbon-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 bg-supa-green rounded-full carbon-glow-subtle" />
              )}
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-supa-green/10 scale-110' : 'group-hover:bg-carbon-800/60'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
