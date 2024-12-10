import React, { useState } from 'react';
import '../../styles/channels.css';

function NewChannel({ onClose, onChannelCreated }) {
  const [channelName, setChannelName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: channelName })
      });

      if (response.ok) {
        const newChannel = await response.json();
        onChannelCreated(newChannel);
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create channel');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create New Channel</h3>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Channel name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            required
          />
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create Channel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewChannel;