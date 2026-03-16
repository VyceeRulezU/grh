import React, { useEffect } from 'react';
import './LegalPage.css';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-wrapper">
      <div className="legal-content-container">
        <header className="legal-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: March 12, 2024</p>
        </header>

        <section className="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Governance Resource Hub (GRH), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are prohibited from using the site and its services.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us.
          </p>
          <p>
            The Content and the Marks are provided on the Site "AS IS" for your information and personal use only.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. User Representations</h2>
          <p>
            By using the Site, you represent and warrant that:
          </p>
          <ul>
            <li>All registration information you submit will be true, accurate, current, and complete.</li>
            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
            <li>You will not use the Site for any illegal or unauthorized purpose.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Prohibited Activities</h2>
          <p>
            You may not access or use the Site for any purpose other than that for which we make the Site available. Prohibited activities include, but are not limited to:
          </p>
          <ul>
            <li>Systematic retrieval of data or other content from the Site to create or compile a collection, compilation, database, or directory.</li>
            <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
            <li>Attempt to impersonate another user or person or use the username of another user.</li>
            <li>Use the Site in a manner inconsistent with any applicable laws or regulations.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Account Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to the Site at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the Site, us, or third parties, or for any other reason.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Modifications and Interruptions</h2>
          <p>
            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions or concerns about these Terms, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> admin@governanceresourcehub.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
