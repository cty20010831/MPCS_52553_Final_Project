import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authFetch } from '../../utils/api';
import MessageInput from '../messages/MessageInput';
import MessageList from '../messages/MessageList';
import '../../styles/channels.css';

function ChannelView() {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  // Fetch channel details
  useEffect(() => {
    if (!channelId) return;

    const fetchChannel = async () => {
      try {
        const response = await authFetch(`http://127.0.0.1:5000/api/channels/${channelId}`);
        if (response.ok) {
          const data = await response.json();
          setChannel(data);
        }
      } catch (error) {
        console.error('Error fetching channel:', error);
        setError('Failed to load channel');
      }
    };

    fetchChannel();
  }, [channelId]);

  // Mark channel as read when entering and periodically
  useEffect(() => {
    if (!channelId) return;

    const markChannelRead = async () => {
      try {
        await authFetch(`http://127.0.0.1:5000/api/channels/${channelId}/read`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error marking channel as read:', error);
      }
    };

    // Mark as read immediately when entering channel
    markChannelRead();

    // Set up interval to mark as read periodically
    const readInterval = setInterval(markChannelRead, 5000);

    // Cleanup interval on unmount or channel change
    return () => clearInterval(readInterval);
  }, [channelId]);

  // Add this useEffect for fetching messages
  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for channel:', channelId); // Debug log
        const response = await authFetch(`http://127.0.0.1:5000/api/channels/${channelId}/messages`);
        console.log('Messages response status:', response.status); // Debug log
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received messages:', data); // Debug log
          setMessages(data);
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          setError('Failed to load messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      }
    };

    fetchMessages();
    const messagesPollInterval = setInterval(fetchMessages, 1000);
    return () => clearInterval(messagesPollInterval);
}, [channelId]);

  const handleSendMessage = async (text) => {
    if (!channelId) return;

    try {
      const response = await authFetch(`http://127.0.0.1:5000/api/channels/${channelId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        return true;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      throw error;
    }
  };

  if (!channelId) {
    return <div className="select-channel-message">Please select a channel</div>;
  }

  return (
    <div className="channel-view">
      <div className="channel-header">
        <h2>{channel ? `#${channel.name}` : 'Loading...'}</h2>
        {error && <div className="error-message">{error}</div>}
      </div>

      <MessageList messages={messages} channelId={channelId} />
      <MessageInput channelId={channelId} onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChannelView;