import React, { useState } from 'react';
import { COURSES, MENTORS, TESTIMONIALS } from '../../data/legacyData';
import CtaSection from '../../components/ui/CtaSection';
import ModernDropdown from '../../components/ui/ModernDropdown';
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
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-container">
          <div className="hero-inner">
            <div className="hero-left-container">
              <div className="hero-chip">
                <div className="dot">
                  <img src="/assets/color-dots-[1.0].svg" alt="dot" />
                </div>
                <p className="chip-text">Structured Learning Paths</p>
              </div>

              <h1 className="hero-title" id="hero-heading">
                Courses Built for <br />
                <span className="green-text">Governance Excellence</span>
              </h1>

              <p className="hero-summary">
                Expert-led modules on Public Financial Management, anti-corruption frameworks, electoral systems, and institutional governance — all in one place.
              </p>

              <div className="hero-cta-row">
                <button className="special-button">
                  Start Learning
                  <span className="material-symbols-outlined">arrow_outward</span>
                </button>
                <a href="#courses-section" className="btn-outline">Browse Courses</a>
              </div>
            </div>

            <div className="hero-right-container">
              <div className="social-proof" aria-label="Social proof: 1500+ enthusiasts">
                <div className="avatar-stack" aria-hidden="true">
                  <img src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80" alt="" width="44" height="44" loading="lazy" />
                  <img src="https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80" alt="" width="44" height="44" loading="lazy" />
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.25&w=64&h=64&q=80" alt="" width="44" height="44" loading="lazy" />
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80" alt="" width="44" height="44" loading="lazy" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=64&h=64&q=80" alt="" width="44" height="44" loading="lazy" />
                </div>
                <div className="social-proof-text">
                  <span className="rating-score">Join 1500+ enthusiasts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ──────────────────────────────────────────────── */}
      <div className="trusted-by">
        <p>Trusted by leading institutions worldwide</p>
        <div className="trusted-by-carousel">
          <div className="logo-track">
            {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((id, i) => (
              <img 
                key={i} 
                src="/assets/grh-logo-v2.svg" 
                alt={`Institution partner ${id}`} 
                className="trusted-by-logo" 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container learn-content" id="courses-section">
        <div className="course-tabs">
          {[
            {id:"all",l:"All Courses"},
            {id:"trending",l:"Trending"},
            {id:"featured",l:"Featured"},
            {id:"inprogress",l:"In Progress"}
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
          <ModernDropdown 
            options={["All", "Governance Basics", "Corporate", "Finance", "Integrity", "Democracy", "Digital"]}
            value={category}
            onChange={setCategory}
            label="Category"
          />
          <ModernDropdown 
            options={["All Levels", "Beginner", "Intermediate", "Advanced"]}
            value={level}
            onChange={setLevel}
            label="Level"
          />
          <span className="results-count">{filtered.length} courses loaded</span>
        </div>

        <div className="courses-grid">
          {filtered.map((course, i) => (
            <article 
              key={course.id} 
              className="course-card animate-up" 
              style={{ animationDelay: `${i * 0.06}s` }} 
              onClick={() => onNavigate("learn-player", course)}
            >
              <figure className="course-img">
                <img 
                   src={`https://images.unsplash.com/photo-${i === 0 ? '1529539795054-3c162aab037a' : i === 1 ? '1454165804606-c3d57bc86b40' : i === 2 ? '1554224155-6726b3ff858f' : i === 3 ? '1589829545856-d10d557cf95f' : i === 4 ? '1540910419892-4a36d2c3266c' : '1450101499163-c8848c66ca85'}?auto=format&fit=crop&w=600&q=80`} 
                   alt={course.title} 
                   loading="lazy" 
                />
                {course.trending && <figcaption className="course-badge">Bestseller</figcaption>}
                {course.featured && !course.trending && <figcaption className="course-badge course-badge--new">Featured</figcaption>}
              </figure>
              <div className="course-body">
                <span className="course-cat">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <footer className="course-footer">
                  <div className="course-meta">
                    <span>⏱ {course.duration}</span>
                    <span>👤 {course.students.toLocaleString()} enrolled</span>
                  </div>
                  <div className="course-price">
                    <span className="price">Free</span>
                  </div>
                </footer>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No courses found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}

        {/* Mentors Section */}
        <section className="mentors-section" aria-labelledby="mentors-heading">
          <header className="section-header">
            <div>
              <p className="section-eyebrow">Expert Instructors</p>
              <h2 id="mentors-heading">Learn from Governance Experts</h2>
            </div>
            <button className="btn--outline btn" onClick={() => {}}>Meet All Instructors →</button>
          </header>
          
          <div className="mentors-grid-wrapper">
            <button 
              className="slider-btn prev" 
              onClick={() => {
                const el = document.getElementById('mentors-slider');
                el.scrollBy({ left: -320, behavior: 'smooth' });
              }}
              aria-label="Previous experts"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="mentors-grid" id="mentors-slider">
              {MENTORS.map((mentor, i) => (
                <div key={mentor.id} className="mentor-card animate-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <img src={mentor.image} alt={mentor.name} loading="lazy" />
                  <h3>{mentor.name}</h3>
                  <p>{mentor.role}</p>
                  <span className="mentor-tag">{mentor.category}</span>
                </div>
              ))}
            </div>

            <button 
              className="slider-btn next" 
              onClick={() => {
                const el = document.getElementById('mentors-slider');
                el.scrollBy({ left: 320, behavior: 'smooth' });
              }}
              aria-label="Next experts"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>

      </div>

      {/* Testimonials Section */}
        <section className="testimonials-section" aria-labelledby="testimonials-heading">

          <div className="container learn-content" id="courses-section">
          
            <header className="section-header section-header--centered">
              <div>
                <p className="section-eyebrow">Learner Stories</p>
                <h2 id="testimonials-heading">What Our Learners Say</h2>
              </div>
            </header>
            <p className="testimonials-sub">Hear from government officials, civil society practitioners, and researchers who've completed our courses.</p>
            
            <div className="testimonials-grid">
              {TESTIMONIALS.map((t, i) => (
                <blockquote 
                  key={t.id} 
                  className={`testimonial-card animate-up ${t.featured ? 'testimonial-card--featured' : ''}`} 
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="testimonial-stars">{"★".repeat(t.rating)}{"☆".repeat(5-t.rating)}</div>
                  <p>"{t.text}"</p>
                  <footer>
                    <img src={t.avatar} alt="" loading="lazy" />
                    <div className="testimonial-info">
                      <cite className="testimonial-name">{t.name}</cite>
                      <span className="testimonial-role">{t.role}</span>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>

            <nav className="testimonials-pagination" aria-label="Testimonials pagination">
              <button className="page-dot page-dot--active" aria-label="Page 1"></button>
              <button className="page-dot" aria-label="Page 2"></button>
              <button className="page-dot" aria-label="Page 3"></button>
            </nav>

          </div>

        </section>

        {/* CTA Section */}
        <div className="container learn-content" id="courses-section">
          <CtaSection onNavigate={onNavigate} />
        </div>
        
    </div>
  );
};

export default LearnLandingPage;
