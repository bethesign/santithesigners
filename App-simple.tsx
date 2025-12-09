import React, { useState } from 'react';
import { Homepage } from './pages/Homepage';
import { LoginPage } from './pages/Auth/LoginPage';
import { SetupPage } from './pages/Auth/SetupPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const [currentPage, setCurrentPage] = useState('homepage');
  const [navigationData, setNavigationData] = useState<any>(null);

  const navigate = (page: string, data?: any) => {
    console.log(`Navigating to: ${page}`, data);
    setCurrentPage(page);
    if (data) {
      setNavigationData(data);
    }
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'homepage':
        return <Homepage onNavigate={navigate} />;

      case 'login':
        return <LoginPage onNavigate={navigate} />;

      case 'setup':
        if (!navigationData?.email || !navigationData?.userData) {
          // Redirect back to login if no data
          navigate('login');
          return null;
        }
        return (
          <SetupPage
            onNavigate={navigate}
            email={navigationData.email}
            userData={navigationData.userData}
          />
        );

      case 'dashboard':
      case 'admin':
        // Both dashboard and admin use the same DashboardPage
        // The page will show admin features if user.role === 'admin'
        return <DashboardPage onNavigate={navigate} />;

      default:
        return <Homepage onNavigate={navigate} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
