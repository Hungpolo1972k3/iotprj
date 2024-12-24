// LatestImage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LastestImage = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Gọi API để lấy ảnh mới nhất
    axios.get('http://localhost:5000/upload')
      .then(response => {
        setImageUrl(response.data.imageUrl);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch image');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <img src={imageUrl} alt="Latest Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
}

export default LastestImage;
