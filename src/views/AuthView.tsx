import React, { useState, useEffect } from 'react';
import { ProjectConfig, AuthUser } from '../types';
import { SupabaseManager } from '../lib/supabaseClient';
import {
  Users,
  Search,
  Key,
  ShieldAlert,
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Lock,
  ChevronRight,
  X,
  CheckCircle,
} from 'lucide-react';

interface AuthViewProps {
  project: ProjectConfig;
}

export const AuthView: React.FC<AuthViewProps> = ({ project }) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');

  const loadUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await SupabaseManager.fetchAuthUsers(project);
      setUsers(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch auth users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [project.id]);

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q)) ||
      (u.provider && u.provider.toLowerCase().includes(q))
    );
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    alert(`Invitation sent to ${inviteEmail} (Simulated ⚡)`);
    setIsInviteOpen(false);
    setInviteEmail('');
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Warning Banner if Service Role is missing */}
      {!project.isDemo && !project.serviceRoleKey && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
          <Key className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-semibold text-white">Service Role Key Required:</span>
            <p className="mt-0.5 text-amber-300/80 leading-relaxed">
              Supabase restricts the `auth.users` administrative table for security. To view and manage users, add your project's **Service Role Key** in the Project Settings.
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="carbon-card rounded-2xl p-4 sm:p-5 border border-carbon-800 space-y-4 shadow-2xl">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-carbon-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email, provider or UUID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-carbon-900 border border-carbon-750 rounded-xl text-white placeholder-carbon-500 focus:outline-none focus:border-supa-green font-mono"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2 rounded-xl bg-carbon-900 hover:bg-carbon-800 border border-carbon-800 text-carbon-300 transition-colors"
              title="Refresh users"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-supa-green' : ''}`} />
            </button>

            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-supa-green hover:bg-supa-light text-black text-xs font-bold transition-all shadow-glow-subtle"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Invite User</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-carbon-400">
            <RefreshCw className="w-6 h-6 animate-spin text-supa-green" />
            <span className="text-xs font-mono">Fetching Supabase Auth directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-carbon-500 space-y-2">
            <Users className="w-8 h-8 mx-auto opacity-30 text-supa-green" />
            <p className="text-xs">No registered users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="p-3.5 rounded-xl carbon-card-interactive cursor-pointer border border-carbon-800 hover:border-supa-green/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-carbon-800 to-carbon-900 border border-carbon-700 flex items-center justify-center shrink-0 text-xs font-mono font-bold text-supa-green">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'US'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                        {user.email || user.phone || 'Unnamed user'}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase bg-carbon-800 text-carbon-300 border border-carbon-700">
                        {user.provider}
                      </span>
                    </div>
                    <span className="text-[10px] text-carbon-400 font-mono truncate block max-w-[200px]">
                      {user.id}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-carbon-500 shrink-0" />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg carbon-card rounded-2xl border border-carbon-700 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-supa-green" />
                <h3 className="text-xs font-semibold text-white">User Overview</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-carbon-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-carbon-400 uppercase">User ID (UUID)</span>
                <p className="p-2 rounded-lg bg-carbon-900 text-white border border-carbon-800 mt-1 select-all break-all">
                  {selectedUser.id}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-carbon-400 uppercase">Email</span>
                <p className="p-2 rounded-lg bg-carbon-900 text-white border border-carbon-800 mt-1">
                  {selectedUser.email || 'None'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-carbon-400 uppercase">Provider</span>
                  <p className="p-2 rounded-lg bg-carbon-900 text-white border border-carbon-800 mt-1">
                    {selectedUser.provider}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-carbon-400 uppercase">Role</span>
                  <p className="p-2 rounded-lg bg-carbon-900 text-white border border-carbon-800 mt-1">
                    {selectedUser.role}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-carbon-400 uppercase">Registered At</span>
                <p className="p-2 rounded-lg bg-carbon-900 text-white border border-carbon-800 mt-1">
                  {selectedUser.createdAt}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-carbon-400 uppercase">Metadata JSON</span>
                <pre className="p-2.5 rounded-lg bg-carbon-950 text-carbon-200 border border-carbon-800 mt-1 max-h-40 overflow-y-auto text-[11px]">
                  {JSON.stringify(selectedUser.userMetadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md carbon-card rounded-2xl border border-carbon-700 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-supa-green" /> Invite New User
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-carbon-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-carbon-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="developer@startup.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-carbon-900 border border-carbon-750 text-white placeholder-carbon-600 focus:outline-none focus:border-supa-green"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-1 py-2 text-xs rounded-xl bg-carbon-800 text-carbon-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs rounded-xl bg-supa-green text-black font-bold shadow-glow"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
