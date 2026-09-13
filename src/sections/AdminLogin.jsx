import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const [error, setError] = useState(location.state?.error || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect them
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/admin', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Successful login will trigger the onAuthStateChanged redirect
    } catch (err) {
      let message = 'Something went wrong. Please try again.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Unable to connect. Please check your internet connection and try again.';
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Spade Arts</h2>
        <h3>Admin Login</h3>
        <form className="admin-login-form" onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              disabled={loading} 
              required 
            />
          </div>
          <div>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={loading} 
              required 
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <div className="admin-login-error">{error}</div>}
      </div>
    </div>
  );
};

export default AdminLogin;
