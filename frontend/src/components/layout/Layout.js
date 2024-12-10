import React from 'react';
import Header from './Header';
import ChannelList from '../channels/ChannelList';
import { useLocation } from 'react-router-dom';
import '../../styles/layout.css';

function Layout({ children }) {
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;
  const showChannelList = !isMobile || !location.pathname.includes('/channels/');

  return (
    <div className="layout">
      <Header />
      <div className="main-container">
        {showChannelList && <ChannelList />}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;