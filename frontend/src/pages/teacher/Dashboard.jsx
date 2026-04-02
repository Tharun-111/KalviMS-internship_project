import { useEffect, useState } from 'react';
import { coursesAPI, assignmentsAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { BookOpen, FileText, Users, ClipboardCheck } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([coursesAPI.getAll(), assignmentsAPI.getAll()])
      .then(([c, a]) => { setCourses(c.data); setAssignments(a.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  const totalStudents = courses.reduce((acc, c) => acc + (c.students?.length || 0), 0);

  return (
    <div className="page-enter">
      <PageHeader title={`Hello, ${user?.name} 👋`} subtitle="Here's your teaching overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen}     label="My Courses"    value={courses.length}     color="indigo" />
        <StatCard icon={Users}        label="Total Students" value={totalStudents}      color="emerald" />
        <StatCard icon={FileText}     label="Assignments"   value={assignments.length} color="amber" />
        <StatCard icon={ClipboardCheck} label="Active Now"  value={courses.length}     color="blue" />
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500 text-sm">No courses assigned yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((c) => (
              <div key={c._id} className="card-sm border border-border hover:border-primary-500/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{c.title}</p>
                    <span className="badge badge-blue mt-1">{c.code}</span>
                  </div>
                  <p className="text-xs text-gray-400">{c.students?.length || 0} students</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
