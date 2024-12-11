import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/api';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import '../../styles/messages.css';

function ReplyThread() {
  const { channelId, messageId } = useParams();
  const [parentMessage, setParentMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!channelId || !messageId) return;

    const fetchParentMessage = async () => {
      try {
        const response = await authFetch(
          `http://127.0.0.1:5000/api/channels/${channelId}/messages/${messageId}`
        );
        if (response.ok) {
          const data = await response.json();
          setParentMessage(data);
        }
      } catch (error) {
        console.error('Error fetching parent message:', error);
        setError('Failed to load parent message');
      }
    };

    const fetchReplies = async () => {
      try {
        const response = await authFetch(
          `http://127.0.0.1:5000/api/messages/${messageId}/replies`
        );
        if (response.ok) {
          const data = await response.json();
          setReplies(data);
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
        setError('Failed to load replies');
      }
    };

    fetchParentMessage();
    fetchReplies();
    const pollInterval = setInterval(fetchReplies, 500);
    return () => clearInterval(pollInterval);
  }, [channelId, messageId]);

  if (!channelId || !messageId) {
    return <div>Invalid thread</div>;
  }

  return (
    <div className="reply-thread">
      <div className="thread-header">
        <button 
          className="close-thread"
          onClick={() => navigate(`/channels/${channelId}`)}
        >
          ✕
        </button>
        <h3>Thread</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      {parentMessage && (
        <div className="parent-message">
          <MessageItem 
            message={parentMessage} 
            channelId={channelId}
          />
        </div>
      )}

      <div className="replies-list">
        {replies.map(reply => (
          <MessageItem 
            key={reply.id} 
            message={reply}
            channelId={channelId}
            isReply={true}
          />
        ))}
      </div>

      <MessageInput channelId={channelId} replyTo={messageId} />
    </div>
  );
}

export default ReplyThread;