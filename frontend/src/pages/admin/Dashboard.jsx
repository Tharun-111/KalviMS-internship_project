import { useEffect, useState } from 'react';
import { usersAPI, coursesAPI } from '../../api/services';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersAPI.getStats(), coursesAPI.getAll()])
      .then(([s, c]) => {
        setStats(s.data);
        setRecentCourses(c.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="Admin Dashboard" subtitle="System overview and quick stats" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={GraduationCap} label="Total Students" value={stats?.totalStudents} color="emerald" />
        <StatCard icon={Users}         label="Total Teachers" value={stats?.totalTeachers}  color="blue" />
        <StatCard icon={BookOpen}      label="Total Courses"  value={stats?.totalCourses}   color="indigo" />
        <StatCard icon={ClipboardList} label="Assignments"    value={stats?.totalAssignments} color="amber" />
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4">Recent Courses</h2>
        {recentCourses.length === 0 ? (
          <p className="text-gray-500 text-sm">No courses yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Teacher</th>
                  <th>Students</th>
                </tr>
              </thead>
              <tbody>
                {recentCourses.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium text-white">{c.title}</td>
                    <td><span className="badge badge-blue">{c.code}</span></td>
                    <td>{c.teacher?.name || <span className="text-gray-500">Unassigned</span>}</td>
                    <td>{c.students?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
