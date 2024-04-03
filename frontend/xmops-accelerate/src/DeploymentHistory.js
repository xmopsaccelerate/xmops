import React, { useState, useEffect } from 'react';
import './DeploymentHistory.css';

const DeploymentHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/history')
      .then(response => response.json())
      .then(data => setHistory(data))
      .catch(error => console.error('Error fetching deployment history:', error));
  }, []);

  const handleDestroy = (deploymentId) => {
    // Send a request to destroy the deployment
    // Replace with your actual API endpoint and request method
    fetch(`http://localhost:3001/destroy/${deploymentId}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        // Remove the destroyed deployment from the history
        setHistory(history.filter(deployment => deployment.id !== deploymentId));
      })
      .catch(error => {
        console.error('Error destroying deployment:', error);
      });
  };

  return (
    <div>
      <h2 className="history-heading">Deployment History</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Status</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map(deployment => (
            <tr key={deployment.id}>
              <td>{deployment.type}</td>
              <td>{deployment.status}</td>
              <td>{deployment.timestamp}</td>
              <td>
                <button
                  className="destroy-button"
                  onClick={() => handleDestroy(deployment.id)}>
                  Destroy
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeploymentHistory;