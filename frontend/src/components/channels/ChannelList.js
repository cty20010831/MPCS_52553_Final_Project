import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import NewChannel from './NewChannel';
import '../../styles/channels.css';

function ChannelList() {
  const [channels, setChannels] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { channelId } = useParams();
  const [showNewChannel, setShowNewChannel] = useState(false);

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };
    fetchChannels();
  }, []);

  // Poll for unread counts
  useEffect(() => {
    const pollUnread = setInterval(async () => {
      try {
        const response = await fetch('/api/channels/unread', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCounts(data);
        }
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    }, 1000);

    return () => clearInterval(pollUnread);
  }, []);

  return (
    <div className="channel-list">
      <div className="channel-header">
        <h2>Channels</h2>
        <button 
          className="new-channel-button"
          onClick={() => setShowNewChannel(true)}
        >
          +
        </button>
      </div>

      {channels.map(channel => (
        <Link
          key={channel.id}
          to={`/channels/${channel.id}`}
          className={`channel-item ${channel.id === parseInt(channelId) ? 'active' : ''}`}
        >
          <span className="channel-name"># {channel.name}</span>
          {unreadCounts[channel.id] > 0 && (
            <span className="unread-badge">{unreadCounts[channel.id]}</span>
          )}
        </Link>
      ))}

      {showNewChannel && (
        <NewChannel 
          onClose={() => setShowNewChannel(false)}
          onChannelCreated={(newChannel) => {
            setChannels([...channels, newChannel]);
            setShowNewChannel(false);
          }}
        />
      )}
    </div>
  );
}

export default ChannelList;