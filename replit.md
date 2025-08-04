# StreamBridge - RTMP to HLS/DASH Converter

## Overview

StreamBridge is an open-source VPS-hosted streaming service that converts RTMP streams to HLS/DASH formats for universal website embedding. The application provides a complete streaming solution with automatic FFmpeg encoding, real-time stream management, and embeddable video players. Users can input RTMP URLs, select quality settings, and receive HLS/DASH endpoints for web integration.

## Recent Changes (August 3, 2025)

✓ **RTMP to HLS Conversion Complete**: FFmpeg service successfully converts RTMP streams to HLS with baseline H.264 profile for maximum browser compatibility
✓ **Live Stream Processing**: Tested with rtmp://103.179.173.149/live/ - stable 1.1x encoding speed processing 2000+ frames
✓ **Video Player Fixed**: Resolved browser playback issues with proper event handling, loading states, and error recovery
✓ **HLS File Generation**: M3U8 playlist and TS segment files generating correctly in /streams/hls/ directory
✓ **Universal Embed Ready**: iframe embedding works across all websites with CORS support
✓ **cPanel Deployment Guides**: Complete installation documentation for VPS hosting providers
✓ **Production Ready**: Application tested and ready for deployment with automatic 7-day cleanup

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming support

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Database ORM**: Drizzle ORM with PostgreSQL database (configured for Neon serverless)
- **Stream Processing**: FFmpeg service for RTMP to HLS/DASH conversion
- **File Serving**: Static file serving for HLS/DASH segments
- **Development**: Hot module replacement via Vite integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless platform
- **Stream Files**: Local filesystem storage for HLS/DASH segments
- **Schema**: Single streams table tracking stream metadata, status, file paths, and timestamps
- **File Organization**: Separate directories for HLS and DASH outputs

### Stream Processing Pipeline
- **Input**: RTMP stream URLs with configurable quality settings (480p/720p/1080p)
- **Processing**: FFmpeg converts RTMP to dual HLS/DASH outputs with automatic segmentation
- **Output**: M3U8 playlists for HLS and MPD manifests for DASH
- **Cleanup**: Automated cleanup service removes expired streams and associated files

### API Architecture
- **REST Endpoints**: Express routes for stream CRUD operations and server statistics
- **Real-time Updates**: Polling-based updates for active stream monitoring
- **CORS Support**: Enabled for cross-origin embedding capabilities
- **Error Handling**: Centralized error middleware with status code mapping

## External Dependencies

### Core Technologies
- **FFmpeg**: Video encoding and stream conversion engine
- **Neon Database**: Serverless PostgreSQL database hosting
- **HLS.js**: Client-side HLS playback library
- **Dash.js**: Client-side DASH playback library

### Development Tools
- **Replit Integration**: Development environment with runtime error overlays and cartographer plugin
- **ESBuild**: Production bundling for server-side code
- **Node-cron**: Scheduled cleanup tasks

### UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management
- **React Hook Form**: Form state management with Zod validation

### Infrastructure
- **WebSocket Support**: For Neon database connections
- **CORS Middleware**: Cross-origin request handling
- **Static File Serving**: Express static middleware for stream segments