import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ffmpegService } from "./services/ffmpeg";
import { cleanupService } from "./services/cleanup";
import { insertStreamSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for embedding
  app.use(cors({
    origin: true,
    credentials: false
  }));

  // Serve static HLS/DASH files
  app.use('/hls', express.static(path.join(process.cwd(), 'streams', 'hls')));
  app.use('/dash', express.static(path.join(process.cwd(), 'streams', 'dash')));

  // Get all streams
  app.get("/api/streams", async (req, res) => {
    try {
      const streams = await storage.getAllStreams();
      res.json(streams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streams" });
    }
  });

  // Get active streams
  app.get("/api/streams/active", async (req, res) => {
    try {
      const streams = await storage.getActiveStreams();
      res.json(streams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active streams" });
    }
  });

  // Get recent streams
  app.get("/api/streams/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const streams = await storage.getRecentStreams(limit);
      res.json(streams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent streams" });
    }
  });

  // Get server statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getServerStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server stats" });
    }
  });

  // Create new stream
  app.post("/api/streams", async (req, res) => {
    try {
      const streamData = insertStreamSchema.parse(req.body);
      const stream = await storage.createStream(streamData);
      
      // Start FFmpeg conversion
      const outputDir = path.join(process.cwd(), 'streams');
      const { hlsPath, dashPath } = await ffmpegService.startStream({
        rtmpUrl: stream.rtmpUrl,
        outputDir,
        quality: stream.quality,
        streamId: stream.id
      });

      // Update stream with file paths and status
      const updatedStream = await storage.updateStream(stream.id, {
        hlsPath,
        dashPath,
        status: 'active',
        isActive: true,
        startedAt: new Date()
      });

      res.json(updatedStream);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid stream data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create stream" });
      }
    }
  });

  // Stop stream
  app.post("/api/streams/:id/stop", async (req, res) => {
    try {
      const streamId = req.params.id;
      const stream = await storage.getStream(streamId);
      
      if (!stream) {
        return res.status(404).json({ error: "Stream not found" });
      }

      // Stop FFmpeg process
      const stopped = ffmpegService.stopStream(streamId);
      
      if (stopped) {
        const updatedStream = await storage.updateStream(streamId, {
          status: 'stopped',
          isActive: false,
          stoppedAt: new Date()
        });
        res.json(updatedStream);
      } else {
        res.status(400).json({ error: "Stream was not active" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to stop stream" });
    }
  });

  // Delete stream
  app.delete("/api/streams/:id", async (req, res) => {
    try {
      const streamId = req.params.id;
      const stream = await storage.getStream(streamId);
      
      if (!stream) {
        return res.status(404).json({ error: "Stream not found" });
      }

      // Stop stream if active
      if (stream.isActive) {
        ffmpegService.stopStream(streamId);
      }

      // Clean up files
      const outputDir = path.dirname(stream.hlsPath || stream.dashPath || '');
      if (outputDir) {
        await ffmpegService.cleanupStreamFiles(streamId, outputDir);
      }

      // Delete from database
      const deleted = await storage.deleteStream(streamId);
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete stream" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stream" });
    }
  });

  // Get single stream
  app.get("/api/streams/:id", async (req, res) => {
    try {
      const stream = await storage.getStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ error: "Stream not found" });
      }
      res.json(stream);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream" });
    }
  });

  // Embed endpoint for cross-site embedding
  app.get("/embed/:id", async (req, res) => {
    try {
      const stream = await storage.getStream(req.params.id);
      if (!stream) {
        return res.status(404).send("Stream not found");
      }

      const embedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${stream.name}</title>
          <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
          <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
          <style>
            body { margin: 0; padding: 0; background: #000; }
            video { width: 100%; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <video id="video" controls autoplay muted></video>
          <script>
            const video = document.getElementById('video');
            const hlsUrl = '/hls/${path.basename(stream.hlsPath || '')}';
            const dashUrl = '/dash/${path.basename(stream.dashPath || '')}';
            
            if (Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(hlsUrl);
              hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = hlsUrl;
            }
          </script>
        </body>
        </html>
      `;

      res.set('Content-Type', 'text/html');
      res.send(embedHtml);
    } catch (error) {
      res.status(500).send("Error loading stream");
    }
  });

  // Force cleanup endpoint (for testing)
  app.post("/api/cleanup", async (req, res) => {
    try {
      await cleanupService.forceCleanup();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Cleanup failed" });
    }
  });

  // Start cleanup service
  cleanupService.start();

  const httpServer = createServer(app);
  return httpServer;
}
