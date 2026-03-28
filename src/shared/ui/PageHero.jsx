import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './PageHero.css';

/**
 * Shared Page Hero Section – styled to match the Research page hero.
 *
 * Props:
 * - chip {string}            – Chip/badge label text
 * - title {ReactNode}        – Main headline (can contain JSX)
 * - subtitle {string}        – Supporting paragraph
 * - actions {ReactNode}      – Optional JSX for buttons row (primary/secondary)
 * - counters {Array<{value, label}>} – Stat counters shown on the right (or bottom)
 * - customRight {ReactNode}  – Optional custom JSX for the right column (e.g. social proof)
 */
const PageHero = ({ chip, title, subtitle, actions, counters, customRight }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const q = gsap.utils.selector(heroRef.current);
    gsap.fromTo(
      q('.ph-chip, .ph-title, .ph-subtitle, .ph-actions, .ph-counter, .ph-right > *'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  return (
    <div className="page-hero" ref={heroRef}>
      <div className="ph-inner section-container">
        {/* ── Left: Text content ── */}
        <div className="ph-left">
          {chip && (
            <div className="hero-chip ph-chip">
              <div className="dot">
                <img src={`${import.meta.env.BASE_URL}assets/color-dots-[1.0].svg`} alt="" aria-hidden="true" />
              </div>
              <p className="chip-text">{chip}</p>
            </div>
          )}

          {title && <h1 className="ph-title">{title}</h1>}
          {subtitle && <p className="ph-subtitle">{subtitle}</p>}

          {actions && <div className="ph-actions">{actions}</div>}
        </div>

        {/* ── Right: Counters or Custom Content ── */}
        {(customRight || (counters && counters.length > 0)) && (
          <div className="ph-right">
            {customRight ? (
              customRight
            ) : (
              counters.map((c, i) => (
                <div key={i} className="ph-counter">
                  <span className="stat-number">{c.value}</span>
                  <span className="stat-label">{c.label}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHero;
