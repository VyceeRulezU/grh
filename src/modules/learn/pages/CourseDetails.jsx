import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import './CourseDetails.css';

const CourseDetails = ({ course, onNavigate, user }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    if (course && user) {
      checkEnrollment();
    }
    if (course) {
      fetchEnrollmentCount();
    }
  }, [course, user]);

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
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
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
                <div className="instructor-profile">
                  <div className="inst-avatar">
                   <div className="avatar-placeholder">{(course.instructor || 'G')[0]}</div>
                  </div>
                  <div className="inst-info">
                    <h4>{course.instructor || 'GRH Expert'}</h4>
                    <p>Governance Reform Specialist</p>
                    <div className="inst-stats">
                      <span><i className="ri-award-line"></i> 12 Courses</span>
                      <span><i className="ri-user-follow-line"></i> 5k+ Students</span>
                    </div>
                  </div>
                </div>
                <p className="inst-bio">
                  An experienced professional in public sector management and governance reform with over 15 years of experience supporting institutional development across Nigeria and Sub-Saharan Africa.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab animate-fade">
                <div className="review-stat">
                  <span className="rating-num">4.8</span>
                  <div className="rating-stars">
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-half-fill"></i>
                  </div>
                  <span className="review-count">Based on 120 reviews</span>
                </div>
                <div className="review-list">
                  <div className="review-item">
                    <div className="rev-header">
                      <strong>Sarah C.</strong>
                      <span className="rev-date">2 days ago</span>
                    </div>
                    <p>"Excellent resource. The practical tools provided are exactly what we needed for our reform initiative."</p>
                  </div>
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
    </div>
  );
};

export default CourseDetails;
