import React, { useEffect, useState, useRef } from 'react';

interface MeasureData {
  id: string;
  target: number;
  suffix?: string;
  eyebrow: string;
  label: string;
  subheading: string;
  bg: string;
  pillColor: string;
}

const MEASURES: MeasureData[] = [
  {
    id: 'stats',
    target: 1250,
    suffix: '+',
    eyebrow: '02.1 / COMMUNITY SCALE',
    label: 'Active Members Since 2017',
    subheading: 'A vibrant community driven by passion, debate, and human connection across universities.',
    bg: '#A71017',
    pillColor: '#CD202A',
  },
  {
    id: 'stats-events',
    target: 120,
    suffix: '+',
    eyebrow: '02.2 / EXCELLENCE & IMPACT',
    label: 'Major Events & Tournaments',
    subheading: 'Inter-university debate championships, cultural summits, and speech competitions organized.',
    bg: '#1C1E4B',
    pillColor: '#283FC3',
  },
  {
    id: 'stats-workshops',
    target: 48,
    suffix: '+',
    eyebrow: '02.3 / CONTINUOUS MASTERY',
    label: 'Intensive Speaking Workshops',
    subheading: 'Empowering club members with public speaking, rhetoric, leadership, and stage presence.',
    bg: '#CD202A',
    pillColor: '#111744',
  },
  {
    id: 'stats-awards',
    target: 15,
    suffix: '+',
    eyebrow: '02.4 / HONORS & RECOGNITION',
    label: 'National Debate Awards',
    subheading: 'Recognized trophies and top speaker titles earned in prestigious national tournaments.',
    bg: '#111744',
    pillColor: '#CD202A',
  },
  {
    id: 'stats-partners',
    target: 9,
    suffix: '+',
    eyebrow: '02.5 / STRATEGIC ALLIANCES',
    label: 'Partner University Scientific Clubs',
    subheading: 'Collaborative events, mutual mentorships, and joint intellectual symposiums nationwide.',
    bg: '#2C3076',
    pillColor: '#283FC3',
  },
];

interface MeasureSectionProps {
  measure: MeasureData;
  floatVariant: number;
}

const MeasureSection: React.FC<MeasureSectionProps> = ({ measure, floatVariant }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId: number = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const trigger = () => {
      setIsVisible(true);
      if (!animatedRef.current) {
        animatedRef.current = true;
        const startTime = performance.now();
        const duration = 1600;

        const step = (now: number) => {
          const progress = Math.min(1, (now - startTime) / duration);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(measure.target * easeOut));

          if (progress < 1) {
            rafId = requestAnimationFrame(step);
          } else {
            setCount(measure.target);
          }
        };

        rafId = requestAnimationFrame(step);
        timerId = setTimeout(() => {
          setCount(measure.target);
        }, duration + 50);
      }
    };

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top < vh * 0.85 && rect.bottom > 0) {
        trigger();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trigger();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkVisibility);
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [measure.target]);

  return (
    <section
      className="sec stat-measure-sec"
      id={measure.id}
      data-bg={measure.bg}
      data-theme="dark"
      ref={sectionRef}
    >
      <div className={`stat-measure-content ${isVisible ? 'in' : ''}`}>
        <span className="stat-measure-eyebrow">{measure.eyebrow}</span>

        <div className="stat-pill-wrap">
          <div
            className={`stat-pill-3d stat-pill-float-${floatVariant}`}
            style={{ backgroundColor: measure.pillColor }}
          >
            <span className="stat-pill-number">
              {count.toLocaleString()}{measure.suffix}
            </span>
            <div className="stat-pill-label">{measure.label}</div>
          </div>
        </div>

        <p className="stat-measure-subheading">{measure.subheading}</p>
      </div>
    </section>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <div className="stats-measures-container">
      {MEASURES.map((m, idx) => (
        <MeasureSection
          key={m.id}
          measure={m}
          floatVariant={(idx % 3) + 1}
        />
      ))}
    </div>
  );
};

export default StatsSection;
