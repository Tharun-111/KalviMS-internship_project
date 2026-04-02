import { useEffect, useState } from 'react';
import { marksAPI } from '../../api/services';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { BarChart3, TrendingUp } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const gradeStyle = {
  'A+': { badge: 'badge-green', bar: 'bg-emerald-500' },
  'A':  { badge: 'badge-green', bar: 'bg-emerald-400' },
  'B+': { badge: 'badge-blue',  bar: 'bg-blue-500'    },
  'B':  { badge: 'badge-blue',  bar: 'bg-blue-400'    },
  'C':  { badge: 'badge-yellow',bar: 'bg-amber-500'   },
  'F':  { badge: 'badge-red',   bar: 'bg-red-500'     },
};

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marksAPI.getMyMarks().then(({ data }) => setMarks(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  const avg = marks.length ? Math.round(marks.reduce((s, m) => s + m.total, 0) / marks.length) : 0;
  const best = marks.length ? marks.reduce((b, m) => m.total > b.total ? m : b, marks[0]) : null;

  const radarData = marks.map((m) => ({
    course: m.course?.code || 'N/A',
    score: Math.round((m.total / 200) * 100),
  }));

  return (
    <div className="page-enter">
      <PageHeader title="My Marks" subtitle="Academic performance across all courses" />

      {marks.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
          <p>No marks recorded yet.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-3xl font-display font-bold text-primary-400">{avg}/200</p>
              <p className="text-xs text-gray-400 mt-1">Average Score</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-display font-bold text-emerald-400">{marks.length}</p>
              <p className="text-xs text-gray-400 mt-1">Courses Evaluated</p>
            </div>
            <div className="card text-center">
              <p className="text-xl font-display font-bold text-amber-400 truncate">{best?.course?.title}</p>
              <p className="text-xs text-gray-400 mt-1">Best Course ({best?.total}/200)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Marks table */}
            <div className="card">
              <h2 className="font-display font-semibold text-white mb-4">Detailed Marks</h2>
              <div className="space-y-4">
                {marks.map((m) => {
                  const pct = Math.round((m.total / 200) * 100);
                  const style = gradeStyle[m.grade] || { badge: 'badge-yellow', bar: 'bg-amber-500' };
                  return (
                    <div key={m._id}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium text-white">{m.course?.title}</span>
                          <span className="badge badge-blue ml-2 text-xs">{m.course?.code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">{m.total}/200</span>
                          <span className={`badge ${style.badge}`}>{m.grade}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 mt-1">
                        <span>Internal: {m.internal}/50</span>
                        <span>Midterm: {m.midterm}/50</span>
                        <span>Final: {m.final}/100</span>
                      </div>
                      {m.remarks && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{m.remarks}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar chart */}
            {radarData.length >= 2 && (
              <div className="card">
                <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary-400" /> Performance Radar
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a2d3a" />
                    <PolarAngleAxis dataKey="course" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip
                      contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v}%`, 'Score']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
