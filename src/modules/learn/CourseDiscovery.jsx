import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import './CourseDiscovery.css';

const ALL_COURSES = [
  { id: 1, title: "Foundations of Public Governance", category: "Governance", price: "Free", rating: 4.8, students: 1240, author: "Dr. Sarah Chen", icon: "ri-government-line", level: "Beginner", duration: "12 hours" },
  { id: 2, title: "Public Financial Management", category: "Finance", price: "₦49,990", rating: 4.9, students: 850, author: "Marcus Thorne", icon: "ri-bank-card-line", level: "Intermediate", duration: "24 hours" },
  { id: 3, title: "Anti-Corruption & Integrity", category: "Ethics", price: "Free", rating: 4.7, students: 2100, author: "Elena Rossi", icon: "ri-scales-3-line", level: "Beginner", duration: "10 hours" },
  { id: 4, title: "Electoral Systems & Democracy", category: "Policy", price: "₦29,990", rating: 4.6, students: 640, author: "Prof. John Doe", icon: "ri-input-method-line", level: "Advanced", duration: "32 hours" },
  { id: 5, title: "Decentralisation Strategies", category: "Management", price: "Free", rating: 4.5, students: 920, author: "Amara Okoro", icon: "ri-node-tree", level: "Intermediate", duration: "15 hours" },
  { id: 6, title: "Public Policy Analysis 101", category: "Policy", price: "₦39,990", rating: 4.8, students: 1100, author: "Dr. Kevin Park", icon: "ri-pie-chart-line", level: "Beginner", duration: "20 hours" },
  { id: 7, title: "Digital Governance & AI", category: "Digital", price: "₦59,990", rating: 4.9, students: 450, author: "Alex Rivers", icon: "ri-computer-line", level: "Advanced", duration: "18 hours" },
  { id: 8, title: "Legislative Drafting", category: "Policy", price: "Free", rating: 4.4, students: 310, author: "Sarah Jenkins", icon: "ri-quill-pen-line", level: "Expert", duration: "40 hours" },
];

const CourseDiscovery = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" 
    ? ALL_COURSES 
    : ALL_COURSES.filter(c => c.category === activeCategory);

  return (
    <div className="discovery-v2 section-padding">
      <div className="container">
        <header className="discovery-header-v2">
          <div className="discovery-header-text">
            <span className="apple-label">Knowledge Hub</span>
            <h1 className="apple-title-sm">Explore Governance <span className="text-gradient">Curriculum</span></h1>
            <p className="apple-subtitle-sm">A comprehensive catalogue of professional governance courses, from foundations to advanced strategic analysis.</p>
          </div>
          
          <div className="discovery-filters-v2 glass">
            {["All", "Governance", "Finance", "Ethics", "Policy", "Digital"].map(cat => (
              <button 
                key={cat} 
                className={`disc-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="discovery-grid-v2">
          {filtered.map((course, i) => (
            <div key={course.id} className="discovery-card-v2 subtle-shadow animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="disc-card-thumb">
                <i className={`${course.icon} disc-card-icon-v2`}></i>
                <span className="disc-level-badge">{course.level}</span>
              </div>
              <div className="disc-card-body">
                <div className="disc-meta">
                  <span className="disc-cat">{course.category}</span>
                  <span className="disc-rating">⭐ {course.rating}</span>
                </div>
                <h3>{course.title}</h3>
                <p className="disc-author">By {course.author}</p>
                <div className="disc-stats">
                  <span>👥 {course.students}</span>
                  <span>⏱ {course.duration}</span>
                </div>
                <div className="disc-footer">
                  <span className="disc-price">{course.price}</span>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('course-player')}>Start Learning</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDiscovery;
