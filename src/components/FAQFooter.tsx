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

      {/* FULL-PAGE FOOTER WITH BIG TEXTS */}
      <footer id="footer" className="fullpage-footer" data-bg="#0c1033" data-theme="dark">
        <div className="footer-big-content">
          <h1 className="footer-huge-title">ENGLISH SPEAKING CLUB</h1>

          <div className="footer-big-links" aria-label="Social and Contact Links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FACEBOOK</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YOUTUBE</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">DISCORD</a>
            <a href="mailto:contact@esc-club.org" className="footer-big-email">CONTACT@ESC-CLUB.ORG</a>
          </div>

          <div className="footer-big-bottom">
            <span>© 2017–2026 ESC</span>
            <button type="button" onClick={scrollToTop} className="footer-back-to-top-btn">
              BACK TO TOP ↑
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
