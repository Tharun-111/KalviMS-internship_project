import { useEffect, useState } from 'react';
import { coursesAPI, assignmentsAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { FullPageSpinner } from '../../components/Spinner';
import Spinner from '../../components/Spinner';
import { Plus, Trash2, Eye, Star, Download } from 'lucide-react';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ type: null, data: null });
  const [submissions, setSubmissions] = useState([]);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [form, setForm] = useState({ courseId: '', title: '', description: '', deadline: '', totalMarks: 100 });

  const load = async () => {
    const [a, c] = await Promise.all([assignmentsAPI.getAll(), coursesAPI.getAll()]);
    setAssignments(a.data); setCourses(c.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await assignmentsAPI.create(form);
      toast.success('Assignment created!');
      setModal({ type: null }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try { await assignmentsAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const viewSubmissions = async (assignment) => {
    const { data } = await assignmentsAPI.getSubmissions(assignment._id);
    setSubmissions(data);
    setModal({ type: 'submissions', data: assignment });
  };

  const handleGrade = async (submissionId) => {
    try {
      await assignmentsAPI.grade(submissionId, gradeForm);
      toast.success('Graded!');
      viewSubmissions(modal.data);
    } catch { toast.error('Failed to grade'); }
  };

  const isOverdue = (deadline) => new Date(deadline) < new Date();

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="Assignments" subtitle={`${assignments.length} assignments`}
        action={
          <button onClick={() => { setForm({ courseId: courses[0]?._id || '', title: '', description: '', deadline: '', totalMarks: 100 }); setModal({ type: 'create' }); }}
            className="btn-primary"><Plus size={16} /> New Assignment</button>
        }
      />

      <div className="space-y-3">
        {assignments.length === 0 && (
          <div className="card text-center py-12 text-gray-500">No assignments yet.</div>
        )}
        {assignments.map((a) => (
          <div key={a._id} className="card hover:border-primary-500/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-white">{a.title}</h3>
                  <span className="badge badge-blue">{a.course?.code}</span>
                  {isOverdue(a.deadline) && <span className="badge badge-red">Overdue</span>}
                </div>
                <p className="text-sm text-gray-400 mb-2">{a.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>📅 Due: {new Date(a.deadline).toLocaleDateString()}</span>
                  <span>🎯 Marks: {a.totalMarks}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => viewSubmissions(a)} className="btn-secondary px-3 py-2 text-xs">
                  <Eye size={14} /> Submissions
                </button>
                <button onClick={() => handleDelete(a._id)} className="btn-danger px-3 py-2">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modal.type === 'create'} onClose={() => setModal({ type: null })} title="New Assignment">
        <form onSubmit={handleCreate} className="space-y-4">
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
            <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Deadline</label>
              <input type="datetime-local" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal({ type: null })} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving && <Spinner size="sm" />} Create</button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal isOpen={modal.type === 'submissions'} onClose={() => setModal({ type: null })} title={`Submissions — ${modal.data?.title}`}>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No submissions yet.</p>
          ) : submissions.map((s) => (
            <div key={s._id} className="bg-surface rounded-xl border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white text-sm">{s.student?.name}</p>
                  <p className="text-xs text-gray-500">{new Date(s.submittedAt).toLocaleString()}</p>
                </div>
                <a href={s.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary px-2 py-1 text-xs">
                  <Download size={12} /> File
                </a>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input type="number" placeholder="Grade" className="input w-20 py-1.5 text-sm"
                  defaultValue={s.grade || ''} onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })} />
                <input type="text" placeholder="Feedback…" className="input flex-1 py-1.5 text-sm"
                  defaultValue={s.feedback || ''} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
                <button onClick={() => handleGrade(s._id)} className="btn-primary px-3 py-1.5 text-xs">
                  <Star size={12} /> Grade
                </button>
              </div>
              {s.grade !== null && s.grade !== undefined && (
                <p className="text-xs text-emerald-400 mt-1">✓ Graded: {s.grade}/{modal.data?.totalMarks}</p>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
