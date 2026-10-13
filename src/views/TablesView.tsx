import React, { useState, useEffect } from 'react';
import { ProjectConfig, TableInfo } from '../types';
import { SupabaseManager, exportToCsv, exportToJson } from '../lib/supabaseClient';
import {
  Database,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  FileSpreadsheet,
  FileCode,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';

interface TablesViewProps {
  project: ProjectConfig;
}

export const TablesView: React.FC<TablesViewProps> = ({ project }) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loadingTables, setLoadingTables] = useState<boolean>(true);
  const [loadingRows, setLoadingRows] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Modals & view mode
  const [inspectRow, setInspectRow] = useState<Record<string, any> | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [insertFormData, setInsertFormData] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load tables
  const loadTables = async () => {
    setLoadingTables(true);
    setErrorMsg(null);
    try {
      const data = await SupabaseManager.fetchTables(project);
      setTables(data);
      if (data.length > 0) {
        setSelectedTable(data[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch database tables');
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [project.id]);

  // Load rows when table or page changes
  const loadRows = async () => {
    if (!selectedTable) return;
    setLoadingRows(true);
    setErrorMsg(null);
    try {
      const { rows: fetchedRows, totalCount } = await SupabaseManager.fetchTableRows(
        project,
        selectedTable.name,
        {
          page,
          pageSize,
          search: searchQuery,
        }
      );
      setRows(fetchedRows);
      setTotalRows(totalCount);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error querying table data');
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [selectedTable?.name, searchQuery]);

  useEffect(() => {
    loadRows();
  }, [selectedTable?.name, page, searchQuery, project.id]);

  const handleOpenEdit = (row: Record<string, any>) => {
    setInspectRow(row);
    setEditFormData({ ...row });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTable || !inspectRow) return;
    try {
      const pk = selectedTable.columns.find(c => c.isPrimary)?.name || 'id';
      await SupabaseManager.updateRow(project, selectedTable.name, pk, inspectRow[pk], editFormData);
      setIsEditing(false);
      setInspectRow(null);
      loadRows();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDeleteRow = async (row: Record<string, any>) => {
    if (!selectedTable) return;
    const pk = selectedTable.columns.find(c => c.isPrimary)?.name || 'id';
    if (!window.confirm(`Delete row where ${pk} = ${row[pk]}?`)) return;

    try {
      await SupabaseManager.deleteRow(project, selectedTable.name, pk, row[pk]);
      setInspectRow(null);
      loadRows();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleInsertRow = async () => {
    if (!selectedTable) return;
    try {
      await SupabaseManager.insertRow(project, selectedTable.name, insertFormData);
      setIsInserting(false);
      setInsertFormData({});
      loadRows();
    } catch (err: any) {
      alert(`Insert failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Table Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {loadingTables ? (
          <div className="flex items-center gap-2 py-2 text-xs text-carbon-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-supa-green" /> Loading tables...
          </div>
        ) : (
          tables.map(tbl => {
            const isSelected = selectedTable?.name === tbl.name;
            return (
              <button
                key={tbl.name}
                onClick={() => setSelectedTable(tbl)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-supa-green/15 text-supa-green border-supa-green/40 shadow-glow-subtle font-semibold'
                    : 'bg-carbon-900/80 text-carbon-300 border-carbon-800 hover:border-carbon-700 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>{tbl.name}</span>
                {tbl.columns && (
                  <span className="text-[10px] opacity-60 font-sans">
                    {tbl.columns.length} cols
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Main Workspace for Selected Table */}
      {selectedTable && (
        <div className="carbon-card rounded-2xl p-4 sm:p-5 border border-carbon-800 space-y-4">
          
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-carbon-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search in ${selectedTable.name}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-carbon-900 border border-carbon-750 rounded-xl text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-carbon-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                onClick={loadRows}
                disabled={loadingRows}
                className="p-2 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-carbon-300 transition-colors"
                title="Refresh rows"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRows ? 'animate-spin text-supa-green' : ''}`} />
              </button>
            </div>

            {/* Right Buttons: Insert, Export, Layout Toggle */}
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center bg-carbon-900 border border-carbon-800 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'cards' ? 'bg-carbon-800 text-supa-green' : 'text-carbon-400 hover:text-white'
                  }`}
                  title="Card View (Mobile Optimized)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-carbon-800 text-supa-green' : 'text-carbon-400 hover:text-white'
                  }`}
                  title="Table Grid View"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Export Buttons */}
              <button
                onClick={() => exportToCsv(selectedTable.name, rows)}
                disabled={rows.length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-xs text-carbon-300 transition-colors"
                title="Export to CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => exportToJson(selectedTable.name, rows)}
                disabled={rows.length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-xs text-carbon-300 transition-colors"
                title="Export to JSON"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              {/* Insert Row */}
              <button
                onClick={() => {
                  setInsertFormData({});
                  setIsInserting(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-supa-green hover:bg-supa-light text-black text-xs font-bold transition-all shadow-glow-subtle"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Insert</span>
              </button>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Rows Display */}
          {loadingRows ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-carbon-400">
              <RefreshCw className="w-6 h-6 animate-spin text-supa-green" />
              <span className="text-xs font-mono">Querying PostgREST endpoint...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-carbon-500 space-y-2">
              <Database className="w-8 h-8 mx-auto opacity-30 text-supa-green" />
              <p className="text-xs">No records found in table "{selectedTable.name}"</p>
            </div>
          ) : viewMode === 'cards' ? (
            /* Cards View - Mobile First */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rows.map((row, idx) => {
                const pkCol = selectedTable.columns.find(c => c.isPrimary)?.name || 'id';
                const pkVal = row[pkCol] ?? `row-${idx}`;
                return (
                  <div
                    key={String(pkVal)}
                    onClick={() => {
                      setInspectRow(row);
                      setIsEditing(false);
                    }}
                    className="p-3.5 rounded-xl carbon-card-interactive cursor-pointer border border-carbon-800 hover:border-supa-green/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-carbon-800/60 pb-2">
                      <span className="text-[11px] font-mono text-supa-green font-semibold truncate max-w-[180px]">
                        {pkCol}: {String(pkVal)}
                      </span>
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(row)}
                          className="p-1 rounded text-carbon-400 hover:text-white hover:bg-carbon-800"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row)}
                          className="p-1 rounded text-carbon-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      {Object.entries(row)
                        .filter(([k]) => k !== pkCol)
                        .slice(0, 4)
                        .map(([key, val]) => (
                          <div key={key} className="flex items-start justify-between gap-2">
                            <span className="text-carbon-400 font-mono text-[10px] shrink-0 truncate max-w-[90px]">
                              {key}:
                            </span>
                            <span className="text-carbon-200 font-mono text-[11px] truncate text-right">
                              {typeof val === 'object' && val !== null
                                ? JSON.stringify(val)
                                : String(val ?? 'NULL')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Grid View */
            <div className="overflow-x-auto border border-carbon-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-carbon-900 border-b border-carbon-800">
                    <th className="p-2.5 text-[11px] text-carbon-400 font-semibold">Actions</th>
                    {selectedTable.columns.map(c => (
                      <th key={c.name} className="p-2.5 text-[11px] text-carbon-300 font-medium whitespace-nowrap">
                        {c.name}
                        <span className="text-[9px] text-carbon-500 ml-1">({c.type})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-800/60">
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-carbon-900/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setInspectRow(row);
                        setIsEditing(false);
                      }}
                    >
                      <td className="p-2.5 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(row)}
                          className="p-1 rounded text-carbon-400 hover:text-white hover:bg-carbon-800"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row)}
                          className="p-1 rounded text-carbon-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                      {selectedTable.columns.map(c => (
                        <td key={c.name} className="p-2.5 whitespace-nowrap text-carbon-200 max-w-[200px] truncate">
                          {typeof row[c.name] === 'object' && row[c.name] !== null
                            ? JSON.stringify(row[c.name])
                            : String(row[c.name] ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-3 border-t border-carbon-800/80 text-xs">
            <span className="text-carbon-400">
              Showing <span className="text-white font-mono">{rows.length}</span> records
              {totalRows > 0 && <span> of <span className="text-white font-mono">{totalRows}</span></span>}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-carbon-900 border border-carbon-800 text-carbon-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-carbon-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-carbon-300 text-xs px-2">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={rows.length < pageSize}
                className="p-1.5 rounded-lg bg-carbon-900 border border-carbon-800 text-carbon-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-carbon-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Row Inspector & Editor Modal */}
      {inspectRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg carbon-card rounded-2xl border border-carbon-700 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
              <h3 className="text-xs font-semibold text-white font-mono flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-supa-green" />
                {isEditing ? 'Edit Record' : 'Record Inspector'}
              </h3>
              <button
                onClick={() => {
                  setInspectRow(null);
                  setIsEditing(false);
                }}
                className="text-carbon-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                {selectedTable?.columns.map(c => (
                  <div key={c.name}>
                    <label className="block text-[11px] font-mono text-carbon-300 mb-1">
                      {c.name} {c.isPrimary && <span className="text-supa-green text-[9px]">(PK)</span>}
                    </label>
                    <input
                      type="text"
                      disabled={c.isPrimary}
                      value={
                        typeof editFormData[c.name] === 'object'
                          ? JSON.stringify(editFormData[c.name])
                          : editFormData[c.name] ?? ''
                      }
                      onChange={e => setEditFormData({ ...editFormData, [c.name]: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white disabled:opacity-50"
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 text-xs rounded-xl bg-carbon-800 text-carbon-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-2 text-xs rounded-xl bg-supa-green text-black font-bold shadow-glow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <pre className="p-3 rounded-xl bg-carbon-950 border border-carbon-850 text-xs font-mono text-carbon-200 overflow-x-auto max-h-72">
                  {JSON.stringify(inspectRow, null, 2)}
                </pre>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(inspectRow)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl bg-carbon-800 hover:bg-carbon-750 text-white border border-carbon-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Record
                  </button>
                  <button
                    onClick={() => handleDeleteRow(inspectRow)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insert Row Modal */}
      {isInserting && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg carbon-card rounded-2xl border border-carbon-700 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
              <h3 className="text-xs font-semibold text-white font-mono flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-supa-green" />
                Insert Row into `{selectedTable.name}`
              </h3>
              <button onClick={() => setIsInserting(false)} className="text-carbon-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedTable.columns.map(c => (
                <div key={c.name}>
                  <label className="block text-[11px] font-mono text-carbon-300 mb-1">
                    {c.name}
                    <span className="text-[10px] text-carbon-500 ml-1">({c.type})</span>
                  </label>
                  <input
                    type="text"
                    placeholder={c.defaultValue ? `Default: ${c.defaultValue}` : 'Enter value...'}
                    value={insertFormData[c.name] ?? ''}
                    onChange={e => setInsertFormData({ ...insertFormData, [c.name]: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-600 focus:outline-none focus:border-supa-green"
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsInserting(false)}
                  className="flex-1 py-2 text-xs rounded-xl bg-carbon-800 text-carbon-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsertRow}
                  className="flex-1 py-2 text-xs rounded-xl bg-supa-green text-black font-bold shadow-glow"
                >
                  Confirm Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
