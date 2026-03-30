import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from './shared/layout/Navbar'
import Footer from './shared/layout/Footer'
import AuthModal from './shared/ui/AuthModal'
import StatusModal from './shared/ui/StatusModal'
import './App.css'

// ── Lazy-loaded pages (each becomes its own JS chunk) ──────────────────────
const WelcomeGateway     = lazy(() => import('./modules/home/WelcomeGateway'));
const LearnLandingPage   = lazy(() => import('./modules/learn/pages/LearnLandingPage'));
const Library            = lazy(() => import('./modules/research/pages/Library'));
const ExplorePage        = lazy(() => import('./modules/explore/pages/ExplorePage'));
const AssessPage         = lazy(() => import('./modules/assess/pages/AssessPage'));
const AnalysePage        = lazy(() => import('./modules/analyse/pages/AnalysePage'));
const CourseDiscovery    = lazy(() => import('./modules/learn/pages/CourseDiscovery'));
const AboutUs            = lazy(() => import('./modules/about/pages/AboutUs'));
const StudentDashboard   = lazy(() => import('./modules/student/StudentDashboard'));
const AdminDashboard     = lazy(() => import('./modules/admin/AdminDashboard'));
const CoursePlayer       = lazy(() => import('./modules/learn/pages/CoursePlayer'));
const CourseDetails      = lazy(() => import('./modules/learn/pages/CourseDetails'));
const LoginPage          = lazy(() => import('./modules/auth/LoginPage'));
const SignupPage          = lazy(() => import('./modules/auth/SignupPage'));
const AdminLoginPage     = lazy(() => import('./modules/auth/AdminLoginPage'));
const OAuthConsentPage   = lazy(() => import('./modules/auth/OAuthConsentPage'));
const PrivacyPolicy      = lazy(() => import('./modules/legal/PrivacyPolicy'));
const TermsOfService     = lazy(() => import('./modules/legal/TermsOfService'));
const ForgotPasswordPage = lazy(() => import('./modules/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./modules/auth/ResetPasswordPage'));
const NotFoundPage       = lazy(() => import('./modules/home/NotFoundPage'));

// Minimal spinner shown while a lazy page chunk is loading
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
    <div className="spinner" />
    <p style={{ color: 'var(--text-soft, #64748b)', fontSize: '0.9rem' }}>Loading...</p>
  </div>
);


const PROTECTED_PAGES = ['learn-player', 'learn-discovery', 'explore', 'student', 'course-player'];

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -8,
  },
};

const pageTransition = {
  type: "tween",
  ease: "circOut",
  duration: 0.3,
};

function App() {
  const getPageFromUrl = () => {
    if (typeof window === 'undefined') return 'welcome';
    const base = import.meta.env.BASE_URL || '/';
    const path = window.location.pathname.replace(base, '').replace(/^\//, '').replace(/\/$/, '');
    let normalizedPath = path || 'welcome';
    
    // Core Naming Synchronization
    if (normalizedPath === 'admin-dashboard' || normalizedPath === 'admin-login') normalizedPath = 'admin';
    if (normalizedPath === 'library') normalizedPath = 'research'; 
    
    return normalizedPath;
  };

  const getNavDataFromSession = () => {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem('navData');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl);
  const [navData, setNavData] = useState(getNavDataFromSession);
  const [user, setUser] = useState(null);
  // Keep a ref in sync so closures (e.g. setTimeout) always read the latest user
  const setUserAndRef = (u) => { userRef.current = u; setUser(u); };
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [statusModal, setStatusModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const lastLoginHandled = useRef(0);
  const loginNavigated = useRef(false);
  const currentPageRef = useRef(currentPage);
  const userRef = useRef(null);

  // Listen for auth state changes (crucial for OAuth redirection)
  useEffect(() => {
    let subscription = null;
    
    const initAuth = async () => {
      try {
        const { supabase } = await import('./services/supabase/supabaseClient');
        
        const fetchProfile = async (session) => {
          if (!session) return null;
          console.log("[GRH DEBUG] Internal fetchProfile Session UserID:", session.user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, name, avatar_url')
            .eq('id', session.user.id)
            .single();
          
          const isAdminVal = (profile?.role?.toLowerCase() === 'admin') || 
                             (session.user.user_metadata?.role?.toLowerCase() === 'admin');

          const result = {
            email: session.user.email,
            id: session.user.id,
            name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            isAdmin: isAdminVal,
            role: profile?.role || session.user.user_metadata?.role || (isAdminVal ? 'Admin' : 'Learner'),
            avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url
          };
          console.log("[GRH DEBUG] fetchProfile result:", result);
          return result;
        };

        // Check initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          const userData = await fetchProfile(initialSession);
          setUserAndRef(userData);
          
          // Restore navData if it exists
          try {
            const savedNavData = sessionStorage.getItem('navData');
            if (savedNavData) {
              setNavData(JSON.parse(savedNavData));
            }
          } catch (e) {
            console.warn("Failed to restore navData:", e);
          }

          if (['login', 'signup', 'admin', 'admin-login', 'forgot-password', 'reset-password'].includes(currentPage)) {
            handleLogin(userData);
          }
        }
        setAuthLoading(false);

        // Listen for changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[GRH DEBUG] Auth Event:", event);
          if (session) {
            const userData = await fetchProfile(session);
            setUserAndRef(userData);
            if (['login', 'signup', 'admin', 'admin-login', 'forgot-password', 'reset-password'].includes(currentPageRef.current) && event === 'SIGNED_IN') {
              console.log("[GRH DEBUG] onAuthStateChange SIGNED_IN detected - calling handleLogin");
              handleLogin(userData);
            }
          } else {
            setUserAndRef(null);
          }
          setAuthLoading(false);
        });
        subscription = data.subscription;
      } catch (err) {
        console.warn('[GRH] Auth listener initialization failed:', err.message);
      }
    };

    initAuth();
    
    // Listen for browser Back/Forward buttons
    const handlePopState = (event) => {
      const page = getPageFromUrl();
      setCurrentPage(page);
      currentPageRef.current = page;
      
      // Try to restore navData from history state
      if (event.state && event.state.usr) {
        setNavData(event.state.usr);
      } else {
        setNavData(getNavDataFromSession());
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (subscription) subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Enforce authentication for protected pages on change/load
  useEffect(() => {
    if (authLoading) return; // Wait for session check
    
    const isProtected = PROTECTED_PAGES.includes(currentPage);
    if (isProtected && !user) {
      console.log("[GRH DEBUG] Auth Gate triggered for:", currentPage, "User:", user);
      localStorage.setItem('returnPage', currentPage);
      setCurrentPage('login');
      currentPageRef.current = 'login';
      const base = import.meta.env.BASE_URL || '/';
      window.history.pushState({}, '', `${base}login`);
    }
  }, [currentPage, user, authLoading]);

  const openAuth = (type = 'login') => {
    // Store current page as return target before navigating to auth
    if (!['login', 'signup', 'admin-login', 'forgot-password', 'reset-password'].includes(currentPage)) {
      localStorage.setItem('returnPage', currentPage);
    }
    loginNavigated.current = false; // reset so next login attempt can navigate
    
    if (type === 'admin') {
      navigate('admin');
    } else {
      navigate(type);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const { supabase } = await import('./services/supabase/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Internal fetchProfile logic is already defined in useEffect, 
        // but we need it here too. 
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, name, avatar_url')
          .eq('id', session.user.id)
          .single();
        
        const isAdminVal = (profile?.role?.toLowerCase() === 'admin') || 
                             (session.user.user_metadata?.role?.toLowerCase() === 'admin');

        const userData = {
          email: session.user.email,
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          isAdmin: isAdminVal,
          role: profile?.role || session.user.user_metadata?.role || (isAdminVal ? 'Admin' : 'Learner'),
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url
        };
        setUserAndRef(userData);
        console.log("[GRH DEBUG] User refreshed:", userData);
      }
    } catch (err) {
      console.error("[GRH ERROR] Failed to refresh user:", err);
    }
  };

  const navigate = (page, data = null) => {
    const targetPage = typeof page === 'string' ? page : page.page;
    const targetData = typeof page === 'string' ? data : (page?.usr || data);
    
    console.log(`[GRH DEBUG] Navigating to: ${targetPage}`, { data: targetData });
    // Auth gate for protected pages — use ref so stale closures always see current user
    if (PROTECTED_PAGES.includes(targetPage) && !userRef.current) {
      localStorage.setItem('returnPage', targetPage);
      setCurrentPage('login');
      currentPageRef.current = 'login';
      loginNavigated.current = false;
      const base = import.meta.env.BASE_URL || '/';
      window.history.pushState({}, '', `${base}login`);
      window.scrollTo(0, 0);
      return;
    }

    // Reset login navigation flag when navigating to an auth page
    if (['login', 'signup', 'admin-login', 'forgot-password'].includes(targetPage)) {
      loginNavigated.current = false;
    }

    setCurrentPage(targetPage);
    currentPageRef.current = targetPage;
    setNavData(targetData);
    localStorage.setItem('currentPage', targetPage);
    if (targetData) {
      sessionStorage.setItem('navData', JSON.stringify(targetData));
    } else {
      sessionStorage.removeItem('navData');
    }
    
    // Update browser URL without reload
    const base = import.meta.env.BASE_URL || '/';
    const cleanPage = typeof page === 'string' ? (page === 'welcome' ? '' : page) : (page.page === 'welcome' ? '' : page.page);
    const fullPath = `${base}${cleanPage}`.replace(/\/+$/, '') || '/';
    
    const navTarget = typeof page === 'string' ? page : page.page;
    window.history.pushState({ usr: targetData }, '', fullPath);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    // If they came from the admin wall but aren't an admin, BLOCK THEM immediately
    if (userData.fromAdminWall && !userData.isAdmin) {
      setUser(null);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Access Denied',
        message: 'You do not have administrative privileges to access this area.',
        onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false }))
      });
      return false;
    }

    setUserAndRef(userData);
    setShowAuth(false);

    // Show welcome modal only once per login event
    const now = Date.now();
    const alreadyShownModal = now - lastLoginHandled.current < 2000;
    if (!alreadyShownModal) {
      lastLoginHandled.current = now;
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${userData.name}!`,
        onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false }))
      });
    }

    // Navigate only once — whichever call arrives first wins (Supabase event vs Modal callback)
    if (loginNavigated.current) {
      console.log("[GRH DEBUG] handleLogin suppressed: Navigation already in progress.");
      return true;
    }
    
    loginNavigated.current = true;

    const returnPageManual = localStorage.getItem('returnPage');
    const returnPageUrl = getPageFromUrl(); // Fallback to current URL if storage is empty
    const isUserAdmin = userData.isAdmin || userData.fromAdminWall;
    
    // Prioritize institutional stay-put behavior
    const STAY_PUT_PAGES = ['learn', 'research', 'library', 'explore', 'about', 'assess', 'analyse', 'learn-discovery', 'privacy-policy', 'terms-of-service'];
    
    // Destination calculation: Admin > Manual Return Page > Current URL Page > Dashboard
    let destination = isUserAdmin ? 'admin' : 'student';
    
    if (!isUserAdmin) {
      if (returnPageManual && STAY_PUT_PAGES.includes(returnPageManual)) {
        destination = returnPageManual;
      } else if (STAY_PUT_PAGES.includes(returnPageUrl)) {
        destination = returnPageUrl;
      }
    }

    console.log("[GRH DEBUG] Login calculated destination:", destination, { manual: returnPageManual, url: returnPageUrl });

    setTimeout(() => {
      setStatusModal(p => ({ ...p, isOpen: false }));
      localStorage.removeItem('returnPage'); 
      loginNavigated.current = false;
      navigate(destination);
    }, 600);

    return true;
  };

  const handleLogout = async () => {
    const { supabase } = await import('./services/supabase/supabaseClient');
    await supabase.auth.signOut();
    setUserAndRef(null);
    navigate('welcome');
  };

  return (
    <div className="app-container">
      <Helmet>
        <title>Governance Resource Hub | Excellence Redefined</title>
        <meta name="description" content="GRH is a premium educational platform dedicated to excellence in governance, policy research, and public leadership training." />
        <link rel="canonical" href={`https://www.governanceresourcehub.com/${currentPage === 'welcome' ? '' : currentPage}`} />
      </Helmet>
      {(currentPage !== 'welcome' && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'admin-login' && currentPage !== 'forgot-password' && currentPage !== 'reset-password' && currentPage !== 'explore' && currentPage !== 'learn-player' && currentPage !== 'student' && currentPage !== 'admin') && (
        <Navbar 
          onNavigate={navigate} 
          currentPage={currentPage} 
          user={user} 
          onAuthClick={openAuth}
          onLogout={handleLogout}
        />
      )}
      
      <main className="main-content">
        {authLoading && PROTECTED_PAGES.includes(currentPage) ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-soft, #64748b)' }}>Verifying session...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="page-wrapper"
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <Suspense fallback={<PageLoader />}>
                {currentPage === 'welcome' && (
                  <WelcomeGateway 
                    onNavigate={navigate} 
                    onAuthClick={openAuth} 
                    user={user}
                  />
                )}
                {currentPage === 'learn' && <LearnLandingPage onNavigate={navigate} />}
                {currentPage === 'research' && <Library onNavigate={navigate} />}
                {currentPage === 'explore' && <ExplorePage user={user} onNavigate={navigate} />}
                {currentPage === 'assess' && <AssessPage onNavigate={navigate} />}
                {currentPage === 'analyse' && <AnalysePage onNavigate={navigate} />}
                {currentPage === 'about' && <AboutUs onNavigate={navigate} />}
                {currentPage === 'help-center' && <NotFoundPage onNavigate={navigate} />}
                {currentPage === 'contact' && <NotFoundPage onNavigate={navigate} />}
                {currentPage === 'student' && <StudentDashboard user={user} onNavigate={navigate} onLogout={handleLogout} onRefreshUser={refreshUser} />}
                {currentPage === 'learn-discovery' && <CourseDiscovery onNavigate={navigate} />}
                {currentPage === 'admin' && user?.isAdmin && <AdminDashboard onNavigate={navigate} onLogout={handleLogout} user={user} onRefreshUser={refreshUser} />}
                {currentPage === 'admin' && !user?.isAdmin && <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />}
                {currentPage === 'learn-player' && <CoursePlayer onNavigate={navigate} user={user} course={navData} />}
                {currentPage === 'learn-details' && <CourseDetails onNavigate={navigate} user={user} course={navData} />}
                {currentPage === 'login' && <LoginPage onNavigate={navigate} onLogin={handleLogin} />}
                {currentPage === 'signup' && <SignupPage onNavigate={navigate} onLogin={handleLogin} />}
                {currentPage === 'oauth-consent' && <OAuthConsentPage onNavigate={navigate} />}
                {currentPage === 'privacy-policy' && <PrivacyPolicy />}
                {currentPage === 'terms-of-service' && <TermsOfService />}
                {currentPage === 'reset-password' && <ResetPasswordPage onNavigate={navigate} />}
                {!['welcome','learn','research','explore','assess','analyse','about','help-center','contact','student','learn-discovery','admin','learn-player','learn-details','login','signup','admin-login','oauth-consent','privacy-policy','terms-of-service', 'forgot-password', 'reset-password'].includes(currentPage) && (
                  <NotFoundPage onNavigate={navigate} />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {['learn','research','assess','analyse','about','learn-discovery','help-center','contact', 'privacy-policy', 'terms-of-service'].includes(currentPage) && <Footer onNavigate={navigate} />}

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onLogin={handleLogin}
        initialType={authType}
      />

      <StatusModal 
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onConfirm={statusModal.onConfirm || (() => setStatusModal(p => ({ ...p, isOpen: false })))}
        confirmLabel="Continue"
      />
      <Analytics />
    </div>
  );
}

export default App
