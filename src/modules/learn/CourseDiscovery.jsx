import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { COURSES as ALL_COURSES } from '../../data/legacyData';
import Button from '../../components/ui/Button';
import Tab from '../../components/ui/Tab';
import Pagination from '../../components/ui/Pagination';
import CtaSection from '../../components/ui/CtaSection';
import './CourseDiscovery.css';

const CATEGORY_TABS = [
  { id: 'All', label: 'All' },
  { id: 'Governance', label: 'Governance' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Ethics', label: 'Ethics' },
  { id: 'Policy', label: 'Policy' },
  { id: 'Digital', label: 'Digital' },
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
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formatted = data.map(c => ({
            ...c,
            students: 0,
            duration: '2h 30m',
            author: 'GRH Expert'
          }));
          setCourses([...formatted, ...ALL_COURSES]);
        } else {
          setCourses(ALL_COURSES);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses(ALL_COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = activeCategory === "All" 
    ? courses
    : courses.filter(c => c.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pagedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveCategory(tab);
    setCurrentPage(1); // Reset to first page on category change
  };

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
            onTabChange={handleTabChange} 
          />
        </header>

        <div className="discovery-grid-v2">
          {loading ? (
             <div className="empty-state" style={{ gridColumn: '1/-1', padding: '4rem 0' }}>
               <span className="empty-icon">⏳</span>
               <h3>Loading Courses...</h3>
             </div>
          ) : pagedItems.map((course, i) => (
            <article 
              key={course.id} 
              className="disc-course-card animate-in" 
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => onNavigate('learn-player', { course })}
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

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* CTA Section */}
        <CtaSection 
          eyebrow="Get Certified"
          title={<>Ready to start your <br /><span className="green-text">Governance Journey?</span></>}
          description="Start your learning journey today and join a global network of certified governance professionals."
          primaryActionLabel="Continue Learning"
          primaryActionOnClick={() => onNavigate('learn')}
          secondaryActionLabel="Speak with an Expert"
        />

                
      </div>
    </div>
  );
};

export default CourseDiscovery;
