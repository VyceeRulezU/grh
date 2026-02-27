import React, { useState } from 'react';
import { COURSES } from '../../data/legacyData';
import './LearnLandingPage.css';

const LearnLandingPage = ({ onNavigate, user }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All Levels");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = COURSES.filter(c => {
    const ms = c.title.toLowerCase().includes(search.toLowerCase()) || 
               c.description.toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || c.category === category;
    const ml = level === "All Levels" || c.level === level;
    const mt = activeTab === "all" || 
               (activeTab === "trending" && c.trending) || 
               (activeTab === "featured" && c.featured) || 
               (activeTab === "inprogress" && c.progress > 0);
    return ms && mc && ml && mt;
  });

  return (
    <div className="page-wrapper learn-page">
      <div className="learn-hero">
        <div className="container">
          <div className="learn-hero-inner">
            <div>
              <div className="section-label">📚 E-Learning Platform</div>
              <h1 className="section-title text-white">Advance your governance expertise today</h1>
              <p className="hero-subline">
                {COURSES.length} expert-led courses. Learn at your own pace, earn verifiable certificates.
              </p>
              <div className="learn-hero-search">
                <span className="search-icon">🔍</span>
                <input 
                  placeholder="Search courses, topics, instructors..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">12K+</span>
                <span className="stat-label">Learners</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container learn-content">
        <div className="tabs">
          {[
            {id:"all",l:"All Courses"},
            {id:"trending",l:"🔥 Trending"},
            {id:"featured",l:"⭐ Featured"},
            {id:"inprogress",l:"▶ In Progress"}
          ].map(t => (
            <button 
              key={t.id} 
              className={`tab-btn ${activeTab === t.id ? "active" : ""}`} 
              onClick={() => setActiveTab(t.id)}
            >
              {t.l}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <select className="select-field" value={category} onChange={e => setCategory(e.target.value)}>
            {[
              "All", "Governance Basics", "Corporate", "Finance", 
              "Integrity", "Democracy", "Digital"
            ].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="select-field" value={level} onChange={e => setLevel(e.target.value)}>
            {["All Levels", "Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
          </select>
          <span className="results-count">{filtered.length} courses</span>
        </div>

        <div className="courses-grid">
          {filtered.map((course, i) => (
            <div 
              key={course.id} 
              className="course-card animate-up" 
              style={{ animationDelay: `${i * 0.06}s` }} 
              onClick={() => onNavigate("learn-player", course)}
            >
              <div className="course-thumb">
                <span className="course-emoji">{course.thumbnail}</span>
                {course.trending && <span className="course-badge badge-yellow">🔥 Trending</span>}
                {course.featured && !course.trending && <span className="course-badge badge-green">⭐ Featured</span>}
              </div>
              <div className="course-body">
                <div className="course-meta-top">
                  <span className="badge badge-green">{course.category}</span>
                  <span className="badge badge-gray">{course.level}</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <p className="course-instructor">By {course.instructor}</p>
                {course.progress > 0 && (
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span>{course.progress}% complete</span>
                  </div>
                )}
                <div className="course-footer">
                  <div className="course-rating">
                    <span className="stars">{"★".repeat(Math.floor(course.rating))}</span>
                    <span className="rating-num">{course.rating}</span>
                    <span className="rating-count">({course.students.toLocaleString()})</span>
                  </div>
                  <div className="course-info">
                    <span>⏱ {course.duration}</span>
                    <span>📖 {course.sections?.length || 0} sections</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No courses found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}

        <div className="more-courses-btn">
          <button className="btn-outline-large" onClick={() => onNavigate('learn-discovery')}>
            Explore More Courses →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnLandingPage;
