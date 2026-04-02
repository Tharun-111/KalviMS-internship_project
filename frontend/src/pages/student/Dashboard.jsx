import { useEffect, useState } from 'react';
import { coursesAPI, attendanceAPI, assignmentsAPI, marksAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { BookOpen, ClipboardCheck, FileText, BarChart3 } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coursesAPI.getAll(),
      attendanceAPI.getByStudent(user._id),
      assignmentsAPI.getAll(),
      marksAPI.getMyMarks(),
    ]).then(([c, a, asn, m]) => {
      setCourses(c.data);
      setAttendance(a.data);
      setAssignments(asn.data);
      setMarks(m.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0;

  const avgTotal = marks.length
    ? Math.round(marks.reduce((s, m) => s + m.total, 0) / marks.length)
    : 0;

  const upcoming = assignments
    .filter((a) => new Date(a.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <div className="page-enter">
      <PageHeader title={`Welcome, ${user?.name} 👋`} subtitle="Your academic summary at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen}       label="Enrolled Courses"   value={courses.length}     color="indigo" />
        <StatCard icon={ClipboardCheck} label="Avg Attendance"     value={`${avgAttendance}%`} color={avgAttendance >= 75 ? 'emerald' : 'rose'} />
        <StatCard icon={FileText}       label="Assignments"        value={assignments.length} color="amber" />
        <StatCard icon={BarChart3}      label="Avg Score"          value={`${avgTotal}/200`}  color="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance by course */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4">Attendance Overview</h2>
          {attendance.length === 0 ? (
            <p className="text-gray-500 text-sm">No attendance records yet.</p>
          ) : (
            <div className="space-y-3">
              {attendance.map((a) => (
                <div key={a.course._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{a.course.title}</span>
                    <span className={`font-medium ${a.percentage >= 75 ? 'text-emerald-400' : a.percentage >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {a.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${a.percentage >= 75 ? 'bg-emerald-500' : a.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${a.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{a.presentCount}/{a.totalClasses} classes</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4">Upcoming Assignments</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming assignments.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => {
                const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={a._id} className="flex items-start gap-3 p-3 bg-surface rounded-xl border border-border">
                    <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.course?.title}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${daysLeft <= 1 ? 'badge-red' : daysLeft <= 3 ? 'badge-yellow' : 'badge-green'}`}>
                      {daysLeft}d left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Marks summary */}
        <div className="card lg:col-span-2">
          <h2 className="font-display font-semibold text-white mb-4">Marks Summary</h2>
          {marks.length === 0 ? (
            <p className="text-gray-500 text-sm">No marks recorded yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Internal</th>
                    <th>Midterm</th>
                    <th>Final</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m) => (
                    <tr key={m._id}>
                      <td className="font-medium text-white">{m.course?.title}</td>
                      <td>{m.internal}/50</td>
                      <td>{m.midterm}/50</td>
                      <td>{m.final}/100</td>
                      <td className="font-semibold">{m.total}/200</td>
                      <td>
                        <span className={`badge ${
                          ['A+','A'].includes(m.grade) ? 'badge-green' :
                          ['B+','B'].includes(m.grade) ? 'badge-blue' :
                          m.grade === 'C' ? 'badge-yellow' : 'badge-red'
                        }`}>{m.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
