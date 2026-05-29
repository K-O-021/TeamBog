import React, { useState, useMemo, useEffect } from 'react';
import { Users, Shield, Mail, X, Archive, RotateCcw, GraduationCap, Settings, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';

/* ==========================================================================
   1. REUSABLE ARCHIVE BASE COMPONENT (Now safely inlined inside this file)
   ========================================================================== */
interface ArchiveBaseProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nodeName: string;
  actionType: 'archive' | 'restore';
  nodeType?: string;
}

const ArchiveBase: React.FC<ArchiveBaseProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nodeName,
  actionType,
  nodeType = "Identity Node"
}) => {
  const isRestore = actionType === 'restore';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`bg-white rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl border ${
              isRestore ? 'border-emerald-100' : 'border-rose-100'
            } z-10 overflow-hidden`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 ${
                isRestore ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {isRestore ? <RotateCcw size={20} /> : <ShieldAlert size={20} className="animate-pulse" />}
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                {isRestore ? 'Restore' : 'Archive'} <span className={isRestore ? 'text-emerald-600' : 'text-rose-600'}>{nodeType}</span>
              </h3>
            </div>

            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
              {isRestore ? (
                <>Are you sure you want to re-initialize <span className="font-black text-slate-800 italic">{nodeName}</span>? This will hot-plug their clearance levels back into the live active network directories.</>
              ) : (
                <>Are you sure you want to decouple <span className="font-black text-slate-800 italic">{nodeName}</span>? This immediately cuts live access pipelines and offloads their metrics into isolated cold storage.</>
              )}
            </p>

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 bg-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500 active:scale-95"
              >
                Abort Protocol
              </button>
              <button 
                type="button" 
                onClick={onConfirm} 
                className={`flex-1 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                  isRestore ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isRestore ? 'Re-Plug Live Link' : 'Confirm Cold Storage'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


/* ==========================================================================
   2. MAIN ADMIN WORKSPACE DASHBOARD
   ========================================================================== */
const AdminUsers = ({ globalSearchTerm }: { globalSearchTerm: string }) => {
  const { users = [], students = [], updateUser, archiveUser } = useApp();
  const [filterRole, setFilterRole] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', subject: '', teacherId: '' });
  
  // Archival pipeline orchestration state
  const [lifecycleTarget, setLifecycleTarget] = useState<any | null>(null);
  const [lifecycleAction, setLifecycleAction] = useState<'archive' | 'restore'>('archive');

  // Utility to trigger notifications from Admin to Target Users (Teacher/Parent)
  const triggerAdminNotification = async (targetEmail: string, title: string, body: string) => {
    try {
      await fetch(import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:8080/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@sned-link.edu',
          senderRole: 'admin',
          targetEmail,
          title,
          body,
          url: '/settings'
        })
      });
    } catch (error) {
      console.error('Failed to trigger admin notification:', error);
    }
  };

  const handleOpenLifecycleModal = (user: any, action: 'archive' | 'restore') => {
    setLifecycleTarget(user);
    setLifecycleAction(action);
  };

  const handleConfirmLifecycleAction = () => {
    if (!lifecycleTarget) return;

    if (lifecycleAction === 'archive') {
      archiveUser?.(lifecycleTarget.email);
      triggerAdminNotification(
        lifecycleTarget.email,
        'Operational Status Update',
        'Your node clearance has been offloaded to cold storage. Access pipelines are now decoupled.'
      );
      toast.success(`Node Archived: ${lifecycleTarget.name || 'Target'} assigned to cold storage registry.`);
    } else {
      updateUser?.(lifecycleTarget.email, { status: 'active' });
      triggerAdminNotification(
        lifecycleTarget.email,
        'Operational Status Update',
        'Your node has been re-initialized into the live active network directories.'
      );
      toast.success(`Node Restored: Hot-plug successful for ${lifecycleTarget.name || 'Target'}.`);
    }
    setLifecycleTarget(null);
  };

  const stats = useMemo(() => [
    { label: 'Live Mainframe Nodes', value: users.filter(u => (u?.status || 'active') === 'active').length.toString(), icon: Users, color: 'text-[#7B1C2A]', bg: 'bg-[#F7ECEE]' },
    { label: 'Cold Storage Vaults', value: users.filter(u => u?.status === 'archived').length.toString(), icon: Archive, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Monitored Learners', value: students.length.toString(), icon: GraduationCap, color: 'text-[#C49A3C]', bg: 'bg-amber-50' },
  ], [users, students]);

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    
    const userStatus = u.status || 'active';
    const userName = String(u.name || '').toLowerCase();
    const userEmail = String(u.email || '').toLowerCase();
    const searchTarget = String(globalSearchTerm || '').toLowerCase();

    return (
      userStatus === statusFilter && 
      (userName.includes(searchTarget) || userEmail.includes(searchTarget)) &&
      (filterRole === 'all' || u.role === filterRole)
    );
  });

  // Institutional Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [filterRole, statusFilter, globalSearchTerm]);

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({ 
      name: user?.name || '', 
      email: user?.email || '', 
      role: user?.role || '',
      subject: user?.subject || '',
      teacherId: user?.teacherId || ''
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser?.(editingUser.email, editForm);
    triggerAdminNotification(
      editingUser.email,
      'Credential Sync',
      'Your identity parameters and clearance protocols have been synchronized by the Mainframe Host.'
    );
    toast.success(`Node Synchronized: Credentials updated for ${editForm.name}.`);
    setEditingUser(null);
  };

  return (
    <div
      className="space-y-8 animate-in fade-in duration-500"
      style={{ fontFamily: "'Georgia','Times New Roman',serif", background: '#FBF7F2', minHeight: '100vh' }}
    >
      {/* 📊 GLOBAL METRICS GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🗂 DIRECTORY INTERFACE CARD */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
          {currentPage === 1 && (
            <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">
              User Matrix <span className={statusFilter === 'archived' ? 'text-rose-600' : 'text-[#7B1C2A]'}>[{statusFilter.toUpperCase()}]</span>
            </h3>
          )}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer ${
                statusFilter === 'archived' 
                  ? 'bg-slate-50 border-slate-200 text-indigo-600 ring-indigo-500/10 focus:ring-4' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 ring-[#7B1C2A]/10 focus:ring-4'
              }`}
            >
              <option value="active">Active Nodes</option>
              <option value="archived">Archived Vaults</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:ring-4 ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Clearances</option>
              <option value="admin">Infrastructure / Admin</option>
              <option value="teacher">Node Controllers / Teachers</option>
              <option value="parent">Guardians / Parents</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity Parameters</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Clearance Matrix</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Signal State</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sync Pipeline</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Config</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <div className="relative mb-4">
                        <motion.div 
                          animate={{ scale: [0.95, 1.1, 0.95], opacity: [0.1, 0.3, 0.1] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className={`absolute inset-0 rounded-full scale-150 blur-xl ${statusFilter === 'archived' ? 'bg-rose-200' : 'bg-slate-200'}`}
                        />
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center relative z-10 shadow-inner">
                          <Archive size={26} className="stroke-[1.5]" />
                        </div>
                      </div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest italic">
                        No {statusFilter} Registry Clusters Located
                      </h4>
                      <p className="text-[10px] text-slate-400 max-w-xs mt-1.5 font-bold uppercase tracking-tight leading-normal">
                        Queries returned empty parameters. Tweak operational scope filters or initialize data syncing nodes.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => (
                  <tr key={u.id || `${u.email}-${idx}`} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black border uppercase text-xs transition-colors ${
                          statusFilter === 'archived' 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {u.name ? u.name[0] : '?'}
                        </div>
                        <div>
                          <p className={`text-sm font-black uppercase italic tracking-tight ${statusFilter === 'archived' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {u.name || 'Unknown Node'}
                          </p>
                          <p className="text-[9px] text-slate-400 uppercase font-black">
                            UUID: {u.email ? u.email.split('@')[0].toUpperCase() : 'UNKNOWN'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest ${
                        statusFilter === 'archived' ? 'bg-slate-50 text-slate-400 border-slate-200/60' :
                        u.role === 'admin' ? 'bg-[#F7ECEE] text-[#7B1C2A] border-[#e8d8da]' :
                        u.role === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {u.subject || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-[10px] text-slate-500">
                        {u.teacherId || u.id || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {statusFilter === 'archived' ? (
                        <div className="flex items-center gap-2 text-rose-500">
                          <ShieldAlert size={14} className="animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-rose-400">
                            [COLD ENCRYPTION]
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <motion.div 
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`w-2 h-2 rounded-full ${u.role === 'admin' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]'}`} 
                          />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                            {u.role === 'admin' ? 'Mainframe Host' : 'Live Sync: [STABLE]'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[11px] font-bold flex items-center gap-2 italic ${statusFilter === 'archived' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Mail size={12} className="text-slate-300" /> {u.email || 'Void Datastream'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleEditClick(u)}
                        disabled={statusFilter === 'archived'}
                        className="p-2.5 hover:bg-[#F7ECEE] hover:text-[#7B1C2A] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit rounded-xl transition-all border border-transparent hover:border-[#e8d8da]"
                      >
                        <Settings size={18} />
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {statusFilter === 'active' ? (
                        <button 
                          onClick={() => handleOpenLifecycleModal(u, 'archive')} 
                          className="p-2.5 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100" 
                          title="Decommission Node"
                        >
                          <Archive size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOpenLifecycleModal(u, 'restore')} 
                          className="p-2.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-100" 
                          title="Re-Initialize Node"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Neural Pagination Interface */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex justify-center items-center gap-2 bg-slate-50/30">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-all shadow-sm"
            >
              Prev Node
            </button>
            <span className="text-[10px] font-black text-[#7B1C2A] uppercase tracking-[0.2em] px-6">Cluster {currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-all shadow-sm"
            >
              Next Node
            </button>
          </div>
        )}

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operational Directory Endpoint • Diagnostics Healthy</p>
        </div>
      </div>

      {/* ✨ CONFIG EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl border border-emerald-100">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute right-6 top-6 p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-all"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black mb-6 uppercase italic tracking-tighter text-slate-900">Modify Identity <span className="text-emerald-600">Node</span></h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Identity Variant</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-4 ring-emerald-500/10 transition-all font-bold text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Institutional Datastream</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-4 ring-emerald-500/10 transition-all font-bold text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Clearance Protocol</label>
                <select 
                  value={editForm.role}
                  onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-4 ring-emerald-500/10 transition-all font-bold text-xs appearance-none"
                >
                  <option value="admin">Infrastructure Master / Admin</option>
                  <option value="teacher">Operational Controller / Teacher</option>
                  <option value="parent">Assigned Guardian / Parent</option>
                </select>
              </div>
              {(editForm.role === 'teacher' || editForm.role === 'adviser') && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Assigned Subject</label>
                    <input 
                      type="text" 
                      value={editForm.subject}
                      onChange={e => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-4 ring-emerald-500/10 transition-all font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Teacher ID</label>
                    <input 
                      type="text" 
                      value={editForm.teacherId}
                      onChange={e => setEditForm(prev => ({ ...prev, teacherId: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-4 ring-emerald-500/10 transition-all font-bold text-xs"
                    />
                  </div>
                </>
              )}
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 rounded-2xl border-2 border-slate-50 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-950 text-emerald-400 font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Commit Configuration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✨ REUSABLE ACTION INTERFACE CALL (ARCHIVE & RESTORE) */}
      <ArchiveBase 
        isOpen={Boolean(lifecycleTarget)}
        onClose={() => setLifecycleTarget(null)}
        onConfirm={handleConfirmLifecycleAction}
        nodeName={lifecycleTarget?.name || ''}
        actionType={lifecycleAction}
        nodeType="Identity Node"
      />
    </div>
  );
};

export default AdminUsers;