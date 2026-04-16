import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS } from '../../data/legacyData';
import { usePixabayPortraits } from '../hooks/usePixabayImages';
import './TestimonialSection.css';

const TestimonialSection = ({
  eyebrow = "Learner Stories",
  title = "What Our Learners Say",
  subtitle = "Hear from government officials, civil society practitioners, and researchers who've completed our programmes."
}) => {
  const [offset, setOffset] = useState(0);
  const { images: portraitImgs } = usePixabayPortraits(10);

  useEffect(() => {
    // Cycles the index offset every 6 seconds to create a sliding 
    // content effect while preserving the strict CSS grid structure.
    const interval = setInterval(() => {
      setOffset(prev => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  // Compute the visible items based on offset
  const visibleItems = [];
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    visibleItems.push(TESTIMONIALS[(i + offset) % TESTIMONIALS.length]);
  }

  return (
    <section className="testimonial-section">
      <div className="container">
        <header className="testimonial-header">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="testimonial-sub">{subtitle}</p>
        </header>

        <div className="testimonial-grid">
          {visibleItems.map((t, i) => (
            <div
              key={i} /* Keep the grid slot stationary */
              className={`testimonial-card ${i === 0 ? 'testimonial-card--featured' : ''}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={t.id} /* Animate when content changes */
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div className="testimonial-stars" aria-label={`${t.rating} out of 5 stars`}>
                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                  </div>
                  <p className="testimonial-quote">"{t.text}"</p>
                  <footer className="testimonial-footer">
                    <img 
                      src={portraitImgs.length > i + 5 ? portraitImgs[i + 5] : (portraitImgs[i] || t.avatar)} 
                      alt={t.name} 
                      loading="lazy" 
                      onError={(e) => { e.target.onerror = null; e.target.src = t.avatar; }}
                    />
                    <div className="testimonial-info">
                      <cite className="testimonial-name">{t.name}</cite>
                      <span className="testimonial-role">{t.role}</span>
                    </div>
                  </footer>
                </motion.div>
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
