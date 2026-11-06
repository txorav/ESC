import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav>
      <div className="paper-bar">
        <a href="#home">Home</a>
        <a href="#intro">About</a>
        <a href="#tl">Events</a>
        <a href="#board">DG</a>
        <a href="#dept">Activities</a>
        <a href="#faq">Contact us</a>
        <a className="cta" href="#faq">Follow us</a>
      </div>
    </nav>
  );
};
