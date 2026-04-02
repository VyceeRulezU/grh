import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import './LoginPage.css';
import logoMain from '../../assets/auth/logo-main.svg';
import googleIcon from '../../assets/auth/google-logo.svg';
import { supabase } from '../../services/supabase/supabaseClient';
import StatusModal from '../../shared/ui/StatusModal';
import { useModal } from '../../shared/hooks/useModal';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const SignupPage = ({ onNavigate, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { modal, closeModal, showSuccess, showError, showWarning } = useModal();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' }
  });
  
  const currentPassword = watch('password');



  const validations = {
    length: currentPassword?.length >= 8,
    uppercase: /[A-Z]/.test(currentPassword || ''),
    lowercase: /[a-z]/.test(currentPassword || ''),
    number: /[0-9]/.test(currentPassword || ''),
    special: /[^A-Za-z0-9]/.test(currentPassword || ''),
  };
  
  const strengthScore = Object.values(validations).filter(Boolean).length;
  const strengthLabel = strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Fair' : 'Strong';
  const strengthColor = strengthScore <= 2 ? '#ef4444' : strengthScore <= 4 ? '#f59e0b' : '#22c55e';
  
  const isPasswordValid = strengthScore === 5;

  const onSubmit = async (formData) => {
    if (!isPasswordValid) {
      showWarning('Weak Password', 'Please ensure your password meets all requirements.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName, role: 'learner' }
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

  // Google login removed for branding compliance

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

          <form className="auth-form-box" onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-input-group">
              <label htmlFor="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                className="auth-input-field" 
                placeholder="John Doe" 
                autoComplete="name"
                {...register('fullName')}
              />
              {errors.fullName && <span className="auth-error-msg">{errors.fullName.message}</span>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="auth-input-field" 
                placeholder="johndoe@email.com" 
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && <span className="auth-error-msg">{errors.email.message}</span>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  className="auth-input-field" 
                  placeholder="********" 
                  autoComplete="new-password"
                  {...register('password')}
                />
                <span 
                  className="material-symbols-outlined auth-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
              {errors.password && <span className="auth-error-msg">{errors.password.message}</span>}
              
              {currentPassword && (
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
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <span className="auth-error-msg">{errors.confirmPassword.message}</span>}
            </div>



            <div className="auth-button-stack">
              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
              <p className="auth-terms-text">
                By clicking Sign Up, you agree to the{' '}
                <span className="auth-link-text" onClick={() => onNavigate('privacy-policy')}>Privacy Policy</span>
                {' '}and{' '}
                <span className="auth-link-text" onClick={() => onNavigate('terms-of-service')}>Terms of Service</span>
                {' '}of Governance Resource Hub.
              </p>
              
              <p className="auth-or-divider">Or</p>
              
              <button type="button" className="auth-magic-btn" onClick={() => onNavigate('login')}>
                <span className="material-symbols-outlined">auto_fix_high</span>
                Use Magic Link (No Password)
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
