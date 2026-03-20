import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import logoMain from '../../assets/auth/logo-main.svg';
import { supabase } from '../../services/supabase/supabaseClient';
import StatusModal from '../../shared/ui/StatusModal';
import { useModal } from '../../shared/hooks/useModal';

const ForgotPasswordPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { modal, closeModal, showSuccess, showError, showWarning } = useModal();



  const handleSubmit = async (e) => {
    e.preventDefault();
    


    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL || '/'}reset-password`
      });

      if (error) throw error;

      showSuccess(
        'Email Sent', 
        'If an account exists with this email, you will receive a password reset link shortly.',
        () => { closeModal(); onNavigate('login'); }
      );
    } catch (err) {
      showError('Reset Failed', err.message);
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
        onConfirm={modal.onConfirm || closeModal}
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
            <h1 className="auth-marketing-title">Recover Account</h1>
            <p className="auth-marketing-summary">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>

        <div className="auth-right-container">
          <div className="auth-form-card">
            <div className="auth-header-row">
              <h2 className="auth-welcome-title">Forgot Password?</h2>
              <p className="auth-welcome-subtitle">
                No worries! Just enter your email and we'll handle the rest.
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



              <div className="auth-button-stack">
                <button type="submit" className="auth-primary-btn" disabled={loading}>
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
                <p className="auth-switch-link">
                  Remembered your password? <span className="auth-link-text" onClick={() => onNavigate('login')}>Back to Login</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
