import cron from 'node-cron';
import { storage } from '../storage';
import { ffmpegService } from './ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

export class CleanupService {
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    // Run cleanup every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.performCleanup();
    });
    
    this.isRunning = true;
    console.log('Cleanup service started');
  }

  async performCleanup(): Promise<void> {
    try {
      console.log('Starting cleanup process...');
      
      // Get expired streams
      const expiredStreams = await storage.getExpiredStreams();
      console.log(`Found ${expiredStreams.length} expired streams`);
      
      // Clean up files for each expired stream
      for (const stream of expiredStreams) {
        // Stop active streams if any
        if (stream.isActive) {
          ffmpegService.stopStream(stream.id);
        }
        
        // Clean up HLS/DASH files
        if (stream.hlsPath) {
          await this.cleanupFile(stream.hlsPath);
        }
        if (stream.dashPath) {
          await this.cleanupFile(stream.dashPath);
        }
        
        // Clean up segments directory
        const outputDir = path.dirname(stream.hlsPath || stream.dashPath || '');
        if (outputDir) {
          await ffmpegService.cleanupStreamFiles(stream.id, outputDir);
        }
      }
      
      // Delete expired streams from database
      const deletedCount = await storage.deleteExpiredStreams();
      console.log(`Cleaned up ${deletedCount} expired streams`);
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  async forceCleanup(): Promise<void> {
    await this.performCleanup();
  }
}

export const cleanupService = new CleanupService();
