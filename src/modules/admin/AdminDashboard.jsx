import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Button from '../../components/ui/Button';
import './AdminDashboard.css';

const MOCK_STATS = [
  { name: 'Jan', users: 400, courses: 240, revenue: 2400 },
  { name: 'Feb', users: 300, courses: 139, revenue: 2210 },
  { name: 'Mar', users: 200, courses: 980, revenue: 2290 },
  { name: 'Apr', users: 278, courses: 390, revenue: 2000 },
  { name: 'May', users: 189, courses: 480, revenue: 2181 },
  { name: 'Jun', users: 239, courses: 380, revenue: 2500 },
];

const AdminDashboard = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Governance',
    price: '',
    instructor: '',
    description: '',
    modules: [{ title: '', videoLink: '' }]
  });

  const addModule = () => {
    setNewCourse({
      ...newCourse,
      modules: [...newCourse.modules, { title: '', videoLink: '' }]
    });
  };

  const updateModule = (index, field, value) => {
    const updatedModules = [...newCourse.modules];
    updatedModules[index][field] = value;
    setNewCourse({ ...newCourse, modules: updatedModules });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminEmail && adminPass) setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-wrap section-padding glass">
        <div className="admin-login-card animate-up">
           <div className="apple-label">Secure Access</div>
           <h2>Admin Shield Login</h2>
           <p>Authorized access only. Enter your institutional credentials.</p>
           <form onSubmit={handleLogin} className="admin-login-form">
              <input 
                type="email" 
                placeholder="admin@govhub.org" 
                required 
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
              />
              <Button variant="primary" fullWidth>Unlock Dashboard</Button>
           </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dash section-padding">
      <div className="container">
        <header className="admin-header">
          <div onClick={() => onNavigate('welcome')} style={{ cursor: 'pointer' }}>
            <div className="apple-label">Institutional Control</div>
            <h1 className="apple-title-sm">Admin Shield Portal</h1>
          </div>
          <div className="admin-actions">
            <Button variant="outline" size="sm"><i className="ri-settings-3-line"></i> Settings</Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}><i className="ri-add-line"></i> Create Course</Button>
          </div>
        </header>

        <div className="admin-tabs">
          {['overview', 'users', 'courses', 'analytics'].map(tab => (
            <button 
              key={tab} 
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="admin-overview animate-in">
            <div className="admin-stats-grid">
              <div className="apple-card admin-stat-card">
                <span>Total Learners</span>
                <h3>12,450</h3>
                <div className="stat-delta positive">+12% from last month</div>
              </div>
              <div className="apple-card admin-stat-card">
                <span>Active Courses</span>
                <h3>142</h3>
                <div className="stat-delta">Stable</div>
              </div>
              <div className="apple-card admin-stat-card">
                <span>Total Certifications</span>
                <h3>3,120</h3>
                <div className="stat-delta positive">+5% increase</div>
              </div>
              <div className="apple-card admin-stat-card">
                <span>Hub Revenue</span>
                <h3>₦42.8M</h3>
                <div className="stat-delta positive">+18% growth</div>
              </div>
            </div>

            <div className="admin-charts-grid">
              <div className="apple-card admin-chart-card">
                <h4>User Growth Analysis</h4>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={MOCK_STATS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="apple-card admin-chart-card">
                <h4>Course Popularity</h4>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={MOCK_STATS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Bar dataKey="courses" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-table-view animate-in">
             <div className="apple-card">
                <table className="admin-table">
                   <thead>
                      <tr>
                         <th>User</th>
                         <th>Email</th>
                         <th>Role</th>
                         <th>Status</th>
                         <th>Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {['Sarah Chen', 'Marcus Thorne', 'Elena Rossi'].map(u => (
                         <tr key={u}>
                            <td>{u}</td>
                            <td>{u.toLowerCase().replace(' ', '.')}@gov.org</td>
                            <td>Specialist</td>
                            <td><span className="status-badge active">Active</span></td>
                            <td><Button variant="ghost" size="sm">Edit</Button></td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'courses' && (
           <div className="admin-grid-view animate-in">
              <div className="admin-courses-grid">
                 {[1, 2, 3].map(c => (
                    <div key={c} className="apple-card admin-course-mini">
                       <div className="mini-thumb">🏛️</div>
                       <div className="mini-info">
                          <h4>Course Title {c}</h4>
                          <span>120 Students · Active</span>
                       </div>
                       <Button variant="outline" size="sm">Manage</Button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'analytics' && (
           <div className="admin-analytics-view animate-in">
              <div className="apple-card analytics-large">
                 <h4>Global Engagement Heatmap</h4>
                 <div style={{ height: '300px', background: '#f5f5f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ri-map-pin-user-line" style={{ fontSize: '48px', opacity: 0.2 }}></i>
                 </div>
              </div>
           </div>
        )}
      </div>

      {showCreateModal && (
        <div className="admin-modal-overlay">
           <div className="admin-modal admin-modal-lg animate-up">
              <header className="modal-header">
                 <h3>Construct New Course</h3>
                 <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
              </header>
              <form className="admin-form-scroll" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false); }}>
                 <div className="form-row">
                    <div className="form-group flex-2">
                       <label>Course Title</label>
                       <input 
                         type="text" 
                         placeholder="e.g., Advanced Policy Analysis" 
                         required 
                         value={newCourse.title}
                         onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                       />
                    </div>
                    <div className="form-group flex-1">
                       <label>Instructor Name</label>
                       <input 
                         type="text" 
                         placeholder="Dr. Smith" 
                         required 
                         value={newCourse.instructor}
                         onChange={e => setNewCourse({...newCourse, instructor: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="form-row">
                    <div className="form-group">
                       <label>Category</label>
                       <select 
                         value={newCourse.category}
                         onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                       >
                          <option>Governance</option>
                          <option>Finance</option>
                          <option>Ethics</option>
                          <option>Leadership</option>
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Price (₦)</label>
                       <input 
                         type="number" 
                         placeholder="25000" 
                         value={newCourse.price}
                         onChange={e => setNewCourse({...newCourse, price: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="form-group">
                    <label>Course Description</label>
                    <textarea 
                      placeholder="Deep dive into governance frameworks..." 
                      rows="3"
                      value={newCourse.description}
                      onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                    ></textarea>
                 </div>

                 <div className="modules-section">
                    <div className="section-subtitle">
                       <h4>Course Modules</h4>
                       <Button type="button" variant="outline" size="sm" onClick={addModule}>+ Add Module</Button>
                    </div>
                    <div className="modules-list">
                       {newCourse.modules.map((mod, idx) => (
                          <div key={idx} className="module-item-form">
                             <div className="module-num">{idx + 1}</div>
                             <div className="module-fields">
                                <input 
                                  type="text" 
                                  placeholder="Module Title" 
                                  value={mod.title}
                                  onChange={e => updateModule(idx, 'title', e.target.value)}
                                />
                                <input 
                                  type="url" 
                                  placeholder="Video Link (YouTube/Vimeo)" 
                                  value={mod.videoLink}
                                  onChange={e => updateModule(idx, 'videoLink', e.target.value)}
                                />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="form-actions">
                    <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button type="submit" variant="primary">Publish to Library</Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
