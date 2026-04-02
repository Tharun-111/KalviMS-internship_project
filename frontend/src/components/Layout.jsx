import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ role }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
