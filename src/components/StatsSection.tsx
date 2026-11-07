import React, { useEffect, useState, useRef } from 'react';

export const StatsSection: React.FC = () => {
  const [counts, setCounts] = useState({
    events: 0,
    workshops: 0,
    members: 0,
    awards: 0,
    partners: 0
  });

  const sectionRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const startTime = performance.now();
            const duration = 1800;

            const targets = {
              events: 120,
              workshops: 48,
              members: 1250,
              awards: 15,
              partners: 9
            };

            const step = (now: number) => {
              const progress = Math.min(1, (now - startTime) / duration);
              const easeOut = progress * (2 - progress);

              setCounts({
                events: Math.round(targets.events * easeOut),
                workshops: Math.round(targets.workshops * easeOut),
                members: Math.round(targets.members * easeOut),
                awards: Math.round(targets.awards * easeOut),
                partners: Math.round(targets.partners * easeOut)
              });

              if (progress < 1) {
                requestAnimationFrame(step);
              }
            };

            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="sec" id="stats" data-bg="#A71017" data-theme="dark" ref={sectionRef}>
      <div className="sec-divider esc-reveal" />
      <div className="sec-head-wrap esc-reveal">
        <span className="sec-eyebrow">02 / SCALE &amp; IMPACT</span>
        <h2 className="sec-heading">Our Numbers Speak</h2>
        <p className="sec-subheading">A vibrant community driven by passion, debate, and human connection.</p>
      </div>

      <div className="stats-layout esc-reveal">
        <div className="stat-col">
          <div className="stat-badge">
            <div className="stat-number">{counts.events}</div>
            <div className="stat-label">Major Events &amp; Tournaments</div>
          </div>
          <div className="stat-badge">
            <div className="stat-number">{counts.workshops}</div>
            <div className="stat-label">Intensive Speaking Workshops</div>
          </div>
        </div>

        <div className="pill-3d-wrap">
          <div className="pill-3d">
            <span className="pill-huge-num">{counts.members.toLocaleString()}</span>
            <div className="pill-caption">Active Members Since 2017</div>
          </div>
        </div>

        <div className="stat-col">
          <div className="stat-badge">
            <div className="stat-number">{counts.awards}</div>
            <div className="stat-label">National Debate Awards</div>
          </div>
          <div className="stat-badge">
            <div className="stat-number">{counts.partners}</div>
            <div className="stat-label">Partner University Scientific Clubs</div>
          </div>
        </div>
      </div>
    </section>
  );
};
