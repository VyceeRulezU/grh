import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import logoMain from '../../assets/auth/logo-main.svg';
import googleIcon from '../../assets/auth/google-logo.svg';
import { supabase } from '../../services/supabase/supabaseClient';
import StatusModal from '../../shared/ui/StatusModal';
import { useModal } from '../../shared/hooks/useModal';

const LoginPage = ({ onNavigate, onLogin, isAdmin = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { modal, closeModal, showError, showSuccess } = useModal();

  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();



    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (onLogin && data.user) {
        // Fetch profile immediately to ensure Admin status is recognized
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, name, avatar_url')
          .eq('id', data.user.id)
          .single();

        const userData = {
          email: data.user.email,
          id: data.user.id,
          name: profile?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          isAdmin: (profile?.role === 'Admin') || 
                   (data.user.user_metadata?.role === 'Admin') || 
                   (data.user.email?.toLowerCase().includes('admin') && !data.user.email?.toLowerCase().includes('learner')),
          avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url
        };
        
        onLogin(userData);
      }
    } catch (err) {
      showError('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) {
      showError('Email Required', 'Please enter your email to receive a magic link.');
      return;
    }



    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      showSuccess('Magic Link Sent!', 'Check your email for a login link. It may take a minute to arrive.');
    } catch (err) {
      showError('Magic Link Failed', err.message);
    } finally {
      setLoading(false);
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
        onConfirm={closeModal}
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
          <h1 className="auth-marketing-title">
            {isAdmin ? 'Admin Portal' : 'A Trusted Platform'}
          </h1>
          <p className="auth-marketing-summary">
            {isAdmin 
              ? 'Manage courses, analyze data, and oversee the hub.'
              : 'Access courses, verified research materials, and AI insights.'}
          </p>
        </div>
      </div>

      <div className="auth-right-container">
        <div className="auth-form-card">
          <div className="auth-header-row">
            <h2 className="auth-welcome-title">{isAdmin ? 'Admin Login' : 'Welcome Back!'}</h2>
            <p className="auth-welcome-subtitle">
              {isAdmin 
                ? 'Please log in with your administrative credentials.'
                : 'Log in to access your dashboard and governance tools.'}
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
                <button type="button" className="auth-forgot-link" onClick={() => onNavigate('forgot-password')}>Forgot Password?</button>
              </div>
            </div>



            <div className="auth-button-stack">
              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Verifying...' : (isAdmin ? 'Admin Login' : 'Login with Password')}
              </button>
              
              {!isAdmin && (
                <>
                  <p className="auth-or-divider">Or</p>
                  <button 
                    type="button" 
                    className="auth-magic-btn" 
                    onClick={handleMagicLink}
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined">auto_fix_high</span>
                    {loading ? 'Sending...' : 'Send Magic Link to Email'}
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
    </>
  );
};

export default LoginPage;
