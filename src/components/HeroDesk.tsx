import React, { useState, useEffect, useRef } from 'react';
import type { WordData, DeskItemInstance, DeskItemType, ModalContent } from '../types';
import { EscBook } from './EscBook';

interface HeroDeskProps {
  onOpenModal: (content: ModalContent) => void;
  onShowToast: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const TABLE_W = 2800;
const TABLE_H = 1700;
const STORAGE_KEY = 'esc-state-v2';

export const HeroDesk: React.FC<HeroDeskProps> = ({
  onOpenModal,
  onShowToast,
  onLoadingChange
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loaderFinished, setLoaderFinished] = useState(false);

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

  const getCenteredPan = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      x: Math.round(w / 2 - 1400),
      y: Math.round(h / 2 - 850)
    };
  };

  const [pan, setPan] = useState<{ x: number; y: number }>(() => getCenteredPan());

  // Always reset viewport to center on the book on mount
  useEffect(() => {
    setPan(getCenteredPan());
  }, []);

  // Multi-instance desk items: initial set on desk + unlimited new items from book
  const [items, setItems] = useState<DeskItemInstance[]>(() => {
    const defaults: DeskItemInstance[] = [
      { instanceId: 'radio-1', type: 'radio', x: 1880, y: 520 },
      { instanceId: 'mic-1', type: 'mic', x: 2040, y: 840 },
      { instanceId: 'pen-1', type: 'pen', x: 1820, y: 1140 },
      { instanceId: 'dict-1', type: 'dict', x: 480, y: 560 },
      { instanceId: 'gram-1', type: 'gram', x: 620, y: 980 },
      { instanceId: 'prn-1', type: 'prn', x: 320, y: 870 }
    ];
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(s.items) && s.items.length > 0) return s.items;
    } catch {}
    return defaults;
  });

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

  // Save items state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    } catch {}
  }, [items]);

  const isNearEdge = (pos: { x: number; y: number }) =>
    pos.x < 180 || pos.y < 180 || pos.x > TABLE_W - 340 || pos.y > TABLE_H - 300;

  const isOffTable = (pos: { x: number; y: number }) =>
    pos.x < 70 || pos.y < 70 || pos.x > TABLE_W - 220 || pos.y > TABLE_H - 180;

  // Handle loader finish: smooth dissolve of loader curtain without moving book
  const handleLoaderFinished = () => {
    setLoaderFinished(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }, 400);
  };

  // Pan canvas (table dragging)
  const handlePanStart = (e: React.PointerEvent) => {
    if (isLoading) return; // Prevent panning during loader flip sequence
    if ((e.target as HTMLElement).closest('.it, .bookwrap, .desk-controls-bar')) return;
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

  // Full grab experience: Spawn and take a brand new item from the book onto the desk!
  const handleGrabNewItemFromBook = (type: DeskItemType, e: React.PointerEvent) => {
    e.stopPropagation();

    // Spawn at cursor position translated to table world coordinates
    const tableX = Math.round(e.clientX - pan.x - 70);
    const tableY = Math.round(e.clientY - pan.y - 60);

    const newInstanceId = `${type}-${Date.now()}`;
    const newItem: DeskItemInstance = {
      instanceId: newInstanceId,
      type,
      x: tableX,
      y: tableY
    };

    setItems((prev) => [...prev, newItem]);
    onShowToast(`✨ Grabbed ${getItemName(type)} from book onto desk!`);

    // Immediately attach dragging so the item glides with the cursor
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = tableX;
    const origY = tableY;

    const onMove = (ev: PointerEvent) => {
      const curX = origX + (ev.clientX - startX);
      const curY = origY + (ev.clientY - startY);
      setItems((prev) =>
        prev.map((it) => (it.instanceId === newInstanceId ? { ...it, x: curX, y: curY } : it))
      );
      setWarningActive(isNearEdge({ x: curX, y: curY }));
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setWarningActive(false);

      setItems((prev) => {
        const item = prev.find((it) => it.instanceId === newInstanceId);
        if (item && isOffTable(item)) {
          onShowToast(`⚠️ ${getItemName(type)} fell off table!`);
          return prev.filter((it) => it.instanceId !== newInstanceId);
        }
        return prev;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Drag existing item on the desk
  const handleItemDrag = (instanceId: string, e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.play-btn, .mini-play-speaker')) return;
    e.stopPropagation();

    const current = items.find((it) => it.instanceId === instanceId);
    if (!current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = current.x;
    const origY = current.y;

    const el = e.currentTarget as HTMLElement;
    el.classList.add('drag');

    const onMove = (ev: PointerEvent) => {
      const curX = origX + (ev.clientX - startX);
      const curY = origY + (ev.clientY - startY);
      setItems((prev) =>
        prev.map((it) => (it.instanceId === instanceId ? { ...it, x: curX, y: curY } : it))
      );
      setWarningActive(isNearEdge({ x: curX, y: curY }));
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.classList.remove('drag');
      setWarningActive(false);

      setItems((prev) => {
        const item = prev.find((it) => it.instanceId === instanceId);
        if (item && isOffTable(item)) {
          el.classList.add('fall');
          onShowToast(`⚠️ ${getItemName(item.type)} fell off table!`);
          setTimeout(() => {
            setItems((curr) => curr.filter((it) => it.instanceId !== instanceId));
          }, 800);
          return prev;
        }
        return prev;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const getItemName = (type: DeskItemType) => {
    switch (type) {
      case 'radio': return 'Vintage Radio (ECHO Podcasts)';
      case 'mic': return 'Microphone (Discussion Group)';
      case 'pen': return 'Pen & Paper (Classes)';
      case 'dict': return 'Dictionary (Word of the Day)';
      case 'gram': return 'Grammar Paper';
      case 'prn': return 'Voice Pronunciation Radio';
      default: return 'Desk Object';
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

  // Render individual desk item based on its type
  const renderItemContent = (item: DeskItemInstance) => {
    switch (item.type) {
      case 'radio':
        return (
          <div
            className="vintage-radio-wrap obj"
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
            <img
              src="/vintage-radio.avif"
              alt="Vintage Radio"
              className="vintage-radio-desk-img"
              draggable={false}
            />
          </div>
        );

      case 'mic':
        return (
          <div
            className="mic-wrap obj"
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
            <div className="mic-head"></div>
            <div className="mic-stem"></div>
            <div className="mic-base"></div>
          </div>
        );

      case 'pen':
        return (
          <div
            className="paper-sheet pen-note obj type"
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
            ESC is the best english club ever
            <div className="fountain-pen"></div>
          </div>
        );

      case 'dict':
        return (
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
        );

      case 'gram':
        return (
          <div className="paper-sheet gram-note obj type">
            <b style={{ color: 'var(--br)', display: 'block', marginBottom: '6px' }}>
              Grammar Rule of the Day
            </b>
            {wordData.rule}
          </div>
        );

      case 'prn':
        return (
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
        );

      default:
        return null;
    }
  };

  return (
    <section id="home" ref={homeRef} onPointerDown={handlePanStart}>
      {/* 1. SOLID COLOR LOADING CURTAIN (#111744 - NO GRADIENT, NO PROGRESS BAR) */}
      <div
        id="loader-curtain"
        className={`${loaderFinished ? 'finished' : 'active'} ${!isLoading ? 'gone' : ''}`}
        aria-hidden={!isLoading}
      >
        <div className="loader-title-clean">
          {loaderFinished ? '✦ ESC ARCHIVE OPENED ✦' : 'OPENING ESC ARCHIVE…'}
        </div>
      </div>

      {/* 2. INFINITE 3D STUDY DESK CANVAS */}
      <div
        id="world"
        ref={worldRef}
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }}
      >
        {/* Vintage Wooden Table Top: dissolves in smoothly underneath the book */}
        <div
          id="table"
          className={isLoading ? 'table-concealed' : 'table-revealed'}
        ></div>

        {/* Desk Items Layer: fades in on the table around the book */}
        <div
          className={`desk-items-layer ${isLoading ? 'items-concealed' : 'items-revealed'}`}
        >
          {items.map((item) => (
            <div
              key={item.instanceId}
              className="it"
              style={{ left: `${item.x}px`, top: `${item.y}px` }}
              onPointerDown={(e) => handleItemDrag(item.instanceId, e)}
            >
              {renderItemContent(item)}
            </div>
          ))}
        </div>

        {/* 3. CENTER 3D ARCHIVE BOOK (THE ONE AND ONLY BOOK - NEVER MOVES OR JUMPS) */}
        <div className="bookwrap">
          <EscBook
            startPage={0}
            wordData={wordData}
            onGrabNewItem={handleGrabNewItemFromBook}
            onPlayPronunciation={playPronunciation}
            isPlayingAudio={isPlayingAudio}
            isLoaderMode={isLoading}
            onLoaderFinished={handleLoaderFinished}
            width={350}
            height={480}
          />
        </div>
      </div>

      <div className={`desk-nav-hint ${isLoading ? 'hidden' : ''}`}>
        ✦ Turn book pages · Grab new elements directly from pages onto the table · Pan desk freely ✦
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

export default HeroDesk;
