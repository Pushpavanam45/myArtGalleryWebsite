import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './Admin.css';

// ── helpers ────────────────────────────────────────────────────────────────
const BACKEND = import.meta.env.VITE_BACKEND_URL || '';  // empty = use Vite proxy

async function uploadImages(files) {
  const form = new FormData();
  Array.from(files).forEach(f => form.append('images', f));
  
  let token = '';
  if (auth.currentUser) token = await auth.currentUser.getIdToken();

  const res = await fetch(`${BACKEND}/api/upload`, { 
    method: 'POST', 
    headers: { 'Authorization': `Bearer ${token}` },
    body: form 
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
  return res.json(); // { images: [{src, label}], coverImage }
}

async function deleteImages(paths) {
  if (!paths || paths.length === 0) return;
  
  let token = '';
  if (auth.currentUser) token = await auth.currentUser.getIdToken();

  const res = await fetch(`${BACKEND}/api/upload`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paths }),
  });
  if (!res.ok) console.error('Delete failed', await res.text());
}

// ── component ──────────────────────────────────────────────────────────────
const Admin = () => {
  const [activeTab, setActiveTab] = useState('artworks');

  // Artworks state
  const [artworks, setArtworks] = useState([]);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [artForm, setArtForm] = useState({ title: '', category: 'Graphite', medium: '', year: '', description: '' });
  const [artFiles, setArtFiles] = useState([]);
  const [artPreviews, setArtPreviews] = useState([]);
  const [uploadingArt, setUploadingArt] = useState(false);

  // Services state
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [srvForm, setSrvForm] = useState({ id: '01', title: '', description: '', price: '' });
  const [srvFile, setSrvFile] = useState(null);
  const [srvPreview, setSrvPreview] = useState(null);
  const [uploadingSrv, setUploadingSrv] = useState(false);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchArtworks = async () => {
    setLoadingArtworks(true);
    try {
      const qs = await getDocs(collection(db, 'artworks'));
      setArtworks(qs.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    setLoadingArtworks(false);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const qs = await getDocs(collection(db, 'services'));
      setServices(qs.docs.map(d => ({ firebaseId: d.id, ...d.data() })).sort((a, b) => a.id.localeCompare(b.id)));
    } catch (err) { console.error(err); }
    setLoadingServices(false);
  };

  useEffect(() => { fetchArtworks(); fetchServices(); }, []);

  // ── artwork handlers ──────────────────────────────────────────────────────
  const handleArtFileChange = (e) => {
    const files = Array.from(e.target.files);
    setArtFiles(files);
    setArtPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleCancelArtFile = () => {
    setArtFiles([]);
    setArtPreviews([]);
    document.getElementById('art-file').value = '';
  };

  const handleAddArtwork = async (e) => {
    e.preventDefault();
    if (artFiles.length === 0) return alert('Select at least one image');
    setUploadingArt(true);
    try {
      const { images, coverImage } = await uploadImages(artFiles);
      await addDoc(collection(db, 'artworks'), {
        ...artForm,
        coverImage,
        images,
        createdAt: new Date(),
      });
      setArtForm({ title: '', category: 'Graphite', medium: '', year: '', description: '' });
      setArtFiles([]);
      setArtPreviews([]);
      document.getElementById('art-file').value = '';
      fetchArtworks();
      alert('Artwork added!');
    } catch (err) { alert('Failed: ' + err.message); }
    setUploadingArt(false);
  };

  const handleDeleteArtwork = async (artwork) => {
    if (!window.confirm('Delete artwork? This cannot be undone.')) return;
    try {
      // Delete physical files first
      const paths = (artwork.images || []).map(img => img.src);
      if (artwork.coverImage && !paths.includes(artwork.coverImage)) paths.push(artwork.coverImage);
      await deleteImages(paths);
      // Remove Firestore document
      await deleteDoc(doc(db, 'artworks', artwork.id));
      fetchArtworks();
    } catch (err) { alert(err.message); }
  };

  // ── service handlers ──────────────────────────────────────────────────────
  const handleSrvFileChange = (e) => {
    if (e.target.files[0]) {
      setSrvFile(e.target.files[0]);
      setSrvPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCancelSrvFile = () => {
    setSrvFile(null);
    setSrvPreview(null);
    document.getElementById('srv-file').value = '';
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!srvFile) return alert('Select an image');
    setUploadingSrv(true);
    try {
      const { images } = await uploadImages([srvFile]);
      await addDoc(collection(db, 'services'), { ...srvForm, image: images[0].src, createdAt: new Date() });
      setSrvForm({ id: '01', title: '', description: '', price: '' });
      setSrvFile(null);
      setSrvPreview(null);
      document.getElementById('srv-file').value = '';
      fetchServices();
      alert('Service added!');
    } catch (err) { alert('Failed: ' + err.message); }
    setUploadingSrv(false);
  };

  const handleDeleteService = async (srv) => {
    if (!window.confirm('Delete service?')) return;
    try {
      await deleteImages([srv.image]);
      await deleteDoc(doc(db, 'services', srv.firebaseId));
      fetchServices();
    } catch (err) { alert(err.message); }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Gallery Admin</h1>
        <button onClick={handleLogout} style={{ padding: '0.6rem 1.2rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'artworks' ? 'active' : ''} onClick={() => setActiveTab('artworks')}>Manage Artworks</button>
        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Manage Services</button>
      </div>

      <div className="admin-layout">
        {/* ── ADD PANEL ── */}
        <div className="admin-form-panel">
          {activeTab === 'artworks' ? (
            <>
              <h2>Add New Artwork</h2>
              <form onSubmit={handleAddArtwork} className="admin-form">
                <input type="text" placeholder="Title" value={artForm.title} onChange={e => setArtForm({ ...artForm, title: e.target.value })} required />
                <select value={artForm.category} onChange={e => setArtForm({ ...artForm, category: e.target.value })} required>
                  <option>Graphite</option><option>Charcoal</option><option>Realistic</option><option>Hyper-Realistic</option><option>Acrylic</option>
                </select>
                <input type="text" placeholder="Medium" value={artForm.medium} onChange={e => setArtForm({ ...artForm, medium: e.target.value })} required />
                <input type="text" placeholder="Year" value={artForm.year} onChange={e => setArtForm({ ...artForm, year: e.target.value })} required />
                <textarea placeholder="Description" value={artForm.description} onChange={e => setArtForm({ ...artForm, description: e.target.value })} required />
                <input type="file" id="art-file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleArtFileChange} required={artFiles.length === 0} />
                {artPreviews.length > 0 && (
                  <div className="admin-preview-container" style={{ position: 'relative' }}>
                    <div className="admin-preview-row">
                      {artPreviews.map((src, i) => <img key={i} src={src} alt="preview" className="admin-preview-img" />)}
                    </div>
                    <button type="button" onClick={handleCancelArtFile} className="btn-cancel" style={{ marginTop: '10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel Selection</button>
                  </div>
                )}
                <button type="submit" disabled={uploadingArt}>{uploadingArt ? 'Uploading...' : 'Add Artwork'}</button>
              </form>
            </>
          ) : (
            <>
              <h2>Add New Service</h2>
              <form onSubmit={handleAddService} className="admin-form">
                <input type="text" placeholder="ID (e.g. 01)" value={srvForm.id} onChange={e => setSrvForm({ ...srvForm, id: e.target.value })} required />
                <input type="text" placeholder="Service Title" value={srvForm.title} onChange={e => setSrvForm({ ...srvForm, title: e.target.value })} required />
                <input type="text" placeholder="Price (e.g. Starting at ₹2,000)" value={srvForm.price} onChange={e => setSrvForm({ ...srvForm, price: e.target.value })} required />
                <textarea placeholder="Description" value={srvForm.description} onChange={e => setSrvForm({ ...srvForm, description: e.target.value })} required />
                <input type="file" id="srv-file" accept="image/jpeg,image/png,image/webp" onChange={handleSrvFileChange} required={!srvFile} />
                {srvPreview && (
                  <div className="admin-preview-container" style={{ position: 'relative' }}>
                    <img src={srvPreview} alt="preview" className="admin-preview-img" />
                    <button type="button" onClick={handleCancelSrvFile} className="btn-cancel" style={{ marginTop: '10px', display: 'block', backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel Selection</button>
                  </div>
                )}
                <button type="submit" disabled={uploadingSrv}>{uploadingSrv ? 'Uploading...' : 'Add Service'}</button>
              </form>
            </>
          )}
        </div>

        {/* ── LIST PANEL ── */}
        <div className="admin-list-panel">
          <h2>{activeTab === 'artworks' ? 'Existing Artworks' : 'Existing Services'}</h2>

          {activeTab === 'artworks' ? (
            loadingArtworks ? <p>Loading...</p> : (
              <div className="admin-grid">
                {artworks.map(art => (
                  <div key={art.id} className="admin-card">
                    <div className="admin-card-images">
                      {art.images?.length > 0
                        ? art.images.map((img, i) => <img key={i} src={img.src} alt={art.title} />)
                        : art.coverImage ? <img src={art.coverImage} alt={art.title} /> : null}
                    </div>
                    <div className="admin-card-info">
                      <strong>{art.title}</strong>
                      <span>{art.category}</span>
                      <button onClick={() => handleDeleteArtwork(art)} className="btn-delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            loadingServices ? <p>Loading...</p> : (
              <div className="admin-grid">
                {services.map(srv => (
                  <div key={srv.firebaseId} className="admin-card">
                    {srv.image && <img src={srv.image} alt={srv.title} style={{ height: '120px', objectFit: 'cover' }} />}
                    <div className="admin-card-info">
                      <strong>{srv.id} - {srv.title}</strong>
                      <span>{srv.price}</span>
                      <button onClick={() => handleDeleteService(srv)} className="btn-delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
