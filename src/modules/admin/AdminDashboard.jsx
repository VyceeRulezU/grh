import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import mainLogo from '../../assets/images/Logo/Main logo.png';
import { BOOKS } from '../../data/legacyData';
import grhIcon from '../../assets/images/Logo/GRH-icon.png';
import Pagination from '../../components/ui/Pagination';
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
    title: '', category: 'Governance', instructor: '', level: 'Beginner', thumbnail: '',
    price: '', description: '',
    chapters: [{ title: 'Introduction', modules: [{ title: '', videoLink: 'https://youtu.be/svYm5KomARg', description: '' }] }],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const addChapter = () => setForm(f => ({ 
    ...f, 
    chapters: [...f.chapters, { title: '', modules: [{ title: '', videoLink: 'https://youtu.be/svYm5KomARg', description: '' }] }] 
  }));

  const removeChapter = (ci) => setForm(f => ({
    ...f,
    chapters: f.chapters.filter((_, idx) => idx !== ci)
  }));

  const updateChapter = (ci, title) => {
    const caps = [...form.chapters];
    caps[ci].title = title;
    setForm(f => ({ ...f, chapters: caps }));
  };

  const addModule = (ci) => {
    const caps = [...form.chapters];
    caps[ci].modules = [...caps[ci].modules, { title: '', videoLink: 'https://youtu.be/svYm5KomARg', description: '' }];
    setForm(f => ({ ...f, chapters: caps }));
  };

  const updateMod = (ci, mi, k, v) => {
    const caps = [...form.chapters];
    caps[ci].modules[mi] = { ...caps[ci].modules[mi], [k]: v };
    setForm(f => ({ ...f, chapters: caps }));
  };

  const removeMod = (ci, mi) => {
    const caps = [...form.chapters];
    caps[ci].modules = caps[ci].modules.filter((_, idx) => idx !== mi);
    setForm(f => ({ ...f, chapters: caps }));
  };

  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up" style={{ maxWidth: 850 }}>
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
              <label>Price</label>
              <input type="text" placeholder="e.g. Free or 5000" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group adm-flex-2">
              <label>Description</label>
              <textarea rows="2" placeholder="What learners will gain from this course..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="adm-form-group adm-flex-2">
              <label>Thumbnail / Cover Image URL (Optional)</label>
              <input placeholder="https://images.unsplash.com/..." value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>If empty, a random high-quality image will be chosen.</span>
            </div>
          </div>

          <div className="adm-chapters-section">
            <div className="adm-section-subtitle">
              <h4>Chapters & Modules</h4>
            </div>
            
            {form.chapters.map((chap, ci) => (
              <div key={ci} className="adm-chapter-box" style={{ background: 'var(--bg-weak)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--stroke-soft)' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                   <div className="adm-form-group" style={{ flex: 1 }}>
                     <label>Chapter Name</label>
                     <input placeholder="e.g. Introduction" value={chap.title} onChange={e => updateChapter(ci, e.target.value)} />
                   </div>
                   {form.chapters.length > 1 && (
                     <button className="adm-remove-btn" type="button" onClick={() => removeChapter(ci)} style={{ marginTop: '1.5rem' }}><i className="ri-delete-bin-line"></i></button>
                   )}
                </div>

                <div className="adm-chapter-modules" style={{ background: 'white', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Modules ({chap.modules.length})</h5>
                  </div>

                  {chap.modules.map((mod, mi) => (
                    <div key={mi} className="adm-module-item-nested" style={{ padding: '1rem', border: '1px solid var(--stroke-soft)', borderRadius: '8px', position: 'relative' }}>
                       {chap.modules.length > 1 && (
                         <button className="adm-remove-btn" type="button" style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => removeMod(ci, mi)}><i className="ri-close-line"></i></button>
                       )}
                       <div className="adm-form-row">
                         <div className="adm-form-group">
                           <label>Module Title</label>
                           <input placeholder="Module title" value={mod.title} onChange={e => updateMod(ci, mi, 'title', e.target.value)} />
                         </div>
                         <div className="adm-form-group">
                           <label>Video URL</label>
                           <input type="url" placeholder="YouTube/Vimeo URL" value={mod.videoLink} onChange={e => updateMod(ci, mi, 'videoLink', e.target.value)} />
                         </div>
                       </div>
                       <div className="adm-form-group" style={{ marginTop: '0.5rem' }}>
                         <label>Module Description (Optional)</label>
                         <textarea rows="2" placeholder="Module specific details..." value={mod.description} onChange={e => updateMod(ci, mi, 'description', e.target.value)} />
                       </div>
                    </div>
                  ))}

                  {chap.modules.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>No modules in this chapter yet.</p>
                  )}
                  
                  <button className="adm-add-btn" type="button" style={{ fontSize: '0.8rem', width: '100%', justifyContent: 'center', padding: '0.75rem' }} onClick={() => addModule(ci)}><i className="ri-add-line"></i> Add Module to {chap.title || 'this chapter'}</button>
                </div>
              </div>
            ))}
            
            <button className="adm-add-btn" type="button" style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderStyle: 'dashed', background: 'transparent' }} onClick={addChapter}>
              <i className="ri-add-line"></i> Add New Chapter
            </button>
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

function CoursesPanel({ courses, setCourses, onDelete, fetchData }) {
  const [modal, setModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const paginatedCourses = courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const editCourse = courses.find(c => c.id === modal);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const [loading, setLoading] = useState(false);
  const save = async (form) => {
    console.log("Saving course with form:", form);
    try {
      setLoading(true);
      const { chapters } = form;
      
      // Defensively handle price to satisfy both numeric and text column types
      // If it's an empty string or null, we use '0' which works for both.
      let finalPrice = form.price;
      if (finalPrice === '' || finalPrice === null || finalPrice === undefined) {
        finalPrice = '0';
      } else {
        finalPrice = String(finalPrice);
      }

      const coursePayload = {
        title: form.title,
        category: form.category,
        level: form.level,
        description: form.description,
        instructor: form.instructor,
        price: finalPrice,
        status: 'Published',
        thumbnail: form.thumbnail || `${COURSE_IMAGE_BANK[Math.floor(Math.random() * COURSE_IMAGE_BANK.length)]}?auto=format&fit=crop&w=600&q=80`,
        cover_image: form.thumbnail || null
      };

      console.log("Defensive Payload to Supabase:", coursePayload);

      let courseId;

      if (modal === 'add' || (typeof modal !== 'number' && typeof modal !== 'string')) {
        // Create Course
        const { data: newCourse, error } = await supabase
          .from('courses')
          .insert([coursePayload])
          .select()
          .single();
        
        if (error) {
          console.error("Supabase Course Insert Error:", error);
          if (error.message.includes('row-level security')) throw new Error("Permission Denied: You must be an Admin in the 'profiles' table to create courses.");
          throw error;
        }
        courseId = newCourse.id;
      } else {
        // Update Course
        courseId = modal;
        const { error } = await supabase
          .from('courses')
          .update(coursePayload)
          .eq('id', courseId);
        
        if (error) {
          console.error("Supabase Course Update Error:", error);
          if (error.message.includes('row-level security')) throw new Error("Permission Denied: You must be an Admin in the 'profiles' table to update courses.");
          throw error;
        }
      }

      // 2. Save Chapters & Modules
      // We force foreign keys to Numbers to be safe
      const targetCourseId = Number(courseId);

      if (chapters && chapters.length > 0) {
        // Clear existing for simplicity on edits
        if (modal !== 'add') {
           console.log("Clearing old chapters/modules for course:", targetCourseId);
           await supabase.from('chapters').delete().eq('course_id', targetCourseId);
        }

        // Insert Chapters one by one
        for (let i = 0; i < chapters.length; i++) {
          const chap = chapters[i];
          const { data: newChap, error: chapErr } = await supabase
            .from('chapters')
            .insert([{ 
              course_id: targetCourseId, 
              title: chap.title || 'Untitled Chapter', 
              sequence_order: i + 1 
            }])
            .select()
            .single();
          
          if (chapErr) {
            console.error("Chapter Insert Error:", chapErr);
            throw chapErr;
          }

          if (chap.modules && chap.modules.length > 0) {
            const modulesToInsert = chap.modules.map((m, mi) => ({
              course_id: targetCourseId,
              chapter_id: Number(newChap.id),
              title: m.title || 'Untitled Module',
              video_url: m.videoLink || '',
              description: m.description || '',
              sequence_order: mi + 1
            }));

            console.log(`Inserting ${modulesToInsert.length} modules for chapter ${newChap.id}`);
            const { error: modError } = await supabase.from('modules').insert(modulesToInsert);
            if (modError) {
              console.error("Module Insert Error:", modError);
              throw modError;
            }
          }
        }
      }

      showSuccess('Course Saved', 'The course and its content have been successfully saved!');
      setModal(null);
      if (typeof fetchData === 'function') {
        await fetchData();
      } else {
        console.warn('fetchData not provided to CoursesPanel, reloading...');
        window.location.reload();
      }
    } catch (err) {
      console.error("Final Save Operation Error:", err);
      showError('Save Error', err.message || "An unexpected error occurred while saving.");
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
            {paginatedCourses.map(c => (
              <tr key={c.id}>
                <td className="adm-course-title-cell">{c.title}</td>
                <td><span className="adm-cat-badge">{c.category}</span></td>
                <td>{c.level}</td>
                <td>{c.learners || 0}</td>
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
                        if (typeof fetchData === 'function') await fetchData();
                        else window.location.reload();
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

      <div className="adm-pagination-bar">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
          itemsPerPage={itemsPerPage}
        />
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

function ResourcesPanel({ resources, setResources, onDelete, fetchData }) {
  const [modal, setModal] = useState(null);
  const editItem = resources.find(r => r.id === modal);
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const save = async (form) => {
    try {
      setLoading(true);
      const payload = {
        title: form.title,
        type: form.type,
        category: form.category,
        description: form.description,
        file_url: form.file_url || form.fileUrl || '',
        status: form.status || 'Published'
      };

      if (modal && modal !== 'add') {
        const { error } = await supabase.from('library_resources').update(payload).eq('id', modal);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('library_resources').insert([payload]);
        if (error) throw error;
      }
      showSuccess('Resource Saved', 'Resource saved successfully!');
      setModal(null);
      if (typeof fetchData === 'function') {
        await fetchData();
      }
    } catch (err) {
      console.error("Save Resource Error:", err);
      showError('Save Error', 'Error saving resource: ' + err.message);
    } finally {
      setLoading(false);
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

function UsersPanel({ users, setUsers, onDelete, loggedInUser, fetchData }) {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined'];
    const rows = users.map(u => [
      `"${(u.name || u.full_name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(u.status || 'Active').replace(/"/g, '""')}"`,
      `"${(u.joined || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grh-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async (nu) => {
    setLoading(true);
    try {
      if (typeof modal === 'object' && modal.id) {
        // Real update for existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            name: nu.name,
            role: nu.role,
            status: nu.status
          })
          .eq('id', modal.id);
        
        if (error) throw error;
        
        showSuccess('User Updated', 'User profile updated successfully.');
        setUsers(us => us.map(x => x.id === modal.id ? { ...x, ...nu } : x));
        setModal(null);
      } else {
        // Invite new user via Edge Function
        // Using built-in invoke() is safer as it handles headers/auth automatically
        const { data: result, error: invError } = await supabase.functions.invoke('invite-user', {
          body: {
            email: nu.email,
            name: nu.name,
            role: nu.role
          },
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        });
        
        if (invError) {
          console.error("Invitation error details:", invError);
          // Provide a more helpful message based on common errors
          let errMsg = invError.message || 'Failed to invite user';
          if (errMsg.includes('already') || errMsg.includes('exists')) {
            errMsg = `A user with email "${nu.email}" already exists.`;
          } else if (errMsg.includes('non-2xx') || errMsg.includes('401') || errMsg.includes('403')) {
            errMsg = 'Permission denied. Only admins can invite users. Check your role in the database.';
          }
          throw new Error(errMsg);
        }

        showSuccess('Invitation Sent', 'User invited successfully!');
        if (typeof fetchData === 'function') {
          await fetchData();
        } else {
          setUsers(us => [{ ...nu, courses: 0, joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }, ...us]);
        }
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
        <div style={{display:'flex', gap:'0.75rem'}}>
          <button className="btn-outline" title="Export CSV" onClick={handleExportCSV}>
            <i className="ri-download-2-line"></i> Export CSV
          </button>
          <button className="special-button" onClick={() => setModal('add')} disabled={loading}><i className="ri-user-add-line"></i> {loading ? 'Inviting...' : 'Invite User'}</button>
        </div>
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
      if (onRefreshUser) onRefreshUser();
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
function BooksPanel({ books, setBooks, onDelete, fetchData }) {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const editItem = books.find(b => b.id === modal);
  const DEFAULT_BOOK_IMG = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const save = async (data) => {
    try {
      setLoading(true);
      const formatBook = (b) => ({
        title: b.title,
        summary: b.summary,
        image_url: b.image_url || b.imageUrl || '',
        file_url: b.file_url || b.fileUrl || '',
        status: b.status || 'Published'
      });

      if (modal && modal !== 'add') {
        const { error } = await supabase.from('books').update(formatBook(data)).eq('id', modal);
        if (error) throw error;
      } else {
        const payload = Array.isArray(data) ? data.map(formatBook) : [formatBook(data)];
        const { error } = await supabase.from('books').insert(payload);
        if (error) throw error;
      }
      showSuccess('Books Saved', 'Books saved successfully!');
      setModal(null);
      if (typeof fetchData === 'function') {
        await fetchData();
      }
    } catch (err) {
      console.error("Save Books Error:", err);
      showError('Save Error', 'Error saving books: ' + err.message);
    } finally {
      setLoading(false);
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
function WorkshopsPanel({ workshops, setWorkshops, onDelete, fetchData }) {
  const [modal, setModal] = useState(null); // null | 'add' | number (id)
  const [attendeeModal, setAttendeeModal] = useState(null); // null | workshop object
  const editItem = workshops.find(w => w.id === modal);
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const save = async (data) => {
    try {
       setLoading(true);
       const { registrations, ...wData } = data;
       
       // Map to snake_case if UI uses camelCase (though WorkshopModal seems to use snake_case or neutral names)
       const payload = {
         title: wData.title,
         date: wData.date,
         time: wData.time,
         host: wData.host,
         format: wData.format,
         status: wData.status || 'Upcoming'
       };

       if (modal && modal !== 'add') {
         const { error } = await supabase.from('workshops').update(payload).eq('id', modal);
         if (error) throw error;
       } else {
         const { error } = await supabase.from('workshops').insert([payload]);
         if (error) throw error;
       }
       showSuccess('Workshop Saved', 'Workshop saved successfully!');
       setModal(null);
       if (typeof fetchData === 'function') {
         await fetchData();
       }
    } catch (err) {
      console.error("Save Workshop Error:", err);
      showError('Save Error', 'Error saving workshop: ' + err.message);
    } finally {
      setLoading(false);
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

const AdminDashboard = ({ onNavigate, onLogout, user, onRefreshUser }) => {
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

  // Diagnostic: Check if current user is actually an admin in the profiles table
  useEffect(() => {
    if (!user?.id) return;
    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (data && data.role?.toLowerCase() !== 'admin') {
        console.warn("DIAGNOSTIC: User is NOT an Admin in profiles table. Role found:", data.role);
        // Only show error if they are on a page that requires admin
        showError("Access Restriction", `Your account role is '${data.role}'. Admin privileges are required to save changes. Please contact the system owner to elevate your role.`);
      }
    };
    checkAdmin();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch data with individual error handling to prevent total crash if one schema is missing
      let [crs, res, bks, usr, wks, progress] = await Promise.all([
        supabase.from('courses').select('*, chapters(*, modules(*))').order('created_at', { ascending: false }).then(r => r, e => ({ error: e })),
        supabase.from('library_resources').select('*').order('created_at', { ascending: false }).then(r => r, e => ({ error: e })),
        supabase.from('books').select('*').order('created_at', { ascending: false }).then(r => r, e => ({ error: e })),
        supabase.from('profiles').select('*').then(r => r, e => ({ error: e })),
        supabase.from('workshops').select('*, workshop_registrations(*)').order('created_at', { ascending: false }).then(r => r, e => ({ error: e })),
        supabase.from('user_progress')
          .select('*, profiles(name), courses(title)')
          .eq('completed', true)
          .order('last_accessed', { ascending: false })
          .limit(5).then(r => r, e => ({ error: e }))
      ]);

      // ULTRA-RESILIENT FALLBACK: If join query failed (likely due to missing chapters table), try simple select
      if (crs.error || !crs.data) {
        console.warn("Complex course fetch failed, trying simple fetch fallback...");
        const fallback = await supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (!fallback.error) {
           crs = fallback;
        }
      }

      if (crs.error) console.error("Courses Fetch Error:", crs.error);
      if (res.error) console.error("Resources Fetch Error:", res.error);
      if (bks.error) console.error("Books Fetch Error:", bks.error);
      if (usr.error) console.error("Users Fetch Error:", usr.error);
      if (wks.error) console.error("Workshops Fetch Error:", wks.error);
      if (progress.error) console.error("Progress Fetch Error:", progress.error);

      if (crs.data) {
        const mappedCourses = crs.data.map(c => ({
          ...c,
          chapters: (c.chapters || []).sort((a,b) => a.sequence_order - b.sequence_order).map(ch => ({
            ...ch,
            modules: (ch.modules || []).sort((a,b) => a.sequence_order - b.sequence_order).map(m => ({
              ...m,
              videoLink: m.video_url
            }))
          }))
        }));
        setCourses(mappedCourses);
      }
      if (res.data) setResources(res.data.map(r => ({ ...r, fileUrl: r.file_url })));
      if (bks.data) setBooks(bks.data.map(b => ({ ...b, fileUrl: b.file_url, imageUrl: b.image_url })));
      if (usr.data) setUsers(usr.data.map(u => ({ 
        ...u, 
        email: u.email || 'No email', 
        courses: 0, 
        joined: u.joined_at ? new Date(u.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2025', 
        status: u.status || 'Active' 
      })));
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
          if (type === 'user') table = 'profiles';

          if (table) {
            const { error } = await supabase.from(table).delete().eq('id', item.id);
            if (error) throw error;
          }

          setStatusModal(prev => ({ ...prev, isOpen: false }));
          // Use a small delay or ensure we don't overlap modals
          setTimeout(() => {
            setStatusModal({ 
              isOpen: true, 
              type: 'success', 
              title: 'Deleted', 
              message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`, 
              onConfirm: () => { 
                setStatusModal(p => ({ ...p, isOpen: false })); 
                fetchData(); 
              } 
            });
          }, 100);
        } catch (err) {
          setStatusModal({ 
            isOpen: true, 
            type: 'error', 
            title: 'Delete Failed', 
            message: 'Delete failed: ' + err.message, 
            onConfirm: () => setStatusModal(p => ({ ...p, isOpen: false })) 
          });
        }
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
            <button className="adm-nav-link" onClick={() => onNavigate('welcome')}><i className="ri-arrow-left-line"></i> Exit Portal</button>
            <button className="adm-nav-link" onClick={confirmLogout}><i className="ri-logout-box-line"></i> Logout Admin</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="adm-main">
          <header className="adm-topbar">
            <div className="adm-topbar-title">
              <h2>{localNavGroups.flatMap(g => g.links).find(l => l.id === activeSection)?.label || 'Admin Panel'}</h2>
              <span>GRH Administrator Management</span>
            </div>
            <div className="adm-topbar-actions">
              <button className="adm-topbar-btn"><i className="ri-notification-fill"></i></button>
              <div className="adm-admin-badge" onClick={() => setActiveSection('settings')} style={{ cursor: 'pointer' }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Admin" className="adm-admin-avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="adm-admin-avatar">{user?.name ? user.name[0].toUpperCase() : 'A'}</div>
                )}
                <span>Administrator</span>
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
            {activeSection === 'courses'    && <CoursesPanel courses={courses} setCourses={setCourses} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'books'      && <BooksPanel books={books} setBooks={setBooks} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'resources'  && <ResourcesPanel resources={resources} setResources={setResources} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'workshops'  && <WorkshopsPanel workshops={workshops} setWorkshops={setWorkshops} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'users'      && <UsersPanel users={users} setUsers={setUsers} onDelete={confirmDelete} loggedInUser={user} fetchData={fetchData} />}
            {activeSection === 'analytics'  && <AnalyticsPanel stats={stats} />}
            {activeSection === 'quizzes'    && <AdminQuizzesPanel />}
            {activeSection === 'instructors'&& <AdminInstructorsPanel />}
            {activeSection === 'settings'   && <AdminSettingsPanel user={user} onRefreshUser={onRefreshUser} />}
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
