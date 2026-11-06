import React, { useEffect, useState, useRef } from 'react';
import OptionWheel from './reactbits/OptionWheel';

interface EventYear {
  year: number;
  title: string;
  desc: string;
  photos: number;
  isVintage: boolean;
}

const TIMELINE_DATA: EventYear[] = [
  {
    year: 2017,
    title: 'ESC is Founded',
    desc: 'The inaugural meeting of the English Speaking Club brings together 30 passionate students to foster English dialogue on campus.',
    photos: 2,
    isVintage: true
  },
  {
    year: 2018,
    title: 'First English Week & Debates',
    desc: 'Campus-wide festivals, British parliamentary debate exhibitions, spelling bees, and cultural film screenings.',
    photos: 3,
    isVintage: true
  },
  {
    year: 2019,
    title: 'Inter-Faculty Debate Championship',
    desc: 'ESC hosts 16 student teams arguing competitive resolutions before an esteemed panel of professors.',
    photos: 2,
    isVintage: true
  },
  {
    year: 2020,
    title: 'Virtual Sessions & Global Outreach',
    desc: 'Seamlessly pivoting online during global lockdowns, connecting international guest speakers and virtual debate rounds.',
    photos: 1,
    isVintage: true
  },
  {
    year: 2021,
    title: 'Return to Campus & Expansion',
    desc: 'High-energy return to physical amphitheaters with double member enrollment and new cultural workshop modules.',
    photos: 3,
    isVintage: true
  },
  {
    year: 2022,
    title: 'ECHO Podcast Launch',
    desc: 'Debut of our dedicated recording studio and Spotify-syndicated student discussion podcast.',
    photos: 3,
    isVintage: false
  },
  {
    year: 2023,
    title: 'National Open Mic & TEDx Collaboration',
    desc: 'Record-breaking turnout for the annual Open Mic evening, celebrating student poetry, speeches, and monologue drama.',
    photos: 4,
    isVintage: false
  },
  {
    year: 2024,
    title: 'National Scientific Club Conclave',
    desc: 'ESC leads international delegations across partner scientific and engineering clubs, winning best delegation.',
    photos: 3,
    isVintage: false
  },
  {
    year: 2025,
    title: 'Annual Leadership Gala',
    desc: 'Recognizing outstanding alumni, club laureates, and celebrating the impact of over 1,200 alumni.',
    photos: 4,
    isVintage: false
  },
  {
    year: 2026,
    title: 'The Decade Horizon & Global Chapters',
    desc: 'Expanding cross-border communication workshops and pioneering AI-assisted rhetorical speaking labs.',
    photos: 2,
    isVintage: false
  }
];

export const Timeline: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const mid = window.innerHeight * 0.5;
      const frames = document.querySelectorAll('.film-reel-frame');
      let currentIdx = 0;

      frames.forEach((frame, idx) => {
        const rect = frame.getBoundingClientRect();
        if (rect.top <= mid) {
          currentIdx = idx;
        }
      });

      setActiveIndex(currentIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentEvent = TIMELINE_DATA[activeIndex] || TIMELINE_DATA[0];
  const currentBg = currentEvent.isVintage ? '#1C1E4B' : '#283FC3';

  // Smooth automatic scrolling when event has multiple photos (no manual scrollbars)
  useEffect(() => {
    const el = galleryViewportRef.current;
    if (!el) return;

    el.scrollLeft = 0;
    if (currentEvent.photos <= 1) return;

    let frameId: number;
    let pos = 0;
    let dir = 1;
    let pauseUntil = performance.now() + 800; // initial pause before gliding
    const speed = 0.9;

    const step = (timestamp: number) => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 2) {
        if (timestamp >= pauseUntil) {
          pos += speed * dir;
          if (pos >= maxScroll) {
            pos = maxScroll;
            dir = -1;
            pauseUntil = timestamp + 1200; // pause for 1.2s at end
          } else if (pos <= 0) {
            pos = 0;
            dir = 1;
            pauseUntil = timestamp + 1200; // pause for 1.2s at start
          }
          el.scrollLeft = pos;
        }
      }
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [activeIndex, currentEvent.photos]);

  return (
    <section
      id="tl"
      style={{ '--film-bg': currentBg } as React.CSSProperties}
      data-bg={currentBg}
    >
      {/* STICKY LAYERS OVERLAY (Pinned viewport-wide while scrolling) */}
      <div className="timeline-pinned-overlay">
        {/* LAYER 3 (TOP, z-index: 30): Big Year Selector in the center on the left (NO BOX, soft blur behind text) */}
        <div className="timeline-year-stage">
          <div className="year-wheel-clean">
            <OptionWheel
              items={TIMELINE_DATA.map((item) => String(item.year))}
              defaultSelected={activeIndex}
              onChange={(idx) => {
                setActiveIndex(idx);
                const frames = document.querySelectorAll('.film-reel-frame');
                if (frames[idx]) {
                  frames[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              fontSize={4.2}
              spacing={1.3}
              tilt={8}
              curve={1.1}
              inset={0}
              textColor="#5a709c"
              activeColor="#FFFFFF"
            />
          </div>
        </div>

        {/* LAYER 2 (MIDDLE, z-index: 20): Gallery Film Clip */}
        {/* Width equals the column picture width, passes under the year selector, auto-scrolls when multi-pictures */}
        <div className="film-gallery-floating-track">
          <div className="film-gallery-clip-viewport" ref={galleryViewportRef}>
            <div
              className={`film-gallery-clip ${currentEvent.isVintage ? 'vintage-film' : 'modern-film'}`}
            >
              {/* Top Sprocket Rail with perforations & film edge text */}
              <div className="sprocket-rail top-rail">
                <div className="sprocket-track">
                  {Array.from({ length: currentEvent.photos * 10 + 6 }).map((_, i) => (
                    <span key={i} className="sprocket-hole" />
                  ))}
                </div>
                <div className="film-edge-markings">
                  <span>✦ KODAK 500T 7219 · SAFETY FILM · 35mm</span>
                  <span>EXP {currentEvent.year}</span>
                </div>
              </div>

              {/* Film Frames: Contains only this year's photos, ending cleanly */}
              <div className="film-gallery-frames">
                {Array.from({ length: currentEvent.photos }, (_, p) => {
                  const hue = 215 + activeIndex * 14 + p * 22;
                  return (
                    <div key={p} className="film-gallery-photo-frame">
                      <div
                        className="gallery-photo-aperture"
                        style={{ background: `hsl(${hue}, 40%, 28%)` }}
                      >
                        <span className="photo-tag">Photo #{p + 1}</span>
                        <span className="photo-sub">35mm ARCHIVE</span>
                      </div>
                      <div className="frame-footer-code">
                        <span>▸ {p + 1}A</span>
                        <span>{currentEvent.year} GALLERY</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sprocket Rail with perforations & frame numbers */}
              <div className="sprocket-rail bottom-rail">
                <div className="sprocket-track">
                  {Array.from({ length: currentEvent.photos * 10 + 6 }).map((_, i) => (
                    <span key={i} className="sprocket-hole" />
                  ))}
                </div>
                <div className="film-edge-markings">
                  <span>EASTMAN KODAK CO · EMULSION #8402</span>
                  <span>{currentEvent.photos} FRAMES TOTAL ✦</span>
                </div>
              </div>

              {/* Authentic Film Cut Edge (ends once gallery photos end) */}
              <div className="film-clip-cut-end" title="End of Gallery Reel" />
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 1 (BASE, z-index: 10): Continuous Main Film Reel */}
      {/* One continuous 35mm film reel with connected frames and uninterrupted sprocket rails */}
      <div className="film-reel-continuous-column">
        <div className="film-reel-strip">
          {/* Continuous Left Sprocket Rail */}
          <div className="continuous-sprocket-rail left-rail">
            {Array.from({ length: TIMELINE_DATA.length * 16 }).map((_, i) => (
              <span key={i} className="sprocket-hole" />
            ))}
          </div>

          {/* Film Reel Body with Unbroken Sequence of Frames */}
          <div className="film-reel-frames-stream">
            {TIMELINE_DATA.map((item, idx) => {
              const isVintage = item.isVintage;
              const isActive = activeIndex === idx;
              return (
                <article
                  key={item.year}
                  className={`film-reel-frame ${isVintage ? 'vintage' : 'modern'} ${isActive ? 'active-frame' : ''}`}
                  data-index={idx}
                >
                  {/* Real Film Cell Aperture Window (exact same width as the row gallery clip) */}
                  <div
                    className="film-cell-aperture"
                    style={{
                      background: isVintage ? '#1e1710' : '#141d47'
                    }}
                  >
                    {isVintage ? (
                      <div className="reel-stamp">
                        <span className="stamp-star">✦</span>
                        <span className="stamp-title">ARCHIVE REEL #{item.year}</span>
                        <span className="stamp-star">✦</span>
                      </div>
                    ) : (
                      <div className="reel-stamp modern">
                        <span className="film-badge-modern">MODERN CHAPTER</span>
                        <span className="stamp-title">ESC · {item.year}</span>
                      </div>
                    )}
                    <div className="film-stock-stamp">KODAK 400 · EXP 2017</div>
                  </div>

                  {/* Frame Narrative Story */}
                  <div className="film-reel-story">
                    <h3 className="film-frame-heading">
                      {item.year} · {item.title}
                    </h3>
                    <p className="film-frame-desc">{item.desc}</p>
                  </div>

                  {/* Real Continuous Film Frame Divider (no gaps/separate boxes) */}
                  <div className="film-reel-frame-divider">
                    <span className="divider-line" />
                    <span className="divider-code">REEL #{item.year} // 35mm SAFETY</span>
                    <span className="divider-line" />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Continuous Right Sprocket Rail */}
          <div className="continuous-sprocket-rail right-rail">
            {Array.from({ length: TIMELINE_DATA.length * 16 }).map((_, i) => (
              <span key={i} className="sprocket-hole" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
