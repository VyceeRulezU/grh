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
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal animate-up" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}><i className="ri-close-line"></i></button>
        
        <div className="auth-header">
          <div className="auth-logo">
            <img src={LogoV2} alt="Logo" />
          </div>
          <h2 className="auth-title">{mode === 'login' ? 'Welcome Back' : 'Join the Hub'}</h2>
          <p className="auth-subtitle">{mode === 'login' ? 'Access your governance toolkit' : 'Start your excellence journey'}</p>
        </div>

        <div className="auth-mode-toggle">
          <button 
            className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <input type="text" placeholder="Full Name" required className="futuristic-input" />
            </div>
          )}
          
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              className="futuristic-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              required 
              className="futuristic-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? <i className="ri-loader-4-line animate-spin"></i> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="auth-social-wrap">
          <p>Or continue with</p>
          <div className="auth-social-btns">
            <button className="social-btn"><i className="ri-google-fill"></i></button>
            <button className="social-btn"><i className="ri-linkedin-box-fill"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
