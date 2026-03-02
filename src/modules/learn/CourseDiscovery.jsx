import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Tab from '../../components/ui/Tab';
import './CourseDiscovery.css';

const CATEGORY_TABS = [
  { id: 'All', label: 'All' },
  { id: 'Governance', label: 'Governance' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Ethics', label: 'Ethics' },
  { id: 'Policy', label: 'Policy' },
  { id: 'Digital', label: 'Digital' },
];

const ALL_COURSES = [
  { id: 1, title: "Foundations of Public Governance", category: "Governance", price: "Free", rating: 4.8, students: 1240, author: "Dr. Sarah Chen", icon: "ri-government-line", level: "Beginner", duration: "12 hours", description: "Explore the core principles of public governance and institutional frameworks." },
  { id: 2, title: "Public Financial Management", category: "Finance", price: "₦49,990", rating: 4.9, students: 850, author: "Marcus Thorne", icon: "ri-bank-card-line", level: "Intermediate", duration: "24 hours", description: "Master public financial management frameworks and fiscal policy analysis." },
  { id: 3, title: "Anti-Corruption & Integrity", category: "Ethics", price: "Free", rating: 4.7, students: 2100, author: "Elena Rossi", icon: "ri-scales-3-line", level: "Beginner", duration: "10 hours", description: "Learn integrity frameworks and anti-corruption mechanisms in governance." },
  { id: 4, title: "Electoral Systems & Democracy", category: "Policy", price: "₦29,990", rating: 4.6, students: 640, author: "Prof. John Doe", icon: "ri-input-method-line", level: "Advanced", duration: "32 hours", description: "Deep dive into electoral system design and democratic processes." },
  { id: 5, title: "Decentralisation Strategies", category: "Management", price: "Free", rating: 4.5, students: 920, author: "Amara Okoro", icon: "ri-node-tree", level: "Intermediate", duration: "15 hours", description: "Study decentralisation models and their impact on local governance." },
  { id: 6, title: "Public Policy Analysis 101", category: "Policy", price: "₦39,990", rating: 4.8, students: 1100, author: "Dr. Kevin Park", icon: "ri-pie-chart-line", level: "Beginner", duration: "20 hours", description: "Learn systematic approaches to analysing and evaluating public policy." },
  { id: 7, title: "Digital Governance & AI", category: "Digital", price: "₦59,990", rating: 4.9, students: 450, author: "Alex Rivers", icon: "ri-computer-line", level: "Advanced", duration: "18 hours", description: "Explore the intersection of technology, AI and public sector governance." },
  { id: 8, title: "Legislative Drafting", category: "Policy", price: "Free", rating: 4.4, students: 310, author: "Sarah Jenkins", icon: "ri-quill-pen-line", level: "Expert", duration: "40 hours", description: "Gain practical skills in drafting legislation and regulatory frameworks." },
];

const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1529539795054-3c162aab037a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80',
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
          
          <Tab 
            tabs={CATEGORY_TABS} 
            activeTab={activeCategory} 
            onTabChange={setActiveCategory} 
          />
        </header>

        <div className="discovery-grid-v2">
          {filtered.map((course, i) => (
            <article 
              key={course.id} 
              className="disc-course-card animate-in" 
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => onNavigate('course-player')}
            >
              <figure className="disc-course-img">
                <img 
                  src={COURSE_IMAGES[i % COURSE_IMAGES.length]} 
                  alt={course.title} 
                  loading="lazy" 
                />
                <figcaption className="disc-course-badge">{course.level}</figcaption>
              </figure>
              <div className="disc-course-body">
                <span className="disc-course-cat">{course.category}</span>
                <h3 className="disc-course-title">{course.title}</h3>
                <p className="disc-course-desc">{course.description}</p>
                <footer className="disc-course-footer">
                  <div className="disc-course-meta">
                    <span>⏱ {course.duration}</span>
                    <span>👤 {course.students.toLocaleString()} enrolled</span>
                  </div>
                  <div className="disc-course-price">
                    <span className="price">{course.price}</span>
                  </div>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDiscovery;
