import { Navigate, Route, Routes } from 'react-router-dom';
import { MobileNav } from './components/MobileNav.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Login } from './pages/Login.jsx';
import { EmailMarketing } from './pages/EmailMarketing.jsx';
import { MyTasks } from './pages/MyTasks.jsx';
import { Overview } from './pages/Overview.jsx';
import { Settings } from './pages/Settings.jsx';
import { Team } from './pages/Team.jsx';
import { VentureDetails } from './pages/VentureDetails.jsx';
import { Ventures } from './pages/Ventures.jsx';
import { WebDevLeads } from './pages/WebDevLeads.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-zinc-50 text-zinc-950">
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="min-w-0 flex-1 px-3 py-3 sm:px-5 sm:py-5 lg:px-9">
                  <MobileNav />
                  <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/ventures" element={<Ventures />} />
                    <Route path="/ventures/:ventureId" element={<VentureDetails />} />
                    <Route path="/tasks" element={<MyTasks />} />
                    <Route path="/web-dev-leads" element={<WebDevLeads />} />
                    <Route path="/email-marketing" element={<EmailMarketing />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/overview" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
