import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, LayoutDashboard, BookOpen, ClipboardCheck,
  FileText, Library, BarChart3, Users, LogOut, ChevronRight,
} from 'lucide-react';

const navConfig = {
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/courses',   icon: BookOpen,         label: 'Courses' },
    { to: '/admin/users',     icon: Users,            label: 'Users' },
    { to: '/admin/marks',     icon: BarChart3,        label: 'Marks' },
  ],
  teacher: [
    { to: '/teacher/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/courses',     icon: BookOpen,        label: 'My Courses' },
    { to: '/teacher/attendance',  icon: ClipboardCheck,  label: 'Attendance' },
    { to: '/teacher/assignments', icon: FileText,        label: 'Assignments' },
    { to: '/teacher/materials',   icon: Library,         label: 'Materials' },
    { to: '/teacher/marks',       icon: BarChart3,       label: 'Marks' },
  ],
  student: [
    { to: '/student/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/courses',     icon: BookOpen,        label: 'My Courses' },
    { to: '/student/attendance',  icon: ClipboardCheck,  label: 'Attendance' },
    { to: '/student/assignments', icon: FileText,        label: 'Assignments' },
    { to: '/student/materials',   icon: Library,         label: 'Materials' },
    { to: '/student/marks',       icon: BarChart3,       label: 'My Marks' },
  ],
};

const roleColors = {
  admin:   'text-purple-400 bg-purple-500/15',
  teacher: 'text-blue-400 bg-blue-500/15',
  student: 'text-emerald-400 bg-emerald-500/15',
};

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Brand */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-none">KalviMS</p>
            <p className="text-xs text-gray-500 mt-0.5">College ERP & LMS</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <span className={`badge text-xs ${roleColors[role]}`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
