import { useEffect, useState } from 'react';
import { coursesAPI } from '../../api/services';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { BookOpen } from 'lucide-react';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll().then(({ data }) => setCourses(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-enter">
      <PageHeader title="My Courses" subtitle={`Enrolled in ${courses.length} course${courses.length !== 1 ? 's' : ''}`} />

      {courses.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">Not enrolled in any courses yet.</p>
          <p className="text-sm mt-1">Contact your admin to enroll in courses.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c._id} className="card hover:border-primary-500/30 transition-all duration-300 group">
              {/* Color stripe */}
              <div className="h-1.5 w-12 rounded-full bg-primary-500 mb-4 group-hover:w-full transition-all duration-500" />

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold text-white">{c.title}</h3>
                <span className="badge badge-blue flex-shrink-0 ml-2">{c.code}</span>
              </div>

              {c.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{c.description}</p>
              )}

              <div className="space-y-1.5 text-xs text-gray-500 mt-auto">
                {c.teacher && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-500/15 rounded flex items-center justify-center text-blue-400">👨‍🏫</span>
                    <span>{c.teacher.name}</span>
                  </div>
                )}
                {c.semester && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-purple-500/15 rounded flex items-center justify-center">📅</span>
                    <span>{c.semester}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-amber-500/15 rounded flex items-center justify-center">📚</span>
                  <span>{c.credits} credit{c.credits !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
