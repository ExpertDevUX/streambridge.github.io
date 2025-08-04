import { useState } from "react";
import { StreamForm } from "@/components/stream-form";
import { StreamList } from "@/components/stream-list";
import { VideoPlayer } from "@/components/video-player";
import { ServerStats } from "@/components/server-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Stream } from "@shared/schema";

export default function Dashboard() {
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const { toast } = useToast();

  const copyEmbedCode = () => {
    if (!selectedStream) return;
    
    const embedCode = `<iframe src="${window.location.origin}/embed/${selectedStream.id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    
    toast({
      title: "Embed code copied",
      description: "The embed code has been copied to your clipboard",
    });
  };

  const copyStreamUrls = (type: 'hls' | 'dash') => {
    if (!selectedStream) return;
    
    const url = type === 'hls' 
      ? `${window.location.origin}/hls/${selectedStream.id}.m3u8`
      : `${window.location.origin}/dash/${selectedStream.id}.mpd`;
    
    navigator.clipboard.writeText(url);
    
    toast({
      title: `${type.toUpperCase()} URL copied`,
      description: "The stream URL has been copied to your clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <i className="fas fa-stream text-primary text-2xl mr-3"></i>
                <h1 className="text-2xl font-bold text-gray-900">StreamBridge</h1>
              </div>
              <span className="bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                Open Source
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">RTMP → HLS/DASH Converter</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">Server Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stream Input Form */}
        <div className="mb-8">
          <StreamForm />
        </div>

        {/* Active Streams and Server Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <StreamList 
              onSelectStream={setSelectedStream}
              selectedStream={selectedStream}
            />
          </div>
          <div>
            <ServerStats />
          </div>
        </div>

        {/* Video Player and Embed Code */}
        <div className="mb-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <i className="fas fa-play-circle text-primary text-sm mr-2"></i>
                  Live Preview
                </h3>
                {selectedStream && (
                  <div className="text-sm text-gray-600">
                    Now playing: {selectedStream.name}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <VideoPlayer stream={selectedStream} />
                </div>
                
                {/* Embed Code and Stream URLs */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Embed Code</h4>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                      {selectedStream ? (
                        <div className="whitespace-nowrap">
                          &lt;iframe src="{window.location.origin}/embed/{selectedStream.id}" 
                          width="640" height="360" frameborder="0" allowfullscreen&gt;
                          &lt;/iframe&gt;
                        </div>
                      ) : (
                        <div className="text-gray-500">Select a stream to view embed code</div>
                      )}
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={copyEmbedCode}
                      disabled={!selectedStream}
                      className="mt-2 text-primary hover:text-blue-700 p-0 h-auto"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Code
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Stream URLs</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600 block">HLS (.m3u8)</label>
                        <div 
                          className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => copyStreamUrls('hls')}
                        >
                          {selectedStream 
                            ? `${window.location.origin}/hls/${selectedStream.id}.m3u8`
                            : 'Select a stream to view URL'
                          }
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block">DASH (.mpd)</label>
                        <div 
                          className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => copyStreamUrls('dash')}
                        >
                          {selectedStream 
                            ? `${window.location.origin}/dash/${selectedStream.id}.mpd`
                            : 'Select a stream to view URL'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <i className="fas fa-lightbulb text-blue-600 text-sm mt-0.5 mr-2"></i>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Universal Embedding</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Works on any website with CORS support enabled
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">© 2024 StreamBridge - Open Source RTMP Converter</p>
              <div className="flex items-center space-x-2">
                <i className="fab fa-github text-gray-400"></i>
                <a href="#" className="text-sm text-primary hover:text-blue-700">View on GitHub</a>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>FFmpeg powered</span>
              <span>•</span>
              <span>VPS optimized</span>
              <span>•</span>
              <span>Universal embedding</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
