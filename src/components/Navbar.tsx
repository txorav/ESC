import React from 'react';

interface NavbarProps {
  hidden?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ hidden = false }) => {
  return (
    <nav className={hidden ? 'nav-hidden' : 'nav-visible'}>
      <div className="paper-bar">
        <a href="#home">Home</a>
        <a href="#intro">About</a>
        <a href="#tl">Events</a>
        <a href="#board">DG</a>
        <a href="#dept">Activities</a>
        <a href="#faq">Contact us</a>
        <a className="cta" href="#footer">Follow us</a>
      </div>
    </nav>
  );
};

export default Navbar;
