import React, { useState, useEffect } from 'react';
import GooeyNav from './reactbits/GooeyNav';
import type { GooeyNavItem } from './reactbits/GooeyNav';

interface NavbarProps {
  hidden?: boolean;
  activeSection?: string;
  theme?: 'dark' | 'light';
}

const NAV_ITEMS: GooeyNavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#intro' },
  { label: 'Events', href: '#tl' },
  { label: 'DG', href: '#board' },
  { label: 'Activities', href: '#dept' },
  { label: 'Contact', href: '#faq' },
];

const SECTION_MAP: Record<string, number> = {
  home: 0,
  intro: 1,
  tl: 2,
  stats: 2,
  'measure-members': 2,
  'measure-events': 2,
  'measure-workshops': 2,
  'measure-awards': 2,
  'measure-partners': 2,
  board: 3,
  dept: 4,
  faq: 5,
};

export const Navbar: React.FC<NavbarProps> = ({
  hidden = false,
  activeSection = 'home',
  theme = 'dark',
}) => {
  const targetIndex = SECTION_MAP[activeSection] ?? 0;
  const [activeIndex, setActiveIndex] = useState(targetIndex);

  useEffect(() => {
    setActiveIndex(targetIndex);
  }, [targetIndex]);

  return (
    <header className={`esc-navbar-wrapper ${hidden ? 'nav-hidden' : 'nav-visible'}`}>
      <div className="esc-navbar-inner">
        {/* Left: Logo */}
        <a href="#home" className="esc-navbar-brand" aria-label="ESC Home">
          <img src="/logo.svg" alt="ESC Logo" className="esc-navbar-logo-img" />
          <span className="esc-navbar-brand-name">ESC</span>
        </a>

        {/* Center: GooeyNav */}
        <div className="esc-navbar-center">
          <GooeyNav
            items={NAV_ITEMS}
            activeIndex={activeIndex}
            theme={theme}
            color="#CD202A"
            activeTextColor="#FFFFFF"
            colors={['#CD202A', '#283FC3']}
            size="md"
            frame={true}
            particleCount={15}
            spread={56}
            animationTime={600}
            timeVariance={300}
            gooeyness={0.5}
            wobble={0.5}
            hoverEffect={true}
            onChange={(index, item) => {
              setActiveIndex(index);
              if (item.href?.startsWith('#')) {
                const el = document.querySelector(item.href);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
          />
        </div>

        {/* Right: CTA */}
        <div className="esc-navbar-right">
          <a href="#footer" className="esc-navbar-cta">
            Follow us
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
