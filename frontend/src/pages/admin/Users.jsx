import { useEffect, useState } from 'react';
import { usersAPI, authAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { FullPageSpinner } from '../../components/Spinner';
import Spinner from '../../components/Spinner';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';

const roleBadge = { admin: 'badge-purple', teacher: 'badge-blue', student: 'badge-green' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ type: null, user: null });
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });

  const load = async () => {
    try {
      const { data } = await usersAPI.getAll(filter || undefined);
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', role: 'student' });
    setModal({ type: 'create' });
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setModal({ type: 'edit', user });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.type === 'create') {
        await authAPI.createUser(form);
        toast.success('User created!');
      } else {
        await usersAPI.update(modal.user._id, { name: form.name, email: form.email, role: form.role });
        toast.success('User updated!');
      }
      setModal({ type: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await usersAPI.delete(id);
      toast.success('User deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader
        title="Users"
        subtitle={`${users.length} users`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> New User
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['', 'admin', 'teacher', 'student'].map((r) => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === r ? 'bg-primary-600 text-white' : 'bg-card border border-border text-gray-400 hover:text-white'}`}>
            {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
          </button>
        ))}
      </div>

      <div className="card">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400 text-xs font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-gray-400">{u.email}</td>
                    <td><span className={`badge ${roleBadge[u.role]}`}>{u.role}</span></td>
                    <td className="text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="btn-secondary px-2 py-1.5 text-xs">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="btn-danger px-2 py-1.5 text-xs">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!modal.type} onClose={() => setModal({ type: null })}
        title={modal.type === 'create' ? 'Create User' : 'Edit User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {modal.type === 'create' && (
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
            </div>
          )}
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal({ type: null })} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {modal.type === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
