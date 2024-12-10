import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageList from '../messages/MessageList';
import MessageInput from '../messages/MessageInput';
import '../../styles/channels.css';

function ChannelView() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  // Mark channel as read when entering
  useEffect(() => {
    fetch(`/api/channels/${channelId}/read`, {
      method: 'POST',
      credentials: 'include'
    });
  }, [channelId]);

  return (
    <div className="channel-view">
      <div className="channel-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Channels
        </button>
      </div>
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  );
}

export default ChannelView;