import React from 'react';
import UnifiedLanyard from './reactbits/UnifiedLanyard';

export const BoardLanyards: React.FC = () => {
  return (
    <section className="sec" id="board" data-bg="#1C1E4B" data-theme="dark">
      <div className="sec-head-wrap esc-reveal">
        <span className="sec-eyebrow">03 / EXECUTIVE LEADERSHIP</span>
        <h2 className="sec-heading">Board Members</h2>
        <p className="sec-subheading">
          Three visionary leaders orchestrating our debate tournaments, podcasts, and cultural exchanges.
        </p>
      </div>

      {/* Unified 3D physics arena spanning full section width with badge-to-badge collisions */}
      <div className="board-interactive-arena esc-reveal">
        <UnifiedLanyard
          gravity={0.9}
          breeze={0.15}
          elasticity={0.65}
          damping={0.48}
        />
      </div>

      <div className="board-podium-info-row esc-reveal">
        {/* LEFT: VICE PRESIDENT */}
        <div className="board-member-info-col board-member-left">
          <span className="board-role-tag vp">VICE PRESIDENT</span>
          <h3 className="board-name">Lina Haddad</h3>
          <p className="board-bio">
            Directing member development, workshop curriculums, and inter-university public speaking leagues.
          </p>
        </div>

        {/* CENTER: PRESIDENT */}
        <div className="board-member-info-col board-member-center">
          <span className="board-role-tag president">PRESIDENT</span>
          <h3 className="board-name">Amine Belkacem</h3>
          <p className="board-bio">
            Leading club strategy, cross-faculty debate partnerships, and international speaking symposiums.
          </p>
        </div>

        {/* RIGHT: SECRETARY GENERAL */}
        <div className="board-member-info-col board-member-right">
          <span className="board-role-tag sg">SECRETARY GENERAL</span>
          <h3 className="board-name">Yacine Mansouri</h3>
          <p className="board-bio">
            Overseeing official club communications, podcast studio logistics, and national tournament records.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BoardLanyards;
