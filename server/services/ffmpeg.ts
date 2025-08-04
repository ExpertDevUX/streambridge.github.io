import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export interface FFmpegOptions {
  rtmpUrl: string;
  outputDir: string;
  quality: string;
  streamId: string;
}

export class FFmpegService {
  private processes: Map<string, ChildProcess> = new Map();

  async startStream(options: FFmpegOptions): Promise<{ hlsPath: string; dashPath: string }> {
    const { rtmpUrl, outputDir, quality, streamId } = options;
    
    // Ensure output directories exist
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.join(outputDir, 'hls'), { recursive: true });
    await fs.mkdir(path.join(outputDir, 'dash'), { recursive: true });
    
    const hlsOutputPath = path.join(outputDir, 'hls', `${streamId}.m3u8`);
    const dashOutputPath = path.join(outputDir, 'dash', `${streamId}.mpd`);
    
    // Build FFmpeg command - simpler approach without explicit stream mapping
    const ffmpegArgs = [
      '-i', rtmpUrl,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-preset', 'fast',
      '-tune', 'zerolatency',
      '-profile:v', 'baseline',
      '-level', '3.0',
      '-pix_fmt', 'yuv420p'
    ];

    // Add quality-specific video encoding parameters
    if (quality === '1080p') {
      ffmpegArgs.push('-vf', 'scale=1920:1080', '-b:v', '4000k', '-maxrate', '4000k', '-bufsize', '8000k');
    } else if (quality === '720p') {
      ffmpegArgs.push('-vf', 'scale=1280:720', '-b:v', '2500k', '-maxrate', '2500k', '-bufsize', '5000k');
    } else if (quality === '480p') {
      ffmpegArgs.push('-vf', 'scale=854:480', '-b:v', '1000k', '-maxrate', '1000k', '-bufsize', '2000k');
    }

    // Add HLS output parameters
    ffmpegArgs.push(
      '-f', 'hls',
      '-hls_time', '4',
      '-hls_list_size', '5', 
      '-hls_flags', 'delete_segments',
      '-hls_allow_cache', '0',
      hlsOutputPath
    );

    console.log('FFmpeg command:', ['ffmpeg', ...ffmpegArgs].join(' '));

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
    this.processes.set(streamId, ffmpegProcess);

    ffmpegProcess.stdout.on('data', (data) => {
      console.log(`FFmpeg stdout [${streamId}]: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      console.log(`FFmpeg stderr [${streamId}]: ${data}`);
    });

    ffmpegProcess.on('close', (code) => {
      console.log(`FFmpeg process [${streamId}] exited with code ${code}`);
      this.processes.delete(streamId);
    });

    ffmpegProcess.on('error', (error) => {
      console.error(`FFmpeg process [${streamId}] error:`, error);
      this.processes.delete(streamId);
    });

    return {
      hlsPath: hlsOutputPath,
      dashPath: dashOutputPath
    };
  }

  stopStream(streamId: string): boolean {
    const process = this.processes.get(streamId);
    if (process) {
      process.kill('SIGTERM');
      this.processes.delete(streamId);
      return true;
    }
    return false;
  }

  isStreamActive(streamId: string): boolean {
    return this.processes.has(streamId);
  }

  async cleanupStreamFiles(streamId: string, outputDir: string): Promise<void> {
    try {
      const files = await fs.readdir(outputDir);
      const streamFiles = files.filter(file => file.startsWith(streamId));
      
      for (const file of streamFiles) {
        await fs.unlink(path.join(outputDir, file));
      }
    } catch (error) {
      console.error(`Error cleaning up stream files for ${streamId}:`, error);
    }
  }
}

export const ffmpegService = new FFmpegService();
