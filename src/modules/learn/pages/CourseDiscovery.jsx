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

// Placeholder catalogue — pairs with legacyData (6) for 12-per-page pagination (24+ total)
const DUMMY_COURSES = [
  { id: 'dummy-01', title: 'Strategic Public Leadership', category: 'Governance', level: 'Advanced', duration: '6 hrs', students: 1240, price: 0, created_at: '2026-05-18T09:00:00Z', description: 'Leadership frameworks for senior public officials navigating reform and institutional change.' },
  { id: 'dummy-02', title: 'Parliamentary Oversight in Practice', category: 'Governance', level: 'Intermediate', duration: '5 hrs', students: 980, price: 0, created_at: '2026-05-15T14:30:00Z', description: 'How committees scrutinise budgets, audit findings, and executive performance.' },
  { id: 'dummy-03', title: 'Decentralisation & Local Governance', category: 'Governance', level: 'Beginner', duration: '4 hrs', students: 2100, price: 0, created_at: '2026-05-12T11:00:00Z', description: 'Fiscal transfers, subnational accountability, and community participation models.' },
  { id: 'dummy-04', title: 'Gender-Inclusive Policy Design', category: 'Governance', level: 'Intermediate', duration: '3 hrs', students: 760, price: 0, created_at: '2026-05-10T08:45:00Z', description: 'Tools for embedding gender analysis across policy cycles and service delivery.' },
  { id: 'dummy-05', title: 'Treasury Single Account Operations', category: 'Finance', level: 'Advanced', duration: '7 hrs', students: 540, price: 0, created_at: '2026-05-17T10:15:00Z', description: 'Cash consolidation, payment controls, and reconciliation in modern treasury systems.' },
  { id: 'dummy-06', title: 'Debt Management & Fiscal Risk', category: 'Finance', level: 'Advanced', duration: '6 hrs', students: 430, price: 0, created_at: '2026-05-14T16:00:00Z', description: 'Sovereign borrowing strategies, debt sustainability, and contingent liability mapping.' },
  { id: 'dummy-07', title: 'Revenue Mobilisation Essentials', category: 'Finance', level: 'Beginner', duration: '4 hrs', students: 1890, price: 0, created_at: '2026-05-08T13:20:00Z', description: 'Tax policy basics, compliance systems, and customs administration fundamentals.' },
  { id: 'dummy-08', title: 'Ethics in Public Service', category: 'Ethics', level: 'Beginner', duration: '3 hrs', students: 3200, price: 0, created_at: '2026-05-19T07:30:00Z', description: 'Codes of conduct, conflict of interest, and everyday ethical decision-making for civil servants.' },
  { id: 'dummy-09', title: 'Whistleblower Protection Systems', category: 'Ethics', level: 'Intermediate', duration: '4 hrs', students: 870, price: 0, created_at: '2026-05-13T12:00:00Z', description: 'Legal frameworks, reporting channels, and organisational culture for safe disclosure.' },
  { id: 'dummy-10', title: 'Integrity Risk Assessment', category: 'Ethics', level: 'Advanced', duration: '5 hrs', students: 620, price: 0, created_at: '2026-05-06T15:45:00Z', description: 'Mapping vulnerability hotspots across agencies and designing targeted controls.' },
  { id: 'dummy-11', title: 'Evidence-Based Policymaking', category: 'Policy', level: 'Intermediate', duration: '5 hrs', students: 1450, price: 0, created_at: '2026-05-16T09:30:00Z', description: 'Using data, evaluation, and stakeholder input to improve policy design and implementation.' },
  { id: 'dummy-12', title: 'Regulatory Impact Assessment', category: 'Policy', level: 'Advanced', duration: '6 hrs', students: 510, price: 0, created_at: '2026-05-11T11:15:00Z', description: 'Cost–benefit analysis, consultation requirements, and post-implementation review.' },
  { id: 'dummy-13', title: 'Climate Policy & Green Budgeting', category: 'Policy', level: 'Intermediate', duration: '4 hrs', students: 930, price: 0, created_at: '2026-05-09T14:00:00Z', description: 'Aligning national budgets with climate commitments and tracking green expenditure.' },
  { id: 'dummy-14', title: 'Social Protection Programme Design', category: 'Policy', level: 'Beginner', duration: '4 hrs', students: 1680, price: 0, created_at: '2026-05-04T10:00:00Z', description: 'Targeting, delivery mechanisms, and monitoring for cash and in-kind transfer schemes.' },
  { id: 'dummy-15', title: 'Digital Identity for Public Services', category: 'Digital', level: 'Intermediate', duration: '5 hrs', students: 1120, price: 0, created_at: '2026-05-18T13:45:00Z', description: 'National ID ecosystems, privacy safeguards, and interoperability across agencies.' },
  { id: 'dummy-16', title: 'AI Governance & Algorithmic Accountability', category: 'Digital', level: 'Advanced', duration: '6 hrs', students: 680, price: 0, created_at: '2026-05-15T08:00:00Z', description: 'Ethical AI deployment, audit trails, and oversight models for automated decisions.' },
  { id: 'dummy-17', title: 'Cybersecurity for Government Agencies', category: 'Digital', level: 'Intermediate', duration: '5 hrs', students: 1540, price: 0, created_at: '2026-05-07T17:30:00Z', description: 'Threat landscapes, incident response, and security governance for public institutions.' },
  { id: 'dummy-18', title: 'Open Data & Civic Innovation', category: 'Digital', level: 'Beginner', duration: '3 hrs', students: 2010, price: 0, created_at: '2026-05-02T09:15:00Z', description: 'Publishing datasets, API standards, and partnerships with civic tech communities.' },
];

const FALLBACK_CATALOG = [...DUMMY_COURSES, ...ALL_COURSES];

const CourseDiscovery = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

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
          setCourses([...formatted, ...FALLBACK_CATALOG]);
        } else {
          setCourses(FALLBACK_CATALOG);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses(FALLBACK_CATALOG);
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
              onClick={() => onNavigate('learn-details', course)}
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
                    <span className="price">{(!course.price || course.price === '0' || course.price === 0) ? 'Free' : course.price}</span>
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
