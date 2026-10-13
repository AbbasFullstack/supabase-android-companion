import React from 'react';
import { ProjectConfig } from '../types';
import { Database, ChevronDown, Zap, Shield, Plus, Globe } from 'lucide-react';

interface NavbarProps {
  activeProject: ProjectConfig;
  latency: number | null;
  isConnected: boolean;
  onOpenProjects: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProject,
  latency,
  isConnected,
  onOpenProjects,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-carbon-950/85 backdrop-blur-xl border-b border-carbon-800/80 px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Project Selector */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-carbon-800 to-carbon-900 border border-supa-green/30 carbon-glow-subtle">
            <svg className="w-5 h-5 text-supa-green" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5 2v10H2l10.5 10v-10H22L11.5 2z" />
            </svg>
            {isConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-supa-green rounded-full animate-ping opacity-75" />
            )}
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-supa-green' : 'bg-red-500'}`} />
          </div>

          <button
            onClick={onOpenProjects}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-carbon-900/90 hover:bg-carbon-800/90 border border-carbon-700/60 transition-all text-left group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white tracking-wide truncate max-w-[140px] sm:max-w-[200px]">
                  {activeProject.name}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    activeProject.tag === 'prod'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : activeProject.tag === 'staging'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : activeProject.tag === 'demo'
                      ? 'bg-supa-green/10 text-supa-green border border-supa-green/30 font-bold'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {activeProject.tag}
                </span>
              </div>
              <p className="text-[10px] text-carbon-400 truncate max-w-[130px] font-mono">
                {activeProject.url.replace(/^https?:\/\//, '')}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-carbon-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2">
          {latency !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-carbon-900/60 border border-carbon-800 text-[11px] font-mono text-carbon-300">
              <Zap className="w-3 h-3 text-supa-green" />
              <span>{latency}ms</span>
            </div>
          )}

          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-supa-green/10 hover:bg-supa-green/20 border border-supa-green/30 text-supa-green text-xs font-medium transition-all"
            title="Add or Switch Project"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Projects</span>
          </button>
        </div>

      </div>
    </header>
  );
};
