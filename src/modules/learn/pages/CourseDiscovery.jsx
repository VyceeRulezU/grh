import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import { COURSES as ALL_COURSES } from '../../../data/legacyData';
import Button from '../../../shared/ui/Button';
import Tab from '../../../shared/ui/Tab';
import Pagination from '../../../shared/ui/Pagination';
import CtaSection from '../../../shared/ui/CtaSection';
import { getRelativeTime } from '../../../shared/utils/dateUtils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import './CourseDiscovery.css';

gsap.registerPlugin(ScrollTrigger);

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

  // Refs for animations
  const headerRef = React.useRef(null);
  const cardsRef = React.useRef([]);
  cardsRef.current = [];

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Fetch enrollment counts
          const { data: progressData } = await supabase.from('user_progress').select('course_id, user_id');
          const enrollmentMap = {};
          (progressData || []).forEach(p => {
            const cid = String(p.course_id);
            if (!enrollmentMap[cid]) enrollmentMap[cid] = new Set();
            enrollmentMap[cid].add(p.user_id);
          });

          const formatted = data.map(c => ({
            ...c,
            students: enrollmentMap[String(c.id)]?.size || 0,
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

    // Header Animation
    if (headerRef.current) {
      const q = gsap.utils.selector(headerRef.current);
      gsap.fromTo(q('.apple-label, .apple-title-sm, .apple-subtitle-sm'), 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'power3.out',
          delay: 0.2 
        }
      );
    }

    // Subscribe to real-time changes
    const channel = supabase
      .channel('discovery:courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        fetchCourses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  // Scroll Animations for cards
  useEffect(() => {
    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.discovery-grid-v2',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }, [pagedItems]);

  const handleTabChange = (tab) => {
    setActiveCategory(tab);
    setCurrentPage(1); // Reset to first page on category change
  };

  return (
    <div className="discovery-v2 section-padding">
      <div className="discovery-v2-container">
        <header className="discovery-header-v2" ref={headerRef}>
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
              className="disc-course-card" 
              ref={addToRefs}
              onClick={() => onNavigate('learn-player', course)}
            >
              <figure className="disc-course-img">
                <img 
                  src={(course.thumbnail && course.thumbnail.length > 10) ? course.thumbnail : COURSE_IMAGES[i % COURSE_IMAGES.length]} 
                  alt={course.title} 
                  loading="lazy" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800';
                  }}
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
                    <span className="course-upload-time">📅 {getRelativeTime(course.created_at)}</span>
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
          primaryActionOnClick={() => onNavigate('student')}
          secondaryActionLabel="Speak with an Expert"
        />

                
      </div>
    </div>
  );
};

export default CourseDiscovery;
