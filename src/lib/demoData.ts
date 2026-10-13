import { TableInfo, AuthUser, StorageBucket, StorageFile } from '../types';

export const DEMO_PROJECT = {
  id: 'demo-project-carbon',
  name: 'Acme Cloud (Demo)',
  url: 'https://demo-supa.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key-supacompanion',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-service-role-supacompanion',
  tag: 'demo' as const,
  isDemo: true,
  createdAt: Date.now() - 86400000 * 14,
};

export const DEMO_TABLES: TableInfo[] = [
  {
    name: 'users_profiles',
    schema: 'public',
    rowCount: 24,
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isPrimary: true },
      { name: 'username', type: 'text', isNullable: false },
      { name: 'full_name', type: 'text', isNullable: true },
      { name: 'avatar_url', type: 'text', isNullable: true },
      { name: 'tier', type: 'text', isNullable: false, defaultValue: "'pro'" },
      { name: 'credits', type: 'int4', isNullable: false, defaultValue: '100' },
      { name: 'created_at', type: 'timestamptz', isNullable: false },
    ],
  },
  {
    name: 'orders',
    schema: 'public',
    rowCount: 86,
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isPrimary: true },
      { name: 'customer_email', type: 'text', isNullable: false },
      { name: 'amount', type: 'numeric', isNullable: false },
      { name: 'currency', type: 'text', isNullable: false, defaultValue: "'USD'" },
      { name: 'status', type: 'text', isNullable: false, defaultValue: "'completed'" },
      { name: 'created_at', type: 'timestamptz', isNullable: false },
    ],
  },
  {
    name: 'api_keys',
    schema: 'public',
    rowCount: 12,
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isPrimary: true },
      { name: 'name', type: 'text', isNullable: false },
      { name: 'prefix', type: 'text', isNullable: false },
      { name: 'is_active', type: 'bool', isNullable: false, defaultValue: 'true' },
      { name: 'last_used_at', type: 'timestamptz', isNullable: true },
    ],
  },
  {
    name: 'audit_logs',
    schema: 'public',
    rowCount: 320,
    columns: [
      { name: 'id', type: 'bigint', isNullable: false, isPrimary: true },
      { name: 'action', type: 'text', isNullable: false },
      { name: 'actor', type: 'text', isNullable: false },
      { name: 'ip_address', type: 'inet', isNullable: true },
      { name: 'timestamp', type: 'timestamptz', isNullable: false },
    ],
  },
];

export const DEMO_ROWS: Record<string, Record<string, any>[]> = {
  users_profiles: [
    {
      id: '8a24c5b1-f92e-4375-8eb3-51829e248b11',
      username: 'alex_carbon',
      full_name: 'Alexandre Mercer',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128',
      tier: 'enterprise',
      credits: 2450,
      created_at: '2026-03-12T08:14:22Z',
    },
    {
      id: 'e49a1738-410a-4a57-b28e-6e467cf89704',
      username: 'sarah_dev',
      full_name: 'Sarah Chen',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128',
      tier: 'pro',
      credits: 500,
      created_at: '2026-04-01T12:00:00Z',
    },
    {
      id: 'b17849c2-5781-420a-8ca1-628f8f94726e',
      username: 'dev_marcus',
      full_name: 'Marcus Vance',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128',
      tier: 'free',
      credits: 45,
      created_at: '2026-04-10T19:35:10Z',
    },
    {
      id: 'fa8201de-8419-48bb-bb19-4182937501bb',
      username: 'elena_ai',
      full_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128',
      tier: 'pro',
      credits: 890,
      created_at: '2026-04-18T10:21:40Z',
    },
    {
      id: '9012bb84-aa12-4581-99ee-781923057199',
      username: 'tariq_cloud',
      full_name: 'Tariq Al-Mansoor',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128',
      tier: 'enterprise',
      credits: 9800,
      created_at: '2026-05-02T14:45:00Z',
    },
  ],
  orders: [
    {
      id: 'ord_91823759-4281',
      customer_email: 'sarah.chen@techcorp.io',
      amount: 149.00,
      currency: 'USD',
      status: 'completed',
      created_at: '2026-06-01T11:24:00Z',
    },
    {
      id: 'ord_81729471-1029',
      customer_email: 'alex@mercerlabs.com',
      amount: 999.00,
      currency: 'USD',
      status: 'completed',
      created_at: '2026-06-02T16:10:00Z',
    },
    {
      id: 'ord_71625344-9981',
      customer_email: 'john.doe@gmail.com',
      amount: 29.00,
      currency: 'USD',
      status: 'processing',
      created_at: '2026-06-03T09:05:00Z',
    },
    {
      id: 'ord_61524333-7762',
      customer_email: 'crypto.builder@proton.me',
      amount: 499.00,
      currency: 'USD',
      status: 'refunded',
      created_at: '2026-06-03T18:40:00Z',
    },
  ],
  api_keys: [
    {
      id: 'key_1928374-uuid',
      name: 'Production Webhook Key',
      prefix: 'sk_live_9a8...',
      is_active: true,
      last_used_at: '2026-06-04T07:11:00Z',
    },
    {
      id: 'key_2837491-uuid',
      name: 'Mobile App Staging',
      prefix: 'sk_test_41c...',
      is_active: true,
      last_used_at: '2026-06-03T22:30:10Z',
    },
    {
      id: 'key_3948572-uuid',
      name: 'Analytics ETL Worker',
      prefix: 'sk_live_17e...',
      is_active: false,
      last_used_at: '2026-05-19T14:15:00Z',
    },
  ],
  audit_logs: [
    {
      id: 10421,
      action: 'auth.user.login',
      actor: 'sarah.chen@techcorp.io',
      ip_address: '192.168.1.104',
      timestamp: '2026-06-04T08:15:20Z',
    },
    {
      id: 10422,
      action: 'table.row.insert',
      actor: 'system.worker',
      ip_address: '10.0.4.21',
      timestamp: '2026-06-04T08:16:01Z',
    },
    {
      id: 10423,
      action: 'storage.file.upload',
      actor: 'alex_carbon',
      ip_address: '172.56.21.90',
      timestamp: '2026-06-04T08:20:45Z',
    },
  ],
};

export const DEMO_AUTH_USERS: AuthUser[] = [
  {
    id: '8a24c5b1-f92e-4375-8eb3-51829e248b11',
    email: 'alex@mercerlabs.com',
    role: 'authenticated',
    provider: 'github',
    createdAt: '2026-03-12T08:14:22Z',
    lastSignInAt: '2026-06-04T06:12:10Z',
    userMetadata: { username: 'alex_carbon', full_name: 'Alexandre Mercer' },
    appMetadata: { provider: 'github', providers: ['github'] },
  },
  {
    id: 'e49a1738-410a-4a57-b28e-6e467cf89704',
    email: 'sarah.chen@techcorp.io',
    role: 'authenticated',
    provider: 'google',
    createdAt: '2026-04-01T12:00:00Z',
    lastSignInAt: '2026-06-04T08:15:20Z',
    userMetadata: { full_name: 'Sarah Chen' },
    appMetadata: { provider: 'google', providers: ['google'] },
  },
  {
    id: 'b17849c2-5781-420a-8ca1-628f8f94726e',
    email: 'marcus.v@proton.me',
    phone: '+1 415-555-0199',
    role: 'authenticated',
    provider: 'email',
    createdAt: '2026-04-10T19:35:10Z',
    lastSignInAt: '2026-05-28T11:04:00Z',
    userMetadata: { full_name: 'Marcus Vance' },
    appMetadata: { provider: 'email', providers: ['email'] },
  },
  {
    id: 'fa8201de-8419-48bb-bb19-4182937501bb',
    email: 'elena.rostova@ai-startup.co',
    role: 'authenticated',
    provider: 'github',
    createdAt: '2026-04-18T10:21:40Z',
    lastSignInAt: '2026-06-03T19:42:00Z',
    userMetadata: { full_name: 'Elena Rostova' },
    appMetadata: { provider: 'github', providers: ['github'] },
  },
];

export const DEMO_STORAGE_BUCKETS: StorageBucket[] = [
  {
    id: 'avatars',
    name: 'avatars',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-05-12T15:20:00Z',
  },
  {
    id: 'product-assets',
    name: 'product-assets',
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: null,
    createdAt: '2026-03-01T14:30:00Z',
    updatedAt: '2026-06-01T09:12:00Z',
  },
  {
    id: 'invoices-private',
    name: 'invoices-private',
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf'],
    createdAt: '2026-03-15T18:00:00Z',
    updatedAt: '2026-06-02T11:45:00Z',
  },
];

export const DEMO_FILES: Record<string, StorageFile[]> = {
  avatars: [
    {
      id: 'f1',
      name: 'alex-avatar-2026.png',
      createdAt: '2026-05-10T12:00:00Z',
      updatedAt: '2026-05-10T12:00:00Z',
      metadata: { size: 142800, mimetype: 'image/png' },
    },
    {
      id: 'f2',
      name: 'sarah-profile.webp',
      createdAt: '2026-05-18T16:20:00Z',
      updatedAt: '2026-05-18T16:20:00Z',
      metadata: { size: 84320, mimetype: 'image/webp' },
    },
    {
      id: 'f3',
      name: 'marcus_default.jpg',
      createdAt: '2026-05-22T08:14:00Z',
      updatedAt: '2026-05-22T08:14:00Z',
      metadata: { size: 210400, mimetype: 'image/jpeg' },
    },
  ],
  'product-assets': [
    {
      id: 'pa1',
      name: 'hero-banner-4k.png',
      createdAt: '2026-05-01T10:00:00Z',
      updatedAt: '2026-05-01T10:00:00Z',
      metadata: { size: 2450000, mimetype: 'image/png' },
    },
    {
      id: 'pa2',
      name: 'mobile-app-mockup.svg',
      createdAt: '2026-05-04T14:10:00Z',
      updatedAt: '2026-05-04T14:10:00Z',
      metadata: { size: 48200, mimetype: 'image/svg+xml' },
    },
  ],
  'invoices-private': [
    {
      id: 'inv1',
      name: 'inv_2026_06_techcorp.pdf',
      createdAt: '2026-06-01T11:25:00Z',
      updatedAt: '2026-06-01T11:25:00Z',
      metadata: { size: 384000, mimetype: 'application/pdf' },
    },
    {
      id: 'inv2',
      name: 'inv_2026_06_mercer.pdf',
      createdAt: '2026-06-02T16:11:00Z',
      updatedAt: '2026-06-02T16:11:00Z',
      metadata: { size: 412000, mimetype: 'application/pdf' },
    },
  ],
};
