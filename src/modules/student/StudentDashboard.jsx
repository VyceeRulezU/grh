import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import './StudentDashboard.css';

const MY_COURSES = [
  { id: 1, title: "UX Research & Case Study Prepare", instructor: "Marvin McKinney", progress: 80, level: "Advance", next: "Apr 27, 2024 7:33 am", icon: "ri-government-line" },
  { id: 2, title: "Figma Advanced Prototype", instructor: "Kathryn Murphy", progress: 60, level: "Medium", next: "Apr 1, 2024 11:12 pm", icon: "ri-bank-card-line" },
  { id: 3, title: "UX Law Study with Real Example", instructor: "Darlene Robertson", progress: 20, level: "Beginner", next: "Apr 24, 2024 12:39 am", icon: "ri-scales-3-line" },
];

const RECOMMENDED = [
  { id: 101, title: "The Ultimate Guide to Usability Testing and UX Law", price: "$12", level: "Advance", type: "Live Class", lessons: "24 Class" },
  { id: 102, title: "How to do quality UX Audit for e-commerce website", price: "$16", level: "Advance", type: "Live Class", lessons: "24 Class" },
];

const NAV_GROUPS = [
  {
    label: "Learning",
    links: [
      { name: 'Home',           icon: 'ri-home-fill' },
      { name: 'Courses',        icon: 'ri-book-fill',       badge: '3' },
      { name: 'Tutorials',      icon: 'ri-movie-fill' },
      { name: 'Workshop',       icon: 'ri-tools-fill' },
    ]
  },
  {
    label: "Library",
    links: [
      { name: 'Bookmark',       icon: 'ri-bookmark-fill' },
      { name: 'Resources',      icon: 'ri-folder-fill' },
    ]
  },
  {
    label: "Progress",
    links: [
      { name: 'Certifications', icon: 'ri-award-fill', badge: '1' },
    ]
  }
];

const StudentDashboard = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab]   = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const name = user?.name || "Alex";

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <i className={sidebarOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
      </button>

      <div className="student-dashboard-wrapper">
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ===== SIDEBAR ===== */}
        <aside className={`student-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-logo">
            <img src="/assets/images/Logo/Main logo.png" alt="Governance Resource Hub" />
          </div>

          <nav className="sidebar-nav">
            {NAV_GROUPS.map(group => (
              <React.Fragment key={group.label}>
                <span className="sidebar-section-label">{group.label}</span>
                {group.links.map(link => (
                  <button
                    key={link.name}
                    className={`sidebar-link ${activeTab === link.name ? 'active' : ''}`}
                    onClick={() => { setActiveTab(link.name); setSidebarOpen(false); }}
                  >
                    <i className={link.icon}></i>
                    {link.name}
                    {link.badge && <span className="link-badge">{link.badge}</span>}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </nav>

          <div className="sidebar-footer">
            <span className="sidebar-section-label">Account</span>
            <button className="sidebar-link"><i className="ri-settings-fill"></i> Settings</button>
            <button className="sidebar-link"><i className="ri-question-fill"></i> Help Center</button>
            <button className="sidebar-link" onClick={() => onNavigate('welcome')}>
              <i className="ri-arrow-left-line"></i> Back to Site
            </button>
          </div>
        </aside>

        {/* ===== MAIN ===== */}
        <main className="student-main">
          {/* Topbar */}
          <header className="student-topbar">
            <div className="topbar-welcome">
              <span role="img" aria-label="wave">👋</span>
              <div>
                <h3>Welcome back, {name}!</h3>
                <p>Continue your governance learning journey.</p>
              </div>
            </div>
            <div className="topbar-search">
              <i className="ri-search-line"></i>
              <input type="text" placeholder="Search courses, resources..." />
            </div>
            <div className="topbar-actions">
              <button className="action-btn"><i className="ri-notification-fill"></i></button>
              <div className="user-profile">
                <div className="user-avatar">{name[0].toUpperCase()}</div>
                <div className="user-info">
                  <strong>{name}</strong>
                  <span>Governance Learner</span>
                </div>
              </div>
            </div>
          </header>

          {/* ===== SCROLLABLE CONTENT AREA ===== */}
          <div className="content-area">

            {/* Course progress table */}
            <section className="courses-progress-section">
              <div className="progress-card">
                <div className="section-header" style={{marginBottom: '1rem'}}>
                  <h3>My Courses</h3>
                  <button className="view-all" onClick={() => onNavigate('learn-discovery')}>View All</button>
                </div>
                <div className="table-header">
                  <span>Course Name</span>
                  <span>Instructor</span>
                  <span>Progress</span>
                  <span>Level</span>
                  <span>Next Assignment</span>
                  <span></span>
                </div>
                <div className="table-body">
                  {MY_COURSES.map(course => (
                    <div key={course.id} className="table-row">
                      <span className="course-name-cell">
                        <i className={course.icon}></i>
                        {course.title}
                      </span>
                      <span>{course.instructor}</span>
                      <div className="progress-cell">
                        <div className="prog-bar"><div className="prog-fill" style={{ width: `${course.progress}%` }}></div></div>
                        <span>{course.progress}%</span>
                      </div>
                      <span><span className={`badge ${course.level.toLowerCase()}`}>{course.level}</span></span>
                      <span>{course.next}</span>
                      <button className="row-action" onClick={() => onNavigate('learn-player')}><i className="ri-play-circle-fill"></i></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stats-sidebar">
                <div className="stat-box">
                  <div className="stat-icon blue"><i className="ri-book-open-fill"></i></div>
                  <div><strong>24 Courses</strong><span>Enrolled</span></div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon green"><i className="ri-clipboard-fill"></i></div>
                  <div><strong>56 Lessons</strong><span>Completed</span></div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon orange"><i className="ri-star-fill"></i></div>
                  <div><strong>12 Reviews</strong><span>Earned</span></div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon red"><i className="ri-team-fill"></i></div>
                  <div><strong>15 Workshops</strong><span>Attended</span></div>
                </div>
              </div>
            </section>

            {/* Recommended courses */}
            <section className="recommended-section">
              <div className="section-header">
                <h3>Recommended Courses</h3>
                <button className="view-all" onClick={() => onNavigate('learn')}>Browse All</button>
              </div>
              <div className="recommended-grid">
                {RECOMMENDED.map(course => (
                  <div key={course.id} className="rec-card">
                    <div className="rec-thumb">
                      <span className="rec-price">{course.price}</span>
                    </div>
                    <div className="rec-body">
                      <h4>{course.title}</h4>
                      <p>Build your governance skills with expert-led live sessions and real-world case studies.</p>
                      <div className="rec-meta">
                        <span className="badge">{course.level}</span>
                        <span className="badge">{course.type}</span>
                        <span className="badge">{course.lessons}</span>
                      </div>
                      <button
                        className="special-button enroll-btn"
                        onClick={() => onNavigate('learn-player')}
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </>
  );
};

export default StudentDashboard;
