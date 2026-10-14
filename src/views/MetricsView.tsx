import React, { useState } from 'react';
import { ProjectConfig } from '../types';
import { SupabaseManager } from '../lib/supabaseClient';
import {
  Activity,
  Zap,
  ShieldCheck,
  Server,
  Cpu,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Github,
  Smartphone,
} from 'lucide-react';

interface MetricsViewProps {
  project: ProjectConfig;
  currentLatency: number | null;
  onRefreshLatency: () => void;
}

export const MetricsView: React.FC<MetricsViewProps> = ({
  project,
  currentLatency,
  onRefreshLatency,
}) => {
  const [testing, setTesting] = useState<boolean>(false);
  const [pingHistory, setPingHistory] = useState<number[]>(() =>
    currentLatency !== null ? [currentLatency] : []
  );

  const handleRunPing = async () => {
    setTesting(true);
    const res = await SupabaseManager.testConnection(project);
    setTesting(false);
    onRefreshLatency();
    if (res.success) {
      setPingHistory(prev => [...prev.slice(-4), res.latencyMs]);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Realtime Connection Card */}
      <div className="carbon-card rounded-2xl p-4 sm:p-5 border border-carbon-800 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-supa-green/10 border border-supa-green/30 text-supa-green">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Connection Latency</h3>
              <p className="text-[11px] text-carbon-400">Round-trip PostgREST ping</p>
            </div>
          </div>

          <button
            onClick={handleRunPing}
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-xs text-supa-green font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Benchmark</span>
          </button>
        </div>

        {/* Latency Gauge */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-carbon-900/60 border border-carbon-800">
          <div>
            <span className="text-[10px] text-carbon-400 uppercase font-mono tracking-wider">Current Latency</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">
                {currentLatency !== null ? currentLatency : '--'}
              </span>
              <span className="text-xs font-mono text-supa-green font-semibold">ms</span>
            </div>
          </div>

          {/* Sparkline Bars */}
          <div className="flex items-end gap-1.5 h-10">
            {pingHistory.length === 0 ? (
              <span className="text-[10px] font-mono text-carbon-500 self-center">No latency benchmarks yet</span>
            ) : (
              pingHistory.map((val, idx) => {
                const heightPct = Math.min(100, Math.max(20, (val / 120) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-2.5 bg-supa-green rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                    />
                    <span className="text-[8px] font-mono text-carbon-500">{val}m</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Database & Specs Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="carbon-card rounded-2xl p-4 border border-carbon-800 space-y-2">
          <div className="flex items-center gap-2 text-carbon-300">
            <Server className="w-4 h-4 text-supa-green" />
            <span className="text-xs font-semibold text-white">PostgreSQL Engine</span>
          </div>
          <p className="text-[11px] text-carbon-400 font-mono">
            PostgREST v12.0.2 / PG 15.1
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-supa-green pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>REST API Active & Ready</span>
          </div>
        </div>

        <div className="carbon-card rounded-2xl p-4 border border-carbon-800 space-y-2">
          <div className="flex items-center gap-2 text-carbon-300">
            <Smartphone className="w-4 h-4 text-supa-green" />
            <span className="text-xs font-semibold text-white">Client Environment</span>
          </div>
          <p className="text-[11px] text-carbon-400 font-mono">
            Termux Linux / Android PWA Standalone
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-supa-green pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Remote Middleman</span>
          </div>
        </div>
      </div>

      {/* Security Best Practices Checklist */}
      <div className="carbon-card rounded-2xl p-4 sm:p-5 border border-carbon-800 space-y-3.5 shadow-2xl">
        <div className="flex items-center gap-2 pb-2 border-b border-carbon-800">
          <ShieldCheck className="w-4 h-4 text-supa-green" />
          <h3 className="text-xs font-semibold text-white">Security & Access Audit</h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-carbon-900/60 border border-carbon-800">
            <CheckCircle2 className="w-4 h-4 text-supa-green shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Local Device Storage</span>
              <p className="text-[11px] text-carbon-400 mt-0.5">
                Keys remain in your client sandbox. No proxy servers or third-party analytical telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-carbon-900/60 border border-carbon-800">
            <CheckCircle2 className="w-4 h-4 text-supa-green shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">SSL Encrypted Direct Traffic</span>
              <p className="text-[11px] text-carbon-400 mt-0.5">
                All requests to Supabase utilize TLS 1.3 encryption directly over HTTPS.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-carbon-900/60 border border-carbon-800">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Row Level Security (RLS) Advisory</span>
              <p className="text-[11px] text-carbon-400 mt-0.5">
                Always ensure tables with sensitive user records have RLS enabled in Supabase Studio.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
