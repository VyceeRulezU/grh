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
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
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
      {(currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'admin-login' && currentPage !== 'explore') && (
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
        {currentPage === 'admin' && <AdminDashboard onNavigate={navigate} />}
        {currentPage === 'learn-player' && <CoursePlayer onNavigate={navigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'signup' && <SignupPage onNavigate={navigate} onLogin={handleLogin} />}
        {currentPage === 'admin-login' && <AdminLoginPage onNavigate={navigate} onLogin={handleLogin} />}
      </main>

      {(currentPage !== 'explore' && currentPage !== 'learn-player' && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'admin-login') && <Footer onNavigate={navigate} />}

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
