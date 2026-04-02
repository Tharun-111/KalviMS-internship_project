import { useEffect, useState } from 'react';
import { attendanceAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { ClipboardCheck } from 'lucide-react';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getByStudent(user._id)
      .then(({ data }) => setAttendance(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  const overallPct = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0;

  return (
    <div className="page-enter">
      <PageHeader title="My Attendance" subtitle="Track your class attendance across all courses" />

      {/* Overall badge */}
      {attendance.length > 0 && (
        <div className={`card mb-6 flex items-center gap-4 border-2 ${
          overallPct >= 75 ? 'border-emerald-500/30' :
          overallPct >= 50 ? 'border-amber-500/30' : 'border-red-500/30'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold ${
            overallPct >= 75 ? 'bg-emerald-500/15 text-emerald-400' :
            overallPct >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {overallPct}%
          </div>
          <div>
            <p className="font-display font-semibold text-white">Overall Attendance</p>
            <p className="text-sm text-gray-400">
              {overallPct >= 75
                ? '✅ You meet the 75% attendance requirement.'
                : overallPct >= 50
                ? '⚠️ Below 75% — you may face attendance shortage.'
                : '🚨 Critical — contact your academic advisor.'}
            </p>
          </div>
        </div>
      )}

      {attendance.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <ClipboardCheck size={48} className="mx-auto mb-4 opacity-20" />
          <p>No attendance records found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {attendance.map((a) => (
            <div key={a.course._id} className="card hover:border-primary-500/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-white">{a.course.title}</h3>
                  <span className="badge badge-blue mt-1">{a.course.code}</span>
                </div>
                <div className={`text-2xl font-display font-bold ${
                  a.percentage >= 75 ? 'text-emerald-400' :
                  a.percentage >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {a.percentage}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-border rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    a.percentage >= 75 ? 'bg-emerald-500' :
                    a.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${a.percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{a.presentCount} present</span>
                <span>{a.totalClasses - a.presentCount} absent</span>
                <span>{a.totalClasses} total classes</span>
              </div>

              {/* Shortage warning */}
              {a.percentage < 75 && a.totalClasses > 0 && (
                <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  Need {Math.ceil(0.75 * a.totalClasses) - a.presentCount} more classes to reach 75%
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
