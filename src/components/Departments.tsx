import React, { useState } from 'react';

interface Department {
  name: string;
  desc: string;
}

const DEPARTMENTS: Department[] = [
  {
    name: 'Debate',
    desc: 'Weekly British Parliamentary and Oxford debate sparring rounds, motion analysis, and argumentation mechanics.'
  },
  {
    name: 'Public Speaking',
    desc: 'Stage presence, impromptu delivery, TED-style keynote training, and fear-of-public-speaking workshops.'
  },
  {
    name: 'Creative Writing',
    desc: 'Short stories, slam poetry, analytical literary essays, and quarterly campus anthologies.'
  },
  {
    name: 'Media & Podcast',
    desc: 'Sound design, ECHO podcast hosting, live event videography, and social media storytelling.'
  },
  {
    name: 'Events & Logistics',
    desc: 'Coordinating campus festivals, national debate tournaments, guest panels, and venue logistics.'
  },
  {
    name: 'Design & Branding',
    desc: 'Visual identities, typography, posters, merch, and digital interactive experiences.'
  }
];

export const Departments: React.FC = () => {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});

  const toggleFolder = (name: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <section className="sec" id="dept" data-bg="#2C3076">
      <h2 className="sec-heading">Our Departments</h2>
      <p className="sec-subheading">
        Click any department folder to view missions, projects, and weekly schedules.
      </p>

      <div className="folders-grid">
        {DEPARTMENTS.map((d) => {
          const isOpen = !!openFolders[d.name];
          return (
            <div
              key={d.name}
              className={`folder-item ${isOpen ? 'open' : ''}`}
              tabIndex={0}
              role="button"
              aria-label={`Open ${d.name} Department Folder`}
              onClick={() => toggleFolder(d.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFolder(d.name);
                }
              }}
            >
              <div className="folder-tab"></div>
              <div className="folder-back"></div>
              <div className="folder-doc type">
                <b>{d.name} Department</b>
                <p>{d.desc}</p>
                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--dr)', fontWeight: 700 }}>
                  STATUS: ACTIVE ENROLLMENT
                </div>
              </div>
              <div className="folder-front">{d.name}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
