import React from 'react'
import NotFoundPage from '../../src/modules/home/NotFoundPage'
import Navbar from '../../src/shared/layout/Navbar'
import Footer from '../../src/shared/layout/Footer'

export default function Page() {
  const handleNavigate = (page) => {
    // Standard navigation for error recovery
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <div className="app-container">
      <Navbar onNavigate={handleNavigate} currentPage="not-found" user={null} />
      <main className="main-content">
        <NotFoundPage onNavigate={handleNavigate} />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
