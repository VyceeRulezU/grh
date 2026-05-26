import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import InstructorCard from '../../../shared/ui/InstructorCard';
import InstructorDetailModal from '../../../shared/ui/InstructorDetailModal';
import { MENTORS } from '../../../data/legacyData';
import './CourseDetails.css';

const CourseDetails = ({ course, onNavigate, user }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [modules, setModules] = useState([]);
  const [groupedModules, setGroupedModules] = useState({});
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => {
    if (course && user) {
      checkEnrollment();
    }
    if (course) {
      fetchEnrollmentCount();
      fetchModules();
    }
    fetchInstructors();
  }, [course, user]);

  const fetchModules = async () => {
    const { data } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', course.id)
      .order('sort_order', { ascending: true });
    
    if (data) {
      setModules(data);
      const grouped = data.reduce((acc, mod) => {
        const chapter = mod.chapter_title || 'Course Content';
        if (!acc[chapter]) acc[chapter] = [];
        acc[chapter].push(mod);
        return acc;
      }, {});
      setGroupedModules(grouped);
    }
  };

  const checkEnrollment = async () => {
    const { data } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .limit(1);
    
    if (data && data.length > 0) {
      setIsEnrolled(true);
    }
  };

  const fetchEnrollmentCount = async () => {
    const { data } = await supabase
      .from('user_progress')
      .select('user_id')
      .eq('course_id', course.id);
    
    if (data) {
      setEnrollmentCount(new Set(data.map(d => d.user_id)).size);
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('*');
      if (!error && data && data.length > 0) {
        setInstructors(data);
      } else {
        setInstructors(MENTORS.map(m => ({
          id: m.id,
          name: m.name,
          title: m.role,
          avatar_url: m.image,
          category: m.category,
          summary: "Governance expert and lead instructor at the Governance Resource Hub."
        })));
      }
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      // If not logged in, you might want to show auth modal or redirect to login
      onNavigate('login');
      return;
    }

    if (isEnrolled) {
      onNavigate('learn-player', course);
      return;
    }

    setLoading(true);
    try {
      // Create initial progress record for the first module if exists
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', course.id)
        .order('sort_order', { ascending: true })
        .limit(1);

      if (modules && modules.length > 0) {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          course_id: course.id,
          module_id: modules[0].id,
          status: 'not-started',
          completed: false
        });
      }

      onNavigate('learn-player', course);
    } catch (err) {
      console.error("Enrollment failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!course) return <div className="details-error">Course not found</div>;

  return (
    <div className="course-details-page">
      <div className="details-container">
        {/* Left Column: Image */}
        <div className="details-left">
          <div className="details-image-card">
            <img 
              src={course.thumbnail || course.cover_image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000'} 
              alt={course.title} 
            />
            <div className="image-overlay">
              <span className="level-badge">{course.level || 'Beginner'}</span>
              <span className="category-tag">{course.category}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="details-right">
          <div className="details-header">
            <button className="back-link" onClick={() => onNavigate('learn-discovery')}>
              <i className="ri-arrow-left-line"></i> Back to Courses
            </button>
            <h1>{course.title}</h1>
            <div className="details-quick-meta">
              <span><i className="ri-group-line"></i> {enrollmentCount.toLocaleString()} enrolled</span>
              <span><i className="ri-time-line"></i> {course.duration || '2.5h'}</span>
              <span><i className="ri-star-fill text-gold"></i> 4.8 (120 reviews)</span>
            </div>
          </div>

          <div className="details-tabs">
            <button 
              className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            <button 
              className={`tab-btn ${activeTab === 'instructor' ? 'active' : ''}`}
              onClick={() => setActiveTab('instructor')}
            >
              Instructor
            </button>
            {/* <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button> */}
            <button 
              className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              Course Details
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'about' && (
              <div className="about-tab animate-fade">
                <h3>Course Description</h3>
                <p>{course.description || 'This course provides a comprehensive deep dive into the subject matter, designed by governance experts to equip you with practical tools and insights for reform.'}</p>
                
                <div className="learning-outcomes">
                  <h4>What you'll learn</h4>
                  <ul>
                    <li><i className="ri-checkbox-circle-fill"></i> Master the core principles of {course.title}</li>
                    <li><i className="ri-checkbox-circle-fill"></i> Apply practical frameworks to real-world scenarios</li>
                    <li><i className="ri-checkbox-circle-fill"></i> Network with other governance reform champions</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="instructor-tab animate-fade">
                <div className="instructors-grid">
                  {(() => {
                    const courseInstructors = (() => {
                      if (!course.instructor) return [];
                      try {
                        const p = JSON.parse(course.instructor);
                        return Array.isArray(p) ? p : [course.instructor];
                      } catch {
                        return [course.instructor];
                      }
                    })();
                    const matched = instructors.filter(mentor => courseInstructors.includes(mentor.name));
                    return matched.length > 0
                      ? matched.map(mentor => (
                          <InstructorCard
                            key={mentor.id}
                            name={mentor.name}
                            title={mentor.title}
                            avatar_url={mentor.avatar_url}
                            category={mentor.category}
                            onClick={() => setSelectedInstructor(mentor)}
                          />
                        ))
                      : <p style={{ color: 'var(--text-soft)' }}>{courseInstructors.filter(Boolean).join(', ') || 'No instructor assigned yet'}</p>;
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="curriculum-tab animate-fade">
                <h3>Course Content</h3>
                <p className="curriculum-meta">
                   {Object.keys(groupedModules).length} sections • {modules.length} modules
                </p>
                
                <div className="curriculum-accordion">
                  {Object.entries(groupedModules).map(([chapter, mods]) => (
                    <details key={chapter} className="curriculum-chapter">
                      <summary className="chapter-summary">
                        <div className="chapter-info">
                          <i className="ri-arrow-down-s-line chevron"></i>
                          <h4>{chapter}</h4>
                        </div>
                        <span className="chapter-count">{mods.length} modules</span>
                      </summary>
                      <div className="chapter-content">
                        {mods.map(mod => (
                          <div key={mod.id} className="curriculum-module">
                            <i className="ri-play-circle-line bg-icon"></i>
                            <div className="module-details">
                              <span className="mod-title">{mod.title}</span>
                              <span className="mod-duration">{mod.duration || 'Video content'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                  {modules.length === 0 && (
                    <p style={{ color: 'var(--text-soft)', marginTop: '1rem' }}>No modules available yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab animate-fade">
                <div className="reviews-overview">
                  <div className="rating-summary-card">
                    <div className="big-rating">
                      <span className="num">4.8</span>
                      <div className="stars-row">
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-half-fill"></i>
                      </div>
                      <span className="count">120 Course Ratings</span>
                    </div>
                    
                    <div className="rating-bars">
                      {[
                        { star: 5, pc: 85 },
                        { star: 4, pc: 10 },
                        { star: 3, pc: 3 },
                        { star: 2, pc: 1 },
                        { star: 1, pc: 1 }
                      ].map(row => (
                        <div className="rating-bar-row" key={row.star}>
                          <span className="star-num">{row.star} ★</span>
                          <div className="bar-bg">
                            <div className="bar-fill" style={{ width: `${row.pc}%` }}></div>
                          </div>
                          <span className="pc-num">{row.pc}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="write-review-btn">
                    <i className="ri-edit-line"></i> Write a Review
                  </button>
                </div>

                <div className="review-list">
                  {[
                    { name: 'Sarah Okon', date: '2 days ago', rating: 5, text: 'This course provided practical insights that I could immediately apply to our PFM reform project. Highly recommended!', helpful: 12 },
                    { name: 'Dr. John Doe', date: '1 week ago', rating: 4, text: 'Very comprehensive overview. I especially liked the case studies on transparency.', helpful: 5 }
                  ].map((rev, i) => (
                    <div className="review-card" key={i}>
                      <div className="rev-user">
                        <div className="rev-avatar">{rev.name[0]}</div>
                        <div className="rev-name-date">
                          <strong>{rev.name}</strong>
                          <span>{rev.date}</span>
                        </div>
                        <div className="rev-rating">
                          {[...Array(5)].map((_, j) => (
                            <i key={j} className={j < rev.rating ? 'ri-star-fill active' : 'ri-star-line text-soft'}></i>
                          ))}
                        </div>
                      </div>
                      <p className="rev-text">{rev.text}</p>
                      <div className="rev-actions">
                        <button className="helpful-btn">
                          <i className="ri-thumb-up-line"></i> Helpful ({rev.helpful})
                        </button>
                        <button className="report-btn">Report</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="details-actions">
            <div className="price-tag">
              <span className="price-label">Price</span>
              <span className="price-value">{(!course.price || course.price === '0' || course.price === 0) ? 'Free' : course.price}</span>
            </div>
            <button 
              className="special-button" 
              onClick={handleEnroll} 
              disabled={loading}
            >
              {loading ? <div className="spinner-small"></div> : (isEnrolled ? 'Continue Learning' : 'Enroll Now')}
            </button>
          </div>
        </div>
      </div>

      <InstructorDetailModal
        isOpen={!!selectedInstructor}
        onClose={() => setSelectedInstructor(null)}
        instructor={selectedInstructor}
      />
    </div>
  );
};

export default CourseDetails;
