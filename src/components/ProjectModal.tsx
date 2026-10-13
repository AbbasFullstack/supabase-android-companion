import React, { useState } from 'react';
import { ProjectConfig, ProjectTag } from '../types';
import { SupabaseManager } from '../lib/supabaseClient';
import { X, Plus, Check, Trash2, Key, Globe, Shield, RefreshCw, Zap } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectConfig[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onAddProject: (project: ProjectConfig) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [tag, setTag] = useState<ProjectTag>('prod');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Please provide both URL and Anon Key.' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    const tempProject: ProjectConfig = {
      id: 'temp',
      name: name || 'Test Project',
      url,
      anonKey,
      serviceRoleKey: serviceRoleKey || undefined,
      tag,
      createdAt: Date.now(),
    };

    const res = await SupabaseManager.testConnection(tempProject);
    setTesting(false);
    setTestResult(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url || !anonKey) return;

    const newProject: ProjectConfig = {
      id: `proj_${Date.now()}`,
      name,
      url: url.trim(),
      anonKey: anonKey.trim(),
      serviceRoleKey: serviceRoleKey.trim() || undefined,
      tag,
      createdAt: Date.now(),
    };

    onAddProject(newProject);
    setName('');
    setUrl('');
    setAnonKey('');
    setServiceRoleKey('');
    setIsAdding(false);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg carbon-card rounded-2xl border border-carbon-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-carbon-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-supa-green/10 border border-supa-green/20">
              <Globe className="w-4 h-4 text-supa-green" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Supabase Projects</h2>
              <p className="text-[11px] text-carbon-400">Manage connections & environments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-carbon-400 hover:text-white hover:bg-carbon-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Project List */}
          {!isAdding && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-carbon-300">Connected Workspaces</span>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-1.5 text-xs text-supa-green font-medium hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Connect New
                </button>
              </div>

              <div className="space-y-2">
                {projects.map(p => {
                  const isActive = p.id === activeProjectId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-supa-green/5 border-supa-green/40 shadow-sm'
                          : 'bg-carbon-900/60 border-carbon-800 hover:border-carbon-700 hover:bg-carbon-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isActive ? 'bg-supa-green shadow-glow' : 'bg-carbon-600'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{p.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                                p.tag === 'prod'
                                  ? 'bg-red-500/10 text-red-400'
                                  : p.tag === 'demo'
                                  ? 'bg-supa-green/15 text-supa-green font-bold'
                                  : 'bg-blue-500/10 text-blue-400'
                              }`}
                            >
                              {p.tag}
                            </span>
                          </div>
                          <span className="text-[10px] text-carbon-400 font-mono truncate block max-w-[220px]">
                            {p.url}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {isActive && (
                          <span className="text-[10px] font-medium text-supa-green flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                        {!p.isDemo && (
                          <button
                            onClick={() => onDeleteProject(p.id)}
                            className="p-1.5 rounded-lg text-carbon-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security info card */}
              <div className="p-3 rounded-xl bg-carbon-900/80 border border-carbon-800 flex items-start gap-2.5 text-[11px] text-carbon-300">
                <Shield className="w-4 h-4 text-supa-green shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Zero Telemetry & Local Storage:</span>
                  <p className="text-carbon-400 mt-0.5 leading-relaxed">
                    API keys and endpoints never touch any intermediate server. All database queries connect directly from your device to Supabase REST APIs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add Project Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-white">New Supabase Connection</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-carbon-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-carbon-300 mb-1">
                  Project Name / Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My SaaS Production"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green focus:ring-1 focus:ring-supa-green"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-carbon-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzproject.supabase.co"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green focus:ring-1 focus:ring-supa-green"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-carbon-300 mb-1">
                  Anon / Public Key
                </label>
                <input
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={anonKey}
                  onChange={e => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green focus:ring-1 focus:ring-supa-green"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-carbon-300 flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-400" />
                    Service Role Key <span className="text-[10px] text-carbon-500">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-carbon-400">Required for Auth users management</span>
                </div>
                <input
                  type="password"
                  placeholder="Service role key for administrative privileges"
                  value={serviceRoleKey}
                  onChange={e => setServiceRoleKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green focus:ring-1 focus:ring-supa-green"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-carbon-300 mb-1">Environment Tag</label>
                <div className="flex gap-2">
                  {(['prod', 'staging', 'dev'] as ProjectTag[]).map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTag(t)}
                      className={`flex-1 py-1.5 text-xs rounded-lg uppercase font-mono font-semibold transition-all ${
                        tag === t
                          ? 'bg-supa-green/20 text-supa-green border border-supa-green/40'
                          : 'bg-carbon-900 text-carbon-400 border border-carbon-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-white text-xs font-medium border border-carbon-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  Test Connection
                </button>

                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-supa-green hover:bg-supa-light text-black text-xs font-bold transition-all shadow-glow"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
