import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProtectedAdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAuthorized(true);
        } else {
          // Log out immediately if they aren't an admin
          await auth.signOut();
          setErrorMsg('You are not authorized to access the admin panel.');
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Error verifying admin authorization:', err);
        setErrorMsg('Something went wrong checking authorization.');
        setIsAuthorized(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" state={{ error: errorMsg }} replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
