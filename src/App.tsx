import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/first-access" element={<FirstAccess />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/gift"
            element={
              <ProtectedRoute>
                <GiftUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/gift-received"
            element={
              <ProtectedRoute>
                <GiftReceived />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/extraction"
            element={
              <ProtectedRoute>
                <Extraction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
