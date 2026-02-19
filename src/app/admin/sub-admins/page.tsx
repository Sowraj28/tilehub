'use client';
import { useEffect, useState } from 'react';
import type { SubAdmin } from '@/types';

export default function SubAdminsPage() {
  const [list, setList] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'delete' | null>(null);
  const [selected, setSelected] = useState<SubAdmin | null>(null);
  const [form, setForm] = useState({ username: '', passKey: '', displayName: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassKeys, setShowPassKeys] = useState<Record<string, boolean>>({});

  useEffect(() => { load(); }, []);

  const load = () => {
    fetch('/api/sub-admins')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setList(d.data);
        setLoading(false);
      });
  };

  const handleCreate = async () => {
    setSaving(true); setError('');
    try {
      const r = await fetch('/api/sub-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        load();
        setModal(null);
        setForm({ username: '', passKey: '', displayName: '' });
      } else {
        setError(d.error || 'Failed to create');
      }
    } catch { setError('Network error'); }
    setSaving(false);
  };

  const handleToggle = async (sa: SubAdmin) => {
    await fetch(`/api/sub-admins/${sa.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !sa.isActive }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/sub-admins/${selected.id}`, { method: 'DELETE' });
    load();
    setModal(null);
    setSaving(false);
  };

  const togglePassKey = (id: string) =>
    setShowPassKeys((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sub Admins</h1>
          <p className="page-subtitle">{list.length} sub admin accounts</p>
        </div>
        <button
          onClick={() => { setForm({ username: '', passKey: '', displayName: '' }); setError(''); setModal('add'); }}
          className="btn-primary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Create Sub Admin
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-4 flex gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-brand-purple-light shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="text-sm">
          <p className="text-brand-purple-light font-medium">Sub Admin Portal</p>
          <p className="text-brand-muted mt-0.5">
            Sub admins log in at <code className="bg-brand-black-4 px-1.5 py-0.5 rounded text-xs">/subadmin/login</code> using their{' '}
            <strong className="text-brand-text">username</strong> and <strong className="text-brand-text">pass key</strong>.
            They can scan QR codes, view stock, and create export bills.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-black-4">
                  <th className="table-header">Display Name</th>
                  <th className="table-header">Username</th>
                  <th className="table-header">Pass Key</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Created By</th>
                  <th className="table-header">Created At</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((sa) => (
                  <tr key={sa.id} className="hover:bg-brand-black-4/40 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-xs font-bold text-brand-purple-light">
                          {sa.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{sa.displayName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <code className="text-xs text-brand-purple-light font-mono bg-brand-purple/10 px-2 py-1 rounded">
                        @{sa.username}
                      </code>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-brand-black-4 border border-brand-border px-2 py-1 rounded font-mono text-brand-text">
                          {showPassKeys[sa.id] ? sa.passKey : '••••••••'}
                        </code>
                        <button
                          onClick={() => togglePassKey(sa.id)}
                          className="text-brand-muted hover:text-brand-text transition-colors"
                        >
                          {showPassKeys[sa.id] ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      {sa.isActive ? (
                        <span className="badge-green">Active</span>
                      ) : (
                        <span className="badge-red">Inactive</span>
                      )}
                    </td>
                    <td className="table-cell text-brand-muted text-sm">{sa.createdBy}</td>
                    <td className="table-cell text-brand-muted text-xs">
                      {new Date(sa.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(sa)}
                          className={sa.isActive ? 'btn-secondary text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}
                        >
                          {sa.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => { setSelected(sa); setModal('delete'); }}
                          className="btn-danger text-xs px-3 py-1.5"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <div className="py-14 text-center">
                <p className="text-3xl mb-2">👤</p>
                <p className="text-brand-muted">No sub admins created yet</p>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map((sa) => (
              <div key={sa.id} className="glass-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-sm font-bold text-brand-purple-light">
                      {sa.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-text">{sa.displayName}</p>
                      <code className="text-xs text-brand-purple-light font-mono">@{sa.username}</code>
                    </div>
                  </div>
                  {sa.isActive ? (
                    <span className="badge-green">Active</span>
                  ) : (
                    <span className="badge-red">Inactive</span>
                  )}
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-muted">Pass Key:</span>
                    <code className="text-brand-text bg-brand-black-4 px-1.5 py-0.5 rounded font-mono">
                      {showPassKeys[sa.id] ? sa.passKey : '••••••••'}
                    </code>
                    <button onClick={() => togglePassKey(sa.id)} className="text-brand-muted hover:text-brand-text">
                      {showPassKeys[sa.id] ? '🙈' : '👁'}
                    </button>
                  </div>
                  <div>
                    <span className="text-brand-muted">Created by: </span>
                    <span className="text-brand-text">{sa.createdBy}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Date: </span>
                    <span className="text-brand-text">{new Date(sa.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-brand-border">
                  <button
                    onClick={() => handleToggle(sa)}
                    className={`flex-1 text-xs ${sa.isActive ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {sa.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => { setSelected(sa); setModal('delete'); }}
                    className="btn-danger text-xs px-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <div className="col-span-full text-center py-14 text-brand-muted">No sub admins yet</div>
            )}
          </div>
        </>
      )}

      {/* Create Modal */}
      {modal === 'add' && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className="glass-card w-full max-w-md p-6"
            style={{ boxShadow: '0 0 80px rgba(124,58,237,0.2)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-brand-text">👤 Create Sub Admin</h2>
              <button onClick={() => setModal(null)} className="text-brand-muted hover:text-brand-text p-1 rounded-lg hover:bg-brand-black-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Display Name', key: 'displayName', placeholder: 'e.g. Warehouse Manager', type: 'text' },
                { label: 'Username', key: 'username', placeholder: 'e.g. warehouse1 (no spaces)', type: 'text' },
                { label: 'Pass Key', key: 'passKey', placeholder: 'Create a secure pass key', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-brand-muted mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    className="input-field"
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-3 bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/40">
                {error}
              </p>
            )}
            <div className="bg-brand-black-4 rounded-xl p-3 mt-4 border border-brand-border">
              <p className="text-xs text-brand-muted">
                💡 Sub admin login URL:{' '}
                <code className="text-brand-purple-light">/subadmin/login</code>
                <br />
                They will use their <strong className="text-brand-text">username</strong> and{' '}
                <strong className="text-brand-text">pass key</strong> to access the portal.
              </p>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={handleCreate}
                className="btn-primary"
                disabled={saving || !form.username || !form.passKey || !form.displayName}
              >
                {saving ? 'Creating...' : 'Create Sub Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-brand-text mb-2">Delete Sub Admin</h2>
            <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">
                Delete <strong>{selected?.displayName}</strong> (@{selected?.username})?
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger" disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
