import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { jsPDF } from 'jspdf';
import Button from '../../components/ui/Button';
import StatusModal from '../../components/ui/StatusModal';
import { useModal } from '../../hooks/useModal';
import './CoursePlayer.css';

const TAB_CONTENT = {
  Overview: (lesson) => (
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
          <strong>Dr. Sarah Chen</strong>
          <span>Governance Specialist, World Bank</span>
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
      <div style={{display: 'flex', gap: '0.5rem'}}>
        <input 
          className="form-input" 
          placeholder="Ask a question..." 
          value={msg} 
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onPost()}
        />
        <button className="special-button" onClick={onPost} style={{padding: '0.75rem 1.5rem'}}>Post</button>
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

  // 1. Initial Data Fetch
  useEffect(() => {
    if (!course?.id) {
       onNavigate('learn');
       return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch Chapters with Modules
        const { data: chaps, error: chapErr } = await supabase
          .from('chapters')
          .select('*, modules(*)')
          .eq('course_id', course.id)
          .order('sequence_order', { ascending: true });
        
        if (chapErr) throw chapErr;

        // Fetch User Progress
        const { data: prog, error: progErr } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', course.id);
        
        if (progErr) throw progErr;

        const progMap = {};
        prog.forEach(p => progMap[p.module_id] = p);
        setProgress(progMap);

        const mappedChapters = chaps.map(chap => ({
          ...chap,
          modules: chap.modules?.sort((a,b) => a.sequence_order - b.sequence_order).map(m => ({
            ...m,
            completed: progMap[m.id]?.completed || false,
            watched_seconds: progMap[m.id]?.watched_seconds || 0,
            type: 'video'
          })) || []
        }));

        setLessons(mappedChapters); // lessons now holds chapters for accordion
        // Default active lesson = first module of first chapter
        if (mappedChapters.length > 0 && mappedChapters[0].modules.length > 0) {
          setActiveLesson(mappedChapters[0].modules[0]);
        }
      } catch (err) {
        console.error("CoursePlayer loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [course?.id, user.id]);

  // 2. Tab Content Loading (Notes & Discussions)
  useEffect(() => {
    if (!activeLesson || !user.id) return;

    const fetchTabData = async () => {
      // Fetch Notes
      const { data: notes } = await supabase
        .from('user_notes')
        .select('note_text')
        .eq('user_id', user.id)
        .eq('module_id', activeLesson.id)
        .maybeSingle();
      setNote(notes?.note_text || "");

      // Fetch Discussions
      const { data: discs } = await supabase
        .from('discussions')
        .select('*, profiles(name)')
        .eq('module_id', activeLesson.id)
        .order('created_at', { ascending: true });
      
      const formattedDiscs = discs?.map(d => ({
        ...d,
        user_name: d.profiles?.name || 'Anonymous'
      })) || [];
      setDiscussions(formattedDiscs);
    };

    fetchTabData();
  }, [activeLesson, user.id]);

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
    if (!activeLesson || !user.id) return;
    
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

      if (error) console.error("Progress save error:", error);
      
      if (completed) {
        setLessons(prev => prev.map(l => l.id === activeLesson.id ? { ...l, completed: true } : l));
        setProgress(prev => ({ ...prev, [activeLesson.id]: { ...prev[activeLesson.id], completed: true } }));
      }
    } catch (err) {
      console.error(err);
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
        .select('*, profiles(name)')
        .single();
      
      if (error) throw error;
      setDiscussions(prev => [...prev, { ...data, user_name: user.name }]);
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

  const videoId = getYouTubeVideoId(activeLesson?.video_url);
  
  // Flatten modules for stats
  const allModules = lessons.flatMap(c => c.modules || []);
  const totalCompleted = allModules.filter(m => m.completed).length;
  const progressPercent = allModules.length > 0 ? Math.round((totalCompleted / allModules.length) * 100) : 0;

  // Lock logic: next video is locked if current is not complete
  const isModuleLocked = (chapterIndex, moduleIndex) => {
    // First module of first chapter is never locked
    if (chapterIndex === 0 && moduleIndex === 0) return false;
    
    // If it's not the first module in the chapter, check previous module in the same chapter
    if (moduleIndex > 0) {
      return !lessons[chapterIndex].modules[moduleIndex - 1].completed;
    }
    
    // If it's the first module in a chapter (but not the first chapter), check the last module of the previous chapter
    if (chapterIndex > 0) {
      const prevChapterModules = lessons[chapterIndex - 1].modules;
      if (prevChapterModules && prevChapterModules.length > 0) {
        return !prevChapterModules[prevChapterModules.length - 1].completed;
      }
    }
    
    return false;
  };

  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (id) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-expand active chapter
  useEffect(() => {
    if (activeLesson) {
      const activeChap = lessons.find(c => c.modules?.some(m => m.id === activeLesson.id));
      if (activeChap && !expandedChapters[activeChap.id]) {
        setExpandedChapters(prev => ({ ...prev, [activeChap.id]: true }));
      }
    }
  }, [activeLesson, lessons]);

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
              {activeTab === 'Overview' && TAB_CONTENT.Overview(activeLesson)}
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
              <span>{totalCompleted}/{allModules.length} Lessons</span>
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
          
          <div className="lesson-list chapters-accordion">
            {lessons.map((chapter, ci) => (
              <div key={chapter.id} className={`chapter-group ${expandedChapters[chapter.id] ? 'expanded' : ''}`}>
                <div className="chapter-header" onClick={() => toggleChapter(chapter.id)}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <i className={expandedChapters[chapter.id] ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}></i>
                     <strong>{chapter.title}</strong>
                   </div>
                   <span className="chapter-meta">{chapter.modules?.length || 0} Lessons</span>
                </div>
                
                {expandedChapters[chapter.id] && (
                  <div className="chapter-modules-list anim-fade-in">
                    {chapter.modules?.map((mod, mi) => {
                      const locked = isModuleLocked(ci, mi);
                      return (
                        <div
                          key={mod.id}
                          className={`lesson-item ${activeLesson.id === mod.id ? 'active' : ''} ${mod.completed ? 'completed' : ''} ${locked ? 'locked' : ''}`}
                          onClick={() => !locked && setActiveLesson(mod)}
                        >
                          <div className="lesson-status">
                            {locked ? <i className="ri-lock-fill"></i> : mod.completed ? <i className="ri-checkbox-circle-fill"></i> : <i className="ri-play-line"></i>}
                          </div>
                          <div className="lesson-text" style={{ opacity: mod.completed ? 0.6 : 1, fontWeight: mod.completed ? 400 : 600 }}>
                            <p className="lesson-title">{mod.title}</p>
                            <span className="lesson-meta">{mod.duration || 'Video'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
