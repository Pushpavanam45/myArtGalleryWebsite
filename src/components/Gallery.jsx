import { useState, useRef, useEffect } from 'react';
import { artworks as localArtworks, categories } from '../data/artworks';
import ArtworkViewer from './ArtworkViewer';
import { gsap } from 'gsap';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Gallery.css';

const Gallery = ({ setCursorState }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [artworks, setArtworks] = useState(localArtworks);
  const gridRef = useRef(null);

  // Fetch dynamic artworks from Firebase
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "artworks"));
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setArtworks(data);
        }
      } catch (err) {
        console.error("Error fetching artworks, falling back to local data:", err);
      }
    };
    fetchArtworks();
  }, []);

  const filtered = activeCategory === 'ALL'
    ? artworks
    : artworks.filter(a => a.category.toUpperCase() === activeCategory);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.gallery-card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [activeCategory, artworks]);

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">

        {/* Header */}
        <div className="gallery-header">
          <div className="gallery-label">
            <div className="gallery-label-line"></div>
            <span>The Collection</span>
          </div>
          <h2 className="gallery-heading">Selected <em>Works</em></h2>
        </div>

        {/* Filters */}
        <div className="gallery-filters flex">
          {categories.map(cat => (
            <button key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              onMouseEnter={() => setCursorState('hovering-link')}
              onMouseLeave={() => setCursorState('')}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="gallery-grid" ref={gridRef}>
          {filtered.map((artwork, i) => (
            <div key={artwork.id}
              className={`gallery-card card-size-${(i % 5 === 0 || i % 5 === 3) ? 'large' : 'normal'}`}
              onClick={() => setSelectedArtwork(artwork)}
              onMouseEnter={() => setCursorState('hovering-artwork')}
              onMouseLeave={() => setCursorState('')}>
              <div className="gallery-card-img">
                <img src={artwork.coverImage} alt={artwork.title} loading="lazy" />
                <div className="gallery-card-overlay">
                  <span className="gallery-card-view">View Artwork</span>
                </div>
              </div>
              <div className="gallery-card-info">
                <div className="gallery-card-cat">{artwork.category}</div>
                <h4 className="gallery-card-title">{artwork.title}</h4>
                <p className="gallery-card-medium">{artwork.medium} · {artwork.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ArtworkViewer
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        setCursorState={setCursorState}
        artworks={filtered}
        setSelectedArtwork={setSelectedArtwork}
      />
    </section>
  );
};

export default Gallery;
