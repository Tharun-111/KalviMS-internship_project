import { useEffect, useState } from 'react';
import { coursesAPI } from '../../api/services';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { BookOpen } from 'lucide-react';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll().then(({ data }) => setCourses(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="My Courses" subtitle={`${courses.length} courses assigned`} />

      {courses.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No courses assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c._id} className="card hover:border-primary-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-white">{c.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="badge badge-blue">{c.code}</span>
                    {c.semester && <span className="badge badge-purple">{c.semester}</span>}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{c.credits} credits</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{c.description || 'No description'}</p>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">Enrolled Students ({c.students?.length || 0})</p>
                {c.students?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {c.students.slice(0, 6).map((s) => (
                      <span key={s._id} className="badge badge-purple text-xs">{s.name}</span>
                    ))}
                    {c.students.length > 6 && (
                      <span className="badge badge-blue">+{c.students.length - 6} more</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">No students enrolled</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
