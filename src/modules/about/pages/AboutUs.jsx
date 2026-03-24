import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import CtaSection from '../../../shared/ui/CtaSection';
import TestimonialSection from '../../../shared/ui/TestimonialSection';
import FaqSection from '../../../shared/ui/FaqSection';
import PageHero from '../../../shared/ui/PageHero';
import grhIcon from '../../../assets/images/Logo/Icon.png';
import './AboutUs.css';

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
            <button className="special-button" onClick={() => onNavigate && onNavigate('analyse')}>Explore Analytics</button>
            <button className="white-pill-btn" onClick={() => onNavigate && onNavigate('research')}>Research Library</button>
          </>
        }
      />

       {/* ── TRUSTED BY ──────────────────────────────────────────────── */}
      <div className="about-trusted-by">
        <p>Trusted by leading institutions worldwide</p>
        <div className="about-trusted-by-carousel">
          <div className="about-logo-track">
            {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((id, i) => (
              <img 
                key={i} 
                src={`${import.meta.env.BASE_URL}assets/grh-logo-v2.svg`} 
                alt={`Institution partner ${id}`} 
                className="about-trusted-by-logo" 
              />
            ))}
          </div>
        </div>
      </div>

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
            <div className="mission-badge">
              <strong>99.9%</strong>
              <span>Data Accuracy</span>
            </div>
          </div>
          <div className="mission-content">
            <span className="tag">Our Mission</span>
            <h2>We believe in <span className="green-text">Open Governance</span> and the power of shared knowledge.</h2>
            <p>
              Founded over a decade ago, our mission has been to simplify the complexity of government data.
              We began as a small research group and have grown into Nigeria's foremost governance intelligence
              platform, trusted by thousands of policy experts across 36 states.
            </p>
            <div className="feature-list">
              {[
                'Comprehensive state-level fiscal data repositories',
                'Verifiable performance metrics and interactive dashboards',
                'Training and capacity building for public institutions',
                'Research partnerships with global governance bodies',
              ].map((point, i) => (
                <div key={i} className="feature-item">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <button className="special-button" style={{ marginTop: '1.5rem' }} onClick={() => onNavigate && onNavigate('signup')}>
              Join Our Mission
            </button>
          </div>
        </div>
      </section>

      {/* ── SERVICES / WHAT WE DO ── */}
      <section className="about-services">
        <div className="container">
          <div className="services-header">
            <span className="tag">Our Expertise</span>
            <h2>Advancing Governance through <span className="green-text">Tech-Driven Strategy</span></h2>
            <p>Comprehensive tools for benchmarking, monitoring, and evaluation — ensuring institutional goals are met with the highest standards of accountability.</p>
          </div>
          <div className="services-grid-4">
            {[
              { icon: 'analytics', title: 'Data Intelligence', desc: 'Harnessing fiscal data to provide clear, actionable insights for policy makers and researchers.' },
              { icon: 'payments', title: 'Fiscal Management', desc: 'Specialised tools for budget analysis, revenue tracking, and expenditure monitoring.' },
              { icon: 'verified_user', title: 'Certifications', desc: 'Professional accreditation for governance expertise validated by global institutional standards.' },
              { icon: 'groups', title: 'Collaborations', desc: 'Building strong partnerships across federal and state levels to ensure unified governance growth.' },
              { icon: 'school', title: 'Learning Paths', desc: 'Expert-led courses on PFM, anti-corruption, electoral systems, and digital governance.' },
              { icon: 'search_insights', title: 'Research Library', desc: 'Curated repository of policy papers, handbooks, and case studies from leading global institutions.' },
              { icon: 'map', title: 'Geospatial Analysis', desc: 'State-level mapping and geopolitical zone comparisons for granular fiscal performance insights.' },
              { icon: 'assessment', title: 'Benchmarking', desc: 'Measure state performance against national and international governance indicators.' },
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
      </section>

      {/* ── CORE VALUES ── */}
      <section className="about-values">
        <div className="container">
          <div className="values-header">
            <span className="tag">What Guides Us</span>
            <h2>Our Core <span className="green-text">Values</span></h2>
            <p>We are driven by a set of core values that guide our work <br /> and shape our approach to governance and development.</p>
          </div>
          <div className="values-grid">
            {[
              { icon: 'search', title: 'Transparency', desc: 'We make government data accessible, readable, and easy to understand for every citizen. By simplifying complex information, we ensure people can clearly see how decisions are made and resources are used.' },
              { icon: 'balance', title: 'Accountability', desc: 'Every dataset we publish is cross-referenced and auditable against primary sources.' },
              { icon: 'handshake', title: 'Partnerships', desc: 'We work with state governments, NGOs, and global institutions to deliver trusted insights.' },
              { icon: 'lightbulb', title: 'Innovation', desc: 'We leverage modern technology to democratise access to governance intelligence. We believe that technology should serve the public good, and we are committed to using the latest tools and techniques to empower citizens and strengthen democracy.' },
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

      {/* ── TEAM ── */}
      <section className="about-team">
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
              {TEAM_MEMBERS.map((m, i) => (
                <div key={i} className="mentor-card team-card">
                  <img src={m.img} alt={m.name} loading="lazy" />
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
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
      </section>

      {/* ── STATS BAR ── */}
      <section className="about-stats-bar" ref={statsRef}>
        
        <div className="container stats-flex">
                <div className="about-stat">
                  <h2 className="about-stat-number" data-target="3" data-suffix="k+">0k+</h2>
                  <p>Successful Projects</p>
                </div>
                <div className="about-stat">
                  <h2 className="about-stat-number" data-target="150" data-suffix="+">0+</h2>
                  <p>Verified Experts</p>
                </div>
                <div className="about-stat">
                  <h2 className="about-stat-number" data-target="36" data-suffix="">0</h2>
                  <p>States Covered</p>
                </div>
                <div className="about-stat">
                  <h2 className="about-stat-number" data-target="16" data-suffix="+">0+</h2>
                  <p>Years of Data</p>
                </div>
        </div>

      </section>

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
          secondaryActionLabel="View Research Library"
          secondaryActionHref="#"
          note="Free access · No credit card required · All 36 states covered"
        />
      </div>

    </div>
  );
};

export default AboutUs;
