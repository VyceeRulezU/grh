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
import NotFoundPage from './modules/home/NotFoundPage'
import './App.css'

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
      'admin-login': 'Admin Login | GRH'
    };
    document.title = pageTitles[currentPage] || 'Governance Resource Hub';
  }, [currentPage]);

  const openAuth = (type = 'login') => {
    if (type === 'admin') {
      navigate('admin-login');
    } else {
      navigate(type);
    }
  };

  // Pages that require authentication
  const PROTECTED_PAGES = ['learn-player', 'learn-discovery', 'explore', 'student', 'course-player'];

  const navigate = (page) => {
    // Auth gate: redirect to login if trying to access protected pages without login
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
    const fullPath = `${base}${page === 'welcome' ? '' : page}`.replace(/\/+$/, '') || '/';
    window.history.pushState({}, '', fullPath);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
    // If user was redirected from a protected page, go back there
    const returnPage = localStorage.getItem('returnPage');
    if (returnPage) {
      localStorage.removeItem('returnPage');
      navigate(returnPage);
    }
  };

  const handleLogout = () => {
    setUser(null);
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
        {currentPage === 'assess' && <AssessPage onNavigate={navigate} />}
        {currentPage === 'analyse' && <AnalysePage onNavigate={navigate} />}
        {currentPage === 'student' && <StudentDashboard user={user} onNavigate={navigate} />}
        {currentPage === 'learn-discovery' && <CourseDiscovery onNavigate={navigate} />}
        {currentPage === 'admin' && user?.isAdmin && <AdminDashboard onNavigate={navigate} />}
        {currentPage === 'admin' && !user?.isAdmin && <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'learn-player' && <CoursePlayer onNavigate={navigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'signup' && <SignupPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'admin-login' && <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {!['welcome','learn','research','explore','assess','analyse','student','learn-discovery','admin','learn-player','login','signup','admin-login'].includes(currentPage) && (
          <NotFoundPage onNavigate={navigate} />
        )}
      </main>

      {['learn','research','assess','analyse','learn-discovery'].includes(currentPage) && <Footer onNavigate={navigate} />}

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
