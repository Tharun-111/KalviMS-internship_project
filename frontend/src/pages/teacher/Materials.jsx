import { useEffect, useState } from 'react';
import { coursesAPI, materialsAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { FullPageSpinner } from '../../components/Spinner';
import Spinner from '../../components/Spinner';
import { Plus, Trash2, Download, FileText } from 'lucide-react';

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', description: '' });
  const [file, setFile] = useState(null);

  const load = async () => {
    const [m, c] = await Promise.all([materialsAPI.getAll(), coursesAPI.getAll()]);
    setMaterials(m.data); setCourses(c.data); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('courseId', form.courseId);
    fd.append('title', form.title);
    fd.append('description', form.description);
    try {
      await materialsAPI.upload(fd);
      toast.success('Material uploaded!');
      setShowModal(false); setFile(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    try { await materialsAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="Study Materials" subtitle={`${materials.length} materials uploaded`}
        action={
          <button onClick={() => { setForm({ courseId: courses[0]?._id || '', title: '', description: '' }); setShowModal(true); }}
            className="btn-primary"><Plus size={16} /> Upload Material</button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.length === 0 && (
          <div className="col-span-full card text-center py-12 text-gray-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No materials uploaded yet.</p>
          </div>
        )}
        {materials.map((m) => (
          <div key={m._id} className="card hover:border-primary-500/30 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-primary-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white truncate">{m.title}</p>
                <span className="badge badge-blue mt-1">{m.course?.code}</span>
              </div>
            </div>
            {m.description && <p className="text-sm text-gray-400 mb-3">{m.description}</p>}
            <p className="text-xs text-gray-500 mb-3">By {m.uploadedBy?.name} • {new Date(m.createdAt).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <a href={m.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center">
                <Download size={13} /> Download
              </a>
              <button onClick={() => handleDelete(m._id)} className="btn-danger px-3 py-1.5">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Study Material">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">Course</label>
            <select className="input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-16 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">File (PDF, DOC, PPT)</label>
            <input type="file" className="input py-2 file:mr-3 file:bg-primary-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-sm cursor-pointer"
              accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={uploading}>{uploading && <Spinner size="sm" />} Upload</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
