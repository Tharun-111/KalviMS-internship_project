import { useEffect, useState } from 'react';
import { coursesAPI, marksAPI } from '../../api/services';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';

const gradeColor = { 'A+': 'badge-green', A: 'badge-green', 'B+': 'badge-blue', B: 'badge-blue', C: 'badge-yellow', F: 'badge-red' };

export default function AdminMarks() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll().then(({ data }) => setCourses(data)).finally(() => setLoading(false));
  }, []);

  const loadMarks = async (courseId) => {
    setSelectedCourse(courseId);
    if (!courseId) { setMarks([]); return; }
    try {
      const { data } = await marksAPI.getByCourse(courseId);
      setMarks(data);
    } catch { toast.error('Failed to load marks'); }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="Marks Overview" subtitle="View all student marks by course" />

      <div className="mb-6">
        <label className="label">Select Course</label>
        <select className="input max-w-sm" value={selectedCourse} onChange={(e) => loadMarks(e.target.value)}>
          <option value="">-- Choose a course --</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
        </select>
      </div>

      {selectedCourse && (
        <div className="card">
          {marks.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No marks recorded for this course.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Internal (50)</th>
                    <th>Midterm (50)</th>
                    <th>Final (100)</th>
                    <th>Total (200)</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m) => (
                    <tr key={m._id}>
                      <td className="font-medium text-white">{m.student?.name}</td>
                      <td>{m.internal}</td>
                      <td>{m.midterm}</td>
                      <td>{m.final}</td>
                      <td className="font-semibold text-white">{m.total}</td>
                      <td><span className={`badge ${gradeColor[m.grade] || 'badge-yellow'}`}>{m.grade}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
