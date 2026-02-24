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

const CoursePlayer = ({ onNavigate }) => {
  const [activeLesson, setActiveLesson] = useState(COURSE_CONTENT[3]);

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
           <Button variant="outline" size="sm"><i className="ri-question-line"></i> Help</Button>
           <Button variant="primary" size="sm">Mark as Complete</Button>
        </div>
      </header>

      <div className="player-main">
        <div className="player-content-area">
          <div className="video-viewport glass">
            <div className="video-placeholder">
              <i className="ri-play-circle-line"></i>
              <p>Lesson {activeLesson.id}: {activeLesson.title}</p>
            </div>
          </div>
          <div className="lesson-info">
            <div className="lesson-tabs">
              <button className="active">Overview</button>
              <button>Resources</button>
              <button>Notes</button>
              <button>Discussions</button>
            </div>
            <div className="lesson-detail-content">
              <h2>{activeLesson.title}</h2>
              <p>In this lesson, we explore the core principles of public governance and how decentralisation facilitates transparency at the local government level. We will examine case studies from emerging economies and discuss structural reforms.</p>
              
              <div className="instructor-card-sm glass">
                 <div className="inst-avatar"><i className="ri-user-star-line"></i></div>
                 <div>
                    <strong>Dr. Sarah Chen</strong>
                    <span>Governance Specialist, World Bank</span>
                 </div>
              </div>
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
