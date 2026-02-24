import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../components/ui/Button';
import './StudentDashboard.css';

const MY_COURSES = [
  { id: 1, title: "Foundations of Public Governance", progress: 78, lastLesson: "Anti-Corruption Mechanisms", nextLesson: "Decentralisation", icon: "ri-government-line", completedSections: 9, totalSections: 12, certificate: false },
  { id: 2, title: "Corporate Governance Essentials", progress: 45, lastLesson: "Risk Management", nextLesson: "Internal Controls", icon: "ri-bank-card-line", completedSections: 6, totalSections: 14, certificate: false },
  { id: 3, title: "Anti-Corruption & Integrity Systems", progress: 100, nextLesson: null, icon: "ri-scales-3-line", completedSections: 12, totalSections: 12, certificate: true },
];

const ACTIVITY_DATA = [
  { day: 'Mon', mins: 45 },
  { day: 'Tue', mins: 30 },
  { day: 'Wed', mins: 60 },
  { day: 'Thu', mins: 15 },
  { day: 'Fri', mins: 90 },
  { day: 'Sat', mins: 40 },
  { day: 'Sun', mins: 20 },
];

const ACHIEVEMENTS = [
  { i: "ri-award-line", t: "First Course", d: "Enrolled in your first course", e: true },
  { i: "ri-fire-line", t: "7-Day Streak", d: "Studied 7 days in a row", e: true },
  { i: "ri-flashlight-line", t: "Quick Learner", d: "Completed 3 lessons in one day", e: true },
  { i: "ri-terminal-window-line", t: "Certified!", d: "Earned your first certificate", e: true },
];

const StudentDashboard = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState("courses");
  const name = user?.name || "Governance Learner";
  const completedCount = MY_COURSES.filter(c => c.progress === 100).length;
  const avgProg = Math.round(MY_COURSES.reduce((s, c) => s + c.progress, 0) / MY_COURSES.length);

  return (
    <div className="student-dash section-padding">
      <div className="container">
        <header className="student-header animate-in">
          <div className="header-left">
            <div className="student-avatar-lg">{name ? name[0] : 'U'}</div>
            <div className="welcome-text">
              <span className="apple-label">Learner Profile</span>
              <h1 className="apple-title-sm">Hello, {name}</h1>
              <p className="streak"><i className="ri-fire-line"></i> 5-day learning streak</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="h-stat-card glass"><span className="h-stat-num">{MY_COURSES.length}</span><span className="h-stat-label">Enrolled</span></div>
            <div className="h-stat-card glass"><span className="h-stat-num">{completedCount}</span><span className="h-stat-label">Completed</span></div>
            <div className="h-stat-card glass"><span className="h-stat-num">{avgProg}%</span><span className="h-stat-label">Avg Progress</span></div>
          </div>
        </header>

        <div className="dash-main-grid">
            <div className="dash-left-col">
                <div className="dash-tabs">
                    {[{ id: "courses", l: "My Courses" }, { id: "certificates", l: "Certificates" }, { id: "achievements", l: "Achievements" }].map(t => (
                        <button key={t.id} className={`dash-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.l}</button>
                    ))}
                </div>

                <div className="dash-content">
                    {activeTab === "courses" && (
                        <div className="student-courses-grid">
                        {MY_COURSES.map(c => (
                            <div key={c.id} className="student-course-card">
                            <div className="s-course-thumb">
                                <i className={`${c.icon} s-course-icon`}></i>
                                {c.certificate && <span className="s-cert-badge"><i className="ri-award-line"></i> Certified</span>}
                            </div>
                            <div className="s-course-body">
                                <h3>{c.title}</h3>
                                <div className="s-course-progress">
                                <div className="s-progress-bar"><div className="s-progress-fill" style={{ width: `${c.progress}%` }} /></div>
                                <div className="s-progress-text">{c.progress}% · {c.completedSections}/{c.totalSections} sections</div>
                                </div>
                                <div className="s-course-actions">
                                <Button 
                                    variant={c.progress < 100 ? "primary" : "outline"} 
                                    size="sm"
                                    onClick={() => onNavigate('learn-player')}
                                >
                                    {c.progress < 100 ? "Continue" : "Review"}
                                </Button>
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}

                    {activeTab === "certificates" && (
                        <div className="certificates-grid">
                        {MY_COURSES.filter(c => c.certificate).map(c => (
                            <div key={c.id} className="cert-card-v2 glass animate-in">
                                <i className="ri-medal-line cert-icon"></i>
                                <h4>{c.title}</h4>
                                <p>Issued March 2025</p>
                                <Button variant="outline" size="sm" fullWidth>View PDF</Button>
                            </div>
                        ))}
                        </div>
                    )}

                    {activeTab === "achievements" && (
                        <div className="achievements-grid-v2">
                        {ACHIEVEMENTS.map(a => (
                            <div key={a.t} className="achievement-item-v2 earned">
                            <i className={a.i}></i>
                            <div>
                                <h4>{a.t}</h4>
                                <p>{a.d}</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </div>

            <aside className="dash-right-col">
                <div className="apple-card dash-activity-card">
                    <h4>Learning Activity</h4>
                    <p className="apple-label">Minutes per day</p>
                    <div className="dash-activity-chart">
                        <ResponsiveContainer width="100%" height={150}>
                            <AreaChart data={ACTIVITY_DATA}>
                                <Area type="monotone" dataKey="mins" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="activity-footer">
                        <span>Total this week: <strong>300m</strong></span>
                    </div>
                </div>

                <div className="apple-card dash-cta-card">
                    <i className="ri-lightbulb-line"></i>
                    <h4>New Resource</h4>
                    <p>Check out the latest Governance Report on Digital Ethics.</p>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('research')}>Go to Library ›</Button>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
