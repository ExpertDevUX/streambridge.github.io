# StreamBridge - cPanel Deployment Checklist

## Pre-Deployment Preparation

### ✅ 1. Build Application Locally
```bash
git clone <your-repository>
cd streambridge
npm install
npm run build
```

### ✅ 2. Test Locally First
```bash
npm run dev
# Visit http://localhost:5000
# Test with your RTMP stream
# Verify audio and video work correctly
```

### ✅ 3. Prepare Files for Upload
Create deployment package with these files:
```
streambridge-deploy/
├── dist/               # Built application (from npm run build)
├── package.json        # Dependencies list
├── drizzle.config.ts   # Database configuration  
├── streams/            # Create empty directory
│   ├── hls/           # Create empty subdirectory
│   └── dash/          # Create empty subdirectory
└── node_modules/      # Dependencies (or install on server)
```

## Server Requirements Verification

### ✅ 4. Hosting Provider Requirements
- [ ] Node.js 18+ supported
- [ ] PostgreSQL database available
- [ ] FFmpeg installed (contact support if needed)
- [ ] Minimum 2GB RAM
- [ ] 20GB+ storage space
- [ ] SSH access (optional but helpful)

### ✅ 5. Verify FFmpeg Installation
```bash
# Test via SSH or ask hosting provider
ffmpeg -version
which ffmpeg
```

## cPanel Configuration

### ✅ 6. Database Setup
1. Create PostgreSQL database
2. Note: database name, username, password, host
3. Test connection if possible

### ✅ 7. Node.js App Configuration
1. **Application Root**: `streambridge`
2. **Node.js Version**: 18.x or 20.x
3. **Application Mode**: Production
4. **Startup File**: `dist/index.js`

### ✅ 8. Environment Variables
Set these in cPanel Node.js App:
```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=production
PORT=3000
```

### ✅ 9. File Upload
Upload all files from deployment package to app directory

### ✅ 10. Install Dependencies
```bash
# Via cPanel Terminal or SSH
cd ~/streambridge
npm install --production
```

### ✅ 11. Database Migration
```bash
npm run db:push
```

## Testing and Verification

### ✅ 12. Start Application
1. In cPanel Node.js App, click **Start**
2. Check status shows **Running**
3. Check logs for any errors

### ✅ 13. Test Web Interface
1. Visit your domain/subdomain
2. Verify interface loads correctly
3. Check all buttons and forms work

### ✅ 14. Test RTMP Streaming
1. Enter a test RTMP URL
2. Select quality (720p recommended)
3. Start stream and verify:
   - FFmpeg process starts (check logs)
   - HLS files generate in streams/hls/
   - Audio and video play correctly in browser

### ✅ 15. Test Embed Functionality
1. Copy embed iframe code
2. Test on external website
3. Verify CORS headers work correctly

## Security and Performance

### ✅ 16. SSL Certificate
1. Install SSL certificate for your domain
2. Force HTTPS redirects
3. Test secure connections

### ✅ 17. File Permissions
```bash
chmod 755 ~/streambridge/streams/
chmod 755 ~/streambridge/streams/hls/
chmod 755 ~/streambridge/streams/dash/
```

### ✅ 18. Firewall Configuration
- Port 80/443: Web traffic
- Port 1935: RTMP (if hosting own RTMP server)
- Your Node.js port: Application access

## Monitoring and Maintenance

### ✅ 19. Log Monitoring
- Check application logs regularly
- Monitor FFmpeg processes
- Watch disk usage (streams auto-delete after 7 days)

### ✅ 20. Performance Monitoring
- Monitor CPU usage during streaming
- Check memory consumption
- Verify cleanup service works

## Troubleshooting Common Issues

### ❌ Application Won't Start
**Check:**
- Node.js version compatibility
- All dependencies installed
- Database connection string correct
- Startup file path correct

### ❌ FFmpeg Not Found
**Solution:**
- Contact hosting provider to install FFmpeg
- Verify installation: `which ffmpeg`
- Check server has proper codecs

### ❌ Database Connection Failed
**Check:**
- DATABASE_URL format correct
- Database credentials valid
- PostgreSQL service running
- Network connectivity

### ❌ Streams Not Playing
**Check:**
- HLS files being generated in streams/hls/
- Correct MIME types served (.m3u8, .ts)
- CORS headers configured
- Browser developer console for errors

### ❌ CORS Errors on Embed
**Solution:**
- Configure .htaccess for proper headers
- Verify subdomain SSL certificate
- Check iframe embedding permissions

## Support Resources

### Technical Support
- **Hosting Provider**: For server-specific issues
- **FFmpeg Installation**: Contact provider support
- **SSL Certificates**: Provider documentation
- **Node.js Configuration**: Provider tutorials

### Application Logs Location
- cPanel Node.js App section
- Check both application and error logs
- Monitor during stream creation/playback

### Performance Optimization
- Enable gzip compression
- Configure proper caching headers
- Use CDN for static files (optional)
- Monitor and clean up old streams regularly

## Success Verification

Your deployment is successful when:
- ✅ Web interface loads without errors
- ✅ Can create new streams from any RTMP URL
- ✅ Audio and video play correctly in browser
- ✅ Embed codes work on external websites
- ✅ Automatic cleanup removes old streams
- ✅ No errors in application logs
- ✅ FFmpeg processes start/stop correctly