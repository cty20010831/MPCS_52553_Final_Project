import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/api';
import NewChannel from './NewChannel';
import '../../styles/channels.css';
import { toast } from 'react-toastify';

function ChannelList() {
  const [channels, setChannels] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [error, setError] = useState(null);
  const { channelId } = useParams();
  const [editingChannel, setEditingChannel] = useState(null);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const fetchChannels = async () => {
    try {
      const response = await authFetch('http://127.0.0.1:5000/api/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('Failed to load channels');
    }
  };

  // Fetch channels on component mount
  useEffect(() => {
    fetchChannels();
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

  const handleEditClick = (channel) => {
    setEditingChannel(channel);
    setNewName(channel.name);
  };

  const handleUpdateChannel = async (channelId) => {
    try {
      const response = await authFetch(`http://127.0.0.1:5000/api/channels/${channelId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        toast.success('Channel updated successfully');
        setEditingChannel(null);
        // Force refresh of channels
        fetchChannels();
        // Emit an event to notify channel name change
        window.dispatchEvent(new CustomEvent('channelNameUpdated', {
          detail: { channelId, newName }
        }));
      }
    } catch (error) {
      toast.error('Failed to update channel');
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm('Are you sure you want to delete this channel?')) return;

    try {
      const response = await authFetch(`http://127.0.0.1:5000/api/channels/${channelId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Channel deleted successfully');
        // Navigate to home if we're in the deleted channel
        navigate('/');
        // Refresh channels list
        fetchChannels();
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('channelDeleted', {
          detail: { channelId }
        }));
      }
    } catch (error) {
      toast.error('Failed to delete channel');
    }
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
            {editingChannel?.id === channel.id ? (
              <div className="channel-edit-form">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateChannel(channel.id)}
                />
                <button onClick={() => handleUpdateChannel(channel.id)}>✓</button>
                <button onClick={() => setEditingChannel(null)}>✕</button>
              </div>
            ) : (
              <Link to={`/channels/${channel.id}`} className="channel-link">
                <span className="channel-name">#{channel.name}</span>
                <div className="channel-actions">
                  <button 
                    className="channel-action-btn edit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditClick(channel);
                    }}
                    title="Edit channel"
                  >
                    ✎
                  </button>
                  <button 
                    className="channel-action-btn delete"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteChannel(channel.id);
                    }}
                    title="Delete channel"
                  >
                    🗑️
                  </button>
                </div>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelList;