export type ProjectTag = 'prod' | 'staging' | 'dev' | 'demo';

export interface ProjectConfig {
  id: string;
  name: string;
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  tag: ProjectTag;
  isDemo?: boolean;
  createdAt: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue?: string | null;
  isPrimary?: boolean;
}

export interface TableInfo {
  name: string;
  schema: string;
  rowCount?: number;
  columns: ColumnInfo[];
  comment?: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string | null;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  createdAt: string;
  lastSignInAt?: string | null;
  provider: string;
  isBanned?: boolean;
  appMetadata?: Record<string, any>;
  userMetadata?: Record<string, any>;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  fileSizeLimit?: number | null;
  allowedMimeTypes?: string[] | null;
}

export interface StorageFile {
  name: string;
  id?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  lastAccessedAt?: string | null;
  metadata?: Record<string, any> | null;
}

export type ActiveTab = 'tables' | 'sql' | 'auth' | 'storage' | 'metrics';
