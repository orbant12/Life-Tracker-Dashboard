# Guide to Hosting a REST API and React App on Raspberry Pi (Local Network Only)

This guide will walk you through the process of configuring your Raspberry Pi to host both a REST API and React application, making them accessible only to devices on your local network.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setting Up Your Raspberry Pi](#setting-up-your-raspberry-pi)
3. [Hosting Your REST API](#hosting-your-rest-api)
4. [Hosting Your React Application](#hosting-your-react-application)
5. [Network Configuration for Local Access Only](#network-configuration-for-local-access-only)
6. [Testing Your Setup](#testing-your-setup)
7. [Automatic Startup Configuration](#automatic-startup-configuration)
8. [Remote Deployment Setup](#remote-deployment-setup)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Raspberry Pi (Raspberry Pi 4 recommended for better performance)
- Micro SD card with Raspberry OS installed
- Power supply for your Raspberry Pi
- Access to your local network
- Basic knowledge of terminal commands
- Your REST API code
- Your React application code

## Setting Up Your Raspberry Pi

1. **Install Raspberry Pi OS**:
   - Download and install Raspberry Pi Imager from [raspberrypi.org](https://www.raspberrypi.org/software/)
   - Insert your micro SD card into your computer
   - Use the imager to write Raspberry Pi OS (formerly Raspbian) to the SD card
   - Consider using the 64-bit version for better performance with Node.js

2. **Initial Configuration**:
   - Insert the SD card into your Raspberry Pi and power it on
   - Complete the initial setup (set password, language, WiFi, etc.)
   - Update your system:
     ```bash
     sudo apt update
     sudo apt upgrade -y
     ```

3. **Install Required Dependencies**:
   ```bash
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Verify installation
   node -v
   npm -v
   
   # Install other useful tools
   sudo apt install -y git nginx
   ```

## Hosting Your REST API

### Option 1: Using Node.js/Express (Common Setup)

1. **Transfer Your API Code**:
   - Clone your repository or transfer your files to the Raspberry Pi
   - Example using Git:
     ```bash
     git clone https://github.com/yourusername/your-api-repo.git
     cd your-api-repo
     ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Your API Server**:
   - Modify your API code to bind to the correct interface
   - Edit your main file (e.g., `app.js`, `server.js`, `index.js`):
   
   ```javascript
   // Make sure your server listens on all interfaces or specifically the LAN interface
   // Instead of:
   // app.listen(3000, () => {...});
   
   // Use:
   app.listen(3000, '0.0.0.0', () => {
     console.log('API server running on port 3000');
   });
   ```

4. **Install PM2 for Process Management**:
   ```bash
   sudo npm install -g pm2
   ```

5. **Start Your API Server with PM2**:
   ```bash
   pm2 start app.js --name "my-api"
   pm2 save
   pm2 startup
   ```

### Option 2: Using Python/Flask/Django

If your API is built with Python, you would instead:

1. **Install Python and Dependencies**:
   ```bash
   sudo apt install -y python3 python3-pip
   pip3 install flask gunicorn # or django
   ```

2. **Configure Your API Server**:
   - For Flask, ensure you use:
     ```python
     if __name__ == "__main__":
         app.run(host='0.0.0.0', port=5000)
     ```

3. **Run with Gunicorn**:
   ```bash
   gunicorn -b 0.0.0.0:5000 app:app
   ```

## Hosting Your React Application

1. **Transfer Your React App**:
   - Clone or transfer your React app to the Raspberry Pi
   - Example:
     ```bash
     git clone https://github.com/yourusername/your-react-app.git
     cd your-react-app
     ```

2. **Build Your React App**:
   ```bash
   npm install
   npm run build
   ```

3. **Configure Nginx to Serve Your React App**:
   ```bash
   sudo nano /etc/nginx/sites-available/react-app
   ```

4. **Add the Following Configuration**:
   ```nginx
   server {
       listen 80;
       server_name localhost;
       
       root /home/pi/your-react-app/build;  # Path to your React build folder
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests to your API server
       location /api/ {
           proxy_pass http://localhost:3000/;  # Your API server address
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable the Nginx Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default site
   sudo nginx -t  # Test config
   sudo systemctl restart nginx
   ```

## Network Configuration for Local Access Only

1. **Configure Firewall Rules**:
   ```bash
   # Install UFW (Uncomplicated Firewall)
   sudo apt install -y ufw
   
   # Configure UFW
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   
   # Allow SSH (for your access)
   sudo ufw allow from 192.168.1.0/24 to any port 22
   
   # Allow HTTP (for your web app)
   sudo ufw allow from 192.168.1.0/24 to any port 80
   
   # Allow your API port if accessed directly
   sudo ufw allow from 192.168.1.0/24 to any port 3000
   
   # Enable UFW
   sudo ufw enable
   ```

   Note: Replace `192.168.1.0/24` with your actual local network range.

2. **Set Static IP for Your Raspberry Pi**:
   ```bash
   sudo nano /etc/dhcpcd.conf
   ```

   Add these lines (adapt to your network):
   ```
   interface eth0  # or wlan0 for WiFi
   static ip_address=192.168.1.100/24
   static routers=192.168.1.1
   static domain_name_servers=192.168.1.1 8.8.8.8
   ```

## Testing Your Setup

1. **Find Your Raspberry Pi's IP Address**:
   ```bash
   hostname -I
   ```

2. **Test from Another Device on Your Network**:
   - Open a browser and navigate to `http://[raspberry-pi-ip]`
   - Your React app should load
   - API calls from your React app should work if configured correctly

## Automatic Startup Configuration

Ensure all services start automatically when your Raspberry Pi boots up:

1. **PM2 (for Node.js API)**:
   ```bash
   pm2 startup
   pm2 save
   ```

2. **Systemd (for Python API, if applicable)**:
   ```bash
   sudo nano /etc/systemd/system/flask-api.service
   ```
   
   Add:
   ```
   [Unit]
   Description=Flask API Service
   After=network.target
   
   [Service]
   User=pi
   WorkingDirectory=/home/pi/your-api-folder
   ExecStart=/usr/local/bin/gunicorn -b 0.0.0.0:5000 app:app
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Enable the service:
   ```bash
   sudo systemctl enable flask-api
   sudo systemctl start flask-api
   ```

3. **Nginx**:
   ```bash
   sudo systemctl enable nginx
   ```

## Troubleshooting

1. **Check Service Status**:
   ```bash
   # For Node.js API with PM2
   pm2 status
   pm2 logs
   
   # For Python API with systemd
   sudo systemctl status flask-api
   sudo journalctl -u flask-api
   
   # For Nginx
   sudo systemctl status nginx
   sudo journalctl -u nginx
   ```

2. **Check Firewall Status**:
   ```bash
   sudo ufw status
   ```

3. **Check Nginx Error Logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **CORS Issues**:
   - If your React app has CORS issues when calling your API, ensure your API has the appropriate CORS headers enabled:
   
   For Express.js:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: 'http://192.168.1.100'  // Your Raspberry Pi's IP or hostname
   }));
   ```
   
   For Flask:
   ```python
   from flask_cors import CORS
   CORS(app, resources={r"/*": {"origins": "http://192.168.1.100"}})
   ```

5. **Permission Issues**:
   ```bash
   # If encountering permission issues
   sudo chown -R pi:pi /home/pi/your-app-directory
   sudo chmod -R 755 /home/pi/your-app-directory
   ```

## Remote Deployment Setup

Setting up remote deployment allows you to update your API and React app without having to SSH into your Raspberry Pi. Here are several options:

### Option 1: GitHub Actions with SSH Deployment

This approach uses GitHub Actions to automatically deploy when you push changes to your repository.

1. **Generate SSH Key Pair on Your Development Machine**:
   ```bash
   ssh-keygen -t ed25519 -C "deployment-key"
   ```

2. **Add the Public Key to Your Raspberry Pi**:
   ```bash
   # On your Raspberry Pi
   mkdir -p ~/.ssh
   nano ~/.ssh/authorized_keys
   # Paste your public key (content of deployment-key.pub)
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Add the Private Key as a GitHub Secret**:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Create a new repository secret called `SSH_PRIVATE_KEY`
   - Paste the content of your private key file (the file without .pub extension)
   - Add additional secrets:
     - `SSH_HOST`: Your Raspberry Pi's IP address
     - `SSH_USERNAME`: Usually 'pi'
     - `SSH_PORT`: Usually '22'

4. **Create GitHub Actions Workflow File**:
   - Create a file at `.github/workflows/deploy.yml` in your repository:

   ```yaml
   name: Deploy to Raspberry Pi

   on:
     push:
       branches: [ main ]  # or any branch you want to trigger deployment

   jobs:
     deploy-api:
       runs-on: ubuntu-latest
       if: contains(github.event.head_commit.message, '[api]')  # Optional: only deploy if commit message has [api]
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up SSH
           uses: webfactory/ssh-agent@v0.7.0
           with:
             ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
             
         - name: Deploy API
           run: |
             # Add host key
             mkdir -p ~/.ssh
             ssh-keyscan -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
             
             # Deploy
             rsync -avz --exclude 'node_modules' ./api/ ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }}:/home/pi/your-api-repo/
             
             # Restart API service
             ssh -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} "cd /home/pi/your-api-repo && npm install && pm2 restart my-api"

     deploy-react:
       runs-on: ubuntu-latest
       if: contains(github.event.head_commit.message, '[react]')  # Optional: only deploy if commit message has [react]
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: 18
             
         - name: Build React App
           run: |
             cd react-app
             npm install
             npm run build
             
         - name: Set up SSH
           uses: webfactory/ssh-agent@v0.7.0
           with:
             ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
             
         - name: Deploy React App
           run: |
             # Add host key
             mkdir -p ~/.ssh
             ssh-keyscan -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
             
             # Deploy built files
             rsync -avz ./react-app/build/ ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }}:/home/pi/your-react-app/build/
   ```

5. **Usage**:
   - When you push with commit message containing `[api]`, it will deploy your API
   - When you push with commit message containing `[react]`, it will deploy your React app
   - You can customize these triggers based on your workflow

### Option 2: Simple Deployment Script

If you don't want to use GitHub Actions, you can create a simple deployment script:

1. **Create a Deploy Script on Your Development Machine**:
   ```bash
   #!/bin/bash
   # deploy.sh
   
   # Build React app locally
   echo "Building React app..."
   cd /path/to/your/react-app
   npm run build
   
   # Deploy React build to Raspberry Pi
   echo "Deploying React app..."
   rsync -avz --delete ./build/ pi@192.168.1.100:/home/pi/your-react-app/build/
   
   # Deploy API to Raspberry Pi
   echo "Deploying API..."
   cd /path/to/your/api
   rsync -avz --exclude 'node_modules' ./ pi@192.168.1.100:/home/pi/your-api-repo/
   
   # Restart API service on Raspberry Pi
   echo "Restarting services..."
   ssh pi@192.168.1.100 "cd /home/pi/your-api-repo && npm install && pm2 restart my-api"
   
   echo "Deployment complete!"
   ```

2. **Make the Script Executable**:
   ```bash
   chmod +x deploy.sh
   ```

3. **Usage**:
   ```bash
   ./deploy.sh
   ```

### Option 3: Web-Based Deployment Trigger

Create a secure web endpoint on your Raspberry Pi that triggers deployment:

1. **Install Required Packages**:
   ```bash
   # On Raspberry Pi
   sudo apt install -y webhook
   ```

2. **Create a Deployment Script**:
   ```bash
   # On Raspberry Pi
   mkdir -p /home/pi/webhook-scripts
   nano /home/pi/webhook-scripts/deploy.sh
   ```

   Add this content:
   ```bash
   #!/bin/bash
   
   # Pull the latest code
   cd /home/pi/your-api-repo
   git pull
   npm install
   pm2 restart my-api
   
   # For React app
   cd /home/pi/your-react-app
   git pull
   npm install
   npm run build
   ```

3. **Make the Script Executable**:
   ```bash
   chmod +x /home/pi/webhook-scripts/deploy.sh
   ```

4. **Configure webhook**:
   ```bash
   nano /etc/webhook.conf
   ```

   Add this content:
   ```json
   [
     {
       "id": "deploy",
       "execute-command": "/home/pi/webhook-scripts/deploy.sh",
       "command-working-directory": "/home/pi",
       "trigger-rule": {
         "match": {
           "type": "value",
           "value": "your-secret-token",
           "parameter": {
             "source": "payload",
             "name": "token"
           }
         }
       }
     }
   ]
   ```

5. **Run the webhook server**:
   ```bash
   webhook -hooks /etc/webhook.conf -verbose
   ```

6. **Create systemd service for webhook**:
   ```bash
   sudo nano /etc/systemd/system/webhook.service
   ```

   Add this content:
   ```
   [Unit]
   Description=Webhook Server
   After=network.target
   
   [Service]
   User=pi
   ExecStart=/usr/bin/webhook -hooks /etc/webhook.conf -verbose
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

7. **Enable and start the service**:
   ```bash
   sudo systemctl enable webhook
   sudo systemctl start webhook
   ```

8. **Trigger Deployment**:
   - From your development machine:
   ```bash
   curl -X POST http://192.168.1.100:9000/hooks/deploy -d '{"token":"your-secret-token"}'
   ```
   - Or create a script/button in your development environment

### Option 4: Docker-based Deployment

For a more modern approach, consider containerizing your applications with Docker:

1. **Install Docker on Raspberry Pi**:
   ```bash
   curl -sSL https://get.docker.com | sh
   sudo usermod -aG docker pi
   ```

2. **Create Docker Compose File**:
   ```yaml
   # docker-compose.yml
   version: '3'
   
   services:
     api:
       build: ./api
       restart: always
       ports:
         - "3000:3000"
       networks:
         - app-network
   
     webapp:
       build: ./webapp
       restart: always
       ports:
         - "80:80"
       networks:
         - app-network
   
   networks:
     app-network:
       driver: bridge
   ```

3. **Create a Deployment Script on Your Development Machine**:
   ```bash
   scp -r ./api ./webapp docker-compose.yml pi@192.168.1.100:/home/pi/app/
   ssh pi@192.168.1.100 "cd /home/pi/app && docker-compose up -d --build"
   ```

Choose the option that best fits your workflow and comfort level with the different technologies.

