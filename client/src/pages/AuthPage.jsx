import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { login as apiLogin, register as apiRegister } from '../api/auth.js';

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const showToast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = mode === 'login'
        ? await apiLogin(email, password)
        : await apiRegister(name, email, password);
      login(data.user, data.token);
      showToast(`Welcome, ${data.user.name}`);
      navigate(params.get('redirect') || '/account');
    } catch (err) {
      showToast(err.response?.data?.message || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="section-header fade-in visible">
        <div className="section-tag">ACCOUNT</div>
        <h2 className="section-title">{mode === 'login' ? 'Welcome ' : 'Create '}<span>{mode === 'login' ? 'Back' : 'Account'}</span></h2>
      </div>
      <form className="form-card" onSubmit={submit}>
        {mode === 'register' && (
          <div className="form-group fg-full">
            <label>Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </div>
        )}
        <div className="form-group fg-full">
          <label>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
        </div>
        <div className="form-group fg-full">
          <label>Password *</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <button className="continue-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}
