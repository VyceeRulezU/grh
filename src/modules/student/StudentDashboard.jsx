const MY_COURSES = [
  { id: 1, title: "UX Research & Case Study Prepare", instructor: "Marvin McKinney", progress: 80, level: "Advance", next: "Apr 27, 2024 7:33 am", icon: "ri-government-line" },
  { id: 2, title: "Figma Advanced Prototype", instructor: "Kathryn Murphy", progress: 60, level: "Medium", next: "Apr 1, 2024 11:12 pm", icon: "ri-bank-card-line" },
  { id: 3, title: "UX Law Study with Real Example", instructor: "Darlene Robertson", progress: 20, level: "Beginner", next: "Apr 24, 2024 12:39 am", icon: "ri-scales-3-line" },
];

const RECOMMENDED = [
  { id: 101, title: "The Ultimate Guide to Usability Testing and UX Law", price: "$12", level: "Advance", type: "Live Class", lessons: "24 Class" },
  { id: 102, title: "How to do quality UX Audit for e-commerce website", price: "$16", level: "Advance", type: "Live Class", lessons: "24 Class" },
];

const StudentDashboard = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Home");
  const name = user?.name || "Alex";

  const sidebarLinks = [
    { name: 'Home', icon: 'ri-home-fill' },
    { name: 'Bookmark', icon: 'ri-bookmark-fill' },
    { name: 'Courses', icon: 'ri-book-fill' },
    { name: 'Tutorials', icon: 'ri-movie-fill' },
    { name: 'Workshop', icon: 'ri-tools-fill' },
    { name: 'Certifications', icon: 'ri-award-fill' },
    { name: 'Resources', icon: 'ri-folder-fill' },
  ];

  return (
    <div className="student-dashboard-wrapper">
      <aside className="student-sidebar">
        <div className="sidebar-logo">
          <i className="ri-graduation-cap-fill"></i>
          <span>Academia</span>
        </div>
        <nav className="sidebar-nav">
          {sidebarLinks.map(link => (
            <button 
              key={link.name} 
              className={`sidebar-link ${activeTab === link.name ? 'active' : ''}`}
              onClick={() => setActiveTab(link.name)}
            >
              <i className={link.icon}></i>
              {link.name}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link"><i className="ri-settings-fill"></i> Settings</button>
          <button className="sidebar-link"><i className="ri-question-fill"></i> Help Center</button>
          <button className="sidebar-link"><i className="ri-user-fill"></i> My Account</button>
        </div>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div className="topbar-welcome">
            <span role="img" aria-label="wave">👋</span>
            <div>
              <h3>Welcome back, {name}!</h3>
              <p>Boost your skill to shine in your life.</p>
            </div>
          </div>
          <div className="topbar-search">
            <i className="ri-search-line"></i>
            <input type="text" placeholder="Search Courses" />
          </div>
          <div className="topbar-actions">
            <button className="action-btn"><i className="ri-chat-1-fill"></i></button>
            <button className="action-btn"><i className="ri-notification-fill"></i></button>
            <div className="user-profile">
              <div className="user-avatar">RA</div>
              <div className="user-info">
                <strong>Rob Alex</strong>
                <span>UX/UI Designer</span>
              </div>
            </div>
          </div>
        </header>

        <section className="courses-progress-section">
          <div className="progress-card">
            <div className="table-header">
              <span>Course Name</span>
              <span>Instructor</span>
              <span>Progress</span>
              <span>Level</span>
              <span>Next Assignment</span>
              <span>Action</span>
            </div>
            <div className="table-body">
              {MY_COURSES.map(course => (
                <div key={course.id} className="table-row">
                  <span className="course-name-cell">
                    <i className={course.icon}></i>
                    {course.title}
                  </span>
                  <span>{course.instructor}</span>
                  <div className="progress-cell">
                    <div className="prog-bar"><div className="prog-fill" style={{ width: `${course.progress}%` }}></div></div>
                    <span>{course.progress}%</span>
                  </div>
                  <span><span className={`badge ${course.level.toLowerCase()}`}>{course.level}</span></span>
                  <span>{course.next}</span>
                  <button className="row-action"><i className="ri-settings-3-fill"></i></button>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-sidebar">
            <div className="stat-box">
              <div className="stat-icon blue"><i className="ri-book-open-fill"></i></div>
              <div><strong>24 Courses</strong><span>Enrolled</span></div>
            </div>
            <div className="stat-box">
              <div className="stat-icon green"><i className="ri-clipboard-fill"></i></div>
              <div><strong>56 Lesson</strong><span>Contained</span></div>
            </div>
            <div className="stat-box">
              <div className="stat-icon orange"><i className="ri-star-fill"></i></div>
              <div><strong>12 Reviews</strong><span>Earned</span></div>
            </div>
            <div className="stat-box">
              <div className="stat-icon red"><i className="ri-team-fill"></i></div>
              <div><strong>15 Workshop</strong><span>Involvement</span></div>
            </div>
          </div>
        </section>

        <section className="recommended-section">
          <div className="section-header">
            <h3>Recommended Courses</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="recommended-grid">
            {RECOMMENDED.map(course => (
              <div key={course.id} className="rec-card">
                <div className="rec-thumb">
                  <span className="rec-price">{course.price}</span>
                </div>
                <div className="rec-body">
                  <h4>{course.title}</h4>
                  <p>Get a job in UX and build your user research and UX design skills...</p>
                  <div className="rec-meta">
                    <span className="badge">{course.level}</span>
                    <span className="badge">{course.type}</span>
                    <span className="badge">{course.lessons}</span>
                  </div>
                  <Button variant="primary" fullWidth className="enroll-btn">Enroll Now</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
