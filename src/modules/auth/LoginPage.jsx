import React, { useState } from 'react';
import './LoginPage.css';
import logoMain from '../../assets/auth/logo-main.svg';
import googleIcon from '../../assets/auth/google-logo.svg';

const LoginPage = ({ onNavigate, onLogin, isAdmin = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    onLogin({ email: email || 'user@example.com', isAdmin });
    onNavigate('welcome');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-left-container">
        <div className="auth-title-row">
          <div className="auth-logo-box" onClick={() => onNavigate('welcome')}>
            <img src={logoMain} alt="GRH Logo" />
          </div>

          <button className="back-to-website-btn" onClick={() => onNavigate('welcome')}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Website
          </button>
        </div>

        <div className="auth-marketing-content">
          <h1 className="auth-marketing-title">
            {isAdmin ? 'Admin Portal for Governance Insights' : 'A Trusted Platform for Governance Knowledge'}
          </h1>
          <p className="auth-marketing-summary">
            {isAdmin 
              ? 'Manage courses, analyze data, and oversee the governance resource hub with specialized administrative tools.'
              : 'Access structured courses, verified research, and AI-assisted insights built to support informed decision-making.'}
          </p>
        </div>
      </div>

      <div className="auth-right-container">
        <div className="auth-form-card">
          <div className="auth-header-row">
            <h2 className="auth-welcome-title">{isAdmin ? 'Admin Login' : 'Welcome Back!'}</h2>
            <p className="auth-welcome-subtitle">
              {isAdmin 
                ? 'Authorized access only. Please log in with your administrative credentials.'
                : 'Log in to access courses, research materials, and intelligent tools that help you learn, analyse, and govern with confidence.'}
            </p>
          </div>

          <form className="auth-form-box" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="auth-input-field" 
                placeholder="johndoe@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  className="auth-input-field" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span 
                  className="material-symbols-outlined auth-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>

              <div className="auth-extras-row">
                <div className="auth-checkbox-group">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember Me</label>
                </div>
                <button type="button" className="auth-forgot-link">Forgot Password?</button>
              </div>
            </div>

            <div className="auth-button-stack">
              <button type="submit" className="auth-primary-btn">
                {isAdmin ? 'Admin Login' : 'Login'}
              </button>
              
              {!isAdmin && (
                <>
                  <p className="auth-or-divider">Or</p>
                  <button type="button" className="auth-google-btn">
                    <img src={googleIcon} alt="Google" />
                    Continue with Google
                  </button>
                  <p className="auth-switch-link">
                    Don't have an Account? <span className="auth-link-text" onClick={() => onNavigate('signup')}>Sign Up Here</span>
                  </p>
                </>
              )}
              
              {isAdmin && (
                <p className="auth-switch-link">
                  Not an Admin? <span className="auth-link-text" onClick={() => onNavigate('login')}>User Login</span>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
