import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-[22%] max-w-[360px] border-r border-blue-900 bg-blue-950 text-white justify-center px-10">
        <div className="space-y-32 flex flex-col justify-center">

          <div>
            <h1 className="text-3xl font-bold tracking-wide">
              FRAS
            </h1>
            <p className="mt-2 text-blue-300 text-base">
              Facility Resource Allocation System
            </p>
          </div>

          <div>
            <p className="text-2xl font-semibold leading-relaxed text-blue-100">
              Real-time visibility into hospital resources,
              wards, and staff —
              <br />
              all in one place.
            </p>
          </div>

        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md"
        >
          <h2 className="text-4xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="text-slate-500 mt-2 mb-8">
            Sign in to your FRAS account
          </p>

          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3">
              <p className="text-sm text-rose-600">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
          >
            Log In
          </Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Register
            </Link>
          </p>
        </form>
      </div>

    </div>
  );
}
