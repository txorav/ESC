import React, { useRef, useState, useEffect, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { WordData, DeskItemType } from '../types';

export interface EscBookProps {
  startPage?: number;
  wordData?: WordData;
  onGrabNewItem?: (type: DeskItemType, e: React.PointerEvent) => void;
  onPlayPronunciation?: () => void;
  isPlayingAudio?: boolean;
  isLoaderMode?: boolean;
  onLoaderFinished?: () => void;
  width?: number;
  height?: number;
}

interface PageProps {
  children: React.ReactNode;
  className?: string;
  number?: number;
}

// ForwardRef page component required by react-pageflip
const PageCover = forwardRef<HTMLDivElement, PageProps>(({ children, className = '' }, ref) => {
  return (
    <div className={`book-page-cover ${className}`} ref={ref} data-density="hard">
      <div className="book-cover-inner">
        {children}
      </div>
    </div>
  );
});
PageCover.displayName = 'PageCover';

const Page = forwardRef<HTMLDivElement, PageProps>(({ children, className = '', number }, ref) => {
  return (
    <div className={`book-page-sheet ${className}`} ref={ref}>
      <div className="book-page-content">
        {children}
        {typeof number === 'number' && (
          <div className="book-page-num">{number}</div>
        )}
      </div>
    </div>
  );
});
Page.displayName = 'Page';

export const EscBook: React.FC<EscBookProps> = ({
  startPage = 0,
  wordData = {
    word: 'serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    pos: 'noun',
    def: 'The occurrence and development of events by chance in a happy or beneficial way.',
    ex: 'Joining ESC was pure serendipity; it completely transformed my confidence on stage.',
    syn: ['fortune', 'happy chance', 'providence', 'fluke'],
    origin: "Coined by Horace Walpole in 1754 from 'The Three Princes of Serendip'.",
    rule: "Present Perfect vs. Past Simple: Use Present Perfect for experiences without a specific past time ('I have attended three sessions')."
  },
  onGrabNewItem,
  onPlayPronunciation,
  isPlayingAudio = false,
  isLoaderMode = false,
  onLoaderFinished,
  width = 350,
  height = 480
}) => {
  const bookRef = useRef<any>(null);
  const finishedRef = useRef(false);
  const startedRef = useRef(false);

  const [currentPage, setCurrentPage] = useState<number>(startPage);
  const [autoFlipActive, setAutoFlipActive] = useState<boolean>(false);

  // Expose instance and ensure mouse events are ALWAYS active
  useEffect(() => {
    (window as any).__escBookRef = bookRef.current;
    try {
      const pf = bookRef.current?.pageFlip();
      if (pf) {
        const s = pf.getSettings();
        if (s) {
          s.useMouseEvents = true;
          s.showPageCorners = true;
          s.disableFlipByClick = false;
        }
      }
    } catch {}
  });

  // Backup 60fps ticker to ensure animation frames advance smoothly even if rAF throttles
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const pf = bookRef.current?.pageFlip();
        if (pf) {
          const render = pf.getRender();
          if (render && render.animation) {
            render.render(performance.now());
          }
        }
      } catch {}
    }, 16);
    return () => clearInterval(timer);
  }, []);

  // Handle initialization of the book
  const handleInit = () => {
    try {
      const pf = bookRef.current?.pageFlip();
      if (pf) {
        const s = pf.getSettings();
        if (s) {
          s.useMouseEvents = true;
          s.showPageCorners = true;
        }
      }
    } catch {}

    if (isLoaderMode && !startedRef.current) {
      startedRef.current = true;
      setTimeout(() => {
        try {
          const pf = bookRef.current?.pageFlip();
          if (pf && pf.getCurrentPageIndex() < 7) {
            pf.flipNext();
          }
        } catch {}
      }, 500);
    }
  };

  // Automatic page-turner feature (requested by user)
  useEffect(() => {
    if (!autoFlipActive || isLoaderMode) return;

    const timer = setInterval(() => {
      try {
        const pf = bookRef.current?.pageFlip();
        if (!pf) return;
        const cur = pf.getCurrentPageIndex();
        if (cur >= 8) {
          // Loop back to spread 1 (Charter & Word of the Day)
          pf.flip(1);
        } else {
          const nextTarget = cur <= 0 ? 2 : cur + 2;
          pf.flip(Math.min(8, nextTarget));
        }
      } catch {}
    }, 3400);

    return () => clearInterval(timer);
  }, [autoFlipActive, isLoaderMode]);

  // Handle book flipping state changes ('flipping', 'read', etc.)
  const handleChangeState = (e: any) => {
    const state = typeof e?.data === 'string' ? e.data : '';
    if (state === 'read') {
      try {
        const pf = bookRef.current?.pageFlip();
        if (!pf) return;
        const page = pf.getCurrentPageIndex();
        setCurrentPage(page);

        if (isLoaderMode) {
          if (page >= 7) {
            // Reached Spread 4 (Page 7 & Page 8 - THE OFFICIAL LOGO PAGE!) - STOP!
            if (!finishedRef.current) {
              finishedRef.current = true;
              setTimeout(() => {
                onLoaderFinished?.();
              }, 800);
            }
          } else {
            // Pause briefly between page turns so the animation is clearly visible
            setTimeout(() => {
              try {
                if (finishedRef.current) return;
                const cur = bookRef.current?.pageFlip()?.getCurrentPageIndex();
                if (typeof cur === 'number' && cur < 7) {
                  bookRef.current?.pageFlip()?.flipNext();
                }
              } catch {}
            }, 350);
          }
        }
      } catch {}
    }
  };

  const handleFlip = (e: any) => {
    const pageIndex = typeof e?.data === 'number' ? e.data : (typeof e === 'number' ? e : 0);
    setCurrentPage(pageIndex);
  };

  // Fallback trigger in case onInit fired before listener was attached
  useEffect(() => {
    if (!isLoaderMode) return;
    finishedRef.current = false;

    const timer = setTimeout(() => {
      try {
        const pf = bookRef.current?.pageFlip();
        if (pf && !startedRef.current && pf.getCurrentPageIndex() < 7) {
          startedRef.current = true;
          pf.flipNext();
        }
      } catch {}
    }, 600);

    return () => clearTimeout(timer);
  }, [isLoaderMode]);

  // Grabbable element renderer (Always ready to spawn new items onto the table)
  const renderGrabbableItem = (type: DeskItemType, label: string, visualElement: React.ReactNode) => {
    return (
      <div
        className="book-grabbable-zone"
        onPointerDown={(e) => {
          e.stopPropagation();
          if (onGrabNewItem) {
            onGrabNewItem(type, e);
          }
        }}
        title={`Grab new ${label} onto the desk`}
      >
        <div className="grabbable-object-wrapper">
          {visualElement}
        </div>
        <div className="grabbable-prompt">
          <span className="grab-hand-icon">✋</span>
          <span className="grab-text">Grab {label} to desk</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`esc-book-container ${isLoaderMode ? 'loader-book' : 'desk-book'}`}>
      {/* Decorative Book Ribbon Bookmark */}
      <div className="book-spine-ribbon" aria-hidden="true"></div>

      {/* @ts-ignore - react-pageflip typed children */}
      <HTMLFlipBook
        ref={bookRef}
        width={width}
        height={height}
        size="fixed"
        minWidth={300}
        maxWidth={460}
        minHeight={400}
        maxHeight={580}
        maxShadowOpacity={0.8}
        showCover={true}
        drawShadow={true}
        flippingTime={320}
        usePortrait={false}
        startPage={startPage}
        showPageCorners={true}
        clickEventForward={true}
        useMouseEvents={true}
        onInit={handleInit}
        onFlip={handleFlip}
        onChangeState={handleChangeState}
        className="esc-flip-book"
        style={{ margin: '0 auto' }}
      >
        {/* PAGE 0: FRONT COVER (HARD) */}
        <PageCover className="front-cover">
          <div className="cover-border">
            <div className="cover-corner top-left">✦</div>
            <div className="cover-corner top-right">✦</div>
            <div className="cover-corner bottom-left">✦</div>
            <div className="cover-corner bottom-right">✦</div>

            <div className="cover-seal">
              <img
                src="/logo.svg"
                alt="ESC Official Emblem"
              />
            </div>

            <h1 className="cover-title">ENGLISH SPEAKING CLUB</h1>
            <div className="cover-subtitle">OFFICIAL ARCHIVE &amp; REGISTRY</div>
            <div className="cover-rule">════ ✦ ════</div>
            <div className="cover-year">ESTABLISHED 2017</div>
            <div className="cover-hint">✦ Inspect club archives &amp; interactive desk elements ✦</div>
          </div>
        </PageCover>

        {/* PAGE 1: ESC OVERVIEW & CLUB CHARTER */}
        <Page number={1} className="page-parchment">
          <div className="archive-header">OFFICIAL CHARTER · EST. 2017</div>
          <h3 className="parchment-heading">The Archive</h3>
          <p className="parchment-text drop-cap">
            The English Speaking Club (ESC) was founded in 2017 by passionate university students to foster fluency, debate, and transformative rhetorical leadership.
          </p>
          <p className="parchment-text">
            Every object resting in these pages represents an active club department. You can directly grab elements from any page to place and arrange them freely on the study desk.
          </p>
          <div className="parchment-divider"></div>
          <h4 className="parchment-subhead">Departments &amp; Artifacts</h4>
          <div className="index-list">
            <div><span>p. 2</span> <strong>Vocabulary · Pocket Dictionary</strong></div>
            <div><span>p. 3</span> <strong>Language · Grammar Paper</strong></div>
            <div><span>p. 4</span> <strong>Voice Lab · Pronunciation Radio</strong></div>
            <div><span>p. 5</span> <strong>Debate &amp; DG · Microphone</strong></div>
            <div><span>p. 6</span> <strong>Media · ECHO Podcasts Radio</strong></div>
            <div><span>p. 7</span> <strong>Classes · Pen &amp; Note Sheet</strong></div>
            <div><span>p. 8</span> <strong>Official Club Insignia</strong></div>
          </div>
          <div className="parchment-footer-motto">
            “Eloquentia, Veritas, et Sapientia”
          </div>
        </Page>

        {/* PAGE 2: WORD OF THE DAY (VOCABULARY DEPARTMENT) */}
        <Page number={2} className="page-parchment">
          <div className="archive-header">VOCABULARY &amp; RHETORIC DEPARTMENT</div>
          <h3 className="parchment-heading">Word of the Day</h3>
          
          <div className="word-entry-block">
            <div className="word-headline">{wordData.word}</div>
            <div className="word-phonetics">{wordData.phonetic} · <span className="word-pos">{wordData.pos}</span></div>
          </div>

          <p className="parchment-text">
            <strong>Definition:</strong> {wordData.def}
          </p>
          <p className="parchment-text">
            <strong>Example:</strong> “{wordData.ex}”
          </p>
          {wordData.origin && (
            <p className="parchment-text origin-note">
              <strong>Etymology:</strong> {wordData.origin}
            </p>
          )}

          {/* Grabbable Pocket Dictionary */}
          {renderGrabbableItem(
            'dict',
            'Dictionary',
            <div className="mini-dict-object">
              <div className="mini-dict-spine"></div>
              <div className="mini-dict-cover">
                <span className="mini-dict-label">OXFORD ESC</span>
                <span className="mini-dict-sub">WORD OF DAY</span>
              </div>
            </div>
          )}
        </Page>

        {/* PAGE 3: GRAMMAR OF THE DAY (LANGUAGE DEPARTMENT) */}
        <Page number={3} className="page-parchment">
          <div className="archive-header">LANGUAGE &amp; GRAMMAR DEPARTMENT</div>
          <h3 className="parchment-heading">Grammar Rule</h3>

          <p className="parchment-text">
            Mastering nuance in spoken and written English elevates persuasive arguments and clarity in parliamentary debate.
          </p>

          <p className="parchment-text rule-focus-text">
            <strong className="rule-accent">LINGUISTIC FOCUS:</strong> {wordData.rule}
          </p>

          <p className="parchment-text" style={{ fontSize: '11px', marginTop: '6px' }}>
            Each week our language workshop examines common rhetorical slips, syntax patterns, and formal register.
          </p>

          {/* Grabbable Grammar Parchment Note */}
          {renderGrabbableItem(
            'gram',
            'Grammar Paper',
            <div className="mini-grammar-sheet">
              <div className="mini-paper-crease"></div>
              <div className="mini-paper-title">Grammar Rule</div>
              <div className="mini-paper-body">{wordData.rule.slice(0, 55)}…</div>
            </div>
          )}
        </Page>

        {/* PAGE 4: PRONUNCIATION RADIO & PHONETICS LAB */}
        <Page number={4} className="page-parchment">
          <div className="archive-header">PHONETICS &amp; SPEECH LAB</div>
          <h3 className="parchment-heading">Voice Pronunciation</h3>

          <p className="parchment-text">
            Vocal clarity, syllable stress, and diaphragmatic resonance are essential for impactful public delivery.
          </p>

          <div className="pronounce-word-strip">
            <span className="pronounce-lead">Current Term:</span>
            <span className="pronounce-target">“{wordData.word}”</span>
          </div>

          <p className="parchment-text" style={{ fontSize: '11px' }}>
            ESC members practice minimal pairs, cadence, and IPA phonetics weekly.
          </p>

          {/* Grabbable Pronunciation Voice Module */}
          {renderGrabbableItem(
            'prn',
            'Voice Radio',
            <div className="mini-prn-module">
              <div className="mini-radio-grill"></div>
              <div className="mini-radio-knob"></div>
              <button
                type="button"
                className={`mini-play-speaker ${isPlayingAudio ? 'playing' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPronunciation?.();
                }}
                title="Play pronunciation audio"
              >
                {isPlayingAudio ? '🔊' : '▶'}
              </button>
            </div>
          )}
        </Page>

        {/* PAGE 5: MICROPHONE & DEBATE (DISCUSSION GROUP DEPARTMENT) */}
        <Page number={5} className="page-parchment">
          <div className="archive-header">DEBATE &amp; DISCUSSION GROUP</div>
          <h3 className="parchment-heading">Discussion Group</h3>

          <p className="parchment-text">
            Discussion Group (DG) is ESC’s longest-running flagship activity since 2017. Every Wednesday, members gather for spontaneous debate and conversational rounds.
          </p>

          <p className="parchment-text dept-bullet-line">
            ✦ British Parliamentary sparring rounds<br />
            ✦ Oxford-style resolution debates<br />
            ✦ Philosophical and policy roundtables
          </p>

          {/* Grabbable Vintage Microphone */}
          {renderGrabbableItem(
            'mic',
            'Microphone',
            <div className="mini-mic-object">
              <div className="mini-mic-grille"></div>
              <div className="mini-mic-neck"></div>
              <div className="mini-mic-stand"></div>
            </div>
          )}
        </Page>

        {/* PAGE 6: RADIO & ECHO PODCASTS (MEDIA DEPARTMENT) */}
        <Page number={6} className="page-parchment">
          <div className="archive-header">MEDIA &amp; AUDIO BROADCASTING</div>
          <h3 className="parchment-heading">ECHO Podcasts</h3>

          <p className="parchment-text">
            Launched in 2022, ECHO is ESC’s official student podcast studio. Members write, host, engineer, and broadcast monthly episodes on global and campus affairs.
          </p>

          <p className="parchment-text dept-bullet-line">
            ✦ Roundtable interviews &amp; alumni dialogues<br />
            ✦ Audio mixing &amp; sound engineering<br />
            ✦ Campus broadcast syndication
          </p>

          {/* Grabbable Vintage Radio with real asset */}
          {renderGrabbableItem(
            'radio',
            'Vintage Radio',
            <div className="mini-radio-asset-box">
              <img
                src="/vintage-radio.avif"
                alt="Vintage Radio"
                className="mini-radio-img"
                draggable={false}
              />
            </div>
          )}
        </Page>

        {/* PAGE 7: PEN & PAPER — CLASSES & MASTERCLASSES */}
        <Page number={7} className="page-parchment">
          <div className="archive-header">EDUCATION &amp; MASTERCLASSES</div>
          <h3 className="parchment-heading">ESC Classes</h3>

          <p className="parchment-text">
            Our structured educational tracks guide communicators from beginner confidence to national tournament laureates.
          </p>

          <p className="parchment-text dept-bullet-line">
            ✦ Voice Modulation &amp; Stage Presence<br />
            ✦ Academic Argumentation &amp; Logic<br />
            ✦ Pronunciation &amp; Natural Idioms Lab
          </p>

          {/* Grabbable Handwritten Note with Fountain Pen */}
          {renderGrabbableItem(
            'pen',
            'Pen & Note',
            <div className="mini-pen-sheet-object">
              <div className="mini-script-line">“ESC is the best english club ever”</div>
              <div className="mini-fountain-pen-nib"></div>
            </div>
          )}
        </Page>

        {/* PAGE 8: THE OFFICIAL LOGO PAGE (THE LAST PAGE OF THE BOOK) */}
        <Page number={8} className="page-parchment logo-final-page">
          <div className="archive-header">OFFICIAL INSIGNIA · ARCHIVE FINALE</div>

          <div className="official-logo-display">
            <img
              src="/logo.svg"
              alt="English Speaking Club Official Logo"
              className="esc-official-vector-logo"
            />
          </div>

          <h2 className="logo-club-name">ENGLISH SPEAKING CLUB</h2>
          <div className="logo-archive-seal">OFFICIAL CLUB EMBLEM · EST. 2017</div>

          <div className="logo-tenure-strip">
            <span>LEADERSHIP</span>
            <span>·</span>
            <span>DEBATE</span>
            <span>·</span>
            <span>ELOQUENCE</span>
          </div>

          <p className="logo-manifesto-text">
            The official insignia of the English Speaking Club, representing unity, intellect, and collegiate eloquence across Algeria and beyond.
          </p>

          <div className="archive-completed-mark">
            ✦ ARCHIVE DISCOVERY COMPLETE ✦
          </div>
        </Page>

        {/* PAGE 9: BACK COVER (HARD) */}
        <PageCover className="back-cover">
          <div className="cover-border">
            <div className="cover-seal small">
              <img
                src="/logo.svg"
                alt="ESC Seal"
              />
            </div>
            <div className="back-cover-title">ENGLISH SPEAKING CLUB</div>
            <div className="back-cover-quote">
              “To speak is to create. To listen is to understand. To debate is to evolve.”
            </div>
            <div className="cover-rule">════ ✦ ════</div>
            <div className="back-barcode">
              <div className="barcode-bars"></div>
              <span>ESC-ARCHIVE-VOLUME-I</span>
            </div>
          </div>
        </PageCover>
      </HTMLFlipBook>

      {/* Archival Book Controls: Auto-Flip Toggle & Page Indicator (No Arrows) */}
      {!isLoaderMode && (
        <div className="book-archival-bar">
          <button
            type="button"
            className={`book-archival-btn autoflip-btn ${autoFlipActive ? 'active' : ''}`}
            onClick={() => setAutoFlipActive(!autoFlipActive)}
            title="Toggle automatic page-turning"
          >
            {autoFlipActive ? '⏸ Pause Auto-Flip' : '⟳ Auto-Flip Pages'}
          </button>
          <span className="book-page-indicator">
            {currentPage === 0 ? 'Cover' : currentPage >= 8 ? 'Logo' : `p. ${currentPage}–${currentPage + 1}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default EscBook;
