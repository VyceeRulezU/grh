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

  // Complete Profile State (for existing users upgrading)
  const [userId, setUserId] = useState(null);

  // Admin select state
  const [adminSelectedState, setAdminSelectedState] = useState('');

  // ── Render ───────────────────────────────────────────
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

      // Fetch profile to get state and role
      const { data: profile } = await supabase
        .from('profiles')
        .select('state, name, role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        setActiveTab('admin_select_state');
      } else if (!profile?.state) {
        // User exists but has no state attached (e.g. a student)
        setUserId(data.user.id);
        setSignupName(profile?.name || '');
        setActiveTab('complete_profile');
      } else {
        const stateName = profile.state;
        onSuccess(stateName);
      }
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setLoginError('Invalid login credentials. Please check your password.');
      } else {
        setLoginError(err.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Complete Profile (Upgrade existing account) ──
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (!signupState) {
      setSignupError('Please select your state.');
      return;
    }

    setSignupLoading(true);
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        name: signupName,
        state: signupState,
        role: 'state_official', // upgrade their role
      }, { onConflict: 'id' });

      onSuccess(signupState);
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
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
        setSignupError('This email is already registered. Please click Login instead. After logging in, you will be prompted to select your state.');
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
    <div
      className="slm-overlay"
      style={!isOpen ? { display: 'none' } : undefined}
      onClick={(e) => e.target.classList.contains('slm-overlay') && onClose()}
    >
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
        {(activeTab !== 'complete_profile' && activeTab !== 'admin_select_state') && (
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
        )}

        {/* ── COMPLETE PROFILE FORM (For Existing Users) ── */}
        {activeTab === 'complete_profile' && (
          <form className="slm-form" onSubmit={handleCompleteProfile}>
            <div className="slm-error" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined">info</span>
              It looks like you already have an account! Please select your state to upgrade your profile to a State Official.
            </div>

            <div className="slm-field">
              <label>Full Name / Department</label>
              <input
                type="text"
                placeholder="e.g. Kano State Ministry of Finance"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
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

            {signupError && <p className="slm-error"><span className="material-symbols-outlined">error</span>{signupError}</p>}

            <button type="submit" className="slm-submit" disabled={signupLoading}>
              {signupLoading ? 'Upgrading Account…' : 'Complete Registration'}
            </button>
            
            <p className="slm-switch">
              <span onClick={() => setActiveTab('login')}>Cancel</span>
            </p>
          </form>
        )}

        {/* ── ADMIN STATE SELECT ── */}
        {activeTab === 'admin_select_state' && (
          <form className="slm-form" onSubmit={(e) => {
            e.preventDefault();
            if (!adminSelectedState) return;
            onSuccess(adminSelectedState);
          }}>
            <div className="slm-error" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#6d28d9', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined">admin_panel_settings</span>
              Admin Account Detected: Please select which state portal you want to access.
            </div>

            <div className="slm-field">
              <label>Select State to View</label>
              <select
                value={adminSelectedState}
                onChange={(e) => setAdminSelectedState(e.target.value)}
                required
              >
                <option value="">— Select a state —</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="submit" className="slm-submit" disabled={!adminSelectedState}>
              Proceed to Portal
            </button>
            
            <p className="slm-switch">
              <span onClick={() => { setActiveTab('login'); supabase.auth.signOut(); }}>Cancel</span>
            </p>
          </form>
        )}

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
