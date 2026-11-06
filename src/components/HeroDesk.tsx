import React, { useState, useEffect, useRef } from 'react';
import type { WordData, DeskItemState, ModalContent } from '../types';

interface HeroDeskProps {
  onOpenModal: (content: ModalContent) => void;
  onShowToast: (message: string) => void;
}

const TABLE_W = 2800;
const TABLE_H = 1700;
const STORAGE_KEY = 'esc-state';

export const HeroDesk: React.FC<HeroDeskProps> = ({ onOpenModal, onShowToast }) => {
  const [wordData, setWordData] = useState<WordData>({
    word: 'serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    pos: 'noun',
    def: 'The occurrence and development of events by chance in a happy or beneficial way.',
    ex: 'Joining ESC was pure serendipity; it completely transformed my confidence on stage.',
    syn: ['fortune', 'happy chance', 'providence', 'fluke'],
    origin: "Coined by Horace Walpole in 1754 from 'The Three Princes of Serendip'.",
    rule: "Present Perfect vs. Past Simple: Use Present Perfect for experiences without a specific past time ('I have attended three sessions')."
  });

  const [pan, setPan] = useState<{ x: number; y: number }>(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (s.pan) return s.pan;
    } catch {}
    return {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 - 1400 : -500,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 - 850 : -300
    };
  });

  const [items, setItems] = useState<{ [id: string]: DeskItemState }>(() => {
    const defaults: { [id: string]: DeskItemState } = {
      radio: { x: 1880, y: 520, gone: false },
      mic: { x: 2040, y: 840, gone: false },
      pen: { x: 1820, y: 1140, gone: false },
      dict: { x: 480, y: 560, gone: false },
      gram: { x: 620, y: 980, gone: false },
      prn: { x: 320, y: 870, gone: false }
    };
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaults, ...s.items };
    } catch {}
    return defaults;
  });

  const [bookFlipped, setBookFlipped] = useState(false);
  const [warningActive, setWarningActive] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    desc: string;
  }>({ visible: false, x: 0, y: 0, title: '', desc: '' });

  const homeRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  // Fetch words.json
  useEffect(() => {
    fetch('/words.json')
      .then((res) => res.json())
      .then((data: WordData[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const dayIndex = Math.floor(Date.now() / 86400000);
          setWordData(data[dayIndex % data.length]);
        }
      })
      .catch(() => {});
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pan, items }));
    } catch {}
  }, [pan, items]);

  const isNearEdge = (pos: { x: number; y: number }) =>
    pos.x < 180 || pos.y < 180 || pos.x > TABLE_W - 340 || pos.y > TABLE_H - 300;

  const isOffTable = (pos: { x: number; y: number }) =>
    pos.x < 70 || pos.y < 70 || pos.x > TABLE_W - 220 || pos.y > TABLE_H - 180;

  // Pan canvas
  const handlePanStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.it, .bookwrap')) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = pan.x;
    const origY = pan.y;

    const onMove = (ev: PointerEvent) => {
      const newX = Math.min(300, Math.max(window.innerWidth - TABLE_W - 300, origX + ev.clientX - startX));
      const newY = Math.min(300, Math.max(window.innerHeight - TABLE_H - 300, origY + ev.clientY - startY));
      setPan({ x: newX, y: newY });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Drag item
  const handleItemDrag = (id: string, e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.play-btn')) return;
    e.stopPropagation();

    const current = items[id] || { x: 500, y: 500, gone: false };
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = current.x;
    const origY = current.y;

    const el = e.currentTarget as HTMLElement;
    el.classList.add('drag');

    const onMove = (ev: PointerEvent) => {
      const curX = origX + (ev.clientX - startX);
      const curY = origY + (ev.clientY - startY);
      setItems((prev) => ({
        ...prev,
        [id]: { ...prev[id], x: curX, y: curY }
      }));
      setWarningActive(isNearEdge({ x: curX, y: curY }));
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.classList.remove('drag');
      setWarningActive(false);

      setItems((prev) => {
        const itemState = prev[id];
        if (isOffTable(itemState)) {
          el.classList.add('fall');
          onShowToast(`⚠️ ${getItemName(id)} fell off the table! Restore it from the book.`);
          setTimeout(() => {
            el.classList.remove('fall');
          }, 900);
          return {
            ...prev,
            [id]: { ...itemState, gone: true }
          };
        }
        return prev;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const getItemName = (id: string) => {
    switch (id) {
      case 'radio': return 'Radio (ECHO Podcasts)';
      case 'mic': return 'Microphone (Discussion Group)';
      case 'pen': return 'Pen & Paper (Classes)';
      case 'dict': return 'Dictionary (Word of the Day)';
      case 'gram': return 'Grammar Paper';
      case 'prn': return 'Pronunciation Radio';
      default: return 'Object';
    }
  };

  const showItemTooltip = (title: string, desc: string, e: React.PointerEvent) => {
    setTooltip({
      visible: true,
      x: Math.min(e.clientX + 16, window.innerWidth - 270),
      y: Math.min(e.clientY + 16, window.innerHeight - 200),
      title,
      desc
    });
  };

  const hideItemTooltip = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const playPronunciation = () => {
    setIsPlayingAudio(true);
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(wordData.word);
      u.lang = 'en-US';
      u.rate = 0.85;
      u.onend = () => setIsPlayingAudio(false);
      u.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(u);
    } catch {
      onShowToast(`Pronouncing: "${wordData.word}"`);
      setTimeout(() => setIsPlayingAudio(false), 1500);
    }
  };

  const restoreItem = (id: string) => {
    const defaultCoords: { [k: string]: { x: number; y: number } } = {
      radio: { x: 1880, y: 520 },
      mic: { x: 2040, y: 840 },
      pen: { x: 1820, y: 1140 },
      dict: { x: 480, y: 560 },
      gram: { x: 620, y: 980 },
      prn: { x: 320, y: 870 }
    };
    const c = defaultCoords[id] || { x: 600, y: 600 };
    setItems((prev) => ({
      ...prev,
      [id]: { x: c.x, y: c.y, gone: false }
    }));
    onShowToast(`✨ Restored ${getItemName(id)} to desk!`);
  };

  const fallenItems = Object.entries(items).filter(([_, state]) => state.gone);

  return (
    <section id="home" ref={homeRef} onPointerDown={handlePanStart}>
      <div
        id="world"
        ref={worldRef}
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }}
      >
        <div id="table"></div>

        {/* 1. RADIO (RIGHT) */}
        {!items.radio?.gone && (
          <div
            className="it"
            style={{ left: `${items.radio?.x || 1880}px`, top: `${items.radio?.y || 520}px` }}
            onPointerDown={(e) => handleItemDrag('radio', e)}
            onPointerEnter={(e) => showItemTooltip('ECHO podcasts', 'Listen to recorded student episodes, debates, and talks.', e)}
            onPointerLeave={hideItemTooltip}
            onDoubleClick={() =>
              onOpenModal({
                title: 'ECHO Podcasts',
                subtitle: 'Student Voices & Thought Leadership',
                body: '<p>ECHO is the official student podcast of the English Speaking Club, launched in 2022. We record in-depth discussions on global affairs, literature, technology, and university life.</p><br><h4>Featured Episodes:</h4><ul style="padding-left:20px;line-height:1.8"><li><strong>Ep. 18:</strong> The Art of Persuasion with National Champions</li><li><strong>Ep. 17:</strong> From Campus to International Conferences</li><li><strong>Ep. 16:</strong> Overcoming Stage Fright in Public Speaking</li></ul>'
              })
            }
          >
            <div className="radio-card obj">
              <div className="radio-antenna"></div>
              <div className="radio-dial">ECHO FM</div>
              <div className="radio-grill"></div>
            </div>
          </div>
        )}

        {/* 2. MICROPHONE (RIGHT) */}
        {!items.mic?.gone && (
          <div
            className="it"
            style={{ left: `${items.mic?.x || 2040}px`, top: `${items.mic?.y || 840}px` }}
            onPointerDown={(e) => handleItemDrag('mic', e)}
            onPointerEnter={(e) => showItemTooltip('Discussion group', 'Join weekly debate rounds and conversational circles.', e)}
            onPointerLeave={hideItemTooltip}
            onDoubleClick={() =>
              onOpenModal({
                title: 'Discussion Group (DG)',
                subtitle: 'Weekly Debate & Speaking Circles',
                body: '<p>Discussion Group is ESC’s longest-running flagship activity since 2017. Every Wednesday afternoon, members gather for spontaneous debates, Oxford-style rounds, and collaborative roundtable discussions.</p><br><h4>Upcoming Topics:</h4><ul style="padding-left:20px;line-height:1.8"><li>This House would prioritize ethics over speed in autonomous systems.</li><li>Is modern digital brevity eroding rhetoric?</li></ul>'
              })
            }
          >
            <div className="mic-wrap obj">
              <div className="mic-head"></div>
              <div className="mic-stem"></div>
              <div className="mic-base"></div>
            </div>
          </div>
        )}

        {/* 3. PEN & PAPER (RIGHT) */}
        {!items.pen?.gone && (
          <div
            className="it"
            style={{ left: `${items.pen?.x || 1820}px`, top: `${items.pen?.y || 1140}px` }}
            onPointerDown={(e) => handleItemDrag('pen', e)}
            onPointerEnter={(e) => showItemTooltip('Classes', 'Masterclasses, speech lab, and accent refinement.', e)}
            onPointerLeave={hideItemTooltip}
            onDoubleClick={() =>
              onOpenModal({
                title: 'ESC Classes & Masterclasses',
                subtitle: 'Skill-Building Labs from Beginners to Advanced',
                body: '<p>ESC Classes provide a structured curriculum covering vocabulary development, phonetics, accent refinement, and presentation storytelling.</p><br><h4>Weekly Schedule:</h4><ul style="padding-left:20px;line-height:1.8"><li><strong>Mondays (16:30):</strong> Voice Modulation & Stage Presence</li><li><strong>Thursdays (17:00):</strong> Academic Argumentation & Critical Thinking</li><li><strong>Saturdays (10:00):</strong> Pronunciation & Natural Idioms Lab</li></ul>'
              })
            }
          >
            <div className="paper-sheet pen-note obj type">
              ESC is the best english club ever
              <div className="fountain-pen"></div>
            </div>
          </div>
        )}

        {/* 4. DICTIONARY (LEFT) */}
        {!items.dict?.gone && (
          <div
            className="it"
            style={{ left: `${items.dict?.x || 480}px`, top: `${items.dict?.y || 560}px` }}
            onPointerDown={(e) => handleItemDrag('dict', e)}
          >
            <div className="dict-book obj">
              <div className="dict-page">
                <div className="dict-tag">ESC DICTIONARY · WORD OF THE DAY</div>
                <h3 className="dict-word">{wordData.word}</h3>
                <div className="dict-phonetic">{wordData.phonetic}</div>
                <div className="dict-pos">{wordData.pos}</div>
                <p><strong>Origin:</strong> {wordData.origin}</p>
              </div>
              <div className="dict-page">
                <p><strong>Definition:</strong><br />{wordData.def}</p>
                <br />
                <p><strong>Example:</strong><br />“{wordData.ex}”</p>
                <br />
                <p><strong>Synonyms:</strong><br />{wordData.syn?.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* 5. GRAMMAR NOTE (LEFT) */}
        {!items.gram?.gone && (
          <div
            className="it"
            style={{ left: `${items.gram?.x || 620}px`, top: `${items.gram?.y || 980}px` }}
            onPointerDown={(e) => handleItemDrag('gram', e)}
          >
            <div className="paper-sheet gram-note obj type">
              <b style={{ color: 'var(--br)', display: 'block', marginBottom: '6px' }}>
                Grammar Rule of the Day
              </b>
              {wordData.rule}
            </div>
          </div>
        )}

        {/* 6. PRONUNCIATION RADIO (LEFT) */}
        {!items.prn?.gone && (
          <div
            className="it"
            style={{ left: `${items.prn?.x || 320}px`, top: `${items.prn?.y || 870}px` }}
            onPointerDown={(e) => handleItemDrag('prn', e)}
          >
            <div className="prn-box obj">
              <div className="radio-card" style={{ width: '170px', height: '110px' }}>
                <div className="radio-dial" style={{ width: '46px', height: '46px' }}>VOICE</div>
                <div className="radio-grill" style={{ width: '58px', height: '60px' }}></div>
              </div>
              <button
                className="play-btn"
                onClick={playPronunciation}
                aria-label="Play Word Pronunciation"
              >
                ▶
              </button>
              <div className={`wave-bars ${isPlayingAudio ? 'active' : ''}`}>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
            </div>
          </div>
        )}

        {/* 7. CENTER 3D BOOK & LOST & FOUND */}
        <div className="bookwrap">
          <div className="book">
            <div className="book-left type">
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '19px', color: 'var(--navy)', marginBottom: '8px' }}>
                Welcome to ESC
              </h4>
              <p>Founded in 2017, English Speaking Club is a student-led scientific &amp; cultural club dedicated to eloquence, leadership, and debate.</p>
              <br />
              <p><strong>Desk Guide:</strong></p>
              <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                <li>Drag &amp; arrange desk items freely.</li>
                <li>Double-click items for details.</li>
                <li>Click the book page to view Lost &amp; Found.</li>
              </ul>
            </div>
            <div className="book-right type">
              <div style={{ textAlign: 'center' }}>
                <div className="book-logo-box" style={{ margin: '0 auto 10px' }}>
                  <img src="/logo.svg" alt="ESC Logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                </div>
                <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '15px' }}>ENGLISH SPEAKING CLUB</div>
                <div style={{ fontSize: '12px', color: 'var(--br)' }}>OFFICIAL ARCHIVE</div>
                <div className="turn-hint">✦ Click page to flip ✦</div>
              </div>
            </div>
            <div className="book-spine-line"></div>
            <div
              className={`leaf ${bookFlipped ? 'flipped' : ''}`}
              onClick={() => setBookFlipped(!bookFlipped)}
              tabIndex={0}
              role="button"
              aria-label="Turn Book Page"
            >
              <div className="front">
                <div className="book-logo-box">
                  <img src="/logo.svg" alt="ESC Logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                </div>
                <b style={{ fontFamily: 'Fraunces, serif', fontSize: '17px', color: 'var(--navy)' }}>ESC MEMORABILIA</b>
                <div className="turn-hint">Click to open Lost &amp; Found →</div>
              </div>
              <div className="back type" onClick={(e) => e.stopPropagation()}>
                <div className="lost-title">Lost &amp; Found Desk Ledger</div>
                <div style={{ width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                  {fallenItems.length === 0 ? (
                    <p style={{ color: '#665', fontSize: '13px' }}>
                      All objects are safe on the table. Drop an item off the edge to test gravity!
                    </p>
                  ) : (
                    fallenItems.map(([id]) => (
                      <div key={id} className="lost-item-row">
                        <span>{getItemName(id)}</span>
                        <button
                          className="restore-btn"
                          onClick={() => restoreItem(id)}
                        >
                          ✨ Restore
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div
                  className="turn-hint"
                  style={{ marginTop: 'auto', cursor: 'pointer' }}
                  onClick={() => setBookFlipped(false)}
                >
                  ← Click to close page
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="desk-nav-hint">
        ✦ Click &amp; drag table to explore · Move objects freely · Scroll down to enter clouds ✦
      </div>

      {/* Floating Hover Tooltip */}
      <div
        id="tip"
        className={tooltip.visible ? 'on' : ''}
        style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
      >
        <div className="tip-header">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="#fff">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        </div>
        <div className="tip-content">
          <div className="tip-title">{tooltip.title}</div>
          <div className="tip-desc">{tooltip.desc}</div>
          <div className="tip-dbl">Double-click to open details ↗</div>
        </div>
      </div>

      {/* Edge Warning Banner */}
      <div id="warn" className={warningActive ? 'on' : ''}>
        ⚠️ Careful — you’re about to fall off the table!
      </div>
    </section>
  );
};
