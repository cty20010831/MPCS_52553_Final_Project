import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import ChannelList from '../channels/ChannelList';

function Layout({ children, setIsAuthenticated }) {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [showThread, setShowThread] = useState(false);
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle route changes
  useEffect(() => {
    if (window.innerWidth <= 768) {
      const isThreadRoute = location.pathname.includes('/thread/');
      setShowThread(isThreadRoute);
      setShowSidebar(!isThreadRoute && !location.pathname.includes('/channels/'));
    }
  }, [location]);

  return (
    <div className="app-container">
      <Header setIsAuthenticated={setIsAuthenticated}>
        {window.innerWidth <= 768 && (
          <button 
            className="mobile-nav-button"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? '✕' : '☰'}
          </button>
        )}
      </Header>
      <div className="main-content">
        <div className={`sidebar ${showSidebar ? 'show' : ''}`}>
          <ChannelList />
          {window.innerWidth <= 768 && (
            <button 
              className="mobile-nav-button"
              onClick={() => setShowSidebar(false)}
            >
              Close
            </button>
          )}
        </div>
        <main className="channel-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;