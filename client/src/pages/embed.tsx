import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, VolumeX, Volume2, Maximize } from "lucide-react";

export default function EmbedPage() {
  const [, params] = useRoute("/embed/:id");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);

  const { data: stream, isLoading, error } = useQuery<import("@shared/schema").Stream>({
    queryKey: ["/api/streams", params?.id],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const video = videoRef.current;
    const hlsUrl = `/hls/${stream.id}.m3u8`;

    // Load HLS stream
    if (window.Hls?.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }

    video.volume = volume[0] / 100;
  }, [stream, volume]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <i className="fas fa-exclamation-triangle text-4xl mb-4 opacity-50"></i>
          <p className="text-lg">Stream not found</p>
          <p className="text-sm opacity-75">The requested stream is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            autoPlay
            muted
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="hover:text-primary transition-colors p-0 h-auto"
                >
                  {isPlaying ? (
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
                <div className="text-xs">
                  <div className="font-medium">{stream.name}</div>
                  <div className="opacity-75">{stream.quality}</div>
                </div>
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
        
        <div className="mt-4 text-center">
          <p className="text-white text-sm">
            Powered by <span className="text-primary font-medium">StreamBridge</span>
          </p>
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
