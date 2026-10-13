import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProjectConfig, TableInfo, QueryResult, AuthUser, StorageBucket, StorageFile } from '../types';
import { DEMO_PROJECT, DEMO_TABLES, DEMO_ROWS, DEMO_AUTH_USERS, DEMO_STORAGE_BUCKETS, DEMO_FILES } from './demoData';

const STORAGE_KEY = 'supa_companion_projects';
const ACTIVE_PROJECT_KEY = 'supa_companion_active_id';

export class SupabaseManager {
  private static clientCache = new Map<string, SupabaseClient>();

  static getStoredProjects(): ProjectConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [DEMO_PROJECT];
      }
      const parsed = JSON.parse(data) as ProjectConfig[];
      if (!parsed.some(p => p.id === DEMO_PROJECT.id)) {
        parsed.unshift(DEMO_PROJECT);
      }
      return parsed;
    } catch {
      return [DEMO_PROJECT];
    }
  }

  static saveProjects(projects: ProjectConfig[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  }

  static getActiveProjectId(): string {
    return localStorage.getItem(ACTIVE_PROJECT_KEY) || DEMO_PROJECT.id;
  }

  static setActiveProjectId(id: string): void {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  }

  static getClient(project: ProjectConfig): SupabaseClient | null {
    if (project.isDemo) return null;
    const key = project.serviceRoleKey || project.anonKey;
    const cacheKey = `${project.url}_${key}`;

    if (!this.clientCache.has(cacheKey)) {
      try {
        const client = createClient(project.url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.clientCache.set(cacheKey, client);
      } catch (err) {
        console.error('Failed to init Supabase client', err);
        return null;
      }
    }
    return this.clientCache.get(cacheKey) || null;
  }

  static async testConnection(project: ProjectConfig): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    if (project.isDemo) {
      await new Promise(r => setTimeout(r, 120));
      return {
        success: true,
        latencyMs: 38,
        message: 'Connected to Acme Cloud Demo (Simulated ⚡)',
      };
    }

    try {
      const cleanUrl = project.url.replace(/\/+$/, '');
      const testEndpoint = `${cleanUrl}/rest/v1/`;
      const key = project.serviceRoleKey || project.anonKey;

      const res = await fetch(testEndpoint, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });

      const latencyMs = Math.round(performance.now() - start);

      if (res.ok || res.status === 200) {
        return { success: true, latencyMs, message: `Connected (${latencyMs}ms)` };
      } else {
        return {
          success: false,
          latencyMs,
          message: `HTTP ${res.status}: ${res.statusText || 'Authentication failed'}`,
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        success: false,
        latencyMs,
        message: err.message || 'Network connection error',
      };
    }
  }

  static async fetchTables(project: ProjectConfig): Promise<TableInfo[]> {
    if (project.isDemo) {
      return DEMO_TABLES;
    }

    try {
      const cleanUrl = project.url.replace(/\/+$/, '');
      const key = project.serviceRoleKey || project.anonKey;
      const res = await fetch(`${cleanUrl}/rest/v1/`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch OpenAPI definition');
      const swagger = await res.json();

      const tables: TableInfo[] = [];
      const definitions = swagger.definitions || {};

      for (const [tableName, def] of Object.entries(definitions) as [string, any][]) {
        if (tableName === 'rpc' || tableName.startsWith('_')) continue;
        const properties = def.properties || {};
        const columns = Object.entries(properties).map(([colName, colMeta]: [string, any]) => ({
          name: colName,
          type: colMeta.type || colMeta.format || 'text',
          isNullable: !(def.required && def.required.includes(colName)),
          defaultValue: colMeta.default || null,
          isPrimary: colName === 'id',
        }));

        tables.push({
          name: tableName,
          schema: 'public',
          columns,
          comment: def.description,
        });
      }

      return tables.length > 0 ? tables : DEMO_TABLES;
    } catch (e) {
      console.warn('Could not auto-introspect OpenAPI tables, falling back to basic list', e);
      return DEMO_TABLES;
    }
  }

  static async fetchTableRows(
    project: ProjectConfig,
    tableName: string,
    options: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: string;
      sortAsc?: boolean;
    } = {}
  ): Promise<{ rows: any[]; totalCount: number }> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 15;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    if (project.isDemo) {
      let rows = [...(DEMO_ROWS[tableName] || [])];
      if (options.search) {
        const q = options.search.toLowerCase();
        rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
      }
      if (options.sortBy) {
        const sortCol = options.sortBy;
        const mult = options.sortAsc === false ? -1 : 1;
        rows.sort((a, b) => {
          if (a[sortCol] < b[sortCol]) return -1 * mult;
          if (a[sortCol] > b[sortCol]) return 1 * mult;
          return 0;
        });
      }
      const totalCount = rows.length;
      return { rows: rows.slice(start, end + 1), totalCount };
    }

    const client = this.getClient(project);
    if (!client) throw new Error('Client not initialized');

    let query = client.from(tableName).select('*', { count: 'exact' });

    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.sortAsc ?? true });
    }

    query = query.range(start, end);

    const { data, count, error } = await query;
    if (error) throw error;

    return { rows: data || [], totalCount: count || (data ? data.length : 0) };
  }

  static async insertRow(project: ProjectConfig, tableName: string, rowData: Record<string, any>): Promise<any> {
    if (project.isDemo) {
      if (!DEMO_ROWS[tableName]) DEMO_ROWS[tableName] = [];
      const newRow = { id: `demo_${Date.now()}`, ...rowData };
      DEMO_ROWS[tableName].unshift(newRow);
      return newRow;
    }

    const client = this.getClient(project);
    if (!client) throw new Error('Client not initialized');
    const { data, error } = await client.from(tableName).insert(rowData).select().single();
    if (error) throw error;
    return data;
  }

  static async updateRow(
    project: ProjectConfig,
    tableName: string,
    primaryKey: string,
    primaryKeyValue: any,
    updatedData: Record<string, any>
  ): Promise<any> {
    if (project.isDemo) {
      const rows = DEMO_ROWS[tableName] || [];
      const idx = rows.findIndex(r => String(r[primaryKey]) === String(primaryKeyValue));
      if (idx !== -1) {
        DEMO_ROWS[tableName][idx] = { ...DEMO_ROWS[tableName][idx], ...updatedData };
        return DEMO_ROWS[tableName][idx];
      }
      return updatedData;
    }

    const client = this.getClient(project);
    if (!client) throw new Error('Client not initialized');
    const { data, error } = await client
      .from(tableName)
      .update(updatedData)
      .eq(primaryKey, primaryKeyValue)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteRow(
    project: ProjectConfig,
    tableName: string,
    primaryKey: string,
    primaryKeyValue: any
  ): Promise<void> {
    if (project.isDemo) {
      if (DEMO_ROWS[tableName]) {
        DEMO_ROWS[tableName] = DEMO_ROWS[tableName].filter(r => String(r[primaryKey]) !== String(primaryKeyValue));
      }
      return;
    }

    const client = this.getClient(project);
    if (!client) throw new Error('Client not initialized');
    const { error } = await client.from(tableName).delete().eq(primaryKey, primaryKeyValue);
    if (error) throw error;
  }

  static async executeSql(project: ProjectConfig, query: string): Promise<QueryResult> {
    const startTime = performance.now();
    const cleanSql = query.trim();

    if (project.isDemo) {
      await new Promise(r => setTimeout(r, 90));
      const lower = cleanSql.toLowerCase();

      // Check for simple demo queries
      for (const tableName of Object.keys(DEMO_ROWS)) {
        if (lower.includes(tableName)) {
          const rows = DEMO_ROWS[tableName] || [];
          const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id'];
          return {
            columns,
            rows,
            rowCount: rows.length,
            executionTimeMs: Math.round(performance.now() - startTime),
            error: null,
          };
        }
      }

      // Default mock result
      return {
        columns: ['query_status', 'affected_rows', 'carbon_engine'],
        rows: [{ query_status: 'SUCCESS', affected_rows: 1, carbon_engine: 'PostgreSQL 15.1 (SupaCompanion Simulated)' }],
        rowCount: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        error: null,
      };
    }

    const client = this.getClient(project);
    if (!client) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - startTime),
        error: 'Client not connected',
      };
    }

    try {
      // In Supabase, direct raw SQL from client is typically executed via an RPC function
      // e.g. supabase.rpc('exec_sql', { query: cleanSql })
      const { data, error } = await client.rpc('exec_sql', { query: cleanSql });
      const execTime = Math.round(performance.now() - startTime);

      if (error) {
        // Provide clear hint for user
        const errorMsg = error.message.includes('function')
          ? `${error.message}\n💡 Note: Supabase restricts direct SQL execution from client without a helper RPC or service role SQL endpoint. Use the Table Editor for direct PostgREST operations, or create an 'exec_sql(query text)' function in your Supabase SQL editor.`
          : error.message;

        return {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: execTime,
          error: errorMsg,
        };
      }

      const rows = Array.isArray(data) ? data : [data];
      const columns = rows.length > 0 && rows[0] && typeof rows[0] === 'object' ? Object.keys(rows[0]) : ['result'];

      return {
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs: execTime,
        error: null,
      };
    } catch (err: any) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - startTime),
        error: err.message,
      };
    }
  }

  static async fetchAuthUsers(project: ProjectConfig): Promise<AuthUser[]> {
    if (project.isDemo) {
      return DEMO_AUTH_USERS;
    }

    const client = this.getClient(project);
    if (!client) throw new Error('Client not initialized');

    if (!project.serviceRoleKey) {
      throw new Error('Service Role Key is required to view and manage Supabase Auth users. (Anon key is read-restricted by Supabase for security).');
    }

    try {
      const { data, error } = await client.auth.admin.listUsers();
      if (error) throw error;
      return (data.users || []).map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        role: u.role || 'authenticated',
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        provider: u.app_metadata?.provider || 'email',
        banned: (u as any).banned_until ? true : false,
        userMetadata: u.user_metadata,
        appMetadata: u.app_metadata,
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to list auth users');
    }
  }

  static async fetchBuckets(project: ProjectConfig): Promise<StorageBucket[]> {
    if (project.isDemo) {
      return DEMO_STORAGE_BUCKETS;
    }

    const client = this.getClient(project);
    if (!client) throw new Error('Client not initialized');

    const { data, error } = await client.storage.listBuckets();
    if (error) throw error;

    return (data || []).map(b => ({
      id: b.id,
      name: b.name,
      public: b.public,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
      fileSizeLimit: b.file_size_limit,
      allowedMimeTypes: b.allowed_mime_types,
    }));
  }

  static async fetchBucketFiles(project: ProjectConfig, bucketId: string): Promise<StorageFile[]> {
    if (project.isDemo) {
      return DEMO_FILES[bucketId] || [];
    }

    const client = this.getClient(project);
    if (!client) throw new Error('Client not initialized');

    const { data, error } = await client.storage.from(bucketId).list();
    if (error) throw error;

    return (data || []).map(f => ({
      name: f.name,
      id: f.id,
      updatedAt: f.updated_at,
      createdAt: f.created_at,
      lastAccessedAt: f.last_accessed_at,
      metadata: f.metadata,
    }));
  }

  static getPublicUrl(project: ProjectConfig, bucketId: string, filePath: string): string {
    if (project.isDemo) {
      return `https://demo-supa.supabase.co/storage/v1/object/public/${bucketId}/${filePath}`;
    }
    const client = this.getClient(project);
    if (!client) return '';
    const { data } = client.storage.from(bucketId).getPublicUrl(filePath);
    return data.publicUrl;
  }

  static async importProjectsFromToken(accessToken: string): Promise<ProjectConfig[]> {
    const cleanToken = accessToken.trim();
    if (!cleanToken) throw new Error('Please enter a valid Supabase Personal Access Token.');

    const res = await fetch('https://api.supabase.com/v1/projects', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized: Invalid Supabase Access Token.');
      }
      throw new Error(`Supabase Management API error: HTTP ${res.status}`);
    }

    const projectsData = await res.json();
    if (!Array.isArray(projectsData) || projectsData.length === 0) {
      throw new Error('No projects found in this Supabase account.');
    }

    const importedProjects: ProjectConfig[] = [];

    for (const p of projectsData) {
      let anonKey = '';
      let serviceRoleKey = '';

      try {
        const keysRes = await fetch(`https://api.supabase.com/v1/projects/${p.id}/api-keys`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });
        if (keysRes.ok) {
          const keys = await keysRes.json();
          const anon = keys.find((k: any) => k.name === 'anon');
          const service = keys.find((k: any) => k.name === 'service_role');
          if (anon) anonKey = anon.api_key;
          if (service) serviceRoleKey = service.api_key;
        }
      } catch (e) {
        console.warn(`Could not auto-fetch API keys for ${p.name}`, e);
      }

      importedProjects.push({
        id: p.id,
        name: p.name || p.id,
        url: `https://${p.id}.supabase.co`,
        anonKey: anonKey || 'placeholder_anon_key',
        serviceRoleKey: serviceRoleKey || undefined,
        tag: p.status === 'ACTIVE_HEALTHY' ? 'prod' : 'dev',
        createdAt: Date.now(),
      });
    }

    return importedProjects;
  }
}

export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(h => {
          const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJson(filename: string, rows: Record<string, any>[]): void {
  const jsonContent = JSON.stringify(rows, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
