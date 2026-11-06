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

  // Section Background Color Shift Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bg = (entry.target as HTMLElement).dataset.bg;
            if (bg) {
              document.body.style.background = bg;
            }
          }
        });
      },
      { threshold: 0.35 }
    );

    document.querySelectorAll('[data-bg]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
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
