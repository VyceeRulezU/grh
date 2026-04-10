import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';

import PageHero from '../../../shared/ui/PageHero';
import TestimonialSection from '../../../shared/ui/TestimonialSection';
import FaqSection from '../../../shared/ui/FaqSection';
import CtaSection from '../../../shared/ui/CtaSection';
import SpecialButton from '../../../shared/ui/SpecialButton';

import './PartnerPage.css';

gsap.registerPlugin(ScrollTrigger);

const PartnerPage = ({ onNavigate }) => {
  const cardsRef = useRef([]);
  cardsRef.current = [];

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.partner-content-section',
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }, []);

  return (
    <div className="page-wrapper partner-page">
      <Helmet>
        <title>Partner With Us | Governance Resource Hub</title>
        <meta name="description" content="Join us in advancing good governance, strengthening public sector accountability, and improving service delivery across Nigeria." />
      </Helmet>

      {/* ── HERO ── */}
      <PageHero
        chip="Collaborative Impact"
        title={
          <>
            Partner With <span className="green-text"> <br/>Governance Resource Hub</span>
          </>
        }
        subtitle="We welcome partnerships with organisations and individuals committed to advancing good governance, strengthening public sector accountability, and improving service delivery."
        actions={
          <SpecialButton onClick={() => window.location.href = 'mailto:info@governanceresourcehub.com'}>
            Partner with Us
          </SpecialButton>
        }
      />

      {/* ── OUR APPROACH (Image 1 & 2 blend) ── */}
      <section className="partner-approach-section section-padding" ref={addToRefs}>
        <div className="container">
          <div className="approach-header">
            <span className="dot-label">Partner With Us</span>
            <div className="approach-header-main">
              <h2 className="approach-title">We welcome partnerships with <i className="italic-highlight">organisations and individuals</i> committed to advancing good governance, strengthening public sector accountability, and improving service delivery.</h2>
            </div>
          </div>

          <div className="approach-images">
             <div className="img-box img-tall">
               <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" alt="Governance Team" loading="lazy" />
             </div>
             <div className="img-box img-wide">
               <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200" alt="Collaboration" loading="lazy" />
             </div>
             <div className="approach-text-block">
               <h3>Who Can Partner?</h3>
               <p>We invite expressions of interest from a diverse array of stakeholders:</p>
               <ul className="stakeholder-list">
                 <li>Government Agencies</li>
                 <li>Civil Society / NGOs</li>
                 <li>Academic Institutions</li>
                 <li>Donor Agencies</li>
                 <li>Governance Practitioners</li>
                 <li>Media Actors</li>
                 <li>Passionate Citizens</li>
               </ul>
             </div>
          </div>

          <div className="approach-goals-list">
            <div className="approach-goals-list-header">
              <p className='italic-highlight-text'>Through partnership, we aim to <span className="material-symbols-outlined">arrow_forward</span></p>
            </div>

            <div className="goal-row">
              <div className="goal-num">01</div>
              <div className="goal-content">
                <h3>Broaden Access</h3>
                <p>Expand access to practical, high-quality governance resources and toolkits for all partners.</p>
              </div>
            </div>
            <div className="goal-row">
              <div className="goal-num">02</div>
              <div className="goal-content">
                <h3>Continuous Growth</h3>
                <p>Support ongoing learning and capacity development across the Nigerian public sector.</p>
              </div>
            </div>
            <div className="goal-row">
              <div className="goal-num">03</div>
              <div className="goal-content">
                <h3>Drive Innovation</h3>
                <p>Encourage modern innovation and cross-sector knowledge exchange for sustainable reform.</p>
              </div>
            </div>
            <div className="goal-row">
              <div className="goal-num">04</div>
              <div className="goal-content">
                <h3>Ensure Sustainability</h3>
                <p>Promote sustainable use and ownership of governance tools and robust evidence repositories.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PARTNER (Bento Box - Image 3 Design concept) ── */}
      <section className="why-bento-section section-padding" ref={addToRefs}>
        <div className="container">
          <div className="bento-header center">
            <span className="pill-label">Why choose us</span>
            <h2>Why <i className="italic-serif">partner</i> with us</h2>
          </div>

          <div className="bento-grid">
            {/* 1. Tall Card */}
            <div className="bento-card bento-tall bg-dark">
              <span className="bento-tag text-white">Trusted by</span>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600" alt="Practitioner" className="bento-bg-img" />
              <div className="bento-overlay-logos">
                 <span>World Bank</span>
                 <span>UNDP</span>
                 <span>FCDO</span>
              </div>
            </div>

            {/* 2. Top Middle */}
            <div className="bento-card bento-light">
              <h3>Drive Learning and Capacity Building</h3>
              <p>Support the development and delivery of e-learning content that strengthens institutional capabilities and builds the skills of key actors across the governance ecosystem.</p>
            </div>

            {/* 3. Image Square */}
            <div className="bento-card bento-img bg-dark">
               <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" alt="Focus" className="bento-bg-img" />
               <div className="bento-center-logo">
                 <img src="/icon.png" alt="GRH" style={{width: 40, filter: 'brightness(0) invert(1)'}} onError={(e) => e.target.style.display='none'} />
                 <span className="text-white fw-bold">GRH</span>
               </div>
            </div>

            {/* 4. Quote Card */}
            <div className="bento-card bento-quote">
              <p className="bento-quote-text">"We designed this platform to make your governance journey smoother, smarter, and more connected to real-world policy."</p>
               <div className="bento-author">
                 <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt="CEO" />
                 <div>
                   <strong>Dr. Amaka Okonkwo</strong>
                   <span>Governance Specialist</span>
                 </div>
               </div>
            </div>

            {/* 5. Stat Card */}
            <div className="bento-card bg-dark bento-stat decorative-pattern-card">
              <div className="bento-stat-pattern"></div>
            </div>

            {/* 6. Wide Bottom Card */}
            <div className="bento-card bento-light bento-wide">
              <h3>Strengthen Sustainability and Local Ownership</h3>
              <p>Help maintain and expand the Hub as a locally-owned and community-driven platform that continues to serve the needs of users.</p>
            </div>
          </div>

          <div className="reach-us-footer">
            <h2 className="reach-us-title">If you are interested in partnering with the Governance Resource Hub or would like to learn more, please send an email to <span className='italic-highlight pointer' onClick={() => window.location.href = 'mailto:info@governanceresourcehub.com'}>info@governanceresourcehub.com</span>.</h2>
          </div>

        </div>
      </section>

      {/* ── REACH US ── */}
      {/* <section className="reach-us-section section-padding" ref={addToRefs}>
        <div className="container">
          <div className="reach-us-header">
            <h2 className="reach-us-title">If you are interested in partnering with the Governance Resource Hub or would like to learn more, please send an email to <span className='italic-highlight'>info@governanceresourccehub.com</span>.</h2>
          </div>
        </div>
      </section> */}

      {/* ── TESTIMONIALS ── */}
      <TestimonialSection
        eyebrow="Success Stories"
        title="Hear From Our Partners"
        subtitle="Discover how our collaborations are driving real reform and building institutional capacity across Nigeria."
      />

      {/* ── FAQ ── */}
      <section className="about-faq container" style={{ marginTop: '2rem' }}>
         <div className="faq-section-header">
           <p className='dot-label'>Common Queries</p>
           <h2>Partnership FAQs</h2>
         </div>
        <FaqSection />
      </section>

      {/* ── CTA ── */}
      <div className="container" style={{ margin: '4rem auto' }}>
        <CtaSection
          eyebrow="Get in Touch"
          title={<>Ready to shape the future of<br /><span className="green-text">Governance in Nigeria?</span></>}
          description="If you are interested in partnering with the Governance Resource Hub or would like to learn more, please click the button below to get started."
          primaryActionLabel="Contact for Partnership"
          primaryActionOnClick={() => window.location.href = 'mailto:info@governanceresourcehub.com'}
          secondaryActionLabel="Explore Resources"
          secondaryActionOnClick={() => onNavigate && onNavigate('research')}
          note="Join over 50+ government and developmental partners."
        />
      </div>

    </div>
  );
};

export default PartnerPage;
