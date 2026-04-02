export default function StatCard({ icon: Icon, label, value, color = 'indigo', trend }) {
  const colorMap = {
    indigo:  'bg-primary-500/15 text-primary-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    blue:    'bg-blue-500/15 text-blue-400',
    amber:   'bg-amber-500/15 text-amber-400',
    rose:    'bg-rose-500/15 text-rose-400',
    purple:  'bg-purple-500/15 text-purple-400',
  };
  return (
    <div className="stat-card animate-fade-in">
      <div className={`stat-icon ${colorMap[color] || colorMap.indigo}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        {trend && <p className="text-xs text-emerald-400 mt-1">{trend}</p>}
      </div>
    </div>
  );
}
