import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import InstructorDetailModal from '../../../shared/ui/InstructorDetailModal';
import CtaSection from '../../../shared/ui/CtaSection';
import TestimonialSection from '../../../shared/ui/TestimonialSection';
import FaqSection from '../../../shared/ui/FaqSection';
import ModernDropdown from '../../../shared/ui/ModernDropdown';
import Tab from '../../../shared/ui/Tab';
import { getRelativeTime } from '../../../shared/utils/dateUtils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import LearnHero from '../components/LearnHero';
import { Helmet } from 'react-helmet-async';
import './LearnLandingPage.css';
import { usePixabayImages } from '../../../shared/hooks/usePixabayImages';

gsap.registerPlugin(ScrollTrigger);

const COURSE_TABS = [
  { id: 'all', label: 'All Courses' },
  { id: 'trending', label: 'Trending' },
  { id: 'featured', label: 'Featured' },
  { id: 'inprogress', label: 'In Progress' },
];

const LearnLandingPage = ({ onNavigate, user }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All Levels");
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCourseCount, setTotalCourseCount] = useState(null);
  const [totalModuleCount, setTotalModuleCount] = useState(null);

  const { getImage: getCourseImg } = usePixabayImages('governance', 12);

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

        // If no courses in DB, only show placeholders
        if (!data || data.length === 0) {
          setCourses([]);
        } else {
          // Fetch enrollment counts
          const { data: progressData } = await supabase.from('user_progress').select('course_id, user_id');
          const enrollmentMap = {};
          (progressData || []).forEach(p => {
            const cid = String(p.course_id);
            if (!enrollmentMap[cid]) enrollmentMap[cid] = new Set();
            enrollmentMap[cid].add(p.user_id);
          });

          // Map DB fields to match component expectations
          const formattedCourses = data.map(c => ({
             ...c,
             description: c.description || 'A comprehensive guide to this topic.',
             students: enrollmentMap[String(c.id)]?.size || 0,
             duration: '2h 30m',
             progress: 0
          }));
        // Also store total count BEFORE slicing for the hero counter
          setTotalCourseCount(data.length);
          setCourses(formattedCourses.slice(0, 6)); 

          // Fetch total module count across all courses
          const { count: moduleCount } = await supabase
            .from('course_modules')
            .select('*', { count: 'exact', head: true });
          setTotalModuleCount(moduleCount || 0);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses([]); // fallback to empty to show placeholders
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        fetchCourses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = courses.filter(c => {
    const ms = c.title.toLowerCase().includes(search.toLowerCase()) || 
               (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const mc = category === "All" || c.category === category;
    const ml = level === "All Levels" || c.level === level;
    const mt = activeTab === "all" || 
               (activeTab === "trending" && c.trending) || 
               (activeTab === "featured" && c.featured) || 
               (activeTab === "inprogress" && c.progress > 0);
    return ms && mc && ml && mt;
  });

  // Scroll Animations for cards & Stats Counting
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
            trigger: '.courses-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // Stats Counting
    const stats = document.querySelectorAll('.about-stat-number');
    stats.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      const suffix = stat.getAttribute('data-suffix') || '';
      const obj = { val: 0 };
      
      stat.innerHTML = `0<span class="stat-suffix">${suffix}</span>`;
      
      gsap.to(obj, {
        val: target,
        duration: 2.5,
        scrollTrigger: { trigger: stat, start: 'top 90%' },
        onUpdate: function () {
          const current = Math.floor(obj.val);
          stat.innerHTML = `${current}<span class="stat-suffix">${suffix}</span>`;
        }
      });
    });
  }, [filtered, loading]);

  return (
    <div className="page-wrapper learn-page">
      <Helmet>
        <title>Learn | Governance Excellence Courses | GRH</title>
        <meta name="description" content="Master Governance, Financial Management, and Institutional building with expert-led courses. High-impact learning for the next generation of leaders." />
      </Helmet>
     
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <LearnHero 
        // chip="STRUCTURED LEARNING PATHS"
        title={
          <>
            Courses covering governance reforms, <br />
            <span className="green-text">Policy Development, Public Finance Management and</span> <br>
            </br>
            Service Delivery.
          </>
        }
        // subtitle="Expert-led modules on Governance, Financial Management and Institutional building."
        // actions={
        //   <>
        //     <button className="special-button" onClick={() => onNavigate('learn-discovery')}>
        //       Start Learning
        //       <span className="material-symbols-outlined">arrow_outward</span>
        //     </button>
        //     <a href="#courses-section" className="btn-outline">Browse Courses</a>
        //   </>
        // }
        counters={[
          { value: totalCourseCount !== null ? `${totalCourseCount}+` : '...', label: 'COURSES' },
          { value: totalModuleCount !== null ? `${totalModuleCount}+` : '...', label: 'MODULES' },
          { value: '98%', label: 'COMPLETION' },
          { value: 'Free', label: 'TO START' }
        ]}
      />

      {/* ── IMPACT HERO SECTION ────────────────────────────────────────────── */}
      <section className="impact-hero-section">
        <div className="container impact-container">
          <h2 className="impact-headline">
            Empowering governance through <i className="italic-highlight">specialised</i> learning, <i className="italic-highlight">practical</i> frameworks, and <i className="italic-highlight">expert-led</i> capacity buildin
          </h2>

          <div className="impact-stats-grid">
            <div className="impact-stat-card animate-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="about-stat-number" data-target="3000" data-suffix="+">0</h3>
              <p>Explore a curated collection of reports, policy briefs, and case studies that capture lessons, evidence, and results from years of governance reform work. These resources provide insights into what works, emerging challenges, and opportunities for improving governance.</p>
            </div>
            
            <div className="impact-stat-card animate-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="about-stat-number" data-target="50" data-suffix="+ Toolkits">0</h3>
              <p>Explore practical guides, templates, and step-by-step tools designed to support government actors, civil society, and reform partners in planning, implementing, and monitoring governance reforms. These toolkits translate lessons from the field into actionable resources for real-world use.</p>
            </div>
            
            <div className="impact-stat-card animate-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="about-stat-number" data-target="20" data-suffix="+ Years" >0</h3>
              <p>This platform brings together over two decades of experience supporting governance reforms in Nigeria. It captures the tools, evidence, and lessons from partnerships with government, civil society, and citizens—highlighting what works in strengthening accountability, improving service delivery, and driving sustainable change.</p>
            </div>
            
            {/* <div className="impact-stat-card animate-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="about-stat-number" data-target="36" data-suffix="">0</h3>
              <p>States of the Federation covered by our localized governance training modules.</p>
            </div> */}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ────────────────────────────────────────────────
      <div className="trusted-by">
        <p>Trusted by leading institutions worldwide</p>
        <div className="trusted-by-carousel">
          <div className="logo-track">
            {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((id, i) => (
              <img 
                key={i} 
                src={`${import.meta.env.BASE_URL}assets/grh-logo-v2.svg`} 
                alt={`Institution partner ${id}`} 
                className="trusted-by-logo" 
              />
            ))}
          </div>
        </div>
      </div> */}

      <div className="container learn-content" id="courses-section">
        <Tab tabs={COURSE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

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
          {loading ? (
             <div className="discovery-loading-state" role="status" aria-live="polite">
              <span className="discovery-loading-icon" aria-hidden="true">⏳</span>
              <h3>Loading Courses...</h3>
             </div>
          ) : (
            <>
              {filtered.map((course, i) => (
                <article 
                  key={course.id} 
                  className="course-card" 
                  ref={addToRefs}
                  onClick={() => onNavigate("learn-details", course)}
                >
                  <figure className="course-img">
                    <img 
                       src={(course.thumbnail && course.thumbnail.length > 10) 
                       ? course.thumbnail 
                       : getCourseImg(i) || `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80`}
                       alt={course.title} 
                       loading="lazy" 
                       onError={(e) => {
                         e.target.onerror = null;
                         e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&get=80&w=800';
                       }}
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
                         <span className="course-upload-time">⏱ {getRelativeTime(course.created_at)}</span>
                        <span>👤 {course.students.toLocaleString()} enrolled</span>
                      </div>
                      <div className="course-price">
                        <span className="price">{(!course.price || course.price === '0' || course.price === 0) ? 'Free' : course.price}</span>
                      </div>
                    </footer>
                  </div>
                </article>
              ))}
              
              {/* Card Placeholder Empty States */}
              {[...Array(Math.max(0, 6 - filtered.length))].map((_, idx) => (
                <div key={`empty-${idx}`} className="course-card empty-placeholder">
                  <div className="placeholder-img">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div className="course-body">
                    <div className="shimmer-line title"></div>
                    <div className="shimmer-line desc"></div>
                    <div className="shimmer-line desc short"></div>
                    <div className="placeholder-footer">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No courses found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}

      </div>

      {/* Testimonials Section */}
      <TestimonialSection />

        {/* FAQ Section */}
        <div className="container learn-content" style={{ marginTop: '2rem' }}>
          <FaqSection />
        </div>

        
        <InstructorDetailModal 
          isOpen={!!selectedInstructor}
          onClose={() => setSelectedInstructor(null)}
          instructor={selectedInstructor}
        />

        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <span className="material-symbols-outlined">expand_less</span>
        </button>
    </div>
  );
};

export default LearnLandingPage;


