import React from 'react';
import { TESTIMONIALS } from '../../data/legacyData';
import './TestimonialSection.css';

const TestimonialSection = ({
  eyebrow = "Learner Stories",
  title = "What Our Learners Say",
  subtitle = "Hear from government officials, civil society practitioners, and researchers who've completed our programmes."
}) => {
  return (
    <section className="testimonial-section">
      <div className="container">
        <header className="testimonial-header">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="testimonial-sub">{subtitle}</p>
        </header>

        <div className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.id}
              className={`testimonial-card ${t.featured ? 'testimonial-card--featured' : ''}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="testimonial-stars" aria-label={`${t.rating} out of 5 stars`}>
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
              <p className="testimonial-quote">"{t.text}"</p>
              <footer className="testimonial-footer">
                <img src={t.avatar} alt={t.name} loading="lazy" />
                <div className="testimonial-info">
                  <cite className="testimonial-name">{t.name}</cite>
                  <span className="testimonial-role">{t.role}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
