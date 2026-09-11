import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import './ArtworkViewer.css';

const ArtworkViewer = ({ artwork, onClose, setCursorState, artworks, setSelectedArtwork }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const imgRef = useRef(null);

  useEffect(() => {
    if (artwork) {
      setActiveIdx(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [artwork]);

  useEffect(() => {
    const handler = (e) => {
      if (!artwork) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [artwork, artworks]);

  if (!artwork) return null;

  const currentIdx = artworks.findIndex(a => a.id === artwork.id);

  const swapImg = (targetIdx) => {
    if (targetIdx === activeIdx) return;
    gsap.to(imgRef.current, {
      opacity: 0, scale: 0.97, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        setActiveIdx(targetIdx);
        gsap.to(imgRef.current, { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' });
      }
    });
  };

  const handleNext = () => {
    if (currentIdx < artworks.length - 1) {
      gsap.to(imgRef.current, { x: -30, opacity: 0, duration: 0.2, onComplete: () => {
        setSelectedArtwork(artworks[currentIdx + 1]);
        gsap.fromTo(imgRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25 });
      }});
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      gsap.to(imgRef.current, { x: 30, opacity: 0, duration: 0.2, onComplete: () => {
        setSelectedArtwork(artworks[currentIdx - 1]);
        gsap.fromTo(imgRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25 });
      }});
    }
  };

  return (
    <div className="artwork-viewer open">
      <div className="viewer-backdrop" onClick={onClose} />

      <div className="viewer-panel">
        <button className="viewer-close" onClick={onClose}
          onMouseEnter={() => setCursorState('hovering-link')}
          onMouseLeave={() => setCursorState('')}>
          ×
        </button>

        {/* Left: Image */}
        <div className="viewer-img-area">
          <img
            ref={imgRef}
            className="viewer-main-img"
            src={artwork.images[activeIdx].src}
            alt={`${artwork.title} — ${artwork.images[activeIdx].label}`}
          />
          {artwork.images.length > 1 && (
            <div className="viewer-thumbs">
              {artwork.images.map((img, i) => (
                <div key={i}
                  className={`viewer-thumb ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => swapImg(i)}
                  onMouseEnter={() => setCursorState('hovering-link')}
                  onMouseLeave={() => setCursorState('')}>
                  <img src={img.src} alt={img.label} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="viewer-info">
          <div>
            <div className="viewer-cat-badge">{artwork.category}</div>
            <h2 className="viewer-title">{artwork.title}</h2>
            <div className="viewer-meta">
              <p>{artwork.medium}</p>
              <p>{artwork.year}</p>
            </div>
            <p className="viewer-desc">"{artwork.description}"</p>
          </div>

          <div className="viewer-nav">
            <button className="viewer-nav-btn" onClick={handlePrev} disabled={currentIdx === 0}
              onMouseEnter={() => setCursorState('hovering-link')}
              onMouseLeave={() => setCursorState('')}>
              ← Prev
            </button>
            <span className="viewer-counter">{currentIdx + 1} / {artworks.length}</span>
            <button className="viewer-nav-btn" onClick={handleNext} disabled={currentIdx === artworks.length - 1}
              onMouseEnter={() => setCursorState('hovering-link')}
              onMouseLeave={() => setCursorState('')}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkViewer;
