import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MoodChat from './pages/MoodChat';
import PathLearner from './pages/PathLearner';
import SavedVerses from './pages/SavedVerses';
import Onboarding from './pages/Onboarding'; // Import new page

function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Check local storage for user profile
    const userName = localStorage.getItem('userName');
    const theme = localStorage.getItem('theme');

    // Apply Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (userName) setHasProfile(true);
    setIsReady(true);
  }, []);

  if (!isReady) return null; // Wait for storage check

  return (
    <Router>
      <div className="h-screen w-screen bg-parchment text-walnut font-sans overflow-hidden flex justify-center sm:bg-walnut/5">
        <div className="w-full max-w-md h-full bg-parchment relative shadow-2xl overflow-hidden flex flex-col">
          <Routes>
            {/* If they have a profile, go to Dashboard. If not, force them to Onboarding */}
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