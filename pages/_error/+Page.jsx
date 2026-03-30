import React from 'react'
import NotFoundPage from '../../src/modules/home/NotFoundPage'
import Navbar from '../../src/shared/layout/Navbar'
import Footer from '../../src/shared/layout/Footer'

export default function Page() {
  const handleNavigate = (page) => {
    if (typeof window === 'undefined') return;

    // Mapping internal SPA page names to real URLs for Vike cross-page transitions
    const routes = {
      'welcome': '/',
      'login': '/login',
      'signup': '/signup',
      'admin': '/admin',
      'admin-login': '/admin',
      'privacy-policy': '/privacy-policy',
      'terms-of-service': '/terms-of-service',
      'help-center': '/help-center',
      'contact': '/help-center', // Map to help center as a fallback
      'research': '/library',
      'learn': '/learn',
      'assess': '/assess',
      'analyse': '/analyse',
      'about': '/about'
    };

    const targetPath = routes[page] || `/${page}`;
    window.location.href = targetPath;
  };

  return (
    <div className="app-container">
      <Navbar 
        onNavigate={handleNavigate} 
        onAuthClick={() => handleNavigate('login')}
        currentPage="not-found" 
        user={null} 
      />
      <main className="main-content">
        <NotFoundPage onNavigate={handleNavigate} />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
