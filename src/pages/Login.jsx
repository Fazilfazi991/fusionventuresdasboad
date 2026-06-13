import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FusionMark } from '../components/Sidebar.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSupabaseConfigured, session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/overview" replace />;
  }

  const from = location.state?.from?.pathname || '/overview';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const loginEmail = email.includes('@') ? email.trim() : `${email.trim().toLowerCase()}@fusionos.local`;
    const { error: signInError } = await signIn(loginEmail, password);
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 py-10">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="rounded-lg bg-zinc-950 p-4">
          <FusionMark compact />
          <p className="mt-4 text-sm font-medium text-zinc-300">Fusion OS</p>
        </div>

        <div className="mt-7">
          <h1 className="text-3xl font-semibold text-zinc-950">Login</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to manage ventures, tasks, and web dev leads.</p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm font-medium leading-6 text-zinc-700">
            Supabase is not configured for this deployment. Add Vercel environment variables:
            <span className="mt-2 block font-mono text-xs">VITE_SUPABASE_URL</span>
            <span className="block font-mono text-xs">VITE_SUPABASE_ANON_KEY</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Username</span>
            <input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500"
              placeholder="fazil"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-500"
              required
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  );
}
