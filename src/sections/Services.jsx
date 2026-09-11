import { useState, useEffect } from 'react';
import { services as localServices } from '../data/services';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import './Services.css';

const Services = ({ setCursorState }) => {
  const [services, setServices] = useState(localServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(collection(db, "services"), orderBy("id", "asc"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
          setServices(data);
        }
      } catch (err) {
        console.error("Error fetching services, falling back to local data:", err);
      }
    };
    fetchServices();
  }, []);
  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="services-header">
          <div>
            <div className="services-label">
              <div className="services-label-line"></div>
              <span>What I Offer</span>
            </div>
            <h2 className="services-heading">Commission <em>Services</em></h2>
          </div>
          <a href="#contact"
            className="btn-fill"
            style={{ background: 'var(--terracotta)', alignSelf: 'flex-end' }}
            onMouseEnter={() => setCursorState('hovering-link')}
            onMouseLeave={() => setCursorState('')}
            onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Request Commission
          </a>
        </div>

        <div className="services-grid">
          {services.map(s => (
            <div key={s.id} className="service-card">
              <span className="service-number">{s.id}</span>
              <div className="service-img-wrap">
                <img src={s.image} alt={s.title} loading="lazy" />
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.description}</p>
              <p className="service-price">{s.price}</p>
              <a href="#contact"
                className="service-link"
                onMouseEnter={() => setCursorState('hovering-link')}
                onMouseLeave={() => setCursorState('')}
                onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Enquire →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
