import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, LabelList } from 'recharts';
import mainLogo from '../../assets/images/Logo/Main logo.png';
import { BOOKS } from '../../data/legacyData';
import grhIcon from '../../assets/images/Logo/GRH-icon.png';
import Pagination from '../../shared/ui/Pagination';
import ModernDropdown from '../../shared/ui/ModernDropdown';
import StatusModal from '../../shared/ui/StatusModal';
import { useModal } from '../../shared/hooks/useModal';
import ResourceViewer from '../research/components/ResourceViewer';
import InstructorCard from '../../shared/ui/InstructorCard';
import { Helmet } from 'react-helmet-async';
import SpecialButton from '../../shared/ui/SpecialButton';
import './AdminDashboard.css';

/* =====================================================================
   MOCK DATA — GRH specific
===================================================================== */


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
function UserModal({ onClose, onSave, initial, loading }) {
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
            <input placeholder="e.g. John Doe" value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" />
          </div>
          <div className="adm-form-group">
            <label>Email Address*</label>
            <input type="email" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
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
          <button className="btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="special-button" onClick={() => onSave(form)} disabled={loading || !form.name || !form.email}>
            {loading ? <><i className="ri-loader-4-line ri-spin"></i> Processing...</> : (initial ? 'Save Changes' : 'Send Invitation')}
          </button>
        </footer>
      </div>
    </div>
  );
}

function CourseModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {
    title: '', category: 'Governance', instructors: [], level: 'Beginner', thumbnail: '',
    price: '', description: '',
    chapters: [{ title: 'Introduction', modules: [{ title: '', videoLink: '', description: '' }] }],
  });

  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [instructorOptions, setInstructorOptions] = useState([]);

  useEffect(() => {
    import('../../services/supabase/supabaseClient').then(({ supabase }) => {
      supabase.from('instructors').select('name').then(({ data }) => {
        if (data && data.length > 0) {
          setInstructorOptions(data.map(i => i.name));
        }
      });
    });
  }, []);

  useEffect(() => {
    if (initial?.id) {
      setLoading(true);
      import('../../services/supabase/supabaseClient').then(({ supabase }) => {
        supabase.from('course_modules').select('*').eq('course_id', initial.id).order('sort_order', { ascending: true })
          .then(({ data }) => {
            if (data && data.length > 0) {
              const chaptersMap = new Map();
              data.forEach(m => {
                const chapTitle = m.chapter_title || 'Introduction';
                if (!chaptersMap.has(chapTitle)) {
                  chaptersMap.set(chapTitle, { title: chapTitle, modules: [] });
                }
                chaptersMap.get(chapTitle).modules.push({ title: m.title, videoLink: m.video_url || '', description: m.description || '' });
              });
              setForm(f => ({
                ...f,
                chapters: Array.from(chaptersMap.values())
              }));
            } else {
              setForm(f => ({ ...f, chapters: [{ title: 'Introduction', modules: [{ title: '', videoLink: '', description: '' }] }] }));
            }
            setLoading(false);
          });
      });
    } else if (initial && !initial.chapters) {
      setForm(f => ({ ...f, chapters: [{ title: 'Introduction', modules: [{ title: '', videoLink: '', description: '' }] }] }));
    }
  }, [initial]);

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
              <label>Instructor*</label>
              <ModernDropdown 
                multiple
                options={instructorOptions.length > 0 ? instructorOptions : ['No instructors available']} 
                value={form.instructors} 
                onChange={v => set('instructors', v)} 
              />
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
              <label>Course Cover Image</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  placeholder="URL: https://images.unsplash.com/..." 
                  value={form.thumbnail} 
                  onChange={e => set('thumbnail', e.target.value)} 
                  style={{ flex: 1 }}
                />
                <label className="btn-outline btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <i className="ri-upload-2-line"></i> Upload Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert("Image file size must be less than 2MB.");
                          return;
                        }
                        setCoverFile(file);
                        set('thumbnail', URL.createObjectURL(file));
                      }
                    }} 
                  />
                </label>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>
                {coverFile ? `New file selected: ${coverFile.name}` : "Upload a file or paste a URL. If empty, a random image is chosen."}
              </span>
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
            
            <button className="chpt-adm-add-btn" type="button" style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderStyle: 'dashed', backgroundColor: 'transparent' }} onClick={addChapter}>
              <i className="ri-add-line"></i> Add New Chapter
            </button>
          </div>
        </div>
        <footer className="adm-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="special-button" onClick={() => { onSave({ ...form, coverFile }); onClose(); }}>
            {initial ? 'Save Changes' : 'Publish Course'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function ResourceModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { 
    title: '', 
    type: 'PERL', 
    category: 'Governance', 
    description: '', 
    fileUrl: '',
    author: '',
    published_year: new Date().getFullYear(),
    programme: 'PERL',
    thematic_area: 'Public Financial Management',
    location: 'Federal'
  });
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
          
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Author / Organization</label>
              <input placeholder="e.g. FCDO, PERL" value={form.author} onChange={e => set('author', e.target.value)} />
            </div>
            <div className="adm-form-group">
              <label>Publication Year</label>
              <input type="number" value={form.published_year} onChange={e => set('published_year', e.target.value)} />
            </div>
          </div>

          <div className="adm-form-row">
            <div className="adm-form-group">
              <label>Programme</label>
              <ModernDropdown 
                options={['PERL','SPARC','SLGP','General']} 
                value={form.programme} 
                onChange={v => set('programme', v)} 
              />
            </div>
            <div className="adm-form-group">
              <label>Thematic Area</label>
              <ModernDropdown 
                options={['Public Financial Management','Public Service Management','Policy & Strategy','Monitoring, Evaluation & Learning','Knowledge Management']} 
                value={form.thematic_area} 
                onChange={v => set('thematic_area', v)} 
              />
            </div>
            <div className="adm-form-group">
              <label>Location</label>
              <ModernDropdown 
                options={['Federal','Kano','Kaduna','Jigawa','General']} 
                value={form.location} 
                onChange={v => set('location', v)} 
              />
            </div>
          </div>
          <div className="adm-form-group">
            <label>Document URL</label>
            <input type="url" placeholder="e.g. https://pub-r2.dev/resource.pdf" value={form.fileUrl || ''} onChange={e => set('fileUrl', e.target.value)} />
          </div>
        </div>
        <footer className="adm-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="special-button" onClick={() => { onSave({ ...form, fileItem: file }); onClose(); }}>{initial ? 'Save Changes' : 'Save Resource'}</button>
        </footer>
      </div>
    </div>
  );
}

/* ----- BOOK MODAL ----- */
const DEFAULT_BOOK_IMG = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

function BookModal({ onClose, onSave, initial }) {
  const [books, setBooks] = useState(initial ? [initial] : [{ 
    title: '', 
    summary: '', 
    imagePreview: '', 
    imageFile: null, 
    fileUrl: '',
    author: '',
    published_year: new Date().getFullYear(),
    programme: 'PERL',
    thematic_area: 'Public Financial Management',
    location: 'Federal'
  }]);

  const updateBook = (i, key, value) => {
    const updated = [...books];
    updated[i] = { ...updated[i], [key]: value };
    setBooks(updated);
  };

  const handleImageChange = (i, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file size must be less than 2MB.");
        return;
      }
      updateBook(i, 'imageFile', file);
      updateBook(i, 'imagePreview', URL.createObjectURL(file));
    }
  };

  const addAnother = () => setBooks(b => [...b, { 
    title: '', 
    summary: '', 
    imagePreview: '', 
    imageFile: null, 
    fileUrl: '',
    author: '',
    published_year: new Date().getFullYear(),
    programme: 'PERL',
    thematic_area: 'Public Financial Management',
    location: 'Federal'
  }]);
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

              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Author</label>
                  <input placeholder="Author name" value={book.author} onChange={e => updateBook(i, 'author', e.target.value)} />
                </div>
                <div className="adm-form-group">
                  <label>Year</label>
                  <input type="number" value={book.published_year} onChange={e => updateBook(i, 'published_year', e.target.value)} />
                </div>
              </div>

              <div className="adm-form-row" style={{ marginTop: '0.5rem' }}>
                <div className="adm-form-group">
                  <label>Programme</label>
                  <ModernDropdown 
                    options={['PERL','SPARC','SLGP','General']} 
                    value={book.programme} 
                    onChange={v => updateBook(i, 'programme', v)} 
                  />
                </div>
                <div className="adm-form-group">
                  <label>Thematic Area</label>
                  <ModernDropdown 
                    options={['Public Financial Management','Public Service Management','Policy & Strategy','M&E','Knowledge Management']} 
                    value={book.thematic_area} 
                    onChange={v => updateBook(i, 'thematic_area', v)} 
                  />
                </div>
                <div className="adm-form-group">
                  <label>Location</label>
                  <ModernDropdown 
                    options={['Federal','Kano','Kaduna','Jigawa','General']} 
                    value={book.location} 
                    onChange={v => updateBook(i, 'location', v)} 
                  />
                </div>
              </div>

              <div className="adm-form-group" style={{ marginTop: '0.5rem' }}>
                <label>Document URL</label>
                <input type="url" placeholder="e.g. https://pub-r2.dev/book.pdf" value={book.fileUrl || ''} onChange={(e) => updateBook(i, 'fileUrl', e.target.value)} />
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
              fileUrl: b.fileUrl || '#',
              imageFile: b.imageFile,
              status: b.status || 'Draft',
              author: b.author,
              published_year: b.published_year,
              programme: b.programme,
              thematic_area: b.thematic_area,
              location: b.location
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

const ACTIVITY_TYPE_FILTER_MAP = {
  Signup: 'signup',
  Enrollment: 'enrollment',
  Module: 'module',
  Course: 'course',
  Workshop: 'workshop',
};

const getActivityTimestamp = (act) => act.updated_at || act.created_at || act.last_accessed;

/** Resolve display name from profile row (name, full_name, email, etc.) */
const resolveUserDisplayName = (profile, fallback = 'Learner') => {
  if (!profile) return fallback;
  const fromEmail =
    typeof profile.email === 'string' && profile.email.includes('@')
      ? profile.email.split('@')[0].replace(/[._-]+/g, ' ').trim()
      : '';
  const candidate = (
    profile.name ||
    profile.full_name ||
    profile.display_name ||
    fromEmail
  ).trim();
  return candidate || fallback;
};

const enrichProfileForActivity = (profile, extras = {}) => {
  const merged = { ...(profile || {}), ...extras };
  return { ...merged, name: resolveUserDisplayName(merged, 'Learner') };
};

const getActivityEventLabel = (act) => {
  switch (act.type) {
    case 'signup': return 'Signed up';
    case 'enrollment': return 'Enrolled in course';
    case 'module': return 'Completed module';
    case 'course': return 'Completed course';
    case 'workshop': return 'Registered for workshop';
    default: return 'Activity';
  }
};

const getActivityCourseCell = (act) => {
  if (act.type === 'signup' || act.type === 'workshop') return '—';
  return act.courses?.title || '—';
};

const getActivityModuleCell = (act) => {
  if (act.type === 'module') return act.modules?.title || 'Lesson';
  return '—';
};

const getActivityWorkshopCell = (act) => {
  if (act.type === 'workshop') return act.workshops?.title || 'Workshop';
  return '—';
};

const getActivityStatusLabel = (act) => {
  if (act.statusLabel) return act.statusLabel;
  if (act.type === 'signup') return 'New';
  if (act.type === 'enrollment') return 'Enrolled';
  if (act.type === 'workshop') return 'Registered';
  return 'Completed';
};

const getActivityStatusBadgeClass = (act) => {
  const label = getActivityStatusLabel(act);
  if (label === 'New') return 'draft';
  if (label === 'Enrolled' || label === 'Registered') return 'published';
  return 'published';
};

const formatActivityTime = (act) => {
  const date = new Date(getActivityTimestamp(act));
  if (Number.isNaN(date.getTime())) return '—';
  const now = new Date();
  const diffHrs = Math.floor((now - date) / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs} hrs ago`;
  if (diffHrs < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

function OverviewPanel({ onAddCourse, onAddBook, onAddQuiz, onAddResource, stats, recentActivitiesPage, setRecentActivitiesPage, itemsPerRecentPage }) {
  const [selectedActivities, setSelectedActivities] = useState(new Set());
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilterStatus, setActivityFilterStatus] = useState('All');
  const [activityFilterType, setActivityFilterType] = useState('All');
  const [activeActivity, setActiveActivity] = useState(null);

  const filteredActivities = stats.recentActivities.filter(act => {
    const q = activitySearch.toLowerCase().trim();
    const userName = resolveUserDisplayName(act.profiles, '').toLowerCase();
    const courseName = (act.courses?.title || '').toLowerCase();
    const moduleName = (act.modules?.title || '').toLowerCase();
    const workshopName = (act.workshops?.title || '').toLowerCase();
    const matchesSearch = !q || [userName, courseName, moduleName, workshopName, getActivityEventLabel(act).toLowerCase()].some(s => s.includes(q));

    const matchesStatus = activityFilterStatus === 'All' || getActivityStatusLabel(act) === activityFilterStatus;
    const typeKey = ACTIVITY_TYPE_FILTER_MAP[activityFilterType];
    const matchesType = activityFilterType === 'All' || act.type === typeKey;

    return matchesSearch && matchesStatus && matchesType;
  });

  const currentActivities = filteredActivities.slice((recentActivitiesPage - 1) * itemsPerRecentPage, recentActivitiesPage * itemsPerRecentPage);
  const allSelected = currentActivities.length > 0 && selectedActivities.size === currentActivities.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedActivities(new Set());
    } else {
      setSelectedActivities(new Set(currentActivities.map((_, i) => i)));
    }
  };

  const handleSelectActivity = (index) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedActivities(newSelected);
  };

  const handleExportActivityCSV = () => {
    const headers = ['Event', 'User', 'Course', 'Module', 'Workshop', 'Time', 'Status'];
    const rows = filteredActivities.map(act => [
      `"${getActivityEventLabel(act)}"`,
      `"${resolveUserDisplayName(act.profiles)}"`,
      `"${getActivityCourseCell(act)}"`,
      `"${getActivityModuleCell(act)}"`,
      `"${getActivityWorkshopCell(act)}"`,
      `"${new Date(getActivityTimestamp(act)).toLocaleString()}"`,
      `"${getActivityStatusLabel(act)}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grh-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cd = stats?.chartData || [];
  const calcCardDelta = (key) => {
    const vals = cd.map(m => m[key] || 0);
    if (vals.length < 6) return { delta: '0%', isPositive: true };
    const recent = vals.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const prev = vals.slice(0, -3).reduce((a, b) => a + b, 0) / 3;
    if (prev === 0) return { delta: '+100%', isPositive: true };
    const pct = Math.round(((recent - prev) / prev) * 100);
    return { delta: `${pct >= 0 ? '+' : ''}${pct}%`, isPositive: pct >= 0 };
  };
  const cardSparkData = (key) => {
    const vals = cd.map(m => m[key] || 0);
    const max = Math.max(...vals, 1);
    return vals.map(v => Math.round((v / max) * 80));
  };
  const statCards = [
    { label: 'Total Learners',       value: stats.learners,  key: 'newLearners' },
    { label: 'Active Courses',       value: stats.courses,   key: 'courses' },
    { label: 'Certifications Issued',value: stats.certs,     key: 'certs' },
    { label: 'Library Resources',    value: stats.resources, key: 'resources' },
  ].map(s => {
    const d = calcCardDelta(s.key);
    const spark = cardSparkData(s.key);
    return { ...s, delta: d.delta, isPositive: d.isPositive, spark };
  });

  return (
    <div className="adm-dashboard">
      <Helmet>
        <title>Admin Shield | Global Analytics Portal | GRH</title>
        <meta name="description" content="Access platform-wide governance analytics, manage institutional data, and monitor system performance on the GRH Admin Shield." />
      </Helmet>
      {/* Quick Actions */}
      <div className="adm-quick-actions">
        <h4>Quick Actions</h4>
        <div className="adm-action-row">
          
          <button className="btn-outline" onClick={onAddBook} title="Add a new book to the library">
            <i className="ri-book-3-fill"></i><span>Add Book</span>
          </button>

          <button className="btn-outline" onClick={onAddResource} title="Upload a document or research paper">
            <i className="ri-upload-cloud-fill"></i><span>Upload Resource</span>
          </button>

          <button className="btn-outline" onClick={onAddQuiz} title="Create a new assessment for a course">
            <i className="ri-file-list-3-fill"></i><span>Create Quiz</span>
          </button>

          <button className="special-button" onClick={onAddCourse} title="Launch a new learning course">
            <i className="ri-add-circle-fill"></i><span>Add Course</span>
          </button>

        </div>
      </div>

      {/* Stats Grid */}
      <div className="adm-stats-grid">
        {statCards.map((s, i) => (
          <div className="adm-stat-card-v2 animate-up" style={{ animationDelay: `${i * 0.1}s` }} key={s.label}>
            <div className="adm-stat-card-v2-header">
              <span className="adm-stat-card-v2-label">{s.label}</span>
              <span className={`adm-stat-card-v2-delta ${s.isPositive ? 'positive' : 'negative'}`}>
                {s.delta} {s.isPositive ? 'this month' : 'last month'}
              </span>
            </div>
            <h3 className="adm-stat-card-v2-value">{s.value.toLocaleString()}</h3>
            <div className="adm-stat-card-v2-chart">
              {s.spark.map((val, idx) => (
                <div 
                  key={idx} 
                  className={`adm-stat-card-v2-bar ${s.isPositive ? 'positive' : 'negative'} ${idx === s.spark.length - 1 ? 'current' : ''}`}
                  style={{ height: `${Math.max(val, 2)}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="adm-charts-grid">
        <div className="adm-chart-card">
          <h4>Learner Growth</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.chartData || []}>
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
            <BarChart data={stats?.chartData || []}>
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
      <div className="adm-panel-header" style={{ marginBottom: '1rem' }}>
        <div className="adm-header-title">
          <h3>Recent Activity <span className="adm-count">{filteredActivities.length} Found</span></h3>
        </div>
        <div className="adm-recent-filters-row">
          <div className="adm-search-wrap">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              className="adm-search-input" 
              placeholder="Search user or event..." 
              value={activitySearch}
              onChange={(e) => { setActivitySearch(e.target.value); setRecentActivitiesPage(1); }}
            />
          </div>
          <div className="adm-recent-activity-filter">
            <ModernDropdown 
              options={['All', 'Signup', 'Enrollment', 'Module', 'Course', 'Workshop']} 
              value={activityFilterType} 
              onChange={v => { setActivityFilterType(v); setRecentActivitiesPage(1); }} 
            />
          </div>
          <div className="adm-recent-activity-filter">
            <ModernDropdown 
              options={['All', 'New', 'Enrolled', 'Completed', 'Registered']} 
              value={activityFilterStatus} 
              onChange={v => { setActivityFilterStatus(v); setRecentActivitiesPage(1); }} 
            />
          </div>
          <button className="btn-outline btn-sm" onClick={handleExportActivityCSV} title="Export current results to CSV">
            <i className="ri-download-2-line"></i> Export
          </button>
        </div>
      </div>

      <div className="adm-activity-wrap" role="table" aria-label="Recent student activity">
        <div className="adm-activity-head" role="row">
          <div className="adm-activity-cell adm-activity-cell--check" role="columnheader">
            <label className="adm-checkbox">
              <input type="checkbox" className="adm-custom-checkbox" checked={allSelected} onChange={handleSelectAll} aria-label="Select all activities" />
            </label>
          </div>
          <div className="adm-activity-cell adm-activity-cell--event" role="columnheader">Event</div>
          <div className="adm-activity-cell adm-activity-cell--user" role="columnheader">User</div>
          <div className="adm-activity-cell adm-activity-cell--wide" role="columnheader">Course</div>
          <div className="adm-activity-cell adm-activity-cell--wide" role="columnheader">Module</div>
          <div className="adm-activity-cell adm-activity-cell--wide" role="columnheader">Workshop</div>
          <div className="adm-activity-cell adm-activity-cell--time" role="columnheader">Time</div>
          <div className="adm-activity-cell adm-activity-cell--status" role="columnheader">Status</div>
          <div className="adm-activity-cell adm-activity-cell--action" role="columnheader">Action</div>
        </div>

        {currentActivities.length > 0 ? currentActivities.map((act, index) => {
          const userName = resolveUserDisplayName(act.profiles, 'Anonymous');
          const statusLabel = getActivityStatusLabel(act);
          const eventLabel = getActivityEventLabel(act);
          const courseLabel = getActivityCourseCell(act);
          const moduleLabel = getActivityModuleCell(act);
          const workshopLabel = getActivityWorkshopCell(act);

          return (
            <div
              key={act.id || index}
              className={`adm-activity-row${selectedActivities.has(index) ? ' is-selected' : ''}`}
              role="row"
            >
              <div className="adm-activity-cell adm-activity-cell--check" data-label="Select" role="cell">
                <label className="adm-checkbox">
                  <input
                    type="checkbox"
                    className="adm-custom-checkbox"
                    checked={selectedActivities.has(index)}
                    onChange={() => handleSelectActivity(index)}
                    aria-label={`Select activity for ${userName}`}
                  />
                </label>
              </div>
              <div className="adm-activity-cell adm-activity-cell--event premium-focus" data-label="Event" role="cell">
                <span className="adm-activity-text-nowrap" title={eventLabel}>{eventLabel}</span>
              </div>
              <div className="adm-activity-cell adm-activity-cell--user premium-focus" data-label="User" role="cell">
                <span className="adm-activity-text-nowrap" title={userName}>{userName}</span>
              </div>
              <div className="adm-activity-cell adm-activity-cell--wide" data-label="Course" role="cell">
                <span className="adm-activity-text-clamp" title={courseLabel}>{courseLabel}</span>
              </div>
              <div className="adm-activity-cell adm-activity-cell--wide" data-label="Module" role="cell">
                <span className="adm-activity-text-clamp" title={moduleLabel}>{moduleLabel}</span>
              </div>
              <div className="adm-activity-cell adm-activity-cell--wide" data-label="Workshop" role="cell">
                <span className="adm-activity-text-clamp" title={workshopLabel}>{workshopLabel}</span>
              </div>
              <div className="adm-activity-cell adm-activity-cell--time" data-label="Time" role="cell">
                <span className="adm-activity-text-nowrap">{formatActivityTime(act)}</span>
              </div>
              <div className="adm-activity-cell adm-activity-cell--status" data-label="Status" role="cell">
                <span className={`adm-status-badge ${getActivityStatusBadgeClass(act)}`}>{statusLabel}</span>
              </div>
              <div className="adm-activity-cell adm-activity-cell--action" data-label="Action" role="cell">
                <button type="button" className="adm-table-action-link" onClick={() => setActiveActivity(act)}>
                  View
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="adm-activity-empty" role="row">
            <i className="ri-search-2-line" aria-hidden="true"></i>
            <p>No activity matches your current filters.</p>
          </div>
        )}
      </div>

      {filteredActivities.length > itemsPerRecentPage && (
        <div style={{ marginTop: '1.5rem' }}>
          <Pagination 
            currentPage={recentActivitiesPage}
            totalPages={Math.ceil(filteredActivities.length / itemsPerRecentPage)}
            onPageChange={setRecentActivitiesPage}
            itemsPerPage={itemsPerRecentPage}
          />
        </div>
      )}

      {/* Activity Detail Modal */}
      {activeActivity && (
        <div className="adm-modal-overlay">
          <div className="adm-modal animate-up" style={{ maxWidth: 450 }}>
            <header className="adm-modal-header">
              <h3>Activity Details</h3>
              <button className="adm-close-btn" onClick={() => setActiveActivity(null)}><i className="ri-close-line"></i></button>
            </header>
            <div className="adm-modal-body" style={{ gap: '1.5rem' }}>
              <div className="activity-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>User</label>
                  <p style={{ fontWeight: 600 }}>{resolveUserDisplayName(activeActivity.profiles, 'Anonymous')}</p>
                  {activeActivity.profiles?.email && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.25rem' }}>{activeActivity.profiles.email}</p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>Event Type</label>
                  <p style={{ fontWeight: 600 }}>{getActivityEventLabel(activeActivity)}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>Course</label>
                  <p style={{ fontWeight: 600 }}>{getActivityCourseCell(activeActivity)}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>Module</label>
                  <p style={{ fontWeight: 600 }}>{getActivityModuleCell(activeActivity)}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>Workshop</label>
                  <p style={{ fontWeight: 600 }}>{getActivityWorkshopCell(activeActivity)}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>Timestamp</label>
                  <p style={{ fontWeight: 500 }}>{new Date(getActivityTimestamp(activeActivity)).toLocaleString()}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase' }}>Status</label>
                  <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{getActivityStatusLabel(activeActivity)}</p>
                </div>
              </div>
            </div>
            <footer className="adm-modal-footer">
              <button className="special-button" onClick={() => setActiveActivity(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesPanel({ courses, setCourses, onDelete, fetchData }) {
  const [modal, setModal] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'list' ? 10 : 12;

  const filteredCourses = courses.filter(c => {
    const instStr = (() => { try { const p = JSON.parse(c.instructor); return Array.isArray(p) ? p.join(' ') : c.instructor; } catch { return c.instructor || ''; } })();
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || instStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const editCourse = courses.find(c => c.id === modal);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError, showConfirm } = useModal();

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedCourses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedCourses.map(c => c.id)));
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    showConfirm('Bulk Delete', `Are you sure you want to delete ${selectedIds.size} selected courses?`, async () => {
        try {
            setLoading(true);
            const idsToDelete = Array.from(selectedIds);
            const { error } = await supabase.from('courses').delete().in('id', idsToDelete);
            if (error) throw error;
            showSuccess('Deleted', 'Selected courses have been removed.');
            setSelectedIds(new Set());
            fetchData();
        } catch (err) {
            showError('Error', err.message);
        } finally {
            setLoading(false);
        }
    });
  };

  const [loading, setLoading] = useState(false);
  const save = async (form) => {
    console.log("Saving course with form:", form);
    try {
      setLoading(true);
      const { chapters } = form;
      
      let finalPrice = form.price;
      if (finalPrice === '' || finalPrice === null || finalPrice === undefined) {
        finalPrice = '0';
      } else {
        finalPrice = String(finalPrice);
      }

      let finalThumbnail = form.thumbnail;

      if (form.coverFile) {
        const ext = form.coverFile.name.split('.').pop();
        const fileName = `course-covers/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, form.coverFile, { cacheControl: '3600', upsert: true });
        
        if (uploadError) {
          console.error("Cover Upload Error:", uploadError);
          throw new Error("Failed to upload course cover image.");
        }

        const { data: pubUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalThumbnail = pubUrl.publicUrl;
      }

      const coursePayload = {
        title: form.title,
        category: form.category,
        level: form.level,
        description: form.description,
        instructor: JSON.stringify(form.instructors),
        price: finalPrice,
        status: 'Published',
        thumbnail: finalThumbnail || `${COURSE_IMAGE_BANK[Math.floor(Math.random() * COURSE_IMAGE_BANK.length)]}?auto=format&fit=crop&w=600&q=80`,
        cover_image: finalThumbnail || null
      };

      let courseId;
      if (modal === 'add' || (typeof modal !== 'number' && typeof modal !== 'string')) {
        const { data: newCourse, error } = await supabase.from('courses').insert([coursePayload]).select().single();
        if (error) throw error;
        courseId = newCourse.id;
      } else {
        courseId = modal;
        const { error } = await supabase.from('courses').update(coursePayload).eq('id', courseId);
        if (error) throw error;
      }

      const targetCourseId = Number(courseId);
      const allModules = [];
      if (chapters && chapters.length > 0) {
        chapters.forEach((chap) => {
          if (chap.modules && chap.modules.length > 0) {
            chap.modules.forEach((m) => {
              allModules.push({
                chapter_title: chap.title || 'Untitled Chapter',
                title: m.title || 'Untitled Module',
                video_url: m.videoLink || m.video_url || '',
                description: m.description || '',
                course_id: targetCourseId
              });
            });
          }
        });
      }

      if (allModules.length > 0) {
        if (modal !== 'add') {
          await supabase.from('course_modules').delete().eq('course_id', targetCourseId);
        }
        const modulesWithOrder = allModules.map((m, i) => ({ ...m, sort_order: i }));
        const { error: modError } = await supabase.from('course_modules').insert(modulesWithOrder);
        if (modError) throw modError;
      }

      showSuccess('Course Saved', 'Successful!');
      setModal(null);
      if (typeof fetchData === 'function') await fetchData();
    } catch (err) {
      showError('Save Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <div className="adm-header-title">
          <h3>Courses <span className="adm-count">{filteredCourses.length}</span></h3>
        </div>
        
        <div className="adm-header-filters">
           <div className="adm-search-wrap header-integrated">
              <i className="ri-search-line"></i>
              <input 
                type="text" 
                className="adm-search-input" 
                placeholder="Search courses..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <ModernDropdown 
               options={['All', ...new Set(courses.map(c => c.category))]}
               value={categoryFilter}
               onChange={v => { setCategoryFilter(v); setCurrentPage(1); }}
            />
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="adm-view-toggle">
            <button className={`adm-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Table View">
              <i className="ri-list-check"></i>
            </button>
            <button className={`adm-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
              <i className="ri-grid-fill"></i>
            </button>
          </div>
          <button className="special-button" onClick={() => setModal('add')} title="Create a new course"><i className="ri-add-line"></i> Add Course</button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar">
          <div className="adm-bulk-info">{selectedIds.size} courses selected</div>
          <div className="adm-bulk-actions">
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={handleBulkDelete}>
              <i className="ri-delete-bin-line"></i> Delete Selected
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="adm-empty-state">
          <i className="ri-book-open-line"></i>
          <h3>No courses found</h3>
          <p>Start by adding your first educational course to the platform.</p>
          <button className="special-button" style={{ marginTop: '1.5rem' }} onClick={() => setModal('add')}>Add New Course</button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                    <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === paginatedCourses.length && paginatedCourses.length > 0} onChange={handleSelectAll} />
                </th>
                <th>Title</th><th>Category</th><th>Level</th><th>Learners</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map(c => (
                <tr key={c.id} className={selectedIds.has(c.id) ? 'selected-row' : ''}>
                  <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
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
                      <button className="adm-icon-btn" data-tooltip="Edit Course" onClick={() => setModal(c.id)}><i className="ri-edit-line"></i></button>
                      <button className="adm-icon-btn" data-tooltip="Toggle Visibility" onClick={async () => {
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
                      <button className="adm-icon-btn danger" data-tooltip="Delete" onClick={() => onDelete(c, 'course')}><i className="ri-delete-bin-line"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-card-grid">
          {paginatedCourses.map(c => (
            <div key={c.id} className={`adm-course-grid-card ${selectedIds.has(c.id) ? 'selected' : ''}`}>
              <div className="adm-course-card-image">
                <img src={c.thumbnail || `${COURSE_IMAGE_BANK[Math.floor(Math.random() * COURSE_IMAGE_BANK.length)]}?auto=format&fit=crop&w=600&q=80`} alt={c.title} />
                <span className="adm-course-card-badge">{c.level}</span>
                  <input 
                    type="checkbox" 
                    className="adm-custom-checkbox" 
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                    checked={selectedIds.has(c.id)} 
                    onChange={() => toggleSelect(c.id)} 
                  />
              </div>
              <div className="adm-course-card-content">
                <h4 className="adm-course-card-title">{c.title}</h4>
                <span className="adm-cat-badge" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>{c.category}</span>
                <div className="adm-course-card-meta">
                  <span><i className="ri-group-line"></i> {c.learners || 0} Learners</span>
                  <span><i className="ri-calendar-line"></i> {c.status}</span>
                </div>
                <div className="adm-row-actions" style={{ marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                   <button className="adm-icon-btn" data-tooltip="Edit" onClick={() => setModal(c.id)}><i className="ri-edit-line"></i></button>
                   <button className="adm-icon-btn danger" data-tooltip="Delete" onClick={() => onDelete(c, 'course')}><i className="ri-delete-bin-line"></i></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="adm-pagination-bar">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {modal && (
        <CourseModal
          initial={editCourse ? { ...editCourse, modules: editCourse.modules || [{ title:'', videoLink:'' }], instructors: (() => { try { const p = JSON.parse(editCourse.instructor); return Array.isArray(p) ? p : [editCourse.instructor].filter(Boolean); } catch { return [editCourse.instructor].filter(Boolean); } })() } : null}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}

      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function ResourcesPanel({ resources, setResources, onDelete, fetchData, onSync }) {
  const [modal, setModal] = useState(null);
  const [viewer, setViewer] = useState({ isOpen: false, resource: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [progFilter, setProgFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError, showConfirm } = useModal();

  // Filter items based on filters
  const filteredItems = (resources || []).filter(r => {
    const matchesSearch = (r.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (r.author?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProg = progFilter === "All" || r.programme === progFilter;
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesYear = yearFilter === "All" || String(r.published_year || r.year) === yearFilter;
    
    return matchesSearch && matchesProg && matchesStatus && matchesYear;
  });

  const editItem = filteredItems.find(r => r.id === modal);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const pagedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pagedItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pagedItems.map(i => i.id)));
  };

  const handleBulkAction = (action, value = null) => {
    const ids = Array.from(selectedIds);
    
    if (action === 'delete') {
        showConfirm('Bulk Delete', `Delete ${ids.length} items?`, async () => {
            setBulkActionLoading(true);
            try {
                const { error } = await supabase.from('library_resources').delete().in('id', ids);
                if (error) throw error;
                showSuccess('Deleted', 'Items removed.');
                setSelectedIds(new Set());
                fetchData();
            } catch (err) {
                showError('Bulk Action Error', err.message);
            } finally {
                setBulkActionLoading(false);
            }
        });
    } else if (action === 'status') {
        (async () => {
            setBulkActionLoading(true);
            try {
                const { error } = await supabase.from('library_resources').update({ status: value }).in('id', ids);
                if (error) throw error;
                showSuccess('Updated', 'Status changed.');
                setSelectedIds(new Set());
                fetchData();
            } catch (err) {
                showError('Bulk Action Error', err.message);
            } finally {
                setBulkActionLoading(false);
            }
        })();
    } else if (action === 'categorise') {
        (async () => {
            setBulkActionLoading(true);
            try {
                const { error } = await supabase.from('library_resources').update({ category: value }).in('id', ids);
                if (error) throw error;
                showSuccess('Categorised', 'Category updated.');
                setSelectedIds(new Set());
                fetchData();
            } catch (err) {
                showError('Bulk Action Error', err.message);
            } finally {
                setBulkActionLoading(false);
            }
        })();
    }
  };

  // Dynamic Categories from existing resources
  const dynamicCategories = Array.from(new Set(resources.map(r => r.category).filter(Boolean)));

  const save = async (form) => {
    try {
      setLoading(true);
      let finalFileUrl = form.file_url || form.fileUrl || '';

      if (form.fileItem) {
        const ext = form.fileItem.name.split('.').pop();
        const fileName = `resources/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const { error: docErr } = await supabase.storage.from('avatars').upload(fileName, form.fileItem, { cacheControl: '3600', upsert: true });
        if (!docErr) {
          const { data: pubUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
          finalFileUrl = pubUrl.publicUrl;
        }
      }

      const payload = {
        title: form.title,
        type: form.type,
        category: form.category,
        description: form.description,
        file_url: finalFileUrl,
        status: form.status || 'Published',
        author: form.author,
        published_year: parseInt(form.published_year) || null,
        programme: form.programme,
        thematic_area: form.thematic_area,
        location: form.location
      };

      const isEdit = modal && modal !== 'add';
      const resourceId = isEdit ? modal : null;
      const targetTable = editItem?.table_name || 'library_resources';

      if (isEdit) {
        const { error } = await supabase.from(targetTable).update(payload).eq('id', resourceId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('library_resources').insert([payload]);
        if (error) throw error;
      }
      setModal(null);
      showSuccess('Resource Saved', 'Resource saved successfully!');
      
      if (typeof fetchData === 'function') {
        fetchData();
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
      <div className="adm-panel-header" style={{ marginBottom: '1.5rem' }}>
        <div className="adm-header-title">
          <h3>Library Resources <span className="adm-count">{filteredItems.length}</span></h3>
          <p style={{fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '2px'}}>Unified management for SPARC, PERL, and Hub assets.</p>
        </div>

        <div className="adm-header-filters">
           <ModernDropdown 
                label="Programme"
                options={['All', 'SPARC', 'PERL', 'General']} 
                value={progFilter} 
                onChange={v => { setProgFilter(v); setCurrentPage(1); }} 
            />
            <ModernDropdown 
                label="Status"
                options={['All', 'Published', 'Draft']} 
                value={statusFilter} 
                onChange={v => { setStatusFilter(v); setCurrentPage(1); }} 
            />
        </div>

        <div className="adm-header-actions">
          <div className="adm-search-wrap">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              className="adm-search-input" 
              placeholder="Search title, author..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="special-button" onClick={() => setModal('add')} title="Add new library asset"><i className="ri-add-line"></i> Add Asset</button>
        </div>
      </div>

      {/* Filter row merged into header above */}

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar" style={{ animation: 'slideDown 0.3s ease' }}>
          <div className="adm-bulk-info">{selectedIds.size} items selected</div>
          <div className="adm-bulk-actions">
            <ModernDropdown 
                options={['Categorise', ...dynamicCategories]} 
                value="Categorise" 
                onChange={v => v !== 'Categorise' && handleBulkAction('categorise', v)} 
            />
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('status', 'Published')}>
              Publish
            </button>
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('delete')}>
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === pagedItems.length && pagedItems.length > 0} onChange={handleSelectAll} />
              </th>
              <th>Title</th>
              <th>Programme</th>
              <th>Thematic Area</th>
              <th>Author</th>
              <th>Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.length === 0 ? (
              <tr><td colSpan="8" style={{textAlign:'center', padding:'4rem', color:'var(--text-soft)'}}>
                <i className="ri-file-search-line" style={{ fontSize: '3rem', opacity: 0.1, display: 'block', marginBottom: '1rem' }}></i>
                No resources found matching your perspective.
              </td></tr>
            ) : pagedItems.map(r => (
              <tr key={r.id} className={selectedIds.has(r.id) ? 'selected-row' : ''}>
                <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} />
                </td>
                <td>
                  <div style={{display:'flex', flexDirection:'column'}}>
                    <strong style={{color:'var(--text-main)'}}>{r.title}</strong>
                    <span style={{fontSize:'0.7rem', color:'var(--text-soft)'}}>{r.category || 'Resource'}</span>
                  </div>
                </td>
                <td><span className={`badge ${r.programme === 'SPARC' ? 'badge-purple' : 'badge-blue'}`} style={{fontSize:'0.7rem', padding:'2px 8px', borderRadius:'12px', background: r.programme === 'SPARC' ? '#f3e8ff' : '#dbeafe', color: r.programme === 'SPARC' ? '#7e22ce' : '#1d4ed8' }}>{r.programme || 'General'}</span></td>
                <td><span style={{fontSize:'0.85rem'}}>{r.thematic_area || 'N/A'}</span></td>
                <td><span style={{fontSize:'0.85rem'}}>{r.author || 'GRH'}</span></td>
                <td><span style={{fontSize:'0.85rem'}}>{r.published_year || r.year || 'N/A'}</span></td>
                <td><span className={`adm-status-badge ${r.status === 'Published' ? 'published' : 'draft'}`}>{r.status || 'Published'}</span></td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn" data-tooltip="Preview" onClick={() => setViewer({ isOpen: true, resource: r })}><i className="ri-eye-line"></i></button>
                    <button className="adm-icon-btn" data-tooltip="Edit" onClick={() => setModal(r.id)}><i className="ri-edit-line"></i></button>
                    <a href={r.fileUrl || r.file_url} target="_blank" rel="noreferrer" className="adm-icon-btn" data-tooltip="Open File"><i className="ri-external-link-line"></i></a>
                    <button className="adm-icon-btn danger" data-tooltip="Delete" onClick={() => onDelete(r, 'resource')}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {modal && <ResourceModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
      
      <ResourceViewer 
        isOpen={viewer.isOpen}
        onClose={() => setViewer({ isOpen: false, resource: null })}
        resource={viewer.resource}
      />

      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function UsersPanel({ users, setUsers, onDelete, loggedInUser, fetchData }) {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError, showConfirm } = useModal();

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

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u => 
    (u.name || u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredUsers.map(u => u.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAction = (action, value = null) => {
    const ids = Array.from(selectedIds);
    if (action === 'delete') {
      showConfirm('Bulk Delete', `Are you sure you want to delete ${ids.length} users?`, async () => {
        try {
          setLoading(true);
          const { error } = await supabase.from('profiles').delete().in('id', ids);
          if (error) throw error;
          showSuccess('Deleted', 'Selected users have been removed.');
          setSelectedIds(new Set());
          if (fetchData) fetchData();
        } catch (err) { showError('Error', err.message); }
        finally { setLoading(false); }
      });
    } else if (action === 'status') {
        showConfirm('Bulk Status Update', `Set ${ids.length} users to ${value}?`, async () => {
            try {
              setLoading(true);
              const { error } = await supabase.from('profiles').update({ status: value }).in('id', ids);
              if (error) throw error;
              showSuccess('Updated', 'User status updated.');
              setSelectedIds(new Set());
              if (fetchData) fetchData();
            } catch (err) { showError('Error', err.message); }
            finally { setLoading(false); }
        });
    }
  };

  const handleUserSave = async (nu) => {
    console.log("[GRH] handleUserSave called with:", nu);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (nu.id) {
        // Real update for existing user
        const { data: updatedData, error } = await supabase
          .from('profiles')
          .update({
            name: nu.name,
            email: nu.email,
            role: nu.role,
            status: nu.status
          })
          .eq('id', nu.id)
          .select();
        
        if (error) throw error;
        
        if (!updatedData || updatedData.length === 0) {
          throw new Error("Update failed: No records were affected. You may not have permission to update other user profiles (Check Supabase RLS).");
        }
        
        showSuccess('User Updated', 'User profile updated successfully.');
        const finalizedUser = { ...nu, ...updatedData[0] };
        setUsers(us => us.map(x => x.id === nu.id ? finalizedUser : x));
        setModal(null);
      } else {
        // Manual fetch to see the EXACT error body from the Edge Function
        // Using session retrieved at start of handler
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`;
        console.log(`[GRH] Calling Edge Function at: ${functionUrl}`);
        
        const fetchPromise = fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            email: nu.email,
            name: nu.name,
            role: nu.role
          })
        }).then(async res => {
          const data = await res.json();
          if (!res.ok) {
            console.error("[GRH] Edge Function Error Body:", data);
            throw new Error(data.error || data.message || `HTTP ${res.status}`);
          }
          return data;
        });

        // 15s timeout for the manual fetch
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Invitation request timed out (15s).')), 15000)
        );

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Handle result (success case)
        if (result?.inviteLink) {
          showSuccess('User Invited (Email Slow)', `User created. If they don't get the email, send them this link: ${result.inviteLink}`);
        } else {
          showSuccess('Magic Link Sent', 'A login link has been sent to the user.');
        }

        setModal(null);
        setLoading(false);
        
        if (typeof fetchData === 'function') {
          await fetchData();
        } else {
          setUsers(us => [{ ...nu, courses: 0, joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }, ...us]);
        }
      }
    } catch (err) {
      console.error("Save User Error:", err);
      showError('Save Error', 'Error saving user: ' + err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <div className="adm-header-title">
          <h3>Users <span className="adm-count">{users.length}</span></h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="adm-search-wrap">
            <i className="ri-search-line"></i>
            <input 
              type="text" 
              className="adm-search-input" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-outline" onClick={handleExportCSV} title="Export CSV"><i className="ri-download-2-line"></i> Export</button>
          <button className="special-button" onClick={() => setModal('add')} title="Invite User"><i className="ri-user-add-line"></i> Invite</button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar" style={{ animation: 'slideDown 0.3s ease' }}>
          <div className="adm-bulk-info">{selectedIds.size} users selected</div>
          <div className="adm-bulk-actions">
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('status', 'Active')}>Set Active</button>
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('status', 'Suspended')}>Suspend</button>
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('delete')}>Delete</button>
          </div>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0} onChange={handleSelectAll} />
              </th>
              <th>User</th><th>Role</th><th>Learning</th><th>Joined</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {(filteredUsers || []).map(u => (
              <tr key={u.id || u.email} className={selectedIds.has(u.id) ? 'selected-row' : ''}>
                <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelect(u.id)} />
                </td>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                    <div style={{width:32, height:32, borderRadius:'50%', background:'var(--bg-weak)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:600, overflow: 'hidden'}}>
                      {u.avatar_url ? <img src={u.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : (u.name || u.full_name || 'U').substring(0,1).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{display:'block'}}>{u.name || u.full_name}</strong>
                      <span style={{fontSize:'0.75rem', color:'var(--text-soft)'}}>{u.email}</span>
                    </div>
                  </div>
                </td>
                <td><span className="adm-role-badge">{u.role}</span></td>
                <td>{u.courses || 0} Courses</td>
                <td>{u.joined || 'Just now'}</td>
                <td><span className={`adm-status-badge ${u.status === 'Active' ? 'published' : 'draft'}`}>{u.status || 'Active'}</span></td>
                <td>
                  <div className="adm-row-actions">
                    <button className="adm-icon-btn" data-tooltip="Edit User" onClick={() => setModal(u)}><i className="ri-edit-line"></i></button>
                    <button 
                      className="adm-icon-btn danger" 
                      data-tooltip="Delete User"
                      disabled={u.id === loggedInUser?.id} 
                      onClick={() => onDelete(u, 'user')}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <UserModal 
          initial={typeof modal === 'object' ? modal : (modal === 'add' ? null : null)}
          onClose={() => setModal(null)} 
          onSave={handleUserSave} 
        />
      )}
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

const ANALYTICS_COLORS = ['var(--primary)', '#4da16a', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

function AnalyticsPanel({ stats }) {
  const handleExportAnalyticsCSV = () => {
    const rows = [];
    rows.push(['Metric', 'Value'].join(','));
    rows.push(['Total Learners', stats?.learners || 0]);
    rows.push(['Active Courses', stats?.courses || 0]);
    rows.push(['Library Resources', stats?.resources || 0]);
    rows.push(['Certifications', stats?.certs || 0]);
    rows.push([]);
    rows.push(['Chart: Monthly Data', ...(stats?.chartData?.[0] ? Object.keys(stats.chartData[0]).filter(k => k !== 'monthId') : [])].join(','));
    (stats?.chartData || []).forEach(m => {
      const vals = Object.entries(m).filter(([k]) => k !== 'monthId').map(([, v]) => v);
      rows.push(vals.join(','));
    });
    rows.push([]);
    rows.push(['Activity Breakdown', 'Count'].join(','));
    (stats?.activityBreakdown || []).forEach(a => rows.push([a.name, a.value].join(',')));
    rows.push([]);
    rows.push(['Course', 'Enrolled Learners'].join(','));
    (stats?.courseEngagement || []).forEach(c => rows.push([`"${c.name}"`, c.learners].join(',')));
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grh-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="adm-panel">

      <div className="adm-panel-header">
        <h3>Analytics</h3>
        <SpecialButton onClick={handleExportAnalyticsCSV}>
          <i className="ri-download-line"></i> Export CSV
        </SpecialButton>
      </div>

      {/* Stat mini-cards row */}
      <div className="adm-analytics-stats-row">
        <div className="adm-aStat-card"><span className="adm-aStat-value">{stats?.learners || 0}</span><span className="adm-aStat-label">Total Learners</span></div>
        <div className="adm-aStat-card"><span className="adm-aStat-value">{stats?.courses || 0}</span><span className="adm-aStat-label">Active Courses</span></div>
        <div className="adm-aStat-card"><span className="adm-aStat-value">{stats?.resources || 0}</span><span className="adm-aStat-label">Library Resources</span></div>
        <div className="adm-aStat-card"><span className="adm-aStat-value">{stats?.certs || 0}</span><span className="adm-aStat-label">Certifications</span></div>
      </div>

      {/* Row 1: Learner Growth + Course Engagement */}
      <div className="adm-analytics-grid-2">
        <div className="adm-chart-card">
          <h4>Learner Growth (6 months)</h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Line type="monotone" dataKey="learners" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="adm-chart-card">
          <h4>Top Courses by Enrollment</h4>
          {(stats?.courseEngagement || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.courseEngagement || []} layout="vertical" margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                <XAxis type="number" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} fontSize={10} width={120} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="learners" fill="var(--primary)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="adm-chart-empty">
              <i className="ri-bar-chart-grouped-line"></i>
              <p>No enrollment data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Activity Breakdown + Monthly Certifications */}
      <div className="adm-analytics-grid-2">
        <div className="adm-chart-card">
          <h4>Activity Breakdown</h4>
          {(stats?.activityBreakdown || []).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats?.activityBreakdown || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {stats?.activityBreakdown?.map((_, idx) => (
                      <Cell key={idx} fill={ANALYTICS_COLORS[idx % ANALYTICS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="adm-analytics-legend">
                {(stats?.activityBreakdown || []).map((item, idx) => (
                  <span key={item.name} className="adm-analytics-legend-item">
                    <span className="adm-analytics-legend-dot" style={{ background: ANALYTICS_COLORS[idx % ANALYTICS_COLORS.length] }} />
                    {item.name} — {item.value}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="adm-chart-empty">
              <i className="ri-pie-chart-line"></i>
              <p>No activity data yet.</p>
            </div>
          )}
        </div>
        <div className="adm-chart-card">
          <h4>Certifications per Month</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="certs" fill="var(--primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="adm-aStat-card" style={{ marginTop: '0.75rem', alignSelf: 'center' }}>
            <span className="adm-aStat-value">{stats?.certs || 0}</span>
            <span className="adm-aStat-label">Total Certificates</span>
          </div>
        </div>
      </div>

      {/* Row 3: Learners by Region or User Engagement Depth */}
      {(stats?.regionData || []).length > 0 ? (
        <div className="adm-chart-card">
          <h4>Learners by Region</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.regionData || []} layout="vertical" margin={{ left: 30, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
              <XAxis type="number" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} fontSize={11} width={120} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="adm-chart-card">
          <h4>User Engagement Depth</h4>
          {(stats?.moduleDistribution || []).length > 0 && stats.moduleDistribution.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats?.moduleDistribution || []} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="adm-chart-empty">
              <i className="ri-bar-chart-line"></i>
              <p>No engagement data yet.</p>
            </div>
          )}
        </div>
      )}

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

function AdminInstructorsPanel({ instructors = [], onDelete, fetchData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'list' ? 10 : 12;


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    summary: '',
    avatar_url: '',
    category: 'Governance'
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError, showConfirm } = useModal();

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(i => i.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAction = (action) => {
    const ids = Array.from(selectedIds);
    if (action === 'delete') {
      showConfirm('Bulk Delete', `Remove ${ids.length} instructors?`, async () => {
        try {
          setIsSaving(true);
          const { error } = await supabase.from('instructors').delete().in('id', ids);
          if (error) throw error;
          showSuccess('Deleted', 'Selected members removed.');
          setSelectedIds(new Set());
          if (fetchData) fetchData();
        } catch (err) { showError('Error', err.message); }
        finally { setIsSaving(false); }
      });
    }
  };


  useEffect(() => {
    console.log("[GRH] Instructors list updated:", instructors.length, "items");
  }, [instructors]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError('File Too Large', 'Please select an image smaller than 2MB.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    console.log("[GRH] handleSave triggered", { formData, isEditing: !!editingInstructor });
    
    if (!formData.name || !formData.title) {
      showError('Invalid Form', 'Name and Title are required.');
      return;
    }

    setIsSaving(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      // Upload if a new file was chosen
      if (avatarFile) {
        console.log("[GRH] Uploading new avatar file...");
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `instructor_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
        const filePath = `instructors/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        finalAvatarUrl = publicUrl;
        console.log("[GRH] Avatar uploaded successfully:", finalAvatarUrl);
      }

      const payload = { 
        name: formData.name,
        title: formData.title,
        summary: formData.summary,
        avatar_url: finalAvatarUrl,
        category: formData.category 
      };

      console.log("[GRH] Sending payload to Supabase:", payload);

      if (editingInstructor) {
        const { error, data } = await supabase
          .from('instructors')
          .update(payload)
          .eq('id', editingInstructor.id)
          .select();
        
        if (error) {
          console.error("[GRH] Supabase Update Error:", error);
          throw error;
        }
        console.log("[GRH] Update success:", data);
        showSuccess('Updated!', 'Instructor details updated successfully.');
      } else {
        const { error, data } = await supabase
          .from('instructors')
          .insert([payload])
          .select();
        
        if (error) {
          console.error("[GRH] Supabase Insert Error:", error);
          throw error;
        }
        console.log("[GRH] Insert success:", data);
        showSuccess('Added!', 'New instructor added successfully.');
      }
      
      setIsAddModalOpen(false);
      setEditingInstructor(null);
      setAvatarFile(null);
      setAvatarPreview(null);
      setFormData({ name: '', title: '', summary: '', avatar_url: '', category: 'Governance' });
      
      if (fetchData) {
        console.log("[GRH] Refreshing data...");
        await fetchData();
      }
    } catch (err) {
      console.error("[GRH] Save Instructor Exception:", err);
      showError('Error Saving', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = (instructors || []).filter(inst => 
    inst.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="instr-manager">
      <header className="instr-header">
        <div className="instr-header-left">
          <h3>Instructors & Leadership <span className="adm-count">{instructors.length}</span></h3>
          <p>Manage people appearing in the About and Learn sections.</p>
        </div>
        <div className="instr-header-actions">
          <div className="adm-view-toggle">
            <button className={`adm-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Table View">
              <i className="ri-list-check"></i> List
            </button>
            <button className={`adm-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Profile Gallery View">
              <i className="ri-grid-fill"></i> Grid
            </button>
          </div>
          <button className="special-button" onClick={() => {
            setEditingInstructor(null);
            setAvatarFile(null);
            setAvatarPreview(null);
            setFormData({ name: '', title: '', summary: '', avatar_url: '', category: 'Governance' });
            setIsAddModalOpen(true);
          }}>
            <i className="ri-user-add-line"></i> Add Member
          </button>
        </div>
      </header>

      <div className="instr-controls">
        <div className="instr-search">
          <i className="ri-search-line"></i>
          <input 
            type="text" 
            placeholder="Search by name or title..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="instr-stats">
          Showing {paginated.length} of {filtered.length} members
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar" style={{ animation: 'slideDown 0.3s ease' }}>
          <div className="adm-bulk-info">{selectedIds.size} instructors selected</div>
          <div className="adm-bulk-actions">
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('delete')}>
              <i className="ri-delete-bin-line"></i> Delete Selected
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="instr-empty">
          <i className="ri-user-search-line" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
          <h4>No instructors found</h4>
          <p>Try a different search term or add a new member.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={handleSelectAll} />
                </th>
                <th>Member</th><th>Title</th><th>Category</th><th>Summary</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(inst => (
                <tr key={inst.id} className={selectedIds.has(inst.id) ? 'selected-row' : ''}>
                  <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(inst.id)} onChange={() => toggleSelect(inst.id)} />
                  </td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                      <img src={inst.avatar_url || DEFAULT_AVATAR} alt="" style={{width:36, height:36, borderRadius:'50%', objectFit:'cover'}} />
                      <strong>{inst.name}</strong>
                    </div>
                  </td>
                  <td>{inst.title}</td>
                  <td><span className="adm-tag">{inst.category}</span></td>
                  <td style={{maxWidth:300}}><p style={{fontSize:'0.8rem', color:'var(--text-soft)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0}}>{inst.summary}</p></td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-icon-btn" data-tooltip="Edit Profile" onClick={() => {
                        setEditingInstructor(inst);
                        setFormData({ 
                          name: inst.name, 
                          title: inst.title, 
                          summary: inst.summary || '', 
                          avatar_url: inst.avatar_url || '', 
                          category: inst.category || 'Governance'
                        });
                        setAvatarPreview(inst.avatar_url);
                        setIsAddModalOpen(true);
                      }}><i className="ri-edit-line"></i></button>
                      <button className="adm-icon-btn danger" data-tooltip="Remove" onClick={() => onDelete(inst, 'instructor')}><i className="ri-delete-bin-line"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="instr-pagination-box">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="instr-grid">
            {paginated.map(inst => (
              <div key={inst.id} className={`instr-card-container ${selectedIds.has(inst.id) ? 'selected' : ''}`} onClick={() => toggleSelect(inst.id)}>
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 5 }}>
                    <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(inst.id)} readOnly style={{ transform: 'scale(1.2)' }} />
                </div>
                <InstructorCard 
                  {...inst} 
                  className="instr-card-hoverable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingInstructor(inst);
                    setAvatarFile(null);
                    setAvatarPreview(null);
                    setFormData({
                      name: inst.name,
                      title: inst.title,
                      summary: inst.summary || '',
                      avatar_url: inst.avatar_url || '',
                      category: inst.category || 'Governance'
                    });
                    setIsAddModalOpen(true);
                  }}
                />
                <button 
                  className="instr-delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(inst, 'instructor');
                  }}
                  title="Delete Member"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="instr-pagination-box">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal animate-up">
            <header className="adm-modal-header">
              <h3>{editingInstructor ? 'Edit Member' : 'Add New Member'}</h3>
              <button className="adm-close-btn" onClick={() => {
                setIsAddModalOpen(false);
                setAvatarFile(null);
                setAvatarPreview(null);
              }}>
                <i className="ri-close-line"></i>
              </button>
            </header>
            <div className="adm-modal-body">
              <div className="instr-avatar-upload-section">
                <div 
                  className="instr-avatar-preview" 
                  onClick={() => document.getElementById('instr-file-input').click()}
                >
                  <img src={avatarPreview || formData.avatar_url || 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt="Avatar Preview" />
                  <div className="instr-avatar-overlay">
                    <i className="ri-camera-line"></i>
                    <span>Change</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  id="instr-file-input" 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                />
                <div className="instr-avatar-help">
                  <p>Click image to upload avatar</p>
                  <span>JPG, PNG. Max 2MB.</span>
                </div>
              </div>

              <div className="adm-form-group">
                <label>Full Name*</label>
                <input 
                  placeholder="e.g. Dr. Amaka Okonkwo" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Role / Title*</label>
                  <input 
                    placeholder="e.g. Governance Specialist" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Category</label>
                  <ModernDropdown 
                    options={['Governance', 'Finance', 'Leadership', 'Democracy', 'Integrity', 'Digital']}
                    value={formData.category}
                    onChange={v => setFormData({...formData, category: v})}
                  />
                </div>
              </div>
              <div className="adm-form-group">
                <label>Direct Link / R2 URL (Paste avatar link here)</label>
                <input 
                  placeholder="https://pub-xxxx.r2.dev/your-image.png" 
                  value={formData.avatar_url}
                  onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                  disabled={isSaving}
                />
              </div>
              <div className="adm-form-group">
                <label>Brief Summary (Expertise / Background)</label>
                <textarea 
                  rows="4" 
                  placeholder="A short bio that will show in the detail modal..."
                  value={formData.summary}
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--stroke-soft)',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <footer className="adm-modal-footer">
              <button 
                className="btn-outline" 
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="special-button" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="ri-loader-4-line ri-spin"></i> Saving...
                  </>
                ) : (
                  editingInstructor ? 'Save Changes' : 'Add Member'
                )}
              </button>
            </footer>
          </div>
        </div>
      )}

      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

function AdminSettingsPanel({ user, onRefreshUser }) {
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

    if (file.size > 2 * 1024 * 1024) {
      showError('Upload Failed', 'Avatar image size must be less than 2MB.');
      return;
    }
    
    if (!user?.id || user.id === 'undefined') {
      showError('Upload Failed', 'A valid administrator ID is required to update the avatar.');
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}-${Date.now()}.${fileExt}`;
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
            <div className="adm-current-avatar" style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-white)', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, overflow: 'hidden' }}>
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
              <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading} autoComplete="name" />
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
function BooksPanel({ books, setBooks, onDelete, fetchData, onSync }) {
  const [modal, setModal] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [viewer, setViewer] = useState({ isOpen: false, resource: null });
  const [loading, setLoading] = useState(false);
  const editItem = books.find(b => b.id === modal);
  const DEFAULT_BOOK_IMG = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError, showConfirm } = useModal();

  const handleSelectAll = () => {
    if (selectedIds.size === books.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(books.map(b => b.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    showConfirm('Bulk Delete', `Delete ${selectedIds.size} books?`, async () => {
      try {
        setLoading(true);
        const { error } = await supabase.from('books').delete().in('id', Array.from(selectedIds));
        if (error) throw error;
        showSuccess('Deleted', 'Books removed.');
        setSelectedIds(new Set());
        fetchData();
      } catch (err) { showError('Error', err.message); }
      finally { setLoading(false); }
    });
  };

  const save = async (data) => {
    try {
      setLoading(true);
      
      const processBook = async (b) => {
        let finalImageUrl = b.imageUrl || b.image_url || '';
        let finalFileUrl = b.fileUrl || b.file_url || '';

        if (b.imageFile) {
          const ext = b.imageFile.name.split('.').pop();
          const fileName = `covers/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
          const { error: imgErr } = await supabase.storage.from('avatars').upload(fileName, b.imageFile, { cacheControl: '3600', upsert: true });
          if (!imgErr) {
            const { data: pubUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
            finalImageUrl = pubUrl.publicUrl;
          }
        }

        if (b.bookFile) {
          const ext = b.bookFile.name.split('.').pop();
          const fileName = `documents/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
          const { error: docErr } = await supabase.storage.from('avatars').upload(fileName, b.bookFile, { cacheControl: '3600', upsert: true });
          if (!docErr) {
            const { data: pubUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
            finalFileUrl = pubUrl.publicUrl;
          }
        }

        return {
          title: b.title,
          summary: b.summary,
          image_url: finalImageUrl,
          file_url: finalFileUrl,
          status: b.status || 'Published',
          author: b.author,
          published_year: parseInt(b.published_year) || null,
          programme: b.programme,
          thematic_area: b.thematic_area,
          location: b.location
        };
      };

      const isEdit = modal && modal !== 'add';
      const bookId = isEdit ? modal : null;

      if (isEdit) {
        const payload = await processBook(data);
        const { error } = await supabase.from('books').update(payload).eq('id', bookId);
        if (error) throw error;
      } else {
        const payloadArr = Array.isArray(data) ? data : [data];
        const payload = await Promise.all(payloadArr.map(processBook));
        const { error } = await supabase.from('books').insert(payload);
        if (error) throw error;
      }
      setModal(null);
      showSuccess('Books Saved', 'Books saved successfully!');
      if (typeof fetchData === 'function') fetchData();
    } catch (err) {
      showError('Save Error', 'Error saving books: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <div className="adm-header-title">
          <h3>Books <span className="adm-count">{books.length}</span></h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="adm-view-toggle">
            <button className={`adm-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Table View">
              <i className="ri-list-check"></i> List
            </button>
            <button className={`adm-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid Gallery View">
              <i className="ri-grid-fill"></i> Grid
            </button>
          </div>
          <button className="special-button" onClick={() => setModal('add')}><i className="ri-add-line"></i> Add Book</button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar">
          <div className="adm-bulk-info">{selectedIds.size} books selected</div>
          <div className="adm-bulk-actions">
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={handleBulkDelete}>
              <i className="ri-delete-bin-line"></i> Delete Selected
            </button>
          </div>
        </div>
      )}

      {books.length === 0 ? (
        <div className="adm-empty-state">
          <i className="ri-book-2-line"></i>
          <h3>No books in library</h3>
          <p>Your digital bookshelf is empty. Start adding publications, guides, and reports.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === books.length && books.length > 0} onChange={handleSelectAll} />
                </th>
                <th>Cover</th><th>Title</th><th>Summary</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id} className={selectedIds.has(b.id) ? 'selected-row' : ''}>
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelect(b.id)} />
                  </td>
                  <td style={{width: 80}}>
                    <img src={b.imageUrl || DEFAULT_BOOK_IMG} alt={b.title} style={{width: 60, height: 76, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}} />
                  </td>
                  <td><strong>{b.title}</strong></td>
                  <td style={{maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{b.summary}</td>
                  <td><span className={`adm-status-badge ${b.status === 'Published' ? 'published' : 'draft'}`}>{b.status}</span></td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-icon-btn" data-tooltip="Preview Content" onClick={() => setViewer({ isOpen: true, resource: b })}><i className="ri-eye-line"></i></button>
                      <button className="adm-icon-btn" data-tooltip="Edit Details" onClick={() => setModal(b.id)}><i className="ri-edit-line"></i></button>
                      <button className="adm-icon-btn" data-tooltip="Toggle Visibility" onClick={async () => {
                        try {
                          const newStatus = b.status === 'Published' ? 'Draft' : 'Published';
                          const { error } = await supabase.from('books').update({ status: newStatus }).eq('id', b.id);
                          if (error) throw error;
                          fetchData();
                        } catch (err) { showError('Error', err.message); }
                      }}>
                        <i className={b.status === 'Published' ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                      </button>
                      <button className="adm-icon-btn danger" data-tooltip="Delete" onClick={() => onDelete(b, 'book')}><i className="ri-delete-bin-line"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-card-grid">
          {books.map(b => (
            <div key={b.id} className={`adm-book-grid-card ${selectedIds.has(b.id) ? 'selected' : ''}`} onClick={() => toggleSelect(b.id)}>
              <img src={b.imageUrl || DEFAULT_BOOK_IMG} alt={b.title} className="adm-book-cover-mini" />
              <div className="adm-book-card-info" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4>{b.title}</h4>
                  <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(b.id)} readOnly />
                </div>
                <p>{b.summary}</p>
                <div className="adm-row-actions" style={{ marginTop: '0.75rem', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                   <button className="adm-icon-btn btn-sm" onClick={() => setViewer({ isOpen: true, resource: b })}><i className="ri-eye-line"></i></button>
                   <button className="adm-icon-btn btn-sm" onClick={() => setModal(b.id)}><i className="ri-edit-line"></i></button>
                   <button className="adm-icon-btn btn-sm danger" onClick={() => onDelete(b, 'book')}><i className="ri-delete-bin-line"></i></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <BookModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}

      <ResourceViewer 
        isOpen={viewer.isOpen}
        onClose={() => setViewer({ isOpen: false, resource: null })}
        resource={viewer.resource}
      />

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
  workshops: WorkshopsPanel,
  gaps: LibraryGapsPanel,
  testimonials: TestimonialsPanel
};

function LibraryGapsPanel({ gaps, onResolve, onDelete, fetchData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError, showConfirm } = useModal();

  const filtered = (gaps || []).filter(g => g.query.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(g => g.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAction = (action) => {
    const ids = Array.from(selectedIds);
    if (action === 'delete') {
      showConfirm('Bulk Delete', `Remove ${ids.length} search gap logs?`, async () => {
        try {
          setLoading(true);
          const { error } = await supabase.from('explore_gaps').delete().in('id', ids);
          if (error) throw error;
          showSuccess('Deleted', 'Logs removed successfully.');
          setSelectedIds(new Set());
          if (fetchData) fetchData();
        } catch (err) { showError('Error', err.message); }
        finally { setLoading(false); }
      });
    } else if (action === 'resolve') {
        showConfirm('Bulk Resolve', `Mark ${ids.length} gaps as resolved?`, async () => {
            try {
              setLoading(true);
              const { error } = await supabase.from('explore_gaps').update({ resolved: true }).in('id', ids);
              if (error) throw error;
              showSuccess('Resolved', 'Gaps marked as resolved.');
              setSelectedIds(new Set());
              if (fetchData) fetchData();
            } catch (err) { showError('Error', err.message); }
            finally { setLoading(false); }
        });
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <div className="adm-header-title">
          <h3>Explore Gaps <span className="adm-count">{gaps.filter(g => !g.resolved).length} Unresolved</span></h3>
          <p style={{fontSize: '0.8rem', color: 'var(--text-soft)'}}>Monitor searches that returned zero results to identify content needs.</p>
        </div>
        <div className="adm-search-wrap">
          <i className="ri-search-line"></i>
          <input 
            type="text" 
            className="adm-search-input" 
            placeholder="Search queries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar" style={{ animation: 'slideDown 0.3s ease' }}>
          <div className="adm-bulk-info">{selectedIds.size} logs selected</div>
          <div className="adm-bulk-actions">
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('resolve')}>Mark Resolved</button>
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => handleBulkAction('delete')}>Delete Logs</button>
          </div>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={handleSelectAll} />
              </th>
              <th>Missing Query</th>
              <th>Asked By</th>
              <th>Date Asked</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'3rem', color:'var(--text-soft)'}}>No gaps found. Your library is well-covered!</td></tr>
            ) : filtered.sort((a,b) => new Date(b.created_at || b.asked_at) - new Date(a.created_at || a.asked_at)).map(g => (
              <tr key={g.id} className={selectedIds.has(g.id) ? 'selected-row' : ''}>
                <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(g.id)} onChange={() => toggleSelect(g.id)} />
                </td>
                <td><strong style={{color: 'var(--text-main)'}}>"{g.query}"</strong></td>
                <td>
                  <div>
                    <span style={{fontWeight: '500', color: 'var(--text-main)'}}>{g.user?.name || 'Registered User'}</span>
                    {g.user?.email && g.user.email !== 'N/A' && (
                      <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: '0.2rem'}}>{g.user.email}</span>
                    )}
                  </div>
                </td>
                <td>{new Date(g.created_at || g.asked_at).toLocaleDateString()}</td>
                <td>
                  <span className={`adm-status-badge ${g.resolved ? 'published' : 'draft'}`}>
                    {g.resolved ? 'Resolved' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="adm-row-actions">
                    {!g.resolved && (
                      <button className="adm-icon-btn" data-tooltip="Mark Resolved" onClick={() => onResolve(g.id)}>
                        <i className="ri-check-line"></i>
                      </button>
                    )}
                    <button className="adm-icon-btn danger" data-tooltip="Delete Log" onClick={() => onDelete(g, 'gap')}>
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

const DEFAULT_PANEL = (id) => () => <div className="adm-panel"><p style={{color:'var(--text-soft)'}}>Panel '{id}' — coming soon</p></div>;

/* --- WORKSHOPS PANEL --- */
function WorkshopsPanel({ workshops, setWorkshops, onDelete, fetchData }) {
  const [modal, setModal] = useState(null); // null | 'add' | number (id)
  const [attendeeModal, setAttendeeModal] = useState(null); // null | workshop object
  const [selectedIds, setSelectedIds] = useState(new Set());
  const editItem = workshops.find(w => w.id === modal);
  const [loading, setLoading] = useState(false);
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError, showConfirm } = useModal();

  const handleSelectAll = () => {
    if (selectedIds.size === workshops.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(workshops.map(w => w.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    showConfirm('Bulk Delete', `Delete ${selectedIds.size} workshops?`, async () => {
      try {
        setLoading(true);
        const { error } = await supabase.from('workshops').delete().in('id', Array.from(selectedIds));
        if (error) throw error;
        showSuccess('Deleted', 'Workshops removed.');
        setSelectedIds(new Set());
        if (fetchData) fetchData();
      } catch (err) { showError('Error', err.message); }
      finally { setLoading(false); }
    });
  };

  const save = async (data) => {
    try {
       setLoading(true);
       const { registrations, ...wData } = data;
       
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
        <div className="adm-header-title">
          <h3>Workshops <span className="adm-count">{workshops.length}</span></h3>
        </div>
        <button className="special-button" onClick={() => setModal('add')} title="Schedule new event"><i className="ri-calendar-event-line"></i> Create Workshop</button>
      </div>

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar">
          <div className="adm-bulk-info">{selectedIds.size} workshops selected</div>
          <div className="adm-bulk-actions">
            <button className="btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={handleBulkDelete}>
              <i className="ri-delete-bin-line"></i> Delete Selected
            </button>
          </div>
        </div>
      )}

      {workshops.length === 0 ? (
        <div className="adm-empty-state">
          <i className="ri-calendar-todo-line"></i>
          <h3>No workshops scheduled</h3>
          <p>Plan and manage your upcoming webinars and physical training sessions.</p>
          <button className="special-button" style={{ marginTop: '1.5rem' }} onClick={() => setModal('add')}>Create First Workshop</button>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === workshops.length && workshops.length > 0} onChange={handleSelectAll} />
                </th>
                <th>Title</th><th>Date / Time</th><th>Host</th><th>Status</th><th>Attendees</th><th></th>
              </tr>
            </thead>
            <tbody>
              {workshops.map(w => (
                <tr key={w.id} className={selectedIds.has(w.id) ? 'selected-row' : ''}>
                   <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(w.id)} onChange={() => toggleSelect(w.id)} />
                  </td>
                  <td><strong>{w.title}</strong><br/><span style={{fontSize:'0.75rem', color:'var(--text-soft)'}}>{w.format}</span></td>
                  <td>{w.date} @ {w.time}</td>
                  <td>{w.host}</td>
                  <td><span className={`adm-status-badge ${w.status === 'Upcoming' ? 'published' : 'draft'}`}>{w.status}</span></td>
                  <td>
                    <button className="adm-link-btn" data-tooltip="View Roster" onClick={() => setAttendeeModal(w)}>
                      <i className="ri-user-follow-line"></i> {w.registrations?.length || 0} Registered
                    </button>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-icon-btn" data-tooltip="Edit Details" onClick={() => setModal(w.id)}><i className="ri-edit-line"></i></button>
                      <button className="adm-icon-btn danger" data-tooltip="Delete" onClick={() => onDelete(w, 'workshop')}><i className="ri-delete-bin-line"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && <WorkshopModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
      {attendeeModal && <WorkshopAttendeesModal workshop={attendeeModal} onClose={() => setAttendeeModal(null)} />}
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

/* =====================================================================
   TESTIMONIALS PANEL
===================================================================== */
function TestimonialModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {
    name: '',
    role: '',
    text: '',
    rating: 5,
    featured: false
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
          <h3>{initial ? 'Edit Testimonial' : 'New Testimonial'}</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <form className="adm-form" onSubmit={handleSubmit}>
            <div className="adm-form-group">
              <label>Name*</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="adm-form-group">
              <label>Role / Title</label>
              <input type="text" value={form.role} onChange={e => set('role', e.target.value)} />
            </div>
            <div className="adm-form-group">
              <label>Quote / Text*</label>
              <textarea rows={6} value={form.text} onChange={e => set('text', e.target.value)} required style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--stroke-soft)', width: '100%', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Rating</label>
                <select value={form.rating} onChange={e => set('rating', Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--stroke-soft)', width: '100%', background: 'white' }}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label>Featured</label>
                <label className="adm-toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', paddingTop: '8px' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ display: 'none' }} />
                  <span className="adm-toggle-track" style={{ position: 'relative', width: '44px', height: '24px', background: form.featured ? 'var(--primary)' : '#cbd5e1', borderRadius: '12px', transition: 'background 0.2s', flexShrink: 0 }}>
                    <span className="adm-toggle-thumb" style={{ position: 'absolute', top: '2px', left: form.featured ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-soft)' }}>Show as featured card</span>
                </label>
              </div>
            </div>
          </form>
        </div>
        <footer className="adm-modal-footer">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="special-button" onClick={handleSubmit}>{initial ? 'Save Changes' : 'Add Testimonial'}</button>
        </footer>
      </div>
    </div>
  );
}

function TestimonialsPanel({ testimonials, setTestimonials, onDelete, fetchData }) {
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { modal: notifModal, closeModal: closeNotif, showSuccess, showError } = useModal();

  const filtered = (testimonials || []).filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const editItem = testimonials.find(t => t.id === modal);

  const handleSelectAll = () => {
    if (selectedIds.size === testimonials.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(testimonials.map(t => t.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const bulkDelete = async () => {
    try {
      setLoading(true);
      const ids = [...selectedIds];
      const { error } = await supabase.from('testimonials').delete().in('id', ids);
      if (error) throw error;
      showSuccess('Deleted', `${ids.length} testimonial(s) deleted.`);
      setSelectedIds(new Set());
      if (fetchData) await fetchData();
    } catch (err) {
      showError('Delete Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const save = async (data) => {
    try {
      setLoading(true);
      const payload = {
        name: data.name,
        role: data.role || null,
        text: data.text,
        rating: data.rating,
        featured: data.featured
      };
      if (modal && modal !== 'add') {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', modal);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert([payload]);
        if (error) throw error;
      }
      showSuccess('Saved', `Testimonial ${modal && modal !== 'add' ? 'updated' : 'added'} successfully.`);
      setModal(null);
      if (fetchData) await fetchData();
    } catch (err) {
      showError('Save Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <div className="adm-header-title">
          <h3>Testimonials <span className="adm-count">{testimonials.length}</span></h3>
        </div>
        <div className="adm-header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="adm-search-box" style={{ position: 'relative' }}>
            <i className="ri-search-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }}></i>
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '36px', paddingRight: '12px', height: '38px', borderRadius: '8px', border: '1px solid var(--stroke-soft)', width: '240px' }}
            />
          </div>
          <button className="special-button" onClick={() => setModal('add')}>
            <i className="ri-add-line"></i> Add Testimonial
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="adm-bulk-bar">
          <span>{selectedIds.size} selected</span>
          <button className="btn-outline danger" onClick={bulkDelete} disabled={loading}>
            <i className="ri-delete-bin-line"></i> Delete Selected
          </button>
          <button className="btn-outline" onClick={() => setSelectedIds(new Set())}>Clear Selection</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="adm-empty-state">
          <i className="ri-quote-text" style={{ fontSize: '3rem', color: 'var(--text-soft, #94a3b8)', marginBottom: '1rem' }}></i>
          <p>{searchTerm ? 'No testimonials match your search.' : 'No testimonials yet. Add your first one!'}</p>
          {!searchTerm && <button className="special-button" onClick={() => setModal('add')} style={{ marginTop: '0.5rem' }}>Add Testimonial</button>}
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.size === testimonials.length && testimonials.length > 0} onChange={handleSelectAll} />
                </th>
                <th>Name</th>
                <th>Role</th>
                <th>Quote</th>
                <th>Rating</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(t => (
                <tr key={t.id} className={selectedIds.has(t.id) ? 'selected-row' : ''}>
                  <td><input type="checkbox" className="adm-custom-checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelect(t.id)} /></td>
                  <td><strong>{t.name}</strong></td>
                  <td style={{ color: 'var(--text-soft)', fontSize: '0.85rem' }}>{t.role || '—'}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-sub)' }}>"{t.text}"</td>
                  <td><span style={{ color: 'var(--primary)' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span></td>
                  <td>{t.featured ? <span className="adm-status-badge published">Featured</span> : <span className="adm-status-badge draft">Standard</span>}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-icon-btn" onClick={() => setModal(t.id)}><i className="ri-edit-line"></i></button>
                      <button className="adm-icon-btn danger" onClick={() => onDelete(t, 'testimonial')}><i className="ri-delete-bin-line"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="adm-pagination-bar">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {modal && <TestimonialModal initial={editItem} onClose={() => setModal(null)} onSave={save} />}
      <StatusModal isOpen={notifModal.isOpen} title={notifModal.title} message={notifModal.message} icon={notifModal.icon} iconColor={notifModal.iconColor} iconBg={notifModal.iconBg} onConfirm={notifModal.onConfirm} onCancel={closeNotif} confirmLabel="OK" cancelLabel="Close" />
    </div>
  );
}

const AdminDashboard = ({ onNavigate, onLogout, user, onRefreshUser }) => {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('adminActiveSection') || 'overview';
  });
  const [showSyncDocs, setShowSyncDocs] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminActiveSection', activeSection);
  }, [activeSection]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [exploreGaps, setExploreGaps] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    learners: 0,
    courses: 0,
    resources: 0,
    certs: 0,
    recentActivities: [],
    chartData: []
  });
  const [recentActivitiesPage, setRecentActivitiesPage] = useState(1);
  const itemsPerRecentPage = 5;

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
      // Let [crs, res, bks, sparc, prl, usr, wks, progress, mods, inst] = await Promise.all([
      let [crs, res, bks, sparc, prl, usr, wks, progress, mods, inst, gapsRes, testRes] = await Promise.all([
        supabase.from('courses').select('*, chapters(*, modules(*))').order('created_at', { ascending: false }).then(r => r, e => ({ error: e })),
        supabase.from('library_resources').select('*').order('created_at', { ascending: false }).then(r => r, e => ({ error: e })),
        supabase.from('books').select('*').order('created_at', { ascending: false }).then(r => r, e => ({ error: e })),
        supabase.from('sparc_resources').select('*').then(r => r, e => ({ error: e })),
        supabase.from('perl_resource').select('*').then(r => r, e => ({ error: e })),
        supabase.from('profiles').select('*').then(r => r, e => ({ error: e })),
        supabase.from('workshops').select('*, workshop_registrations(*)').then(r => r, e => ({ error: e })),
        supabase.from('user_progress')
          .select('*, profiles(name), courses(title)')
          .eq('completed', true)
          .order('updated_at', { ascending: false })
          .limit(10).then(r => r, e => ({ error: e })),
        supabase.from('course_modules').select('*').then(r => r, e => ({ error: e })),
        supabase.from('instructors').select('*').then(r => r, e => ({ error: e })),
        supabase.from('explore_gaps').select('*').then(r => r, e => ({ error: e })),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }).then(r => r, e => ({ error: e }))
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
      if (sparc.error) console.error("SPARC Fetch Error:", sparc.error);
      if (prl.error) console.error("PERL Fetch Error:", prl.error);
      if (usr.error) console.error("Users Fetch Error:", usr.error);
      if (wks.error) console.error("Workshops Fetch Error:", wks.error);
      if (progress.error) console.error("Progress Fetch Error:", progress.error);
      if (inst.error) console.error("Instructors Fetch Error:", inst.error);
      if (inst.data) setInstructors(inst.data);


      // 2. Fetch ALL progress for counting and recent activity (Manual join fallback)
      const { data: allProgress, error: allProgErr } = await supabase
        .from('user_progress')
        .select('*')
        .order('created_at', { ascending: false });

      if (allProgErr) console.error("All Progress Fetch Error:", allProgErr);

      const learnerCounts = {};
      const userCourseCounts = {};
      (allProgress || []).forEach(p => {
        const cid = String(p.course_id);
        const uid = String(p.user_id);
        
        if (!learnerCounts[cid]) learnerCounts[cid] = new Set();
        learnerCounts[cid].add(uid);

        if (!userCourseCounts[uid]) userCourseCounts[uid] = new Set();
        userCourseCounts[uid].add(cid);
      });

      // 3. Map Course Data with Dynamic Learner Counts
      if (crs.data) {

        const mappedCourses = crs.data.map(c => ({
          ...c,
          learners: learnerCounts[String(c.id)]?.size || 0,
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

      // 4. Map Users, Resources, Workshops
      console.log("[GRH DEBUG] Raw Counts - Library:", res.data?.length, "SPARC:", sparc.data?.length, "PERL:", prl.data?.length, "Books:", bks.data?.length);
      const allResources = [
        ...(res.data || []).map(r => ({ ...r, fileUrl: r.file_url, table_name: 'library_resources' })),
        ...(sparc.data || []).map(p => ({ 
          ...p, 
          fileUrl: p.preview_url || p.download_url || p.file_url,
          programme: 'SPARC',
          category: 'Governance',
          table_name: 'sparc_resources'
        })),
        ...(prl.data || []).map(p => ({ 
          ...p, 
          fileUrl: p.preview_url || p.download_url || p.file_url,
          programme: 'PERL',
          category: 'Governance',
          table_name: 'perl_resource'
        }))
      ];
      console.log("[GRH DEBUG] allResources combined length:", allResources.length);
      setResources(allResources);
      if (bks.data) setBooks(bks.data.map(b => ({ ...b, fileUrl: b.file_url, imageUrl: b.image_url })));
      if (usr.data) setUsers(usr.data.map(u => ({ 
        ...u, 
        email: u.email || 'No email record', 
        courses: userCourseCounts[String(u.id)]?.size || 0, 
        joined: u.joined_at ? new Date(u.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2025', 
        status: u.status || 'Active' 
      })));
      if (wks.data) setWorkshops(wks.data.map(w => ({ ...w, registrations: w.workshop_registrations })));

      // 5. Calculate Stats and Recent Activities
      const profilesMap = (usr.data || []).reduce((acc, p) => {
        acc[String(p.id)] = enrichProfileForActivity(p);
        return acc;
      }, {});
      
      if (testRes.error) console.error("Testimonials Fetch Error:", testRes.error);
      if (testRes.data) setTestimonials(testRes.data);

      if (gapsRes.error) console.error("Gaps Fetch Error:", gapsRes.error);
      if (gapsRes.data) {
        const mappedGaps = gapsRes.data.map(g => ({
          ...g,
          user: g.user_id ? (profilesMap[String(g.user_id)] || { name: 'Registered User', email: 'Unknown Email' }) : { name: 'Guest / Anonymous', email: 'N/A' }
        }));
        setExploreGaps(mappedGaps);
      }

      const coursesMap = (crs.data || []).reduce((acc, c) => ({ ...acc, [String(c.id)]: c }), {});
      
      // Calculate module counts per course
      const allModules = mods.data || crs.data?.flatMap(c => c.chapters?.flatMap(ch => ch.modules || []) || []) || [];
      const modulesMap = allModules.reduce((acc, m) => ({ ...acc, [String(m.id)]: m }), {});
      const courseModuleCounts = allModules.reduce((acc, m) => {
        acc[String(m.course_id)] = (acc[String(m.course_id)] || 0) + 1;
        return acc;
      }, {});

      // Group completed modules by user and course
      const completedProgressRecords = (allProgress || [])
        .filter(p => p.completed === true || p.completed === 'true' || p.completed === 't');

      const userCourseCompletions = completedProgressRecords
        .reduce((acc, p) => {
          const key = `${p.user_id}_${p.course_id}`;
          if (!acc[key]) acc[key] = { count: 0, updatedAt: p.updated_at || p.created_at };
          acc[key].count += 1;
          if (new Date(p.updated_at || p.created_at) > new Date(acc[key].updatedAt)) {
            acc[key].updatedAt = p.updated_at || p.created_at;
          }
          return acc;
        }, {});

      // Identify courses fully completed by users
      const trueCourseCompletions = Object.entries(userCourseCompletions)
        .filter(([key, data]) => {
          const [, courseId] = key.split('_');
          return data.count >= (courseModuleCounts[courseId] || 0) && (courseModuleCounts[courseId] || 0) > 0;
        })
        .map(([key, data]) => {
          const [userId, courseId] = key.split('_');
          return {
            id: `course_${userId}_${courseId}`,
            type: 'course',
            user_id: userId,
            course_id: courseId,
            updated_at: data.updatedAt,
            profiles: enrichProfileForActivity(profilesMap[userId]),
            courses: coursesMap[courseId] || { title: 'Governance Course' },
            statusLabel: 'Completed'
          };
        });

      const recentModuleActivities = completedProgressRecords.map(p => ({
        ...p,
        id: `module_${p.id}`,
        type: 'module',
        profiles: enrichProfileForActivity(profilesMap[String(p.user_id)]),
        courses: coursesMap[String(p.course_id)] || { title: 'Governance Course' },
        modules: modulesMap[String(p.module_id)] || { title: 'Lesson' },
        updated_at: p.updated_at || p.created_at,
        statusLabel: 'Completed'
      }));

      const signupActivities = (usr.data || [])
        .filter(u => (u.role || '').toLowerCase() !== 'admin')
        .map(u => ({
          id: `signup_${u.id}`,
          type: 'signup',
          user_id: u.id,
          profiles: enrichProfileForActivity(profilesMap[String(u.id)], { email: u.email }),
          updated_at: u.joined_at || u.created_at,
          statusLabel: 'New'
        }));

      const firstProgressByCourse = {};
      (allProgress || []).forEach(p => {
        if (!p.user_id || !p.course_id) return;
        const key = `${p.user_id}_${p.course_id}`;
        const ts = new Date(p.created_at || 0).getTime();
        const existing = firstProgressByCourse[key];
        if (!existing || ts < new Date(existing.created_at || 0).getTime()) {
          firstProgressByCourse[key] = p;
        }
      });

      const enrollmentActivities = Object.values(firstProgressByCourse).map(p => ({
        id: `enrollment_${p.user_id}_${p.course_id}`,
        type: 'enrollment',
        user_id: p.user_id,
        course_id: p.course_id,
        profiles: enrichProfileForActivity(profilesMap[String(p.user_id)]),
        courses: coursesMap[String(p.course_id)] || { title: 'Course' },
        updated_at: p.created_at,
        statusLabel: 'Enrolled'
      }));

      const workshopActivities = (wks.data || []).flatMap(workshop =>
        (workshop.workshop_registrations || []).map((reg, idx) => ({
          id: `workshop_${reg.id || `${reg.user_id}_${workshop.id}_${idx}`}`,
          type: 'workshop',
          user_id: reg.user_id,
          profiles: enrichProfileForActivity(profilesMap[String(reg.user_id)], { name: reg.name, email: reg.email }),
          workshops: { title: workshop.title },
          updated_at: reg.created_at || workshop.created_at,
          statusLabel: 'Registered'
        }))
      );

      const allRecentActivities = [
        ...signupActivities,
        ...enrollmentActivities,
        ...recentModuleActivities,
        ...trueCourseCompletions,
        ...workshopActivities
      ]
        .filter(act => getActivityTimestamp(act))
        .sort((a, b) => new Date(getActivityTimestamp(b)) - new Date(getActivityTimestamp(a)))
        .slice(0, 500);

      // Generate Chart Data
      const generateChartData = (usersList, resList, bksList, compList, crsList) => {
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            name: monthNames[d.getMonth()],
            monthId: `${d.getFullYear()}-${d.getMonth()}`,
            year: d.getFullYear(),
            month: d.getMonth(),
            newLearners: 0,
            learners: 0,
            resources: 0,
            certs: 0,
            courses: 0
          });
        }

        const addToBin = (dateStr, key) => {
          if (!dateStr) return;
          const d = new Date(dateStr);
          const bin = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
          if (bin) bin[key]++;
        };

        (usersList || []).forEach(u => addToBin(u.joined_at || u.created_at, 'newLearners'));
        (resList || []).forEach(r => addToBin(r.created_at, 'resources'));
        (bksList || []).forEach(b => addToBin(b.created_at, 'resources'));
        (compList || []).forEach(p => addToBin(p.updated_at, 'certs'));
        (crsList || []).forEach(c => addToBin(c.created_at, 'courses'));

        // Make learners cumulative
        const oldestChartMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        let cumulativeLearners = (usersList || []).filter(u => {
           const d = new Date(u.joined_at || u.created_at);
           return d < oldestChartMonth;
        }).length;

        months.forEach(m => {
           cumulativeLearners += m.newLearners;
           m.learners = cumulativeLearners;
        });

        return months;
      };

      // Course engagement — top 10 by enrollment
      const courseEngagement = Object.entries(learnerCounts)
        .map(([cid, learners]) => ({
          name: coursesMap[cid]?.title || `Course #${cid}`,
          learners: learners.size
        }))
        .sort((a, b) => b.learners - a.learners)
        .slice(0, 10);

      // Activity breakdown
      const activityTypeCounts = {};
      (allRecentActivities || []).forEach(a => {
        const t = a.type || 'other';
        activityTypeCounts[t] = (activityTypeCounts[t] || 0) + 1;
      });
      const activityLabels = { signup: 'Signups', enrollment: 'Enrollments', module: 'Lessons Done', course: 'Certifications', workshop: 'Workshops' };
      const activityBreakdown = Object.entries(activityTypeCounts).map(([key, value]) => ({
        name: activityLabels[key] || key,
        value
      }));

      // Geographic distribution
      const regionCounts = {};
      (usr.data || []).forEach(u => {
        const state = u.state || u.region || 'Unknown';
        if (state && state !== 'Unknown') {
          regionCounts[state] = (regionCounts[state] || 0) + 1;
        }
      });
      const regionData = Object.entries(regionCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);

      // Module completion distribution — fallback if no region data
      const userModuleCounts = {};
      (allProgress || []).forEach(p => {
        const uid = String(p.user_id);
        userModuleCounts[uid] = (userModuleCounts[uid] || 0) + 1;
      });
      const moduleDistBuckets = { '0': 0, '1-2': 0, '3-5': 0, '6-10': 0, '10+': 0 };
      const totalUsers = (usr.data || []).length;
      const usersWithProgress = Object.keys(userModuleCounts).length;
      moduleDistBuckets['0'] = totalUsers - usersWithProgress;
      Object.values(userModuleCounts).forEach(count => {
        if (count <= 2) moduleDistBuckets['1-2']++;
        else if (count <= 5) moduleDistBuckets['3-5']++;
        else if (count <= 10) moduleDistBuckets['6-10']++;
        else moduleDistBuckets['10+']++;
      });
      const moduleDistribution = Object.entries(moduleDistBuckets).map(([name, value]) => ({ name, value }));

      setStats({
        learners: (usr.data || []).length,
        courses: (crs.data || []).length,
        resources: (allResources || []).length + (bks.data || []).length,
        certs: trueCourseCompletions.length,
        recentActivities: allRecentActivities,
        chartData: generateChartData(usr.data, allResources, bks.data, trueCourseCompletions, crs.data),
        courseEngagement,
        activityBreakdown,
        regionData,
        moduleDistribution
      });
      console.log("[GRH DEBUG] Updated Stats - Resources:", (allResources || []).length + (bks.data || []).length);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataRef = useRef(fetchData);
  useEffect(() => { fetchDataRef.current = fetchData; });

  useEffect(() => {
    fetchDataRef.current();

    // Subscribe to real-time changes
    const coursesChannel = supabase
      .channel('admin-dashboard:courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        fetchDataRef.current();
      })
      .subscribe();

    const resourcesChannel = supabase
      .channel('admin-dashboard:library_resources')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'library_resources' }, () => {
        fetchDataRef.current();
      })
      .subscribe();

    const booksChannel = supabase
      .channel('admin-dashboard:books')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
        fetchDataRef.current();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-dashboard:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchDataRef.current();
      })
      .subscribe();

    const workshopsChannel = supabase
      .channel('admin-dashboard:workshops')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshops' }, () => {
        fetchDataRef.current();
      })
      .subscribe();

    const instructorsChannel = supabase
      .channel('admin-dashboard:instructors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'instructors' }, () => {
        console.log("[GRH] Real-time instructor change detected!");
        fetchDataRef.current();
      })
      .subscribe();

    const testimonialsChannel = supabase
      .channel('admin-dashboard:testimonials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => fetchDataRef.current())
      .subscribe();

    return () => {
      supabase.removeChannel(coursesChannel);
      supabase.removeChannel(resourcesChannel);
      supabase.removeChannel(booksChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(workshopsChannel);
      supabase.removeChannel(instructorsChannel);
      supabase.removeChannel(testimonialsChannel);
    };
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
    let table = item.table_name || '';
    if (!table) {
      if (type === 'course') table = 'courses';
      if (type === 'resource') table = 'library_resources';
      if (type === 'book') table = 'books';
      if (type === 'workshop') table = 'workshops';
      if (type === 'instructor') table = 'instructors';
      if (type === 'user') table = 'profiles';
      if (type === 'gap') table = 'explore_gaps';
      if (type === 'testimonial') table = 'testimonials';
    }

    console.log(`[Admin] Prepared delete for type: ${type}, table: ${table}, item id: ${item.id}`);

    const itemName = item.title || item.name || 'this item';
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${type}: "${itemName}"? This will remove the record permanently and this action cannot be undone.`,
      onConfirm: async () => {
        try {
          if (type === 'user') {
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`;
            
            // We need the current session to authenticate the Edge Function call
            const { data: { session } } = await supabase.auth.getSession();
            
            const res = await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
              },
              body: JSON.stringify({ userId: item.id })
            });
            
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error || 'Failed to delete user');
            }
          } else if (table) {
            const { error } = await supabase.from(table).delete().eq('id', item.id);
            if (error) throw error;
          }

          setStatusModal(prev => ({ ...prev, isOpen: false }));
          fetchData(); // Refresh list immediately
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
        { id: 'gaps',       icon: 'ri-question-fill',     label: 'Explore Gaps', badge: exploreGaps.filter(g => !g.resolved).length },
        { id: 'quizzes',    icon: 'ri-file-list-3-fill',  label: 'Quizzes & Assessments' },
      ],
    },
    {
      label: 'People',
      links: [
        { id: 'users',      icon: 'ri-team-fill',         label: 'Users', badge: users.length },
        { id: 'instructors',icon: 'ri-user-star-fill',    label: 'Instructors' },
        { id: 'testimonials', icon: 'ri-quote-text',      label: 'Testimonials', badge: testimonials.length },
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
          <div className="adm-sidebar-logo" onClick={() => onNavigate('welcome')} style={{ cursor: 'pointer' }}>
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
            <button className="adm-nav-link adm-exit-portal" onClick={() => onNavigate('welcome')}><i className="ri-arrow-left-line"></i> Exit Portal</button>
            <button className="adm-nav-link adm-logout-admin" onClick={confirmLogout}><i className="ri-logout-box-line"></i> Logout Admin</button>
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
                recentActivitiesPage={recentActivitiesPage}
                setRecentActivitiesPage={setRecentActivitiesPage}
                itemsPerRecentPage={itemsPerRecentPage}
              />}
            {activeSection === 'courses'    && <CoursesPanel courses={courses} setCourses={setCourses} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'books'      && <BooksPanel books={books} setBooks={setBooks} onDelete={confirmDelete} fetchData={fetchData} onSync={() => setShowSyncDocs(true)} />}
            {activeSection === 'resources'  && <ResourcesPanel resources={resources} setResources={setResources} onDelete={confirmDelete} fetchData={fetchData} onSync={() => setShowSyncDocs(true)} />}
            {activeSection === 'workshops'  && <WorkshopsPanel workshops={workshops} setWorkshops={setWorkshops} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'users'      && <UsersPanel users={users} setUsers={setUsers} onDelete={confirmDelete} loggedInUser={user} fetchData={fetchData} />}
            {activeSection === 'analytics'  && <AnalyticsPanel stats={stats} />}
            {activeSection === 'quizzes'    && <AdminQuizzesPanel />}
            {activeSection === 'instructors'&& <AdminInstructorsPanel instructors={instructors} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'testimonials'&& <TestimonialsPanel testimonials={testimonials} setTestimonials={setTestimonials} onDelete={confirmDelete} fetchData={fetchData} />}
            {activeSection === 'settings'   && <AdminSettingsPanel user={user} onRefreshUser={onRefreshUser} />}
            {activeSection === 'gaps'       && (
              <LibraryGapsPanel 
                gaps={exploreGaps} 
                onDelete={confirmDelete}
                onResolve={async (id) => {
                  const { error } = await supabase.from('explore_gaps').update({ resolved: true }).eq('id', id);
                  if (!error) fetchData();
                }}
              />
            )}
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

      {/* Sync Instructions Tooltip/Modal */}
      <SyncDocsModal 
        isOpen={showSyncDocs} 
        onClose={() => setShowSyncDocs(false)}
      />
    </>
  );
};

function SyncDocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal animate-up" style={{ maxWidth: 600 }}>
        <header className="adm-modal-header">
          <h3>Google Drive Sync Setup</h3>
          <button className="adm-close-btn" onClick={onClose}><i className="ri-close-line"></i></button>
        </header>
        <div className="adm-modal-body">
          <div className="sync-setup-steps">
            <div className="setup-step">
              <div className="step-num">1</div>
              <div className="step-content">
                <strong>Enable Drive API</strong>
                <p>Go to Google Cloud Console and enable the Google Drive API for your project.</p>
              </div>
            </div>
            <div className="setup-step">
              <div className="step-num">2</div>
              <div className="step-content">
                <strong>Create Service Account</strong>
                <p>Create a Service Account, download the JSON key, and rename it to <code>service-account.json</code> in the <code>scripts/</code> folder.</p>
              </div>
            </div>
            <div className="setup-step">
              <div className="step-num">3</div>
              <div className="step-content">
                <strong>Share Folder</strong>
                <p>Share your Google Drive folder with the Service Account email address.</p>
              </div>
            </div>
            <div className="setup-step">
              <div className="step-num">4</div>
              <div className="step-content">
                <strong>Run Script</strong>
                <p>Run <code>node scripts/sync_drive.js</code> to sync all documents to Supabase.</p>
              </div>
            </div>
          </div>
        </div>
        <footer className="adm-modal-footer">
          <button className="special-button" onClick={onClose}>Got it!</button>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;
