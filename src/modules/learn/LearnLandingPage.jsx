import React from 'react';
import Button from '../../components/ui/Button';
import './LearnLandingPage.css';

const COURSES = [
  { id: 1, title: "Foundations of Public Governance", category: "Governance", price: "Free", rating: 4.8, students: 1240, author: "Dr. Sarah Chen", icon: "ri-government-line" },
  { id: 2, title: "Public Financial Management", category: "Finance", price: "₦49,990", rating: 4.9, students: 850, author: "Marcus Thorne", icon: "ri-bank-card-line" },
  { id: 3, title: "Anti-Corruption & Integrity", category: "Ethics", price: "Free", rating: 4.7, students: 2100, author: "Elena Rossi", icon: "ri-scales-3-line" },
  { id: 4, title: "Electoral Systems & Democracy", category: "Policy", price: "₦29,990", rating: 4.6, students: 640, author: "Prof. John Doe", icon: "ri-input-method-line" },
  { id: 5, title: "Decentralisation Strategies", category: "Management", price: "Free", rating: 4.5, students: 920, author: "Amara Okoro", icon: "ri-node-tree" },
  { id: 6, title: "Public Policy Analysis 101", category: "Policy", price: "₦39,990", rating: 4.8, students: 1100, author: "Dr. Kevin Park", icon: "ri-pie-chart-line" },
];

const CATEGORIES = [
  { name: "Public Policy", count: 12, icon: "ri-file-list-3-line" },
  { name: "Public Finance", count: 8, icon: "ri-money-dollar-box-line" },
  { name: "Ethics & Integrity", count: 15, icon: "ri-shield-star-line" },
  { name: "Leadership", count: 10, icon: "ri-focus-3-line" },
  { name: "Digital Gov", count: 6, icon: "ri-computer-line" },
];

const LearnLandingPage = ({ onNavigate }) => {
  return (
    <div className="learn-v2">
      {/* Hero Section */}
      <section className="learn-hero-v2">
        <div className="container hero-v2-grid">
          <div className="hero-v2-text">
            <span className="hero-v2-tag">Transform Your Career</span>
            <h1>Expert-Led Governance <span className="text-gradient">E-Learning</span></h1>
            <p>Access high-quality courses designed by global governance practitioners. Learn at your own pace and earn internationally recognized certificates.</p>
            <div className="hero-v2-actions">
              <Button size="lg" onClick={() => onNavigate('learn-discovery')}>Browse All Courses</Button>
              <Button variant="outline" size="lg">How It Works</Button>
            </div>
            <div className="hero-v2-stats">
              <div className="stat-item"><strong>25k+</strong><span>Students</span></div>
              <div className="stat-item"><strong>150+</strong><span>Courses</span></div>
              <div className="stat-item"><strong>4.9/5</strong><span>Rating</span></div>
            </div>
          </div>
          <div className="hero-v2-visual">
            <div className="hero-blob" />
            <div className="hero-card-floating card-1 subtle-shadow">
              <i className="ri-award-line emoji-large" style={{ color: 'var(--primary)' }}></i>
              <div>
                <strong>Certified Learning</strong>
                <p>Industry-standard certs</p>
              </div>
            </div>
            <div className="hero-card-floating card-2 subtle-shadow">
              <i className="ri-global-line emoji-large" style={{ color: 'var(--secondary)' }}></i>
              <div>
                <strong>Global Experts</strong>
                <p>Learn from the best</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced CTA Section */}
      <section className="learn-cta section-padding container">
        <div className="cta-box-v2 glass subtle-shadow animate-in">
          <div className="cta-content-v2">
            <div className="apple-label">Institutional Partnership</div>
            <h2 className="cta-title">Transform your workforce <br />with Governance training.</h2>
            <p className="cta-subtitle">Empower your team with expert-led training modules, industry certifications, and a private learning portal tailored for your institution.</p>
            <div className="cta-stats-row-v2">
              <div className="cta-stat-v2"><strong>500+</strong> <span>Students Graduated</span></div>
              <div className="cta-stat-v2"><strong>24/7</strong> <span>Expert Mentorship</span></div>
              <div className="cta-stat-v2"><strong>100%</strong> <span>Online & Flexible</span></div>
            </div>
            <Button size="lg" variant="primary">Become a Partner</Button>
          </div>
          <div className="cta-visual-v2">
             <i className="ri-community-line cta-bg-icon"></i>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="learn-categories container">
        <div className="section-head-v2">
          <h2>Top Categories</h2>
          <p>Explore courses by specialized governance areas</p>
        </div>
        <div className="categories-grid-v2">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="category-card-v2 animate-in">
              <i className={`${cat.icon} cat-icon-v2`}></i>
              <h3>{cat.name}</h3>
              <p>{cat.count} Courses</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="learn-courses-v2 container" id="courses">
        <div className="section-head-v2-row">
          <div>
            <h2>Popular Courses</h2>
            <p>Our most enrolled governance programmes</p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate('learn-discovery')}>View All Courses →</Button>
        </div>
        <div className="courses-grid-v2">
          {COURSES.map(course => (
            <div key={course.id} className="course-card-v2 subtle-shadow">
              <div className="course-thumb-v2">
                <i className={`${course.icon} disc-emoji-icon`}></i>
                <span className="course-badge-v2">{course.category}</span>
              </div>
              <div className="course-body-v2">
                <div className="course-meta-v2">
                  <span className="course-author-v2">By {course.author}</span>
                  <span className="course-rating-v2">⭐ {course.rating}</span>
                </div>
                <h3>{course.title}</h3>
                <div className="course-footer-v2">
                  <div className="course-info-v2">
                    <span>👥 {course.students} students</span>
                    <span className="course-price-v2">{course.price}</span>
                  </div>
                  <Button variant="outline" size="sm" fullWidth onClick={() => onNavigate('learn-discovery')}>Enrol Now</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced CTA Section */}
      <section className="learn-cta-v2 container">
        <div className="cta-v2-box section-padding glass">
          <div className="cta-v2-content">
            <span className="apple-label">Institutional Training</span>
            <h2>Empower your institution with<br />bespoke learning solutions.</h2>
            <p>We provide tailored e-learning infrastructure for government agencies, NGOs, and corporate governance bodies. Scale your impact with our white-label solutions.</p>
            
            <div className="cta-v2-features">
              <div className="cta-v2-feat">
                <i className="ri-dashboard-3-line"></i>
                <span>Dedicated Admin Portal</span>
              </div>
              <div className="cta-v2-feat">
                <i className="ri-pie-chart-line"></i>
                <span>Progress Analytics</span>
              </div>
              <div className="cta-v2-feat">
                <i className="ri-team-line"></i>
                <span>Bulk Enrollments</span>
              </div>
            </div>

            <div className="cta-v2-buttons">
              <Button size="lg" variant="primary">Request Institutional Demo</Button>
              <Button variant="outline" size="lg">Contact Global Sales</Button>
            </div>
          </div>
          <div className="cta-v2-image">
            <div className="cta-stats-badge glass">
              <div className="badge-icon"><i className="ri-shake-hands-line"></i></div>
              <div className="badge-text">
                <strong>500+ Institutions</strong>
                <span>Trust GRH Globally</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LearnLandingPage;
