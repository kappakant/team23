import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import GymProfile from './pages/GymProfile';
import LogWorkout from './pages/LogWorkout';
import NavBar from './components/NavBar';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'DM Sans, sans-serif',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && <NavBar />}
      <Routes>
        {/* Login route */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        
        {/* Main nav routes */}
        <Route 
          path="/" 
          element={user ? <Home /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/log" 
          element={user ? <LogWorkout /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/gym" 
          element={user ? <GymProfile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/login" />} 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;