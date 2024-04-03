import React, { useState } from 'react';
import './DeploymentPage.css';
import DeploymentHistory from './DeploymentHistory'; // Ensure this file exists
import Modal from './Modal';
import { signOut } from 'aws-amplify/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGithub, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';


const DeploymentPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [deploymentType, setDeploymentType] = useState('');
  const [activeTab, setActiveTab] = useState('deploymentOptions');

  const deploymentOptions = [
    { id: 1, name: 'Deploy Monolith', description: '', sampleContent: 'The Monolith deployment takes up to 10 minutes.\n \nNote: In some cases it may take additional 5-7 minutes for 2/2 Pass Check, so if your IP address shows an error, wait for additional 5 minutes.', actionLink: 'monolith' },
    { id: 2, name: 'Deploy Highly Available', description: '', sampleContent: 'The Highly-Available deployment takes up to 20 minutes.\n \nNote: In some cases if your IP address shows an error, wait for additional 5 minutes.', actionLink: 'highlyavailable' },
    { id: 3, name: 'Deploy LightSail', description: '', sampleContent: 'The Lightsail deployment takes up to 10 minutes. \n \nNote: In some cases if your IP address shows an error, wait for additional 5 minutes.', actionLink: 'lightsail' },
  ];

  const handleDeploymentClick = (option) => {
    setModalContent(option.sampleContent);
    setModalTitle(option.name);
    setDeploymentType(option.actionLink);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCustomAction = async () => {
    try {
      const response = await fetch('http://localhost:3001/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deploymentType }),
      });

      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      const wordpressUrl = data.details && data.details.WordPress_URL ? data.details.WordPress_URL.value : null;
      const message = wordpressUrl ? `Deployment initiated successfully: ${wordpressUrl}` : data.message || "Deployment process initiated. Check server logs for details.";
      alert(message);
    } catch (error) {
      console.error('Deployment error:', error);
      alert('Error initiating deployment. Please check the console for details.');
    } finally {
      setModalOpen(false);
    }
  };

  const SettingsContent = () => (
    <div className="about">
      <h4>XMOPS Accelerate</h4>
      <p><strong>Designed and Developed by</strong></p>
      <p>
        Dollar Karan Preet Singh<br/>
        Musrat Jahan Rimu<br/>
        Ramandeep Singh Turna<br/>
        Amandeep Singh
      </p>
      <p><strong>Version:</strong> 1.21</p>
      <p className="help">Documentation: <a href="https://developer.xmopsaccelerate.com" target="_blank" rel="noopener noreferrer">XMOPS Accelerate Documentation</a></p>
      <p className="help">Official Website: <a href="https://www.xmopsaccelerate.com" target="_blank" rel="noopener noreferrer">XMOPS Accelerate</a></p>
      <div className="social-icons">
        <a href="https://www.twitter.com/xmopsaccelerate" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faXTwitter} />
        </a>
        <a href="https://www.github.com/xmopsaccelerate" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a href="https://www.instagram.com/xmopsaccelerate" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} />
        </a>
      </div>
    </div>
  );
  
  

  const TabButton = ({ tabKey, children }) => (
    <button className={`tab-button ${activeTab === tabKey ? 'active' : ''}`} onClick={() => setActiveTab(tabKey)}>
      {children}
    </button>
  );

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
                <img src={`${process.env.PUBLIC_URL}/XMOPS Accelerate.svg`} alt="XMOPS Accelerate" width="160" />
              </header>
              <div className="tab-container">
                <TabButton tabKey="deploymentOptions">Deployment Options</TabButton>
                <TabButton tabKey="deploymentHistory">Deployment History</TabButton>
                <TabButton tabKey="settings">About</TabButton>
              </div>
            </div>
            {activeTab === 'deploymentOptions' && (
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
            )}
            {activeTab === 'deploymentHistory' && <DeploymentHistory />}
            {activeTab === 'settings' && <SettingsContent />}
          </div>
          <footer className="login-footer">
            <hr />
            
            <button className="logout-button" onClick={signOut}>Sign Out</button>
           
          </footer>
        </div>
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={modalTitle}
          onClose={handleCloseModal}
          content={<div className="sample-content"><p>{modalContent}</p></div>}
          onCustomAction={handleCustomAction}
        />
      )}
    </div>
  );
};

export default DeploymentPage;
