import React, { useState } from 'react';
import Button from '../ui/Button';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: email.split('@')[0], isLogged: true });
      onClose();
    }, 1500);
  };

  return (
    <div className="auth-overlay glass" onClick={onClose}>
      <div className="auth-modal animate-up" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}><i className="ri-close-line"></i></button>
        
        <div className="auth-header">
          <h2 className="apple-title-xs">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Enter your credentials to access the hub' : 'Join the global governance community today'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <i className="ri-user-line"></i>
                <input type="text" placeholder="John Doe" required />
              </div>
            </div>
          )}
          
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <i className="ri-mail-line"></i>
              <input 
                type="email" 
                placeholder="name@institution.gov" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <i className="ri-lock-line"></i>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            disabled={loading}
          >
            {loading ? <i className="ri-loader-4-line animate-spin"></i> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-social">
          <button className="social-btn"><i className="ri-google-fill"></i></button>
          <button className="social-btn"><i className="ri-linkedin-box-fill"></i></button>
          <button className="social-btn"><i className="ri-github-fill"></i></button>
        </div>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
