import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, VolumeX, Volume2, Maximize } from "lucide-react";
import type { Stream } from "@shared/schema";

interface VideoPlayerProps {
  stream: Stream | null;
}

export function VideoPlayer({ stream }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const video = videoRef.current;
    const hlsUrl = `/hls/${stream.id}.m3u8`;
    
    setIsLoaded(false);
    setIsPlaying(false);

    // Add event listeners for proper state management
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => setIsLoaded(true);
    const handleError = () => {
      console.log('Video error, retrying in 2 seconds...');
      setTimeout(() => {
        if (video && video.src) {
          video.load();
        }
      }, 2000);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Load HLS stream
    if (window.Hls?.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setIsLoaded(true);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }

    video.volume = volume[0] / 100;

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [stream, volume]);

  const togglePlay = async () => {
    if (!videoRef.current || !isLoaded) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
    } catch (error) {
      console.log('Playback error:', error);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value[0] / 100;
    }
  };

  if (!stream) {
    return (
      <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-white">
          <i className="fas fa-broadcast-tower text-6xl mb-4 opacity-50"></i>
          <p className="text-lg font-medium">No Stream Selected</p>
          <p className="text-sm opacity-75">Select a stream to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              disabled={!isLoaded}
              className="hover:text-primary transition-colors p-0 h-auto disabled:opacity-50"
            >
              {!isLoaded ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="hover:text-primary transition-colors p-0 h-auto"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center space-x-2 w-16">
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {stream.isActive && (
              <span className="text-xs bg-red-600 px-2 py-1 rounded font-medium">
                LIVE
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="hover:text-primary transition-colors p-0 h-auto"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add HLS.js types
declare global {
  interface Window {
    Hls: any;
  }
}
