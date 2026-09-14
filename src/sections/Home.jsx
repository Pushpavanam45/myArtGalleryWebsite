import Gallery from '../components/Gallery';
import About from './About';
import Services from './Services';
import Contact from './Contact';
import art1 from '../assets/art1.webp';
import art2 from '../assets/art2.webp';
import art3 from '../assets/art3.webp';
import art4 from '../assets/art4.webp';
import './Home.css';

const Home = ({ setCursorState }) => {
  return (
    <div className="home-wrapper">
      {/* ── HERO ── */}
      <section id="hero" className="hero">
        
        {/* Floating Artworks (Option C) */}
        <div className="hero-floating-art art-1"><img src={art1} alt="Realistic graphite pencil portrait by Spade Arts" /></div>
        <div className="hero-floating-art art-2"><img src={art2} alt="Custom charcoal portrait artwork by Spade Arts" /></div>
        <div className="hero-floating-art art-3"><img src={art3} alt="Handmade pencil sketch portrait by Spade Arts" /></div>
        <div className="hero-floating-art art-4"><img src={art4} alt="Realistic portrait drawing by Spade Arts Chennai" /></div>

        <div className="hero-text">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line"></div>
            <span>Portrait &amp; Visual Artist · Chennai, Tamil Nadu</span>
            <div className="hero-eyebrow-line"></div>
          </div>

          <h1 className="hero-title">
            Spade Arts<br />
            <em>Studio</em>
          </h1>

          <div className="hero-actions">
            <a href="#gallery" className="btn-fill"
              onMouseEnter={() => setCursorState('hovering-link')}
              onMouseLeave={() => setCursorState('')}
              onClick={e => { e.preventDefault(); document.querySelector('#gallery')?.scrollIntoView({ behavior: 'smooth' }); }}>
              View Portraits
            </a>
            <a href="#contact" className="btn-outline"
              onMouseEnter={() => setCursorState('hovering-link')}
              onMouseLeave={() => setCursorState('')}
              onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Commission a Portrait
            </a>
          </div>
        </div>
      </section>

      <About setCursorState={setCursorState} />
      <Gallery setCursorState={setCursorState} />
      <Services setCursorState={setCursorState} />
      <Contact setCursorState={setCursorState} />
    </div>
  );
};

export default Home;
