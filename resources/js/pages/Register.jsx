import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'healthcare_worker' });
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await client.post('/register', form);
      localStorage.setItem('fras_token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">FRAS Register</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded-md" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded-md" required />
        <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border rounded-md" required />
        <select name="role" value={form.role} onChange={handleChange}
          className="w-full mb-4 px-3 py-2 border rounded-md">
          <option value="healthcare_worker">Healthcare Worker</option>
          <option value="hospital_admin">Hospital Admin</option>
          <option value="system_admin">System Admin</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Register
        </button>
        <p className="text-sm mt-4 text-center">
          Have an account? <Link to="/login" className="text-blue-600">Log In</Link>
        </p>
      </form>
    </div>
  );
}
