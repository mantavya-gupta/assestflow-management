"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { 
  Users, 
  Edit2, 
  PowerOff,
  User,
  ShieldAlert,
  Building2
} from 'lucide-react';

interface DepartmentData {
  id: string;
  name: string;
}

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'DEPARTMENT_HEAD' | 'ASSET_MANAGER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  departmentId: string | null;
  department: DepartmentData | null;
}

export function EmployeeTab() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeData | null>(null);
  const [formData, setFormData] = useState<{
    role: string;
    departmentId: string;
    status: string;
  }>({
    role: 'EMPLOYEE',
    departmentId: '',
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [empRes, deptRes] = await Promise.all([
        fetch(`${API_URL}/api/employees`, { credentials: 'include' }),
        fetch(`${API_URL}/api/departments`, { credentials: 'include' })
      ]);

      if (empRes.ok) {
        const e = await empRes.json();
        setEmployees(e.data || []);
      }
      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d.data || []);
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

  const openEditModal = (emp: EmployeeData) => {
    setEditingEmp(emp);
    setFormData({
      role: emp.role,
      departmentId: emp.departmentId || '',
      status: emp.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    try {
      const payload = {
        role: formData.role,
        departmentId: formData.departmentId || null,
        status: formData.status
      };

      const res = await fetch(`${API_URL}/api/employees/${editingEmp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update employee');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  };

  const toggleStatus = async (emp: EmployeeData) => {
    const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Are you sure you want to mark ${emp.name} as ${newStatus}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/employees/${emp.id}`, {
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

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-rose-950 text-rose-400 ring-rose-800';
      case 'DEPARTMENT_HEAD': return 'bg-purple-950 text-purple-400 ring-purple-800';
      case 'ASSET_MANAGER': return 'bg-blue-950 text-blue-400 ring-blue-800';
      default: return 'bg-slate-800 text-slate-400 ring-slate-700';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading directory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Employee Directory</h2>
          <p className="text-sm text-slate-400">Manage employee roles, statuses, and department assignments.</p>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {emp.department ? (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <span>{emp.department.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getRoleBadgeColor(emp.role)}`}>
                        {emp.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-950 text-emerald-400 ring-1 ring-inset ring-emerald-800'
                          : 'bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(emp)}
                          className={`p-1.5 rounded transition-colors ${
                            emp.status === 'ACTIVE' 
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                          }`}
                          title={emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

      {/* Edit Modal */}
      {isModalOpen && editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                Edit Employee: {editingEmp.name}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-lg flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-200/80">
                  This is the central location for promoting employees. Use caution when assigning administrative roles.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Department
                </label>
                <select 
                  value={formData.departmentId}
                  onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="">-- Unassigned --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role
                </label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="ASSET_MANAGER">Asset Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
