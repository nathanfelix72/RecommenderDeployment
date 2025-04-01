import { useState } from 'react';
import './App.css';

function App() {
  const [id, setId] = useState('');
  const [recommendations, setRecommendations] = useState({
    collaborative: [],
    content: [],
    azure: [],
  });

  const fetchRecommendations = async () => {
    if (!id) return;
    try {
      const res = await fetch('http://localhost:5000/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, itemId: id }),
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Recommendation System</h1>
      <input
        type="text"
        placeholder="Enter User ID or Item ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="input"
      />
      <button onClick={fetchRecommendations} className="button">
        Get Recommendations
      </button>
      <div className="recommendations">
        {Object.entries(recommendations).map(([key, values]) => (
          <div key={key} className="card">
            <h2 className="card-title">{key} Model</h2>
            <ul className="list">
              {values.map((item, index) => (
                <li key={index} className="list-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
