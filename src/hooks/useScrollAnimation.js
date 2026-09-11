// Scroll animation hook — lightweight, fast
// Uses IntersectionObserver for crisp, instant reveal
import { useEffect } from 'react';

export const useScrollAnimation = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(
      '.about-content, .about-images, .gallery-header, .services-header, .contact-cta-banner'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
};
