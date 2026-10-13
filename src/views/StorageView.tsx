import React, { useState, useEffect } from 'react';
import { ProjectConfig, StorageBucket, StorageFile } from '../types';
import { SupabaseManager } from '../lib/supabaseClient';
import {
  HardDrive,
  Folder,
  File,
  FileImage,
  FileText,
  Copy,
  ExternalLink,
  RefreshCw,
  Lock,
  Globe,
  Check,
  X,
} from 'lucide-react';

interface StorageViewProps {
  project: ProjectConfig;
}

export const StorageView: React.FC<StorageViewProps> = ({ project }) => {
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<StorageBucket | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingBuckets, setLoadingBuckets] = useState<boolean>(true);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ file: StorageFile; url: string } | null>(null);

  const loadBuckets = async () => {
    setLoadingBuckets(true);
    try {
      const data = await SupabaseManager.fetchBuckets(project);
      setBuckets(data);
      if (data.length > 0) {
        setSelectedBucket(data[0]);
      }
    } catch (err: any) {
      console.error('Failed to load storage buckets', err);
    } finally {
      setLoadingBuckets(false);
    }
  };

  useEffect(() => {
    loadBuckets();
  }, [project.id]);

  const loadFiles = async () => {
    if (!selectedBucket) return;
    setLoadingFiles(true);
    try {
      const data = await SupabaseManager.fetchBucketFiles(project, selectedBucket.id);
      setFiles(data);
    } catch (err: any) {
      console.error('Failed to load bucket files', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [selectedBucket?.id, project.id]);

  const handleCopyUrl = (filePath: string) => {
    if (!selectedBucket) return;
    const url = SupabaseManager.getPublicUrl(project, selectedBucket.id, filePath);
    navigator.clipboard.writeText(url);
    setCopiedUrl(filePath);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handlePreview = (file: StorageFile) => {
    if (!selectedBucket) return;
    const url = SupabaseManager.getPublicUrl(project, selectedBucket.id, file.name);
    setPreviewFile({ file, url });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Bucket Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {loadingBuckets ? (
          <div className="flex items-center gap-2 py-2 text-xs text-carbon-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-supa-green" /> Loading buckets...
          </div>
        ) : (
          buckets.map(bucket => {
            const isSelected = selectedBucket?.id === bucket.id;
            return (
              <button
                key={bucket.id}
                onClick={() => setSelectedBucket(bucket)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-supa-green/15 text-supa-green border-supa-green/40 shadow-glow-subtle font-semibold'
                    : 'bg-carbon-900/80 text-carbon-300 border-carbon-800 hover:border-carbon-700 hover:text-white'
                }`}
              >
                <Folder className="w-3.5 h-3.5 shrink-0" />
                <span>{bucket.name}</span>
                {bucket.public ? (
                  <span className="text-[9px] px-1 rounded bg-supa-green/10 text-supa-green">public</span>
                ) : (
                  <span className="text-[9px] px-1 rounded bg-carbon-800 text-carbon-400">private</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Bucket Details & Files List */}
      {selectedBucket && (
        <div className="carbon-card rounded-2xl p-4 sm:p-5 border border-carbon-800 space-y-4 shadow-2xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white font-mono">{selectedBucket.name}</h3>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                    selectedBucket.public
                      ? 'bg-supa-green/15 text-supa-green'
                      : 'bg-carbon-800 text-carbon-400'
                  }`}
                >
                  {selectedBucket.public ? 'Public Bucket' : 'Private Storage'}
                </span>
              </div>
              <p className="text-[11px] text-carbon-400 mt-0.5">
                {files.length} objects stored
              </p>
            </div>

            <button
              onClick={loadFiles}
              disabled={loadingFiles}
              className="p-2 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-carbon-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin text-supa-green' : ''}`} />
            </button>
          </div>

          {/* Files Grid */}
          {loadingFiles ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-carbon-400">
              <RefreshCw className="w-6 h-6 animate-spin text-supa-green" />
              <span className="text-xs font-mono">Loading bucket objects...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-carbon-500 space-y-2">
              <HardDrive className="w-8 h-8 mx-auto opacity-30 text-supa-green" />
              <p className="text-xs">No files in this bucket</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map(file => {
                const isImage = file.name.match(/\.(png|jpe?g|webp|gif|svg)$/i);
                const isCopied = copiedUrl === file.name;

                return (
                  <div
                    key={file.name}
                    className="p-3 rounded-xl carbon-card-interactive border border-carbon-800 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-carbon-900 border border-carbon-800 shrink-0 text-supa-green">
                        {isImage ? <FileImage className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-mono font-medium text-white block truncate" title={file.name}>
                          {file.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-carbon-400 font-mono mt-0.5">
                          <span>{formatFileSize(file.metadata?.size)}</span>
                          {file.metadata?.mimetype && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[80px]">{file.metadata.mimetype}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-carbon-800/60">
                      {isImage && (
                        <button
                          onClick={() => handlePreview(file)}
                          className="px-2 py-1 text-[11px] rounded-lg bg-carbon-900 text-carbon-300 hover:text-white border border-carbon-800"
                        >
                          Preview
                        </button>
                      )}

                      {selectedBucket.public && (
                        <button
                          onClick={() => handleCopyUrl(file.name)}
                          className={`flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded-lg transition-colors border ${
                            isCopied
                              ? 'bg-supa-green/15 text-supa-green border-supa-green/30'
                              : 'bg-carbon-900 text-carbon-300 hover:text-white border-carbon-800'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg carbon-card rounded-2xl border border-carbon-700 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
              <span className="text-xs font-mono text-white truncate max-w-[280px]">
                {previewFile.file.name}
              </span>
              <button onClick={() => setPreviewFile(null)} className="text-carbon-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-carbon-950 rounded-xl overflow-hidden flex items-center justify-center max-h-80 border border-carbon-850">
              <img
                src={previewFile.url}
                alt={previewFile.file.name}
                className="max-h-72 max-w-full object-contain"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <a
                href={previewFile.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-carbon-800 text-white text-xs font-medium hover:bg-carbon-750"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Original
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
