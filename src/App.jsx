import { useState, useEffect } from 'react'
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
import './App.css'

const PROTECTED_PAGES = ['learn-player', 'learn-discovery', 'explore', 'student', 'course-player'];

function App() {
  const getPageFromUrl = () => {
    // Dynamically handle base path (e.g., /grh/ or /)
    const base = import.meta.env.BASE_URL || '/';
    const path = window.location.pathname.replace(base, '').replace(/^\//, '');
    return path || localStorage.getItem('currentPage') || 'welcome';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState('login');

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
        
        // Check initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser({
            email: session.user.email,
            id: session.user.id,
            isAdmin: session.user.email?.toLowerCase().includes('admin') || session.user.app_metadata?.role === 'admin'
          });
        }

        // Listen for changes
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setUser({
              email: session.user.email,
              id: session.user.id,
              isAdmin: session.user.email?.toLowerCase().includes('admin') || session.user.app_metadata?.role === 'admin'
            });
          } else {
            setUser(null);
          }
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
    if (PROTECTED_PAGES.includes(currentPage) && !user) {
      localStorage.setItem('returnPage', currentPage);
      setCurrentPage('login');
      const base = import.meta.env.BASE_URL || '/';
      window.history.pushState({}, '', `${base}login`);
    }
  }, [currentPage, user]);

  const openAuth = (type = 'login') => {
    // Store current page as return target before navigating to auth
    if (!['login', 'signup', 'admin-login'].includes(currentPage)) {
      localStorage.setItem('returnPage', currentPage);
    }
    
    if (type === 'admin') {
      navigate('admin-login');
    } else {
      navigate(type);
    }
  };

  const navigate = (page) => {
    // Auth gate for protected pages
    if (PROTECTED_PAGES.includes(page) && !user) {
      localStorage.setItem('returnPage', page);
      setCurrentPage('login');
      const base = import.meta.env.BASE_URL || '/';
      window.history.pushState({}, '', `${base}login`);
      window.scrollTo(0, 0);
      return;
    }

    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    
    // Update browser URL without reload
    const base = import.meta.env.BASE_URL || '/';
    const cleanPage = page === 'welcome' ? '' : page;
    const fullPath = `${base}${cleanPage}`.replace(/\/+$/, '') || '/';
    window.history.pushState({}, '', fullPath);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
    
    const returnPage = localStorage.getItem('returnPage');
    if (returnPage && returnPage !== 'login' && returnPage !== 'signup' && returnPage !== 'admin-login') {
      localStorage.removeItem('returnPage');
      navigate(returnPage);
      return true;
    }
    
    // Default redirections
    if (userData.isAdmin) {
      navigate('admin');
    } else {
      navigate('welcome');
    }
    return true;
  };

  const handleLogout = () => {
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
        {currentPage === 'student' && <StudentDashboard user={user} onNavigate={navigate} onLogout={handleLogout} />}
        {currentPage === 'learn-discovery' && <CourseDiscovery onNavigate={navigate} />}
        {currentPage === 'admin' && user?.isAdmin && <AdminDashboard onNavigate={navigate} onLogout={handleLogout} user={user} />}
        {currentPage === 'admin' && !user?.isAdmin && <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'learn-player' && <CoursePlayer onNavigate={navigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'signup' && <SignupPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'admin-login' && <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />}
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
      <Analytics />
    </div>
  );
}

export default App
