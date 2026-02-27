import React, { useState } from 'react';
import './LoginPage.css'; // Shared styles with LoginPage
import logoMain from '../../assets/auth/logo-main.svg';
import googleIcon from '../../assets/auth/google-logo.svg';

const SignupPage = ({ onNavigate, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Simulate signup
    onLogin({ email: email || 'user@example.com', isAdmin: false });
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
            <span className="back-to-website-text">Back to Website</span>
          </button>
        </div>

        <div className="auth-marketing-content">
          <h1 className="auth-marketing-title">Governance Resource Hub</h1>
          <p className="auth-marketing-summary">
            Everything you need to learn, research, and explore governance. Join the hub to access exclusive resources.
          </p>
        </div>
      </div>

      <div className="auth-right-container">
        <div className="auth-form-card">
          <div className="auth-header-row">
            <h2 className="auth-welcome-title">Sign up to access the Hub</h2>
            <p className="auth-welcome-subtitle">
              Sign in to continue learning, research trusted resources, and explore AI-powered insights designed to support effective Governance.
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
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="confirmPassword" 
                  className="auth-input-field" 
                  placeholder="********" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-button-stack">
              <button type="submit" className="auth-primary-btn">Sign Up</button>
              
              <p className="auth-or-divider">Or</p>
              
              <button type="button" className="auth-google-btn">
                <img src={googleIcon} alt="Google" />
                Continue with Google
              </button>
              
              <p className="auth-switch-link">
                Already have an Account? <span className="auth-link-text" onClick={() => onNavigate('login')}>Log in Here</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
