import React from 'react';

export const FAQFooter: React.FC = () => {
  return (
    <>
      {/* FAQ SECTION */}
      <section className="sec" id="faq" data-bg="#FFFFFF">
        <h2 className="sec-heading" style={{ color: 'var(--navy)' }}>Frequently Asked Questions</h2>
        <p className="sec-subheading" style={{ color: '#666' }}>Everything you need to know about joining ESC.</p>
        <div className="faq-container">
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

      {/* FOOTER */}
      <footer>
        <h3>Connect With ESC</h3>
        <p className="footer-sub">Stay updated with our latest workshops, podcast drops, and inter-university debate competitions.</p>
        <div className="social-links">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
        </div>
        <div className="copy-text">© 2017–2026 English Speaking Club (ESC). Crafted with pride for passionate communicators.</div>
      </footer>
    </>
  );
};
