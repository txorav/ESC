import React, { useEffect, useRef, useState } from 'react';

export const FAQFooter: React.FC = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

        {/* Scrolling Transition Bridge between FAQ and the Full-Page Footer */}
        <div className="faq-to-footer-transition" aria-hidden="true">
          <button
            type="button"
            className="faq-transition-cue"
            onClick={scrollToFooter}
            aria-label="Scroll to footer"
          >
            <span className="cue-dot" />
            <span className="cue-label">Connect with ESC</span>
            <span className="cue-arrow">↓</span>
          </button>
          <svg className="faq-transition-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,120 C360,25 1080,25 1440,120 L1440,120 L0,120 Z"
              fill="#0c1033"
            />
          </svg>
        </div>
      </section>

      {/* FULL-PAGE MINIMAL FOOTER */}
      <footer
        id="footer"
        ref={footerRef}
        className={`fullpage-footer ${inView ? 'is-visible' : ''}`}
        data-bg="#0c1033"
      >
        <div className="footer-ambient-glow" aria-hidden="true" />

        {/* TOP BAR: Minimal Identity & Return to Top */}
        <div className="footer-top-bar">
          <div className="footer-brand-mono">
            <span className="brand-dot" />
            <span>ENGLISH SPEAKING CLUB</span>
            <span className="brand-divider">/</span>
            <span className="brand-year">EST. 2017</span>
          </div>

          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <span className="top-arrow">↑</span>
          </button>
        </div>

        {/* CENTER STAGE: Bold Minimal Headline & Clean Links */}
        <div className="footer-main-stage">
          <p className="footer-kicker">THE PODIUM AWAITS</p>
          <h2 className="footer-main-title">
            Where Voices Rise.
          </h2>
          <p className="footer-main-sub">
            A sanctuary for articulate minds, fearless rhetoric, and timeless leadership.
          </p>

          <div className="footer-contact-wrap">
            <a href="mailto:contact@esc-club.org" className="footer-direct-mail">
              <span>contact@esc-club.org</span>
              <span className="mail-arrow">↗</span>
            </a>
          </div>

          {/* Minimalist Social Links */}
          <div className="footer-minimal-socials" aria-label="Social Links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <span className="dot-sep" aria-hidden="true">·</span>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <span className="dot-sep" aria-hidden="true">·</span>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <span className="dot-sep" aria-hidden="true">·</span>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
            <span className="dot-sep" aria-hidden="true">·</span>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
          </div>

          {/* Minimal Navigation Anchors */}
          <nav className="footer-minimal-nav" aria-label="Quick Navigation">
            <a href="#home">Home</a>
            <a href="#intro">About</a>
            <a href="#tl">Events</a>
            <a href="#board">DG</a>
            <a href="#dept">Activities</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>

        {/* BOTTOM BAR: Quiet Minimal Fine-Print */}
        <div className="footer-bottom-bar">
          <div className="footer-copy">
            © 2017–2026 English Speaking Club. All rights reserved.
          </div>
          <div className="footer-location">
            Room 304 · Old Humanities Wing
          </div>
          <div className="footer-motto">
            Debate · Rhetoric · Leadership
          </div>
        </div>
      </footer>
    </>
  );
};
