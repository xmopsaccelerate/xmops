const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/deploy', (req, res) => {
    const { deploymentType } = req.body;

    let terraformConfigPath = '';
    switch (deploymentType) {
        case 'monolith':
            terraformConfigPath = path.join(__dirname, '..', 'terraform', 'monolith');
            break;
        case 'highlyavailable':
            terraformConfigPath = path.join(__dirname, '..', 'terraform', 'highlyavailable');
            break;
        case 'lightsail':
            terraformConfigPath = path.join(__dirname, '..', 'terraform', 'lightsail');
            break;
        default:
            return res.status(400).json({ message: 'Invalid deployment type' });
    }

    // Using "terraform output -json" only after ensuring "deploy.sh" has completed
    exec(`sh ${path.join(terraformConfigPath, 'deploy.sh')}`, { cwd: terraformConfigPath }, (deployError, deployStdout, deployStderr) => {
        if (deployError) {
            console.error(`Deploy script error: ${deployError}`);
            return res.status(500).json({ message: 'Deployment script failed', error: deployStderr });
        }

        // Now, fetching Terraform outputs as JSON
        exec(`terraform output -json`, { cwd: terraformConfigPath }, (outputError, outputStdout, outputStderr) => {
            if (outputError) {
                console.error(`Terraform output error: ${outputError}`);
                return res.status(500).json({ message: 'Failed to fetch Terraform outputs', error: outputStderr });
            }

            try {
                const outputs = JSON.parse(outputStdout);
                // Assuming your output variable is named "WordPress_URL" and contains just the IP or DNS name
                const wordpressUrl = `http://${outputs.WordPress_URL.value}/wp-admin/install.php`;
                console.log(`WordPress URL: ${wordpressUrl}`);
                res.status(200).json({ message: 'Deployment initiated successfully', ip: wordpressUrl });
            } catch (parseError) {
                console.error(`Error parsing Terraform outputs: ${parseError}`);
                res.status(500).json({ message: 'Failed to parse deployment output', error: parseError.toString() });
            }
        });
    });
});

app.get('/', (req, res) => {
    res.send('Server is up and running. Use POST /deploy to initiate deployments.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
