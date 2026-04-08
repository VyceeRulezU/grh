import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import CtaSection from '../../../shared/ui/CtaSection';
import TestimonialSection from '../../../shared/ui/TestimonialSection';
import FaqSection from '../../../shared/ui/FaqSection';
import PageHero from '../../../shared/ui/PageHero';
import grhIcon from '../../../assets/images/Logo/Icon.png';
import servicesBg from '../../../assets/images/Pictures/37815616495_24f17295f5_b.jpg';
import './AboutUs.css';
import PFM_Mock from '../../../assets/PFM_Mock.png';
import Library from '../../../assets/Library.png';
import Assess from '../../../assets/Assess.png';
import E_learning from '../../../assets/e-Learning.png';
import { supabase } from '../../../services/supabase/supabaseClient';
import InstructorCard from '../../../shared/ui/InstructorCard';
import InstructorDetailModal from '../../../shared/ui/InstructorDetailModal';
import NigeriaMap from '../../analyse/components/NigeriaMap';

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
  { name: 'Dr. Amaka Okonkwo', role: 'Governance Specialist', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80' },
  { name: 'Dr. Fatima Al-Hassan', role: 'PFM Advisor', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80' },
  { name: 'Prof. Chidi Nwachukwu', role: 'Data Analytics Lead', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80' },
  { name: 'Ms. Ngozi Adebayo', role: 'Research Director', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80' },
];

const PARTNERS = [
  { name: 'World Bank', logo: 'WB' },
  { name: 'UNDP', logo: 'UNDP' },
  { name: 'PEFA Secretariat', logo: 'PEFA' },
  { name: 'IDEA International', logo: 'IDEA' },
  { name: 'Transparency International', logo: 'TI' },
  { name: 'African Union', logo: 'AU' },
];

const AboutUs = ({ onNavigate }) => {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const [instructors, setInstructors] = React.useState([]);
  const [selectedInstructor, setSelectedInstructor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero chip, title, sub
      gsap.fromTo('.about-page .analyse-hero-title, .about-page .analyse-hero-subline, .about-page .hero-chip',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.1 }
      );

      // Hero v2
      gsap.from('.about-hero-content > *', {
        y: 40, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out'
      });

      // Fetch instructors
      const fetchInstructors = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('instructors')
            .select('*');
          
          if (!error && data && data.length > 0) {
            setInstructors(data);
          } else {
            // Fallback to legacy data
            setInstructors(TEAM_MEMBERS.map((m, i) => ({
              id: `legacy-${i}`,
              name: m.name,
              title: m.role,
              avatar_url: m.img,
              category: 'Leadership',
              summary: "A multidisciplinary governance expert and key member of the GRH leadership team."
            })));
          }
        } catch (err) {
          console.error("Error fetching team:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchInstructors();

      // Stats Counting
      const stats = document.querySelectorAll('.about-stat-number');
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        gsap.fromTo(stat,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2.5,
            snap: { innerText: 1 },
            scrollTrigger: { trigger: stat, start: 'top 90%' },
            onUpdate: function () {
              const current = Math.floor(this.targets()[0].innerText);
              stat.innerText = current + (stat.getAttribute('data-suffix') || '');
            }
          }
        );
      });

      // Cards reveal
      const revealElems = document.querySelectorAll('.service-card, .value-card, .team-card, .partner-pill');
      revealElems.forEach((el) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' }
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="page-wrapper about-page">

      <PageHero
        chip="Digital Governance Hub"
        title={<>Building Transparent &amp;<br /><span className="green-text">Accountable Governance</span></>}
        subtitle="We provide the tools, data, and expertise to transform how government institutions manage and report performance — ensuring every public resource is accounted for."
        actions={
          <>
            <button className="special-button" onClick={() => onNavigate('analyse')}>Explore Analytics</button>
            <button className="white-pill-btn" onClick={() => onNavigate && onNavigate('research')}>Research Library</button>
          </>
        }
      />

      {/* ── IMPACT HERO SECTION ────────────────────────────────────────────── */}
      <section className="impact-hero-section" ref={statsRef}>
        <div className="container impact-container">
          {/* <div className="impact-tag">
            <span className="dot"></span> OUR IMPACT
          </div> */}
          
          <h2 className="impact-headline">
            The Governance Resource Hub is a <i className="italic-highlight">purpose-driven</i> digital platform <i className="italic-highlight">helping</i> practitioners <i className="italic-highlight">navigate</i> reforms, <i className="italic-highlight">refine</i> policy, and <i className="italic-highlight">achieve</i> sustainable development.
          </h2>

          <div className="impact-stats-grid">
            <div className="impact-stat-card animate-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="about-stat-number" data-target="10" data-suffix="K+">0</h3>
              <p>Public officials trained in evidence-based policymaking across Nigeria.</p>
            </div>
            
            <div className="impact-stat-card animate-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="about-stat-number" data-target="50" data-suffix="B+">0</h3>
              <p>In public funds monitored and optimized through our PFM frameworks.</p>
            </div>
            
            <div className="impact-stat-card animate-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="about-stat-number" data-target="100" data-suffix="+">0</h3>
              <p>Policy frameworks and resources accessed by state institutions.</p>
            </div>
            
            <div className="impact-stat-card animate-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="about-stat-number" data-target="15" data-suffix="+">0</h3>
              <p>Years of combined expertise guiding public sector reforms and execution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── 
      <section className="about-partners">
        <div className="container">
          <p className="partners-label">Trusted by leading institutions worldwide</p>
          <div className="partners-row">
            {PARTNERS.map((p, i) => (
              <div key={i} className="partner-pill">
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── MISSION SPLIT ── */}
      <section className="about-mission">
        <div className="container mission-grid">
          <div className="mission-image">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800"
              alt="Government Intelligence Team"
            />
          </div>
          <div className="mission-content">
            <span className="tag">About the Governance Resource Hub</span>
            <h2>Advancing <span className="green-text">Governance Reform</span> in Nigeria.</h2>
            <p>
              Welcome to the Governance Resource Hub—a central digital platform created to preserve, share, and build upon the extensive legacy of the Partnership to Engage, Reform, and Learn (PERL) programme and other FCDO-funded predecessor governance programmes.
            </p>
            <p style={{ marginTop: '1rem', color: 'var(--text-soft)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              This innovative hub is dedicated to advancing governance reform in Nigeria by making critical and practical tools accessible to reform champions, policymakers, academics, and practitioners alike. At the heart of the Hub are five integrated components designed to provide a comprehensive learning and resource-sharing experience.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {/* <button className="special-button" onClick={() => onNavigate && onNavigate('signup')}>
                Join Our Platform
              </button> */}
              <button className="white-pill-btn" onClick={() => { /* Handle partner inquiry */ }}>
                Partner with Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT THE PROGRAMMES (Premium Redesign) ── */}
      <section className="about-programmes">
        <div className="about-programmes-bg">
          <img src={servicesBg} alt="Governance Background" />
        </div>
        <div className="about-programmes-overlay"></div>
        
        <div className="container">
          <div className="section-header center">
            <h2>About the <span className="green-text">Programmes</span></h2>
          </div>
          
          <div className="programmes-grid">
            <div className="programme-card">
              <div className="programme-img-box slgp">
                <img src="https://pub-83b9c08ef5a84cc7a87212feb02635d2.r2.dev/SLGP.png" alt="SLGP" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800'; e.target.style.filter='none'; }} />
              </div>
              <div className="programme-info">
                <h3>SLGP</h3>
                <p>The State and Local Government Programme (SLGP) sought to increase and improve the interaction between citizens and state governments. SLGP included the strengthening of the civil service and participatory consultation with service providers.</p>
                <button className="text-btn">Learn More <span className="material-symbols-outlined">arrow_forward</span></button>
              </div>
            </div>

            <div className="programme-card">
              <div className="programme-img-box sparc">
                <img src="https://pub-83b9c08ef5a84cc7a87212feb02635d2.r2.dev/SPARC-Logo.jpg" alt="SPARC" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800'; e.target.style.filter='none'; }} />
              </div>
              <div className="programme-info">
                <h3>SPARC</h3>
                <p>The State Partnership for Accountability, Responsiveness and Capability (SPARC) was designed by the UK Government's DFID to improve governance for better service delivery in ten state governments of Nigeria.</p>
                <button className="text-btn">Learn More <span className="material-symbols-outlined">arrow_forward</span></button>
              </div>
            </div>

            <div className="programme-card">
              <div className="programme-img-box perl">
                <img src="https://pub-83b9c08ef5a84cc7a87212feb02635d2.r2.dev/PERL-logo-white.jpg" alt="PERL" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800'; e.target.style.filter='none'; }} />
              </div>
              <div className="programme-info">
                <h3>PERL</h3>
                <p>The Partnership to Engage, Reform and Learn (PERL) was an eight-year governance program funded by the UK’s FCDO. It focused on supporting governments, citizens, and evidence-based advocacy.</p>
                <button className="text-btn">Learn More <span className="material-symbols-outlined">arrow_forward</span></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU EXPECT TO SEE (Premium Redesign) ── */}
      <section className="about-expectations section-padding">
        <div className="container overflow-hidden">
          <div className="expect-grid">
            <div className="expect-visual">
              <div className="map-wrapper animate-float">
                <NigeriaMap 
                  showPins={true}
                  data={[
                    { name: 'Katsina', amount: 'Reform Hub' },
                    { name: 'Kano', amount: 'Reform Hub' },
                    { name: 'Yobe', amount: 'Reform Hub' },
                    { name: 'Kaduna', amount: 'Reform Hub' },
                    { name: 'Jigawa', amount: 'Reform Hub' },
                    { name: 'Borno', amount: 'Reform Hub' },
                    { name: 'Zamfara', amount: 'Reform Hub' },
                    { name: 'Enugu', amount: 'Reform Hub' },
                    { name: 'Anambra', amount: 'Reform Hub' },
                    { name: 'Lagos', amount: 'Reform Hub' },
                    { name: 'FCT', amount: 'Reform Hub' }
                  ]} 
                />
              </div>
              <div className="map-legend-grid">
                {[
                  'Abuja', 'Lagos', 'Kaduna', 'Kano', 'Enugu', 'Jigawa', 'Anambra', 'Katsina', 'Yobe', 'Borno', 'Zamfara'
                ].map(state => (
                  <div key={state} className="legend-item">
                    <span className="dot"></span> {state}
                  </div>
                ))}
              </div>
              <button className="view-map-btn" onClick={() => onNavigate('analyse')}>
                Explore Analytic Map <span className="material-symbols-outlined">analytics</span>
              </button>
            </div>

            <div className="expect-content">
              <h2>What you <span className="green-text">expect to see</span></h2>
              <div className="expect-divider"></div>
              
              <div className="expect-list">
                {[
                  'PSM', 'PFM', 'M & E', 'Delivery Unit', 'Education', 'Health', 'Water', 'Agriculture'
                ].map(item => (
                  <div key={item} className="expect-list-item btn-hover">
                    <span>{item}</span>
                    <span className="material-symbols-outlined">arrow_outward</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES / WHAT WE DO ── */}
      {/* <section className="about-services">
        <div className="about-services-bg">
          <img src={servicesBg} alt="Governance professionals" />
        </div>
        <div className="about-services-overlay"></div>

        <div className="container about-services-inner">
          <div className="services-header">
            <span className="tag light">Hub Components</span>
            <h2>Our <span className="green-text">5 Integrated Systems</span></h2>
            <p>At the heart of the Hub are five integrated components designed to provide a comprehensive learning and resource-sharing experience.</p>
          </div>
          <div className="services-grid-4">
            {[
              { icon: 'school', title: 'E-Learning Management System', desc: 'A core platform for structured learning, offering AI-driven personalized paths and progress tracking for policymakers and practitioners.' },
              { icon: 'local_library', title: 'E-Library System', desc: 'A comprehensive repository archiving over two decades of governance resources, featuring advanced AI search and offline access.' },
              { icon: 'assessment', title: 'ASSESS Suite', desc: 'Self-assessment manuals and tools enabling state governments to evaluate performance, set targets, and own their reform learning cycles.' },
              { icon: 'account_balance', title: 'PFM Database', desc: 'A centralized digital repository for fiscal data and KPIs, providing real-time dashboards to support evidence-based financial management.' },
              { icon: 'psychology', title: 'Advanced AI Module', desc: 'Leveraging natural language processing and intelligent recommendations to enhance research efficiency and tailor content.' },
            ].map((s, i) => (
              <div key={i} className="service-card">
                <div className="service-icon">
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── CORE VALUES -> FEATURED COURSE ── */}
      <section className="about-values" id="featured-course">
        <div className="container">
          <div className="values-header">
            <span className="tag">Featured Learning</span>
            <h2>E-Learning: <span className="green-text">Citizens Engagement</span></h2>
            <p style={{ maxWidth: '800px', margin: '1rem auto 0' }}>Guide to Enhance Citizen’s Understanding of Fiscal Issues and Publications by State Governments</p>
          </div>
          <div className="values-grid">
            {[
              { icon: 'menu_book', title: 'Course Overview', desc: 'PERL has supported PFM and broader governance reforms since 2016 across partner States and the Federal Government. This course equips supply and demand-side actors with tools to engage effectively throughout the PFM cycle.' },
              { icon: 'build', title: 'Engagement Guide', desc: 'Step-by-step guidance helping MDAs understand exactly where and how to engage with non-state actors within the Public Financial Management cycle.' },
              { icon: 'publish', title: 'Publication Tools', desc: 'Practical models and templates to support the preparation of the Citizens Budget (CB) and Citizens Accountability Report (CAR).' },
              { icon: 'verified', title: 'Course Requirements', desc: 'Ideal for those with a degree in Economics, Finance, or Public Admin. Requires basic numeracy, computer literacy, and an understanding of financial reports.' },
            ].map((v, i) => (
              <div key={i} className="value-card">
                <span className="material-symbols-outlined value-emoji">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>

                <div className="value-image">
                  <img src={grhIcon} alt="GRH Logo" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DETAILED HUB COMPONENTS (SPLIT SECTIONS) ── */}
      <div className="about-split-wrapper">
        
        {/* PFM Database (Image Left, Text Right, Navy) */}
        <section className="about-split bg-navy">
          <div className="split-image">
            {/* <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" alt="Data Analytics" /> */}
             <img src={PFM_Mock} alt="Data Analytics" />
          </div>
          <div className="split-content">
            <span className="split-overline">CORE COMPONENT</span>
            <h2>Public Financial Management (PFM) Database</h2>
            <p className="split-intro">The PFM database is a comprehensive digital repository to collect, store, and manage financial data, KPIs, and analytical insights. It provides governments and policymakers with accurate, up-to-date data supporting evidence-based decision-making. By tracking government revenues, expenditures, and budget allocations, it facilitates in-depth functional and fiscal policy analyses.</p>
            
            <h4 className="split-subheading">Core Features of the PFM Database</h4>
            <ul className="split-list">
              <li>
                <strong>1. Data Integration and Standardisation</strong>
                <p>Aggregates financial data from national and subnational sources.</p>
              </li>
              <li>
                <strong>2. Real-Time Data Access and Visualisation</strong>
                <p>Interactive dashboards and data visualisation tools for financial performance monitoring. Provides real-time updates on budget execution and revenue collection.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* E-Library System (Text Left, Image Right, Teal) */}
        <section className="about-split bg-teal image-right">
          <div className="split-image">
            {/* <img src="https://images.unsplash.com/photo-1456953180671-730de08edaa7?auto=format&fit=crop&q=80&w=1000" alt="Digital Library" /> */}
            <img src={Library} alt="Digital Library" />
          </div>
          <div className="split-content">
            <span className="split-overline">CORE COMPONENT</span>
            <h2>E-Library System</h2>
            <p className="split-intro">Designed to preserve and provide seamless access to governance-related tools and resources. The platform systematically archives the knowledge base of over 20 decades of governance programming, making it a reliable source for continuous learning.</p>
            
            <h4 className="split-subheading">Core Features of the E-Library System</h4>
            <ul className="split-list">
              <li>
                <strong>1. Comprehensive Document Repository</strong>
                <p>
                  <span>A well-structured collection of reports, case studies, policy briefs, and toolkits.</span>
                  <span>Archiving of legacy materials from PERL and other initiatives.</span>
                </p>
              </li>
              <li>
                <strong>2. Advanced Search & Metadata Tagging</strong>
                <p>
                  <span>AI-powered search to find documents using keywords, thematic areas, and locations.</span>
                  <span>Detailed classification of documents using tags for intuitive navigation.</span>
                </p>
              </li>
              <li>
                <strong>3. AI-Powered Recommendations & User Interface</strong>
                <p>
                  <span>Personalised recommendations based on users' search history and interests.</span>
                  <span>Download and offline access logic for on-the-go reading.</span>
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* ASSESS Suite (Image Left, Text Right, Navy) */}
        <section className="about-split bg-navy">
          <div className="split-image">
            {/* <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000" alt="Assessment tools" /> */}
            <img src={Assess} alt="Assessment tools" />
          </div>
          <div className="split-content">
            <span className="split-overline">CORE COMPONENT</span>
            <h2>ASSESS Suite (PERFORM Suite)</h2>
            <p className="split-intro">The ASSESS Suite contains self-assessment manuals and tools that help state governments to prepare and undergo the self-assessment process on an annual basis. It is designed to help governments at all levels to determine their achievements and to set targets for improvements.</p>
            
            <h4 className="split-subheading">Core Components of the PERFORM Suite</h4>
            <ul className="split-list">
              <li>
                <strong>1. Governance Performance Assessment Framework</strong>
                <p>Provides benchmarks for assessing transparency, accountability, service delivery, and citizen engagement.</p>
              </li>
              <li>
                <strong>2. Data Collection and Analysis Tools</strong>
                <p>Employs qualitative and quantitative methods to ensure a comprehensive evaluation of reform effectiveness across government partners.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* E-Learning System (Text Left, Image Right, Teal) */}
        <section className="about-split bg-teal image-right">
          <div className="split-image">
            {/* <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000" alt="E-Learning Analytics" /> */}
            <img src={E_learning} alt="E-Learning Analytics" />
          </div>
          <div className="split-content">
            <span className="split-overline">CORE COMPONENT</span>
            <h2>E-Learning Management System (eLMS)</h2>
            <p className="split-intro">The eLMS facilitates structured learning, knowledge transfer, and capacity building for reform champions, policymakers, institutions, and governance practitioners accessible anytime, anywhere.</p>
            
            <h4 className="split-subheading">Core Features of the eLMS</h4>
            <ul className="split-list">
              <li>
                <strong>1. Structured Learning Modules</strong>
                <p>Comprehensive courses covering governance reforms, policy development, public financial management, and service delivery.</p>
              </li>
              <li>
                <strong>2. AI-Driven Personalised Learning Paths</strong>
                <p>
                  <span>AI-powered recommendations tailored to users’ learning history, interests, and professional needs.</span>
                  <span>Custom learning paths mapped for different stakeholder types.</span>
                </p>
              </li>
              <li>
                <strong>3. User Registration & Progress Tracking</strong>
                <p>
                  <span>Secure login system for users to track their progress continuously.</span>
                  <span>Dashboards displaying course completions and recommended reading.</span>
                </p>
              </li>
            </ul>
          </div>
        </section>

      </div>

      {/* ── TEAM ── */}
      {/* <section className="about-team">
        <div className="container" style={{ position: 'relative' }}>
          <div className="team-header">
            <span className="tag">The People Behind GRH</span>
            <h2>Meet Our <span className="green-text">Leadership Team</span></h2>
            <p>A multidisciplinary team of governance experts, data scientists, and policy practitioners.</p>
          </div>
          <div className="mentors-grid-wrapper">
            <button 
              className="slider-btn prev"
              onClick={() => {
                const el = document.getElementById('about-team-slider');
                el.scrollBy({ left: -320, behavior: 'smooth' });
              }}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="mentors-grid" id="about-team-slider">
              {instructors.map((m, i) => (
                <div key={m.id} className="animate-up" style={{ animationDelay: `${i * 0.05}s`, minWidth: '280px' }}>
                  <InstructorCard 
                    {...m}
                    onClick={() => setSelectedInstructor(m)}
                  />
                </div>
              ))}
            </div>
            <button 
              className="slider-btn next"
              onClick={() => {
                const el = document.getElementById('about-team-slider');
                el.scrollBy({ left: 320, behavior: 'smooth' });
              }}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section> */}

      

      {/* ── TESTIMONIALS ── */}
      <TestimonialSection
        eyebrow="Impact Stories"
        title="Trusted by Governance Practitioners"
        subtitle="Hear from government officials, civil society leaders, and researchers who've built real reform momentum with GRH."
      />

      {/* ── FAQ ── */}
      <section className="about-faq container">
        <FaqSection />
      </section>

      {/* ── CTA ── */}
      <div className="container">
        <CtaSection
          eyebrow="Get Started Today"
          title={<>Ready to unlock<br /><span className="green-text">Governance Insights?</span></>}
          description="Join thousands of government officials, civil society practitioners, and researchers already using GRH to drive data-informed governance reform."
          primaryActionLabel="Explore Analytics"
          primaryActionOnClick={() => onNavigate && onNavigate('analyse')}
          secondaryActionLabel="Take a Course"
          secondaryActionOnClick={() => onNavigate && onNavigate('learn-discovery')}
          note="Free access · No credit card required · All 36 states covered"
        />
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

export default AboutUs;
