import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroDesk } from './components/HeroDesk';
import { IntroClouds } from './components/IntroClouds';
import { Timeline } from './components/Timeline';
import { StatsSection } from './components/StatsSection';
import { BoardLanyards } from './components/BoardLanyards';
import { Departments } from './components/Departments';
import { FAQFooter } from './components/FAQFooter';
import { Modal } from './components/Modal';
import type { ModalContent } from './types';
import './App.css';

export const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalContent | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? '' : cur));
    }, 2800);
  };

  // Section Background Color Shift Observer with POX-style midpoint scanline trigger
  useEffect(() => {
    let ticking = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const bg = el.dataset.bg;
            const theme = el.dataset.theme || (bg?.toLowerCase() === '#ffffff' ? 'light' : 'dark');

            if (bg) {
              document.body.style.setProperty('--esc-bg', bg);
              document.body.style.backgroundColor = bg;
            }
            document.body.dataset.theme = theme;

            // Highlight active navigation link
            const id = el.id;
            if (id) {
              document.querySelectorAll('.paper-bar a').forEach((a) => {
                const href = a.getAttribute('href');
                if (href === `#${id}`) {
                  a.classList.add('active');
                } else {
                  a.classList.remove('active');
                }
              });
            }
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    document.querySelectorAll('[data-bg]').forEach((el) => observer.observe(el));

    // Scroll listener for sticky nav state and scroll reveals
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const nav = document.querySelector('nav.top-paper-nav');
        if (nav) {
          nav.classList.toggle('scrolled', y > 36);
        }

        // Section reveals (POX-inspired .esc-reveal)
        const vh = window.innerHeight;
        document.querySelectorAll('.esc-reveal:not(.in)').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < vh * 0.88) {
            el.classList.add('in');
          }
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Top Progressive Blur (adapts dynamically to active section background color) */}
      <div className="esc-top-blur" aria-hidden="true">
        <i className="blur-tint" />
        <i />
        <i />
        <i />
      </div>

      <Navbar hidden={isLoading} />
      <HeroDesk
        onOpenModal={setActiveModal}
        onShowToast={showToast}
        onLoadingChange={setIsLoading}
      />
      <IntroClouds />
      <Timeline />
      <StatsSection />
      <BoardLanyards />
      <Departments />
      <FAQFooter />

      <Modal content={activeModal} onClose={() => setActiveModal(null)} />

      {/* Floating Toast Notification */}
      <div id="toast" className={toastMessage ? 'on' : ''}>
        {toastMessage}
      </div>
    </>
  );
};

export default App;
