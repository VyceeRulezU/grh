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
            We collect information that you provide directly to us when you register for an account, sign up for a newsletter, or participate in our platform.
          </p>
          <ul>
            <li><strong>Google User Data:</strong> If you choose to sign in via Google OAuth, we access your <strong>email address, full name, and profile picture URL</strong> as permitted by your Google account settings.</li>
            <li><strong>Personal Data:</strong> Name, email address, job title, and organisation (when provided manually).</li>
            <li><strong>Usage Data:</strong> Information about how you use our platform, including course progress and research interactions.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Data Usage</h2>
          <p>
            We use the Google user data and other personal information we collect to:
          </p>
          <ul>
            <li><strong>Identity Verification:</strong> To create your GRH account and verify your identity during subsequent logins.</li>
            <li><strong>Service Operation:</strong> To provide, operate, and maintain the Governance Resource Hub platform.</li>
            <li><strong>Personalization:</strong> To display your name and profile picture within your specific account dashboard.</li>
            <li><strong>Communication:</strong> To send important account-related updates and resources you have requested.</li>
          </ul>
          <p>
            We process your data based on your consent provided during the OAuth authorisation or account registration process.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Data Sharing and Disclosure</h2>
          <p>
            <strong>We do not sell your personal data.</strong> Your Google user data is not shared with any third parties except in the following limited circumstances:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> We may share data with trusted vendors (such as Supabase for database management and Resend for transactional emails) specifically to provide our services. These vendors are contractually obligated to protect your data.</li>
            <li><strong>Legal Requirements:</strong> If required by law, we may disclose your information to comply with legal obligations or protect our rights.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Data Storage and Protection</h2>
          <p>
            We implement industry-standard technology and security measures to protect your data. All Google user data is stored securely using Supabase's encryption standards. We restrict access to personal information to GRH employees and contractors who need that information to process it for us.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Data Retention and Deletion</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide you with our services.
          </p>
          <ul>
            <li><strong>Right to Deletion:</strong> You have the right to request the deletion of your account and all associated data at any time.</li>
            <li><strong>Deletion Process:</strong> To request data deletion, please email us at <strong>admin@governanceresourcehub.com</strong>. Upon verification, we will delete your profile and Google user data from our active databases within 30 days.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> admin@governanceresourcehub.com<br />
            <strong>Address:</strong> Governance Resource Hub, Abuja, Nigeria
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
