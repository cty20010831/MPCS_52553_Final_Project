import React from 'react';
import Header from './Header';
import ChannelList from '../channels/ChannelList';

function Layout({ children, setIsAuthenticated }) {
  return (
    <div className="app-container">
      <Header setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        <ChannelList />
        <main className="channel-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;