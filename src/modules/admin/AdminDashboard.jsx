import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import mainLogo from '../../assets/images/Logo/Main logo.png';
import grhIcon from '../../assets/images/Logo/GRH-icon.png';
import ModernDropdown from '../../components/ui/ModernDropdown';
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

const BOOKS = [
  { id: 1, title: 'Governance in the 21st Century', summary: 'A comprehensive guide to modern governance frameworks and best practices.', imageUrl: '', fileUrl: '#', status: 'Published' },
  { id: 2, title: 'Public Financial Management Handbook', summary: 'Essential reference for PFM practitioners in developing economies.', imageUrl: '', fileUrl: '#', status: 'Published' },
];

const NAV_GROUPS = [
  {
    label: 'Content',
    links: [
      { id: 'overview',   icon: 'ri-dashboard-fill',    label: 'Overview' },
      { id: 'courses',    icon: 'ri-book-fill',          label: 'Courses', badge: COURSES.length },
      { id: 'books',      icon: 'ri-booklet-fill',       label: 'Books' },
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
function UserModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: '', email: '', role: 'Learner', status: 'Active' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up" style={{ maxWidth: 450 }}>
        <header className="adm-modal-header">
          <h3>Invite/Add User</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <div className="adm-form-group">
            <label>Full Name*</label>
            <input placeholder="e.g. John Doe" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="adm-form-group">
            <label>Email Address*</label>
            <input type="email" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Role</label>
              <ModernDropdown 
                options={['Learner','Instructor','Admin']} 
                value={form.role} 
                onChange={v => set('role', v)} 
              />
            </div>
            <div className="adm-form-group">
              <label>Initial Status</label>
              <ModernDropdown 
                options={['Active','Inactive']} 
                value={form.status} 
                onChange={v => set('status', v)} 
              />
            </div>
          </div>
        </div>
        <footer className="adm-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="special-button" onClick={() => { 
            if(!form.name || !form.email) return alert('Name and Email are required');
            onSave(form); 
            onClose(); 
          }}>
            {initial ? 'Save Changes' : 'Send Invitation'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function CourseModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {
    title: '', category: 'Governance', instructor: '', level: 'Beginner',
    price: '', description: '',
    modules: [{ title: '', videoLink: 'https://youtu.be/svYm5KomARg' }],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addModule = () => setForm(f => ({ ...f, modules: [...f.modules, { title: '', videoLink: 'https://youtu.be/svYm5KomARg' }] }));
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
              <ModernDropdown 
                options={['Beginner','Medium','Advance']} 
                value={form.level} 
                onChange={v => set('level', v)} 
              />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Category</label>
              <ModernDropdown 
                options={['Governance','Finance','Integrity','Democracy','Transparency','Digital']} 
                value={form.category} 
                onChange={v => set('category', v)} 
              />
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

function ResourceModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { title: '', type: 'PERL', category: 'Governance', description: '', fileUrl: '' });
  const [file, setFile] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      set('fileUrl', URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up">
        <header className="adm-modal-header">
          <h3>{initial ? 'Edit Library Resource' : 'Add Library Resource'}</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <div className="adm-form-group"><label>Title*</label><input placeholder="Resource title" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Type</label>
              <ModernDropdown 
                options={['PERL','SPARC','SLGP']} 
                value={form.type} 
                onChange={v => set('type', v)} 
              />
            </div>
            <div className="adm-form-group">
              <label>Category</label>
              <ModernDropdown 
                options={['Governance','Finance','Integrity','Democracy','Transparency','Digital']} 
                value={form.category} 
                onChange={v => set('category', v)} 
              />
            </div>
          </div>
          <div className="adm-form-group"><label>Description</label><textarea rows="2" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="adm-form-group">
            <label>Upload Document (PDF/Doc)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            {initial && !file && <p style={{fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: 4}}>Current: {form.fileUrl}</p>}
            {file && <p style={{fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4}}>New: {file.name}</p>}
          </div>
        </div>
        <footer className="adm-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="special-button" onClick={() => { onSave(form); onClose(); }}>{initial ? 'Save Changes' : 'Save Resource'}</button>
        </footer>
      </div>
    </div>
  );
}

/* ----- BOOK MODAL ----- */
const DEFAULT_BOOK_IMG = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

function BookModal({ onClose, onSave, initial }) {
  const [books, setBooks] = useState(initial ? [initial] : [{ title: '', summary: '', imagePreview: '', imageFile: null, bookFile: null }]);

  const updateBook = (i, key, value) => {
    const updated = [...books];
    updated[i] = { ...updated[i], [key]: value };
    setBooks(updated);
  };

  const handleImageChange = (i, e) => {
    const file = e.target.files[0];
    if (file) {
      updateBook(i, 'imageFile', file);
      updateBook(i, 'imagePreview', URL.createObjectURL(file));
    }
  };

  const handleFileChange = (i, e) => {
    const file = e.target.files[0];
    if (file) updateBook(i, 'bookFile', file);
  };

  const addAnother = () => setBooks(b => [...b, { title: '', summary: '', imagePreview: '', imageFile: null, bookFile: null }]);
  const removeBook = (i) => setBooks(b => b.filter((_, idx) => idx !== i));

  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up" style={{ maxWidth: 700 }}>
        <header className="adm-modal-header">
          <h3>{initial ? 'Edit Book' : 'Add Books / Resources'}</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {books.map((book, i) => (
            <div key={i} className="adm-book-entry" style={{ padding: '1.25rem', background: 'var(--bg-weak)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', position: 'relative' }}>
              {!initial && books.length > 1 && (
                <button className="adm-remove-btn" style={{ position: 'absolute', top: 12, right: 12 }} onClick={() => removeBook(i)}><i className="ri-delete-bin-line"></i></button>
              )}
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem' }}>
                <div className="adm-book-img-upload" style={{ width: 120, height: 160, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px dashed var(--stroke-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', flexShrink: 0, background: '#f9f9fb' }}>
                  <img
                    src={book.imagePreview || book.imageUrl || DEFAULT_BOOK_IMG}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: (book.imagePreview || book.imageUrl) ? 1 : 0.4 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(i, e)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  {!(book.imagePreview || book.imageUrl) && <span style={{ position: 'absolute', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)', textAlign: 'center', padding: '0.5rem' }}>Click to add cover</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="adm-form-group">
                    <label>Book Title*</label>
                    <input placeholder="e.g. Public Financial Management" value={book.title} onChange={e => updateBook(i, 'title', e.target.value)} />
                  </div>
                  <div className="adm-form-group">
                    <label>Summary</label>
                    <textarea rows="2" placeholder="A short description of this book..." value={book.summary} onChange={e => updateBook(i, 'summary', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="adm-form-group">
                <label>Upload Book File (PDF, EPUB, etc.)</label>
                <input type="file" accept=".pdf,.epub,.doc,.docx" onChange={(e) => handleFileChange(i, e)} />
                {book.bookFile && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4 }}>📄 {book.bookFile.name}</span>}
                {initial && !book.bookFile && <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: 4 }}>Current: {book.fileUrl}</span>}
              </div>
            </div>
          ))}
          {!initial && (
            <button className="adm-add-btn" type="button" onClick={addAnother} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              <i className="ri-add-line"></i> Add Another Book
            </button>
          )}
        </div>
        <footer className="adm-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="special-button" onClick={() => {
            const resultBooks = books.filter(b => b.title.trim()).map(b => ({
              id: b.id || (Date.now() + Math.random()),
              title: b.title,
              summary: b.summary,
              imageUrl: b.imagePreview || b.imageUrl || '',
              fileUrl: b.bookFile ? URL.createObjectURL(b.bookFile) : (b.fileUrl || '#'),
              status: b.status || 'Draft',
            }));
            if (initial) onSave(resultBooks[0]);
            else onSave(resultBooks);
            onClose();
          }}>
            {initial ? 'Save Changes' : `Publish ${books.length > 1 ? `${books.length} Books` : 'Book'}`}
          </button>
        </footer>
      </div>
    </div>
  );
}

/* =====================================================================
   PANEL COMPONENTS
===================================================================== */
function OverviewPanel({ onAddCourse, onAddBook, onAddQuiz, onAddResource }) {
  return (
    <div className="adm-panel">
      {/* Quick Actions */}
      <div className="adm-quick-actions">
        <h4>Quick Actions</h4>
        <div className="adm-action-row">
          
          <button className="btn-outline" onClick={onAddBook}>
            <i className="ri-book-3-fill"></i><span>Add Book</span>
          </button>

          <button className="btn-outline" onClick={onAddResource}>
            <i className="ri-upload-cloud-fill"></i><span>Upload Resource</span>
          </button>

          <button className="btn-outline" onClick={onAddQuiz}>
            <i className="ri-file-list-3-fill"></i><span>Create Quiz</span>
          </button>

          <button className="special-button" onClick={onAddCourse}>
            <i className="ri-add-circle-fill"></i><span>Add Course</span>
          </button>

        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Charts */}
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

      {/* Recent Activity */}
      <div className="adm-panel-header">
        <h3>Recent Activity</h3>
        <span className="adm-count">5 New</span>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>User</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5].map(i => (
              <tr key={i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <i className="ri-book-open-line"></i>
                    </div>
                    <span>Completed "Public Financial Management"</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                      JD
                    </div>
                    <span>John Doe</span>
                  </div>
                </td>
                <td>2 hours ago</td>
                <td><span className="adm-status-badge active">Completed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
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
                    <button className="adm-icon-btn" title="Toggle status" onClick={() => setCourses(cs => cs.map(x => x.id === c.id ? { ...x, status: x.status === 'Published' ? 'Draft' : 'Published' } : x))}>
                      <i className={c.status === 'Published' ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
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
  const [modal, setModal] = useState(null); // null | 'add' | number (id)
  const editItem = resources.find(r => r.id === modal);

  const save = (form) => {
    if (typeof modal === 'number') {
      setResources(rs => rs.map(r => r.id === modal ? { ...r, ...form } : r));
    } else {
      setResources(rs => [...rs, { ...form, id: Date.now(), status: 'Draft' }]);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Library Resources <span className="adm-count">{resources.length}</span></h3>
        <button className="special-button" onClick={() => setModal('add')}><i className="ri-add-line"></i> Add Resource</button>
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
                    <button className="adm-icon-btn" title="Edit" onClick={() => setModal(r.id)}><i className="ri-edit-line"></i></button>
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
      {modal && <ResourceModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}

function UsersPanel({ users, setUsers }) {
  const [modal, setModal] = useState(null); // null | 'add' | user object (edit)
  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Users <span className="adm-count">{users.length}</span></h3>
        <button className="special-button" onClick={() => setModal('add')}><i className="ri-user-add-line"></i> Invite User</button>
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
                <td>{u.courses || 0}</td>
                <td>{u.joined || 'Just now'}</td>
                <td><span className={`adm-status-badge ${u.status === 'Active' ? 'published' : 'draft'}`}>{u.status}</span></td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn" title="Edit" onClick={() => setModal(u)}><i className="ri-edit-line"></i></button>
                    <button className="adm-icon-btn danger" title="Delete" onClick={() => setUsers(us => us.filter(x => x.email !== u.email))}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <UserModal 
          initial={typeof modal === 'object' ? modal : null}
          onClose={() => setModal(null)} 
          onSave={(nu) => {
            if (typeof modal === 'object') {
              setUsers(us => us.map(x => x.email === modal.email ? { ...x, ...nu } : x));
            } else {
              setUsers(us => [{ ...nu, courses: 0, joined: 'Mar 2024' }, ...us]);
            }
          }} 
        />
      )}
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

function AdminQuizzesPanel() {
  return (
    <div className="adm-panel">
      <div className="adm-panel-header"><h3>Quizzes & Assessments</h3></div>
      <div className="adm-placeholder-card">
        <i className="ri-file-list-3-line"></i>
        <h4>Quizzes Management Coming Soon</h4>
        <p>You'll soon be able to create, edit and grade assessments directly from here.</p>
      </div>
    </div>
  );
}

function AdminInstructorsPanel() {
  return (
    <div className="adm-panel">
      <div className="adm-panel-header"><h3>Instructors</h3></div>
      <div className="adm-placeholder-card">
        <i className="ri-user-star-line"></i>
        <h4>Instructor Management Coming Soon</h4>
        <p>A hub to manage your team of governance experts and guest lecturers.</p>
      </div>
    </div>
  );
}

function AdminSettingsPanel() {
  const [name, setName] = useState("GRH Admin");
  const [email, setEmail] = useState("admin@govhub.org");
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
    <div className="adm-panel">
      <div className="adm-panel-header"><h3>System Settings</h3></div>
      <div className="adm-settings-form">
        <section className="adm-settings-section">
          <h4>Administrator Profile</h4>
          
          <div className="adm-avatar-settings" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-weak)', borderRadius: '12px' }}>
            <div className="adm-current-avatar" style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, overflow: 'hidden' }}>
              {avatar ? <img src={avatar} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'AD'}
            </div>
            <div className="adm-avatar-actions">
              <label className="special-button btn-sm" style={{ cursor: 'pointer', display: 'inline-block', marginBottom: '0.5rem' }}>
                Change Avatar
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Upload a professional headshot. JPG, PNG or GIF.</p>
            </div>
          </div>

          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="adm-form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
        </section>
        
        <section className="adm-settings-section">
          <h4>Platform Configuration</h4>
          <div className="adm-form-group">
            <label>Platform Name</label>
            <input type="text" value="Governance Resource Hub" readOnly />
          </div>
        </section>

        <section className="adm-settings-section">
          <h4>Danger Zone</h4>
          <p style={{fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '1rem'}}>Crucial system actions that cannot be undone.</p>
          <button className="btn-outline danger">Reset Platform Analytics</button>
        </section>
        
        <div className="adm-form-actions">
          <button className="special-button">Save Configuration</button>
        </div>
      </div>
    </div>
  );
}

/* --- BOOKS PANEL --- */
function BooksPanel({ books, setBooks }) {
  const [modal, setModal] = useState(null); // null | 'add' | number (id)
  const editItem = books.find(b => b.id === modal);
  const DEFAULT_BOOK_IMG = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

  const save = (data) => {
    if (typeof modal === 'number') {
      setBooks(bs => bs.map(b => b.id === modal ? { ...b, ...data } : b));
    } else {
      setBooks(bs => [...bs, ...data]);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Books <span className="adm-count">{books.length}</span></h3>
        <button className="special-button" onClick={() => setModal('add')}><i className="ri-add-line"></i> Add Book</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th></th><th>Title</th><th>Summary</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {books.map(b => (
              <tr key={b.id}>
                <td style={{width: 80}}>
                  <img src={b.imageUrl || DEFAULT_BOOK_IMG} alt={b.title} style={{width: 60, height: 56, objectFit: 'cover', borderRadius: 6}} />
                </td>
                <td><strong>{b.title}</strong></td>
                <td style={{maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{b.summary}</td>
                <td><span className={`adm-status-badge ${b.status === 'Published' ? 'published' : 'draft'}`}>{b.status}</span></td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn" title="Edit" onClick={() => setModal(b.id)}><i className="ri-edit-line"></i></button>
                    <button className="adm-icon-btn" title="Toggle status" onClick={() => setBooks(bs => bs.map(x => x.id === b.id ? { ...x, status: x.status === 'Published' ? 'Draft' : 'Published' } : x))}>
                      <i className={b.status === 'Published' ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                    <button className="adm-icon-btn danger" onClick={() => setBooks(bs => bs.filter(x => x.id !== b.id))}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <BookModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}

/* =====================================================================
   MAIN COMPONENT
===================================================================== */
const PANEL_MAP = { 
  overview: OverviewPanel, 
  courses: CoursesPanel, 
  resources: ResourcesPanel, 
  users: UsersPanel, 
  analytics: AnalyticsPanel, 
  books: BooksPanel,
  quizzes: AdminQuizzesPanel,
  instructors: AdminInstructorsPanel,
  settings: AdminSettingsPanel
};
const DEFAULT_PANEL = (id) => () => <div className="adm-panel"><p style={{color:'var(--text-soft)'}}>Panel '{id}' — coming soon</p></div>;

const AdminDashboard = ({ onNavigate, onLogout, user }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState(COURSES);
  const [resources, setResources] = useState(RESOURCES);
  const [books, setBooks] = useState(BOOKS);
  const [users, setUsers] = useState(USERS);

  /* --- Main Dashboard --- */

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
            <img src={mainLogo} alt="Governance Resource Hub" />
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
            <button className="adm-nav-link" onClick={() => { onLogout(); onNavigate('welcome'); }}><i className="ri-logout-box-line"></i> Sign Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="adm-main">
          <header className="adm-topbar">
            <div className="adm-topbar-title">
              <h2>{NAV_GROUPS.flatMap(g => g.links).find(l => l.id === activeSection)?.label || 'Admin'}</h2>
              <span>Welcome back, {user?.name || 'Administrator'}</span>
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
            {activeSection === 'overview'   && <OverviewPanel onAddCourse={() => setActiveSection('courses')} onAddBook={() => setActiveSection('books')} />}
            {activeSection === 'courses'    && <CoursesPanel courses={courses} setCourses={setCourses} />}
            {activeSection === 'books'      && <BooksPanel books={books} setBooks={setBooks} />}
            {activeSection === 'resources'  && <ResourcesPanel resources={resources} setResources={setResources} />}
            {activeSection === 'users'      && <UsersPanel users={users} setUsers={setUsers} />}
            {activeSection === 'analytics'  && <AnalyticsPanel />}
            {activeSection === 'quizzes'    && <AdminQuizzesPanel />}
            {activeSection === 'instructors'&& <AdminInstructorsPanel />}
            {activeSection === 'settings'   && <AdminSettingsPanel />}
            {!PANEL_MAP[activeSection] && (
              <div className="adm-panel"><p style={{color:'var(--text-soft)', padding:'2rem'}}>Panel '{activeSection}' — coming soon</p></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
