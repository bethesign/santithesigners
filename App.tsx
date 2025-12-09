import React, { useState } from 'react';
import { Homepage } from './pages/Homepage';
import { Login } from './pages/Login';
import { FirstAccess } from './pages/FirstAccess';
import { Dashboard } from './pages/Dashboard';
import { GiftUpload } from './pages/GiftUpload';
import { Quiz } from './pages/Quiz';
import { Extraction } from './pages/Extraction';
import { GiftReceived } from './pages/GiftReceived';
import { Feedback } from './pages/Feedback';
import { Admin } from './pages/Admin';

// Simple Router for Demo
function App() {
  const [currentPage, setCurrentPage] = useState('homepage');

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {currentPage === 'homepage' && <Homepage onNavigate={navigate} />}
      {currentPage === 'login' && <Login onNavigate={navigate} />}
      {currentPage === 'first-access' && <FirstAccess onNavigate={navigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {currentPage === 'gift-upload' && <GiftUpload onNavigate={navigate} />}
      {currentPage === 'quiz' && <Quiz onNavigate={navigate} />}
      {currentPage === 'extraction' && <Extraction onNavigate={navigate} />}
      {currentPage === 'gift-received' && <GiftReceived onNavigate={navigate} />}
      {currentPage === 'feedback' && <Feedback onNavigate={navigate} />}
      {currentPage === 'admin' && <Admin onNavigate={navigate} />}

      {/* Fallback for others */}
      {/* None needed now */}
    </>
  );
}

export default App;
