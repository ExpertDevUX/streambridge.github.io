# StreamBridge - RTMP to HLS/DASH Converter

StreamBridge is an open-source VPS-hosted streaming service that converts RTMP streams to HLS/DASH formats for universal website embedding.

## Features

✅ **Universal RTMP Support** - Works with any RTMP stream URL  
✅ **Multiple Quality Options** - 480p, 720p, 1080p encoding  
✅ **HLS/DASH Output** - Compatible with all modern browsers  
✅ **Universal Embedding** - Works on any website with CORS support  
✅ **Audio Controls** - Full video player with volume and fullscreen  
✅ **Auto Cleanup** - Automatically deletes streams after 7 days  
✅ **No Admin Required** - Simple interface, no user management  
✅ **Database Storage** - PostgreSQL for stream metadata  
✅ **FFmpeg Powered** - Professional-grade video encoding  

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   # Configure your DATABASE_URL environment variable
   npm run db:push
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Visit `http://localhost:5000`
   - Enter any RTMP URL
   - Select quality and start streaming

## Installation on cPanel

See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for complete cPanel hosting setup instructions.

## Usage

1. **Create Stream**: Enter RTMP URL and select quality
2. **Get Embed Code**: Copy the iframe code for your website
3. **Stream URLs**: Direct access to HLS (.m3u8) and DASH (.mpd) files
4. **Auto Cleanup**: Streams automatically delete after 7 days

## Example RTMP Sources

- OBS Studio streaming
- Wirecast broadcasting  
- FFmpeg RTMP push
- Any RTMP-compatible encoder

## Embed Example

```html
<iframe 
  src="https://yourserver.com/embed/stream-id" 
  width="640" 
  height="360" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

## Technical Requirements

- **Server**: VPS/Dedicated with Node.js 18+
- **FFmpeg**: Video encoding engine
- **Database**: PostgreSQL
- **RAM**: Minimum 2GB recommended
- **Storage**: 20GB+ for active streams

## API Endpoints

- `POST /api/streams` - Create new stream
- `GET /api/streams/active` - List active streams  
- `GET /api/streams/recent` - Recent streams history
- `GET /api/stats` - Server statistics
- `GET /embed/:id` - Embeddable player page

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
PORT=5000
```

## License

Open Source - Free to use and modify

## Support

- Check [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for hosting setup
- Verify FFmpeg is installed: `ffmpeg -version`
- Ensure PostgreSQL database is configured
- Check server logs for encoding issues