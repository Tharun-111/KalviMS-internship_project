import { useEffect, useState } from 'react';
import { assignmentsAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { FullPageSpinner } from '../../components/Spinner';
import Spinner from '../../components/Spinner';
import { Upload, FileText, CheckCircle, Clock } from 'lucide-react';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({ open: false, assignment: null });
  const [file, setFile] = useState(null);

  const load = async () => {
    const [a, s] = await Promise.all([assignmentsAPI.getAll(), assignmentsAPI.getMySubmissions()]);
    setAssignments(a.data);
    setSubmissions(s.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getSubmission = (assignmentId) =>
    submissions.find((s) => s.assignment?._id === assignmentId || s.assignment === assignmentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await assignmentsAPI.submit(modal.assignment._id, fd);
      toast.success('Assignment submitted!');
      setModal({ open: false, assignment: null });
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setUploading(false); }
  };

  const isOverdue = (deadline) => new Date(deadline) < new Date();
  const daysLeft = (deadline) => Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

  if (loading) return <FullPageSpinner />;

  const pending = assignments.filter((a) => !getSubmission(a._id) && !isOverdue(a.deadline));
  const submitted = assignments.filter((a) => getSubmission(a._id));
  const overdue = assignments.filter((a) => !getSubmission(a._id) && isOverdue(a.deadline));

  return (
    <div className="page-enter">
      <PageHeader title="Assignments" subtitle={`${assignments.length} total assignments`} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-sm text-center">
          <p className="text-2xl font-display font-bold text-amber-400">{pending.length}</p>
          <p className="text-xs text-gray-400 mt-1">Pending</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-2xl font-display font-bold text-emerald-400">{submitted.length}</p>
          <p className="text-xs text-gray-400 mt-1">Submitted</p>
        </div>
        <div className="card-sm text-center">
          <p className="text-2xl font-display font-bold text-red-400">{overdue.length}</p>
          <p className="text-xs text-gray-400 mt-1">Overdue</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const sub = getSubmission(a._id);
            const overdue = isOverdue(a.deadline);
            const left = daysLeft(a.deadline);

            return (
              <div key={a._id} className={`card hover:border-primary-500/30 transition-colors ${sub ? 'border-emerald-500/20' : overdue ? 'border-red-500/20' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-semibold text-white">{a.title}</h3>
                      <span className="badge badge-blue">{a.course?.code}</span>
                      {sub && <span className="badge badge-green flex items-center gap-1"><CheckCircle size={10} /> Submitted</span>}
                      {!sub && overdue && <span className="badge badge-red">Overdue</span>}
                      {!sub && !overdue && <span className="badge badge-yellow flex items-center gap-1"><Clock size={10} /> {left}d left</span>}
                    </div>
                    {a.description && <p className="text-sm text-gray-400 mb-2">{a.description}</p>}
                    <p className="text-xs text-gray-500">
                      Due: {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      &nbsp;•&nbsp; {a.totalMarks} marks
                    </p>
                    {/* Submission info */}
                    {sub && (
                      <div className="mt-2 text-xs text-gray-400">
                        Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                        {sub.grade !== null && sub.grade !== undefined && (
                          <span className="ml-2 text-emerald-400 font-medium">
                            Grade: {sub.grade}/{a.totalMarks}
                            {sub.feedback && ` — "${sub.feedback}"`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!sub && !overdue && (
                    <button
                      onClick={() => { setModal({ open: true, assignment: a }); setFile(null); }}
                      className="btn-primary flex-shrink-0"
                    >
                      <Upload size={15} /> Submit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, assignment: null })}
        title={`Submit — ${modal.assignment?.title}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Course: <span className="text-white">{modal.assignment?.course?.title}</span></p>
            <p className="text-sm text-gray-400 mb-4">Due: <span className="text-white">{modal.assignment && new Date(modal.assignment.deadline).toLocaleDateString()}</span></p>
          </div>
          <div>
            <label className="label">Upload File</label>
            <input type="file" className="input py-2 file:mr-3 file:bg-primary-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-sm cursor-pointer"
              onChange={(e) => setFile(e.target.files[0])} required />
            <p className="text-xs text-gray-500 mt-1">Accepted: PDF, DOC, DOCX, PNG, JPG, ZIP</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open: false, assignment: null })} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? <><Spinner size="sm" /> Uploading…</> : <><Upload size={15} /> Submit</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
