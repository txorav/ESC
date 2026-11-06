import React, { useRef, useEffect, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { WordData, DeskItemState } from '../types';

export interface EscBookProps {
  startPage?: number;
  wordData?: WordData;
  items?: { [id: string]: DeskItemState };
  onTakeItemToDesk?: (id: string) => void;
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

// ForwardRef page component as required by react-pageflip
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
  startPage = 8,
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
  items = {},
  onTakeItemToDesk,
  onPlayPronunciation,
  isPlayingAudio = false,
  isLoaderMode = false,
  onLoaderFinished,
  width = 350,
  height = 480
}) => {
  const bookRef = useRef<any>(null);

  // Fast realistic page flipping sequence for loader mode
  useEffect(() => {
    if (!isLoaderMode) return;

    let timeoutIds: ReturnType<typeof setTimeout>[] = [];

    // Flip sequentially through the book pages to simulate fast flipping until landing at the Logo Page (Page 8)
    const t1 = setTimeout(() => {
      try {
        const pf = bookRef.current?.pageFlip();
        if (pf) {
          pf.flip(2); // Flips to pages 1-2
        }
      } catch {}
    }, 280);

    const t2 = setTimeout(() => {
      try {
        const pf = bookRef.current?.pageFlip();
        if (pf) {
          pf.flip(4); // Flips to pages 3-4
        }
      } catch {}
    }, 600);

    const t3 = setTimeout(() => {
      try {
        const pf = bookRef.current?.pageFlip();
        if (pf) {
          pf.flip(6); // Flips to pages 5-6
        }
      } catch {}
    }, 920);

    const t4 = setTimeout(() => {
      try {
        const pf = bookRef.current?.pageFlip();
        if (pf) {
          pf.flip(8); // Lands at final spread: Page 7 & Page 8 (The Official Logo Page!)
        }
      } catch {}
    }, 1250);

    const t5 = setTimeout(() => {
      if (onLoaderFinished) {
        onLoaderFinished();
      }
    }, 1850);

    timeoutIds = [t1, t2, t3, t4, t5];

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [isLoaderMode, onLoaderFinished]);

  const renderTakeButton = (id: string, label: string) => {
    const isGone = items[id]?.gone;
    return (
      <button
        type="button"
        className={`book-take-btn ${isGone ? 'lost' : 'active'}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTakeItemToDesk) onTakeItemToDesk(id);
        }}
        title={`Take or restore ${label} on the desk`}
      >
        {isGone ? `⚠️ Lost · Place ${label} on Desk` : `✓ Take ${label} to Desk`}
      </button>
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
        flippingTime={isLoaderMode ? 320 : 750}
        usePortrait={false}
        startPage={isLoaderMode ? 0 : startPage}
        showPageCorners={true}
        clickEventForward={true}
        useMouseEvents={!isLoaderMode}
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
            <div className="cover-hint">✦ Turn page to inspect departments &amp; desk items ✦</div>
          </div>
        </PageCover>

        {/* PAGE 1: ESC OVERVIEW & CLUB CHARTER */}
        <Page number={1} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">OFFICIAL CHARTER · EST. 2017</div>
            <h3 className="parchment-heading">The Archive</h3>
            <p className="parchment-text drop-cap">
              The English Speaking Club (ESC) was founded in 2017 by passionate university students to foster fluency, debate, and transformative rhetorical leadership.
            </p>
            <p className="parchment-text">
              Every object on this study desk represents an active club department. You can take any element from these pages or arrange them freely across the wooden table.
            </p>
            <div className="parchment-divider"></div>
            <h4 className="parchment-subhead">Archive Contents</h4>
            <div className="index-list">
              <div><span>p. 2</span> <strong>Word of the Day</strong></div>
              <div><span>p. 3</span> <strong>Grammar of the Day</strong></div>
              <div><span>p. 4</span> <strong>Pronunciation Radio</strong></div>
              <div><span>p. 5</span> <strong>Microphone &amp; Debate</strong></div>
              <div><span>p. 6</span> <strong>Radio &amp; ECHO Podcasts</strong></div>
              <div><span>p. 7</span> <strong>Pen &amp; Note (Classes)</strong></div>
              <div><span>p. 8</span> <strong>Official Club Logo</strong></div>
            </div>
            <div className="parchment-footer-motto">
              “Eloquentia, Veritas, et Sapientia”
            </div>
          </div>
        </Page>

        {/* PAGE 2: WORD OF THE DAY (VOCABULARY DEPARTMENT) */}
        <Page number={2} className="page-parchment">
          <div className="parchment-border">
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
              <p className="parchment-text" style={{ fontSize: '11px', color: '#5a4325' }}>
                <strong>Etymology:</strong> {wordData.origin}
              </p>
            )}

            <div className="book-action-zone">
              {renderTakeButton('dict', 'Dictionary')}
            </div>
          </div>
        </Page>

        {/* PAGE 3: GRAMMAR OF THE DAY (LANGUAGE DEPARTMENT) */}
        <Page number={3} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">LANGUAGE &amp; GRAMMAR DEPARTMENT</div>
            <h3 className="parchment-heading">Grammar Rule</h3>

            <p className="parchment-text">
              Mastering nuance in spoken and written English elevates persuasive arguments and clarity in parliamentary debate.
            </p>

            <div className="parchment-rule-card">
              <div className="rule-badge">TODAY’S LINGUISTIC FOCUS</div>
              <div className="rule-body-text">{wordData.rule}</div>
            </div>

            <p className="parchment-text" style={{ marginTop: '10px' }}>
              Each week our language workshop examines common rhetorical slips, syntax patterns, and formal register.
            </p>

            <div className="book-action-zone">
              {renderTakeButton('gram', 'Grammar Paper')}
            </div>
          </div>
        </Page>

        {/* PAGE 4: PRONUNCIATION RADIO & PHONETICS LAB */}
        <Page number={4} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">PHONETICS &amp; SPEECH LAB</div>
            <h3 className="parchment-heading">Voice Pronunciation</h3>

            <p className="parchment-text">
              Vocal clarity, syllable stress, and natural cadence are essential for impactful public speaking.
            </p>

            <div className="audio-voice-box">
              <div className="voice-word-display">
                “{wordData.word}”
              </div>
              <button
                type="button"
                className={`voice-play-trigger ${isPlayingAudio ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlayPronunciation) onPlayPronunciation();
                }}
              >
                {isPlayingAudio ? '🔊 Playing Audio…' : '▶ Hear Pronunciation'}
              </button>
            </div>

            <p className="parchment-text" style={{ fontSize: '11px', marginTop: '10px' }}>
              ESC members practice minimal pairs, diaphragmatic projection, and international phonetic transcription weekly.
            </p>

            <div className="book-action-zone">
              {renderTakeButton('prn', 'Pronunciation Radio')}
            </div>
          </div>
        </Page>

        {/* PAGE 5: MICROPHONE & DEBATE (DISCUSSION GROUP DEPARTMENT) */}
        <Page number={5} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">DEBATE &amp; DISCUSSION GROUP</div>
            <h3 className="parchment-heading">Discussion Group</h3>

            <p className="parchment-text">
              Discussion Group (DG) is ESC’s longest-running flagship activity since 2017. Every Wednesday, students take the floor for spontaneous debate and conversational rounds.
            </p>

            <div className="dept-highlight-card">
              <strong>Flagship Activities:</strong>
              <ul style={{ paddingLeft: '16px', margin: '4px 0 0', lineHeight: '1.5' }}>
                <li>British Parliamentary sparring rounds</li>
                <li>Oxford-style resolution debates</li>
                <li>Philosophy &amp; policy roundtables</li>
              </ul>
            </div>

            <p className="parchment-text" style={{ fontSize: '11px', marginTop: '8px' }}>
              Grab the vintage microphone on the desk to step onto the amphitheater floor.
            </p>

            <div className="book-action-zone">
              {renderTakeButton('mic', 'Microphone')}
            </div>
          </div>
        </Page>

        {/* PAGE 6: RADIO & ECHO PODCASTS (MEDIA DEPARTMENT) */}
        <Page number={6} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">MEDIA &amp; AUDIO BROADCASTING</div>
            <h3 className="parchment-heading">ECHO Podcasts</h3>

            <p className="parchment-text">
              Launched in 2022, ECHO is ESC’s official student podcast studio. Members write, host, sound-engineer, and syndicate monthly episodes across student platforms.
            </p>

            <div className="dept-highlight-card">
              <strong>Studio Disciplines:</strong>
              <ul style={{ paddingLeft: '16px', margin: '4px 0 0', lineHeight: '1.5' }}>
                <li>Roundtable interview hosting</li>
                <li>Sound design &amp; audio mixing</li>
                <li>Guest leader &amp; alumni dialogues</li>
              </ul>
            </div>

            <p className="parchment-text" style={{ fontSize: '11px', marginTop: '8px' }}>
              Double-click the vintage radio on the table to access all syndicated episodes.
            </p>

            <div className="book-action-zone">
              {renderTakeButton('radio', 'Vintage Radio')}
            </div>
          </div>
        </Page>

        {/* PAGE 7: PEN & PAPER — CLASSES & MASTERCLASSES */}
        <Page number={7} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">EDUCATION &amp; MASTERCLASSES</div>
            <h3 className="parchment-heading">ESC Classes</h3>

            <p className="parchment-text">
              Our structured educational tracks guide communicators from beginner confidence to national tournament laureates.
            </p>

            <div className="parchment-note-preview">
              <span className="note-handwritten">“ESC is the best english club ever”</span>
            </div>

            <p className="parchment-text" style={{ fontSize: '11.5px', marginTop: '8px' }}>
              Covers rhetoric, academic argumentation, critical analysis, and stage presence.
            </p>

            <div className="book-action-zone">
              {renderTakeButton('pen', 'Pen & Note')}
            </div>
          </div>
        </Page>

        {/* PAGE 8: THE OFFICIAL LOGO PAGE (THE LAST PAGE OF THE BOOK) */}
        <Page number={8} className="page-parchment logo-final-page">
          <div className="parchment-border logo-stage-border">
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
    </div>
  );
};

export default EscBook;
