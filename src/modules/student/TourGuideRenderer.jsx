import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '../../context/TourContext';
import './TourGuide.css';

// Helper hook to dynamically measure target elements on step changes, window resizes, and scrolling
const useElementRect = (selector, stepTrigger) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector(selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    // Smooth scroll into view first
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Wait a brief 180ms for scrolling to settle and SPA tabs to paint before measuring
    const timer = setTimeout(measure, 180);

    window.addEventListener('resize', measure);
    // Listen to all scrolling events in capture phase to catch scroll actions in inner areas
    window.addEventListener('scroll', measure, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [selector, stepTrigger]);

  return rect;
};

export const TourGuideRenderer = () => {
  const {
    activeTour,
    currentStep,
    steps,
    isPaused,
    showExitConfirm,
    isMobile,
    whatsNew,
    nextStep,
    prevStep,
    pauseTour,
    resumeTour,
    endTour,
    dismissFeatureAnnouncement
  } = useTour();

  const activeStep = activeTour && steps ? steps[currentStep] : null;
  const targetSelector = activeStep?.target || null;
  const targetRect = useElementRect(targetSelector, currentStep);

  // What's New Single-step measurement
  const whatsNewRect = useElementRect(whatsNew?.target || null, whatsNew);

  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'bottom' });
  const tooltipRef = useRef(null);

  // Calculate dynamic tooltip positioning relative to target rect
  useEffect(() => {
    const rect = targetRect || whatsNewRect;
    if (!rect) return;

    const calculate = () => {
      const pad = 12;
      const tooltipW = 350;
      const tooltipH = tooltipRef.current ? tooltipRef.current.offsetHeight : 180;
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      let top = 0;
      let left = 0;
      let placement = 'bottom';

      // Special case: Sidebar links - place to the RIGHT of sidebar (usually left-aligned links)
      const isSidebar = (targetSelector && targetSelector.includes('sidebar')) || 
                        (whatsNew?.target && whatsNew.target.includes('sidebar'));

      if (isSidebar && rect.right + tooltipW + pad < viewW) {
        placement = 'right';
        top = rect.top + (rect.height / 2) - (tooltipH / 2);
        left = rect.right + pad;
      } 
      // General cases: Bottom, Top, Left, or Right clamping
      else if (rect.bottom + tooltipH + pad < viewH) {
        placement = 'bottom';
        top = rect.bottom + pad;
        left = rect.left + (rect.width / 2) - (tooltipW / 2);
      } else if (rect.top - tooltipH - pad > 0) {
        placement = 'top';
        top = rect.top - tooltipH - pad;
        left = rect.left + (rect.width / 2) - (tooltipW / 2);
      } else {
        placement = 'center';
        top = (viewH / 2) - (tooltipH / 2);
        left = (viewW / 2) - (tooltipW / 2);
      }

      // Clamp left/right to screen boundaries to prevent offscreen rendering
      left = Math.max(10, Math.min(viewW - tooltipW - 10, left));
      top = Math.max(10, Math.min(viewH - tooltipH - 10, top));

      setTooltipPos({ top, left, placement });
    };

    calculate();
    // Re-run measurement after paint
    const timer = setTimeout(calculate, 50);
    return () => clearTimeout(timer);
  }, [targetRect, whatsNewRect, targetSelector, whatsNew]);

  // RENDER: Feature Announcement ("What's New") Single Step Popover
  if (whatsNew && whatsNewRect) {
    return (
      <AnimatePresence>
        {/* Backdrop for single-step popup - semi-transparent */}
        <div 
          className="tour-backdrop-overlay" 
          style={{ backgroundColor: 'rgba(14, 18, 27, 0.2)', backdropFilter: 'none' }}
          onClick={() => dismissFeatureAnnouncement(whatsNew.id)} 
        />

        {/* Feature Pulsing Dot Spotlighter */}
        <div
          className="tour-spotlight"
          style={{
            top: whatsNewRect.top - 4,
            left: whatsNewRect.left - 4,
            width: whatsNewRect.width + 8,
            height: whatsNewRect.height + 8,
            border: '2px dashed var(--primary)',
            boxShadow: 'none',
            borderRadius: '8px'
          }}
        />

        {/* Feature Popover Tooltip */}
        <motion.div
          ref={tooltipRef}
          className="tour-tooltip-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left
          }}
        >
          <div className={`tour-tooltip-arrow ${tooltipPos.placement}`} />
          <div className="tour-tooltip-header">
            <h4 className="tour-tooltip-title">{whatsNew.title}</h4>
            <span className="tour-tooltip-progress" style={{ background: 'var(--primary)', color: 'white' }}>New Feature</span>
          </div>
          <p className="tour-tooltip-body">{whatsNew.content}</p>
          <div className="tour-tooltip-footer" style={{ justifyContent: 'flex-end' }}>
            <button className="tour-btn-next" onClick={() => dismissFeatureAnnouncement(whatsNew.id)}>
              Got it
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // If no tour is running, return null
  if (!activeTour) return null;

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // RENDER: Mobile Fallback Onboarding Card
  if (isMobile) {
    return (
      <div className="tour-modal-container">
        <div className="tour-modal-backdrop" onClick={pauseTour} />
        <AnimatePresence>
          {!showExitConfirm ? (
            <motion.div
              className="tour-modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="tour-modal-graphic-wrapper">
                <i className="ri-smartphone-fill tour-modal-icon"></i>
              </div>
              <h3 className="tour-modal-title">Welcome to the Hub!</h3>
              <p className="tour-modal-body">
                We detected that you are browsing from a mobile device! To experience our fully animated step-by-step tour, please log in on a desktop computer. 
                <br /><br />
                However, your platform is 100% optimised for mobile learning. Open the top-left hamburger menu to explore Courses, live Workshops, digital Resources, and view your Certifications!
              </p>
              <button 
                className="tour-modal-btn-primary" 
                style={{ width: '100%' }}
                onClick={() => endTour(true)}
              >
                Let's Start Learning
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="tour-modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="tour-modal-title">Exit Tour?</h3>
              <p className="tour-modal-body">Are you sure you want to end your onboarding tour?</p>
              <div className="tour-modal-actions">
                <button className="tour-modal-btn-secondary" onClick={resumeTour}>Cancel</button>
                <button className="tour-modal-btn-primary" onClick={() => endTour(true)}>Exit Tour</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // RENDER: Exit Confirmation Modal (Desktop & general fallback)
  if (showExitConfirm) {
    return (
      <div className="tour-modal-container">
        <div className="tour-modal-backdrop" onClick={resumeTour} />
        <motion.div
          className="tour-modal-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="tour-modal-graphic-wrapper">
            <i className="ri-questionnaire-fill tour-modal-icon"></i>
          </div>
          <h3 className="tour-modal-title">Exit Portal Tour?</h3>
          <p className="tour-modal-body">
            You can always restart this tour from the "Tour Guide" button in the sidebar footer if you exit.
          </p>
          <div className="tour-modal-actions">
            <button className="tour-modal-btn-secondary" onClick={resumeTour}>Continue Tour</button>
            <button className="tour-modal-btn-primary" onClick={() => endTour(true)}>End Onboarding</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // RENDER: Step 0 & Final Step (Welcome and Completion overlays)
  const isCenteredStep = !targetSelector || !targetRect;

  if (isCenteredStep) {
    return (
      <div className="tour-modal-container">
        <div className="tour-modal-backdrop" onClick={pauseTour} />
        <motion.div
          className="tour-modal-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="tour-modal-graphic-wrapper">
            <i className={isFirstStep ? "ri-compass-3-fill tour-modal-icon" : "ri-medal-fill tour-modal-icon"}></i>
          </div>
          <h3 className="tour-modal-title">{activeStep.title}</h3>
          <p className="tour-modal-body">{activeStep.content}</p>
          <div className="tour-modal-actions">
            {!isFirstStep && (
              <button className="tour-modal-btn-secondary" onClick={prevStep}>
                Back
              </button>
            )}
            <button className="tour-modal-btn-primary" onClick={nextStep}>
              {activeStep.actionLabel}
            </button>
          </div>
          {isFirstStep && (
            <button className="tour-btn-text" style={{ marginTop: '0.5rem' }} onClick={pauseTour}>
              Skip Onboarding
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // RENDER: Standard element-anchored step with floating card and spotlight mask
  return (
    <>
      {/* Dim backdrop covering background, click triggers exit confirmation */}
      <div className="tour-backdrop-overlay" onClick={pauseTour} />

      {/* Spotlight cutout mask targeting the active selector */}
      <div
        className="tour-spotlight"
        style={{
          top: targetRect.top - 6,
          left: targetRect.left - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12
        }}
      />

      {/* Floating Glassmorphic Tooltip Card */}
      <motion.div
        ref={tooltipRef}
        className="tour-tooltip-card"
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left
        }}
      >
        {/* Tooltip pointer arrow */}
        <div className={`tour-tooltip-arrow ${tooltipPos.placement}`} />

        <div className="tour-tooltip-header">
          <h4 className="tour-tooltip-title">{activeStep.title}</h4>
          <span className="tour-tooltip-progress">
            {currentStep} of {totalSteps - 2}
          </span>
        </div>

        <p className="tour-tooltip-body">{activeStep.content}</p>

        <div className="tour-tooltip-footer">
          <button className="tour-btn-text" onClick={pauseTour}>
            Skip
          </button>
          
          <div className="tour-footer-right">
            {currentStep > 1 && (
              <button className="tour-btn-back" onClick={prevStep}>
                Back
              </button>
            )}
            <button className="tour-btn-next" onClick={nextStep}>
              {isLastStep ? "Finish" : activeStep.actionLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
