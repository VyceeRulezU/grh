import { useState } from 'react'
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
    const path = window.location.pathname.replace(/\/grh\/?/, '').replace(/^\//, '');
    return path || localStorage.getItem('currentPage') || 'welcome';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState('login');

  const openAuth = (type = 'login') => {
    if (type === 'admin') {
      navigate('admin-login');
    } else {
      navigate(type);
    }
  };

  const navigate = (page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    // Update browser URL without reload
    const base = import.meta.env.BASE_URL || '/';
    window.history.pushState({}, '', `${base}${page === 'welcome' ? '' : page}`);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="app-container">
      {(currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'admin-login' && currentPage !== 'explore' && currentPage !== 'learn-player' && currentPage !== 'student' && currentPage !== 'admin') && (
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

      {['welcome','learn','research','assess','analyse','learn-discovery'].includes(currentPage) && <Footer onNavigate={navigate} />}

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onLogin={handleLogin}
        initialType={authType}
      />
    </div>
  );
}

export default App
