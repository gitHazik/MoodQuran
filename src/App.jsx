import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MoodChat from './pages/MoodChat';
import PathLearner from './pages/PathLearner';
import SavedVerses from './pages/SavedVerses';
import Onboarding from './pages/Onboarding';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('userName')) setHasProfile(true);
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <Router>
      <div className="h-screen w-screen bg-parchment text-walnut font-sans flex justify-center">
        <div className="w-full max-w-md h-full bg-parchment relative overflow-hidden flex flex-col">
          <Routes>
            <Route path="/welcome" element={!hasProfile ? <Onboarding /> : <Navigate to="/" />} />
            <Route path="/" element={hasProfile ? <Dashboard /> : <Navigate to="/welcome" />} />
            <Route path="/mood" element={hasProfile ? <MoodChat /> : <Navigate to="/welcome" />} />
            <Route path="/paths" element={hasProfile ? <PathLearner /> : <Navigate to="/welcome" />} />
            <Route path="/saved" element={hasProfile ? <SavedVerses /> : <Navigate to="/welcome" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;