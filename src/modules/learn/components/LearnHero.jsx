import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './LearnHero.css';

/**
 * LearnHero Component - Dedicated Hero for the Learn page.
 * Uses a centered layout and marker-style counters.
 */
const LearnHero = ({ chip, title, subtitle, actions, counters }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const q = gsap.utils.selector(heroRef.current);
    gsap.fromTo(
      q('.lh-chip, .lh-title, .lh-subtitle, .lh-actions, .lh-counter'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  return (
    <div className="learn-hero" ref={heroRef}>
      <div className="lh-inner">
        {/* ── Content ── */}
        <div className="lh-content">
          {chip && (
            <div className="lh-chip">
              <div className="dot">
                <img src="/assets/color-dots-[1.0].svg" alt="" aria-hidden="true" />
              </div>
              <p className="chip-text">{chip}</p>
            </div>
          )}

          {title && <h1 className="lh-title">{title}</h1>}
          {subtitle && <p className="lh-subtitle">{subtitle}</p>}

          {actions && <div className="lh-actions">{actions}</div>}
        </div>

        {/* ── Counters ── */}
        {counters && counters.length > 0 && (
          <div className="lh-stats">
            {counters.map((c, i) => (
              <div key={i} className="lh-counter">
                <span className="lh-stat-number">{c.value}</span>
                <span className="lh-stat-label">{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnHero;
