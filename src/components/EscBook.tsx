import React, { useRef, useEffect, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';

export interface EscBookProps {
  startPage?: number;
  onPageChange?: (page: number) => void;
  fallenItems?: [string, any][];
  onRestoreItem?: (id: string) => void;
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
  startPage = 2,
  onPageChange,
  fallenItems = [],
  onRestoreItem,
  isLoaderMode = false,
  onLoaderFinished,
  width = 340,
  height = 470
}) => {
  const bookRef = useRef<any>(null);

  const getItemName = (id: string) => {
    switch (id) {
      case 'radio': return 'Radio (ECHO Podcasts)';
      case 'mic': return 'Microphone (Discussion Group)';
      case 'pen': return 'Pen & Paper (Classes)';
      case 'dict': return 'Dictionary (Word of the Day)';
      case 'gram': return 'Grammar Paper';
      case 'prn': return 'Pronunciation Radio';
      default: return 'Desk Object';
    }
  };

  // Fast page flipping for loader mode
  useEffect(() => {
    if (!isLoaderMode) return;

    let timer: ReturnType<typeof setTimeout>;
    let step = 0;

    // Flip rapidly through pages until we stop open at the Logo page (pages 2-3)
    const runFlipSequence = () => {
      timer = setTimeout(() => {
        try {
          const pf = bookRef.current?.pageFlip();
          if (pf) {
            if (step === 0) {
              pf.flip(2); // Flips to page 2 (open spread of pages 2 & 3: Logo Page)
              step++;
              timer = setTimeout(() => {
                if (onLoaderFinished) onLoaderFinished();
              }, 700);
              return;
            }
          }
        } catch {
          if (onLoaderFinished) onLoaderFinished();
        }
      }, 500);
    };

    runFlipSequence();
    return () => clearTimeout(timer);
  }, [isLoaderMode, onLoaderFinished]);

  return (
    <div className={`esc-book-container ${isLoaderMode ? 'loader-book' : 'desk-book'}`}>
      {/* Decorative Book Ribbon */}
      <div className="book-spine-ribbon" aria-hidden="true"></div>

      {/* @ts-ignore - react-pageflip typed children */}
      <HTMLFlipBook
        ref={bookRef}
        width={width}
        height={height}
        size="fixed"
        minWidth={280}
        maxWidth={460}
        minHeight={380}
        maxHeight={580}
        maxShadowOpacity={0.75}
        showCover={true}
        drawShadow={true}
        flippingTime={isLoaderMode ? 450 : 750}
        usePortrait={false}
        startPage={isLoaderMode ? 0 : startPage}
        showPageCorners={true}
        clickEventForward={true}
        useMouseEvents={!isLoaderMode}
        onFlip={(e: any) => {
          if (onPageChange) onPageChange(e.data);
        }}
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
                alt="ESC Emblem"
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              />
            </div>

            <h1 className="cover-title">ENGLISH SPEAKING CLUB</h1>
            <div className="cover-subtitle">OFFICIAL ARCHIVE &amp; MEMORABILIA</div>
            <div className="cover-rule">════ ✦ ════</div>
            <div className="cover-year">ESTABLISHED 2017</div>
            <div className="cover-hint">✦ Click or drag corner to open ✦</div>
          </div>
        </PageCover>

        {/* PAGE 1: CHARTER & TABLE OF CONTENTS */}
        <Page number={1} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">ESC OFFICIAL CHARTER</div>
            <h3 className="parchment-heading">The Archive</h3>
            <p className="parchment-text drop-cap">
              Founded in 2017 by passionate university scholars, the English Speaking Club fosters fluency, debate, and transformative rhetoric across generations.
            </p>
            <div className="parchment-divider"></div>
            <h4 className="toc-title">LEDGER CONTENTS</h4>
            <ul className="toc-list">
              <li>
                <span>✦ Page 2–3</span>
                <strong>Welcome &amp; Club Logo</strong>
              </li>
              <li>
                <span>✦ Page 4–5</span>
                <strong>Lost &amp; Found Ledger</strong>
              </li>
              <li>
                <span>✦ Page 6–7</span>
                <strong>Pillars &amp; Decade Horizon</strong>
              </li>
            </ul>
            <div className="motto-box">
              “Eloquentia, Veritas, et Sapientia”
            </div>
          </div>
        </Page>

        {/* PAGE 2: WELCOME & DESK GUIDE */}
        <Page number={2} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">DESK FIELD GUIDE</div>
            <h3 className="parchment-heading">Welcome to ESC</h3>
            <p className="parchment-text">
              You are exploring the infinite desktop of ESC. You can move every object freely on the table:
            </p>
            <div className="guide-items-grid">
              <div className="guide-item">
                <span className="guide-icon">📻</span>
                <div>
                  <strong>ECHO Radio</strong>
                  <p>Hover for podcast player · Double-click to listen</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">🎙️</span>
                <div>
                  <strong>Microphone</strong>
                  <p>Discussion Group · Weekly debate rounds</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">✒️</span>
                <div>
                  <strong>Pen &amp; Note</strong>
                  <p>“ESC is the best english club ever” · Classes</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-icon">📖</span>
                <div>
                  <strong>Dictionary</strong>
                  <p>Word of the day, phonetics &amp; etymology</p>
                </div>
              </div>
            </div>
            <div className="turn-corner-hint">Flip to Logo Page →</div>
          </div>
        </Page>

        {/* PAGE 3: OFFICIAL LOGO PAGE (CENTERPIECE OF ARCHIVE) */}
        <Page number={3} className="page-parchment logo-showcase-page">
          <div className="parchment-border logo-frame">
            <div className="archive-header">OFFICIAL INSIGNIA</div>

            <div className="official-logo-stage">
              <div className="logo-glow-ring"></div>
              <div className="logo-graphic-wrap">
                <img
                  src="/logo.svg"
                  alt="ESC Official Club Logo"
                  className="showcase-logo"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
              </div>
            </div>

            <h2 className="showcase-club-title">ENGLISH SPEAKING CLUB</h2>
            <div className="showcase-badge">CAMPUS CHAPTER · ARCHIVE SEAL</div>

            <div className="showcase-specs">
              <div className="spec-col">
                <span className="spec-label">FOUNDED</span>
                <span className="spec-val">2017</span>
              </div>
              <div className="spec-divider">·</div>
              <div className="spec-col">
                <span className="spec-label">MOTTO</span>
                <span className="spec-val">SPEAK TO LEAD</span>
              </div>
              <div className="spec-divider">·</div>
              <div className="spec-col">
                <span className="spec-label">STATUS</span>
                <span className="spec-val">ACTIVE</span>
              </div>
            </div>

            <p className="showcase-footer-quote">
              The official seal of the English Speaking Club, symbol of eloquence, critical dialogue, and student excellence.
            </p>
          </div>
        </Page>

        {/* PAGE 4: LOST & FOUND LEDGER - LEFT */}
        <Page number={4} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">DESK GRAVITATIONAL LEDGER</div>
            <h3 className="parchment-heading">Lost &amp; Found</h3>
            <p className="parchment-text">
              The desk is suspended above the cloudy infinite expanse. When an item is dragged beyond the wooden edge, it falls into the abyss.
            </p>
            <div className="gravity-warning-card">
              <div className="warn-icon">⚠️</div>
              <div className="warn-text">
                <strong>Edge Boundary Rule:</strong>
                <p>Items dropped off the edge disappear from the table and are registered in this archive ledger.</p>
              </div>
            </div>
            <div className="desk-stats-box">
              <div className="desk-stat-row">
                <span>Total Desk Objects:</span>
                <b>6 items</b>
              </div>
              <div className="desk-stat-row">
                <span>Fallen Objects:</span>
                <b style={{ color: fallenItems.length > 0 ? '#BF2026' : '#27ae60' }}>
                  {fallenItems.length} lost
                </b>
              </div>
            </div>
            <p className="parchment-subtext">
              Look to page 5 to inspect lost objects and restore them to the desk with a single click.
            </p>
          </div>
        </Page>

        {/* PAGE 5: LOST & FOUND LEDGER - RIGHT (RESTORATION PAGE) */}
        <Page number={5} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">ITEM RESTORATION REGISTRY</div>
            <h4 className="parchment-subhead">Abyss Recovery Chamber</h4>

            <div className="ledger-items-container">
              {fallenItems.length === 0 ? (
                <div className="ledger-empty-state">
                  <div className="empty-sparkle">✨</div>
                  <b>All items are safe on the table.</b>
                  <p>Drag any radio, pen, mic, or paper past the table boundary to test desk gravity!</p>
                </div>
              ) : (
                <div className="ledger-fallen-list">
                  {fallenItems.map(([id]) => (
                    <div key={id} className="ledger-item-card">
                      <div className="ledger-item-info">
                        <span className="ledger-dot"></span>
                        <span className="ledger-item-name">{getItemName(id)}</span>
                      </div>
                      <button
                        type="button"
                        className="ledger-restore-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRestoreItem) onRestoreItem(id);
                        }}
                      >
                        ✨ Restore to Desk
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="parchment-divider"></div>
            <div className="ledger-quick-tip">
              ✦ Tip: Restored items reappear at their primary coordinates on the desk.
            </div>
          </div>
        </Page>

        {/* PAGE 6: PILLARS & CONSTITUTION */}
        <Page number={6} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">CONSTITUTION</div>
            <h3 className="parchment-heading">Four Pillars of ESC</h3>
            <div className="pillars-list">
              <div className="pillar-row">
                <b>I. Competitive Debate</b>
                <p>Developing logical precision, argumentation structures, and poise under competitive pressure.</p>
              </div>
              <div className="pillar-row">
                <b>II. Public Oratory</b>
                <p>Mastering voice modulation, empathetic storytelling, and keynote charisma.</p>
              </div>
              <div className="pillar-row">
                <b>III. Media &amp; Podcasts</b>
                <p>Distributing student discourse through high-production audio broadcasts.</p>
              </div>
              <div className="pillar-row">
                <b>IV. Community &amp; Culture</b>
                <p>An inclusive brotherhood fostering leadership across academic disciplines.</p>
              </div>
            </div>
          </div>
        </Page>

        {/* PAGE 7: HISTORICAL SUMMARY */}
        <Page number={7} className="page-parchment">
          <div className="parchment-border">
            <div className="archive-header">HISTORIC CHRONICLE</div>
            <h3 className="parchment-heading">The Decade Horizon</h3>
            <p className="parchment-text">
              From our vintage origins in 2017 to the modern era of 2026, ESC has hosted 120+ tournaments, 48 workshops, and empowered over 1,250 members.
            </p>
            <div className="scroll-timeline-cta-box">
              <div className="cta-sparkle">📜</div>
              <b>Explore the Full Interactive Story</b>
              <p>Scroll down past the table edge to watch the years roll from 2017 to 2026 on the film strip.</p>
            </div>
            <div className="seal-bottom">
              <div className="certified-text">CERTIFIED OFFICIAL RECORD</div>
              <div className="archive-reg">ESC-ARCHIVE-REG-2026</div>
            </div>
          </div>
        </Page>

        {/* PAGE 8: BACK COVER (HARD) */}
        <PageCover className="back-cover">
          <div className="cover-border">
            <div className="cover-seal small">
              <img
                src="/logo.svg"
                alt="ESC Seal"
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
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
