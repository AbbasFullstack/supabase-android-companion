import React, { useState } from 'react';
import { ProjectConfig, ProjectTag } from '../types';
import { SupabaseManager } from '../lib/supabaseClient';
import {
  Key,
  Globe,
  Sparkles,
  Layers,
  ExternalLink,
  Shield,
  RefreshCw,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ConnectGatewayProps {
  onAddProjects: (projects: ProjectConfig[]) => void;
}

export const ConnectGateway: React.FC<ConnectGatewayProps> = ({ onAddProjects }) => {
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

  const handleImportFromToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseToken.trim()) return;
    setImportingToken(true);
    setTokenError(null);

    try {
      const imported = await SupabaseManager.importProjectsFromToken(supabaseToken);
      onAddProjects(imported);
    } catch (err: any) {
      setTokenError(err.message || 'Failed to import projects. Please check your token.');
    } finally {
      setImportingToken(false);
    }
  };

  const handleTestConnection = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Please provide both Project URL and Anon Key.' });
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

    onAddProjects([newProject]);
  };

  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100 flex flex-col justify-center items-center px-4 py-8 bg-grid-pattern selection:bg-supa-green selection:text-black">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand & Hero */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-carbon-800 to-carbon-900 border border-supa-green/40 shadow-glow mb-1">
            <svg className="w-8 h-8 text-supa-green" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5 2v10H2l10.5 10v-10H22L11.5 2z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-supa-green rounded-full shadow-glow" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            SupaCompanion
          </h1>
          <p className="text-xs text-carbon-400 max-w-sm mx-auto leading-relaxed">
            Connect your Supabase account to manage databases, inspect tables, run SQL, and monitor auth directly from your mobile device.
          </p>
        </div>

        {/* Card Container */}
        <div className="carbon-card rounded-2xl border border-carbon-700/80 shadow-2xl p-5 sm:p-6 space-y-5">
          
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-carbon-900 p-1 border border-carbon-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setConnectMode('token');
                setTokenError(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
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
              onClick={() => {
                setConnectMode('manual');
                setTestResult(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                connectMode === 'manual'
                  ? 'bg-carbon-800 text-supa-green font-semibold shadow-sm'
                  : 'text-carbon-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manual URL & Key</span>
            </button>
          </div>

          {/* Mode 1: Token Import */}
          {connectMode === 'token' && (
            <form onSubmit={handleImportFromToken} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-carbon-900/70 border border-carbon-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-supa-green" />
                    Supabase Personal Access Token
                  </span>
                  <a
                    href="https://supabase.com/dashboard/account/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-supa-green hover:underline flex items-center gap-0.5 font-medium"
                  >
                    Get Token <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-carbon-400 leading-relaxed">
                  Enter your Supabase Access Token (<code className="text-supa-green bg-carbon-950 px-1 py-0.5 rounded">sbp_...</code>). SupaCompanion will automatically discover and load <strong>all your projects and API keys</strong>.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-carbon-300 mb-1.5">
                  Personal Access Token (sbp_...)
                </label>
                <input
                  type="password"
                  required
                  placeholder="sbp_0123456789abcdef..."
                  value={supabaseToken}
                  onChange={e => setSupabaseToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-600 focus:outline-none focus:border-supa-green focus:ring-1 focus:ring-supa-green"
                />
              </div>

              {tokenError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {tokenError}
                </div>
              )}

              <button
                type="submit"
                disabled={importingToken || !supabaseToken.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-supa-green hover:bg-supa-light text-black text-xs font-bold transition-all shadow-glow disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${importingToken ? 'animate-spin' : ''}`} />
                <span>{importingToken ? 'Connecting & Fetching Projects...' : 'Connect Supabase Account ⚡'}</span>
              </button>
            </form>
          )}

          {/* Mode 2: Manual Credentials */}
          {connectMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-carbon-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Database"
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
                  Save & Enter
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security & Sandbox Footer */}
        <div className="p-3.5 rounded-xl bg-carbon-900/60 border border-carbon-800 flex items-start gap-3 text-xs text-carbon-400">
          <Shield className="w-4 h-4 text-supa-green shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-white">100% Client-Side Sandbox:</strong> Your access tokens and API keys are stored exclusively in your device local storage. All network requests connect directly between your phone and Supabase REST APIs.
          </p>
        </div>

      </div>
    </div>
  );
};
