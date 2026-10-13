import React, { useState } from 'react';
import { ProjectConfig, ProjectTag } from '../types';
import { SupabaseManager } from '../lib/supabaseClient';
import {
  X,
  Plus,
  Check,
  Trash2,
  Key,
  Globe,
  Shield,
  RefreshCw,
  Zap,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';

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
  const [connectMode, setConnectMode] = useState<'token' | 'manual'>('token');

  // Token Import Mode state
  const [supabaseToken, setSupabaseToken] = useState('');
  const [importingToken, setImportingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Manual Mode state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [tag, setTag] = useState<ProjectTag>('prod');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleImportFromToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseToken.trim()) return;
    setImportingToken(true);
    setTokenError(null);

    try {
      const imported = await SupabaseManager.importProjectsFromToken(supabaseToken);
      imported.forEach(p => onAddProject(p));
      setIsAdding(false);
      setSupabaseToken('');
      alert(`🎉 Successfully imported ${imported.length} project(s) from your Supabase account!`);
    } catch (err: any) {
      setTokenError(err.message || 'Failed to import projects from token.');
    } finally {
      setImportingToken(false);
    }
  };

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

  const handleManualSubmit = (e: React.FormEvent) => {
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
              <h2 className="text-sm font-semibold text-white">Supabase Workspaces</h2>
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
          
          {/* Project List View */}
          {!isAdding && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-carbon-300">Connected Projects</span>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-1.5 text-xs text-supa-green font-medium hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Connect Project
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
                  <span className="font-semibold text-white">Local Sandbox Isolation:</span>
                  <p className="text-carbon-400 mt-0.5 leading-relaxed">
                    Credentials never leave your mobile device. Requests travel directly between your phone and Supabase REST endpoints.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add / Connect Project View */}
          {isAdding && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-white">Connect Supabase</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setTokenError(null);
                    setTestResult(null);
                  }}
                  className="text-xs text-carbon-400 hover:text-white"
                >
                  Back to List
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="flex rounded-xl bg-carbon-900 p-1 border border-carbon-800 text-xs">
                <button
                  type="button"
                  onClick={() => setConnectMode('token')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                    connectMode === 'token'
                      ? 'bg-carbon-800 text-supa-green font-semibold shadow-sm'
                      : 'text-carbon-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-supa-green" />
                  <span>1-Click Token Import</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConnectMode('manual')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                    connectMode === 'manual'
                      ? 'bg-carbon-800 text-supa-green font-semibold shadow-sm'
                      : 'text-carbon-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Manual URL & Keys</span>
                </button>
              </div>

              {/* Mode 1: 1-Click Access Token Import */}
              {connectMode === 'token' && (
                <form onSubmit={handleImportFromToken} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-carbon-900/60 border border-carbon-800 text-xs text-carbon-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-supa-green" />
                        Supabase Personal Access Token
                      </span>
                      <a
                        href="https://supabase.com/dashboard/account/tokens"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-supa-green hover:underline flex items-center gap-0.5"
                      >
                        Generate Token <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <p className="text-[11px] text-carbon-400 leading-relaxed">
                      Enter your Supabase Access Token (`sbp_...`). SupaCompanion will automatically discover and import <strong>all your projects, database URLs, and API keys</strong> in one tap!
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-carbon-300 mb-1">
                      Personal Access Token (sbp_...)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="sbp_0123456789abcdef..."
                      value={supabaseToken}
                      onChange={e => setSupabaseToken(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-600 focus:outline-none focus:border-supa-green"
                    />
                  </div>

                  {tokenError && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                      {tokenError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={importingToken || !supabaseToken.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-supa-green hover:bg-supa-light text-black text-xs font-bold transition-all shadow-glow disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${importingToken ? 'animate-spin' : ''}`} />
                    <span>{importingToken ? 'Importing Projects...' : 'Import All Projects ⚡'}</span>
                  </button>
                </form>
              )}

              {/* Mode 2: Manual Credentials */}
              {connectMode === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-medium text-carbon-300 mb-1">
                      Project Name / Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. My Production Database"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-carbon-300 mb-1">
                      Project URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://xyzproject.supabase.co"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green"
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
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-carbon-300 flex items-center justify-between mb-1">
                      <span>Service Role Key (Optional)</span>
                      <span className="text-[10px] text-carbon-500">For Auth management</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Service role key for user admin"
                      value={serviceRoleKey}
                      onChange={e => setServiceRoleKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green"
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
                      Save Project
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
