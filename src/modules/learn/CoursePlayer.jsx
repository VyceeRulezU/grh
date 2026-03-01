import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import './CoursePlayer.css';

const COURSE_CONTENT = [
  { id: 1, title: "Introduction to Public Governance", duration: "10:24", type: "video", completed: true },
  { id: 2, title: "Structural Frameworks & Policy", duration: "15:45", type: "video", completed: true },
  { id: 3, title: "Anti-Corruption Mechanisms", duration: "12:10", type: "video", completed: true },
  { id: 4, title: "Decentralisation & Local Gov", duration: "18:30", type: "video", completed: false },
  { id: 5, title: "Module 1 Quiz", duration: "5 questions", type: "quiz", completed: false },
  { id: 6, title: "Case Study: Transparency in Procurement", duration: "PDF", type: "reading", completed: false },
];

const TAB_CONTENT = {
  Overview: (lesson) => (
    <div className="tab-panel">
      <h2>{lesson.title}</h2>
      <p>In this lesson, we explore the core principles of public governance and how decentralisation facilitates transparency at the local government level. We will examine case studies from emerging economies and discuss structural reforms.</p>
      <div className="instructor-card-sm glass">
        <div className="inst-avatar"><i className="ri-user-star-line"></i></div>
        <div>
          <strong>Dr. Sarah Chen</strong>
          <span>Governance Specialist, World Bank</span>
        </div>
      </div>
    </div>
  ),
  Resources: () => (
    <div className="tab-panel">
      <h2>Lesson Resources</h2>
      <ul className="resource-list-tab">
        <li><i className="ri-file-pdf-2-line"></i> Governance Framework PDF</li>
        <li><i className="ri-article-line"></i> Case Study: Rwanda Decentralisation</li>
        <li><i className="ri-link"></i> OECD Governance Toolkit</li>
      </ul>
    </div>
  ),
  Notes: () => (
    <div className="tab-panel">
      <h2>My Notes</h2>
      <textarea className="notes-area" placeholder="Type your notes here..."></textarea>
    </div>
  ),
  Discussions: () => (
    <div className="tab-panel">
      <h2>Discussion</h2>
      <p className="empty-hint">No discussions yet. Start a thread!</p>
      <button className="special-button" style={{ marginTop: '1rem', width: 'fit-content', padding: '0.75rem 1.5rem' }}>Start Discussion</button>
    </div>
  ),
};

const CoursePlayer = ({ onNavigate }) => {
  const [activeLesson, setActiveLesson] = useState(COURSE_CONTENT[3]);
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="course-player">
      <header className="player-header">
        <div className="player-back" onClick={() => onNavigate('student')}>
          <i className="ri-arrow-left-line"></i>
          <span>Back to Dashboard</span>
        </div>
        <div className="player-course-title">
          <h3>Foundations of Public Governance</h3>
          <div className="player-progress-pill">78% Complete</div>
        </div>
        <div className="player-actions">
           <Button className="btn-outline" size="sm"><i className="ri-question-line"></i> Help</Button>
           <Button className="special-button" size="sm">Mark as Complete</Button>
        </div>
      </header>

      <div className="player-main">
        <div className="player-content-area">
          {/* Fixed-size video — never shrinks */}
          <div className="video-wrapper">
            <div className="video-viewport">
              <div className="yt-placeholder">
                <img
                  src={`https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`}
                  alt="Video thumbnail"
                  className="yt-thumbnail"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="yt-overlay">
                  <div className="yt-play-btn">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </div>
                  <div className="yt-meta">
                    <p className="yt-lesson-label">Lesson {activeLesson.id} — {activeLesson.type.toUpperCase()}</p>
                    <p className="yt-lesson-title">{activeLesson.title}</p>
                  </div>
                  <div className="yt-admin-note">
                    <span className="material-symbols-outlined" style={{fontSize: '1rem', opacity: 0.7}}>info</span>
                    Video will be assigned by administrator
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable lesson info below video */}
          <div className="lesson-info">
            <div className="lesson-tabs">
              {Object.keys(TAB_CONTENT).map(tab => (
                <button
                  key={tab}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="lesson-detail-content">
              {TAB_CONTENT[activeTab](activeLesson)}
            </div>
          </div>
        </div>

        <aside className="player-sidebar">
          <div className="sidebar-head">
            <h4>Course Content</h4>
            <span>6 Lessons</span>
          </div>
          <div className="lesson-list">
            {COURSE_CONTENT.map((lesson, i) => (
              <div
                key={lesson.id}
                className={`lesson-item ${activeLesson.id === lesson.id ? 'active' : ''} ${lesson.completed ? 'completed' : ''}`}
                onClick={() => setActiveLesson(lesson)}
              >
                <div className="lesson-status">
                  {lesson.completed ? <i className="ri-checkbox-circle-fill"></i> : <i className="ri-play-line"></i>}
                </div>
                <div className="lesson-text">
                  <span className="lesson-label">Lesson {i + 1}</span>
                  <p className="lesson-title">{lesson.title}</p>
                  <span className="lesson-meta">{lesson.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;
