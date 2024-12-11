import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authFetch } from '../../utils/api';
import NewChannel from './NewChannel';
import '../../styles/channels.css';

function ChannelList() {
  const [channels, setChannels] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [error, setError] = useState(null);
  const { channelId } = useParams();

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await authFetch('http://127.0.0.1:5000/api/channels');
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        setError('Failed to load channels');
      }
    };

    fetchChannels();
    const channelsPollInterval = setInterval(fetchChannels, 500);
    return () => clearInterval(channelsPollInterval);
  }, []);

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await authFetch('http://127.0.0.1:5000/api/channels/unread');
        if (response.ok) {
          const data = await response.json();
          const counts = {};
          data.forEach(item => {
            counts[item.channel_id] = item.unread_count;
          });
          setUnreadCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    fetchUnreadCounts();
    const unreadPollInterval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(unreadPollInterval);
  }, [channelId]); // Update when channel changes

  const handleNewChannel = (newChannel) => {
    setChannels(prev => [...prev, newChannel]);
  };

  return (
    <div className="channel-list">
      <div className="channels-header">
        <h2>Channels</h2>
        <NewChannel onChannelCreated={handleNewChannel} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <ul>
        {channels.map(channel => (
          <li key={channel.id} className={channel.id === parseInt(channelId) ? 'active' : ''}>
            <Link to={`/channels/${channel.id}`}>
              # {channel.name}
              {unreadCounts[channel.id] > 0 && (
                <span className="unread-badge">{unreadCounts[channel.id]}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelList;