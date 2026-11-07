import React from 'react';
import Folder from './reactbits/Folder';

interface DeptData {
  name: string;
  color: string;
  items: { title: string; description: string }[];
  tagline: string;
}

const DEPARTMENTS: DeptData[] = [
  {
    name: 'Debate',
    color: '#283FC3',
    tagline: 'Rhetoric, motion parsing & competitive sparring',
    items: [
      { title: 'Weekly Sparring', description: 'British Parliamentary & Oxford rounds with judge feedback.' },
      { title: 'Motion Masterclasses', description: 'Deep dives into economics, ethics, and geopolitical policy.' },
      { title: 'National Circuit', description: 'Representing ESC across inter-faculty championships.' }
    ]
  },
  {
    name: 'Public Speaking',
    color: '#BF2026',
    tagline: 'Stage poise, impromptu delivery & TED keynotes',
    items: [
      { title: 'TEDx Coaching', description: 'Crafting unforgettable personal narratives and speech arcs.' },
      { title: 'Vocal Mechanics', description: 'Diaphragmatic projection, pacing, and tone modulation.' },
      { title: 'Impromptu Jam', description: 'Spontaneous 1-minute talks on unexpected topics.' }
    ]
  },
  {
    name: 'Creative Writing',
    color: '#111744',
    tagline: 'Prose, slam poetry & student literary anthologies',
    items: [
      { title: 'Annual Anthology', description: 'Curating, editing, and publishing student short stories.' },
      { title: 'Slam Poetry Lab', description: 'Metaphor, spoken cadence, and stage delivery drills.' },
      { title: 'Critical Reviews', description: 'Bi-weekly reviews of classic and contemporary literature.' }
    ]
  },
  {
    name: 'ECHO Media',
    color: '#4E55D3',
    tagline: 'Studio recording, podcasting & sound design',
    items: [
      { title: 'ECHO Podcast', description: 'Hosting guest episodes and student roundtable panels.' },
      { title: 'Audio Mastering', description: 'Sound engineering, background ambience, and mixing.' },
      { title: 'Reels & Documentaries', description: 'Shooting high-energy event recaps and member features.' }
    ]
  },
  {
    name: 'Events & Logistics',
    color: '#CD202A',
    tagline: 'Campus festivals, open mics & gala tournaments',
    items: [
      { title: 'English Week', description: 'Five full days of spelling bees, cinema nights, and trivia.' },
      { title: 'Open Mic Nights', description: 'Atmospheric evening for acoustic music and monologues.' },
      { title: 'Operations Hub', description: 'Budgeting, auditorium reservations, and technical stagecraft.' }
    ]
  },
  {
    name: 'Design & Web',
    color: '#2C3076',
    tagline: 'Visual identity, 3D interactive design & brand assets',
    items: [
      { title: 'Brand Identity', description: 'Designing posters, badge credentials, and apparel.' },
      { title: 'Interactive Web', description: 'Developing web experiences, archives, and digital tools.' },
      { title: 'Digital Media', description: 'Social cards, typographic animations, and video graphics.' }
    ]
  }
];

export const Departments: React.FC = () => {
  return (
    <section className="sec" id="dept" data-bg="#2C3076" data-theme="dark">
      <div className="sec-head-wrap esc-reveal">
        <span className="sec-eyebrow">04 / GUILDS &amp; DEPARTMENTS</span>
        <h2 className="sec-heading">Our Departments</h2>
        <p className="sec-subheading">
          Explore ESC’s specialized teams. Click or hover any folder to inspect documents and projects.
        </p>
      </div>

      <div className="folders-grid esc-reveal">
        {DEPARTMENTS.map((d) => (
          <div key={d.name} className="folder-card-wrapper">
            <div className="folder-component-box">
              <Folder
                label={d.name}
                color={d.color}
                items={d.items}
                size={1.15}
                openOn="click"
                layout="spread"
                theme="dark"
              />
            </div>
            <div className="folder-caption">
              <h4 className="folder-caption-title">{d.name}</h4>
              <p className="folder-caption-desc">{d.tagline}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Departments;
