const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;
const HISTORY_FILE = path.join(__dirname, 'deployment_history.json');

app.use(cors());
app.use(bodyParser.json());

const readHistory = () => {
  if (!fs.existsSync(HISTORY_FILE)) {
    console.log('History file does not exist, creating a new one.');
    fs.writeFileSync(HISTORY_FILE, '[]');
  }
  const data = fs.readFileSync(HISTORY_FILE, 'utf8');
  return JSON.parse(data);
};

const writeHistory = (history) => {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  console.log('Deployment history updated.');
};



app.post('/deploy', (req, res) => {
    const { deploymentType } = req.body;
    console.log(`Received request to deploy: ${deploymentType}`);
  
    let terraformConfigPath = path.join(__dirname, '..', 'terraform', deploymentType);
  
    // Execute the deployment script
    exec(`sh ${path.join(terraformConfigPath, 'deploy.sh')}`, { cwd: terraformConfigPath }, (deployError, deployStdout, deployStderr) => {
      console.log('Executing deployment script...');
      if (deployError) {
        console.error(`Deploy script error: ${deployError.message}`);
        return res.status(500).json({ message: 'Deployment script failed', error: deployStderr.trim() });
      }
  
      // Fetch Terraform outputs after successful deployment
      exec(`terraform output -json`, { cwd: terraformConfigPath }, (outputError, outputStdout, outputStderr) => {
        if (outputError) {
          console.error(`Terraform output error: ${outputError.message}`);
          return res.status(500).json({ message: 'Failed to fetch Terraform outputs', error: outputStderr.trim() });
        }
  
        // Parse and handle Terraform outputs
        try {
          const outputs = JSON.parse(outputStdout);
          console.log(`Deployment outputs for ${deploymentType}:`, outputs);
          
          // Record the successful deployment in the history
          const deploymentHistory = readHistory();
          const newHistoryEntry = {
            id: Date.now(),
            type: deploymentType,
            status: 'Success',
            timestamp: new Date().toISOString(),
            details: outputs
          };
          deploymentHistory.push(newHistoryEntry);
          writeHistory(deploymentHistory);
  
          // Respond to the client with success message and details
          res.status(200).json({ message: 'Deployment initiated successfully', details: outputs });
        } catch (parseError) {
          console.error(`Error parsing Terraform outputs: ${parseError}`);
          res.status(500).json({ message: 'Failed to parse deployment output', error: parseError.toString() });
        }
      });
    });
  });

app.get('/history', (req, res) => {
  console.log('Fetching deployment history...');
  const history = readHistory();
  res.json(history);
});

app.delete('/destroy/:deploymentId', (req, res) => {
  const { deploymentId } = req.params;
  console.log(`Received request to destroy deployment: ${deploymentId}`);

  const deploymentHistory = readHistory();
  const deploymentIndex = deploymentHistory.findIndex(d => d.id === parseInt(deploymentId, 10));

  if (deploymentIndex === -1) {
    console.log('Deployment not found in history.');
    return res.status(404).json({ message: 'Deployment not found' });
  }

  const deployment = deploymentHistory[deploymentIndex];
  const terraformConfigPath = path.join(__dirname, '..', 'terraform', deployment.type);

  console.log(`Executing destroy script for ${deployment.type}...`);
  exec(`sh ${path.join(terraformConfigPath, 'destroy.sh')}`, { cwd: terraformConfigPath }, (destroyError, destroyStdout, destroyStderr) => {
    if (destroyError) {
      console.error(`Destroy script error: ${destroyError.message}`);
      return res.status(500).json({ message: 'Destroy script failed', error: destroyStderr });
    }

    console.log(`Deployment ${deploymentId} destroyed successfully.`);
    deploymentHistory.splice(deploymentIndex, 1);
    writeHistory(deploymentHistory);
    res.status(200).json({ message: 'Deployment destroyed successfully' });
  });
});



app.get('/', (req, res) => {
  console.log('Root path accessed.');
  res.send('Server is up and running. Use POST /deploy to initiate deployments.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
