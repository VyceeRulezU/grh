import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { jsPDF } from 'jspdf';
import Button from '../../components/ui/Button';
import StatusModal from '../../components/ui/StatusModal';
import { useModal } from '../../hooks/useModal';
import './CoursePlayer.css';

const TAB_CONTENT = {
  Overview: (lesson, course) => (
    <div className="tab-panel">
      <h2>{lesson.title}</h2>
      <div className="module-description-rich">
        {lesson.description ? (
          <p style={{ whiteSpace: 'pre-wrap' }}>{lesson.description}</p>
        ) : (
          <p>In this lesson, we explore the core principles of governance and policy frameworks. We will examine case studies and discuss structural reforms relevant to this module.</p>
        )}
      </div>
      <div className="instructor-card-sm glass">
        <div className="inst-avatar"><i className="ri-user-star-line"></i></div>
        <div>
          <strong>{course?.instructor || 'Governance Resource Hub'}</strong>
          <span>Course Instructor</span>
        </div>
      </div>
    </div>
  ),
  Resources: () => (
    <div className="tab-panel">
      <h2>Lesson Resources</h2>
      <ul className="resource-list-tab">
        <li><i className="ri-file-pdf-2-line"></i> Governance Framework PDF</li>
        <li><i className="ri-article-line"></i> Case Study: Rwanda Decentralisation</li>
        <li><i className="ri-link"></i> OECD Governance Toolkit</li>
      </ul>
    </div>
  ),
  Notes: ({ note, onNoteChange, onNoteSave }) => (
    <div className="tab-panel">
      <h2>My Notes</h2>
      <textarea 
        className="notes-area" 
        placeholder="Type your notes here..." 
        value={note} 
        onChange={e => onNoteChange(e.target.value)}
      ></textarea>
      <button className="special-button btn-sm" style={{marginTop: '1rem'}} onClick={onNoteSave}>Save Notes</button>
    </div>
  ),
  Discussions: ({ discussions, onPost, msg, setMsg }) => (
    <div className="tab-panel">
      <h2>Discussion</h2>
      <div className="discussion-messages" style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem'}}>
        {discussions.length === 0 ? (
          <p className="empty-hint">No discussions yet. Start a thread!</p>
        ) : discussions.map(d => (
          <div key={d.id} className="disc-msg" style={{marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-weak)', borderRadius: '8px'}}>
             <div style={{fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem'}}>{d.user_name || 'Student'} • {new Date(d.created_at).toLocaleDateString()}</div>
             <div>{d.message}</div>
          </div>
        ))}
      </div>
      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
        <input 
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1.5px solid var(--stroke-soft, #d1d5db)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            background: 'var(--bg-white, #fff)',
            color: 'var(--text-main, #1e293b)',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          placeholder="Ask a question or share your thoughts..." 
          value={msg} 
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onPost()}
          onFocus={e => e.target.style.borderColor = 'var(--primary, #16a34a)'}
          onBlur={e => e.target.style.borderColor = 'var(--stroke-soft, #d1d5db)'}
        />
        <button className="special-button" onClick={onPost} style={{padding: '0.75rem 1.5rem', whiteSpace: 'nowrap'}}>
          <i className="ri-send-plane-fill" style={{marginRight: '0.25rem'}}></i> Post
        </button>
      </div>
    </div>
  ),
};

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CoursePlayer = ({ onNavigate, user, course }) => {
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [note, setNote] = useState("");
  const [discussions, setDiscussions] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const { modal, closeModal, showSuccess, showError } = useModal();
  const [loadError, setLoadError] = useState(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    if (!course?.id) {
       onNavigate('student');
       return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // Fetch modules from the correct table: course_modules
        const { data: modulesData, error: modErr } = await supabase
          .from('course_modules')
          .select('*')
          .eq('course_id', course.id)
          .order('sort_order', { ascending: true });
        
        if (modErr) {
          console.error("Modules fetch error:", modErr);
          setLoadError(`Could not load course content: ${modErr.message}`);
          setLoading(false);
          return;
        }

        // Fetch User Progress (gracefully ignore if table doesn't exist)
        let progMap = {};
        try {
          const { data: prog } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', course.id);
          
          if (prog) {
            prog.forEach(p => progMap[p.module_id] = p);
          }
        } catch (e) {
          console.warn("Could not fetch progress (table may not exist):", e);
        }
        setProgress(progMap);

        // Map modules to lesson format
        const mappedLessons = (modulesData || []).map(m => ({
          ...m,
          // Normalize video URL field name (could be video_url or videoUrl or videoLink)
          videoLink: m.video_url || m.videoUrl || m.videoLink || '',
          completed: progMap[m.id]?.completed || false,
          watched_seconds: progMap[m.id]?.watched_seconds || 0,
          type: 'video'
        }));

        setLessons(mappedLessons);
        // Default active lesson = first module
        if (mappedLessons.length > 0) {
          setActiveLesson(mappedLessons[0]);
        }
      } catch (err) {
        console.error("CoursePlayer loading error:", err);
        setLoadError(`Failed to load course: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [course?.id, user?.id]);

  // 2. Tab Content Loading (Notes & Discussions)
  useEffect(() => {
    if (!activeLesson || !user?.id) return;

    const fetchTabData = async () => {
      // Fetch Notes (gracefully handle missing table)
      try {
        const { data: notes } = await supabase
          .from('user_notes')
          .select('note_text')
          .eq('user_id', user.id)
          .eq('module_id', activeLesson.id)
          .maybeSingle();
        setNote(notes?.note_text || "");
      } catch (e) {
        console.warn('Notes fetch failed:', e);
      }

      // Fetch Discussions (no profiles join — table has no FK)
      try {
        const { data: discs } = await supabase
          .from('discussions')
          .select('*')
          .eq('module_id', activeLesson.id)
          .order('created_at', { ascending: true });
        
        setDiscussions(discs || []);
      } catch (e) {
        console.warn('Discussions fetch failed:', e);
      }
    };

    fetchTabData();
  }, [activeLesson, user?.id]);

  // 3. YouTube API Progress Tracking
  useEffect(() => {
    if (isPlaying && activeLesson && window.YT) {
       // Start interval every 10s to sync progress
       intervalRef.current = setInterval(() => {
         saveProgress(false);
       }, 10000);
    } else {
       if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeLesson]);

  const saveProgress = async (completed = false) => {
    if (!activeLesson || !user?.id) return;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: activeLesson.id,
          course_id: course.id,
          completed: completed,
          watched_seconds: 0, 
          status: completed ? 'completed' : 'in-progress'
        }, { onConflict: 'user_id,module_id' });

      if (error) {
        console.error("Progress save error:", error);
        showError('Save Failed', 'Could not save progress: ' + error.message);
        return;
      }
      
      if (completed) {
        setLessons(prev => prev.map(l => l.id === activeLesson.id ? { ...l, completed: true } : l));
        setProgress(prev => ({ ...prev, [activeLesson.id]: { ...prev[activeLesson.id], completed: true } }));
        setActiveLesson(prev => ({ ...prev, completed: true }));
        showSuccess('Lesson Complete', 'You have completed this lesson!');
      }
    } catch (err) {
      console.error(err);
      showError('Error', 'An unexpected error occurred.');
    }
  };

  const isCourseComplete = lessons.length > 0 && lessons.every(l => l.completed);

  const downloadCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Border
    doc.setConstants = {
      GREEN: [22, 163, 74],
      DARK: [30, 41, 59],
      SOFT: [100, 116, 139]
    };

    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(45);
    doc.setTextColor(30, 41, 59);
    doc.text("CERTIFICATE", 148.5, 50, { align: "center" });
    
    doc.setFontSize(20);
    doc.text("OF COMPLETION", 148.5, 65, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(100, 116, 139);
    doc.text("This is to certify that", 148.5, 90, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(35);
    doc.setTextColor(22, 163, 74);
    doc.text(user?.name || user?.email?.split('@')[0] || "Governance Learner", 148.5, 110, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(100, 116, 139);
    doc.text("has successfully completed the course", 148.5, 125, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(30, 41, 59);
    doc.text(course?.title || "Professional Governance Course", 148.5, 140, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 148.5, 165, { align: "center" });
    doc.text(`Certificate ID: GRH-${course.id}-${user.id.substring(0,8).toUpperCase()}`, 148.5, 175, { align: "center" });

    // Mock signature lines
    doc.line(60, 185, 110, 185);
    doc.text("Hub Director", 85, 190, { align: "center" });
    doc.line(185, 185, 235, 185);
    doc.text("Academic Dean", 210, 190, { align: "center" });

    doc.save(`GRH_Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleNoteSave = async () => {
    try {
       const { error } = await supabase
        .from('user_notes')
        .upsert({
          user_id: user.id,
          course_id: course.id,
          module_id: activeLesson.id,
          note_text: note
        }, { onConflict: 'user_id,module_id' });
       if (error) throw error;
       showSuccess('Note Saved', 'Your note has been saved successfully.');
    } catch (err) {
      showError('Save Failed', 'Failed to save note: ' + err.message);
    }
  };

  const handlePostDiscussion = async () => {
    if (!newMsg.trim()) return;
    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert({
          user_id: user.id,
          course_id: course.id,
          module_id: activeLesson.id,
          message: newMsg
        })
        .select()
        .single();
      
      if (error) throw error;
      setDiscussions(prev => [...prev, { ...data, user_name: user?.name || 'You' }]);
      setNewMsg("");
    } catch (err) {
      showError('Post Failed', 'Failed to post: ' + err.message);
    }
  };

  if (loading) {
    return <div className="course-player" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'500px'}}>
      <div className="empty-state"><h3>Loading Lesson Content...</h3></div>
    </div>;
  }

  if (loadError) {
    return (
      <div className="course-player">
        <header className="player-header">
          <div className="player-back" onClick={() => onNavigate('student')}>
            <i className="ri-arrow-left-line"></i>
            <span>Back to Dashboard</span>
          </div>
          <div className="player-course-title">
            <h3>{course?.title || 'Course'}</h3>
          </div>
        </header>
        <div className="player-main" style={{ justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <div className="empty-state">
            <i className="ri-error-warning-line" style={{ fontSize: '3rem', color: 'var(--danger)' }}></i>
            <h3>Could not load this course</h3>
            <p style={{color:'var(--text-soft)', marginTop:'0.5rem'}}>{loadError}</p>
            <p style={{fontSize:'0.8rem', color:'var(--text-soft)', marginTop:'0.5rem'}}>Tip: Make sure the course has chapters and modules added via the Admin Dashboard, and that RLS policies allow learners to read chapters.</p>
            <Button className="special-button" style={{ marginTop: '1.5rem' }} onClick={() => onNavigate('student')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeLesson) {
    return (
      <div className="course-player">
        <header className="player-header">
          <div className="player-back" onClick={() => onNavigate('student')}>
            <i className="ri-arrow-left-line"></i>
            <span>Back to Dashboard</span>
          </div>
          <div className="player-course-title">
            <h3>{course?.title || 'Course'}</h3>
            <div className="player-progress-pill">0% Complete</div>
          </div>
        </header>
        <div className="player-main" style={{ justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <div className="empty-state">
            <i className="ri-error-warning-line" style={{ fontSize: '3rem', color: 'var(--text-soft)' }}></i>
            <h3>No modules found for this course.</h3>
            <p>Please check back later or contact an administrator.</p>
            <Button className="special-button" style={{ marginTop: '1rem' }} onClick={() => onNavigate('student')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(activeLesson?.videoLink || activeLesson?.video_url);
  
  // Flat lessons list stats
  const totalCompleted = lessons.filter(l => l.completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((totalCompleted / lessons.length) * 100) : 0;

  // Simple lock logic: next lesson is locked if previous is not complete
  const isLessonLocked = (index) => {
    if (index === 0) return false;
    return !lessons[index - 1]?.completed;
  };

  return (
    <>
      <div className="course-player">
      <header className="player-header">
        <div className="player-back" onClick={() => onNavigate('student')}>
          <i className="ri-arrow-left-line"></i>
          <span>Back to Dashboard</span>
        </div>
        <div className="player-course-title">
          <h3>{course.title}</h3>
          <div className="player-progress-pill">{progressPercent}% Complete</div>
        </div>
        <div className="player-actions">
           <Button className="btn-outline" size="sm"><i className="ri-question-line"></i> Help</Button>
           <Button className="special-button" size="sm" onClick={() => saveProgress(true)} disabled={activeLesson.completed}>
             {activeLesson.completed ? 'Completed' : 'Mark as Complete'}
           </Button>
        </div>
      </header>

      <div className="player-main">
        <div className="player-content-area">
          <div className="video-wrapper">
            <div className="video-viewport">
              {videoId && isPlaying ? (
                <iframe
                  className="yt-iframe"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  frameBorder="0"
                />
              ) : videoId ? (
                <div className="yt-placeholder" onClick={() => setIsPlaying(true)}>
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="yt-thumbnail"
                    onError={(e) => {
                      if (e.target.src.includes('maxresdefault.jpg')) {
                        e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      } else {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1517245366810-54070744a417?auto=format&fit=crop&q=80&w=800'; 
                      }
                    }}
                  />
                  <div className="yt-overlay">
                    <div className="yt-play-btn"><span className="material-symbols-outlined">play_arrow</span></div>
                    <div className="yt-meta">
                      <p className="yt-lesson-label">Lesson {activeLesson.sequence_order} — VIDEO</p>
                      <p className="yt-lesson-title">{activeLesson.title}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="yt-placeholder">
                  <div className="yt-overlay">
                    <div className="yt-meta"><h3>No video available</h3></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lesson-info">
            <div className="lesson-tabs">
              {['Overview', 'Resources', 'Notes', 'Discussions'].map(tab => (
                <button
                  key={tab}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="lesson-detail-content">
              {activeTab === 'Overview' && TAB_CONTENT.Overview(activeLesson, course)}
              {activeTab === 'Resources' && TAB_CONTENT.Resources()}
              {activeTab === 'Notes' && TAB_CONTENT.Notes({ note, onNoteChange: setNote, onNoteSave: handleNoteSave })}
              {activeTab === 'Discussions' && TAB_CONTENT.Discussions({ discussions, onPost: handlePostDiscussion, msg: newMsg, setMsg: setNewMsg })}
            </div>
          </div>
        </div>

        <div className="player-sidebar">
          <div className="sidebar-header">
            <h3>Course Content</h3>
            <div className="course-progress-mini">
              <div className="mini-prog-bar"><div className="mini-prog-fill" style={{width: `${progressPercent}%`}}></div></div>
              <span>{totalCompleted}/{lessons.length} Lessons</span>
            </div>
            
            {isCourseComplete && (
              <button 
                className="special-button btn-sm" 
                style={{width: '100%', marginTop: '1rem', background: 'var(--secondary)', color: 'white'}}
                onClick={downloadCertificate}
              >
                <i className="ri-award-fill"></i> Download Certificate
              </button>
            )}
          </div>
          
          <div className="lesson-list">
            {Object.entries(
              lessons.reduce((acc, l) => {
                const chap = l.chapter_title || 'Course Content';
                if (!acc[chap]) acc[chap] = [];
                acc[chap].push(l);
                return acc;
              }, {})
            ).map(([chapter, mods]) => (
              <div key={chapter} className="player-chapter-group">
                <div className="player-chapter-header" style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-weak)', borderBottom: '1px solid var(--stroke-soft)', borderTop: '1px solid transparent', marginTop: '0.2rem' }}>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{chapter}</h4>
                </div>
                {mods.map((lesson) => {
                  const index = lessons.findIndex(x => x.id === lesson.id);
                  const locked = isLessonLocked(index);
                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-item ${activeLesson?.id === lesson.id ? 'active' : ''} ${lesson.completed ? 'completed' : ''} ${locked ? 'locked' : ''}`}
                      onClick={() => !locked && setActiveLesson(lesson)}
                    >
                      <div className="lesson-status">
                        {locked ? <i className="ri-lock-fill"></i> : lesson.completed ? <i className="ri-checkbox-circle-fill"></i> : <i className="ri-play-line"></i>}
                      </div>
                      <div className="lesson-text" style={{ opacity: lesson.completed ? 0.6 : 1, fontWeight: lesson.completed ? 400 : 600 }}>
                        <p className="lesson-title">{lesson.title}</p>
                        <span className="lesson-meta">{lesson.duration || 'Video'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <StatusModal
      isOpen={modal.isOpen}
      title={modal.title}
      message={modal.message}
      icon={modal.icon}
      iconColor={modal.iconColor}
      iconBg={modal.iconBg}
      onConfirm={modal.onConfirm}
      onCancel={closeModal}
      confirmLabel="OK"
      cancelLabel="Close"
    />
    </>
  );
};

export default CoursePlayer;
