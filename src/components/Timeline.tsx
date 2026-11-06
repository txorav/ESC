import React, { useEffect, useState, useRef } from 'react';

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
  const [rowScrollProgress, setRowScrollProgress] = useState(0);
  const rowClipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const mid = window.innerHeight * 0.5;
      const cards = document.querySelectorAll('.film-card');
      let currentIdx = 0;
      let progress = 0;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        if (rect.top <= mid) {
          currentIdx = idx;
          progress = Math.min(1, Math.max(0, (mid - rect.top) / rect.height));
        }
      });

      setActiveIndex(currentIdx);
      setRowScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (rowClipRef.current) {
      const maxScroll = rowClipRef.current.scrollWidth - rowClipRef.current.clientWidth;
      if (maxScroll > 0) {
        rowClipRef.current.scrollLeft = rowScrollProgress * maxScroll;
      }
    }
  }, [rowScrollProgress]);

  const currentEvent = TIMELINE_DATA[activeIndex] || TIMELINE_DATA[0];

  return (
    <section id="tl" data-bg={currentEvent.isVintage ? '#1C1E4B' : '#283FC3'}>
      <aside className="timeline-sidebar">
        {/* ReactBits OptionWheel Year Counter */}
        <div className="wheel-container">
          <ul
            className="wheel-track"
            style={{ transform: `translateY(${82 - activeIndex * 55}px)` }}
          >
            {TIMELINE_DATA.map((item, idx) => (
              <li key={item.year} className={idx === activeIndex ? 'active' : ''}>
                {item.year}
              </li>
            ))}
          </ul>
        </div>

        {/* Horizontal Row Clip for current event */}
        <div className="film-row-wrap">
          <div className="film-row-label">
            {currentEvent.year} Gallery · {currentEvent.photos} Photos
          </div>
          <div
            className={`film-row-clip ${currentEvent.isVintage ? 'vintage' : 'modern'}`}
            ref={rowClipRef}
          >
            {Array.from({ length: currentEvent.photos }, (_, p) => {
              const h1 = 220 + activeIndex * 12 + p * 18;
              const h2 = 350 - activeIndex * 8 + p * 14;
              return (
                <div
                  key={p}
                  className="row-img"
                  style={{
                    background: `linear-gradient(135deg, hsl(${h1}, 65%, 40%), hsl(${h2}, 75%, 45%))`
                  }}
                >
                  <span>Photo #{p + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Single Column Film Strip */}
      <div className="film-column">
        {TIMELINE_DATA.map((item, idx) => {
          const isVintage = item.isVintage;
          return (
            <article
              key={item.year}
              className={`film-card ${isVintage ? 'vintage' : 'modern'}`}
              data-index={idx}
            >
              <div
                className="film-media"
                style={{
                  background: `linear-gradient(135deg, hsl(${210 + idx * 14}, 60%, 35%), hsl(${340 - idx * 10}, 70%, 35%))`
                }}
              >
                {isVintage ? (
                  <div className="type" style={{ color: '#ede2cd', fontSize: '16px' }}>
                    ✦ ARCHIVE REEL #{item.year} ✦
                  </div>
                ) : (
                  <>
                    <div className="film-badge">MODERN ERA</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', color: '#fff', fontWeight: 800 }}>
                      ESC · {item.year}
                    </div>
                  </>
                )}
              </div>
              <div className="film-info">
                <h3 className="film-year-head">{item.year} · {item.title}</h3>
                <p className="film-desc">{item.desc}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
