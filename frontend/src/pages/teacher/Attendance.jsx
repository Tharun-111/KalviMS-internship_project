import { useEffect, useState } from 'react';
import { coursesAPI, attendanceAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import Spinner from '../../components/Spinner';
import { ClipboardCheck, Save } from 'lucide-react';

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesAPI.getAll().then(({ data }) => setCourses(data)).finally(() => setLoading(false));
  }, []);

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    // Initialize attendance records for all enrolled students
    const initial = (course.students || []).map((s) => ({ student: s._id, name: s.name, status: 'present' }));
    setRecords(initial);

    // Load history
    try {
      const { data } = await attendanceAPI.getByCourse(course._id);
      setHistory(data);
    } catch { setHistory([]); }
  };

  const toggleStatus = (idx) => {
    setRecords((prev) => {
      const updated = [...prev];
      const cycle = ['present', 'absent', 'late'];
      const current = updated[idx].status;
      updated[idx] = { ...updated[idx], status: cycle[(cycle.indexOf(current) + 1) % cycle.length] };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    try {
      await attendanceAPI.mark({
        courseId: selectedCourse._id,
        date,
        records: records.map(({ student, status }) => ({ student, status })),
      });
      toast.success('Attendance marked!');
      const { data } = await attendanceAPI.getByCourse(selectedCourse._id);
      setHistory(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally { setSaving(false); }
  };

  const statusStyle = { present: 'badge-green', absent: 'badge-red', late: 'badge-yellow' };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="Attendance" subtitle="Mark and view attendance records" />

      {/* Course selector */}
      {!selectedCourse ? (
        <div>
          <p className="text-gray-400 text-sm mb-4">Select a course to mark attendance:</p>
          {courses.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
              <p>No courses assigned.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {courses.map((c) => (
                <button key={c._id} onClick={() => selectCourse(c)}
                  className="card text-left hover:border-primary-500/40 transition-colors cursor-pointer">
                  <p className="font-medium text-white">{c.title}</p>
                  <span className="badge badge-blue mt-1">{c.code}</span>
                  <p className="text-xs text-gray-400 mt-2">{c.students?.length || 0} students</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedCourse(null)} className="btn-secondary text-sm">← Back</button>
            <div>
              <p className="font-display font-semibold text-white">{selectedCourse.title}</p>
              <span className="badge badge-blue">{selectedCourse.code}</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-white">Mark Attendance</h3>
              <input type="date" className="input w-auto" value={date}
                onChange={(e) => setDate(e.target.value)} />
            </div>

            {records.length === 0 ? (
              <p className="text-gray-500 text-sm">No students enrolled in this course.</p>
            ) : (
              <div className="space-y-2">
                {records.map((r, idx) => (
                  <div key={r.student} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400 text-sm font-bold">
                        {r.name.charAt(0)}
                      </div>
                      <span className="text-gray-200 text-sm">{r.name}</span>
                    </div>
                    <button onClick={() => toggleStatus(idx)}
                      className={`badge cursor-pointer hover:opacity-80 transition-opacity ${statusStyle[r.status]}`}>
                      {r.status}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {records.length > 0 && (
              <button onClick={handleSubmit} disabled={saving} className="btn-primary mt-5">
                {saving ? <Spinner size="sm" /> : <Save size={16} />}
                {saving ? 'Saving…' : 'Save Attendance'}
              </button>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4">Attendance History</h3>
              <div className="space-y-3">
                {history.slice(0, 10).map((att) => {
                  const present = att.records.filter((r) => r.status === 'present' || r.status === 'late').length;
                  const total = att.records.length;
                  const pct = total ? Math.round((present / total) * 100) : 0;
                  return (
                    <div key={att._id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                      <p className="text-sm text-gray-300">{new Date(att.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-400">{present}/{total} present</p>
                        <span className={`badge ${pct >= 75 ? 'badge-green' : pct >= 50 ? 'badge-yellow' : 'badge-red'}`}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
