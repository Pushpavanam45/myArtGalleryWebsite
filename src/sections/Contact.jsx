import { useState } from 'react';
import './Contact.css';

const EMPTY_FORM = { name: '', email: '', phone: '', type: '', message: '' };

const Contact = ({ setCursorState }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [status, setStatus]   = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();

    // Basic client-side guard
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('success');
        setForm(EMPTY_FORM);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Sorry, we couldn\'t send your message. Please try again later.');
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">

        {/* CTA Banner */}
        <div className="contact-cta-banner">
          <div className="contact-cta-text">
            <div className="contact-cta-label">
              <div className="contact-cta-label-line"></div>
              <span>Commissions Open</span>
            </div>
            <h2 className="contact-cta-headline">
              Have a photograph you'd like <em>transformed into art?</em>
            </h2>
          </div>
          <a href="mailto:studio@gautham.art" className="btn-fill"
            style={{ background: 'var(--terracotta)' }}
            onMouseEnter={() => setCursorState('hovering-link')}
            onMouseLeave={() => setCursorState('')}>
            studio@gautham.art
          </a>
        </div>

        {/* Form + Info */}
        <div className="contact-grid">
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="Your name" value={form.name} onChange={onChange} required disabled={status === 'loading'} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={onChange} required disabled={status === 'loading'} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone (Optional)</label>
                <input type="tel" name="phone" placeholder="+91 ..." value={form.phone} onChange={onChange} disabled={status === 'loading'} />
              </div>
              <div className="form-group">
                <label>Artwork Type</label>
                <select name="type" value={form.type} onChange={onChange} required disabled={status === 'loading'}>
                  <option value="" disabled>Select type...</option>
                  <option>Graphite Pencil Portrait</option>
                  <option>Charcoal Portrait</option>
                  <option>Realistic Portrait</option>
                  <option>Hyper-Realistic Portrait</option>
                  <option>Acrylic Painting</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Your Vision</label>
              <textarea name="message" placeholder="Tell me about the portrait you'd like..." value={form.message} onChange={onChange} required disabled={status === 'loading'} />
            </div>

            {/* Status messages */}
            {status === 'success' && (
              <p className="form-status form-status--success">
                ✓ Thank you! Your message has been sent successfully. I'll be in touch soon.
              </p>
            )}
            {status === 'error' && (
              <p className="form-status form-status--error">
                {errorMsg || 'Sorry, we couldn\'t send your message. Please try again later.'}
              </p>
            )}

            <div className="form-submit">
              <button
                type="submit"
                className="btn-fill"
                disabled={status === 'loading' || status === 'success'}
                onMouseEnter={() => setCursorState('hovering-link')}
                onMouseLeave={() => setCursorState('')}
              >
                {status === 'loading' ? 'Sending…' : 'Send Enquiry'}
              </button>
            </div>
          </form>

          <div className="contact-info">
            <h3 className="info-heading">Let's create <em>something</em> lasting</h3>

            <div className="info-block">
              <p className="info-block-label">Email</p>
              <p className="info-block-value">studio@gautham.art</p>
            </div>
            <div className="info-block">
              <p className="info-block-label">Location</p>
              <p className="info-block-value">India · Worldwide Shipping</p>
            </div>
            <div className="info-block">
              <p className="info-block-label">Turnaround</p>
              <p className="info-block-value">2–6 weeks depending on complexity</p>
            </div>

            <div className="info-social">
              {[{ icon: '📸', label: 'Instagram', handle: '@gautham.art' },
                { icon: '💬', label: 'WhatsApp', handle: '+91 XXXXX XXXXX' },
                { icon: '🎨', label: 'Behance', handle: 'gautham.art' }
              ].map(({ icon, label, handle }) => (
                <a key={label} href="#" className="info-social-link"
                  onMouseEnter={() => setCursorState('hovering-link')}
                  onMouseLeave={() => setCursorState('')}>
                  <div className="social-icon">{icon}</div>
                  <span>{label} — {handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
