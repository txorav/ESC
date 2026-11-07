import React, { useEffect, useMemo, useRef, useState } from 'react';
import OptionWheel from './reactbits/OptionWheel';
import GradualBlur from './reactbits/GradualBlur';

export interface FilmPhotoFrame {
  id: string;
  frameCode: string;
  caption: string;
  dateStamp: string;
  imageUrl?: string;
  palette: [string, string, string];
  focalLabel: string;
}

export interface TimelineEventItem {
  id: string;
  year: number;
  season: string;
  edgeCode: string;
  title: string;
  subtitle: string;
  location: string;
  narrative: string;
  photos: FilmPhotoFrame[];
}

const TIMELINE_EVENTS: TimelineEventItem[] = [
  {
    id: 'esc-2017',
    year: 2017,
    season: 'AUTUMN',
    edgeCode: 'KODAK 5222 DOUBLE-X  •  2017-A',
    title: 'The First Table in Room 304',
    subtitle: 'Twelve Founding Members & One Wooden Gavel',
    location: 'Old Humanities Wing, Room 304',
    narrative:
      'On a rain-slicked Thursday evening in October 2017, twelve students pulled four seminar tables into a hollow square. Without a budget or faculty sponsor, the first motion—“This House believes silence is complicity”—was debated for three unbroken hours under fluorescent lights.',
    photos: [
      {
        id: '2017-1',
        frameCode: '17A  •  01',
        caption: 'Founding ledger signed in fountain ink at the close of the inaugural session.',
        dateStamp: '19 OCT 2017',
        palette: ['#1e1610', '#4a2f1b', '#d4a046'],
        focalLabel: 'FOUNDING LEDGER & WOODEN GAVEL',
      },
    ],
  },
  {
    id: 'esc-2018',
    year: 2018,
    season: 'SPRING',
    edgeCode: 'ILFORD HP5 PLUS 400  •  2018-B',
    title: 'The Inaugural British Parliamentary Invitational',
    subtitle: 'Four Benches, Fifteen Minutes Prep, Zero Scripts',
    location: 'Grand Amphitheatre',
    narrative:
      'Adopting full British Parliamentary rules transformed casual conversation into high-wire intellectual athletics. Visiting adjudicators filled the back rows as novice speakers delivered seven-minute constructive speeches while fielding rapid-fire Points of Information.',
    photos: [
      {
        id: '2018-1',
        frameCode: '18B  •  01',
        caption: 'Opening Government bench consulting handwritten prep sheets two minutes before call to order.',
        dateStamp: '14 APR 2018',
        palette: ['#141d28', '#2e455e', '#ede2cd'],
        focalLabel: 'FIFTEEN-MINUTE PREP CHAMBER',
      },
      {
        id: '2018-2',
        frameCode: '18B  •  02',
        caption: 'Leader of the Opposition rising on a Point of Information during the Grand Final.',
        dateStamp: '14 APR 2018',
        palette: ['#1e1620', '#483045', '#d4a046'],
        focalLabel: 'POINT OF INFORMATION ON THE FLOOR',
      },
      {
        id: '2018-3',
        frameCode: '18B  •  03',
        caption: 'Chief Adjudicator announcing the split 3–2 panel decision to a standing auditorium.',
        dateStamp: '15 APR 2018',
        palette: ['#16221c', '#304e41', '#ede2cd'],
        focalLabel: 'THE ADJUDICATION VERDICT',
      },
    ],
  },
  {
    id: 'esc-2019',
    year: 2019,
    season: 'WINTER',
    edgeCode: 'KODAK TRI-X 400  •  2019-C',
    title: 'Candlelight Rhetoric & Literary Salons',
    subtitle: 'Oratory Beyond the Tournament Floor',
    location: 'North Library Reading Room',
    narrative:
      'Recognizing that persuasion lives as much in poetry and narrative as in rebuttal, the Club launched Friday Salons. Speakers dissected classic speeches from Cicero to Baldwin, testing cadence and rhetorical pause in an acoustic rotunda.',
    photos: [
      {
        id: '2019-1',
        frameCode: '19C  •  01',
        caption: 'Annotated folios of Demosthenes and James Baldwin spread across the oak reading desk.',
        dateStamp: '22 NOV 2019',
        palette: ['#221614', '#55342a', '#d4a046'],
        focalLabel: 'NORTH LIBRARY READING FOLIOS',
      },
    ],
  },
  {
    id: 'esc-2020',
    year: 2020,
    season: 'AUTUMN',
    edgeCode: 'CINE-STILL 800T  •  2020-D',
    title: 'Voices Across Static: The Midnight Broadcasts',
    subtitle: 'When the Halls Closed, the Microphones Opened',
    location: 'Remote Acoustic Feeds & Studio Booth B',
    narrative:
      'With lecture halls locked during global lockdowns, the Club engineered a distributed broadcast network. Debates and late-night cultural symposia continued across time zones, proving fellowship needed no shared walls to endure.',
    photos: [
      {
        id: '2020-1',
        frameCode: '20D  •  01',
        caption: 'Condenser microphone and analog VU meters glowing during Episode 01 of the ESC Airwaves.',
        dateStamp: '08 OCT 2020',
        palette: ['#101b22', '#214253', '#8ecae6'],
        focalLabel: 'BOOTH B CONDENSER & VU METER',
      },
      {
        id: '2020-2',
        frameCode: '20D  •  02',
        caption: 'Split-feed adjudication board tracking 32 debaters dialing in from six countries.',
        dateStamp: '09 OCT 2020',
        palette: ['#1a1626', '#372d54', '#cdb4db'],
        focalLabel: 'TRANSCONTINENTAL TABULATION ROOM',
      },
    ],
  },
  {
    id: 'esc-2021',
    year: 2021,
    season: 'AUTUMN',
    edgeCode: 'ILFORD DELTA 3200  •  2021-E',
    title: 'The Return to the Mahogany Podium',
    subtitle: 'First In-Person Convocation After Eighteen Months',
    location: 'Chancellor Hall',
    narrative:
      'When the doors of Chancellor Hall finally swung back open, over two hundred applicants packed the aisles. Veterans who had only ever debated through headphones stepped up to the physical lectern to thunderous desk-thumping applause.',
    photos: [
      {
        id: '2021-1',
        frameCode: '21E  •  01',
        caption: 'Standing-room crowd extending out into the marble vestibule on Convocation Night.',
        dateStamp: '03 OCT 2021',
        palette: ['#201811', '#4e3b29', '#edd6b1'],
        focalLabel: 'CHANCELLOR HALL CONVOCATION',
      },
    ],
  },
  {
    id: 'esc-2022',
    year: 2022,
    season: 'SPRING',
    edgeCode: 'KODAK VISION3 500T  •  2022-F',
    title: 'National Championship Run & Four-Round Sweep',
    subtitle: 'Unanimous Out-Rounds Through the Grand Final',
    location: 'National Debate Union Chamber',
    narrative:
      'Fielding three hybrid teams of senior whips and first-year prodigies, the Club swept all nine preliminary rounds before capturing the National Silver Mace on an opposition motion dissecting sovereign AI governance.',
    photos: [
      {
        id: '2022-1',
        frameCode: '22F  •  01',
        caption: 'Team ESC-A walking the colonnade during the fifteen-minute semifinal motion release.',
        dateStamp: '18 MAR 2022',
        palette: ['#131c17', '#284337', '#c7dec9'],
        focalLabel: 'SEMIFINAL COLONNADE WALK',
      },
      {
        id: '2022-2',
        frameCode: '22F  •  02',
        caption: 'Closing Opposition Whip synthesis notes sketched across three legal pads.',
        dateStamp: '19 MAR 2022',
        palette: ['#221814', '#52372d', '#e8ccb5'],
        focalLabel: 'CLOSING WHIP LEGAL PADS',
      },
      {
        id: '2022-3',
        frameCode: '22F  •  03',
        caption: 'The National Silver Mace resting beside the original 2017 club gavel.',
        dateStamp: '20 MAR 2022',
        palette: ['#171d29', '#33435f', '#f0d89c'],
        focalLabel: 'THE SILVER MACE & ORIGINAL GAVEL',
      },
      {
        id: '2022-4',
        frameCode: '22F  •  04',
        caption: 'Midnight train return with the championship banner draped across the dining car.',
        dateStamp: '20 MAR 2022',
        palette: ['#1b151f', '#3e304b', '#e3c9ec'],
        focalLabel: 'MIDNIGHT DINING CAR RETURN',
      },
    ],
  },
  {
    id: 'esc-2023',
    year: 2023,
    season: 'AUTUMN',
    edgeCode: 'KODAK 5222 DOUBLE-X  •  2023-G',
    title: 'The Permanent Broadcast Conservatory',
    subtitle: 'Opening the Dedicated ESC Audio & Archival Suite',
    location: 'Media Conservatory, West Vault',
    narrative:
      'To preserve every visiting lecture and exhibition debate, members outfitted a timber-baffled recording conservatory. Long-form interviews with diplomats, journalists, and poets entered the permanent public archive.',
    photos: [
      {
        id: '2023-1',
        frameCode: '23G  •  01',
        caption: 'Cedar acoustic diffusers and reel-to-reel archival backups in the West Vault.',
        dateStamp: '11 NOV 2023',
        palette: ['#21160f', '#4f3322', '#deb887'],
        focalLabel: 'WEST VAULT ACOUSTIC DIFFUSERS',
      },
    ],
  },
  {
    id: 'esc-2024',
    year: 2024,
    season: 'SPRING',
    edgeCode: 'ILFORD FP4 PLUS 125  •  2024-H',
    title: 'The International Exhibition & Open-Air Agora',
    subtitle: 'Hosting Visiting Unions Under the Courtyard Colonnade',
    location: 'Central Quadrangle Colonnade',
    narrative:
      'Moving the podium outdoors for the Spring Agora invited the entire campus to question speakers from the floor. Four hundred spectators stayed past sunset as visiting unions debated constitutional memory and civic duty.',
    photos: [
      {
        id: '2024-1',
        frameCode: '24H  •  01',
        caption: 'Dusk floodlights illuminating the open-air dispatch box in the Central Quadrangle.',
        dateStamp: '04 MAY 2024',
        palette: ['#131e26', '#29465c', '#e8d1a7'],
        focalLabel: 'OPEN-AIR DISPATCH BOX AT DUSK',
      },
      {
        id: '2024-2',
        frameCode: '24H  •  02',
        caption: 'Floor microphones queued six deep with audience members offering rebuttals.',
        dateStamp: '04 MAY 2024',
        palette: ['#1f1912', '#4a3b26', '#f2dfb8'],
        focalLabel: 'AUDIENCE FLOOR MICROPHONE QUEUE',
      },
      {
        id: '2024-3',
        frameCode: '24H  •  03',
        caption: 'Visiting delegation signing the vellum guestbook beside the courtyard lanterns.',
        dateStamp: '05 MAY 2024',
        palette: ['#161e18', '#314636', '#d6e3c8'],
        focalLabel: 'COURTYARD VELLUM GUESTBOOK',
      },
    ],
  },
  {
    id: 'esc-2025',
    year: 2025,
    season: 'AUTUMN',
    edgeCode: 'KODAK TRI-X 400  •  2025-J',
    title: 'The Mentorship Guild & Junior Rhetoricians',
    subtitle: 'Passing the Craft to High School & First-Year Fellows',
    location: 'Seminar Hall IV',
    narrative:
      'Senior adjudicators established a year-round fellowship pairing every incoming speaker with an alumnus mentor, ensuring the club’s foundational rigor and generosity remained unbroken across generations.',
    photos: [
      {
        id: '2025-1',
        frameCode: '25J  •  01',
        caption: 'First-year fellows practicing constructive timing drills with analog stopwatches.',
        dateStamp: '27 SEP 2025',
        palette: ['#1d1613', '#45352c', '#e0c6b0'],
        focalLabel: 'STOPWATCH CONSTRUCTIVE DRILLS',
      },
    ],
  },
  {
    id: 'esc-2026',
    year: 2026,
    season: 'PRESENT',
    edgeCode: 'KODAK VISION3 250D  •  2026-K',
    title: 'Ten Years of the Living Voice',
    subtitle: 'The Decade Archive & Centennial Vision',
    location: 'The Historic Founders Desk & Main Chamber',
    narrative:
      'Entering its tenth academic year, the English Speaking Club stands as a living parliament of alumni, broadcasters, and debaters—still anchored by the same scarred wooden table where twelve voices first broke the silence.',
    photos: [
      {
        id: '2026-1',
        frameCode: '26K  •  01',
        caption: 'Eight generations of Club Presidents gathered around Archive Table No. IV.',
        dateStamp: '12 OCT 2026',
        palette: ['#22160f', '#543723', '#f2d399'],
        focalLabel: 'EIGHT GENERATIONS AT TABLE IV',
      },
      {
        id: '2026-2',
        frameCode: '26K  •  02',
        caption: 'The digitized 35mm film & audio vault preserving a decade of spoken history.',
        dateStamp: '12 OCT 2026',
        palette: ['#101a25', '#243d58', '#e6c786'],
        focalLabel: 'THE DECADE ARCHIVAL VAULT',
      },
    ],
  },
];

const clamp = (val: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, val));

export const Timeline: React.FC = () => {
  const [activeYear, setActiveYear] = useState<number>(TIMELINE_EVENTS[0].year);

  const years = useMemo(() => TIMELINE_EVENTS.map((ev) => ev.year), []);
  const activeYearIndex = useMemo(
    () => Math.max(0, years.indexOf(activeYear)),
    [years, activeYear]
  );

  // Runway container refs
  const eventRunwayRefs = useRef<(HTMLElement | null)[]>([]);
  // Horizontal track refs inside multi-photo apertures
  const horizontalTrackRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Horizontal clip shell refs
  const horizontalClipShellRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Aperture stage element refs
  const apertureStageRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Top-right HUD frame counter readout refs
  const frameReadoutRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Synchronized caption element refs
  const activeCaptionRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    let rafId = 0;
    const smoothedProgress = TIMELINE_EVENTS.map(() => 0);
    const smoothedEntry = TIMELINE_EVENTS.map(() => 0);
    const smoothedExit = TIMELINE_EVENTS.map(() => 0);

    const updateScrollChoreography = () => {
      const vh = window.innerHeight || 1;
      const viewportCenter = vh * 0.5;
      let closestYear = TIMELINE_EVENTS[0].year;
      let minCenterDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < TIMELINE_EVENTS.length; i++) {
        const event = TIMELINE_EVENTS[i];
        const runwayEl = eventRunwayRefs.current[i];
        if (!runwayEl) continue;

        const rect = runwayEl.getBoundingClientRect();

        // Determine which event owns the viewport center to sync the Left Year Stage
        if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
          closestYear = event.year;
          minCenterDist = 0;
        } else {
          const dist = Math.min(
            Math.abs(rect.top - viewportCenter),
            Math.abs(rect.bottom - viewportCenter)
          );
          if (dist < minCenterDist) {
            minCenterDist = dist;
            closestYear = event.year;
          }
        }

        // Multi-Photo Horizontal Film Strip Mechanics (Zero Timers, Pure Scroll-Driven)
        const photoCount = event.photos.length;
        if (photoCount > 1) {
          const trackEl = horizontalTrackRefs.current[i];
          const clipShellEl = horizontalClipShellRefs.current[i];
          const apertureEl = apertureStageRefs.current[i];
          const readoutEl = frameReadoutRefs.current[i];
          const captionEl = activeCaptionRefs.current[i];

          if (!trackEl || !clipShellEl || !apertureEl) continue;

          // Vertical distance during which the event card is sticky-pinned
          const totalPinDistance = Math.max(1, rect.height - vh);
          const rawPinProgress = clamp(-rect.top / totalPinDistance, 0, 1);

          // Entry progress: slides horizontal clip in from the left under the Year Stage
          const rawEntryProgress = clamp(1 - rect.top / (vh * 0.55), 0, 1);

          // Exponential damping for cinematic, jitter-free 35mm gliding
          const prevP = smoothedProgress[i];
          const nextP =
            Math.abs(rawPinProgress - prevP) < 0.0004
              ? rawPinProgress
              : prevP + (rawPinProgress - prevP) * 0.18;
          smoothedProgress[i] = nextP;

          const prevE = smoothedEntry[i];
          const nextE =
            Math.abs(rawEntryProgress - prevE) < 0.0004
              ? rawEntryProgress
              : prevE + (rawEntryProgress - prevE) * 0.18;
          smoothedEntry[i] = nextE;

          const apertureWidth = apertureEl.clientWidth || 640;
          const frameDividerWidth = 18;
          const stepStridePx = apertureWidth + frameDividerWidth;

          // 1. The clip travels in from beyond the screen's left edge (passing under the
          //    year stage, z-index 30) and, once the gallery is done, keeps travelling right
          //    over the frame and out. Pure transform: no opacity at any point.
          const leaderPx = 240;
          const apertureLeft = apertureEl.getBoundingClientRect().left;
          const rawExit = clamp((vh - rect.bottom) / (vh * 0.45), 0, 1);
          const prevX = smoothedExit[i];
          const nextX = Math.abs(rawExit - prevX) < 0.0004 ? rawExit : prevX + (rawExit - prevX) * 0.18;
          smoothedExit[i] = nextX;
          const inOffsetPx = -(1 - nextE) * (Math.max(apertureLeft, 0) + apertureWidth + leaderPx);
          const outOffsetPx = nextX * (apertureWidth + leaderPx + Math.max(window.innerWidth - apertureLeft - apertureWidth, 0));
          clipShellEl.style.transform = `translate3d(${(inOffsetPx + outOffsetPx).toFixed(1)}px, 0, 0)`;

          // 2. Drive horizontal photo frames leftwards across the aperture window
          const continuousFrameIndex = nextP * (photoCount - 1);
          const trackShiftPx = -continuousFrameIndex * stepStridePx;
          trackEl.style.transform = `translate3d(${trackShiftPx.toFixed(1)}px, 0, 0)`;

          // 3. Update active frame readout & frame-specific archival caption
          const activeFrameIdx = Math.min(
            photoCount - 1,
            Math.max(0, Math.round(continuousFrameIndex))
          );
          if (readoutEl) {
            const nextText = `FRAME 0${activeFrameIdx + 1} / 0${photoCount}`;
            if (readoutEl.textContent !== nextText) {
              readoutEl.textContent = nextText;
            }
          }
          if (captionEl) {
            const activePhoto = event.photos[activeFrameIdx];
            const nextCaption = `${activePhoto.frameCode} — ${activePhoto.caption}`;
            if (captionEl.textContent !== nextCaption) {
              captionEl.textContent = nextCaption;
            }
          }
        }
      }

      setActiveYear((prev) => (prev !== closestYear ? closestYear : prev));
      rafId = window.requestAnimationFrame(updateScrollChoreography);
    };

    rafId = window.requestAnimationFrame(updateScrollChoreography);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleSelectYear = (year: number) => {
    const idx = TIMELINE_EVENTS.findIndex((ev) => ev.year === year);
    const targetEl = eventRunwayRefs.current[idx];
    if (targetEl) {
      const targetTop = window.scrollY + targetEl.getBoundingClientRect().top - 40;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  const currentEvent =
    TIMELINE_EVENTS.find((ev) => ev.year === activeYear) || TIMELINE_EVENTS[0];
  const isVintage = currentEvent.year <= 2021;
  const currentBg = isVintage ? '#1C1E4B' : '#283FC3';

  return (
    <section
      id="tl"
      style={{ '--film-bg': currentBg } as React.CSSProperties}
      data-bg={currentBg}
      className="tl-archive-section"
      aria-label="English Speaking Club Historical 35mm Film Timeline"
    >
      {/* Full Left-Side Section-Bounded Persistent Gradual Blur from React Bits (behind year stage, zero card bounds) */}
      <div className="timeline-persistent-blur-wrap" aria-hidden="true">
        <div className="timeline-persistent-blur-sticky">
          <GradualBlur
            position="left"
            width="100%"
            height="100%"
            strength={3.5}
            layers={10}
            curve="bezier"
            exponential
            tint="rgba(14, 18, 52, 0.45)"
            zIndex={25}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 0,
            }}
          />
        </div>
      </div>

      <div className="tl-split-layout">
        {/* =================================================================
            LEFT SIDE: THE YEAR STAGE (Zero Card Bounds, Pure Floating Typography)
            ================================================================= */}
        <aside className="timeline-year-stage" aria-label="Historical Year Selector">
          <div className="year-wheel-clean">
            <OptionWheel
              items={years.map((y) => String(y))}
              defaultSelected={activeYearIndex}
              onChange={(idx) => {
                const targetYear = years[idx];
                if (targetYear) {
                  setActiveYear(targetYear);
                  handleSelectYear(targetYear);
                }
              }}
              fontSize={5.4}
              spacing={1.35}
              tilt={8}
              curve={1.1}
              inset={0}
              textColor="#5a709c"
              activeColor="#FFFFFF"
            />
          </div>
        </aside>

        {/* =================================================================
            RIGHT SIDE: CONTINUOUS VERTICAL 35MM FILM REEL COLUMN
            ================================================================= */}
        <div className="film-reel-continuous-column">
          {/* Uninterrupted Left & Right Vertical 35mm Sprocket Rails */}
          <div
            className="film-vertical-sprocket-rail film-vertical-sprocket-rail--left"
            aria-hidden="true"
          />
          <div
            className="film-vertical-sprocket-rail film-vertical-sprocket-rail--right"
            aria-hidden="true"
          />

          <div className="film-reel-events-stream">
            {TIMELINE_EVENTS.map((event, index) => {
              const isMultiPhoto = event.photos.length > 1;
              const runwayStyle: React.CSSProperties = isMultiPhoto
                ? { height: `calc(100vh + ${(event.photos.length - 1) * 75}vh)` }
                : {};

              const primaryPhoto = event.photos[0];

              return (
                <article
                  key={event.id}
                  ref={(el) => {
                    eventRunwayRefs.current[index] = el;
                  }}
                  className={`film-event-runway ${
                    isMultiPhoto
                      ? 'film-event-runway--multi'
                      : 'film-event-runway--single'
                  }`}
                  style={runwayStyle}
                  data-year={event.year}
                >
                  <div
                    className={`film-cell-stage ${
                      isMultiPhoto ? 'film-cell-stage--sticky' : ''
                    }`}
                  >
                    <div className="film-archival-cell">
                      {/* Top 35mm Edge Code Metadata Bar */}
                      <header className="film-cell-edge-header">
                        <span className="film-edge-code">{event.edgeCode}</span>
                        <span className="film-edge-season">
                          {event.season} {event.year}
                        </span>
                      </header>

                      {/* =====================================================
                          PICTURE PLACEHOLDER APERTURE WINDOW
                          Strictly bounds the photo and horizontal 35mm clip overlay.
                          ===================================================== */}
                      <div
                        ref={(el) => {
                          apertureStageRefs.current[index] = el;
                        }}
                        className="film-aperture-stage"
                      >
                        {/* Base Single-Photo / Underlying Placeholder Aperture */}
                        <div
                          className="film-base-aperture-frame"
                          style={{
                            backgroundColor: primaryPhoto.palette[0],
                          }}
                        >
                          {primaryPhoto.imageUrl ? (
                            <img
                              src={primaryPhoto.imageUrl}
                              alt={primaryPhoto.caption}
                              className="film-frame-photo-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="film-archival-plate">
                              <span className="film-plate-stamp">
                                {primaryPhoto.dateStamp}
                              </span>
                              <span
                                className="film-plate-focal-title"
                                style={{ color: primaryPhoto.palette[2] }}
                              >
                                {primaryPhoto.focalLabel}
                              </span>
                              <span className="film-plate-code">
                                {primaryPhoto.frameCode}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ===================================================
                            HORIZONTAL 35MM FILM STRIP OVERLAY (Multi-Photo Only)
                            Slides in from the left under the Year Stage and aligns
                            strictly within the exact height & width of the photo
                            placeholder aperture. Never overlaps text below.
                            =================================================== */}
                        {isMultiPhoto && (
                          <div
                            ref={(el) => {
                              horizontalClipShellRefs.current[index] = el;
                            }}
                            className="horizontal-film-clip-overlay"
                          >
                            {/* Incoming Left Leader Tail (extends toward the left Year Stage) */}
                            <div
                              className="horizontal-film-left-leader"
                              aria-hidden="true"
                            >
                              <div className="horizontal-sprocket-strip horizontal-sprocket-strip--top" />
                              <div className="horizontal-leader-emulsion">
                                <span>35MM ARCHIVE ROLL  •  {event.year}</span>
                              </div>
                              <div className="horizontal-sprocket-strip horizontal-sprocket-strip--bottom" />
                            </div>

                            {/* Exact-Aperture-Sized Horizontal Film Window */}
                            <div className="horizontal-film-aperture-viewport">
                              {/* Top Horizontal Sprocket Perforations */}
                              <div
                                className="horizontal-sprocket-strip horizontal-sprocket-strip--top"
                                aria-hidden="true"
                              />

                              {/* Gliding Horizontal Track of Photo Frames */}
                              <div
                                ref={(el) => {
                                  horizontalTrackRefs.current[index] = el;
                                }}
                                className="horizontal-film-frames-track"
                              >
                                {event.photos.map((photo, pIdx) => (
                                  <div
                                    key={photo.id}
                                    className="horizontal-film-single-frame"
                                    style={{
                                      backgroundColor: photo.palette[0],
                                    }}
                                  >
                                    {photo.imageUrl ? (
                                      <img
                                        src={photo.imageUrl}
                                        alt={photo.caption}
                                        className="film-frame-photo-img"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="film-archival-plate">
                                        <span className="film-plate-stamp">
                                          {photo.dateStamp}
                                        </span>
                                        <span
                                          className="film-plate-focal-title"
                                          style={{ color: photo.palette[2] }}
                                        >
                                          {photo.focalLabel}
                                        </span>
                                        <span className="film-plate-code">
                                          FRAME 0{pIdx + 1}  •  {photo.frameCode}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Bottom Horizontal Sprocket Perforations */}
                              <div
                                className="horizontal-sprocket-strip horizontal-sprocket-strip--bottom"
                                aria-hidden="true"
                              />

                              {/* Top-Right Roll Counter Pill inside Aperture */}
                              <div className="horizontal-aperture-hud">
                                <span
                                  ref={(el) => {
                                    frameReadoutRefs.current[index] = el;
                                  }}
                                  className="horizontal-frame-readout"
                                >
                                  FRAME 01 / 0{event.photos.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Frame-Synced Archival Negative Caption Line */}
                      <p
                        ref={(el) => {
                          activeCaptionRefs.current[index] = el;
                        }}
                        className="film-aperture-caption"
                      >
                        {primaryPhoto.frameCode} — {primaryPhoto.caption}
                      </p>

                      {/* =====================================================
                          HEADLINE & NARRATIVE STORY BELOW THE APERTURE
                          Completely isolated below the aperture stage so the
                          horizontal film strip never touches or overlaps it.
                          ===================================================== */}
                      <div className="film-cell-narrative-block">
                        <div className="film-cell-meta-row">
                          <span className="film-cell-location">
                            {event.location}
                          </span>
                          <span className="film-cell-subtitle">
                            {event.subtitle}
                          </span>
                        </div>
                        <h3 className="film-cell-headline">{event.title}</h3>
                        <p className="film-cell-story">{event.narrative}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
