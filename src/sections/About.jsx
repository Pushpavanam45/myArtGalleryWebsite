import art9 from '../assets/art9.webp';
import art7 from '../assets/art7.webp';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container about-grid">

        <div className="about-images">
          <div className="about-img-main">
            <img src={art9} alt="Portrait — Gaze" />
          </div>
          <div className="about-img-secondary">
            <img src={art7} alt="Portrait — Four Faces" />
          </div>
          <div className="about-img-badge">Est. 2019</div>
        </div>

        <div className="about-content">
          <div className="about-label">
            <div className="about-label-line"></div>
            <span>About the Artist</span>
          </div>

          <h2 className="about-heading">
            Art that captures<br /><em>the soul</em> of its subject
          </h2>

          <div className="about-bio">
            <p>
              I am a portrait artist and visual creator based in India, specialising in graphite, charcoal, and acrylic. My work begins with a photograph and transforms it into a permanent, hand-crafted work of art.
            </p>
            <p>
              Each piece is built on the rigorous study of anatomy, light, and human expression — balancing technical discipline with emotional storytelling.
            </p>
          </div>

          <div className="about-stats">
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Commissions</span>
            </div>
            <div className="stat">
              <span className="stat-number">5+</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat">
              <span className="stat-number">5</span>
              <span className="stat-label">Mediums</span>
            </div>
          </div>

          <div className="about-signature">Gautham</div>
        </div>

      </div>
    </section>
  );
};

export default About;
