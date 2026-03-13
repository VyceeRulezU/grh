import { useState, useEffect, useRef } from 'react'
import { Analytics } from "@vercel/analytics/react"
import WelcomeGateway from './modules/home/WelcomeGateway'
import LearnLandingPage from './modules/learn/LearnLandingPage'
import Library from './modules/research/Library'
import ExplorePage from './modules/explore/ExplorePage'
import AssessPage from './modules/assess/AssessPage'
import AnalysePage from './modules/analyse/AnalysePage'
import CourseDiscovery from './modules/learn/CourseDiscovery'
import StudentDashboard from './modules/student/StudentDashboard'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminDashboard from './modules/admin/AdminDashboard'
import CoursePlayer from './modules/learn/CoursePlayer'
import AuthModal from './components/modals/AuthModal'
import LoginPage from './modules/auth/LoginPage'
import SignupPage from './modules/auth/SignupPage'
import AdminLoginPage from './modules/auth/AdminLoginPage'
import OAuthConsentPage from './modules/auth/OAuthConsentPage'
import PrivacyPolicy from './modules/legal/PrivacyPolicy'
import TermsOfService from './modules/legal/TermsOfService'
import NotFoundPage from './modules/home/NotFoundPage'
import StatusModal from './components/ui/StatusModal'
import './App.css'

const PROTECTED_PAGES = ['learn-player', 'learn-discovery', 'explore', 'student', 'course-player'];

function App() {
  const getPageFromUrl = () => {
    // Dynamically handle base path (e.g., /grh/ or /)
    const base = import.meta.env.BASE_URL || '/';
    const path = window.location.pathname.replace(base, '').replace(/^\//, '');
    const normalizedPath = (path === 'admin-dashboard' || path === 'admin-login') ? 'admin' : path;
    return normalizedPath || localStorage.getItem('currentPage') || 'welcome';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [statusModal, setStatusModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const lastLoginHandled = useRef(0);

  // Update document title dynamically
  useEffect(() => {
    const pageTitles = {
      'welcome': 'Governance Resource Hub | Excellence Redefined',
      'learn': 'Learn | GRH',
      'research': 'Library | GRH',
      'explore': 'Explore | GRH',
      'assess': 'Assess | GRH',
      'analyse': 'Analyse | GRH',
      'student': 'Student Dashboard | GRH',
      'learn-discovery': 'Courses | GRH',
      'admin': 'Admin Portal | GRH',
      'learn-player': 'Course Player | GRH',
      'login': 'Login | GRH',
      'signup': 'Signup | GRH',
      'admin-login': 'Admin Login | GRH',
      'oauth-consent': 'Authorize App | GRH',
      'privacy-policy': 'Privacy Policy | GRH',
      'terms-of-service': 'Terms of Service | GRH'
    };
    document.title = pageTitles[currentPage] || 'Governance Resource Hub';
  }, [currentPage]);

  // Listen for auth state changes (crucial for OAuth redirection)
  useEffect(() => {
    let subscription = null;
    
    const initAuth = async () => {
      try {
        const { supabase } = await import('./lib/supabaseClient');
        
        const fetchProfile = async (session) => {
          if (!session) return null;
          console.log("[GRH DEBUG] Internal fetchProfile Session UserID:", session.user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, name, avatar_url')
            .eq('id', session.user.id)
            .single();
          
          const isAdminVal = (profile?.role === 'Admin') || 
                             (session.user.user_metadata?.role === 'Admin') || 
                             (session.user.email?.toLowerCase().includes('admin') && !session.user.email?.toLowerCase().includes('learner')) ||
                             (session.user.email?.toLowerCase() === 'governanceresourcehub@gmail.com');

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
          setUser(userData);
          if (['login', 'signup', 'admin', 'admin-login'].includes(currentPage)) {
            handleLogin(userData);
          }
        }
        setAuthLoading(false);

        // Listen for changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[GRH DEBUG] Auth Event:", event);
          if (session) {
            const userData = await fetchProfile(session);
            setUser(userData);
            if (['login', 'signup', 'admin', 'admin-login'].includes(currentPage) && event === 'SIGNED_IN') {
              console.log("[GRH DEBUG] onAuthStateChange SIGNED_IN detected - calling handleLogin");
              handleLogin(userData);
            }
          } else {
            setUser(null);
          }
          setAuthLoading(false);
        });
        subscription = data.subscription;
      } catch (err) {
        console.warn('[GRH] Auth listener initialization failed:', err.message);
      }
    };

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
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
      const base = import.meta.env.BASE_URL || '/';
      window.history.pushState({}, '', `${base}login`);
    }
  }, [currentPage, user, authLoading]);

  const openAuth = (type = 'login') => {
    // Store current page as return target before navigating to auth
    if (!['login', 'signup', 'admin-login'].includes(currentPage)) {
      localStorage.setItem('returnPage', currentPage);
    }
    
    if (type === 'admin') {
      navigate('admin');
    } else {
      navigate(type);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const { supabase } = await import('./lib/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Internal fetchProfile logic is already defined in useEffect, 
        // but we need it here too. 
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const isAdminVal = (profile?.role === 'Admin') || 
                             (session.user.user_metadata?.role === 'Admin') || 
                             (session.user.email?.toLowerCase().includes('admin') && !session.user.email?.toLowerCase().includes('learner')) ||
                             (session.user.email?.toLowerCase() === 'governanceresourcehub@gmail.com');

        const userData = {
          email: session.user.email,
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          isAdmin: isAdminVal,
          role: profile?.role || session.user.user_metadata?.role || (isAdminVal ? 'Admin' : 'Learner'),
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url
        };
        setUser(userData);
        console.log("[GRH DEBUG] User refreshed:", userData);
      }
    } catch (err) {
      console.error("[GRH ERROR] Failed to refresh user:", err);
    }
  };

  const navigate = (page) => {
    const targetPage = typeof page === 'string' ? page : page.page;
    // Auth gate for protected pages
    if (PROTECTED_PAGES.includes(targetPage) && !user) {
      localStorage.setItem('returnPage', targetPage);
      setCurrentPage('login');
      const base = import.meta.env.BASE_URL || '/';
      window.history.pushState({}, '', `${base}login`);
      window.scrollTo(0, 0);
      return;
    }

    setCurrentPage(targetPage);
    localStorage.setItem('currentPage', targetPage);
    
    // Update browser URL without reload
    const base = import.meta.env.BASE_URL || '/';
    const cleanPage = typeof page === 'string' ? (page === 'welcome' ? '' : page) : (page.page === 'welcome' ? '' : page.page);
    const fullPath = `${base}${cleanPage}`.replace(/\/+$/, '') || '/';
    
    const navTarget = typeof page === 'string' ? page : page.page;
    window.history.pushState({ usr: typeof page === 'object' ? page : null }, '', fullPath);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    // Debounce to prevent double-alerts 
    const now = Date.now();
    if (now - lastLoginHandled.current < 2000) return false;
    lastLoginHandled.current = now;

    const isUserAdmin = userData.isAdmin || userData.fromAdminWall;
    
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

    setUser(userData);
    setShowAuth(false);
    const returnPage = localStorage.getItem('returnPage');
    localStorage.removeItem('returnPage'); 

    setStatusModal({
      isOpen: true,
      type: 'success',
      title: 'Login Successful',
      message: `Welcome back, ${userData.name}! ${isUserAdmin ? 'Entering Admin Portal...' : 'Redirecting to your dashboard...'}`,
      onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false }))
    });

    setTimeout(() => {
      setStatusModal(p => ({ ...p, isOpen: false }));
      
      if (isUserAdmin) {
        navigate('admin');
      } else if (returnPage && !['login', 'signup', 'welcome', 'admin'].includes(returnPage)) {
        navigate(returnPage);
      } else {
        navigate('student');
      }
    }, 1500);

    return true;
  };

  const handleLogout = async () => {
    const { supabase } = await import('./lib/supabaseClient');
    await supabase.auth.signOut();
    setUser(null);
    navigate('welcome');
  };

  return (
    <div className="app-container">
      {(currentPage !== 'welcome' && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'admin-login' && currentPage !== 'explore' && currentPage !== 'learn-player' && currentPage !== 'student' && currentPage !== 'admin') && (
        <Navbar 
          onNavigate={navigate} 
          currentPage={currentPage} 
          user={user} 
          onAuthClick={openAuth}
          onLogout={handleLogout}
        />
      )}
      
      <main className="main-content">
        {currentPage === 'welcome' && (
          <WelcomeGateway 
            onNavigate={navigate} 
            onAuthClick={openAuth} 
            user={user}
          />
        )}
        {currentPage === 'learn' && <LearnLandingPage onNavigate={navigate} />}
        {currentPage === 'research' && <Library onNavigate={navigate} />}
        {currentPage === 'explore' && <ExplorePage onNavigate={navigate} />}
        {currentPage === 'assess' && <NotFoundPage onNavigate={navigate} />}
        {currentPage === 'analyse' && <NotFoundPage onNavigate={navigate} />}
        {currentPage === 'help-center' && <NotFoundPage onNavigate={navigate} />}
        {currentPage === 'contact' && <NotFoundPage onNavigate={navigate} />}
        {currentPage === 'student' && <StudentDashboard user={user} onNavigate={navigate} onLogout={handleLogout} onRefreshUser={refreshUser} />}
        {currentPage === 'learn-discovery' && <CourseDiscovery onNavigate={navigate} />}
        {currentPage === 'admin' && user?.isAdmin && <AdminDashboard onNavigate={navigate} onLogout={handleLogout} user={user} onRefreshUser={refreshUser} />}
        {currentPage === 'admin' && !user?.isAdmin && <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'learn-player' && <CoursePlayer onNavigate={navigate} user={user} course={history.state?.usr?.course} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'signup' && <SignupPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'oauth-consent' && <OAuthConsentPage onNavigate={navigate} />}
        {currentPage === 'privacy-policy' && <PrivacyPolicy />}
        {currentPage === 'terms-of-service' && <TermsOfService />}
        {!['welcome','learn','research','explore','assess','analyse','help-center','contact','student','learn-discovery','admin','learn-player','login','signup','admin-login','oauth-consent','privacy-policy','terms-of-service'].includes(currentPage) && (
          <NotFoundPage onNavigate={navigate} />
        )}
      </main>

      {['learn','research','assess','analyse','learn-discovery','help-center','contact'].includes(currentPage) && <Footer onNavigate={navigate} />}

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
