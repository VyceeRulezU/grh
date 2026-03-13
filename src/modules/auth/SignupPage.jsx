import React, { useState } from 'react';
import './LoginPage.css';
import logoMain from '../../assets/auth/logo-main.svg';
import googleIcon from '../../assets/auth/google-logo.svg';
import { supabase } from '../../lib/supabaseClient';
import StatusModal from '../../components/ui/StatusModal';
import { useModal } from '../../hooks/useModal';

const SignupPage = ({ onNavigate, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { modal, closeModal, showSuccess, showError, showWarning } = useModal();

  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  
  const strengthScore = Object.values(validations).filter(Boolean).length;
  const strengthLabel = strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Fair' : 'Strong';
  const strengthColor = strengthScore <= 2 ? '#ef4444' : strengthScore <= 4 ? '#f59e0b' : '#22c55e';
  
  const isPasswordValid = strengthScore === 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      showWarning('Weak Password', 'Please ensure your password meets all requirements.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Password Mismatch', "Passwords don't match. Please re-enter them.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'Learner' }
      }
    });
    setLoading(false);

    if (error) {
      showError('Signup Failed', error.message);
    } else {
      if (data?.user?.identities?.length === 0) {
        showWarning('Email Already Exists', 'An account with this email already exists. Please log in instead.',
          () => { closeModal(); onNavigate('login'); }
        );
      } else {
        showSuccess('Account Created!', 'Your account has been created successfully. You can now log in.',
          () => { closeModal(); onNavigate('login'); }
        );
      }
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // Where the user goes after login
      }
    });
    if (error) {
      console.error('Login error:', error.message);
    }
  };

  return (
    <>
      <StatusModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        icon={modal.icon}
        iconColor={modal.iconColor}
        iconBg={modal.iconBg}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        confirmLabel="OK"
        cancelLabel="Close"
      />
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
            Everything you need to learn, research, and explore governance in one hub.
          </p>
        </div>
      </div>

      <div className="auth-right-container">
        <div className="auth-form-card">
          <div className="auth-header-row">
            <h2 className="auth-welcome-title">Sign up to access the Hub</h2>
            <p className="auth-welcome-subtitle">
              Join to access verified resources and AI-powered governance insights.
            </p>
          </div>

          <form className="auth-form-box" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                className="auth-input-field" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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
              
              {password && (
                <div className="auth-password-complexity">
                  <div className="strength-meter-container">
                    <div className="strength-labels">
                      <span>Strength: <strong>{strengthLabel}</strong></span>
                    </div>
                    <div className="strength-bar-bg">
                      <div 
                        className="strength-bar-fill" 
                        style={{ 
                          width: `${(strengthScore / 5) * 100}%`,
                          backgroundColor: strengthColor
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
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
              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
              
              <p className="auth-or-divider">Or</p>
              
              <button type="button" className="auth-google-btn" onClick={handleGoogleLogin}>
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
    </>
  );
};

export default SignupPage;
