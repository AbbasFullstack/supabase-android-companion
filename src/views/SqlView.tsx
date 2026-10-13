import React, { useState } from 'react';
import { ProjectConfig, QueryResult } from '../types';
import { SupabaseManager, exportToCsv, exportToJson } from '../lib/supabaseClient';
import {
  Terminal,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  History,
  Trash2,
  FileSpreadsheet,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface SqlViewProps {
  project: ProjectConfig;
}

const PRESET_QUERIES = [
  { label: 'All Users', query: 'SELECT * FROM users_profiles LIMIT 10;' },
  { label: 'Order Status Count', query: 'SELECT count(*), status FROM orders GROUP BY status;' },
  { label: 'Recent Audits', query: 'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 15;' },
  { label: 'Active API Keys', query: 'SELECT * FROM api_keys WHERE is_active = true;' },
];

export const SqlView: React.FC<SqlViewProps> = ({ project }) => {
  const [query, setQuery] = useState<string>('SELECT * FROM users_profiles LIMIT 10;');
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setRunning(true);
    try {
      const res = await SupabaseManager.executeSql(project, query);
      setResult(res);
      setHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 10));
    } catch (err: any) {
      setResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Editor Container */}
      <div className="carbon-card rounded-2xl p-4 sm:p-5 border border-carbon-800 space-y-3.5 shadow-2xl">
        
        {/* Preset Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-supa-green shrink-0" />
            <span className="text-[11px] text-carbon-400 font-mono">Snippets:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(preset.query)}
                className="px-2.5 py-1 rounded-lg bg-carbon-900 border border-carbon-800 text-[11px] font-mono text-carbon-300 hover:text-supa-green hover:border-supa-green/30 whitespace-nowrap transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-[11px] font-mono text-carbon-400 hover:text-white shrink-0 ml-2"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

        {/* Query Input Area */}
        <div className="relative rounded-xl border border-carbon-750 bg-carbon-950/90 overflow-hidden focus-within:border-supa-green focus-within:ring-1 focus-within:ring-supa-green transition-all">
          <div className="flex items-center justify-between px-3 py-1.5 bg-carbon-900/80 border-b border-carbon-800/80 text-[10px] font-mono text-carbon-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-supa-green" /> SQL Console
            </span>
            <span>Ctrl + Enter to execute</span>
          </div>

          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            placeholder="Write your PostgreSQL query here..."
            className="w-full p-3 bg-transparent text-xs sm:text-sm font-mono text-white placeholder-carbon-600 focus:outline-none resize-y selection:bg-supa-green selection:text-black"
          />
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setQuery('')}
            className="text-xs text-carbon-500 hover:text-carbon-300 transition-colors"
          >
            Clear Editor
          </button>

          <button
            onClick={handleRunQuery}
            disabled={running || !query.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-supa-green hover:bg-supa-light text-black text-xs font-bold transition-all shadow-glow disabled:opacity-50 disabled:shadow-none"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${running ? 'animate-pulse' : ''}`} />
            <span>{running ? 'Running...' : 'Run Query'}</span>
          </button>
        </div>

        {/* History drawer if active */}
        {showHistory && history.length > 0 && (
          <div className="p-3 rounded-xl bg-carbon-900/90 border border-carbon-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-carbon-400 font-mono pb-1 border-b border-carbon-800">
              <span>Recent Queries</span>
              <button onClick={() => setHistory([])} className="hover:text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setQuery(h);
                    setShowHistory(false);
                  }}
                  className="p-1.5 rounded-lg bg-carbon-950 text-[11px] font-mono text-carbon-300 hover:text-white cursor-pointer truncate hover:border-carbon-700 border border-transparent"
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Query Results Section */}
      {result && (
        <div className="carbon-card rounded-2xl p-4 sm:p-5 border border-carbon-800 space-y-3 shadow-2xl">
          
          {/* Result Header & Benchmarks */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between border-b border-carbon-800 pb-3">
            <div className="flex items-center gap-3">
              {result.error ? (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Execution Failed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-supa-green font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Success</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-carbon-400 px-2 py-0.5 rounded-lg bg-carbon-900 border border-carbon-800">
                <Clock className="w-3 h-3 text-supa-green" />
                <span>{result.executionTimeMs}ms</span>
              </div>

              {!result.error && (
                <span className="text-[11px] font-mono text-carbon-400">
                  {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}
                </span>
              )}
            </div>

            {/* Results Actions: Table/JSON toggle & Exports */}
            {!result.error && result.rows.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex bg-carbon-900 border border-carbon-800 rounded-lg p-0.5 text-xs font-mono">
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'table' ? 'bg-carbon-800 text-supa-green font-semibold' : 'text-carbon-400'
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'json' ? 'bg-carbon-800 text-supa-green font-semibold' : 'text-carbon-400'
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <button
                  onClick={() => exportToCsv('query_result', result.rows)}
                  className="p-1.5 rounded-lg bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-carbon-300"
                  title="Export to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  onClick={() => exportToJson('query_result', result.rows)}
                  className="p-1.5 rounded-lg bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-carbon-300"
                  title="Export to JSON"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            )}
          </div>

          {/* Result Body */}
          {result.error ? (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 whitespace-pre-wrap leading-relaxed">
              {result.error}
            </div>
          ) : result.rows.length === 0 ? (
            <div className="py-8 text-center text-xs text-carbon-400 font-mono">
              Query completed with 0 rows returned.
            </div>
          ) : activeTab === 'table' ? (
            <div className="overflow-x-auto border border-carbon-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-carbon-900/90 border-b border-carbon-800">
                    {result.columns.map(col => (
                      <th key={col} className="p-2.5 text-[11px] text-carbon-300 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-800/60">
                  {result.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-carbon-900/40">
                      {result.columns.map(col => (
                        <td key={col} className="p-2.5 whitespace-nowrap text-carbon-200 max-w-[220px] truncate">
                          {typeof row[col] === 'object' && row[col] !== null
                            ? JSON.stringify(row[col])
                            : String(row[col] ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="p-3.5 rounded-xl bg-carbon-950 border border-carbon-800 text-xs font-mono text-carbon-200 overflow-x-auto max-h-96">
              {JSON.stringify(result.rows, null, 2)}
            </pre>
          )}

        </div>
      )}

    </div>
  );
};
