import React, { useEffect } from 'react';
import './LegalPage.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-wrapper">
      <div className="legal-content-container">
        <header className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: March 12, 2024</p>
        </header>

        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            The Governance Resource Hub ("GRH", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our platform.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information Collection</h2>
          <p>
            We collect information that you provide directly to us when you register for an account, sign up for a newsletter, or participate in our workshops.
          </p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, job title, and organization.</li>
            <li><strong>Usage Data:</strong> Information about how you use our platform, including course progress and research interactions.</li>
            <li><strong>Third-Party Data:</strong> If you connect via Google OAuth, we receive authorized profile information as permitted by your settings.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Use of Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, operate, and maintain our platform.</li>
            <li>Improve, personalize, and expand our educational resources.</li>
            <li>Understand and analyze how you use our platform.</li>
            <li>Communicate with you regarding updates, newsletters, and marketing (with your consent).</li>
            <li>Verify certifications and workshop registrations.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> privacy@grh.org<br />
            <strong>Address:</strong> Governance Resource Hub, 123 Policy Ave, Suite 500
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
