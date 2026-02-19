import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onLogin, setShowRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
      <div className="bg-black/70 p-16 rounded-lg shadow-2xl w-full max-w-md border border-gray-800">
        <h1 className="text-white text-5xl font-bold mb-8">Sign Up</h1>
        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white p-4 rounded border border-gray-700 focus:outline-none focus:border-red-600 transition"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white p-4 rounded border border-gray-700 focus:outline-none focus:border-red-600 transition"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white p-4 rounded border border-gray-700 focus:outline-none focus:border-red-600 transition"
              required
              minLength="6"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 text-white p-4 rounded border border-gray-700 focus:outline-none focus:border-red-600 transition"
              required
              minLength="6"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 text-white p-4 rounded font-bold hover:bg-red-700 transition disabled:bg-red-800 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-8 text-gray-400">
          <p>
            Already have an account?{' '}
            <span onClick={() => setShowRegister(false)} className="text-white cursor-pointer hover:underline font-semibold">
              Sign in now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
