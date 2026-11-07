import React from 'react';
import Lanyard from './reactbits/Lanyard';

export const BoardLanyards: React.FC = () => {
  return (
    <section className="sec" id="board" data-bg="#1C1E4B" data-theme="dark">
      <div className="sec-divider esc-reveal" />
      <div className="sec-head-wrap esc-reveal">
        <span className="sec-eyebrow">03 / EXECUTIVE LEADERSHIP</span>
        <h2 className="sec-heading">Board Members</h2>
        <p className="sec-subheading">
          Three visionary leaders orchestrating our debate tournaments, podcasts, and cultural exchanges.
        </p>
      </div>

      <div className="board-podium-layout esc-reveal">
        {/* LEFT: VICE PRESIDENT (Scaled down) */}
        <div className="board-member-item board-member-side board-member-left">
          <div className="lanyard-3d-box">
            <Lanyard
              frontImage="/badges/vp.svg"
              cardColor="#1C1E4B"
              strapColor="#283FC3"
              finish="glossy"
              size={0.78}
              gravity={0.9}
              breeze={0.14}
            />
          </div>
          <div className="board-info-pure">
            <span className="board-role-tag vp">VICE PRESIDENT</span>
            <h3 className="board-name">Lina Haddad</h3>
            <p className="board-bio">
              Directing member development, workshop curriculums, and inter-university public speaking leagues.
            </p>
          </div>
        </div>

        {/* CENTER: PRESIDENT (Bigger & elevated) */}
        <div className="board-member-item board-member-center">
          <div className="lanyard-3d-box">
            <Lanyard
              frontImage="/badges/president.svg"
              cardColor="#111744"
              strapColor="#BF2026"
              finish="glossy"
              size={1.0}
              gravity={0.9}
              breeze={0.18}
            />
          </div>
          <div className="board-info-pure">
            <span className="board-role-tag president">PRESIDENT</span>
            <h3 className="board-name">Amine Belkacem</h3>
            <p className="board-bio">
              Leading club strategy, cross-faculty debate partnerships, and international speaking symposiums.
            </p>
          </div>
        </div>

        {/* RIGHT: SECRETARY GENERAL (Scaled down) */}
        <div className="board-member-item board-member-side board-member-right">
          <div className="lanyard-3d-box">
            <Lanyard
              frontImage="/badges/sg.svg"
              cardColor="#1C1E4B"
              strapColor="#4E55D3"
              finish="glossy"
              size={0.78}
              gravity={0.9}
              breeze={0.14}
            />
          </div>
          <div className="board-info-pure">
            <span className="board-role-tag sg">SECRETARY GENERAL</span>
            <h3 className="board-name">Yacine Mansouri</h3>
            <p className="board-bio">
              Overseeing official club communications, podcast studio logistics, and national tournament records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardLanyards;
