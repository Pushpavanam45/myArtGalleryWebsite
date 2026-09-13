import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Services', href: '#services' },
];

const Navbar = ({ setCursorState }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container flex">
        <Link to="/" className="navbar-logo"
          onMouseEnter={() => setCursorState('hovering-link')}
          onMouseLeave={() => setCursorState('')}>
          Spade Arts
        </Link>

        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`navbar-links flex ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <a href={href} onClick={e => scrollTo(e, href)}
                onMouseEnter={() => setCursorState('hovering-link')}
                onMouseLeave={() => setCursorState('')}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" onClick={e => scrollTo(e, '#contact')}
              className="navbar-contact-btn"
              onMouseEnter={() => setCursorState('hovering-link')}
              onMouseLeave={() => setCursorState('')}>
              Commission
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
