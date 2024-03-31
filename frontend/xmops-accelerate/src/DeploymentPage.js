import React, { useState } from 'react';
import './DeploymentPage.css';
import Modal from './Modal';

const DeploymentPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [deploymentType, setDeploymentType] = useState('');

  const deploymentOptions = [
    { id: 1, name: 'Deploy Monolith', description: '', sampleContent: 'Deploy a Monolith architecture.', actionLink: 'monolith' },
    { id: 2, name: 'Deploy Highly Available', description: '', sampleContent: 'Deploy a Highly Available architecture.', actionLink: 'highlyavailable' },
    { id: 3, name: 'Deploy LightSail', description: '', sampleContent: 'Deploy an AWS LightSail instance.', actionLink: 'lightsail' },
  ];

  const handleDeploymentClick = (option) => {
    setModalContent(option.sampleContent);
    setModalTitle(option.name);
    setDeploymentType(option.actionLink); // Correctly setting deploymentType for the backend endpoint
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCustomAction = () => {
    fetch('http://localhost:3001/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deploymentType }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok.');
      return response.json();
    })
    .then(data => {
      // Interpret the response based on your backend logic
      const message = data.message ? `${data.message}: ${data.ip ? data.ip : "Check server logs for details."}` : "Deployment process initiated. Check server logs for details.";
      alert(message);
      setModalOpen(false); // Close the modal after showing the deployment result
    })
    .catch(error => {
      console.error('Deployment error:', error);
      alert('Error initiating deployment. Please check the console for details.');
    });
  };

  return (
    <div className="app">
      <div className="page-background">
        <div className="blob top-right"></div>
        <div className="blob bottom-left"></div>
      </div>
      
      <div className={`app-container ${isModalOpen ? 'content-blur' : ''}`}>
        <div className="main-content">
          <div className="login-card">
            <div className="login-card-header">
              <header className="login-card__header">
                <img src={`${process.env.PUBLIC_URL}/XMOPS Accelerate.svg`} alt="XMOPS-Accelerate" width="160" />
              </header>
            </div>
            <div className="login-card__content">
              <div className="main-card-section">
                <h2 className="deployment-heading">Select a Deployment Option</h2>
                <div className="deployment-buttons">
                  {deploymentOptions.map((option) => (
                    <button key={option.id} className="deployment-button" onClick={() => handleDeploymentClick(option)}>
                      <strong>{option.name}</strong><br />
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <footer className="login-footer">
            <hr />
            <p className="footer-option">© TechnologyApplicationProject Team 7: The Legends 2024</p>
            <p>v0.8.12</p>
          </footer>
        </div>
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={modalTitle}
          onClose={handleCloseModal}
          content={<p>{modalContent}</p>}
          onCustomAction={handleCustomAction}
        />
      )}
    </div>
  );
};

export default DeploymentPage;
