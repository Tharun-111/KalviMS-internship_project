import { useEffect, useState } from 'react';
import { materialsAPI } from '../../api/services';
import PageHeader from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { FileText, Download, Search } from 'lucide-react';

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    materialsAPI.getAll().then(({ data }) => { setMaterials(data); setFiltered(data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(materials.filter((m) =>
      m.title.toLowerCase().includes(q) ||
      m.course?.title?.toLowerCase().includes(q) ||
      m.course?.code?.toLowerCase().includes(q)
    ));
  }, [search, materials]);

  if (loading) return <FullPageSpinner />;

  // Group by course
  const grouped = filtered.reduce((acc, m) => {
    const key = m.course?.title || 'Unknown';
    if (!acc[key]) acc[key] = { code: m.course?.code, items: [] };
    acc[key].items.push(m);
    return acc;
  }, {});

  return (
    <div className="page-enter">
      <PageHeader title="Study Materials" subtitle={`${materials.length} materials available`} />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="input pl-10"
          placeholder="Search materials…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {materials.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No study materials available yet.</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-8 text-gray-500">No results for "{search}"</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([courseName, { code, items }]) => (
            <div key={courseName}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-display font-semibold text-white">{courseName}</h2>
                {code && <span className="badge badge-blue">{code}</span>}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((m) => (
                  <div key={m._id} className="card-sm hover:border-primary-500/30 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/25 transition-colors">
                        <FileText size={18} className="text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-sm truncate">{m.title}</p>
                        {m.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{m.description}</p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">
                          By {m.uploadedBy?.name} • {new Date(m.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary w-full justify-center mt-3 text-sm py-2"
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
