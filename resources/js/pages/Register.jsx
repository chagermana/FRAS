import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Input, Select, Button } from '../components/ui';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'healthcare_worker', hospital_id: '', ward_id: '' });
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (form.role === 'system_admin') {
        delete payload.hospital_id;
        delete payload.ward_id;
      } else if (form.role === 'hospital_admin') {
        delete payload.ward_id;
      }
      const res = await client.post('/register', payload);
      localStorage.setItem('fras_token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-[22%] max-w-[360px] border-r border-blue-900 bg-blue-950 text-white justify-center px-10">
        <div className="space-y-32 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">FRAS</h1>
            <p className="mt-2 text-blue-300 text-base">Facility Resource Allocation System</p>
          </div>
          <div>
            <p className="text-2xl font-semibold leading-relaxed text-blue-100">
              Set up access for your role
              <br />
              and your facility.
            </p>
          </div>
        </div>
      </div>

      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-slate-900">Create account</h2>
          <p className="text-slate-500 mt-2 mb-8">Register for FRAS access</p>

          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <Input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} required />
            <Select name="role" value={form.role} onChange={handleChange} className="w-full">
              <option value="healthcare_worker">Healthcare Worker</option>
              <option value="hospital_admin">Hospital Admin</option>
              <option value="system_admin">System Admin</option>
            </Select>

            {(form.role === 'hospital_admin' || form.role === 'healthcare_worker') && (
              <Input name="hospital_id" type="number" placeholder="Hospital ID" value={form.hospital_id} onChange={handleChange} required />
            )}
            {form.role === 'healthcare_worker' && (
              <Input name="ward_id" type="number" placeholder="Ward ID" value={form.ward_id} onChange={handleChange} required />
            )}
          </div>

          <Button type="submit" className="w-full mt-6">Create account</Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
