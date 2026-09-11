import { Link } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Services', href: '#services' },
];

const Navbar = ({ setCursorState }) => {
  const scrollTo = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container flex">
        <Link to="/" className="navbar-logo"
          onMouseEnter={() => setCursorState('hovering-link')}
          onMouseLeave={() => setCursorState('')}>
          Gautham.
        </Link>

        <ul className="navbar-links flex">
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
