import React, { useState } from 'react';
import { COURSES, RESOURCES } from '../../data/legacyData';
import Pagination from '../../components/ui/Pagination';
import './StudentDashboard.css';
import mainLogo from '../../assets/images/Logo/Main logo.png';

/* ───────────────────────── MOCK DATA ───────────────────────── */

const MY_COURSES = COURSES.map((c, i) => ({
  ...c,
  instructor: c.instructor,
  progress: [80, 60, 20, 70, 0, 15][i] ?? 0,
  next: ['Apr 27, 2024', 'Apr 1, 2024', 'Apr 24, 2024', 'Mar 15, 2024', 'Enrol Now', 'May 3, 2024'][i] ?? '',
  icon: ['ri-government-line', 'ri-bar-chart-fill', 'ri-bank-card-line', 'ri-scales-3-line', 'ri-input-method-line', 'ri-global-line'][i] ?? 'ri-book-fill',
}));

const TUTORIALS = [
  { id: 1, title: 'Understanding the PEFA Framework', duration: '12 min', instructor: 'Dr. Fatima Al-Hassan', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', category: 'Finance' },
  { id: 2, title: 'How Anti-Corruption Frameworks Work', duration: '18 min', instructor: 'Ms. Ngozi Adebayo', thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80', category: 'Integrity' },
  { id: 3, title: 'Introduction to Electoral Systems', duration: '15 min', instructor: 'Dr. Emeka Chibuike', thumbnail: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=600&q=80', category: 'Democracy' },
  { id: 4, title: 'Open Government & Civic Tech', duration: '20 min', instructor: 'Adaeze Eze, MSc', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', category: 'Digital' },
  { id: 5, title: 'Budget Execution Best Practices', duration: '10 min', instructor: 'Dr. Amaka Okonkwo', thumbnail: 'https://images.unsplash.com/photo-1529539795054-3c162aab037a?auto=format&fit=crop&w=600&q=80', category: 'Finance' },
  { id: 6, title: 'Participatory Governance Models', duration: '14 min', instructor: 'Prof. Chidi Nwachukwu', thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80', category: 'Governance' },
];

const WORKSHOPS = [
  { id: 1, title: 'PFM Reform in Practice', date: 'Mar 15, 2024', time: '10:00 AM WAT', status: 'Upcoming', host: 'World Bank Nigeria', attendees: 120, format: 'Virtual' },
  { id: 2, title: 'Anti-Corruption Compliance Workshop', date: 'Mar 22, 2024', time: '2:00 PM WAT', status: 'Upcoming', host: 'Transparency International', attendees: 85, format: 'Hybrid' },
  { id: 3, title: 'Open Government Hackathon', date: 'Apr 5, 2024', time: '9:00 AM WAT', status: 'Upcoming', host: 'OGP Nigeria', attendees: 200, format: 'In-person' },
  { id: 4, title: 'Legislative Oversight Masterclass', date: 'Feb 20, 2024', time: '11:00 AM WAT', status: 'Completed', host: 'NDI', attendees: 64, format: 'Virtual' },
  { id: 5, title: 'Fiscal Decentralisation Forum', date: 'Jan 18, 2024', time: '3:00 PM WAT', status: 'Completed', host: 'UN-Habitat', attendees: 150, format: 'In-person' },
];

const CERTIFICATIONS = [
  { id: 1, title: 'Foundations of Public Governance', issueDate: 'Jan 15, 2024', credentialId: 'GRH-GOV-2024-001', grade: 'Distinction', status: 'Earned' },
  { id: 2, title: 'Anti-Corruption & Integrity Systems', issueDate: 'Feb 28, 2024', credentialId: 'GRH-INT-2024-014', grade: 'Merit', status: 'Earned' },
  { id: 3, title: 'Corporate Governance Essentials', issueDate: 'In Progress', credentialId: '—', grade: '—', status: 'In Progress' },
];

const MY_RESOURCES = RESOURCES.slice(0, 6);

/* ───────────────────────── NAV GROUPS ───────────────────────── */

const NAV_GROUPS = [
  {
    label: "Learning",
    links: [
      { name: 'Home',           icon: 'ri-home-fill' },
      { name: 'Courses',        icon: 'ri-book-fill',       badge: String(MY_COURSES.length) },
      { name: 'Tutorials',      icon: 'ri-movie-fill' },
      { name: 'Workshop',       icon: 'ri-tools-fill' },
    ]
  },
  {
    label: "Library",
    links: [
      { name: 'Resources',      icon: 'ri-folder-fill' },
    ]
  },
  {
    label: "Progress",
    links: [
      { name: 'Certifications', icon: 'ri-award-fill',      badge: String(CERTIFICATIONS.filter(c => c.status === 'Earned').length) },
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   PANEL: HOME
   ═══════════════════════════════════════════════════════════════ */

function HomePanel({ name, onNavigate }) {
  return (
    <>
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
            {MY_COURSES.slice(0, 3).map(course => (
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
            <div><strong>{MY_COURSES.length} Courses</strong><span>Enrolled</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-icon green"><i className="ri-clipboard-fill"></i></div>
            <div><strong>56 Lessons</strong><span>Completed</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-icon orange"><i className="ri-star-fill"></i></div>
            <div><strong>{CERTIFICATIONS.filter(c => c.status === 'Earned').length} Certificates</strong><span>Earned</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-icon red"><i className="ri-team-fill"></i></div>
            <div><strong>{WORKSHOPS.filter(w => w.status === 'Completed').length} Workshops</strong><span>Attended</span></div>
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
          {COURSES.filter(c => c.progress === 0).slice(0, 3).map(course => (
            <div key={course.id} className="rec-card">
              <div className="rec-thumb" style={{ backgroundImage: `url(${course.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <span className="rec-price">Free</span>
              </div>
              <div className="rec-body">
                <h4 className="truncate-1">{course.title}</h4>
                <p className="truncate-2">{course.description.substring(0, 80)}…</p>
                <div className="rec-meta">
                  <span className="badge">{course.level}</span>
                  <span className="badge">{course.duration}</span>
                  <span className="badge">{course.lessons} Lessons</span>
                </div>
                <button className="special-button enroll-btn" onClick={() => onNavigate('learn-player')}>
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: COURSES
   ═══════════════════════════════════════════════════════════════ */

function CoursesPanel({ onNavigate }) {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = filter === 'all'
    ? MY_COURSES
    : filter === 'completed'
      ? MY_COURSES.filter(c => c.progress === 100)
      : filter === 'in-progress'
        ? MY_COURSES.filter(c => c.progress > 0 && c.progress < 100)
        : MY_COURSES.filter(c => c.progress === 0);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="std-panel">
      <div className="section-header">
        <h3>My Courses</h3>
        <div className="std-filter-row">
          {[{id:'all',l:'All'},{id:'in-progress',l:'In Progress'},{id:'completed',l:'Completed'},{id:'not-started',l:'Not Started'}].map(f => (
            <button key={f.id} className={`std-filter-btn ${filter === f.id ? 'active' : ''}`} onClick={() => { setFilter(f.id); setCurrentPage(1); }}>{f.l}</button>
          ))}
        </div>
      </div>
      <div className="std-course-grid">
        {pagedItems.map(course => (
          <div key={course.id} className="std-course-card" onClick={() => onNavigate('learn-player')}>
            <div className="std-course-thumb">
              <img src={course.coverImage} alt={course.title} className="std-course-cover-img" />
              <span className={`badge ${course.level.toLowerCase()}`}>{course.level}</span>
            </div>
            <div className="std-course-info">
              <span className="std-course-cat">{course.category}</span>
              <h4 className="truncate-1">{course.title}</h4>
              <p className="std-instructor"><i className="ri-user-line"></i> {course.instructor}</p>
              <div className="std-progress-row">
                <div className="prog-bar"><div className="prog-fill" style={{ width: `${course.progress}%` }}></div></div>
                <span className="std-progress-text">{course.progress}%</span>
              </div>
              <div className="std-course-bottom">
                <span><i className="ri-time-line"></i> {course.duration}</span>
                <span><i className="ri-book-open-line"></i> {course.lessons} lessons</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: TUTORIALS
   ═══════════════════════════════════════════════════════════════ */

function TutorialsPanel({ onNavigate }) {
  return (
    <section className="std-panel">
      <div className="section-header">
        <h3>Video Tutorials</h3>
        <button className="view-all" onClick={() => onNavigate('learn')}>Browse All</button>
      </div>
      <div className="std-tutorial-grid">
        {TUTORIALS.map(t => (
          <div key={t.id} className="std-tutorial-card">
            <div className="std-tutorial-thumb">
              <img src={t.thumbnail} alt={t.title} loading="lazy" />
              <div className="std-play-overlay">
                <span className="material-symbols-outlined">play_arrow</span>
              </div>
              <span className="std-duration">{t.duration}</span>
            </div>
            <div className="std-tutorial-info">
              <span className="std-tut-cat">{t.category}</span>
              <h4>{t.title}</h4>
              <p><i className="ri-user-line"></i> {t.instructor}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: WORKSHOP
   ═══════════════════════════════════════════════════════════════ */

function WorkshopPanel() {
  const [tab, setTab] = useState('upcoming');
  const filtered = WORKSHOPS.filter(w =>
    tab === 'upcoming' ? w.status === 'Upcoming' : w.status === 'Completed'
  );

  return (
    <section className="std-panel">
      <div className="section-header">
        <h3>Workshops</h3>
        <div className="std-filter-row">
          <button className={`std-filter-btn ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
          <button className={`std-filter-btn ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>Completed</button>
        </div>
      </div>
      <div className="std-workshop-list">
        {filtered.map(w => (
          <div key={w.id} className="std-workshop-card">
            <div className="std-ws-date">
              <span className="std-ws-day">{w.date.split(',')[0].split(' ')[1]}</span>
              <span className="std-ws-month">{w.date.split(' ')[0]}</span>
            </div>
            <div className="std-ws-info">
              <h4>{w.title}</h4>
              <div className="std-ws-meta">
                <span><i className="ri-time-line"></i> {w.time}</span>
                <span><i className="ri-user-line"></i> {w.host}</span>
                <span><i className="ri-team-line"></i> {w.attendees} attendees</span>
              </div>
              <div className="std-ws-tags">
                <span className={`badge ${w.status === 'Upcoming' ? 'beginner' : ''}`}>{w.format}</span>
                <span className={`badge ${w.status === 'Upcoming' ? 'advance' : 'medium'}`}>{w.status}</span>
              </div>
            </div>
            <div className="std-ws-action">
              {w.status === 'Upcoming' ? (
                <button className="special-button" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>Register</button>
              ) : (
                <button className="btn-outline" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>View Replay</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: RESOURCES
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PANEL: RESOURCES
   ═══════════════════════════════════════════════════════════════ */

function ResourcesPanel({ onNavigate }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(MY_RESOURCES.length / itemsPerPage);
  const pagedItems = MY_RESOURCES.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="std-panel">
      <div className="section-header">
        <h3>My Resources</h3>
        <button className="view-all" onClick={() => onNavigate('research')}>Browse Library</button>
      </div>
      <div className="std-resource-grid">
        {pagedItems.map(r => (
          <div key={r.id} className="std-resource-card" onClick={() => onNavigate('research')}>
            <div className="std-res-cover">
              <img src={r.coverImage} alt={r.title} loading="lazy" />
              <span className={`std-res-type type-${r.type.toLowerCase()}`}>{r.type}</span>
            </div>
            <div className="std-res-info">
              <h4>{r.title}</h4>
              <p>{r.author} · {r.year}</p>
              <div className="std-res-tags">
                {r.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="badge">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: CERTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */

function CertificationsPanel() {
  return (
    <section className="std-panel">
      <div className="section-header">
        <h3>Certifications</h3>
      </div>
      <div className="std-cert-list">
        {CERTIFICATIONS.map(cert => (
          <div key={cert.id} className={`std-cert-card ${cert.status === 'Earned' ? 'earned' : 'progress'}`}>
            <div className="std-cert-icon-area">
              {cert.status === 'Earned' ? (
                <div className="std-cert-badge earned"><i className="ri-award-fill"></i></div>
              ) : (
                <div className="std-cert-badge progress"><i className="ri-time-line"></i></div>
              )}
            </div>
            <div className="std-cert-info">
              <h4>{cert.title}</h4>
              <div className="std-cert-meta">
                <span><i className="ri-calendar-line"></i> {cert.issueDate}</span>
                <span><i className="ri-fingerprint-line"></i> {cert.credentialId}</span>
                <span><i className="ri-star-line"></i> {cert.grade}</span>
              </div>
            </div>
            <div className="std-cert-actions">
              {cert.status === 'Earned' ? (
                <>
                  <button className="special-button" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                    <i className="ri-download-line"></i> Download
                  </button>
                  <button className="btn-outline" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                    <i className="ri-share-line"></i> Share
                  </button>
                </>
              ) : (
                <button className="btn-outline" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                  Continue Course
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Achievement summary */}
      <div className="std-cert-summary">
        <div className="std-cert-stat">
          <div className="std-cert-stat-num">{CERTIFICATIONS.filter(c => c.status === 'Earned').length}</div>
          <div className="std-cert-stat-label">Earned</div>
        </div>
      <div className="std-cert-stat">
          <div className="std-cert-stat-num">{CERTIFICATIONS.filter(c => c.status === 'In Progress').length}</div>
          <div className="std-cert-stat-label">In Progress</div>
        </div>
        <div className="std-cert-stat">
          <div className="std-cert-stat-num">{COURSES.length - CERTIFICATIONS.length}</div>
          <div className="std-cert-stat-label">Available</div>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════
   PANEL: SETTINGS
   ═══════════════════════════════════════════════════════════════ */

function SettingsPanel({ user }) {
  const [name, setName] = useState(user?.name || "Alex");
  const [email, setEmail] = useState(user?.email || "alex@example.com");
  const [avatar, setAvatar] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="std-panel">
      <div className="section-header">
        <h3>Settings</h3>
      </div>
      <div className="std-settings-card">
        <div className="settings-section">
          <h4>Profile Information</h4>
          <div className="avatar-upload-area">
            <div className="current-avatar">
              {avatar ? <img src={avatar} alt="Avatar" /> : (user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" /> : <div className="avatar-placeholder">{name[0].toUpperCase()}</div>)}
            </div>
            <div className="upload-controls">
              <label className="special-button btn-sm" style={{ cursor: 'pointer' }}>
                Change Avatar
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </label>
              <p className="upload-hint">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
          <div className="settings-grid">
            <div className="input-field">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Role</label>
              <input type="text" value="Governance Learner" disabled />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h4>Security</h4>
          <button className="btn-outline">Change Password</button>
        </div>

        <div className="settings-actions">
          <button className="special-button">Save Changes</button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN: STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

const StudentDashboard = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const name = user?.name || "Alex";

  const renderPanel = () => {
    switch (activeTab) {
      case 'Home':           return <HomePanel name={name} onNavigate={onNavigate} />;
      case 'Courses':        return <CoursesPanel onNavigate={onNavigate} />;
      case 'Tutorials':      return <TutorialsPanel onNavigate={onNavigate} />;
      case 'Workshop':       return <WorkshopPanel />;
      case 'Resources':      return <ResourcesPanel onNavigate={onNavigate} />;
      case 'Certifications': return <CertificationsPanel />;
      case 'Settings':       return <SettingsPanel user={user} />;
      default:               return <HomePanel name={name} onNavigate={onNavigate} />;
    }
  };

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
            <img src={mainLogo} alt="Governance Resource Hub" />
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
            <button className={`sidebar-link ${activeTab === 'Settings' ? 'active' : ''}`} onClick={() => setActiveTab('Settings')}>
              <i className="ri-settings-fill"></i> Settings
            </button>
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
            {renderPanel()}
          </div>
        </main>
      </div>
    </>
  );
};

export default StudentDashboard;
