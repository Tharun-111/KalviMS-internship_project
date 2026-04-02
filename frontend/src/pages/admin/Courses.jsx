import { useEffect, useState } from 'react';
import { coursesAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { FullPageSpinner } from '../../components/Spinner';
import Spinner from '../../components/Spinner';
import { Plus, Pencil, Trash2, UserPlus, UserMinus, BookOpen } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState({ type: null, course: null });
  const [form, setForm] = useState({ title: '', code: '', description: '', semester: '', credits: 3 });
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const load = async () => {
    try {
      const [c, t, s] = await Promise.all([
        coursesAPI.getAll(), coursesAPI.getTeachers(), coursesAPI.getStudents()
      ]);
      setCourses(c.data); setTeachers(t.data); setStudents(s.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ title: '', code: '', description: '', semester: '', credits: 3 });
    setModal({ type: 'create' });
  };

  const openEdit = (course) => {
    setForm({ title: course.title, code: course.code, description: course.description || '', semester: course.semester || '', credits: course.credits || 3 });
    setModal({ type: 'edit', course });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.type === 'create') {
        await coursesAPI.create(form);
        toast.success('Course created!');
      } else {
        await coursesAPI.update(modal.course._id, form);
        toast.success('Course updated!');
      }
      setModal({ type: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await coursesAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAssignTeacher = async (courseId) => {
    if (!selectedTeacher) return;
    try {
      await coursesAPI.assignTeacher(courseId, selectedTeacher);
      toast.success('Teacher assigned!');
      setModal({ type: null });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEnroll = async (courseId) => {
    if (!selectedStudent) return;
    try {
      await coursesAPI.enrollStudent(courseId, selectedStudent);
      toast.success('Student enrolled!');
      setModal({ type: null });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUnenroll = async (courseId, studentId) => {
    try {
      await coursesAPI.unenrollStudent(courseId, studentId);
      toast.success('Student removed');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader
        title="Courses"
        subtitle={`${courses.length} courses in system`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> New Course
          </button>
        }
      />

      <div className="grid gap-4">
        {courses.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No courses yet. Create your first course!</p>
          </div>
        )}
        {courses.map((course) => (
          <div key={course._id} className="card hover:border-primary-500/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-white">{course.title}</h3>
                  <span className="badge badge-blue">{course.code}</span>
                  {course.semester && <span className="badge badge-purple">{course.semester}</span>}
                </div>
                <p className="text-sm text-gray-400 mb-3">{course.description || 'No description'}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                  <span>👨‍🏫 {course.teacher?.name || 'No teacher'}</span>
                  <span>•</span>
                  <span>👩‍🎓 {course.students?.length || 0} students</span>
                  <span>•</span>
                  <span>📚 {course.credits} credits</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => { setSelectedTeacher(''); setModal({ type: 'assign-teacher', course }); }}
                  className="btn-secondary px-3 py-2 text-xs">
                  <UserPlus size={14} /> Teacher
                </button>
                <button onClick={() => { setSelectedStudent(''); setModal({ type: 'enroll', course }); }}
                  className="btn-secondary px-3 py-2 text-xs">
                  <UserPlus size={14} /> Student
                </button>
                <button onClick={() => openEdit(course)} className="btn-secondary px-3 py-2">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(course._id)} className="btn-danger px-3 py-2">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Enrolled students list */}
            {course.students?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-gray-500 mb-2 font-medium">Enrolled Students</p>
                <div className="flex flex-wrap gap-2">
                  {course.students.map((s) => (
                    <div key={s._id} className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg text-xs text-gray-300 border border-border">
                      {s.name}
                      <button onClick={() => handleUnenroll(course._id, s._id)} className="text-red-400 hover:text-red-300 ml-1">
                        <UserMinus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={['create','edit'].includes(modal.type)} onClose={() => setModal({ type: null })}
        title={modal.type === 'create' ? 'Create Course' : 'Edit Course'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Course Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Course Code</label>
              <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="label">Credits</label>
              <input type="number" className="input" value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })} min={1} max={10} />
            </div>
          </div>
          <div>
            <label className="label">Semester</label>
            <input className="input" placeholder="e.g. Semester 3" value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal({ type: null })} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {modal.type === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal isOpen={modal.type === 'assign-teacher'} onClose={() => setModal({ type: null })}
        title={`Assign Teacher — ${modal.course?.title}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Select Teacher</label>
            <select className="input" value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
              <option value="">-- Choose teacher --</option>
              {teachers.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal({ type: null })} className="btn-secondary">Cancel</button>
            <button onClick={() => handleAssignTeacher(modal.course._id)} className="btn-primary">Assign</button>
          </div>
        </div>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal isOpen={modal.type === 'enroll'} onClose={() => setModal({ type: null })}
        title={`Enroll Student — ${modal.course?.title}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Select Student</label>
            <select className="input" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">-- Choose student --</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal({ type: null })} className="btn-secondary">Cancel</button>
            <button onClick={() => handleEnroll(modal.course._id)} className="btn-primary">Enroll</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
