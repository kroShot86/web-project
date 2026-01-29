import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Fullstack Web Application</h1>
      <p>Frontend: React SPA</p>
      <p>Backend: Express REST API</p>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h3>API Response:</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default App;