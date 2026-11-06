import React from 'react';

interface Member {
  name: string;
  role: string;
  initials: string;
  delay: string;
  isLead?: boolean;
}

const BOARD_MEMBERS: Member[] = [
  { name: 'Lina Haddad', role: 'Vice President', initials: 'LH', delay: '1.2s' },
  { name: 'Amine Belkacem', role: 'President', initials: 'AB', delay: '0s', isLead: true },
  { name: 'Yacine Mansouri', role: 'Secretary General', initials: 'YM', delay: '2.4s' },
  { name: 'Sara Benali', role: 'Treasurer', initials: 'SB', delay: '1.8s' },
  { name: 'Karim Ouali', role: 'Events Lead', initials: 'KO', delay: '3.1s' }
];

export const BoardLanyards: React.FC = () => {
  return (
    <section className="sec" id="board" data-bg="#1C1E4B">
      <h2 className="sec-heading">Board Members</h2>
      <p className="sec-subheading">
        The passionate leaders orchestrating our debate tournaments, podcasts, and cultural exchanges.
      </p>

      <div className="lanyards-container">
        {BOARD_MEMBERS.map((m) => (
          <div
            key={m.name}
            className={`lanyard ${m.isLead ? 'lead' : ''}`}
            style={{ '--delay': `-${m.delay}` } as React.CSSProperties}
          >
            <div className="lanyard-strap"></div>
            <div className="lanyard-clasp"></div>
            <div className="badge-card">
              <div className="badge-avatar">{m.initials}</div>
              <div className="badge-name">{m.name}</div>
              <div className="badge-role">{m.role}</div>
              <div className="badge-club">ESC · Board of 2026</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
