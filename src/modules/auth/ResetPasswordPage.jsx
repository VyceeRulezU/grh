import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import logoMain from '../../assets/auth/logo-main.svg';
import { supabase } from '../../services/supabase/supabaseClient';
import StatusModal from '../../shared/ui/StatusModal';
import { useModal } from '../../shared/hooks/useModal';

const ResetPasswordPage = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      showSuccess(
        'Password Updated', 
        'Your password has been reset successfully. You can now log in with your new password.',
        () => { closeModal(); onNavigate('login'); }
      );
    } catch (err) {
      showError('Update Failed', err.message);
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
            <h1 className="auth-marketing-title">New Password</h1>
            <p className="auth-marketing-summary">
              Create a strong new password for your account to keep it secure.
            </p>
          </div>
        </div>

        <div className="auth-right-container">
          <div className="auth-form-card">
            <div className="auth-header-row">
              <h2 className="auth-welcome-title">Set New Password</h2>
              <p className="auth-welcome-subtitle">
                Please enter and confirm your new password below.
              </p>
            </div>

            <form className="auth-form-box" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label htmlFor="password">New Password</label>
                <div className="auth-password-wrapper">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    className="auth-input-field" 
                    placeholder="********" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="auth-password-wrapper">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="confirmPassword" 
                    className="auth-input-field" 
                    placeholder="********" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="auth-button-stack">
                <button type="submit" className="auth-primary-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
