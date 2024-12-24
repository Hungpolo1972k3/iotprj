import React, { useState } from 'react';
import axios from 'axios';

const LastestImage = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLatestImage = () => {
    setLoading(true);
    setError('');

    axios.get('http://localhost:5000/latest-image')
      .then(response => {
        setImageUrl(response.data.imageUrl);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch image');
        setLoading(false);
      });
  };

  return (
    <div>
      <button onClick={fetchLatestImage} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Latest Image'}
      </button>

      {error && <p>{error}</p>}

      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Latest Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default LastestImage;
