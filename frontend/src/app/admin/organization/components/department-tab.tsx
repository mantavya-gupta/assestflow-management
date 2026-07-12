"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { 
  Building2, 
  Plus, 
  MoreVertical, 
  Edit2, 
  PowerOff,
  User,
  GitMerge
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface DepartmentData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  headId: string | null;
  parentId: string | null;
  head: UserData | null;
  parent: { id: string; name: string } | null;
}

export function DepartmentTab() {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'ACTIVE',
    headId: '',
    parentId: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [deptRes, userRes] = await Promise.all([
        fetch(`${API_URL}/api/departments`, { credentials: 'include' }),
        fetch(`${API_URL}/api/departments/eligible-heads`, { credentials: 'include' })
      ]);

      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d.data || []);
      }
      if (userRes.ok) {
        const u = await userRes.json();
        setUsers(u.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({ name: '', status: 'ACTIVE', headId: '', parentId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: DepartmentData) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      status: dept.status,
      headId: dept.headId || '',
      parentId: dept.parentId || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        status: formData.status,
        headId: formData.headId || null,
        parentId: formData.parentId || null
      };

      const url = editingDept 
        ? `${API_URL}/api/departments/${editingDept.id}`
        : `${API_URL}/api/departments`;
      
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save department');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  };

  const toggleStatus = async (dept: DepartmentData) => {
    const newStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Are you sure you want to mark ${dept.name} as ${newStatus}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/departments/${dept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Department Management</h2>
          <p className="text-sm text-slate-400">Configure organizational hierarchy and assign leadership.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {/* Departments List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Department Name</th>
                <th className="px-6 py-4 font-medium">Head of Department</th>
                <th className="px-6 py-4 font-medium">Parent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No departments found. Create one to get started.
                  </td>
                </tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-white">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dept.head ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span>{dept.head.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {dept.parent ? (
                        <div className="flex items-center gap-2 text-slate-400">
                          <GitMerge className="h-4 w-4 text-slate-500" />
                          <span>{dept.parent.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        dept.status === 'ACTIVE' 
                          ? 'bg-emerald-950 text-emerald-400 ring-1 ring-inset ring-emerald-800'
                          : 'bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700'
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(dept)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          title="Edit Department"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(dept)}
                          className={`p-1.5 rounded transition-colors ${
                            dept.status === 'ACTIVE' 
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                          }`}
                          title={dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          <PowerOff className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Department Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Department Head
                </label>
                <select 
                  value={formData.headId}
                  onChange={e => setFormData({ ...formData, headId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="">-- Unassigned --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Parent Department (Optional)
                </label>
                <select 
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="">-- None (Top Level) --</option>
                  {departments
                    .filter(d => !editingDept || d.id !== editingDept.id) // prevent self-parent
                    .map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {editingDept && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors ring-1 ring-inset ring-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
