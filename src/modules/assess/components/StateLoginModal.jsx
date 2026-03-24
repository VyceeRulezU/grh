import React, { useState } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import logoIcon from '../../../assets/images/Logo/Icon.png';
import './StateLoginModal.css';
import grhLogo from '../../../assets/images/Logo/GRH-icon.png';

const STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"
];

/**
 * StateLoginModal
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSuccess(stateName) – called when auth succeeds, passes state name
 */
const StateLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupState, setSignupState] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  if (!isOpen) return null;

  // ── Login ────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;

      // Fetch profile to get state
      const { data: profile } = await supabase
        .from('profiles')
        .select('state, name')
        .eq('id', data.user.id)
        .single();

      const stateName = profile?.state || 'Your State';
      onSuccess(stateName);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Signup ───────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (!signupState) {
      setSignupError('Please select your state.');
      return;
    }
    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters.');
      return;
    }

    setSignupLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { full_name: signupName, role: 'state_official', state: signupState }
        }
      });

      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        setSignupError('An account with this email already exists. Please log in.');
        setSignupLoading(false);
        return;
      }

      // Insert/upsert state into profiles table
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: signupName,
          state: signupState,
          role: 'state_official',
        }, { onConflict: 'id' });
      }

      onSuccess(signupState);
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="slm-overlay" onClick={(e) => e.target.classList.contains('slm-overlay') && onClose()}>
      <div className="slm-modal">
        {/* Close */}
        <button className="slm-close" onClick={onClose} aria-label="Close">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className="slm-header">
          <div className="slm-icon" style={{ background: 'transparent' }}>
            <img src={grhLogo} alt="GRH Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          </div>
          <h2>State Assessment Portal</h2>
          <p>Login or register your state to access and track governance assessments.</p>
        </div>

        {/* Tabs */}
        <div className="slm-tabs">
          <button
            className={`slm-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
          >
            Login
          </button>
          <button
            className={`slm-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setSignupError(''); }}
          >
            Register State
          </button>
        </div>

        {/* ── LOGIN FORM ── */}
        {activeTab === 'login' && (
          <form className="slm-form" onSubmit={handleLogin}>
            <div className="slm-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="state@example.gov.ng"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="slm-field">
              <label>Password</label>
              <div className="slm-pw-wrap">
                <input
                  type={showLoginPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="slm-eye" onClick={() => setShowLoginPw(!showLoginPw)}>
                  <span className="material-symbols-outlined">{showLoginPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {loginError && <p className="slm-error"><span className="material-symbols-outlined">error</span>{loginError}</p>}

            <button type="submit" className="slm-submit" disabled={loginLoading}>
              {loginLoading ? 'Signing in…' : 'Login as State'}
            </button>

            <p className="slm-switch">
              Don't have an account?{' '}
              <span onClick={() => setActiveTab('signup')}>Register your state</span>
            </p>
          </form>
        )}

        {/* ── SIGNUP FORM ── */}
        {activeTab === 'signup' && (
          <form className="slm-form" onSubmit={handleSignup}>
            <div className="slm-field">
              <label>Full Name / Department</label>
              <input
                type="text"
                placeholder="e.g. Kano State Ministry of Finance"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="slm-field">
              <label>State</label>
              <select
                value={signupState}
                onChange={(e) => setSignupState(e.target.value)}
                required
              >
                <option value="">— Select your state —</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="slm-field">
              <label>Official Email Address</label>
              <input
                type="email"
                placeholder="official@state.gov.ng"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="slm-field">
              <label>Create Password</label>
              <div className="slm-pw-wrap">
                <input
                  type={showSignupPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="slm-eye" onClick={() => setShowSignupPw(!showSignupPw)}>
                  <span className="material-symbols-outlined">{showSignupPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {signupError && <p className="slm-error"><span className="material-symbols-outlined">error</span>{signupError}</p>}

            <button type="submit" className="slm-submit" disabled={signupLoading}>
              {signupLoading ? 'Creating Account…' : 'Register & Access Portal'}
            </button>

            <p className="slm-switch">
              Already registered? <span onClick={() => setActiveTab('login')}>Log in</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default StateLoginModal;
