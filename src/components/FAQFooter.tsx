import React from 'react';

export const FAQFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* FAQ SECTION */}
      <section className="sec" id="faq" data-bg="#FFFFFF" data-theme="light">
        <div className="sec-divider esc-reveal" />
        <div className="sec-head-wrap esc-reveal">
          <span className="sec-eyebrow" style={{ color: 'rgba(17, 23, 68, 0.65)' }}>05 / INQUIRIES &amp; ADMISSIONS</span>
          <h2 className="sec-heading" style={{ color: 'var(--navy)' }}>Frequently Asked Questions</h2>
          <p className="sec-subheading" style={{ color: '#555' }}>Everything you need to know about joining ESC.</p>
        </div>

        <div className="faq-container esc-reveal">
          <details className="faq-item" open>
            <summary className="faq-q">Who is eligible to join ESC?</summary>
            <div className="faq-a">
              Any passionate university student or enthusiast who wants to polish their English fluency, public speaking, or debate skills. All proficiency levels are welcome!
            </div>
          </details>
          <details className="faq-item">
            <summary className="faq-q">How often does the club hold sessions?</summary>
            <div className="faq-a">
              We run weekly Discussion Groups on Wednesdays, specialized debate training on Saturdays, and monthly ECHO podcast recordings.
            </div>
          </details>
          <details className="faq-item">
            <summary className="faq-q">Do I need prior public speaking or debate experience?</summary>
            <div className="faq-a">
              Not at all! Our workshops are designed to take beginners from stage fright to confident, articulate speakers in a supportive and encouraging setting.
            </div>
          </details>
          <details className="faq-item">
            <summary className="faq-q">How can I audition or register for departments?</summary>
            <div className="faq-a">
              Recruitment opens at the start of each academic semester. Reach out via our social links below or talk to any board member!
            </div>
          </details>
        </div>
      </section>

      {/* FULL-PAGE FOOTER WITH SITE MAP & SOCIAL MEDIA ICONS */}
      <footer id="footer" className="fullpage-footer" data-bg="#111744" data-theme="dark">
        <div className="footer-big-content">
          <div className="footer-brand-header">
            <h1 className="footer-huge-title">ENGLISH SPEAKING CLUB</h1>
            <p className="footer-brand-tagline">
              EST. 2017 · UNIVERSITY OF SCIENCE &amp; TECHNOLOGY HOUARI BOUMEDIENE
            </p>
          </div>

          {/* Common Layout: Site Map & Directory Grid */}
          <div className="footer-sitemap-grid">
            {/* Site Pages Column */}
            <div className="footer-sitemap-col">
              <h3 className="footer-col-title">SITE MAP</h3>
              <nav className="footer-nav-list" aria-label="Site map">
                <a href="#home">01 / Home Desk</a>
                <a href="#intro">02 / About Us</a>
                <a href="#tl">03 / Historical Timeline</a>
                <a href="#stats">04 / Scale &amp; Impact</a>
                <a href="#board">05 / Board Members</a>
                <a href="#dept">06 / Departments</a>
                <a href="#faq">07 / FAQ &amp; Admissions</a>
              </nav>
            </div>

            {/* Departments Column */}
            <div className="footer-sitemap-col">
              <h3 className="footer-col-title">DEPARTMENTS</h3>
              <nav className="footer-nav-list" aria-label="Departments">
                <a href="#dept">Debate Guild</a>
                <a href="#dept">Public Speaking</a>
                <a href="#dept">Creative Writing</a>
                <a href="#dept">ECHO Media &amp; Podcast</a>
              </nav>
            </div>

            {/* Community & Contact Column */}
            <div className="footer-sitemap-col">
              <h3 className="footer-col-title">COMMUNITY</h3>
              <div className="footer-nav-list">
                <span>Weekly Discussion Groups</span>
                <span>National Debate Circuit</span>
                <span>Annual Literary Anthology</span>
                <a href="mailto:contact@esc-club.org" className="footer-email-text">
                  contact@esc-club.org
                </a>
              </div>
            </div>

            {/* Social Media as Icons Column */}
            <div className="footer-sitemap-col footer-socials-col">
              <h3 className="footer-col-title">SOCIAL MEDIA</h3>
              <p className="footer-socials-note">
                Connect with our official channels for meeting notices, tournament highlights, and auditions.
              </p>
              <div className="footer-social-icons" aria-label="Social media channels">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="Discord"
                  title="Discord"
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>

                {/* Email */}
                <a
                  href="mailto:contact@esc-club.org"
                  className="social-icon-btn"
                  aria-label="Email ESC"
                  title="Email"
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-big-bottom">
            <span>© 2017–2026 ENGLISH SPEAKING CLUB. ALL RIGHTS RESERVED.</span>
            <button type="button" onClick={scrollToTop} className="footer-back-to-top-btn">
              BACK TO TOP ↑
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
