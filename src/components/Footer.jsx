import './Footer.css';

const Footer = ({ setCursorState }) => {
  return (
    <footer className="footer">
      <div className="container footer-inner">

        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">Gautham.</h3>
            <p className="footer-tagline">Drawn by hand. Created with patience.</p>
          </div>

          <div className="footer-middle">
            {/* subtle wave */}
          </div>

          <div className="footer-links-col">
            <a href="#about">About</a>
            <a href="#gallery">Gallery</a>
            <a href="#services">Services</a>
            <a href="#contact">Commission</a>
          </div>
        </div>

        <div className="footer-wave">
          <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 16 Q180 2, 360 16 T720 16 T1080 16 T1440 16" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Gautham. All rights reserved.</p>
          <p>Portrait Artist — Visual Artist — India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
