import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { COURSES as LEGACY_COURSES, RESOURCES as LEGACY_RESOURCES } from '../../data/legacyData';
import Pagination from '../../components/ui/Pagination';
import StatusModal from '../../components/ui/StatusModal';
import './StudentDashboard.css';
import mainLogo from '../../assets/images/Logo/Main logo.png';

/* ───────────────────────── MOCK DATA ───────────────────────── */
// (Keep for fallback if needed, but we'll try to use Supabase first)


const TUTORIALS = [
  { id: 1, title: 'Introduction to Governance', category: 'Basics', instructor: 'Dr. Amaka Okonkwo', duration: '15:20', thumbnail: 'https://images.unsplash.com/photo-1521791136364-798a7bc0d262?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Corporate Ethics 101', category: 'Corporate', instructor: 'Prof. Chidi Nwachukwu', duration: '22:45', thumbnail: 'https://images.unsplash.com/photo-1507679799987-c7377bc56509?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Public Finance Overview', category: 'Finance', instructor: 'Dr. Fatima Al-Hassan', duration: '18:10', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800' },
];

const COURSE_IMAGE_BANK = [
  'https://images.unsplash.com/photo-1529539795054-3c162aab037a',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f',
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
  'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
  'https://images.unsplash.com/photo-1427751840561-9852520f8ce8',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
  'https://images.unsplash.com/photo-1513258496099-48168024adb0',
  'https://images.unsplash.com/photo-1523287562758-66c7fc58967f',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
];

const MY_RESOURCES = LEGACY_RESOURCES;

const NAV_GROUPS = [
  {
    label: "Learning",
    links: [
      { name: 'Home',           icon: 'ri-home-fill' },
      { name: 'Courses',        icon: 'ri-book-fill' },
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
      { name: 'Certifications', icon: 'ri-award-fill' },
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   PANEL: HOME
   ═══════════════════════════════════════════════════════════════ */

function HomePanel({ name, onNavigate, myCourses = [], completedLessons = 0, certificates = [], workshops = [], registeredWorkshops = [] }) {
  const enrolledCount = myCourses.length;
  const certificatesCount = certificates.length;
  const attendedWorkshopsCount = workshops.filter(w => w.status === 'Completed' && registeredWorkshops.includes(w.id)).length;

  return (
    <>
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
            <span>Action</span>
          </div>
          <div className="table-body">
            {myCourses.slice(0, 3).map(course => (
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
                <button className="row-action" onClick={() => onNavigate('learn-player', course)}><i className="ri-play-circle-fill"></i></button>
              </div>
            ))}
            {myCourses.length === 0 && <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-soft)'}}>No courses started yet.</div>}
          </div>
        </div>

        <div className="stats-sidebar">
          <div className="stat-box">
            <div className="stat-icon blue"><i className="ri-book-open-fill"></i></div>
            <div><strong>{enrolledCount} Courses</strong><span>Enrolled</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-icon green"><i className="ri-clipboard-fill"></i></div>
            <div><strong>{completedLessons} Lessons</strong><span>Completed</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-icon orange"><i className="ri-star-fill"></i></div>
            <div><strong>{certificatesCount} Certificates</strong><span>Earned</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-icon red"><i className="ri-team-fill"></i></div>
            <div><strong>{attendedWorkshopsCount} Workshops</strong><span>Attended</span></div>
          </div>
        </div>
      </section>

      <section className="recommended-section">
        <div className="section-header">
          <h3>Recommended Courses</h3>
          <button className="view-all" onClick={() => onNavigate('learn')}>Browse All</button>
        </div>
        <div className="recommended-grid">
          {[...myCourses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3).map(course => (
            <div key={course.id} className="rec-card">
              <div className="rec-thumb" style={{ backgroundImage: `url(${course.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <span className="rec-price">Free</span>
              </div>
              <div className="rec-body">
                <h4 className="truncate-1">{course.title}</h4>
                <p className="truncate-2">{course.description?.[0] === '{' ? 'Course details...' : course.description?.substring(0, 80)}…</p>
                <div className="rec-meta">
                  <span className="badge">{course.level}</span>
                  <span className="badge">{course.duration || 'Self-paced'}</span>
                  <span className="badge">{course.lessons || 0} Lessons</span>
                </div>
                <button className="special-button enroll-btn" onClick={() => onNavigate('learn-player', course)}>
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
          {myCourses.length === 0 && <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--text-soft)'}}>Browse all courses to find your next lesson.</div>}
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: COURSES
   ═══════════════════════════════════════════════════════════════ */

function CoursesPanel({ onNavigate, myCourses = [] }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = (filter === 'all'
    ? myCourses
    : filter === 'completed'
      ? myCourses.filter(c => c.progress === 100)
      : filter === 'in-progress'
        ? myCourses.filter(c => c.progress > 0 && c.progress < 100)
        : myCourses.filter(c => c.progress === 0)
  ).filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="std-panel">
      <div className="section-header">
        <div className="section-title-group">
          <h3>My Courses</h3>
          <div className="panel-search">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              placeholder="Filter courses..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="std-filter-row">
          {[{id:'all',l:'All'},{id:'in-progress',l:'In Progress'},{id:'completed',l:'Completed'},{id:'not-started',l:'Not Started'}].map(f => (
            <button key={f.id} className={`std-filter-btn ${filter === f.id ? 'active' : ''}`} onClick={() => { setFilter(f.id); setCurrentPage(1); }}>{f.l}</button>
          ))}
        </div>
      </div>
      <div className="std-course-grid">
        {pagedItems.map(course => (
          <div key={course.id} className="std-course-card" onClick={() => onNavigate('learn-player', course)}>
            <div className="std-course-thumb">
              <img 
                src={course.coverImage} 
                alt={course.title} 
                className="std-course-cover-img" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800';
                }}
              />
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
        {filtered.length === 0 && <div style={{gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'var(--text-soft)'}}>No courses found matching your criteria.</div>}
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
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = TUTORIALS.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="std-panel">
      <div className="section-header">
        <div className="section-title-group">
          <h3>Video Tutorials</h3>
          <div className="panel-search">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              placeholder="Search tutorials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="view-all" onClick={() => onNavigate('learn')}>Browse All</button>
      </div>
      <div className="std-tutorial-grid">
        {filtered.map(t => (
          <div key={t.id} className="std-tutorial-card">
            <div className="std-tutorial-thumb">
              <img 
                src={t.thumbnail} 
                alt={t.title} 
                loading="lazy" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1517245366810-54070744a417?auto=format&fit=crop&q=80&w=800';
                }}
              />
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
   MODAL: WORKSHOP REGISTRATION
   ═══════════════════════════════════════════════════════════════ */
function WorkshopRegistrationModal({ workshop, onClose, onConfirm }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(form);
  };

  return (
    <div className="status-modal-overlay">
      <div className="status-modal-container animate-up" style={{ maxWidth: '550px' }}>
        <div className="status-modal-content">
          <div className="status-modal-header">
            <div className="status-modal-icon-wrap" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <i className="ri-calendar-check-line"></i>
            </div>
            <div className="status-modal-text">
              <h3 className="status-modal-title">Workshop Registration</h3>
              <p className="status-modal-desc">Registering for: <strong>{workshop.title}</strong></p>
            </div>
          </div>

          <form id="registration-form" className="adm-form" style={{ marginTop: '20px' }} onSubmit={handleSubmit}>
            <div className="adm-form-grid">
              <div className="input-field">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label>Professional Role</label>
                <input 
                  type="text" 
                  placeholder="Governance Officer, Student, etc." 
                  required 
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label>Reason for Attending</label>
                <textarea 
                  placeholder="What do you hope to learn?" 
                  rows="3" 
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--stroke-soft)', 
                    fontSize: '0.9rem', 
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  value={form.reason}
                  onChange={e => setForm({...form, reason: e.target.value})}
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        <div className="status-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" form="registration-form" className="special-button">Confirm Registration</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: WORKSHOP
   ═══════════════════════════════════════════════════════════════ */
function WorkshopPanel({ onRegister, registeredIds = [], workshops = [] }) {
  const [tab, setTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = workshops.filter(w =>
    (tab === 'upcoming' ? w.status === 'Upcoming' : w.status === 'Completed') &&
    (w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (w.host || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section className="std-panel">
      <div className="section-header">
        <div className="section-title-group">
          <h3>Workshops</h3>
          <div className="panel-search">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              placeholder="Filter workshops..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="std-filter-row">
          <button className={`std-filter-btn ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
          <button className={`std-filter-btn ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>Completed</button>
        </div>
      </div>
      <div className="std-workshop-list">
        {filtered.map((w, index) => {
          const isRegistered = registeredIds.includes(w.id);
          return (
            <div key={w.id} className={`std-workshop-card ${isRegistered ? 'registered' : ''}`} style={isRegistered ? { borderColor: '#fbbf24', borderWidth: '2px' } : {}}>
              <div className="std-ws-date" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span className="std-ws-month" style={{ fontSize: '0.75rem', opacity: 0.8, letterSpacing: '1px' }}>WS</span>
                <span className="std-ws-day" style={{ fontSize: '1.6rem', fontWeight: 'bold', lineHeight: 1 }}>{index + 1}</span>
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
                  isRegistered ? (
                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ri-checkbox-circle-fill"></i> Registered
                    </span>
                  ) : (
                    <button 
                      className="special-button" 
                      style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}
                      onClick={() => onRegister(w)}
                    >
                      Register
                    </button>
                  )
                ) : (
                  <button className="btn-outline" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>View Replay</button>
                )}
              </div>
            </div>
          );
        })}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = MY_RESOURCES.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="std-panel">
      <div className="section-header">
        <div className="section-title-group">
          <h3>My Resources</h3>
          <div className="panel-search">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
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

function CertificationsPanel({ certificates = [], allCoursesCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = certificates.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.credentialId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="std-panel">
      <div className="std-cert-summary">
        <div className="std-cert-stat">
          <div className="std-cert-icon green"><i className="ri-medal-line"></i></div>
          <div className="std-cert-content">
            <div className="std-cert-stat-num">{certificates.filter(c => c.status === 'Earned').length}</div>
            <div className="std-cert-stat-label">Earned</div>
          </div>
        </div>
        <div className="std-cert-stat">
          <div className="std-cert-icon orange"><i className="ri-time-line"></i></div>
          <div className="std-cert-content">
            <div className="std-cert-stat-num">{certificates.filter(c => c.status === 'In Progress').length}</div>
            <div className="std-cert-stat-label">In Progress</div>
          </div>
        </div>
        <div className="std-cert-stat">
          <div className="std-cert-icon blue"><i className="ri-book-read-line"></i></div>
          <div className="std-cert-content">
            <div className="std-cert-stat-num">{allCoursesCount - certificates.length}</div>
            <div className="std-cert-stat-label">Available</div>
          </div>
        </div>
      </div>
      
      <div className="section-header">
        <div className="section-title-group">
          <h3>Certifications</h3>
          <div className="panel-search">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              placeholder="Search ceritificates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="std-cert-list">
        {filtered.map(cert => (
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
        {filtered.length === 0 && <div style={{textAlign:'center', padding:'40px', color:'var(--text-soft)'}}>No certifications found.</div>}
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════
   PANEL: SETTINGS
   ═══════════════════════════════════════════════════════════════ */

function SettingsPanel({ user, profileName, setProfileName, profileAvatar, setProfileAvatar, fetchData, setStatusModal, onRefreshUser }) {
  const [email, setEmail] = useState(user?.email || "alex@example.com");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log("[GRH DEBUG] SettingsPanel User:", user);
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!user?.id || user.id === 'undefined') {
        console.error("[GRH ERROR] Missing User ID during avatar upload:", user);
        throw new Error("Valid User ID is required for profile update. Current ID: " + (user?.id || 'null'));
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileAvatar(publicUrl);
      setStatusModal({ isOpen: true, type: 'success', title: 'Avatar Updated', message: 'Your profile picture has been updated.', onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setStatusModal({ isOpen: true, type: 'error', title: 'Upload Failed', message: 'Error uploading avatar: ' + err.message, onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || user.id === 'undefined') {
      setStatusModal({ isOpen: true, type: 'error', title: 'Save Failed', message: 'You must be logged in with a valid account to save changes.', onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({ name: profileName })
        .eq('id', user.id);

      if (error) throw error;
      setStatusModal({ isOpen: true, type: 'success', title: 'Profile Updated', message: 'Your profile name has been saved.', onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
      if (fetchData) fetchData();
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setStatusModal({ isOpen: true, type: 'error', title: 'Save Failed', message: 'Error saving profile: ' + err.message, onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
    } finally {
      setSaving(false);
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
              {profileAvatar ? <img src={profileAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <div className="avatar-placeholder">{profileName[0]?.toUpperCase() || 'A'}</div>}
            </div>
            <div className="upload-controls">
              <label className="special-button btn-sm" style={{ cursor: 'pointer' }}>
                {saving ? "Processing..." : "Change Avatar"}
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={saving} />
              </label>
              <p className="upload-hint">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
          <div className="settings-grid">
            <div className="input-field">
              <label>Full Name</label>
              <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} disabled={saving} />
            </div>
            <div className="input-field">
              <label>Email Address</label>
              <input type="email" value={email} disabled />
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
          <button className="special-button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN: STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

const StudentDashboard = ({ user, onNavigate, onLogout, onRefreshUser }) => {
  const [activeTab, setActiveTab] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || user?.email?.split('@')[0] || "Alex");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar_url || null);
  const [stats, setStats] = useState({ courses: 0, lessons: 0, certifications: 0 });

  // Keep local profile state in sync with global user prop
  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.avatar_url) setProfileAvatar(user.avatar_url);
    }
  }, [user]);

  // Status & Registration Modal States
  const [statusModal, setStatusModal] = useState({ 
    isOpen: false, 
    type: 'warning', 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  const [regModal, setRegModal] = useState({ isOpen: false, workshop: null });
  const [registeredWorkshops, setRegisteredWorkshops] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Safety timeout to prevent stuck loading screens
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    try {
      setLoading(true);
      
      // Fetch user's profile to sync name/avatar
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setProfileName(profile.name || user.email?.split('@')[0]);
        setProfileAvatar(profile.avatar_url);
      }

      // Fetch all courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*');
      
      // Mock progress for now - in a real app, join with user_progress
      const getSafeImg = (c, i) => {
        const val = c.thumbnail || c.cover_image || c.coverImage || "";
        if (val && val.length > 10) return val;
        return `${COURSE_IMAGE_BANK[i % COURSE_IMAGE_BANK.length]}?auto=format&fit=crop&w=600&q=80`;
      };

      const coursesWithProgress = (coursesData || []).map((c, i) => ({
        ...c,
        coverImage: getSafeImg(c, i),
        progress: Math.floor(Math.random() * 101) // mock
      }));

      // Fetch workshops
      const { data: workshopsData } = await supabase
        .from('workshops')
        .select('*');

      // Fetch user's registered workshops
      const { data: regsData } = await supabase
        .from('workshop_registrations')
        .select('workshop_id')
        .eq('user_id', user.id);

      if (regsData) {
        setRegisteredWorkshops(regsData.map(r => r.workshop_id));
      }

      setMyCourses(coursesWithProgress);
      setWorkshops(workshopsData || []);
      
      // Mock certificates
      setCertificates([
        { id: 1, title: 'Governance Fundamentals', issueDate: 'Oct 2023', credentialId: 'GRH-123456', grade: 'A', status: 'Earned' }
      ]);
      setCompletedLessons(12);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const confirmLogout = () => {
    setStatusModal({
      isOpen: true,
      type: 'warning',
      title: 'Sign Out',
      message: 'Are you sure you want to log out of your student account?',
      onConfirm: () => {
        setStatusModal(prev => ({ ...prev, isOpen: false }));
        onLogout();
      }
    });
  };

  const handleRegistration = (workshop) => {
    setRegModal({ isOpen: true, workshop });
  };

  const submitRegistration = async (formData) => {
    if (!user) return;
    try {
      const workshopId = regModal.workshop?.id;
      const { error } = await supabase.from('workshop_registrations').insert([{
        workshop_id: workshopId,
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        reason: formData.reason
      }]);

      if (error) throw error;

      setRegModal({ isOpen: false, workshop: null });
      setRegisteredWorkshops(prev => [...prev, workshopId]);

      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Registration Successful',
        message: `You have successfully registered for "${regModal.workshop?.title}". We've sent the details to your email.`,
        onConfirm: () => setStatusModal(prev => ({ ...prev, isOpen: false }))
      });
    } catch (err) {
      if (err.message?.includes('duplicate key value')) {
        setRegModal({ isOpen: false, workshop: null });
        setRegisteredWorkshops(prev => [...prev, regModal.workshop?.id]);
        setStatusModal({ isOpen: true, type: 'success', title: 'Already Registered', message: 'You are already registered for this workshop.', onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
      } else {
        setStatusModal({ isOpen: true, type: 'error', title: 'Registration Failed', message: 'Registration failed: ' + err.message, onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
      }
    }
  };

  const renderPanel = () => {
    if (loading) return <div className="std-panel" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px'}}>Loading dashboard...</div>;

    switch (activeTab) {
      case 'Home':           return <HomePanel name={profileName} onNavigate={onNavigate} myCourses={myCourses} completedLessons={completedLessons} certificates={certificates} workshops={workshops} registeredWorkshops={registeredWorkshops} />;
      case 'Courses':        return <CoursesPanel onNavigate={onNavigate} myCourses={myCourses} />;
      case 'Tutorials':      return <TutorialsPanel onNavigate={onNavigate} />;
      case 'Workshop':       return <WorkshopPanel onRegister={handleRegistration} registeredIds={registeredWorkshops} workshops={workshops} />;
      case 'Resources':      return <ResourcesPanel onNavigate={onNavigate} />;
      case 'Certifications': return <CertificationsPanel certificates={certificates} allCoursesCount={myCourses.length} />;
      case 'Settings':       return <SettingsPanel user={user} profileName={profileName} setProfileName={setProfileName} profileAvatar={profileAvatar} setProfileAvatar={setProfileAvatar} fetchData={fetchData} setStatusModal={setStatusModal} />;
      default:               return <HomePanel name={profileName} onNavigate={onNavigate} myCourses={myCourses} completedLessons={completedLessons} certificates={certificates} workshops={workshops} registeredWorkshops={registeredWorkshops} />;
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
            <button className="sidebar-link" onClick={confirmLogout}>
              <i className="ri-logout-box-line"></i> Sign Out
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
                <h3>Welcome back, {profileName}!</h3>
                <p>Continue your governance learning journey.</p>
              </div>
            </div>
            {/* Remove global search from center as it's now local to panels */}
            <div className="topbar-spacer" style={{ flex: 1 }}></div>
            <div className="topbar-actions">
              <button className="action-btn"><i className="ri-notification-fill"></i></button>
              <div className="user-profile">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Avatar" className="user-avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="user-avatar">{profileName[0]?.toUpperCase() || 'A'}</div>
                )}
                <div className="user-info">
                  <strong>{profileName}</strong>
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

      {statusModal.isOpen && (
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
          onCancel={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          confirmLabel={statusModal.type === 'success' ? 'Great!' : 'Yes, Proceed'}
          onConfirm={statusModal.onConfirm}
        />
      )}

      {regModal.isOpen && (
        <WorkshopRegistrationModal 
          workshop={regModal.workshop} 
          onClose={() => setRegModal({ isOpen: false, workshop: null })}
          onConfirm={submitRegistration}
        />
      )}
    </>
  );
};

export default StudentDashboard;
