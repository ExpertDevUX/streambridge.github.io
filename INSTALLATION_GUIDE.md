# StreamBridge - cPanel Installation Guide

## Requirements

- VPS or Dedicated Server with cPanel
- Node.js 18+ support
- FFmpeg installed on server
- PostgreSQL database
- At least 2GB RAM and 20GB storage

## Step 1: Prepare Your Server

### Enable Node.js in cPanel
1. Login to your cPanel
2. Go to **Setup Node.js App**
3. Create a new Node.js application:
   - **Node.js Version**: 18.x or 20.x
   - **Application Mode**: Production
   - **Application Root**: `streambridge`
   - **Application URL**: Choose your domain/subdomain

### Install FFmpeg
Contact your hosting provider to install FFmpeg, or if you have SSH access:
```bash
# For CentOS/RHEL
sudo yum install ffmpeg

# For Ubuntu/Debian  
sudo apt-get install ffmpeg

# Verify installation
ffmpeg -version
```

## Step 2: Database Setup

### Create PostgreSQL Database
1. In cPanel, go to **PostgreSQL Databases**
2. Create a new database: `streambridge_db`
3. Create a database user with full privileges
4. Note down: database name, username, password, and host

## Step 3: Upload Application Files

### Download Source Code
1. Download the StreamBridge source code as ZIP
2. Extract to your local computer

### Upload via File Manager
1. In cPanel, open **File Manager**
2. Navigate to your Node.js app directory (`streambridge`)
3. Upload all files:
   ```
   streambridge/
   ├── client/          # Frontend React app
   ├── server/          # Backend Node.js server  
   ├── shared/          # Shared types/schemas
   ├── package.json     # Dependencies
   ├── drizzle.config.ts # Database config
   ├── vite.config.ts   # Build configuration
   └── ...
   ```

## Step 4: Configure Environment Variables

### Set Database Connection
1. In cPanel Node.js App management
2. Add environment variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/streambridge_db
   NODE_ENV=production
   PORT=3000
   ```

## Step 5: Install Dependencies and Build

### Via cPanel Terminal (if available)
```bash
cd ~/streambridge
npm install
npm run build
npm run db:push
```

### Via SSH (if available)
```bash
ssh your-username@your-server.com
cd ~/streambridge
npm install
npm run build  
npm run db:push
```

## Step 6: Configure Startup

### Set Startup File
1. In cPanel Node.js App settings
2. Set **Startup File**: `dist/index.js`
3. Click **Save**

### Build for Production
Run these commands on your local machine before uploading:
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Upload these files to cPanel:
# - dist/ folder (built application)
# - package.json 
# - node_modules/ (or run npm install on server)
# - streams/ folder (create empty if not exists)
# - All configuration files (drizzle.config.ts, etc.)
```

## Step 7: Configure File Permissions

### Create Streams Directory
```bash
mkdir -p ~/streambridge/streams/hls
mkdir -p ~/streambridge/streams/dash
chmod 755 ~/streambridge/streams
chmod 755 ~/streambridge/streams/hls  
chmod 755 ~/streambridge/streams/dash
```

## Step 8: Configure cPanel Subdomain/Domain

### Set Up Domain
1. In cPanel, go to **Subdomains** or use main domain
2. Create subdomain: `stream.yourdomain.com`
3. Point to your Node.js app directory

### Configure .htaccess (if needed)
Create `.htaccess` in public folder:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Enable CORS for HLS/DASH files
<FilesMatch "\.(m3u8|ts|mpd)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Range"
</FilesMatch>
```

## Step 9: Start Application

### Start via cPanel
1. Go to **Setup Node.js App**
2. Click **Start** button for your application
3. Application should show status: **Running**

### Verify Installation
1. Visit your domain: `https://stream.yourdomain.com`
2. You should see the StreamBridge interface
3. Test creating an RTMP stream

## Step 10: Configure Firewall/Security

### Open Required Ports
Ensure these ports are open:
- **80/443**: Web interface
- **1935**: RTMP input (if hosting RTMP server)
- **Your Node.js port**: Usually 3000

### SSL Certificate
1. In cPanel, go to **SSL/TLS**
2. Install SSL certificate for your domain
3. Force HTTPS redirects

## Troubleshooting

### Common Issues

**1. FFmpeg not found**
- Contact hosting provider to install FFmpeg
- Verify with: `which ffmpeg`

**2. Database connection failed**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check database credentials

**3. Permission errors**
- Set correct permissions: `chmod 755 streams/`
- Ensure Node.js app can write to streams directory

**4. Application won't start**
- Check Node.js version compatibility
- Verify all dependencies installed: `npm install`
- Check application logs in cPanel

**5. CORS errors**
- Ensure .htaccess configured correctly
- Check server headers for HLS/DASH files

### Log Files
Check logs in cPanel Node.js App section for detailed error information.

## Production Optimization

### Performance Settings
1. Set `NODE_ENV=production`
2. Configure proper caching headers
3. Use CDN for static files if needed
4. Monitor server resources

### Cleanup Service
The application automatically cleans up old streams after 7 days to save storage space.

### Backup
Regularly backup:
- Database (stream metadata)
- Configuration files
- Active stream files (if needed)

## Support
For issues specific to your hosting provider, contact their support team for:
- Node.js configuration
- FFmpeg installation  
- Database setup
- SSL certificates