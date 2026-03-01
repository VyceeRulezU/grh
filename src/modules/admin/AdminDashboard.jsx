import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import './AdminDashboard.css';

/* =====================================================================
   MOCK DATA — GRH specific
===================================================================== */
const STATS_DATA = [
  { name: 'Jan', learners: 420, resources: 14, certs: 38 },
  { name: 'Feb', learners: 560, resources: 18, certs: 52 },
  { name: 'Mar', learners: 490, resources: 22, certs: 44 },
  { name: 'Apr', learners: 720, resources: 30, certs: 71 },
  { name: 'May', learners: 850, resources: 36, certs: 95 },
  { name: 'Jun', learners: 1040, resources: 41, certs: 118 },
];

const COURSES = [
  { id: 1, title: 'Foundations of Public Governance', category: 'Governance', learners: 340, status: 'Published', level: 'Beginner' },
  { id: 2, title: 'Public Financial Management (PFM)', category: 'Finance', learners: 210, status: 'Published', level: 'Advance' },
  { id: 3, title: 'Anti-Corruption Frameworks', category: 'Integrity', learners: 180, status: 'Published', level: 'Medium' },
  { id: 4, title: 'Electoral System Design', category: 'Democracy', learners: 95, status: 'Draft', level: 'Medium' },
  { id: 5, title: 'Open Government & Transparency', category: 'Transparency', learners: 0, status: 'Draft', level: 'Beginner' },
];

const USERS = [
  { name: 'Sarah Chen', email: 'sarah.chen@gov.org', role: 'Learner', status: 'Active', courses: 3, joined: 'Jan 2025' },
  { name: 'Marcus Thorne', email: 'm.thorne@pfm.org', role: 'Learner', status: 'Active', courses: 5, joined: 'Feb 2025' },
  { name: 'Elena Rossi', email: 'e.rossi@ungov.org', role: 'Instructor', status: 'Active', courses: 2, joined: 'Mar 2025' },
  { name: 'Kwame Asante', email: 'k.asante@ecowas.int', role: 'Learner', status: 'Inactive', courses: 1, joined: 'Apr 2025' },
  { name: 'Aishwarya Patel', email: 'a.patel@worldbank.org', role: 'Learner', status: 'Active', courses: 4, joined: 'Apr 2025' },
];

const RESOURCES = [
  { id: 1, title: 'The PEFA Framework', type: 'PERL', category: 'Finance', status: 'Published' },
  { id: 2, title: 'UNCAC Implementation Guide', type: 'SPARC', category: 'Integrity', status: 'Published' },
  { id: 3, title: 'OGP National Action Plan Template', type: 'SLGP', category: 'Transparency', status: 'Draft' },
  { id: 4, title: 'Electoral System Design Handbook', type: 'SPARC', category: 'Democracy', status: 'Published' },
];

const NAV_GROUPS = [
  {
    label: 'Content',
    links: [
      { id: 'overview',   icon: 'ri-dashboard-fill',    label: 'Overview' },
      { id: 'courses',    icon: 'ri-book-fill',          label: 'Courses', badge: COURSES.length },
      { id: 'resources',  icon: 'ri-folder-fill',        label: 'Library Resources' },
      { id: 'quizzes',    icon: 'ri-file-list-3-fill',   label: 'Quizzes & Assessments' },
    ],
  },
  {
    label: 'People',
    links: [
      { id: 'users',      icon: 'ri-team-fill',          label: 'Users', badge: USERS.length },
      { id: 'instructors',icon: 'ri-user-star-fill',     label: 'Instructors' },
    ],
  },
  {
    label: 'System',
    links: [
      { id: 'analytics',  icon: 'ri-bar-chart-grouped-fill', label: 'Analytics' },
      { id: 'settings',   icon: 'ri-settings-4-fill',        label: 'Settings' },
    ],
  },
];

/* =====================================================================
   MODALS
===================================================================== */
function CourseModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {
    title: '', category: 'Governance', instructor: '', level: 'Beginner',
    price: '', description: '',
    modules: [{ title: '', videoLink: '' }],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addModule = () => setForm(f => ({ ...f, modules: [...f.modules, { title: '', videoLink: '' }] }));
  const updateMod = (i, k, v) => {
    const m = [...form.modules];
    m[i] = { ...m[i], [k]: v };
    setForm(f => ({ ...f, modules: m }));
  };
  const removeMod = (i) => setForm(f => ({ ...f, modules: f.modules.filter((_, idx) => idx !== i) }));

  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up">
        <header className="adm-modal-header">
          <h3>{initial ? 'Edit Course' : 'Add New Course'}</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <div className="adm-form-row">
            <div className="adm-form-group adm-flex-2">
              <label>Course Title*</label>
              <input placeholder="e.g. Foundations of Public Governance" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="adm-form-group">
              <label>Level</label>
              <select value={form.level} onChange={e => set('level', e.target.value)}>
                {['Beginner','Medium','Advance'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {['Governance','Finance','Integrity','Democracy','Transparency','Digital'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="adm-form-group">
              <label>Instructor Name*</label>
              <input placeholder="Dr. Sarah Chen" value={form.instructor} onChange={e => set('instructor', e.target.value)} required />
            </div>
            <div className="adm-form-group">
              <label>Price (₦)</label>
              <input type="number" placeholder="0 = Free" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>
          <div className="adm-form-group">
            <label>Description</label>
            <textarea rows="3" placeholder="What learners will gain from this course..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="adm-modules-section">
            <div className="adm-section-subtitle">
              <h4>Modules</h4>
              <button className="adm-add-btn" type="button" onClick={addModule}><i className="ri-add-line"></i> Add Module</button>
            </div>
            {form.modules.map((mod, i) => (
              <div key={i} className="adm-module-row">
                <span className="adm-module-num">{i + 1}</span>
                <div className="adm-module-fields">
                  <input placeholder="Module title" value={mod.title} onChange={e => updateMod(i, 'title', e.target.value)} />
                  <input type="url" placeholder="Video URL (YouTube/Vimeo) — leave blank until admin assigns" value={mod.videoLink} onChange={e => updateMod(i, 'videoLink', e.target.value)} />
                </div>
                {form.modules.length > 1 && (
                  <button className="adm-remove-btn" type="button" onClick={() => removeMod(i)}><i className="ri-delete-bin-line"></i></button>
                )}
              </div>
            ))}
          </div>
        </div>
        <footer className="adm-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="special-button" onClick={() => { onSave(form); onClose(); }}>
            {initial ? 'Save Changes' : 'Publish Course'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function ResourceModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', type: 'PERL', category: 'Governance', description: '', fileUrl: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up">
        <header className="adm-modal-header">
          <h3>Add Library Resource</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <div className="adm-form-group"><label>Title*</label><input placeholder="Resource title" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>{['PERL','SPARC','SLGP'].map(t=><option key={t}>{t}</option>)}</select>
            </div>
            <div className="adm-form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>{['Governance','Finance','Integrity','Democracy','Transparency','Digital'].map(c=><option key={c}>{c}</option>)}</select>
            </div>
          </div>
          <div className="adm-form-group"><label>Description</label><textarea rows="2" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="adm-form-group"><label>File / PDF URL</label><input type="url" placeholder="https://... link to document" value={form.fileUrl} onChange={e => set('fileUrl', e.target.value)} /></div>
        </div>
        <footer className="adm-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="special-button" onClick={() => { onSave(form); onClose(); }}>Save Resource</button>
        </footer>
      </div>
    </div>
  );
}

/* =====================================================================
   PANEL COMPONENTS
===================================================================== */
function OverviewPanel({ onAddCourse }) {
  return (
    <div className="adm-panel">
      <div className="adm-stats-grid">
        {[
          { icon: 'ri-team-fill',       label: 'Total Learners',       value: '12,450', delta: '+12%', color: 'blue'   },
          { icon: 'ri-book-fill',       label: 'Active Courses',       value: '142',    delta: 'Stable', color: 'green' },
          { icon: 'ri-award-fill',      label: 'Certifications Issued',value: '3,120',  delta: '+5%',  color: 'orange' },
          { icon: 'ri-folder-fill',     label: 'Library Resources',    value: '284',    delta: '+8%',  color: 'purple' },
        ].map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className={`adm-stat-icon ${s.color}`}><i className={s.icon}></i></div>
            <div>
              <span className="adm-stat-label">{s.label}</span>
              <h3 className="adm-stat-value">{s.value}</h3>
              <span className="adm-stat-delta">{s.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-charts-grid">
        <div className="adm-chart-card">
          <h4>Learner Growth</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={STATS_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="learners" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="adm-chart-card">
          <h4>Resources Added per Month</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={STATS_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="resources" fill="var(--secondary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="adm-quick-actions">
        <h4>Quick Actions</h4>
        <div className="adm-action-row">
          <button className="adm-action-card" onClick={onAddCourse}>
            <i className="ri-add-circle-fill"></i><span>Add Course</span>
          </button>
          <button className="adm-action-card">
            <i className="ri-upload-cloud-fill"></i><span>Upload Resource</span>
          </button>
          <button className="adm-action-card">
            <i className="ri-file-list-3-fill"></i><span>Create Quiz</span>
          </button>
          <button className="adm-action-card">
            <i className="ri-user-add-fill"></i><span>Invite User</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CoursesPanel({ courses, setCourses }) {
  const [modal, setModal] = useState(null); // null | 'add' | number (edit id)
  const editCourse = courses.find(c => c.id === modal);

  const save = (form) => {
    if (typeof modal === 'number') {
      setCourses(cs => cs.map(c => c.id === modal ? { ...c, ...form } : c));
    } else {
      setCourses(cs => [...cs, { ...form, id: Date.now(), learners: 0, status: 'Draft' }]);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Courses <span className="adm-count">{courses.length}</span></h3>
        <button className="special-button" onClick={() => setModal('add')}><i className="ri-add-line"></i> Add Course</button>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Level</th><th>Learners</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td className="adm-course-title-cell">{c.title}</td>
                <td><span className="adm-cat-badge">{c.category}</span></td>
                <td>{c.level}</td>
                <td>{c.learners}</td>
                <td>
                  <span className={`adm-status-badge ${c.status === 'Published' ? 'published' : 'draft'}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn" title="Edit" onClick={() => setModal(c.id)}><i className="ri-edit-line"></i></button>
                    <button className="adm-icon-btn danger" title="Delete" onClick={() => setCourses(cs => cs.filter(x => x.id !== c.id))}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <CourseModal
          initial={editCourse ? { ...editCourse, modules: editCourse.modules || [{ title:'', videoLink:'' }] } : null}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function ResourcesPanel({ resources, setResources }) {
  const [modal, setModal] = useState(false);
  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Library Resources <span className="adm-count">{resources.length}</span></h3>
        <button className="special-button" onClick={() => setModal(true)}><i className="ri-add-line"></i> Add Resource</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Title</th><th>Type</th><th>Category</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td><span className="adm-type-badge">{r.type}</span></td>
                <td>{r.category}</td>
                <td><span className={`adm-status-badge ${r.status === 'Published' ? 'published' : 'draft'}`}>{r.status}</span></td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn" title="Toggle status" onClick={() => setResources(rs => rs.map(x => x.id === r.id ? { ...x, status: x.status === 'Published' ? 'Draft' : 'Published' } : x))}>
                      <i className={r.status === 'Published' ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                    <button className="adm-icon-btn danger" onClick={() => setResources(rs => rs.filter(x => x.id !== r.id))}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <ResourceModal onClose={() => setModal(false)} onSave={form => setResources(rs => [...rs, { ...form, id: Date.now(), status: 'Draft' }])} />}
    </div>
  );
}

function UsersPanel({ users }) {
  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Users <span className="adm-count">{users.length}</span></h3>
        <button className="special-button"><i className="ri-user-add-line"></i> Invite User</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Courses</th><th>Joined</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.courses}</td>
                <td>{u.joined}</td>
                <td><span className={`adm-status-badge ${u.status === 'Active' ? 'published' : 'draft'}`}>{u.status}</span></td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn"><i className="ri-edit-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="adm-panel">
      <div className="adm-panel-header"><h3>Analytics</h3></div>
      <div className="adm-chart-card" style={{marginBottom: '1.5rem'}}>
        <h4>Certifications Issued</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={STATS_DATA}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Bar dataKey="certs" fill="var(--primary)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="adm-analytics-placeholder">
        <i className="ri-map-pin-user-line"></i>
        <p>Global engagement heatmap coming soon</p>
      </div>
    </div>
  );
}

/* =====================================================================
   MAIN COMPONENT
===================================================================== */
const PANEL_MAP = { overview: OverviewPanel, courses: CoursesPanel, resources: ResourcesPanel, users: UsersPanel, analytics: AnalyticsPanel };
const DEFAULT_PANEL = (id) => () => <div className="adm-panel"><p style={{color:'var(--text-soft)'}}>Panel '{id}' — coming soon</p></div>;

const AdminDashboard = ({ onNavigate }) => {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState(COURSES);
  const [resources, setResources] = useState(RESOURCES);
  const [users] = useState(USERS);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && pass) {
      setAuthed(true);
    } else {
      setLoginError('Please enter valid credentials.');
    }
  };

  /* --- Login Wall --- */
  if (!authed) {
    return (
      <div className="adm-login-wall">
        <div className="adm-login-card animate-up">
          <img src="/assets/images/Logo/GRH-icon.png" alt="GRH" className="adm-login-logo" />
          <h2>Admin Portal</h2>
          <p>Authorised access only.</p>
          <form onSubmit={handleLogin} className="adm-login-form">
            <input type="email" placeholder="admin@govhub.org" value={email} onChange={e => { setEmail(e.target.value); setLoginError(''); }} required />
            <input type="password" placeholder="Password" value={pass} onChange={e => { setPass(e.target.value); setLoginError(''); }} required />
            {loginError && <p className="adm-login-error">{loginError}</p>}
            <button type="submit" className="special-button">Unlock Dashboard</button>
          </form>
          <button className="adm-back-link" onClick={() => onNavigate('welcome')}>← Back to Site</button>
        </div>
      </div>
    );
  }

  /* --- Main Dashboard --- */
  const ActivePanel = PANEL_MAP[activeSection] || DEFAULT_PANEL(activeSection);

  return (
    <>
      <button className="adm-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
        <i className={sidebarOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
      </button>

      <div className="adm-wrapper">
        {sidebarOpen && <div className="adm-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <aside className={`adm-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="adm-sidebar-logo">
            <img src="/assets/images/Logo/Main logo.png" alt="Governance Resource Hub" />
            <span className="adm-portal-label">Admin Portal</span>
          </div>

          <nav className="adm-sidebar-nav">
            {NAV_GROUPS.map(group => (
              <React.Fragment key={group.label}>
                <span className="adm-nav-label">{group.label}</span>
                {group.links.map(link => (
                  <button
                    key={link.id}
                    className={`adm-nav-link ${activeSection === link.id ? 'active' : ''}`}
                    onClick={() => { setActiveSection(link.id); setSidebarOpen(false); }}
                  >
                    <i className={link.icon}></i>
                    {link.label}
                    {link.badge !== undefined && <span className="adm-nav-badge">{link.badge}</span>}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </nav>

          <div className="adm-sidebar-footer">
            <span className="adm-nav-label">Session</span>
            <button className="adm-nav-link" onClick={() => onNavigate('welcome')}><i className="ri-arrow-left-line"></i> Back to Site</button>
            <button className="adm-nav-link" onClick={() => setAuthed(false)}><i className="ri-logout-box-line"></i> Sign Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="adm-main">
          <header className="adm-topbar">
            <div className="adm-topbar-title">
              <h2>{NAV_GROUPS.flatMap(g => g.links).find(l => l.id === activeSection)?.label || 'Admin'}</h2>
              <span>Governance Resource Hub</span>
            </div>
            <div className="adm-topbar-actions">
              <button className="adm-topbar-btn"><i className="ri-notification-fill"></i></button>
              <div className="adm-admin-badge">
                <div className="adm-admin-avatar">AD</div>
                <span>Admin</span>
              </div>
            </div>
          </header>

          <div className="adm-content">
            {activeSection === 'overview'   && <OverviewPanel onAddCourse={() => setActiveSection('courses')} />}
            {activeSection === 'courses'    && <CoursesPanel courses={courses} setCourses={setCourses} />}
            {activeSection === 'resources'  && <ResourcesPanel resources={resources} setResources={setResources} />}
            {activeSection === 'users'      && <UsersPanel users={users} />}
            {activeSection === 'analytics'  && <AnalyticsPanel />}
            {!PANEL_MAP[activeSection]      && <DEFAULT_PANEL id={activeSection} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
