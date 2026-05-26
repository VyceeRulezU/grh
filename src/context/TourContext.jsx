import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TourContext = createContext(null);

export const TOUR_STEPS = {
  platform: [
    {
      target: null, // Centered
      title: "Welcome to Governance Resource Hub",
      content: "We are thrilled to have you here. Let's take a quick 1-minute interactive tour of your new dashboard so you can make the most of your learning experience.",
      actionLabel: "Start Tour",
      tab: "Home",
      iconClass: "ri-sparkling-line"
    },
    {
      target: "#tour-dashboard-stats",
      title: "Your Dashboard Metrics",
      content: "This panel tracks your academic journey in real-time, showing your enrolled courses, lesson completions, and earned industry certificates.",
      actionLabel: "Next",
      tab: "Home",
      iconClass: "ri-bar-chart-2-line"
    },
    {
      target: "#tour-sidebar-Courses",
      title: "Immersive E-Learning",
      content: "Explore our rich catalogue of premium governance courses. Enroll instantly, track modules, and learn at your own pace.",
      actionLabel: "Next",
      tab: "Courses",
      iconClass: "ri-book-open-line"
    },
    {
      target: "#tour-sidebar-Research",
      title: "AI Research Sandbox",
      content: "Accelerate your governance research. Query, search, and analyse literature and documents using our advanced GovAI-Core integration.",
      actionLabel: "Next",
      tab: "Research",
      iconClass: "ri-cpu-line"
    },
    {
      target: "#tour-sidebar-Workshop",
      title: "Interactive Workshops",
      content: "Join live virtual classrooms, interactive webinars, and collaborative workshops led by global policy and governance experts.",
      actionLabel: "Next",
      tab: "Workshop",
      iconClass: "ri-slideshow-line"
    },
    {
      target: "#tour-sidebar-Resources",
      title: "Premium Digital Library",
      content: "Access downloadable books, advanced SPARC diagnostics, and PERL policy toolkits curated specifically for institutional excellence.",
      actionLabel: "Next",
      tab: "Resources",
      iconClass: "ri-folder-open-line"
    },
    {
      target: "#tour-sidebar-Certifications",
      title: "Social-Ready Credentials",
      content: "All your earned certificates are stored here. Download pixel-perfect PDFs or share your verified credentials directly to LinkedIn or Twitter.",
      actionLabel: "Next",
      tab: "Certifications",
      iconClass: "ri-award-line"
    },
    {
      target: "#tour-sidebar-Settings",
      title: "Profile Personalisation",
      content: "Change your profile name, upload an avatar image, adjust account security settings, and customise your learning preferences.",
      actionLabel: "Next",
      tab: "Settings",
      iconClass: "ri-settings-4-line"
    },
    {
      target: null, // Centered
      title: "You're All Set!",
      content: "Your onboarding is complete. Remember, you can restart this tour anytime by clicking 'Tour Guide' in the sidebar footer. Let's make governance excellent!",
      actionLabel: "Get Started",
      tab: "Home",
      iconClass: "ri-checkbox-circle-line"
    }
  ],
  course: [
    {
      target: null, // Centered
      title: "Welcome to the Course Player",
      content: "Here you can experience deep, focused learning. Let's look at the key controls to streamline your study sessions.",
      actionLabel: "Let's Go",
      iconClass: "ri-sparkling-line"
    },
    {
      target: "#tour-course-display",
      title: "Active Learning Screen",
      content: "This is where your course content is displayed. Depending on the lesson, this will render interactive video players, reading frames, or quizzes.",
      actionLabel: "Next",
      iconClass: "ri-tv-2-line"
    },
    {
      target: "#tour-course-progress",
      title: "Study Progress Tracker",
      content: "See exactly how far you've come. The progress pill updates in real-time as you complete lessons and advance through modules.",
      actionLabel: "Next",
      iconClass: "ri-line-chart-line"
    },
    {
      target: "#tour-course-sidebar",
      title: "Curriculum & Lesson Outline",
      content: "Browse modules, track completed lectures, and click ahead or review past lessons from the dynamic navigation sidebar.",
      actionLabel: "Next",
      iconClass: "ri-list-check"
    },
    {
      target: "#tour-course-tabs",
      title: "Interactive Lesson Tabs",
      content: "Access supplementary resource files, write personal study notes (saved instantly), and join discussion forums with fellow learners.",
      actionLabel: "Next",
      iconClass: "ri-discuss-line"
    },
    {
      target: null, // Centered
      title: "Start Learning!",
      content: "You are ready to dive in. Happy learning!",
      actionLabel: "Begin Lesson",
      iconClass: "ri-flag-line"
    }
  ],
  explore: [
    {
      target: null, // Centered
      title: "Welcome to GovAI Sandbox",
      content: "Meet your intelligent governance research assistant. Let's review the environment features so you can search and analyse efficiently.",
      actionLabel: "Let's Begin",
      iconClass: "ri-sparkling-line"
    },
    {
      target: "#tour-explore-input",
      title: "AI Query Workspace",
      content: "Type prompts, ask complex policy questions, or upload files directly. GovAI will search academic papers and return referenced facts.",
      actionLabel: "Next",
      iconClass: "ri-message-3-line"
    },
    {
      target: "#tour-explore-sidebar",
      title: "Workspace Memory",
      content: "Access your persistent chat history, search past queries, or start fresh new research threads instantly.",
      actionLabel: "Next",
      iconClass: "ri-history-line"
    },
    {
      target: "#tour-explore-suggestions",
      title: "Curated Research Starters",
      content: "Not sure where to start? Click on any of these high-priority suggestions to immediately trigger advanced analyses on common governance frameworks.",
      actionLabel: "Next",
      iconClass: "ri-lightbulb-line"
    },
    {
      target: null, // Centered
      title: "Knowledge Reclaimed!",
      content: "You are fully equipped to query our databases and generate advanced insights. Happy researching!",
      actionLabel: "Start Chatting",
      iconClass: "ri-checkbox-circle-line"
    }
  ]
};

const LOCAL_STORAGE_KEYS = {
  platform: 'grh_onboarding_complete',
  course: 'grh_course_tour_complete',
  explore: 'grh_explore_tour_complete'
};

export const TourProvider = ({ children }) => {
  const [activeTour, setActiveTour] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Feature Announcements ("What's New") state
  const [whatsNew, setWhatsNew] = useState(null);

  // Monitor viewport size to implement mobile fallbacks
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const startTour = (tourName) => {
    if (!TOUR_STEPS[tourName]) {
      console.warn(`[GRH TOUR] Tour '${tourName}' does not exist.`);
      return;
    }
    setActiveTour(tourName);
    setCurrentStep(0);
    setIsPaused(false);
    setShowExitConfirm(false);
    setWhatsNew(null); // Clear active announcement
  };

  const nextStep = () => {
    if (!activeTour) return;
    const steps = TOUR_STEPS[activeTour];
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour(true);
    }
  };

  const prevStep = () => {
    if (!activeTour) return;
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const pauseTour = () => {
    setIsPaused(true);
    setShowExitConfirm(true);
  };

  const resumeTour = () => {
    setIsPaused(false);
    setShowExitConfirm(false);
  };

  const endTour = (saveCompleted = true) => {
    if (activeTour) {
      if (saveCompleted) {
        localStorage.setItem(LOCAL_STORAGE_KEYS[activeTour], 'true');
      }
      setActiveTour(null);
      setCurrentStep(0);
      setIsPaused(false);
      setShowExitConfirm(false);
    }
  };

  const triggerFeatureAnnouncement = (id, target, title, content) => {
    if (localStorage.getItem(`grh_whatsnew_seen_${id}`)) return; // Already seen
    
    // Announce the single step tooltip
    setWhatsNew({ id, target, title, content });
    setActiveTour(null); // Deactivate running tours to avoid clash
  };

  const dismissFeatureAnnouncement = (id) => {
    if (id) {
      localStorage.setItem(`grh_whatsnew_seen_${id}`, 'true');
    }
    setWhatsNew(null);
  };

  const hasCompletedTour = useCallback((tourName) => {
    return !!localStorage.getItem(LOCAL_STORAGE_KEYS[tourName]);
  }, []);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStep,
        isPaused,
        showExitConfirm,
        isMobile,
        whatsNew,
        startTour,
        nextStep,
        prevStep,
        pauseTour,
        resumeTour,
        endTour,
        triggerFeatureAnnouncement,
        dismissFeatureAnnouncement,
        steps: activeTour ? TOUR_STEPS[activeTour] : [],
        hasCompletedTour
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
