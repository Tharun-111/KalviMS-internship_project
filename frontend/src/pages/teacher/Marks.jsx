import { useEffect, useState } from 'react';
import { coursesAPI, marksAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import Spinner from '../../components/Spinner';
import { Save } from 'lucide-react';

const gradeColor = { 'A+': 'badge-green', A: 'badge-green', 'B+': 'badge-blue', B: 'badge-blue', C: 'badge-yellow', F: 'badge-red' };

export default function TeacherMarks() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState({});

  useEffect(() => {
    coursesAPI.getAll().then(({ data }) => setCourses(data)).finally(() => setLoading(false));
  }, []);

  const loadMarks = async (course) => {
    setSelectedCourse(course);
    const { data } = await marksAPI.getByCourse(course._id);
    setMarks(data);
    // Init editable state
    const init = {};
    (course.students || []).forEach((s) => {
      const existing = data.find((m) => m.student?._id === s._id);
      init[s._id] = { internal: existing?.internal ?? 0, midterm: existing?.midterm ?? 0, final: existing?.final ?? 0, remarks: existing?.remarks ?? '' };
    });
    setEdited(init);
  };

  const handleSave = async (studentId) => {
    setSaving(true);
    try {
      await marksAPI.upsert({ studentId, courseId: selectedCourse._id, ...edited[studentId] });
      toast.success('Marks saved!');
      const { data } = await marksAPI.getByCourse(selectedCourse._id);
      setMarks(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const updateField = (studentId, field, value) => {
    setEdited((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="Marks Entry" subtitle="Enter and manage student marks" />

      {!selectedCourse ? (
        <div>
          <p className="text-gray-400 text-sm mb-4">Select a course to enter marks:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((c) => (
              <button key={c._id} onClick={() => loadMarks(c)}
                className="card text-left hover:border-primary-500/40 transition-colors cursor-pointer">
                <p className="font-medium text-white">{c.title}</p>
                <span className="badge badge-blue mt-1">{c.code}</span>
                <p className="text-xs text-gray-400 mt-2">{c.students?.length || 0} students</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setSelectedCourse(null)} className="btn-secondary text-sm">← Back</button>
            <div>
              <p className="font-display font-semibold text-white">{selectedCourse.title}</p>
              <span className="badge badge-blue">{selectedCourse.code}</span>
            </div>
          </div>

          <div className="card">
            <p className="text-xs text-gray-500 mb-4">Internal: /50 &nbsp;|&nbsp; Midterm: /50 &nbsp;|&nbsp; Final: /100 &nbsp;|&nbsp; Total: /200</p>
            {(selectedCourse.students || []).length === 0 ? (
              <p className="text-gray-500 text-sm">No students enrolled.</p>
            ) : (
              <div className="space-y-3">
                {(selectedCourse.students || []).map((student) => {
                  const e = edited[student._id] || {};
                  const existingMark = marks.find((m) => m.student?._id === student._id);
                  return (
                    <div key={student._id} className="bg-surface rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400 text-sm font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <p className="font-medium text-white text-sm">{student.name}</p>
                        </div>
                        {existingMark && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Total: {existingMark.total}/200</span>
                            <span className={`badge ${gradeColor[existingMark.grade] || 'badge-yellow'}`}>{existingMark.grade}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {['internal', 'midterm', 'final'].map((field) => (
                          <div key={field}>
                            <label className="text-xs text-gray-500 capitalize">{field}</label>
                            <input type="number" className="input py-1.5 text-sm mt-0.5"
                              value={e[field] ?? 0}
                              max={field === 'final' ? 100 : 50} min={0}
                              onChange={(ev) => updateField(student._id, field, Number(ev.target.value))} />
                          </div>
                        ))}
                        <div className="flex items-end">
                          <button onClick={() => handleSave(student._id)} disabled={saving}
                            className="btn-primary w-full justify-center py-1.5 text-sm">
                            {saving ? <Spinner size="sm" /> : <Save size={14} />} Save
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
