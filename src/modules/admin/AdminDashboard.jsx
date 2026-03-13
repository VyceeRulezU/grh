import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import mainLogo from '../../assets/images/Logo/Main logo.png';
import { BOOKS } from '../../data/legacyData';
import grhIcon from '../../assets/images/Logo/GRH-icon.png';
import ModernDropdown from '../../components/ui/ModernDropdown';
import StatusModal from '../../components/ui/StatusModal';
import { useModal } from '../../hooks/useModal';
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

const WORKSHOPS = [
  { id: 1, title: 'PFM Reform in Practice', date: '2024-03-15', time: '10:00', status: 'Upcoming', host: 'World Bank Nigeria', attendees: 120, format: 'Virtual', registrations: [
    { name: 'Sarah Chen', email: 'sarah.chen@gov.org', role: 'Learner', reason: 'To improve fiscal transparency.' },
    { name: 'Marcus Thorne', email: 'm.thorne@pfm.org', role: 'Learner', reason: 'Practical PFM application.' }
  ]},
  { id: 2, title: 'Anti-Corruption Compliance Workshop', date: '2024-03-22', time: '14:00', status: 'Upcoming', host: 'Transparency International', attendees: 85, format: 'Hybrid', registrations: [] },
  { id: 3, title: 'Open Government Hackathon', date: '2024-04-05', time: '09:00', status: 'Upcoming', host: 'OGP Nigeria', attendees: 200, format: 'In-person', registrations: [] },
];

// Removed global NAV_GROUPS to use dynamic version inside AdminDashboard

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
            if (!form.name || !form.email) return;
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
function WorkshopModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { 
    title: '', 
    date: '', 
    time: '', 
    host: '', 
    format: 'Virtual', 
    status: 'Upcoming',
    attendees: 0,
    registrations: []
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up" style={{ maxWidth: 500 }}>
        <header className="adm-modal-header">
          <h3>{initial ? 'Edit Workshop' : 'Create New Workshop'}</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <form className="adm-form" onSubmit={handleSubmit}>
            <div className="adm-form-group">
              <label>Workshop Title*</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Date*</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="adm-form-group">
                <label>Time*</label>
                <input type="time" value={form.time} onChange={e => set('time', e.target.value)} required />
              </div>
            </div>
            <div className="adm-form-group">
              <label>Host / Organization*</label>
              <input type="text" value={form.host} onChange={e => set('host', e.target.value)} required />
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Format</label>
                <select value={form.format} onChange={e => set('format', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--stroke-soft)', width: '100%', background: 'white' }}>
                  <option>Virtual</option>
                  <option>Hybrid</option>
                  <option>In-person</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--stroke-soft)', width: '100%', background: 'white' }}>
                  <option>Upcoming</option>
                  <option>Completed</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <footer className="adm-modal-footer">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="special-button" onClick={handleSubmit}>Save Workshop</button>
        </footer>
      </div>
    </div>
  );
}

function WorkshopAttendeesModal({ workshop, onClose }) {
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up" style={{ maxWidth: 650 }}>
        <header className="adm-modal-header">
          <div>
            <h3>Workshop Attendees</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{workshop.title}</p>
          </div>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <div className="adm-table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {workshop.registrations && workshop.registrations.length > 0 ? (
              <table className="adm-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Reason</th></tr></thead>
                <tbody>
                  {workshop.registrations.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.name}</strong></td>
                      <td>{r.email}</td>
                      <td>{r.role}</td>
                      <td style={{ fontSize: '0.8rem', maxWidth: 200, whiteSpace: 'normal' }}>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)' }}>
                <i className="ri-team-line" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                No registrations found for this workshop yet.
              </div>
            )}
          </div>
        </div>
        <footer className="adm-modal-footer">
           <button className="special-button" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}

function OverviewPanel({ onAddCourse, onAddBook, onAddQuiz, onAddResource, stats }) {
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
          { icon: 'ri-team-fill',       label: 'Total Learners',       value: stats.learners,       delta: '+0%', color: 'blue'   },
          { icon: 'ri-book-fill',       label: 'Active Courses',       value: stats.courses,       delta: 'Stable', color: 'green' },
          { icon: 'ri-award-fill',      label: 'Certifications Issued',value: stats.certs,  delta: '+0%',  color: 'orange' },
          { icon: 'ri-folder-fill',     label: 'Library Resources',    value: stats.resources,    delta: '+0%',  color: 'purple' },
        ].map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className={`adm-stat-icon ${s.color}`}><i className={s.icon}></i></div>
            <div>
              <span className="adm-stat-label">{s.label}</span>
              <h3 className="adm-stat-value">{s.value.toLocaleString()}</h3>
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
        <h3>Recent Completions</h3>
        <span className="adm-count">{stats.recentActivities.length} New</span>
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
            {stats.recentActivities.length > 0 ? stats.recentActivities.map(act => (
              <tr key={act.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <i className="ri-book-open-line"></i>
                    </div>
                    <span>Finished "{act.courses?.title || 'Course'}"</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'white' }}>
                      {act.profiles?.name?.substring(0,2).toUpperCase() || '??'}
                    </div>
                    <span>{act.profiles?.name || 'Anonymous'}</span>
                  </div>
                </td>
                <td>{new Date(act.last_accessed).toLocaleDateString()}</td>
                <td><span className="adm-status-badge published">Completed</span></td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{textAlign:'center', padding:'2rem', color:'var(--text-soft)'}}>No recent completions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoursesPanel({ courses, setCourses, onDelete }) {
  const [modal, setModal] = useState(null);
  const editCourse = courses.find(c => c.id === modal);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const save = async (form) => {
    try {
      const { modules, ...courseData } = form;
      let courseId = modal;

      if (typeof modal !== 'number' && typeof modal !== 'string') {
        // Create Course
        const { data: newCourse, error } = await supabase
          .from('courses')
          .insert([{ ...courseData, status: 'Published' }])
          .select()
          .single();
        if (error) throw error;
        courseId = newCourse.id;
      } else {
        // Update Course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', modal);
        if (error) throw error;
      }

      // Save Modules
      if (modules && modules.length > 0) {
        // For simplicity, we'll delete and re-insert for edits, or just insert for new
        if (typeof modal === 'number' || typeof modal === 'string') {
           await supabase.from('modules').delete().eq('course_id', courseId);
        }
        const modulesToInsert = modules.map((m, i) => ({
          course_id: courseId,
          title: m.title,
          video_url: m.videoLink,
          sequence_order: i + 1
        }));
        const { error: modError } = await supabase.from('modules').insert(modulesToInsert);
        if (modError) throw modError;
      }

      showSuccess('Course Saved', 'Course saved successfully!');
      setModal(null);
      window.location.reload();
    } catch (err) {
      showError('Save Error', 'Error saving course: ' + err.message);
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
                    <button className="adm-icon-btn" title="Toggle status" onClick={async () => {
                      try {
                        const newStatus = c.status === 'Published' ? 'Draft' : 'Published';
                        const { error } = await supabase.from('courses').update({ status: newStatus }).eq('id', c.id);
                        if (error) throw error;
                        window.location.reload();
                      } catch (err) { showError('Error', err.message); }
                    }}>
                      <i className={c.status === 'Published' ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                    <button className="adm-icon-btn danger" title="Delete" onClick={() => onDelete(c, 'course')}><i className="ri-delete-bin-line"></i></button>
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
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function ResourcesPanel({ resources, setResources, onDelete }) {
  const [modal, setModal] = useState(null);
  const editItem = resources.find(r => r.id === modal);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const save = async (form) => {
    try {
      if (typeof modal === 'number' || typeof modal === 'string') {
        const { error } = await supabase.from('library_resources').update(form).eq('id', modal);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('library_resources').insert([{ ...form, status: 'Published' }]);
        if (error) throw error;
      }
      showSuccess('Resource Saved', 'Resource saved successfully!');
      setModal(null);
      window.location.reload();
    } catch (err) {
      showError('Save Error', 'Error saving resource: ' + err.message);
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
                    <button className="adm-icon-btn" title="Toggle status" onClick={async () => {
                      try {
                        const newStatus = r.status === 'Published' ? 'Draft' : 'Published';
                        const { error } = await supabase.from('library_resources').update({ status: newStatus }).eq('id', r.id);
                        if (error) throw error;
                        window.location.reload();
                      } catch (err) { showError('Error', err.message); }
                    }}>
                      <i className={r.status === 'Published' ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                    <button className="adm-icon-btn danger" onClick={() => onDelete(r, 'resource')}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <ResourceModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function UsersPanel({ users, setUsers, onDelete, loggedInUser }) {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const handleSave = async (nu) => {
    setLoading(true);
    try {
      if (typeof modal === 'object') {
        // Just local state update for edits for now (dummy update)
        setUsers(us => us.map(x => x.email === modal.email ? { ...x, ...nu } : x));
        setModal(null);
      } else {
        // Invite new user via Edge Function
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            email: nu.email,
            name: nu.name,
            role: nu.role
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to invite user');
        }

        showSuccess('Invitation Sent', 'User invited successfully!');
        setUsers(us => [{ ...nu, courses: 0, joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }, ...us]);
        setModal(null);
      }
    } catch (err) {
      showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Users <span className="adm-count">{users.length}</span></h3>
        <button className="special-button" onClick={() => setModal('add')} disabled={loading}><i className="ri-user-add-line"></i> {loading ? 'Inviting...' : 'Invite User'}</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
           {/* ... existing table code ... */}
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
                    <button className="adm-icon-btn danger" title="Delete" onClick={() => onDelete(u, 'user')}><i className="ri-delete-bin-line"></i></button>
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
          onSave={handleSave} 
        />
      )}
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function AnalyticsPanel({ stats }) {
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
        <i className="ri-award-fill" style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem'}}></i>
        <h3>{stats.certs}</h3>
        <p>Total Certificates Generated to Date</p>
      </div>
    </div>
  );
}

function AdminQuizzesPanel() {
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();
  return (
    <div className="adm-panel">
      <div className="adm-panel-header"><h3>Quizzes & Assessments</h3></div>
      <div className="adm-placeholder-card">
        <i className="ri-file-list-3-line"></i>
        <h4>Quizzes Management Coming Soon</h4>
        <p>You'll soon be able to create, edit and grade assessments directly from here.</p>
      </div>
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function AdminInstructorsPanel() {
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();
  return (
    <div className="adm-panel">
      <div className="adm-panel-header"><h3>Instructors</h3></div>
      <div className="adm-placeholder-card">
        <i className="ri-user-star-line"></i>
        <h4>Instructor Management Coming Soon</h4>
        <p>A hub to manage your team of governance experts and guest lecturers.</p>
      </div>
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function AdminSettingsPanel({ user }) {
  const [name, setName] = useState(user?.name || "GRH Admin");
  const [email, setEmail] = useState(user?.email || "admin@govhub.org");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  useEffect(() => {
    // Fetch user profile to get existing avatar
    const fetchProfile = async () => {
       if (!user?.id) return;
       const { data, error } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
       if (data?.avatar_url) {
         setAvatar(data.avatar_url);
       }
    };
    fetchProfile();
  }, [user?.id]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!user?.id || user.id === 'undefined') {
      showError('Upload Failed', 'A valid administrator ID is required to update the avatar.');
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });
      
      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
         .from('avatars')
         .getPublicUrl(filePath);

      // 3. Update profile
      const { error: updateError } = await supabase
         .from('profiles')
         .update({ avatar_url: publicUrl })
         .eq('id', user.id);

      if (updateError) throw updateError;
      
      setAvatar(publicUrl);
      showSuccess('Avatar Updated', 'Avatar updated successfully! The sidebar logo will sync on next reload.');
    } catch (err) {
      showError('Upload Failed', `Failed to upload avatar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || user.id === 'undefined') {
      showError('Save Failed', 'A valid administrator ID is required to save changes.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess('Profile Updated', 'Administrator profile details saved successfully.');
    } catch (err) {
      showError('Save Failed', `Failed to save changes: ${err.message}`);
    } finally {
      setLoading(false);
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
              {avatar ? <img src={avatar} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (name.substring(0,2).toUpperCase())}
            </div>
            <div className="adm-avatar-actions">
              <label className={`special-button btn-sm ${loading ? 'opacity-50' : ''}`} style={{ cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-block', marginBottom: '0.5rem' }}>
                {loading ? 'Uploading...' : 'Change Avatar'}
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={loading} />
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Upload a professional headshot. JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
            </div>
            <div className="adm-form-group">
              <label>Email Address</label>
              <input type="email" value={email} disabled />
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
          <button className="special-button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

/* --- BOOKS PANEL --- */
function BooksPanel({ books, setBooks, onDelete }) {
  const [modal, setModal] = useState(null);
  const editItem = books.find(b => b.id === modal);
  const DEFAULT_BOOK_IMG = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const save = async (data) => {
    try {
      if (typeof modal === 'number' || typeof modal === 'string') {
        const { error } = await supabase.from('books').update(data).eq('id', modal);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('books').insert(data.map(b => ({ ...b, status: 'Published' })));
        if (error) throw error;
      }
      showSuccess('Books Saved', 'Books saved successfully!');
      setModal(null);
      window.location.reload();
    } catch (err) {
      showError('Save Error', 'Error saving books: ' + err.message);
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
                    <button className="adm-icon-btn" title="Toggle status" onClick={async () => {
                      try {
                        const newStatus = b.status === 'Published' ? 'Draft' : 'Published';
                        const { error } = await supabase.from('books').update({ status: newStatus }).eq('id', b.id);
                        if (error) throw error;
                        window.location.reload();
                      } catch (err) { showError('Error', err.message); }
                    }}>
                      <i className={b.status === 'Published' ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                    <button className="adm-icon-btn danger" onClick={() => onDelete(b, 'book')}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <BookModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
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
  settings: AdminSettingsPanel,
  workshops: WorkshopsPanel
};
const DEFAULT_PANEL = (id) => () => <div className="adm-panel"><p style={{color:'var(--text-soft)'}}>Panel '{id}' — coming soon</p></div>;

/* --- WORKSHOPS PANEL --- */
function WorkshopsPanel({ workshops, setWorkshops, onDelete }) {
  const [modal, setModal] = useState(null); // null | 'add' | number (id)
  const [attendeeModal, setAttendeeModal] = useState(null); // null | workshop object
  const editItem = workshops.find(w => w.id === modal);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const save = async (data) => {
    try {
       const { registrations, ...wData } = data;
       if (typeof modal === 'number' || typeof modal === 'string') {
         const { error } = await supabase.from('workshops').update(wData).eq('id', modal);
         if (error) throw error;
       } else {
         const { error } = await supabase.from('workshops').insert([{ ...wData, status: 'Upcoming' }]);
         if (error) throw error;
       }
       showSuccess('Workshop Saved', 'Workshop saved successfully!');
       setModal(null);
       window.location.reload();
    } catch (err) {
      showError('Save Error', 'Error saving workshop: ' + err.message);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <h3>Workshops <span className="adm-count">{workshops.length}</span></h3>
        <button className="special-button" onClick={() => setModal('add')}><i className="ri-calendar-event-line"></i> Create Workshop</button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Title</th><th>Date / Time</th><th>Host</th><th>Status</th><th>Attendees</th><th></th></tr></thead>
          <tbody>
            {workshops.map(w => (
              <tr key={w.id}>
                <td><strong>{w.title}</strong><br/><span style={{fontSize:'0.75rem', color:'var(--text-soft)'}}>{w.format}</span></td>
                <td>{w.date} @ {w.time}</td>
                <td>{w.host}</td>
                <td><span className={`adm-status-badge ${w.status === 'Upcoming' ? 'published' : (w.status === 'Completed' ? 'draft' : 'draft')}`}>{w.status}</span></td>
                <td>
                  <button className="adm-link-btn" onClick={() => setAttendeeModal(w)}>
                    <i className="ri-user-follow-line"></i> {w.registrations?.length || 0} Registered
                  </button>
                </td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn" title="Edit" onClick={() => setModal(w.id)}><i className="ri-edit-line"></i></button>
                    <button className="adm-icon-btn danger" onClick={() => onDelete(w, 'workshop')}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <WorkshopModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
      {attendeeModal && <WorkshopAttendeesModal workshop={attendeeModal} onClose={() => setAttendeeModal(null)} />}
    </div>
  );
}

const AdminDashboard = ({ onNavigate, onLogout, user }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    learners: 0,
    courses: 0,
    resources: 0,
    certs: 0,
    recentActivities: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [crs, res, bks, usr, wks, progress] = await Promise.all([
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('library_resources').select('*').order('created_at', { ascending: false }),
        supabase.from('books').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('workshops').select('*, workshop_registrations(*)').order('created_at', { ascending: false }),
        supabase.from('user_progress')
          .select('*, profiles(name), courses(title)')
          .eq('completed', true)
          .order('last_accessed', { ascending: false })
          .limit(5)
      ]);

      if (crs.data) setCourses(crs.data);
      if (res.data) setResources(res.data);
      if (bks.data) setBooks(bks.data);
      if (usr.data) setUsers(usr.data.map(u => ({ ...u, email: u.id, courses: 0, joined: 'Jan 2025', status: 'Active' })));
      if (wks.data) setWorkshops(wks.data.map(w => ({ ...w, registrations: w.workshop_registrations })));

      setStats({
        learners: usr.data?.length || 0,
        courses: crs.data?.length || 0,
        resources: (res.data?.length || 0) + (bks.data?.length || 0),
        certs: progress.data?.length || 0,
        recentActivities: progress.data || []
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Status Modal State
  const [statusModal, setStatusModal] = useState({ 
    isOpen: false, 
    type: 'warning', 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  const confirmLogout = () => {
    setStatusModal({
      isOpen: true,
      type: 'warning',
      title: 'Sign Out',
      message: 'Are you sure you want to log out of the admin portal?',
      onConfirm: () => {
        setStatusModal(prev => ({ ...prev, isOpen: false }));
        onLogout();
      }
    });
  };

  const confirmDelete = (item, type) => {
    const itemName = item.title || item.name || 'this item';
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${type}: "${itemName}"? This will remove the file permanently and this action cannot be undone.`,
      onConfirm: async () => {
        try {
          let table = '';
          if (type === 'course') table = 'courses';
          if (type === 'resource') table = 'library_resources';
          if (type === 'book') table = 'books';
          if (type === 'workshop') table = 'workshops';
          // (Users delete skipped for safety or handled separately)

          if (table) {
            const { error } = await supabase.from(table).delete().eq('id', item.id);
            if (error) throw error;
          }

          setStatusModal(prev => ({ ...prev, isOpen: false }));
          setStatusModal({ isOpen: true, type: 'success', title: 'Deleted', message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`, onConfirm: () => { setStatusModal(p => ({ ...p, isOpen: false })); window.location.reload(); } });
        } catch (err) {
          setStatusModal(prev => ({ ...prev, isOpen: false }));
          setStatusModal({ isOpen: true, type: 'error', title: 'Delete Failed', message: 'Delete failed: ' + err.message, onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) });
        }
        setStatusModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  /* --- Main Dashboard --- */
  const localNavGroups = [
    {
      label: 'Content',
      links: [
        { id: 'overview',   icon: 'ri-dashboard-fill',    label: 'Overview' },
        { id: 'courses',    icon: 'ri-book-fill',         label: 'Courses', badge: courses.length },
        { id: 'books',      icon: 'ri-booklet-fill',      label: 'Books',   badge: books.length },
        { id: 'resources',  icon: 'ri-folder-fill',       label: 'Library Resources', badge: resources.length },
        { id: 'workshops',  icon: 'ri-calendar-event-fill', label: 'Workshops', badge: workshops.length },
        { id: 'quizzes',    icon: 'ri-file-list-3-fill',  label: 'Quizzes & Assessments' },
      ],
    },
    {
      label: 'People',
      links: [
        { id: 'users',      icon: 'ri-team-fill',         label: 'Users', badge: users.length },
        { id: 'instructors',icon: 'ri-user-star-fill',    label: 'Instructors' },
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
            {/* <span className="adm-portal-label">Admin Portal</span> */}
          </div>

          <nav className="adm-sidebar-nav">
            {localNavGroups.map(group => (
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
            <button className="adm-nav-link" onClick={confirmLogout}><i className="ri-logout-box-line"></i> Sign Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="adm-main">
          <header className="adm-topbar">
            <div className="adm-topbar-title">
              <h2>{localNavGroups.flatMap(g => g.links).find(l => l.id === activeSection)?.label || 'Admin'}</h2>
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
            {activeSection === 'overview'   && <OverviewPanel 
                onAddCourse={() => setActiveSection('courses')} 
                onAddBook={() => setActiveSection('books')} 
                onAddQuiz={() => setActiveSection('quizzes')} 
                onAddResource={() => setActiveSection('resources')}
                stats={stats}
              />}
            {activeSection === 'courses'    && <CoursesPanel courses={courses} setCourses={setCourses} onDelete={confirmDelete} />}
            {activeSection === 'books'      && <BooksPanel books={books} setBooks={setBooks} onDelete={confirmDelete} />}
            {activeSection === 'resources'  && <ResourcesPanel resources={resources} setResources={setResources} onDelete={confirmDelete} />}
            {activeSection === 'workshops'  && <WorkshopsPanel workshops={workshops} setWorkshops={setWorkshops} onDelete={confirmDelete} />}
            {activeSection === 'users'      && <UsersPanel users={users} setUsers={setUsers} onDelete={confirmDelete} loggedInUser={user} />}
            {activeSection === 'analytics'  && <AnalyticsPanel stats={stats} />}
            {activeSection === 'quizzes'    && <AdminQuizzesPanel />}
            {activeSection === 'instructors'&& <AdminInstructorsPanel />}
            {activeSection === 'settings'   && <AdminSettingsPanel user={user} />}
            {!PANEL_MAP[activeSection] && (
              <div className="adm-panel"><p style={{color:'var(--text-soft)', padding:'2rem'}}>Panel '{activeSection}' — coming soon</p></div>
            )}
          </div>
        </div>
      </div>

      {statusModal.isOpen && (
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
          onCancel={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          confirmLabel="Yes, Proceed"
          onConfirm={statusModal.onConfirm}
        />
      )}
    </>
  );
};

export default AdminDashboard;
